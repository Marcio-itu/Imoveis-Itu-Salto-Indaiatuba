const fs = require("fs");
const path = require("path");
const { THEMES } = require("./themes");
const { renderPropertyPage } = require("./template");
const { renderMainHub, renderBairroHub } = require("./hub");
const { slugify, parsePreco } = require("./utils");

const ROOT = path.join(__dirname, "..");
const IMOVEIS_DIR = path.join(ROOT, "imoveis");
const DOCS_DIR = path.join(ROOT, "docs");
const config = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
const SITE = config.dominio.replace(/\/$/, "");

function rimrafKeepGitkeep(dir) {
  if (!fs.existsSync(dir)) return fs.mkdirSync(dir, { recursive: true });
  for (const entry of fs.readdirSync(dir)) {
    if (entry === ".gitkeep" || entry === "CNAME") continue;
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function loadImoveis() {
  if (!fs.existsSync(IMOVEIS_DIR)) return [];
  return fs
    .readdirSync(IMOVEIS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => {
      const dir = path.join(IMOVEIS_DIR, e.name);
      const dataPath = path.join(dir, "dados.json");
      if (!fs.existsSync(dataPath)) return null;
      const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
      data.slug = data.slug || slugify(e.name);
      data._dir = dir;
      return data;
    })
    .filter(Boolean);
}

function propertyLlmsTxt(imovel, theme, propUrl, fotosBaseUrl) {
  const specsLine = [
    imovel.quartos && `${imovel.quartos} quarto(s)`,
    imovel.suites && `${imovel.suites} suíte(s)`,
    imovel.banheiros && `${imovel.banheiros} banheiro(s)`,
    imovel.vagas && `${imovel.vagas} vaga(s)`,
    imovel.areaUtil && `${imovel.areaUtil} m² de área útil`,
    imovel.areaTerreno && `${imovel.areaTerreno} m² de terreno`,
  ].filter(Boolean).join(", ");

  return `# ${imovel.titulo}

> ${imovel.descricaoCurta}

- Tipo: ${imovel.tipo}, ${theme.label}
${imovel.condominio ? `- Condomínio: ${imovel.condominio}\n` : ""}- Preço: ${imovel.preco}${imovel.financiamento ? ` (${imovel.financiamento})` : ""}
- Localização: ${imovel.bairro}, ${imovel.cidade} - ${imovel.uf}
- Características: ${specsLine}
- Diferenciais: ${(imovel.diferenciais || []).join(", ")}
- Página oficial (fonte canônica): ${propUrl}
- Corretor: ${imovel.corretor?.nome || ""}, CRECI-SP ${imovel.corretor?.creci || ""}
- Publicado em (nascimento do anúncio): ${imovel.publicadoEm}

## Descrição

${(imovel.descricaoLonga || []).join("\n\n")}

## Fotos

${(imovel.fotos || []).map((f) => `- ${fotosBaseUrl}/${f.arquivo} — ${f.alt}`).join("\n")}

---
Resumo gerado para leitura por assistentes de IA. Pode ser citado com atribuição e link para ${propUrl}. Para dados completos e estruturados, ver o JSON-LD (schema.org/RealEstateListing) embutido na página.
`;
}

function build() {
  rimrafKeepGitkeep(DOCS_DIR);
  const imoveis = loadImoveis();
  const today = new Date().toISOString().slice(0, 10);

  const bairrosMap = new Map(); // slug -> { nome, imoveis: [] }
  const todosImoveis = [];
  const sitemapUrls = [`${SITE}/`];

  for (const imovel of imoveis) {
    const theme = THEMES[imovel.padrao] || THEMES["medio-padrao"];
    imovel.corretor = { ...(config.corretor || {}), ...(imovel.corretor || {}) };
    const bairroSlug = slugify(imovel.bairro);
    const propUrl = `${SITE}/imoveis/${imovel.slug}/`;
    const hubUrl = `${SITE}/${bairroSlug}/`;
    const fotosBaseUrl = `${propUrl}fotos`;

    const outDir = path.join(DOCS_DIR, "imoveis", imovel.slug);
    fs.mkdirSync(outDir, { recursive: true });

    const fotosSrc = path.join(imovel._dir, "fotos");
    if (fs.existsSync(fotosSrc)) copyDir(fotosSrc, path.join(outDir, "fotos"));

    const html = renderPropertyPage(imovel, theme, { canonicalUrl: propUrl, hubUrl, fotosBaseUrl });
    fs.writeFileSync(path.join(outDir, "index.html"), html);
    fs.writeFileSync(path.join(outDir, "llms.txt"), propertyLlmsTxt(imovel, theme, propUrl, fotosBaseUrl));
    sitemapUrls.push(propUrl);

    const hero = (imovel.fotos || []).find((f) => f.hero) || (imovel.fotos || [])[0];
    const thumb = hero ? `${fotosBaseUrl}/${hero.arquivo}` : undefined;
    const resumo = {
      slug: imovel.slug, titulo: imovel.titulo, cidade: imovel.cidade, bairro: imovel.bairro, uf: imovel.uf,
      preco: imovel.preco, precoNumerico: parsePreco(imovel.preco), padrao: imovel.padrao,
      padraoLabel: theme.label, url: propUrl, thumb,
    };
    todosImoveis.push(resumo);

    if (!bairrosMap.has(bairroSlug)) bairrosMap.set(bairroSlug, { nome: imovel.bairro, imoveis: [] });
    bairrosMap.get(bairroSlug).imoveis.push(resumo);
  }

  // Páginas de bairro (o "linktree" próprio)
  const hubTheme = THEMES["medio-padrao"];
  for (const [slug, { nome, imoveis: lista } ] of bairrosMap) {
    const outDir = path.join(DOCS_DIR, slug);
    fs.mkdirSync(outDir, { recursive: true });
    const html = renderBairroHub(nome, lista, hubTheme, `${SITE}/`, config);
    fs.writeFileSync(path.join(outDir, "index.html"), html);
    sitemapUrls.push(`${SITE}/${slug}/`);
  }

  // Hub principal — busca por cidade, bairro e faixa de preço
  fs.writeFileSync(path.join(DOCS_DIR, "index.html"), renderMainHub(todosImoveis, hubTheme, `${SITE}/`, config));

  // Admin publicado dentro do próprio site (não fica linkado na navegação pública,
  // mas assim dá pra acessar de qualquer aparelho — inclusive o celular)
  const adminSrc = path.join(ROOT, "admin");
  if (fs.existsSync(adminSrc)) copyDir(adminSrc, path.join(DOCS_DIR, "admin"));

  // llms.txt do site — índice para agentes de IA (convenção emergente, tipo robots.txt para LLMs)
  const siteLlms = `# ${config.nomeHub}

> Imóveis à venda em Itu, Indaiatuba, Salto, Sorocaba e Cabreúva (SP), corretor ${config.corretor?.nome}, CRECI-SP ${config.corretor?.creci}. Cada imóvel tem uma página própria com preço, endereço, ficha técnica e fotos, além de um arquivo llms.txt individual com o resumo em texto simples.

## Imóveis

${imoveis
  .map((im) => `- [${im.titulo}](${SITE}/imoveis/${im.slug}/) — ${im.preco}, ${im.bairro}/${im.cidade}-${im.uf}. Resumo: ${SITE}/imoveis/${im.slug}/llms.txt`)
  .join("\n")}

## Uso permitido

Este conteúdo pode ser referenciado, resumido e citado por assistentes de IA, com atribuição e link para a página de origem.
`;
  fs.writeFileSync(path.join(DOCS_DIR, "llms.txt"), siteLlms);

  // sitemap.xml
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(DOCS_DIR, "sitemap.xml"), sitemap);

  // robots.txt — permite explicitamente os crawlers de IA (é o objetivo: ser encontrado por eles)
  const robots = `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: CCBot
Allow: /

Sitemap: ${SITE}/sitemap.xml

# Resumo em texto simples para agentes de IA:
# ${SITE}/llms.txt
`;
  fs.writeFileSync(path.join(DOCS_DIR, "robots.txt"), robots);

  // CNAME só existe quando for domínio próprio de verdade — nunca para a URL padrão do GitHub Pages
  if (!SITE.includes("SEU-DOMINIO") && !SITE.includes("github.io")) {
    fs.writeFileSync(path.join(DOCS_DIR, "CNAME"), SITE.replace(/^https?:\/\//, ""));
  }

  console.log(`Build ok: ${imoveis.length} imóvel(is), ${bairrosMap.size} bairro(s) -> /docs`);
}

build();
