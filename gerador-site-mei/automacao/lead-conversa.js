/**
 * Conduz, por WhatsApp, a conversa que coleta os dados do cliente MEI antes
 * de gerar o link de pagamento. Estado guardado em memória por número de
 * telefone — se o processo reiniciar, a conversa em andamento se perde (ver
 * ressalva no README sobre trocar por persistência real).
 */

const PERGUNTAS = [
  { campo: 'nomeEmpresa', texto: 'Qual o nome da sua empresa?' },
  {
    campo: 'ramoAtividade',
    texto: 'Qual o ramo de atividade? (ex: confeitaria, salão de beleza, loja de roupas)',
  },
  { campo: 'cidade', texto: 'Em qual cidade/estado você atende?' },
  {
    campo: 'servicosTexto',
    texto:
      'Liste seus principais serviços/produtos, separados por vírgula (ex: Corte de cabelo, Manicure, Coloração)',
  },
  { campo: 'email', texto: 'Qual seu e-mail para contato? (se não tiver, responda "pular")' },
];

const GATILHOS_INICIO = ['oi', 'olá', 'ola', 'site', 'quero um site', 'começar', 'iniciar', 'menu'];

const estados = new Map();

/**
 * Processa uma mensagem recebida de um número e retorna o que responder.
 * @returns {{tipo: 'pergunta', texto: string} | {tipo: 'completo', dados: object}}
 */
function processarMensagem(telefone, textoRecebido) {
  const textoLimpo = (textoRecebido || '').trim();
  const textoLower = textoLimpo.toLowerCase();
  let estado = estados.get(telefone);

  if (!estado || GATILHOS_INICIO.includes(textoLower)) {
    estado = { passo: 0, dados: {} };
    estados.set(telefone, estado);
    return {
      tipo: 'pergunta',
      texto: `Olá! Vou te ajudar a criar seu site. ${PERGUNTAS[0].texto}`,
    };
  }

  const perguntaAtual = PERGUNTAS[estado.passo];
  let valor = textoLimpo;

  if (perguntaAtual.campo === 'email' && textoLower === 'pular') {
    valor = '';
  }

  if (perguntaAtual.campo === 'servicosTexto') {
    estado.dados.servicos = valor
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((nome) => ({ nome }));
  } else {
    estado.dados[perguntaAtual.campo] = valor;
  }

  estado.passo += 1;

  if (estado.passo < PERGUNTAS.length) {
    return { tipo: 'pergunta', texto: PERGUNTAS[estado.passo].texto };
  }

  estados.delete(telefone);
  return {
    tipo: 'completo',
    dados: { ...estado.dados, whatsapp: telefone },
  };
}

module.exports = { processarMensagem };
