# Automação: WhatsApp → pagamento → geração → publicação

Este módulo fecha o funil inteiro, do primeiro contato do lead até o site publicado — você só entra para revisar o resultado antes de avisar o cliente.

Fluxo:

```
Lead manda mensagem no WhatsApp
        │
        ▼
server.js (/webhook/whatsapp) + lead-conversa.js
   (faz as perguntas: empresa, ramo, cidade, serviços, e-mail)
        │
        ▼
criar-preferencia.js  →  cria cobrança Pix no Mercado Pago
        │                 (dados do cliente vão no campo metadata)
        ▼
Link de pagamento enviado ao cliente pelo WhatsApp
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

## Pré-requisitos (contas e tokens — isso só você consegue criar)

1. **WhatsApp Business Platform (Cloud API)**, oficial da Meta:
   - Criar um app em https://developers.facebook.com/apps, adicionar o produto "WhatsApp".
   - Pegar `WHATSAPP_TOKEN` (token de acesso permanente, gerado depois de verificar o negócio) e `WHATSAPP_PHONE_NUMBER_ID` (no painel do app).
   - Definir um `WHATSAPP_VERIFY_TOKEN` (qualquer string secreta escolhida por você) e cadastrá-lo no webhook do app.
   - Isso exige verificação da empresa pela Meta — não é algo que eu consigo fazer por você.
2. **Conta Mercado Pago** com Checkout Pix habilitado e `MP_ACCESS_TOKEN` (em https://www.mercadopago.com.br/developers/panel).
3. **Conta Vercel** com `VERCEL_TOKEN` (em https://vercel.com/account/tokens).
4. **Hospedagem para este servidor** (ele precisa ficar no ar 24/7 para receber os webhooks): Railway, Render, Fly.io ou similar. Não incluído aqui — é uma conta/decisão sua.
5. Node.js 18+.

```bash
cd gerador-site-mei/automacao
npm install
```

Variáveis de ambiente necessárias:

```
WHATSAPP_TOKEN=token_do_whatsapp_cloud_api
WHATSAPP_PHONE_NUMBER_ID=id_do_numero_no_whatsapp
WHATSAPP_VERIFY_TOKEN=uma_string_secreta_escolhida_por_voce
MP_ACCESS_TOKEN=seu_token_mercado_pago
VERCEL_TOKEN=seu_token_vercel
VERCEL_TEAM_ID=            # opcional, se o projeto estiver em um time
PORT=3000
```

## Rodando

```bash
node server.js
```

Depois de hospedar (com HTTPS), configure:

- No painel do app do WhatsApp (Meta): webhook `https://seu-dominio/webhook/whatsapp`, campo `messages`, usando o mesmo `WHATSAPP_VERIFY_TOKEN`.
- No painel do Mercado Pago: webhook `https://seu-dominio/webhook/mercadopago`, evento `payment`.

## Como a conversa funciona (`lead-conversa.js`)

Quando um lead manda qualquer mensagem (ex. "oi"), o bot inicia uma conversa simples que pergunta, em sequência: nome da empresa, ramo de atividade, cidade, serviços/produtos (separados por vírgula) e e-mail (opcional). Ao final, gera automaticamente o link de pagamento e envia pelo próprio WhatsApp.

O pacote cobrado é o **Plano Básico (R$ 297)** por padrão — os preços de Intermediário e Catálogo já estão definidos em `criar-preferencia.js`, mas a escolha de pacote pelo cliente ainda não está na conversa (ver "Limitações" abaixo).

## O que ainda depende de você

- **Revisão final do site** antes de enviar o link ao cliente — por pedido explícito, o fluxo não entrega nada ao cliente sem essa revisão.
- **Criar as contas e tokens** listados em "Pré-requisitos": WhatsApp Business (exige verificação da Meta), Mercado Pago e Vercel.
- **Hospedar o servidor** em algum serviço que fique no ar — sem isso, nenhum webhook chega.
- **Domínio próprio** (upsell): associar um domínio customizado ao deploy ainda é manual pelo painel da Vercel ou via chamada adicional à API `/v10/projects/{id}/domains`.
- **Persistência real dos pedidos**: hoje usa memória (conversa em andamento) + um arquivo de log (pedidos concluídos). Em produção, troque por um banco de dados (ex. Supabase) para não perder conversas em um restart e rastrear falhas.

## Limitações conhecidas desta primeira versão

- Não valida WhatsApp/e-mail/telefone duplicado — um mesmo lead pode gerar várias cobranças se mandar "oi" de novo.
- Não oferece ao cliente escolher entre os pacotes Básico/Intermediário/Catálogo — sempre cobra o Básico.
- Não implementa limite de frequência de mensagens nem opt-out — a decisão de LGPD/anti-spam do plano do funil ainda precisa ser aplicada aqui antes de usar em produção com leads frios (hoje o fluxo é pensado para quem já chamou a empresa no WhatsApp, não para disparo em massa).
