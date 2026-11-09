# RENEA Conhecimento — Etapa 1: Biblioteca e Organograma (especificação)

Data: 2026-11-09 · Responsável: Deivid · Status: **aguardando revisão**

## 1. Objetivo
Catálogo de documentos da obra (Complexo Viário Alto Tietê) com etiquetas, links para o OneDrive/SharePoint, organograma clicável e perfil por pessoa. Base para o agente de IA (Etapa 2). Sistema independente: não liga com Sinapse, ERP nem Diário de Obra.

**Pronto quando:** 20 documentos reais cadastrados; filtros funcionam; organograma abre o perfil; revisão nova torna a anterior obsoleta; RH não aparece para quem não deve.

## 2. Fora desta etapa
IA/busca inteligente, atividades das pessoas, leitura de imagens, módulos de frota/diesel/materiais, login Microsoft, importação de RDO.

## 3. Suposições (corrigir na revisão)
| # | Suposição | Motivo |
|---|---|---|
| S1 | Fonte oficial de pessoas = aba **Efetivo** (320). As 22 só do Custo Gerencial ficam numa lista de conferência. | Sem resposta ainda |
| S2 | O topo do organograma fica vazio (sem chefe) até você informar. | Sem resposta ainda |
| S3 | **Terraplenagem** = setor. | Aparece como área com 90 pessoas |
| S4 | "114+600" vira 114.600 m automaticamente; guarda-se o texto e os metros. | Regra do prompt |
| S5 | Visibilidade em 3 níveis: **obra**, **setor**, **restrito**. | Proposta aceita implicitamente |
| S6 | Login por e-mail e senha (Supabase Auth). Admin convida os usuários. Login Microsoft fica para a Etapa 6. | Regra do prompt |
| S7 | 373-989 = empresa + filial da folha. Só guardado como texto de referência. | Planilha de efetivo |

## 4. Arquitetura
- **Site:** React + Vite, TypeScript estrito, `@supabase/supabase-js`, `react-router`. Sem outras bibliotecas pesadas.
- **Banco:** Supabase grátis (Postgres), com constraints, triggers e RLS. A segurança fica no banco; o site só mostra o que o banco devolve.
- **Arquivos:** ficam no OneDrive (guarda-se o link). Se o arquivo não estiver lá, vai para um bucket **privado** do Supabase Storage (limite de 1 GB).
- **Hospedagem:** Cloudflare Pages, publicada pelo GitHub.
- **Pastas do repositório:** `renea-conhecimento/web` (site), `renea-conhecimento/supabase/migrations` (banco, em SQL), `renea-conhecimento/scripts` (importação em Python).
- **Dados pessoais** (planilhas, CSVs) nunca vão para o GitHub (`.gitignore`).

## 5. Banco de dados

### 5.1 Listas únicas
Tabelas `setores`, `ramos`, `empresas`, `disciplinas`, `categorias`, `locais`. Todas têm `nome` e um índice único sobre o nome normalizado (minúsculas, sem acento, sem espaços sobrando). Assim "RAMO 900" e "Ramo 900" não coexistem. As telas usam seleção em lista; para criar item novo é preciso ser admin ou editor.
- `categorias` fixas: projeto, diagrama, procedimento, ensinamento, conferência, descrição de função, relatório diário (RDO).
- `setores` iniciais: os 18 da planilha de efetivo, com os erros de digitação corrigidos, mais Custos.

### 5.2 Tabelas principais
- `obras`: id, nome, centro de custos (texto).
- `pessoas`: id, nome, cargo, setor, local, **chefe_id** (aponta para outra pessoa), situação (ativo / vaga "à contratar").
- `pessoas_restritas`: pessoa_id, matrícula, telefone. Tabela separada, com RLS própria (só admin e RH).
- `perfis`: usuário (Supabase Auth), papel (**admin / editor / consulta**), setor, pessoa vinculada.
- `documentos`:
  - título, categoria, disciplina, setor, ramo, empresa de origem, produzido por (pessoa);
  - código do documento (ex.: AB-SPM00021D-114.117-825-C01) e revisão (R0 a R4);
  - trecho: `estaca_ini_txt`, `estaca_fim_txt`, `trecho_ini_m`, `trecho_fim_m`;
  - status (vigente / obsoleto), visibilidade (obra / setor / restrito), data do documento;
  - `url_arquivo` ou `storage_path` (exatamente um dos dois).
- `vinculos`: documento origem, documento destino, tipo (aplica-se-a / origina / substitui / referencia).
- `historico`: tabela, registro, ação, usuário, quando, antes (JSON), depois (JSON).

### 5.3 Regras no banco
1. **Etiquetas obrigatórias:** todas as colunas acima são NOT NULL. Sem exceção "a preencher depois".
2. **Trecho:** `trecho_fim_m >= trecho_ini_m`. Há uma função `estaca_para_metros('114+600')` = 114.600; formato inválido é rejeitado.
3. **Revisão única:** `(obra, código do documento, revisão)` é único.
4. **Obsolescência automática** (trigger): ao inserir uma revisão maior que a vigente do mesmo código, a anterior passa a obsoleta e ganha um vínculo "substitui". Se a revisão inserida for menor que a vigente, ela nasce obsoleta.
5. **Histórico automático** (trigger em todas as tabelas): grava quem, quando e antes/depois em cadastro, edição e exclusão. O histórico não pode ser editado nem apagado, nem por admin.
6. **Exclusão** de documento só por admin, e fica registrada.

### 5.4 Segurança (RLS)
| Visibilidade | Quem vê |
|---|---|
| obra | qualquer usuário logado |
| setor | usuários do mesmo setor + admin |
| restrito | admin + usuários do setor dono do documento (ex.: documento restrito do RH só para RH e admin) |

- `consulta` só lê; `editor` cadastra e edita no próprio setor; `admin` faz tudo.
- `pessoas_restritas` (matrícula, telefone): só admin e RH.
- Sem login, nada é lido.

## 6. Telas
1. **Entrar:** e-mail e senha, logotipo sobre fundo #063B2E.
2. **Cadastrar documento:** colar link do OneDrive, ou enviar arquivo. Todas as etiquetas obrigatórias, com listas de seleção. Estaca digitada como "114+600" e conversão mostrada em metros. Aviso se o código já existe ("será a revisão nova; a anterior ficará obsoleta").
3. **Biblioteca:** filtros por setor, categoria, disciplina, trecho, ramo, status, e busca por título. Por padrão só vigentes, com opção "mostrar obsoletos".
4. **Detalhe do documento:** etiquetas, quem produziu, histórico de revisões, relacionados (vínculos), botão abrir arquivo, aviso "confira o acesso ao OneDrive".
5. **Organograma:** árvore por chefe direto, recolhida por padrão (320 pessoas), com busca por nome. Clique abre o perfil.
6. **Perfil da pessoa:** cargo, setor, chefe, equipe, documentos que produziu. Matrícula e telefone só para quem pode. Atividades ficam para a Etapa 3.
- Visual: verde-escuro #063B2E, âmbar #F5A623, Barlow Condensed (títulos) + Inter (texto). O logotipo enviado serve para fundo escuro; falta a versão para fundo claro.

## 7. Importação de pessoas
Script Python, executado por mim: lê a aba **Efetivo** e gera CSVs limpos (`setores`, `pessoas`, `pessoas_restritas`). Corrige digitação ("TRNANSPORTE", "MRTINS", "DIRETO DE OBRA"), remove espaços, une "Fábrica" como setor e local separados, cria as 8 vagas "à contratar" como vagas. Gera também uma lista de conferência com as 22 pessoas que só estão no Custo Gerencial. O CSV chega a você fora do GitHub, ou é carregado direto pelo Supabase se o seu projeto estiver conectado.

## 8. Rotina de backup
Exportação semanal do banco (script/painel), guardada no OneDrive, porque o plano grátis não tem backup. Há também um lembrete para acessar o sistema, por causa da pausa após 1 semana sem uso.

## 9. Testes
- **Automáticos:** conversão de estaca (casos válidos e inválidos); obsolescência (R1 sobre R0, R0 depois de R1); unicidade de listas; RLS com dois usuários de teste (RH e comum); histórico gravando antes/depois.
- **No navegador (você):**
  1. Entrar com usuário comum e com usuário admin.
  2. Cadastrar documento com link do OneDrive → aparece na Biblioteca.
  3. Cadastrar a R1 do mesmo código → a R0 sai da lista padrão e aparece em "obsoletos".
  4. Tentar cadastrar sem uma etiqueta → bloqueia.
  5. Digitar estaca "114+600" → mostra 114.600 m.
  6. Filtrar por setor, trecho e ramo → resultados corretos.
  7. Criar "Ramo 900" e depois "ramo 900" → recusa o segundo.
  8. Documento restrito do RH → invisível para usuário comum, visível para RH.
  9. Organograma → clicar em uma pessoa → perfil com os documentos dela.
  10. Editar um documento → aparece no histórico com antes/depois.
  11. Os 20 documentos reais cadastrados e abrindo no OneDrive.

## 10. Riscos
- Link do OneDrive quebrado ou sem permissão: o sistema avisa, mas não resolve.
- Pausa do Supabase por inatividade: mitigada pelo lembrete.
- Limite de 500 MB: sobra folga, pois só se guardam links e textos.
