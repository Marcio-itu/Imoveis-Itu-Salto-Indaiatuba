# Gerador de páginas de imóveis

Sistema estático (sem Netlify, só Git + GitHub Pages) que gera páginas de
imóvel a partir de um arquivo de dados + fotos. 3 diagramações diferentes por
padrão do imóvel (alto / médio / popular) — cores, tamanho do hero e ordem
das seções mudam automaticamente. Sai pronto para SEO/AIO: JSON-LD,
sitemap.xml com imagens, robots.txt liberando crawlers de IA, e um `llms.txt`
por imóvel.

## Como adicionar/editar um imóvel

Tudo é feito pelo **admin**, direto do navegador (funciona no celular
também) — não precisa clonar o repositório nem rodar nada localmente:

`<seu-domínio>/admin/` — ex.: `https://www.imoveis-itu-salto.com.br/admin/`
(não tem link visível na navegação pública do site, mas a URL funciona —
vale salvar como atalho na tela inicial do celular)

1. Cole um fine-grained PAT do GitHub com permissão de escrita no
   repositório (fica só na memória da aba, nunca é salvo em lugar nenhum).
2. Marque o padrão do imóvel, preencha os dados, dite ou digite uma
   transcrição livre e use "Gerar copy com IA" (Gemini) pra montar os textos.
3. Suba as fotos. Marque qual é a "hero" (capa) e quais vão pras **redes
   sociais** (📱, no máximo 10 — essas mesmas fotos, na mesma ordem, viram o
   carrossel do Instagram e o vídeo reel). O nome de cada arquivo se completa
   sozinho conforme você preenche os campos — ver `NOMENCLATURA-FOTOS.md`.
4. Duas opções de botão:
   - **💾 Salvar rascunho** — grava no repositório com `rascunho:true`
     (nunca aparece no site nem é postado em rede social) e gera um link de
     prévia (`/previews/{slug}/`) pra mandar pro cliente aprovar antes.
   - **☁️ Publicar GitHub e Redes** — comita direto na `main`, o GitHub
     Actions builda o site, gera o vídeo reel (se marcado) e posta
     automaticamente no Instagram.

Não existe mais um fluxo de "baixar zip e descompactar na mão" — o admin
publica direto no repositório via API do GitHub.

## Estrutura gerada em /docs

```
docs/
  index.html               → hub principal (busca por cidade/bairro/preço)
  llms.txt                 → índice para IAs
  robots.txt / sitemap.xml → sitemap já com <image:image>
  admin/                   → o próprio painel admin, publicado junto
  {bairro}/index.html      → hub do bairro
  imoveis/{slug}/index.html
  imoveis/{slug}/llms.txt  → resumo em texto simples para IAs
  imoveis/{slug}/fotos/    → WebP comprimido (qualidade 82%, máx. 2000px)
  imoveis/{slug}/reel.mp4  → vídeo vertical (se gerarVideo !== false)
  previews/{slug}/         → rascunhos, fora do sitemap e da busca
```

`docs/` é sempre reconstruído do zero a cada build — nunca edite nada lá
direto, é sobrescrito no próximo commit.

## Vídeo reel automático

Gerado com ffmpeg (Ken Burns + crossfade + trilha sonora + card de
encerramento com CTA de WhatsApp) a partir das fotos marcadas "redes
sociais" no admin, na ordem em que aparecem na galeria. Pra manter os
builds rápidos, o `reel.mp4` de um imóvel só é **regenerado de verdade**
quando esse imóvel muda de fato nesse commit (o workflow detecta isso via
`git diff`) — os demais mantêm o vídeo já pronto, sem gastar tempo de CI
regerando o que não mudou. Desmarque "Gerar vídeo reel automático" no
admin pra um imóvel específico se as fotos dele não renderem bem em
formato vertical.

## Publicação automática em redes sociais

Ver `SOCIAL-SETUP.md` — publica no Instagram (@corretor_marcio_itu) via
Meta Graph API, automaticamente, logo depois do build no GitHub Actions.

## Dados de contato

Nome, CRECI, telefone, WhatsApp, e-mail e Instagram ficam em `config.json`
(`corretor`) e são aplicados automaticamente em toda página gerada. Se
algum imóvel precisar de um contato diferente, adicione um bloco
`corretor` no `dados.json` dele só pra sobrescrever o padrão.

## Imóveis parecidos

Cada página de imóvel mostra até 3 imóveis parecidos no fim (antes do
contato) — prioriza o mesmo bairro, depois a mesma cidade. Só aparecem
imóveis ativos. Automático, não precisa configurar nada.

## Analytics (opcional, sem cookies)

Preparado para o Cloudflare Web Analytics — gratuito, sem cookies, não
precisa migrar domínio pra Cloudflare.

1. Crie uma conta gratuita em [dash.cloudflare.com](https://dash.cloudflare.com) → Web Analytics
2. Adicione seu site e copie o token gerado
3. Cole em `config.json` → `analytics.cloudflareToken`
4. Rode o build de novo — o script aparece em todas as páginas sozinho

Deixe o campo vazio pra não carregar nada (padrão atual).

## Publicar no GitHub Pages com domínio próprio

1. Repositório → Settings → Pages → Source: branch `main`, pasta `/docs`
2. Edite `config.json`, campo `dominio`, com o seu domínio real
3. Configure o DNS do seu domínio apontando para o GitHub Pages
   (registro `A` para os IPs do GitHub Pages, ou `CNAME` se for subdomínio)
4. O build já gera o arquivo `CNAME` sozinho a partir do `config.json`

## Automação (`.github/workflows/build-docs.yml`)

Todo push que muda algo em `imoveis/` (ou `config.json`/`scripts/`) já roda
o build e o publish-instagram sozinho — não precisa rodar nada na mão.

## Rodando localmente (opcional, só pra testar antes de commitar)

```
npm install       # instala o sharp (conversão de imagem)
node scripts/build.js               # build completo
node scripts/build.js --only=slug-do-imovel   # força regerar o reel só desse imóvel
```

Precisa de `ffmpeg` instalado na máquina pra gerar o vídeo reel — sem ele,
o build continua funcionando normalmente, só pula a geração do vídeo com
um aviso no console.
