# Automação: lead → pagamento → geração → publicação

Este módulo fecha o funil inteiro, do primeiro contato do lead até o site publicado — você só entra para revisar o resultado antes de avisar o cliente. Tem **duas portas de entrada** para o lead, que terminam no mesmo lugar (cobrança Pix → site publicado):

- **Formulário web** (`/pedido`): não depende de nenhuma aprovação externa, funciona assim que o servidor estiver no ar. Use este enquanto a conta do WhatsApp Business não estiver liberada.
- **WhatsApp** (`/webhook/whatsapp`): depende de app aprovado na Meta (ver "Pré-requisitos").

Fluxo (via formulário):

```
Cliente preenche o formulário em /pedido
        │
        ▼
server.js (POST /pedido)  →  criar-preferencia.js
   (cria cobrança Pix no Mercado Pago com os dados do cliente no metadata)
        │
        ▼
Cliente é redirecionado direto para a página de pagamento do Mercado Pago
        │
   (cliente paga)
        ▼
server.js (/webhook/mercadopago)  →  confirma pagamento aprovado
        │
        ▼
gerar-e-publicar.js  →  gerador.js (gera o HTML/CSS)
        │
        ▼
Deploy automático na Vercel (API de Deployments)
        │
        ▼
Link do site pronto, registrado em pedidos-processados.log
(você revisa antes de enviar ao cliente)
```

O WhatsApp, quando a conta estiver liberada, entra no mesmo funil só trocando a primeira etapa: em vez do formulário, `lead-conversa.js` coleta os dados por mensagem e já cai no mesmo `criar-preferencia.js`.

## Pré-requisitos (contas e tokens — isso só você consegue criar)

1. **Conta Mercado Pago** com Checkout Pro/Pix habilitado e `MP_ACCESS_TOKEN` (em https://www.mercadopago.com.br/developers/panel).
2. **Conta Vercel** com `VERCEL_TOKEN` (em https://vercel.com/account/tokens).
3. **Hospedagem para este servidor** (ele precisa ficar no ar para receber os pedidos e os webhooks): Railway, Render, Fly.io ou similar. Não incluído aqui — é uma conta/decisão sua.
4. Node.js 18+.
5. **Opcional, para ativar o WhatsApp mais tarde:** WhatsApp Business Platform (Cloud API) oficial da Meta — criar um app em https://developers.facebook.com/apps, adicionar o produto "WhatsApp", pegar `WHATSAPP_TOKEN` e `WHATSAPP_PHONE_NUMBER_ID`, e definir um `WHATSAPP_VERIFY_TOKEN`. Exige verificação da empresa pela Meta (contas muito novas podem ser bloqueadas nesse passo até "amadurecerem"). Enquanto isso não libera, use o formulário web — o funil já funciona sem o WhatsApp.

```bash
cd gerador-site-mei/automacao
npm install
```

Variáveis de ambiente necessárias (as do WhatsApp são opcionais até a conta ser liberada):

```
MP_ACCESS_TOKEN=seu_token_mercado_pago
VERCEL_TOKEN=seu_token_vercel
VERCEL_TEAM_ID=            # opcional, se o projeto estiver em um time
PORT=3000

WHATSAPP_TOKEN=token_do_whatsapp_cloud_api
WHATSAPP_PHONE_NUMBER_ID=id_do_numero_no_whatsapp
WHATSAPP_VERIFY_TOKEN=uma_string_secreta_escolhida_por_voce
```

## Rodando

```bash
node server.js
```

O formulário fica em `http://localhost:3000/pedido` (ou na raiz `/`). Depois de hospedar (com HTTPS), mande esse link pros clientes (ex. como link na bio do Instagram, ou direto no WhatsApp pessoal enquanto o bot não está pronto).

Quando o WhatsApp estiver liberado, configure também:

- No painel do app do WhatsApp (Meta): webhook `https://seu-dominio/webhook/whatsapp`, campo `messages`, usando o mesmo `WHATSAPP_VERIFY_TOKEN`.
- No painel do Mercado Pago: webhook `https://seu-dominio/webhook/mercadopago`, evento `payment` (necessário nos dois casos, formulário ou WhatsApp, pois é isso que dispara a geração do site).

## Como o formulário funciona (`public/pedido.html`)

Landing page com animações (GSAP + ScrollTrigger), demonstração ao vivo de 3 sites de exemplo gerados pelo próprio gerador (`/exemplo/1`, `/exemplo/2`, `/exemplo/3`), cards de plano clicáveis e os mesmos campos da conversa do WhatsApp: nome da empresa, ramo, cidade, WhatsApp, e-mail, slogan, sobre e serviços (separados por vírgula).

O cliente também escolhe a **forma de pagamento**: pagamento único (Checkout Pro) ou assinatura mensal (Preapproval). Ao enviar, `server.js` chama `criar-preferencia.js` (único) ou `criar-assinatura.js` (mensal) e redireciona o navegador direto para a página de pagamento do Mercado Pago — sem passo intermediário.

**Pagamento único (Checkout Pro)** já abre com Pix, cartão de crédito, boleto e outras formas automaticamente — é nativo do Mercado Pago, não precisa de código extra pra isso.

**Assinatura mensal (Preapproval)** cobra automaticamente todo mês até ser cancelada, e exige e-mail do cliente (obrigatório só nesse modo). Como a API de assinaturas não tem campo `metadata` como a de preferências, os dados do cliente vão compactados (sem descrições/preços de serviço) no campo `external_reference`; o webhook de pagamento (`/webhook/mercadopago`) sabe ler dos dois formatos.

## Como a conversa do WhatsApp funciona (`lead-conversa.js`, quando ativado)

Quando um lead manda qualquer mensagem (ex. "oi"), o bot inicia uma conversa simples que pergunta, em sequência: nome da empresa, ramo de atividade, cidade, serviços/produtos (separados por vírgula) e e-mail (opcional). Ao final, gera automaticamente o link de pagamento e envia pelo próprio WhatsApp.

No WhatsApp, o pacote cobrado é sempre o **Plano Básico (R$ 297)** — os preços de Intermediário e Catálogo já estão definidos em `criar-preferencia.js`, mas a escolha de pacote pelo cliente ainda não está na conversa (ver "Limitações" abaixo). No formulário web o cliente já escolhe o plano.

## O que ainda depende de você

- **Revisão final do site** antes de enviar o link ao cliente — por pedido explícito, o fluxo não entrega nada ao cliente sem essa revisão.
- **Criar as contas e tokens** listados em "Pré-requisitos": WhatsApp Business (exige verificação da Meta), Mercado Pago e Vercel.
- **Hospedar o servidor** em algum serviço que fique no ar — sem isso, nenhum webhook chega.
- **Domínio próprio** (upsell): associar um domínio customizado ao deploy ainda é manual pelo painel da Vercel ou via chamada adicional à API `/v10/projects/{id}/domains`.
- **Persistência real dos pedidos**: hoje usa memória (conversa em andamento) + um arquivo de log (pedidos concluídos). Em produção, troque por um banco de dados (ex. Supabase) para não perder conversas em um restart e rastrear falhas.

## Limitações conhecidas desta primeira versão

- Não valida WhatsApp/e-mail/telefone duplicado — um mesmo lead pode gerar várias cobranças se mandar "oi" de novo (ou reenviar o formulário).
- No WhatsApp, não oferece ao cliente escolher entre os pacotes Básico/Intermediário/Catálogo nem entre pagamento único/mensal — sempre cobra o Básico à vista. No formulário web o cliente já escolhe os dois.
- Não implementa limite de frequência de mensagens nem opt-out — a decisão de LGPD/anti-spam do plano do funil ainda precisa ser aplicada aqui antes de usar em produção com leads frios (hoje o fluxo é pensado para quem já chamou a empresa no WhatsApp, não para disparo em massa).
- Assinatura mensal: cada cobrança mensal aprovada dispara `gerarEPublicar` de novo (reafirma/republica o mesmo site) — não é um problema grave, mas é redundante. Cancelamento de assinatura (quando o cliente para de pagar) não derruba o site automaticamente — isso ficaria pra uma versão futura com persistência real.
