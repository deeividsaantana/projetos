const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const querystring = require('querystring');
const { gerarEPublicar } = require('./gerar-e-publicar');
const { criarPreferenciaPagamento } = require('./criar-preferencia');
const { criarAssinaturaMensal } = require('./criar-assinatura');
const { enviarMensagem } = require('./whatsapp');
const { processarMensagem } = require('./lead-conversa');

const PUBLIC_DIR = path.join(__dirname, 'public');
const EXEMPLOS_DIR = {
  1: path.join(__dirname, '..', 'exemplo', 'saida'),
  2: path.join(__dirname, '..', 'exemplo', 'saida-2'),
  3: path.join(__dirname, '..', 'exemplo', 'saida-3'),
};

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

/**
 * Pagamentos únicos trazem os dados do cliente em `metadata`. Pagamentos de
 * assinatura (Preapproval) não têm `metadata` — os dados vêm compactados em
 * `external_reference` (ver criar-assinatura.js).
 */
function extrairDadosCliente(pagamento) {
  if (pagamento.metadata && pagamento.metadata.nomeEmpresa) {
    return pagamento.metadata;
  }
  if (pagamento.external_reference) {
    try {
      const dados = JSON.parse(pagamento.external_reference);
      if (dados.nomeEmpresa) return dados;
    } catch {
      // external_reference não era um JSON compactado de cliente — ignora.
    }
  }
  return null;
}

async function tratarNotificacaoPagamento(paymentId) {
  const pagamento = await buscarPagamento(paymentId);

  if (pagamento.status !== 'approved') {
    registrarLog(`Pagamento ${paymentId} com status "${pagamento.status}" — ignorado.`);
    return;
  }

  const dadosCliente = extrairDadosCliente(pagamento);
  if (!dadosCliente) {
    registrarLog(
      `Pagamento ${paymentId} aprovado, mas sem dados de cliente válidos (metadata/external_reference). Revisar manualmente.`
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

/**
 * Monta os dados do cliente a partir do formulário web (campos simples,
 * mesmo formato usado pelo WhatsApp) e cria a preferência de pagamento.
 */
async function tratarPedidoFormulario(campos) {
  const dadosCliente = {
    nomeEmpresa: campos.nomeEmpresa,
    ramoAtividade: campos.ramoAtividade,
    cidade: campos.cidade,
    whatsapp: campos.whatsapp,
    email: campos.email || '',
    slogan: campos.slogan || '',
    sobre: campos.sobre || '',
    servicos: (campos.servicosTexto || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((nome) => ({ nome })),
  };

  const pacote = campos.pacote || 'basico';
  const tipoPagamento = campos.tipoPagamento === 'mensal' ? 'mensal' : 'unico';

  const linkPagamento =
    tipoPagamento === 'mensal'
      ? await criarAssinaturaMensal(dadosCliente, pacote)
      : await criarPreferenciaPagamento(dadosCliente, pacote);

  registrarLog(
    `Pedido via formulário web (${tipoPagamento}): link criado para "${dadosCliente.nomeEmpresa}" (${dadosCliente.whatsapp}): ${linkPagamento}`
  );
  return linkPagamento;
}

const servidor = http.createServer((req, res) => {
  const urlRequisicao = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  const matchExemplo = urlRequisicao.pathname.match(/^\/exemplo(?:\/(\d))?\/?$/);
  if (req.method === 'GET' && matchExemplo) {
    const numero = Number(matchExemplo[1] || '1');
    const dir = EXEMPLOS_DIR[numero];
    if (!dir) {
      res.writeHead(404);
      res.end('Exemplo não encontrado');
      return;
    }
    fs.readFile(path.join(dir, 'index.html'), (erro, conteudo) => {
      if (erro) {
        res.writeHead(404);
        res.end('Exemplo não encontrado');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(conteudo);
    });
    return;
  }

  const matchExemploCss = urlRequisicao.pathname.match(/^\/exemplo(?:\/(\d))?\/style\.css$/);
  if (req.method === 'GET' && matchExemploCss) {
    const numero = Number(matchExemploCss[1] || '1');
    const dir = EXEMPLOS_DIR[numero];
    if (!dir) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    fs.readFile(path.join(dir, 'style.css'), (erro, conteudo) => {
      if (erro) {
        res.writeHead(404);
        res.end('not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/css; charset=utf-8' });
      res.end(conteudo);
    });
    return;
  }

  if (req.method === 'GET' && (urlRequisicao.pathname === '/' || urlRequisicao.pathname === '/pedido')) {
    fs.readFile(path.join(PUBLIC_DIR, 'pedido.html'), (erro, conteudo) => {
      if (erro) {
        res.writeHead(500);
        res.end('Não foi possível carregar o formulário');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(conteudo);
    });
    return;
  }

  if (req.method === 'POST' && urlRequisicao.pathname === '/pedido') {
    let corpo = '';
    req.on('data', (chunk) => (corpo += chunk));
    req.on('end', async () => {
      try {
        const campos = querystring.parse(corpo);
        const linkPagamento = await tratarPedidoFormulario(campos);
        res.writeHead(302, { Location: linkPagamento });
        res.end();
      } catch (erro) {
        registrarLog(`Falha ao processar pedido via formulário: ${erro.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Não foi possível gerar seu link de pagamento. Tente novamente em instantes.');
      }
    });
    return;
  }

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
