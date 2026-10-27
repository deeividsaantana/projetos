const fs = require('fs');
const path = require('path');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Busca estabelecimentos no Google Places (Text Search) pra uma combinação
 * de ramo + cidade, pega os detalhes de cada um (telefone, endereço,
 * site) e filtra só quem NÃO tem site — são os leads: têm negócio ativo
 * e visível no Google, mas ainda não têm presença própria na web.
 *
 * Isso não confirma que o CNPJ é MEI (o Places não expõe CNPJ) — é uma
 * aproximação por porte/tipo de negócio. A confirmação fica pro contato
 * humano.
 */
async function buscarEstabelecimentos(ramo, cidade) {
  if (!GOOGLE_PLACES_API_KEY) {
    throw new Error('GOOGLE_PLACES_API_KEY não configurado nas variáveis de ambiente');
  }

  const query = encodeURIComponent(`${ramo} em ${cidade}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=pt-BR&key=${GOOGLE_PLACES_API_KEY}`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (dados.status !== 'OK' && dados.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places retornou status ${dados.status}: ${dados.error_message || 'sem detalhe'}`);
  }

  return dados.results || [];
}

async function buscarDetalhes(placeId) {
  const campos = ['name', 'formatted_phone_number', 'formatted_address', 'website', 'url', 'rating', 'user_ratings_total'].join(',');
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${campos}&language=pt-BR&key=${GOOGLE_PLACES_API_KEY}`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (dados.status !== 'OK') {
    throw new Error(`Falha ao buscar detalhes de ${placeId}: ${dados.status}`);
  }

  return dados.result;
}

function paraLinkWhatsapp(telefoneFormatado) {
  if (!telefoneFormatado) return null;
  const somenteDigitos = telefoneFormatado.replace(/\D/g, '');
  const comCodigoPais = somenteDigitos.startsWith('55') ? somenteDigitos : `55${somenteDigitos}`;
  return `https://wa.me/${comCodigoPais}`;
}

/**
 * Gera a lista de leads (estabelecimentos sem site) pra um ramo + cidade,
 * e salva em prospeccao/leads/<ramo>-<cidade>.json.
 */
async function gerarLeads(ramo, cidade) {
  const estabelecimentos = await buscarEstabelecimentos(ramo, cidade);
  const leads = [];

  for (const item of estabelecimentos) {
    const detalhes = await buscarDetalhes(item.place_id);

    if (detalhes.website) {
      continue; // já tem site — não é lead
    }

    leads.push({
      nome: detalhes.name,
      telefone: detalhes.formatted_phone_number || null,
      whatsapp: paraLinkWhatsapp(detalhes.formatted_phone_number),
      endereco: detalhes.formatted_address || null,
      googleMapsUrl: detalhes.url || null,
      avaliacaoGoogle: detalhes.rating || null,
      totalAvaliacoes: detalhes.user_ratings_total || null,
      ramo,
      cidade,
      geradoEm: new Date().toISOString(),
    });

    // Evita bater o limite de taxa da API do Google.
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  const dir = path.join(__dirname, 'leads');
  fs.mkdirSync(dir, { recursive: true });
  const nomeArquivo = `${ramo}-${cidade}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const caminho = path.join(dir, `${nomeArquivo}.json`);
  fs.writeFileSync(caminho, JSON.stringify(leads, null, 2));

  return { caminho, total: leads.length, leads };
}

if (require.main === module) {
  const [, , ramo, cidade] = process.argv;
  if (!ramo || !cidade) {
    console.error('Uso: node buscar-leads.js "<ramo>" "<cidade>"');
    console.error('Exemplo: node buscar-leads.js "salão de beleza" "Campinas"');
    process.exit(1);
  }

  gerarLeads(ramo, cidade)
    .then(({ caminho, total }) => {
      console.log(`${total} leads sem site encontrados. Salvo em: ${caminho}`);
    })
    .catch((erro) => {
      console.error('Erro ao gerar leads:', erro.message);
      process.exit(1);
    });
}

module.exports = { gerarLeads, buscarEstabelecimentos, buscarDetalhes, paraLinkWhatsapp };
