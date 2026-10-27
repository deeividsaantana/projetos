const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

const PACOTES = {
  basico: { titulo: 'Site para MEI - Plano Básico', preco: 297 },
  intermediario: { titulo: 'Site para MEI - Plano Intermediário', preco: 597 },
  catalogo: { titulo: 'Site para MEI - Plano Catálogo', preco: 997 },
};

/**
 * Cria uma preferência de pagamento (Pix/Checkout) no Mercado Pago, já com
 * os dados do cliente anexados em `metadata`. Quando o pagamento for
 * aprovado, o webhook em server.js lê esse metadata para gerar e publicar
 * o site, sem precisar consultar nenhum outro lugar.
 * Docs: https://www.mercadopago.com.br/developers/pt/reference/preferences/_checkout_preferences/post
 */
async function criarPreferenciaPagamento(dadosCliente, pacote = 'basico') {
  if (!MP_ACCESS_TOKEN) {
    throw new Error('MP_ACCESS_TOKEN não configurado nas variáveis de ambiente');
  }

  const infoPacote = PACOTES[pacote] || PACOTES.basico;

  const resposta = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [
        {
          title: infoPacote.titulo,
          quantity: 1,
          unit_price: infoPacote.preco,
          currency_id: 'BRL',
        },
      ],
      metadata: dadosCliente,
      back_urls: {
        success: 'https://wa.me/',
        pending: 'https://wa.me/',
        failure: 'https://wa.me/',
      },
    }),
  });

  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(`Falha ao criar preferência no Mercado Pago: ${JSON.stringify(dados)}`);
  }

  return dados.init_point;
}

module.exports = { criarPreferenciaPagamento, PACOTES };
