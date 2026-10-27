const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Envia uma mensagem de texto pelo WhatsApp Cloud API (Meta) oficial.
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages
 */
async function enviarMensagem(para, texto) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WHATSAPP_TOKEN ou WHATSAPP_PHONE_NUMBER_ID não configurados');
  }

  const resposta = await fetch(
    `https://graph.facebook.com/v21.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: para,
        type: 'text',
        text: { body: texto },
      }),
    }
  );

  if (!resposta.ok) {
    const erro = await resposta.text();
    throw new Error(`Falha ao enviar mensagem WhatsApp: HTTP ${resposta.status} - ${erro}`);
  }

  return resposta.json();
}

module.exports = { enviarMensagem };
