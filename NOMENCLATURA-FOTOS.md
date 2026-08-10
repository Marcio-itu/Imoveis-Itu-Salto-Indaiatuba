# Nomenclatura inteligente de fotos

Padrão de nome de arquivo (tudo minúsculo, sem acento, separado por hífen):

```
{ambiente}-{tipo-imovel}-{padrao}-{cidade}-{uf}[-{diferencial}]-{data}[-{sequencia}].jpg
```

Exemplo real:
```
fachada-casa-padrao-popular-itu-sp-financiamento-caixa-20260728.jpg
suite-master-apartamento-alto-padrao-indaiatuba-sp-20260728-02.jpg
```

## Vocabulário de ambientes (use sempre um destes)

fachada, fachada-noturna, sala-estar, sala-jantar, cozinha, lavabo, suite-master,
quarto, banheiro, area-lazer, piscina, churrasqueira, quintal, varanda, sacada,
vista, vista-mar, garagem, planta-baixa, entorno-bairro, vista-aerea

## Padrão (obrigatório, um dos três)

`alto-padrao` · `medio-padrao` · `padrao-popular`

## Diferencial (opcional — no máximo 1 por foto)

Só inclua se for verdadeiro para aquele imóvel específico: `financiamento-caixa`,
`mcmv`, `vista-mar`, `aceita-permuta`. Não empilhe vários — isso parece
keyword-stuffing para o Google e para as IAs, e derruba a confiança no anúncio
em vez de ajudar.

## Texto alternativo (alt text)

O alt text NÃO deve ser igual ao nome do arquivo — deve ser uma frase natural,
gerada a partir dos mesmos dados:
> "Fachada da casa padrão popular à venda em Itu, SP, com financiamento Caixa disponível"

## Como automatizar com IA (próximo passo)

Quando o passo de visão computacional entrar no pipeline, este é o prompt-base
para o modelo classificar um lote de fotos e devolver o nome final:

```
Você recebe fotos de um imóvel. Para cada foto, identifique o ambiente
(usando SOMENTE o vocabulário: fachada, sala-estar, sala-jantar, cozinha,
suite-master, quarto, banheiro, area-lazer, piscina, quintal, varanda,
vista-mar, garagem). Aponte também qual foto é a melhor "hero" (a que
melhor representa o imóvel — iluminação, enquadramento, apelo visual).
Devolva JSON: [{"arquivo_original":"IMG_001.jpg","ambiente":"...",
"hero":true/false,"alt":"frase natural em português"}]. Não invente
características que não estão visíveis na foto.
```

O nome final é montado por código a partir do `ambiente` retornado +
tipo/padrão/cidade/UF/data que o Marcio já informou — a IA nunca decide
sozinha o padrão ou a cidade, só classifica o que vê na foto.
