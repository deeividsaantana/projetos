const fs = require('fs');
const path = require('path');
const { gerarSite } = require('../gerador');

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID || '';

function slugify(texto) {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50) || 'site-mei';
}

/**
 * Publica um conjunto de arquivos estáticos na Vercel usando a API de Deployments.
 * Docs: https://vercel.com/docs/rest-api/endpoints/deployments
 */
async function publicarNaVercel(nomeProjeto, arquivos) {
  if (!VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN não configurado nas variáveis de ambiente');
  }

  const url = new URL('https://api.vercel.com/v13/deployments');
  if (VERCEL_TEAM_ID) url.searchParams.set('teamId', VERCEL_TEAM_ID);

  const resposta = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: nomeProjeto,
      files: arquivos,
      target: 'production',
      projectSettings: { framework: null },
    }),
  });

  const dados = await resposta.json();
  if (!resposta.ok) {
    throw new Error(`Falha ao publicar na Vercel: ${JSON.stringify(dados)}`);
  }

  return `https://${dados.url}`;
}

/**
 * Gera o site a partir dos dados do cliente e publica na Vercel.
 * @param {object} dadosCliente - mesmo formato de exemplo/dados-exemplo.json
 * @returns {Promise<string>} URL pública do site publicado
 */
async function gerarEPublicar(dadosCliente) {
  const html = gerarSite(dadosCliente);
  const css = fs.readFileSync(
    path.join(__dirname, '..', 'template', 'style.css'),
    'utf8'
  );

  const nomeProjeto = slugify(dadosCliente.nomeEmpresa);

  const url = await publicarNaVercel(nomeProjeto, [
    { file: 'index.html', data: html },
    { file: 'style.css', data: css },
  ]);

  return url;
}

module.exports = { gerarEPublicar, slugify };
