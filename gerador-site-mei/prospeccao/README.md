# Prospecção: achar MEIs sem site

Esse módulo automatiza a parte que mais trava a venda ativa: achar negócios
locais que ainda não têm site. Ele busca estabelecimentos no Google Places
por ramo + cidade, pega telefone/endereço de cada um e filtra só quem **não
tem o campo `website` preenchido no Google** — esse é o lead.

## O que ele NÃO faz (importante)

- **Não confirma que o CNPJ é MEI.** O Google Places não expõe CNPJ. É uma
  aproximação por porte/tipo de negócio (salão pequeno, confeitaria, loja de
  bairro etc.) — a confirmação real (MEI ou não) fica pro contato humano.
- **Não manda mensagem nenhuma automaticamente.** Gera a lista de leads com
  link direto pro WhatsApp de cada um (`wa.me/55...`), mas o primeiro contato
  é manual, pelo seu WhatsApp pessoal — ver "Por que o contato não é
  automático" abaixo.

## Pré-requisito: conta Google Cloud com Places API

1. Crie um projeto em https://console.cloud.google.com/, ative a **Places
   API** e gere uma chave de API (tem cobrança por uso, mas o Google dá
   crédito mensal gratuito que cobre um volume razoável de buscas).
2. Defina a variável de ambiente `GOOGLE_PLACES_API_KEY` com essa chave.

## Uso

```bash
cd gerador-site-mei/prospeccao
node buscar-leads.js "salão de beleza" "Campinas"
```

Isso salva `leads/salao-de-beleza-campinas.json` com, pra cada lead: nome,
telefone, link do WhatsApp, endereço, link do Google Maps, nota e número de
avaliações no Google.

Pra abrir em planilha (Excel/Sheets) e ir marcando quem já foi contatado:

```bash
node exportar-csv.js leads/salao-de-beleza-campinas.json
```

## Por que o contato não é automático

O plano original previa WhatsApp Cloud API oficial pra abordagem — mas pra
**iniciar** uma conversa (quando o lead nunca te escreveu) o WhatsApp exige
um "modelo de mensagem" pré-aprovado pela Meta, e isso depende de ter um app
de WhatsApp Business verificado — que está bloqueado porque sua conta Meta é
nova demais (mesmo motivo que já travou o canal do formulário, só que lá o
*lead* escreve primeiro, então não precisa de modelo aprovado).

Alternativas, se quiser automatizar o envio mais pra frente:

- **Esperar a conta Meta "amadurecer"** e criar o app de WhatsApp Business —
  aí sim dá pra automatizar o primeiro contato via modelo aprovado.
- **SMS** via um provedor pago (ex. Twilio) — não depende da Meta, mas tem
  custo por mensagem e exige conta/token seus.
- **E-mail frio** — o Google Places não retorna e-mail dos estabelecimentos,
  então essa lista não serve de base pra isso sem uma fonte de e-mail
  adicional.

Até uma dessas opções estar pronta, o fluxo é: gera a lista aqui, você abre
o link do WhatsApp de cada lead e manda a mensagem pessoalmente (ou copia o
texto padrão abaixo). O que já é automático no funil — depois que o lead
responde e fecha — segue sendo o de `../automacao/`: formulário ou conversa
de WhatsApp → pagamento → geração → publicação.

### Mensagem sugerida pro primeiro contato

> Oi! Vi o [nome do negócio] no Google e notei que ainda não tem um site.
> Eu crio sites profissionais pra pequenos negócios, prontos em minutos
> depois do pagamento — a partir de R$ 297 (ou R$ 39/mês). Quer ver um
> exemplo?

## Avisos (LGPD / Marco Civil)

- Os dados usados (nome do negócio, telefone, endereço) são informações
  públicas que o próprio estabelecimento publicou no Google — não é dado
  pessoal de pessoa física, é contato comercial (B2B), o que reduz bastante
  o risco em relação a disparo pra lead frio de pessoa física.
- Ainda assim, pare de contatar quem pedir, e não reutilize o mesmo número
  pra reenviar a mesma mensagem repetidamente — isso é regra de bom senso e
  também evita que seu número seja banido/denunciado no WhatsApp.
