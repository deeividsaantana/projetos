const fs = require('fs');
const path = require('path');
const { criarPreferenciaPagamento } = require('../automacao/criar-preferencia');
const { criarAssinaturaMensal } = require('../automacao/criar-assinatura');

/**
 * Pra quando um lead prospectado (ver buscar-leads.js) responde no seu
 * WhatsApp pessoal dizendo que quer o site: gera o link de pagamento na
 * hora, sem precisar passar pelo formulário web. O link sai pronto pra
 * colar de volta na conversa.
 */

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const chave = argv[i].replace(/^--/, '');
    args[chave] = argv[i + 1];
  }
  return args;
}

function carregarLeadDoArquivo(caminhoJson, indice) {
  const leads = JSON.parse(fs.readFileSync(caminhoJson, 'utf8'));
  const lead = leads[indice];
  if (!lead) {
    throw new Error(`Não encontrei o lead no índice ${indice} em ${caminhoJson} (${leads.length} leads no arquivo)`);
  }
  return lead;
}

async function fecharVenda(args) {
  let base = { nomeEmpresa: args.nome, ramoAtividade: args.ramo, cidade: args.cidade, whatsapp: args.whatsapp };

  if (args.lead) {
    const leadSalvo = carregarLeadDoArquivo(path.resolve(args.lead), Number(args.indice || 0));
    base = {
      nomeEmpresa: args.nome || leadSalvo.nome,
      ramoAtividade: args.ramo || leadSalvo.ramo,
      cidade: args.cidade || leadSalvo.cidade,
      whatsapp: args.whatsapp || leadSalvo.telefone,
    };
  }

  if (!base.nomeEmpresa || !base.ramoAtividade || !base.cidade || !base.whatsapp) {
    throw new Error('Faltam dados do cliente (nomeEmpresa/ramoAtividade/cidade/whatsapp) — passe por --nome/--ramo/--cidade/--whatsapp ou por --lead + --indice');
  }

  if (!args.servicos) {
    throw new Error('Passe --servicos "Serviço 1,Serviço 2,..." (o que o lead oferece, separado por vírgula)');
  }

  const dadosCliente = {
    ...base,
    email: args.email || '',
    slogan: args.slogan || '',
    sobre: args.sobre || '',
    servicos: args.servicos.split(',').map((s) => s.trim()).filter(Boolean).map((nome) => ({ nome })),
  };

  const pacote = args.pacote || 'basico';
  const tipoPagamento = args.pagamento === 'mensal' ? 'mensal' : 'unico';

  const link = tipoPagamento === 'mensal'
    ? await criarAssinaturaMensal(dadosCliente, pacote)
    : await criarPreferenciaPagamento(dadosCliente, pacote);

  return { link, dadosCliente, pacote, tipoPagamento };
}

if (require.main === module) {
  const args = parseArgs(process.argv.slice(2));
  fecharVenda(args)
    .then(({ link, dadosCliente, pacote, tipoPagamento }) => {
      console.log(`\nLink de pagamento (${tipoPagamento}, plano ${pacote}) pra "${dadosCliente.nomeEmpresa}":\n`);
      console.log(link);
      console.log('\nCola esse link direto na conversa do WhatsApp com o lead.');
    })
    .catch((erro) => {
      console.error('Erro ao gerar o link:', erro.message);
      process.exit(1);
    });
}

module.exports = { fecharVenda, parseArgs, carregarLeadDoArquivo };
