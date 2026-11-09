# RENEA Conhecimento — Etapa 1 Plano de Implementação

> **Para quem executa:** usar superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans. Os passos usam caixas `- [ ]`.

**Goal:** Biblioteca de documentos com etiquetas, organograma clicável e perfil de pessoa, com segurança no banco.

**Architecture:** Site React+Vite (TypeScript estrito) fala direto com o Supabase (Postgres + Auth + Storage). Toda regra importante (obrigatoriedade, obsolescência, histórico, visibilidade) vive no banco, em migrações SQL testadas. O site só exibe o que o banco devolve.

**Tech Stack:** React, Vite, TypeScript strict, react-router, @supabase/supabase-js, Vitest; Supabase (Postgres, RLS, Auth, Storage); Python 3 + openpyxl (só importação); Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-11-09-renea-etapa1-design.md`

## Global Constraints
- Só serviços gratuitos; Vercel Hobby e Render fora; Netlify é a reserva do Cloudflare Pages.
- TypeScript `strict: true`; sem `any`.
- Cores: verde-escuro `#063B2E`, âmbar `#F5A623`; fontes Barlow Condensed (títulos) + Inter (texto).
- Todas as etiquetas do documento são NOT NULL: categoria, disciplina, setor, ramo, trecho (estaca + metros), empresa de origem, revisão, status, visibilidade.
- Visibilidade: `obra` | `setor` | `restrito`. Papéis: `admin` | `editor` | `consulta`.
- Revisão nova torna a anterior obsoleta; por padrão a Biblioteca mostra só `vigente`.
- Histórico (quem, quando, antes/depois) em todo cadastro, edição e exclusão; não pode ser editado nem apagado.
- Listas únicas por nome normalizado (minúsculas, sem acento, sem espaços sobrando).
- Planilhas, CSVs e dados de pessoas nunca vão para o Git (`.gitignore`).
- Textos da interface em português do Brasil.
- Cada entrega termina com: o que foi feito, como testar, o que falta. Parar e esperar aprovação ao fim da etapa.

## Review Focus
1. **Estaca malformada** ("114+1000", "114 + 600", "114+60", "-5+200", vazio): rejeitar com mensagem clara, nunca converter errado.
2. **Revisão como número, não texto:** R10 vale mais que R2; inserir R0 depois da R3 nasce obsoleta.
3. **Ciclo no organograma** (A chefe de B e B chefe de A): o banco recusa; a tela nunca entra em laço infinito.
4. **Usuário logado sem perfil** (convidado, mas sem linha em `perfis`): não lê nada e vê aviso "aguarde liberação do admin".
5. **Link inválido ou nos dois campos** (`url_arquivo` e `storage_path`, ou nenhum, ou URL que não é https): recusado.

---

## Estrutura de arquivos
```
renea-conhecimento/
  .gitignore                      dados/, *.csv, *.xlsx, .env*
  supabase/migrations/            0001..0006 (SQL numerado)
  supabase/tests/                 testes SQL (rodam no painel/ferramenta Supabase)
  scripts/importar_efetivo.py     lê a aba Efetivo, gera CSVs limpos
  scripts/test_importar_efetivo.py
  scripts/backup_semanal.md       passo a passo da exportação
  web/src/lib/estaca.ts           estacaParaMetros / metrosParaEstaca
  web/src/lib/supabase.ts         cliente único
  web/src/lib/tipos.ts            tipos do banco (gerados)
  web/src/lib/sessao.tsx          SessaoProvider + useSessao()
  web/src/componentes/            Layout, Guarda, SeletorLista, ArvoreOrganograma
  web/src/paginas/                Entrar, Biblioteca, CadastrarDocumento, DetalheDocumento, Organograma, PerfilPessoa
```

---

### Task 1: Contas, esqueleto do site e publicação
**Files:** Create `renea-conhecimento/web/*` (Vite React TS), `.gitignore`, `web/src/tema.css`, `web/public/logo-claro.png`.
**Produces:** URL pública do Cloudflare Pages mostrando a marca; `web/src/lib/supabase.ts` exportando `supabase: SupabaseClient`.

- [ ] **Step 1 (você, guiado por mim):** criar projeto Supabase e conta Cloudflare Pages no nome da empresa; eu descrevo cada tela. Anotar URL e chave pública (anon) do Supabase.
- [ ] **Step 2:** criar app Vite React-TS em `web/` com `strict: true` e `noUncheckedIndexedAccess`; adicionar `.gitignore` (dados pessoais).
- [ ] **Step 3:** `tema.css` com variáveis de cor e fontes (Google Fonts); `Layout` com cabeçalho verde-escuro e o logotipo enviado.
- [ ] **Step 4:** `lib/supabase.ts` lê `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; você cadastra as duas no painel do Cloudflare.
- [ ] **Step 5:** `npm run build` passa sem erros de tipo. Commit, push; você conecta o repositório ao Cloudflare Pages.
- [ ] **Verificação:** a URL pública abre e mostra a tela com logotipo.

### Task 2: Conversão de estaca (TypeScript)
**Files:** Create `web/src/lib/estaca.ts`, `web/src/lib/estaca.test.ts`.
**Produces:** `estacaParaMetros(txt: string): number | null`, `metrosParaEstaca(m: number): string`.

- [ ] **Step 1: testes (Vitest)**
  - `estacaParaMetros("114+600") === 114600`; `("0+000") === 0`; `("114+000") === 114000`
  - `null` para: `"114+1000"`, `"114 + 600"`, `"114+60"`, `"-5+200"`, `""`, `"abc"`
  - `metrosParaEstaca(114600) === "114+600"`
- [ ] **Step 2:** rodar; deve falhar.
- [ ] **Step 3:** implementar com regex `^\d+\+\d{3}$` (nada de espaços; a tela já faz `trim`).
- [ ] **Step 4:** rodar; deve passar. Commit.

### Task 3: Banco — listas únicas e função de estaca
**Files:** Create `supabase/migrations/0001_listas.sql`, `supabase/tests/0001_listas.sql`.
**Produces:** função `normaliza(texto) returns text` (unaccent+lower+trim+espaços colapsados); tabelas `setores, ramos, empresas, disciplinas, categorias, locais, obras` (cada uma: `id`, `nome`, índice único em `normaliza(nome)`); função `estaca_para_metros(txt text) returns int` (mesma regra da Task 2, lança erro se inválida); carga inicial de `categorias` (7 fixas) e `setores` (18 da planilha, corrigidos, + Custos).

- [ ] **Step 1: teste SQL:** inserir `'RAMO 900'` e depois `'Ramo 900'` e `'ramo  900 '` em `ramos` → os dois últimos falham por unicidade. `estaca_para_metros('114+600') = 114600`; `'114+1000'` levanta exceção.
- [ ] **Step 2:** aplicar a migração; rodar o teste; deve passar. Commit.

### Task 4: Banco — pessoas, perfis, organograma
**Files:** Create `supabase/migrations/0002_pessoas.sql`, `supabase/tests/0002_pessoas.sql`.
**Produces:** `pessoas(id, nome, cargo, setor_id, local_id, chefe_id, situacao)` com `situacao in ('ativo','vaga')`; `pessoas_restritas(pessoa_id, matricula, telefone)`; `perfis(user_id, papel, setor_id, pessoa_id)`; trigger `impede_ciclo_chefe` ; view `equipe_de(pessoa_id)`.

- [ ] **Step 1: teste SQL:** A chefe de B; tentar tornar B chefe de A → erro; pessoa chefe de si mesma → erro.
- [ ] **Step 2:** implementar e aplicar; teste passa. Commit.

### Task 5: Banco — documentos, revisões e obsolescência
**Files:** Create `supabase/migrations/0003_documentos.sql`, `supabase/tests/0003_documentos.sql`.
**Produces:** tabelas `documentos` e `vinculos` conforme spec §5.2. `revisao smallint check (revisao between 0 and 99)` (exibida como "R"+n). Constraints: todas NOT NULL; `trecho_fim_m >= trecho_ini_m`; `(obra_id, codigo, revisao)` único; `check ((url_arquivo is null) <> (storage_path is null))`; `check (url_arquivo ~ '^https://')`. Trigger `before insert` que preenche `trecho_*_m` com `estaca_para_metros`; trigger `after insert` `obsoleta_anteriores`.

- [ ] **Step 1: testes SQL**
  - R0 e depois R1 do mesmo código → R0 `obsoleto`, R1 `vigente`, existe vínculo `substitui` R1→R0.
  - R3 vigente; inserir R0 → R0 nasce `obsoleto`, R3 continua `vigente`.
  - R10 sobre R2 → R2 obsoleto (comparação numérica).
  - Mesmo código+revisão duas vezes → erro de unicidade.
  - Faltando qualquer etiqueta → erro; URL `http://` ou nos dois campos → erro; estaca fim < início → erro.
- [ ] **Step 2:** implementar; aplicar; testes passam. Commit.

### Task 6: Banco — histórico imutável
**Files:** Create `supabase/migrations/0004_historico.sql`, `supabase/tests/0004_historico.sql`.
**Produces:** tabela `historico(id, tabela, registro_id, acao, usuario_id, em, antes jsonb, depois jsonb)`; função de trigger `registra_historico()` ligada a `documentos, vinculos, pessoas, pessoas_restritas, perfis` e às listas.

- [ ] **Step 1: teste SQL:** insert → 1 linha com `antes` nulo; update de título → `antes` e `depois` com o título; delete → `depois` nulo; `update`/`delete` em `historico` falham mesmo para admin.
- [ ] **Step 2:** implementar (revogar update/delete; trigger que bloqueia). Testes passam. Commit.

### Task 7: Banco — RLS (quem vê o quê)
**Files:** Create `supabase/migrations/0005_rls.sql`, `supabase/tests/0005_rls.sql`.
**Produces:** políticas conforme spec §5.4; funções auxiliares `papel_atual()`, `setor_atual()`.

- [ ] **Step 1: teste SQL com 3 usuários de teste (admin, RH, comum, mais um sem perfil):**
  - comum vê doc `obra`; não vê doc `setor` de RH nem `restrito` de RH; RH vê os dois; admin vê tudo.
  - `consulta` não consegue inserir; `editor` só insere no próprio setor.
  - `pessoas_restritas`: só admin e RH leem.
  - usuário sem perfil: 0 linhas em toda tabela.
  - anônimo (sem login): 0 linhas.
- [ ] **Step 2:** implementar; rodar; passam. Rodar o verificador de segurança do Supabase (`get_advisors`) e corrigir alertas. Commit.

### Task 8: Importação de pessoas (Python)
**Files:** Create `scripts/importar_efetivo.py`, `scripts/test_importar_efetivo.py`.
**Produces:** `limpa_nome(s: str) -> str`; `corrige_setor(s: str) -> str`; `main(xlsx: Path, saida: Path) -> None` gerando `setores.csv`, `pessoas.csv`, `pessoas_restritas.csv`, `conferencia_gerencial.csv`.

- [ ] **Step 1: testes (pytest, com mini-planilha fictícia criada no teste):**
  - `corrige_setor("TRNANSPORTE DE CONCRETO") == "TRANSPORTE DE CONCRETO"`; `"DIRETO DE OBRA" → "DIRETO DE OBRA"` fica no setor de custo só se for categoria; espaços sobrando removidos; `"EDSON MRTINS"` casa com `"EDSON MARTINS DA SILVA"` pelo encarregado.
  - linhas "À CONTRATAR" viram `situacao='vaga'`.
  - matrícula e telefone saem só em `pessoas_restritas.csv`.
  - `chefe_id` aponta para pessoa existente; encarregado não encontrado vai para lista de pendências, não quebra.
- [ ] **Step 2:** implementar com openpyxl (somente aba Efetivo; Custo Gerencial só gera a conferência). Rodar `python3 -I -m pytest scripts`.
- [ ] **Step 3:** rodar na planilha real; conferir totais (320 pessoas, 39 encarregados, 18 setores). CSVs entregues a você fora do Git. Commit só do código.

### Task 9: Entrar e sessão
**Files:** Create `web/src/lib/sessao.tsx`, `web/src/componentes/Guarda.tsx`, `web/src/paginas/Entrar.tsx`; Modify `web/src/main.tsx` (rotas).
**Produces:** `useSessao(): { usuario: User | null; perfil: Perfil | null; carregando: boolean; sair(): Promise<void> }`; `<Guarda papelMinimo?>` redireciona para `/entrar`.

- [ ] **Step 1: teste Vitest:** `Guarda` sem usuário redireciona para `/entrar`; com usuário sem `perfil` mostra "Aguarde liberação do admin" e nenhum conteúdo.
- [ ] **Step 2:** implementar com `supabase.auth.signInWithPassword`; mensagem de erro em português.
- [ ] **Step 3:** `npm run build` e testes passam. Commit e publicação.

### Task 10: Cadastrar documento
**Files:** Create `web/src/paginas/CadastrarDocumento.tsx`, `web/src/componentes/SeletorLista.tsx`.
**Consumes:** `estacaParaMetros` (Task 2), tabelas das Tasks 3 e 5.
**Produces:** `<SeletorLista tabela="setores"|"ramos"|… value onChange>`.

- [ ] **Step 1: teste Vitest:** formulário não envia com etiqueta faltando; estaca "114+600" mostra "114.600 m"; "114+1000" mostra erro; código já existente mostra aviso "será a revisão X; a anterior ficará obsoleta".
- [ ] **Step 2:** implementar; envio usa `supabase.from('documentos').insert`; erros do banco traduzidos para mensagens claras. Upload alternativo para o bucket privado `documentos`.
- [ ] **Step 3:** testes passam; publicar; você cadastra 1 documento de teste. Commit.

### Task 11: Biblioteca
**Files:** Create `web/src/paginas/Biblioteca.tsx`.
- [ ] **Step 1: teste Vitest:** por padrão consulta com `status = 'vigente'`; marcar "mostrar obsoletos" remove o filtro; filtro de trecho usa sobreposição `trecho_ini_m <= fim AND trecho_fim_m >= ini` em metros; busca por título é case-insensitive.
- [ ] **Step 2:** implementar filtros (setor, categoria, disciplina, trecho, ramo, status) e busca; estado dos filtros na URL.
- [ ] **Step 3:** testes passam; publicar. Commit.

### Task 12: Detalhe do documento
**Files:** Create `web/src/paginas/DetalheDocumento.tsx`.
- [ ] **Step 1: teste Vitest:** lista todas as revisões do mesmo código em ordem numérica decrescente; botão "Abrir arquivo" abre `url_arquivo` em nova aba (ou gera link assinado do Storage); mostra aviso "confira o acesso ao OneDrive"; lista vínculos (aplica-se-a/origina/substitui/referencia).
- [ ] **Step 2:** implementar; testes passam; publicar. Commit.

### Task 13: Organograma e perfil da pessoa
**Files:** Create `web/src/componentes/ArvoreOrganograma.tsx`, `web/src/paginas/Organograma.tsx`, `web/src/paginas/PerfilPessoa.tsx`.
**Produces:** `montaArvore(pessoas: Pessoa[]): No[]` em `web/src/lib/arvore.ts` (com teste).

- [ ] **Step 1: teste Vitest:** `montaArvore` com dados em ciclo ou chefe ausente não entra em laço (raiz = quem não tem chefe ou chefe inexistente); filtro por nome expande o caminho até a pessoa.
- [ ] **Step 2:** implementar árvore recolhida por padrão; clique → `/pessoas/:id`; perfil mostra cargo, setor, chefe, equipe e documentos produzidos; matrícula/telefone só se o banco devolver.
- [ ] **Step 3:** testes passam; publicar. Commit.

### Task 14: Backup semanal
**Files:** Create `scripts/backup_semanal.md`.
- [ ] **Step 1:** passo a passo no painel do Supabase para exportar o banco (SQL e CSV) e guardar no OneDrive; lembrete semanal que também evita a pausa por inatividade (agenda do Outlook/celular).
- [ ] **Step 2 (você):** fazer a primeira exportação seguindo o guia; confirmo que o arquivo abre.

### Task 15: Carga real e aceite da Etapa 1
- [ ] **Step 1:** importar os CSVs das pessoas (Task 8) no Supabase; criar usuários (admin, RH, comum) por convite.
- [ ] **Step 2 (você):** cadastrar os 20 documentos reais.
- [ ] **Step 3 (você):** rodar os 11 testes de navegador da spec §9; marcar cada um com ✔/✘.
- [ ] **Step 4:** corrigir o que falhar; só então declarar a Etapa 1 pronta e **parar** para a sua aprovação antes da Etapa 2.
