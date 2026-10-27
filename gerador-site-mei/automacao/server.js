const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const { gerarEPublicar } = require('./gerar-e-publicar');
const { criarPreferenciaPagamento } = require('./criar-preferencia');
const { enviarMensagem } = require('./whatsapp');
const { processarMensagem } = require('./lead-conversa');

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const PORT = process.env.PORT || 3000;
const LOG_PATH = path.join(__dirname, 'pedidos-processados.log');

function registrarLog(linha) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(LOG_PATH, `[${timestamp}] ${linha}\n`);
}

/**
 * Busca o pagamento na API do Mercado Pago para confirmar status e obter os
 * dados do cliente que foram enviados em `metadata` na criação da preferência.
 * Docs: https://www.mercadopago.com.br/developers/pt/reference/payments/_payments_id/get
 */
async function buscarPagamento(paymentId) {
  const resposta = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` },
  });

  if (!resposta.ok) {
    throw new Error(`Falha ao consultar pagamento ${paymentId}: HTTP ${resposta.status}`);
  }

  return resposta.json();
}

async function tratarNotificacaoPagamento(paymentId) {
  const pagamento = await buscarPagamento(paymentId);

  if (pagamento.status !== 'approved') {
    registrarLog(`Pagamento ${paymentId} com status "${pagamento.status}" — ignorado.`);
    return;
  }

  const dadosCliente = pagamento.metadata;
  if (!dadosCliente || !dadosCliente.nomeEmpresa) {
    registrarLog(
      `Pagamento ${paymentId} aprovado, mas sem metadata de cliente válido. Revisar manualmente.`
    );
    return;
  }

  try {
    const url = await gerarEPublicar(dadosCliente);
    registrarLog(
      `Pagamento ${paymentId} aprovado. Site de "${dadosCliente.nomeEmpresa}" publicado em: ${url}`
    );
  } catch (erro) {
    registrarLog(`Pagamento ${paymentId} aprovado, mas falhou ao gerar/publicar: ${erro.message}`);
  }
}

/**
 * Processa uma mensagem recebida de um lead pelo WhatsApp: avança a
 * conversa e, quando os dados estiverem completos, cria a preferência de
 * pagamento no Mercado Pago e envia o link de Pix de volta ao cliente.
 */
async function tratarMensagemWhatsapp(telefone, texto) {
  const resultado = processarMensagem(telefone, texto);

  if (resultado.tipo === 'pergunta') {
    await enviarMensagem(telefone, resultado.texto);
    return;
  }

  try {
    const linkPagamento = await criarPreferenciaPagamento(resultado.dados);
    await enviarMensagem(
      telefone,
      `Perfeito! Para gerar seu site, finalize o pagamento no link abaixo (Pix):\n${linkPagamento}\n\nAssim que o pagamento for confirmado, seu site é publicado automaticamente.`
    );
    registrarLog(`Preferência de pagamento criada para "${resultado.dados.nomeEmpresa}" (${telefone}): ${linkPagamento}`);
  } catch (erro) {
    registrarLog(`Falha ao criar preferência para ${telefone}: ${erro.message}`);
    await enviarMensagem(
      telefone,
      'Desculpe, tive um problema para gerar seu link de pagamento. Vou avisar o responsável para resolver isso.'
    ).catch(() => {});
  }
}

const servidor = http.createServer((req, res) => {
  const urlRequisicao = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (req.method === 'GET' && urlRequisicao.pathname === '/webhook/whatsapp') {
    const modo = urlRequisicao.searchParams.get('hub.mode');
    const token = urlRequisicao.searchParams.get('hub.verify_token');
    const desafio = urlRequisicao.searchParams.get('hub.challenge');

    if (modo === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
      res.writeHead(200);
      res.end(desafio);
    } else {
      res.writeHead(403);
      res.end('verify token inválido');
    }
    return;
  }

  if (req.method === 'POST' && urlRequisicao.pathname === '/webhook/whatsapp') {
    let corpo = '';
    req.on('data', (chunk) => (corpo += chunk));
    req.on('end', () => {
      res.writeHead(200);
      res.end('ok');

      try {
        const evento = JSON.parse(corpo || '{}');
        const mudanca = evento.entry?.[0]?.changes?.[0]?.value;
        const mensagem = mudanca?.messages?.[0];

        if (mensagem && mensagem.type === 'text') {
          const telefone = mensagem.from;
          const texto = mensagem.text.body;
          tratarMensagemWhatsapp(telefone, texto).catch((erro) =>
            registrarLog(`Erro ao processar mensagem do WhatsApp (${telefone}): ${erro.message}`)
          );
        }
      } catch (erro) {
        registrarLog(`Webhook do WhatsApp recebido com corpo inválido: ${erro.message}`);
      }
    });
    return;
  }

  if (req.method === 'POST' && urlRequisicao.pathname === '/webhook/mercadopago') {
    let corpo = '';
    req.on('data', (chunk) => (corpo += chunk));
    req.on('end', () => {
      res.writeHead(200);
      res.end('ok');

      try {
        const evento = JSON.parse(corpo || '{}');
        const paymentId = evento.data && evento.data.id;
        if (evento.type === 'payment' && paymentId) {
          tratarNotificacaoPagamento(paymentId).catch((erro) =>
            registrarLog(`Erro ao processar notificação: ${erro.message}`)
          );
        }
      } catch (erro) {
        registrarLog(`Webhook recebido com corpo inválido: ${erro.message}`);
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('not found');
});

if (require.main === module) {
  servidor.listen(PORT, () => {
    console.log(`Webhooks (WhatsApp + Mercado Pago) escutando na porta ${PORT}`);
  });
}

module.exports = { servidor, tratarNotificacaoPagamento, tratarMensagemWhatsapp };
