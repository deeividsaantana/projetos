# Automação: pagamento → geração → publicação

Este módulo fecha o restante do funil: depois que o cliente paga via Pix (Mercado Pago), o site é gerado e publicado automaticamente na Vercel, sem intervenção manual — você só entra para revisar o resultado.

Fluxo:

```
Cliente paga (Pix / Mercado Pago)
        │
        ▼
Webhook do Mercado Pago  →  server.js  (confirma pagamento aprovado)
        │
        ▼
gerar-e-publicar.js  →  gerador.js (gera o HTML/CSS)
        │
        ▼
Deploy automático na Vercel (API de Deployments)
        │
        ▼
Link do site pronto (você recebe e revisa antes de enviar ao cliente)
```

## Pré-requisitos

1. **Conta Mercado Pago** com Checkout Pix configurado e `MP_ACCESS_TOKEN` (token de produção ou teste).
2. **Conta Vercel** com um token de API (`VERCEL_TOKEN`), gerado em https://vercel.com/account/tokens.
3. Node.js 18+.

```bash
cd gerador-site-mei/automacao
npm install
```

Configure as variáveis de ambiente (ex. em um arquivo `.env` carregado pelo seu processo, ou direto no ambiente de hospedagem):

```
MP_ACCESS_TOKEN=seu_token_mercado_pago
VERCEL_TOKEN=seu_token_vercel
VERCEL_TEAM_ID=            # opcional, se o projeto estiver em um time
PORT=3000
```

## Como os dados do cliente chegam

No momento de criar a preferência de pagamento no Mercado Pago, inclua os dados do site do cliente no campo `metadata` (ou em `external_reference` apontando para um registro seu). Exemplo de criação de preferência (feito no seu fluxo de vendas, fora deste módulo):

```json
{
  "items": [{ "title": "Site para MEI - Plano Básico", "quantity": 1, "unit_price": 297 }],
  "metadata": {
    "nomeEmpresa": "Doce Sabor Confeitaria",
    "ramoAtividade": "Confeitaria e Bolos Personalizados",
    "cidade": "Campinas - SP",
    "whatsapp": "(19) 99876-5432",
    "email": "contato@docesabor.com.br",
    "slogan": "Bolos e doces artesanais feitos com amor",
    "sobre": "Confeitaria familiar com 8 anos de experiência.",
    "servicos": [
      { "nome": "Bolo personalizado", "descricao": "Sob encomenda.", "preco": "a partir de R$ 120" }
    ]
  }
}
```

O `metadata` é devolvido pela API do Mercado Pago quando o pagamento é consultado, e é exatamente esse objeto que o gerador usa (mesmo formato de `exemplo/dados-exemplo.json`).

## Rodando o webhook

```bash
node server.js
```

Configure a URL pública do seu servidor (`https://seu-dominio/webhook/mercadopago`) como webhook de notificações no painel do Mercado Pago, para o evento `payment`.

Quando um pagamento chega como **aprovado**, o servidor:

1. Busca os detalhes do pagamento na API do Mercado Pago (para confirmar o status e pegar o `metadata`).
2. Gera o site com `gerador.js`.
3. Publica a pasta gerada na Vercel via API de Deployments.
4. Registra o link final do deploy em `automacao/pedidos-processados.log` para você revisar.

## O que ainda depende de você (por desenho)

- **Revisão final do site** antes de enviar o link ao cliente — o pedido explícito é "eu entro só pra revisar", então o fluxo não envia nada ao cliente automaticamente.
- **Domínio próprio** (upsell): associar um domínio customizado ao deploy ainda é manual pelo painel da Vercel ou via chamada adicional à API `/v10/projects/{id}/domains`.
- **Persistência real dos pedidos**: este módulo usa um arquivo de log simples como exemplo. Em produção, troque por um banco de dados (ex. tabela `pedidos` no Supabase) para rastrear status, reenviar em caso de falha, etc.

## Próximo passo sugerido

Depois que este webhook estiver no ar (hospedado em algum serviço, ex. Railway, Render ou uma função serverless), ligue-o à etapa de prospecção/abordagem (WhatsApp Cloud API) já descrita no plano do funil, para fechar o ciclo completo: lead → contato → pagamento → site publicado.
