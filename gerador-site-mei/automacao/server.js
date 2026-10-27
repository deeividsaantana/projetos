const http = require('http');
const fs = require('fs');
const path = require('path');
const { gerarEPublicar } = require('./gerar-e-publicar');

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
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

const servidor = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url.startsWith('/webhook/mercadopago')) {
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
    console.log(`Webhook do Mercado Pago escutando na porta ${PORT}`);
  });
}

module.exports = { servidor, tratarNotificacaoPagamento };
