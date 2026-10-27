const fs = require('fs');
const path = require('path');

/**
 * Converte um arquivo de leads (gerado por buscar-leads.js) em CSV, pra
 * abrir em planilha e ir marcando quem já foi contatado/fechou.
 */
function exportarCsv(caminhoJson) {
  const leads = JSON.parse(fs.readFileSync(caminhoJson, 'utf8'));
  const colunas = ['nome', 'telefone', 'whatsapp', 'endereco', 'googleMapsUrl', 'avaliacaoGoogle', 'totalAvaliacoes', 'ramo', 'cidade'];

  const linhas = [colunas.join(',')];
  for (const lead of leads) {
    const linha = colunas.map((coluna) => {
      const valor = lead[coluna] == null ? '' : String(lead[coluna]);
      return `"${valor.replace(/"/g, '""')}"`;
    });
    linhas.push(linha.join(','));
  }

  const caminhoCsv = caminhoJson.replace(/\.json$/, '.csv');
  fs.writeFileSync(caminhoCsv, linhas.join('\n'));
  return caminhoCsv;
}

if (require.main === module) {
  const [, , caminhoJson] = process.argv;
  if (!caminhoJson) {
    console.error('Uso: node exportar-csv.js <caminho-do-leads.json>');
    process.exit(1);
  }
  const caminhoCsv = exportarCsv(path.resolve(caminhoJson));
  console.log(`CSV gerado em: ${caminhoCsv}`);
}

module.exports = { exportarCsv };
