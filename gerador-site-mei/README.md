# Gerador de Site para MEI

Gera uma landing page estática, responsiva e pronta para publicar (Vercel, Netlify ou qualquer hospedagem estática), a partir de um arquivo JSON com os dados do cliente MEI.

Faz parte do funil de venda de sites "vibecoded" a preço acessível para MEIs: o cliente fecha o pedido, você preenche os dados dele em um JSON e o gerador entrega o site em segundos.

## Requisitos

- [Node.js](https://nodejs.org/) 14 ou superior (sem dependências externas).

## Como usar

1. Crie um arquivo JSON com os dados do cliente (veja o modelo completo em [`exemplo/dados-exemplo.json`](exemplo/dados-exemplo.json)):

```json
{
  "nomeEmpresa": "Doce Sabor Confeitaria",
  "ramoAtividade": "Confeitaria e Bolos Personalizados",
  "cidade": "Campinas - SP",
  "whatsapp": "(19) 99876-5432",
  "email": "contato@docesabor.com.br",
  "slogan": "Bolos e doces artesanais feitos com amor para o seu momento especial",
  "sobre": "Texto curto sobre o negócio do cliente.",
  "corPrimaria": "#d6336c",
  "corSecundaria": "#a61e4d",
  "servicos": [
    { "nome": "Bolo personalizado", "descricao": "Descrição do serviço.", "preco": "a partir de R$ 120" }
  ]
}
```

   Campos obrigatórios: `nomeEmpresa`, `ramoAtividade`, `cidade`, `whatsapp` e `servicos` (lista com ao menos 1 item). Os demais são opcionais.

2. Rode o gerador apontando para o JSON:

```bash
node gerador.js caminho/para/dados-do-cliente.json saida
```

   O segundo argumento (`saida`) é opcional e define a pasta onde o site será gravado (padrão: `saida/`).

3. O resultado é uma pasta com `index.html` e `style.css`, pronta para publicar.

### Testar o exemplo incluso

```bash
cd gerador-site-mei
node gerador.js exemplo/dados-exemplo.json exemplo/saida
```

A página gerada fica em `exemplo/saida/index.html` — abra direto no navegador para ver o resultado.

## O que a página gerada inclui

- Cabeçalho com nome da empresa e botão de WhatsApp.
- Seção de destaque (hero) com ramo de atividade, cidade e slogan.
- Seção "Sobre" com o texto do cliente.
- Grade de serviços/produtos (nome, descrição e preço, cada um opcional de preço).
- Seção de contato com link direto para WhatsApp (já com mensagem pré-preenchida) e, se informado, e-mail.
- Botão flutuante de WhatsApp em todas as páginas.
- Layout responsivo (funciona em celular, tablet e desktop) e cores personalizáveis por cliente (`corPrimaria` / `corSecundaria`).

## Publicando o site gerado

A pasta de saída (ex.: `saida/`) contém apenas HTML/CSS estático, então pode ser publicada em qualquer hospedagem de arquivos estáticos:

### Vercel

```bash
cd saida
npx vercel --prod
```

Ou arraste a pasta `saida/` na [interface da Vercel](https://vercel.com/new).

### Netlify

```bash
cd saida
npx netlify-cli deploy --prod --dir .
```

Ou arraste a pasta `saida/` em [app.netlify.com/drop](https://app.netlify.com/drop).

## Personalizando o template

O template-base está em [`template/template.html`](template/template.html) e [`template/style.css`](template/style.css). Os marcadores `{{NOME_EMPRESA}}`, `{{SERVICOS}}` etc. são substituídos pelo script `gerador.js` a partir do JSON. Para mudar o layout padrão de todos os sites gerados, edite esses dois arquivos.

## Próximos passos sugeridos

- Integrar a geração a um webhook de pagamento (ex.: confirmação de Pix no Mercado Pago) para disparar o deploy automaticamente após o pagamento.
- Automatizar o deploy via API da Vercel/Netlify em vez do CLI manual.
- Adicionar mais variações de template por ramo de atividade (ex.: serviços, comércio, alimentação).
