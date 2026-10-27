const { PACOTES_MENSAL } = require('./criar-preferencia');

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

/**
 * A API de assinaturas (Preapproval) não tem campo `metadata` como a de
 * preferências — só `external_reference` (texto simples). Por isso
 * compactamos só os dados essenciais do cliente (sem descrições/preços de
 * serviço, pra caber no limite de tamanho do campo).
 */
function compactarDadosCliente(dadosCliente) {
  return JSON.stringify({
    nomeEmpresa: dadosCliente.nomeEmpresa,
    ramoAtividade: dadosCliente.ramoAtividade,
    cidade: dadosCliente.cidade,
    whatsapp: dadosCliente.whatsapp,
    email: dadosCliente.email || '',
    slogan: dadosCliente.slogan || '',
    servicos: (dadosCliente.servicos || []).map((s) => ({ nome: s.nome })),
  });
}

/**
 * Cria uma assinatura mensal (Preapproval) no Mercado Pago. Diferente da
 * preferência de pagamento único, isso exige e-mail do cliente (payer_email)
 * e cobra automaticamente todo mês até ser cancelada.
 * Docs: https://www.mercadopago.com.br/developers/pt/reference/subscriptions/_preapproval/post
 */
async function criarAssinaturaMensal(dadosCliente, pacote = 'basico') {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('MP_ACCESS_TOKEN não configurado nas variáveis de ambiente');
  }
  if (!dadosCliente.email) {
    throw new Error('Assinatura mensal exige e-mail do cliente (payer_email)');
  }

  const infoPacote = PACOTES_MENSAL[pacote] || PACOTES_MENSAL.basico;

  const resposta = await fetch('https://api.mercadopago.com/preapproval', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: infoPacote.titulo,
      external_reference: compactarDadosCliente(dadosCliente),
      payer_email: dadosCliente.email,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: infoPacote.preco,
        currency_id: 'BRL',
      },
      back_url: 'https://wa.me/',
      status: 'pending',
    }),
  });

  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(`Falha ao criar assinatura no Mercado Pago: ${JSON.stringify(dados)}`);
  }

  return dados.init_point;
}

module.exports = { criarAssinaturaMensal, compactarDadosCliente };
