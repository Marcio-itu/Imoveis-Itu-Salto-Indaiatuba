# Gerador de páginas de imóveis

Sistema estático (sem Netlify, só Git) que gera páginas de imóvel sofisticadas
a partir de um arquivo de dados + fotos. 3 diagramações diferentes por padrão
do imóvel (alto / médio / popular) — cores, tamanho do hero e ordem das
seções mudam automaticamente. Já sai pronto para SEO/AIO: JSON-LD,
sitemap.xml, robots.txt liberando crawlers de IA e um `llms.txt` por imóvel.

## Como adicionar um imóvel

**Opção A — pelo admin (recomendado, poucos cliques):**

1. Abra `admin/index.html` no Chrome (2 cliques: baixe o arquivo, dê duplo clique)
2. Marque o padrão, preencha ou fale os dados, suba as fotos e classifique
   cada uma (dropdown de ambiente + marque a "hero")
3. Copie o "prompt pronto" e cole numa conversa com o Claude para polir a
   descrição (cole a resposta de volta no campo "Descrição final")
4. Clique em "Baixar pacote do imóvel" → baixa um `.zip` já com
   `dados.json` + `fotos/` renomeadas certinho
5. Descompacte dentro de `imoveis/` e faça commit + push

**Opção B — manual:**

1. Crie uma pasta em `imoveis/nome-do-imovel/`
2. Coloque as fotos (já renomeadas — ver `NOMENCLATURA-FOTOS.md`) em
   `imoveis/nome-do-imovel/fotos/`
3. Copie `imoveis/casa-praia-preta/dados.json` como modelo e preencha
4. Rode `node scripts/build.js` — gera tudo em `/docs`
5. Commit + push

O admin roda 100% no seu navegador — nenhuma foto ou dado sai da sua
máquina antes de você decidir baixar o zip e commitar. A única etapa
manual hoje é colar o texto numa conversa com o Claude para polir a
descrição (o classificador de fotos por IA e a publicação automática via
API entram na próxima fase — ver roteiro abaixo).

## Estrutura gerada em /docs

```
docs/
  index.html              → hub principal (bairros)
  llms.txt                → índice para IAs
  robots.txt / sitemap.xml
  {bairro}/index.html      → hub do bairro (seu "linktree" próprio)
  imoveis/{slug}/index.html
  imoveis/{slug}/llms.txt  → resumo em texto simples para IAs
  imoveis/{slug}/fotos/
```

## Dados de contato

Nome, CRECI, telefone, WhatsApp, e-mail e Instagram ficam em `config.json`
(`corretor`) e são aplicados automaticamente em toda página gerada — não
precisa repetir em cada imóvel. Se algum imóvel precisar de um contato
diferente, adicione um bloco `corretor` no `dados.json` dele só para
sobrescrever o padrão.

## Classificação de fotos por IA (admin)

O admin tem um botão "Classificar fotos com IA" que manda todas as fotos
de uma vez para a API da Anthropic (com uma chave que você cola na hora,
só na memória da aba) e recebe de volta o ambiente de cada foto + qual é
a melhor hero. Os dropdowns continuam editáveis depois — é sugestão, não
publicação automática sem revisão. É uma chamada paga na sua conta
Anthropic (custo baixo, um lote só por imóvel).

## Publicar no GitHub Pages com domínio próprio

1. Repositório → Settings → Pages → Source: branch `main`, pasta `/docs`
2. Edite `config.json`, campo `dominio`, com o seu domínio real
3. Configure o DNS do seu domínio apontando para o GitHub Pages
   (registro `A` para os IPs do GitHub Pages, ou `CNAME` se for subdomínio)
4. O build já gera o arquivo `CNAME` sozinho a partir do `config.json`

## Automação (`.github/workflows/build-docs.yml`)

Toda vez que você alterar algo em `imoveis/`, o GitHub Actions já roda o
build e commita `/docs` sozinho — você só mexe nos dados, nunca precisa
rodar `node scripts/build.js` na mão (mas pode, se preferir).

## Roteiro para as próximas fases (ainda não construído)

- **Admin com voz + checkboxes**: tela onde você grava um áudio
  ("casa médio padrão em Salto, 3 quartos, 1 suíte..."), o áudio vira texto,
  e a IA distribui o texto nos campos certos — com checkboxes para os campos
  categóricos (padrão, cidade, financiamento) que são mais rápidos de marcar
  do que de falar.
- **Classificação automática de fotos**: a IA olha as fotos, escolhe a hero
  e sugere o nome de arquivo (ver prompt em `NOMENCLATURA-FOTOS.md`).
- **Publicação em 1 clique**: commit automático no GitHub via API.
- **Compartilhamento em redes sociais via API**: Instagram/Facebook
  (Meta Graph API, para contas Business) e WhatsApp são os mais viáveis.
  Cada um exige cadastro de app e, no caso do WhatsApp Business API,
  aprovação de templates — não é 100% automático "de fábrica", mas dá para
  automatizar depois do cadastro inicial.

Essas quatro peças precisam de um backend com chave de API (voz→texto, IA,
GitHub, redes sociais) — o GitHub Pages sozinho não roda isso, mas o
próprio GitHub Actions (com `workflow_dispatch` e secrets) dá conta, sem
precisar de Netlify nem de outro provedor.
