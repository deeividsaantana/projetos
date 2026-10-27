#!/usr/bin/env node
/**
 * Gerador de landing page estática para MEIs.
 * Uso: node gerador.js <caminho-para-dados.json> [pasta-saida]
 *
 * Lê um JSON com os dados do cliente (ver exemplo/dados-exemplo.json),
 * preenche o template HTML/CSS e grava o site pronto para publicar
 * em Vercel, Netlify ou qualquer hospedagem estática.
 */

const fs = require('fs');
const path = require('path');

function erro(msg) {
  console.error(`Erro: ${msg}`);
  process.exit(1);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function somenteDigitos(str) {
  return String(str || '').replace(/\D/g, '');
}

function validarDados(dados) {
  const camposObrigatorios = ['nomeEmpresa', 'ramoAtividade', 'cidade', 'whatsapp'];
  for (const campo of camposObrigatorios) {
    if (!dados[campo]) {
      erro(`campo obrigatório ausente no JSON: "${campo}"`);
    }
  }
  if (!Array.isArray(dados.servicos) || dados.servicos.length === 0) {
    erro('o campo "servicos" deve ser uma lista com pelo menos 1 item');
  }
}

function renderizarServicos(servicos) {
  return servicos
    .map((servico) => {
      const preco = servico.preco ? `<span class="servico-preco">${escapeHtml(servico.preco)}</span>` : '';
      return `
      <article class="servico-card">
        <h3>${escapeHtml(servico.nome)}</h3>
        <p>${escapeHtml(servico.descricao || '')}</p>
        ${preco}
      </article>`;
    })
    .join('\n');
}

function gerarSite(dados) {
  validarDados(dados);

  const templatePath = path.join(__dirname, 'template', 'template.html');
  let html = fs.readFileSync(templatePath, 'utf8');

  const whatsappDigitos = somenteDigitos(dados.whatsapp);
  const whatsappLink = `https://wa.me/55${whatsappDigitos}`;
  const mensagemWhatsapp = encodeURIComponent(
    `Olá! Vim pelo site e gostaria de saber mais sobre os serviços da ${dados.nomeEmpresa}.`
  );

  const substituicoes = {
    '{{NOME_EMPRESA}}': escapeHtml(dados.nomeEmpresa),
    '{{RAMO_ATIVIDADE}}': escapeHtml(dados.ramoAtividade),
    '{{CIDADE}}': escapeHtml(dados.cidade),
    '{{SLOGAN}}': escapeHtml(dados.slogan || ''),
    '{{SOBRE}}': escapeHtml(dados.sobre || ''),
    '{{WHATSAPP_LINK}}': `${whatsappLink}?text=${mensagemWhatsapp}`,
    '{{WHATSAPP_EXIBICAO}}': escapeHtml(dados.whatsapp),
    '{{EMAIL}}': escapeHtml(dados.email || ''),
    '{{EMAIL_BLOCO}}': dados.email
      ? `<p><a href="mailto:${escapeHtml(dados.email)}">${escapeHtml(dados.email)}</a></p>`
      : '',
    '{{SERVICOS}}': renderizarServicos(dados.servicos),
    '{{COR_PRIMARIA}}': escapeHtml(dados.corPrimaria || '#1a7f5a'),
    '{{COR_SECUNDARIA}}': escapeHtml(dados.corSecundaria || '#0d4f36'),
    '{{ANO}}': String(new Date().getFullYear()),
  };

  for (const [chave, valor] of Object.entries(substituicoes)) {
    html = html.split(chave).join(valor);
  }

  return html;
}

function main() {
  const [, , caminhoDados, pastaSaidaArg] = process.argv;

  if (!caminhoDados) {
    erro('informe o caminho do JSON de dados. Ex: node gerador.js exemplo/dados-exemplo.json');
  }

  const dadosRaw = fs.readFileSync(caminhoDados, 'utf8');
  let dados;
  try {
    dados = JSON.parse(dadosRaw);
  } catch (e) {
    erro(`JSON inválido em "${caminhoDados}": ${e.message}`);
  }

  const html = gerarSite(dados);

  const pastaSaida = pastaSaidaArg || 'saida';
  fs.mkdirSync(pastaSaida, { recursive: true });
  fs.writeFileSync(path.join(pastaSaida, 'index.html'), html, 'utf8');
  fs.copyFileSync(
    path.join(__dirname, 'template', 'style.css'),
    path.join(pastaSaida, 'style.css')
  );

  console.log(`Site gerado em: ${path.resolve(pastaSaida)}`);
}

if (require.main === module) {
  main();
}

module.exports = { gerarSite, validarDados };
