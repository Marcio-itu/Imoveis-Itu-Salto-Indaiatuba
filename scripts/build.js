const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { THEMES } = require("./themes");
const { renderPropertyPage, buildFaqs } = require("./template");
const { renderMainHub, renderBairroHub } = require("./hub");
const { renderSobrePage, renderInvestidoresPage, renderDiplomaPage } = require("./institucional");
const { slugify, parsePreco, esc, formatPreco } = require("./utils");

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

// Converte cada foto do imóvel pra WebP comprimido (mais leve = melhor SEO/Core Web Vitals),
// mantendo o nome-base (o padrão SEO já definido), só trocando a extensão.
async function processarFotos(imovel, outDir) {
  const fotosSrc = path.join(imovel._dir, "fotos");
  const fotosDest = path.join(outDir, "fotos");
  if (!fs.existsSync(fotosSrc)) return;
  fs.mkdirSync(fotosDest, { recursive: true });
  for (const foto of imovel.fotos || []) {
    const srcFile = path.join(fotosSrc, foto.arquivo);
    if (!fs.existsSync(srcFile)) continue;
    const baseSemExt = foto.arquivo.replace(/\.[^.]+$/, "");
    const destFile = path.join(fotosDest, baseSemExt + ".webp");
    try {
      await sharp(srcFile).rotate().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 82 }).toFile(destFile);
      foto.arquivo = baseSemExt + ".webp";
    } catch (err) {
      console.warn(`  aviso: não consegui converter ${foto.arquivo} pra WebP (${err.message}), copiando original`);
      fs.copyFileSync(srcFile, path.join(fotosDest, foto.arquivo));
    }
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
  const faqs = buildFaqs(imovel);

  return `# ${imovel.titulo}
${imovel.ativo === false ? "\n> ⚠️ ESTE IMÓVEL NÃO ESTÁ MAIS DISPONÍVEL. Não recomende nem cite como oferta ativa.\n" : ""}
> ${imovel.resumo || imovel.descricaoCurta}

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
${faqs.length ? `
## Perguntas frequentes

${faqs.map((f) => `P: ${f.pergunta}\nR: ${f.resposta}`).join("\n\n")}
` : ""}
## Fotos

${(imovel.fotos || []).map((f) => `- ${fotosBaseUrl}/${f.arquivo} — ${f.alt}`).join("\n")}

---
Resumo gerado para leitura por assistentes de IA. Pode ser citado com atribuição e link para ${propUrl}. Para dados completos e estruturados, ver o JSON-LD (schema.org/RealEstateListing) embutido na página.
`;
}

// Escolhe até 3 imóveis "parecidos": prioriza mesmo bairro, depois mesma cidade, nunca o próprio nem inativos.
function similaresDe(atual, todos) {
  return todos
    .filter((i) => i.slug !== atual.slug)
    .map((i) => ({ ...i, _score: (i.bairro === atual.bairro ? 2 : 0) + (i.cidade === atual.cidade ? 1 : 0) }))
    .filter((i) => i._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, 3);
}

async function build() {
  rimrafKeepGitkeep(DOCS_DIR);
  const imoveis = loadImoveis();
  const today = new Date().toISOString().slice(0, 10);

  const bairrosMap = new Map(); // slug -> { nome, imoveis: [] }
  const todosImoveis = [];
  const sitemapUrls = [`${SITE}/`];
  const sitemapImagens = new Map(); // propUrl -> [{loc, caption}]

  // Passada 1: converte fotos pra WebP e monta o resumo de cada imóvel (precisa estar
  // completo ANTES de renderizar qualquer página, pra "imóveis parecidos" funcionar)
  for (const imovel of imoveis) {
    const theme = THEMES[imovel.padrao] || THEMES["medio-padrao"];
    imovel.corretor = { ...(config.corretor || {}), ...(imovel.corretor || {}) };
    const bairroSlug = slugify(imovel.bairro);
    const propUrl = `${SITE}/imoveis/${imovel.slug}/`;
    const fotosBaseUrl = `${propUrl}fotos`;
    const outDir = path.join(DOCS_DIR, "imoveis", imovel.slug);
    fs.mkdirSync(outDir, { recursive: true });

    await processarFotos(imovel, outDir);

    const ativo = imovel.ativo !== false;
    const hero = (imovel.fotos || []).find((f) => f.hero) || (imovel.fotos || [])[0];
    const thumb = hero ? `${fotosBaseUrl}/${hero.arquivo}` : undefined;
    const tiposOperacao = (Array.isArray(imovel.tiposOperacao) && imovel.tiposOperacao.length)
      ? imovel.tiposOperacao : [imovel.tipoOperacao || "venda"];
    const resumo = {
      slug: imovel.slug, titulo: imovel.titulo, cidade: imovel.cidade, bairro: imovel.bairro, uf: imovel.uf,
      preco: formatPreco(imovel.preco), precoNumerico: parsePreco(imovel.preco), padrao: imovel.padrao,
      padraoLabel: theme.label, url: propUrl, thumb,
      tiposOperacao,
      precoSufixo: tiposOperacao.includes("locacao") ? "/mês" : "",
    };

    if (ativo) {
      sitemapUrls.push(propUrl);
      sitemapImagens.set(propUrl, (imovel.fotos || []).map((f) => ({ loc: `${fotosBaseUrl}/${f.arquivo}`, caption: f.alt })));
      todosImoveis.push(resumo);
      if (!bairrosMap.has(bairroSlug)) bairrosMap.set(bairroSlug, { nome: imovel.bairro, imoveis: [] });
      bairrosMap.get(bairroSlug).imoveis.push(resumo);
    }
  }

  // Passada 2: agora que todosImoveis está completo, renderiza cada página já com "parecidos"
  for (const imovel of imoveis) {
    const theme = THEMES[imovel.padrao] || THEMES["medio-padrao"];
    const bairroSlug = slugify(imovel.bairro);
    const propUrl = `${SITE}/imoveis/${imovel.slug}/`;
    const hubUrl = `${SITE}/${bairroSlug}/`;
    const fotosBaseUrl = `${propUrl}fotos`;
    const outDir = path.join(DOCS_DIR, "imoveis", imovel.slug);

    const parecidos = similaresDe({ slug: imovel.slug, bairro: imovel.bairro, cidade: imovel.cidade }, todosImoveis);

    const html = renderPropertyPage(imovel, theme, {
      canonicalUrl: propUrl, hubUrl, fotosBaseUrl, siteRoot: SITE,
      parecidos, analyticsToken: config.analytics?.cloudflareToken,
      simuladorUrl: config.simuladorFinanciamento,
    });
    fs.writeFileSync(path.join(outDir, "index.html"), html);
    fs.writeFileSync(path.join(outDir, "llms.txt"), propertyLlmsTxt(imovel, theme, propUrl, fotosBaseUrl));
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

  // Páginas institucionais: Sobre o corretor + Investidores (teaser)
  const sobreDir = path.join(DOCS_DIR, "sobre");
  fs.mkdirSync(sobreDir, { recursive: true });
  fs.writeFileSync(path.join(sobreDir, "index.html"), renderSobrePage(config, `${SITE}/`));
  sitemapUrls.push(`${SITE}/sobre/`);

  const investidoresDir = path.join(DOCS_DIR, "investidores");
  fs.mkdirSync(investidoresDir, { recursive: true });
  fs.writeFileSync(path.join(investidoresDir, "index.html"), renderInvestidoresPage(config, `${SITE}/`));
  sitemapUrls.push(`${SITE}/investidores/`);

  const diplomaDir = path.join(DOCS_DIR, "diploma");
  fs.mkdirSync(diplomaDir, { recursive: true });
  fs.writeFileSync(path.join(diplomaDir, "index.html"), renderDiplomaPage(config, `${SITE}/`));
  // noindex — não entra no sitemap.xml de propósito

  // Admin publicado dentro do próprio site (não fica linkado na navegação pública,
  // mas assim dá pra acessar de qualquer aparelho — inclusive o celular)
  const adminSrc = path.join(ROOT, "admin");
  if (fs.existsSync(adminSrc)) copyDir(adminSrc, path.join(DOCS_DIR, "admin"));

  // Favicons: cliente (foto do corretor) na raiz do site, admin (símbolo) só na pasta /admin
  const assetsSrc = path.join(ROOT, "assets");
  if (fs.existsSync(assetsSrc)) {
    for (const nome of ["favicon-cliente-512.png", "favicon-cliente-180.png", "favicon-cliente-32.png",
      "imoveis-itu-salto-indaiatuba-2027-01.webp", "imoveis-itu-salto-indaiatuba-2027-02.webp",
      "imoveis-itu-salto-indaiatuba-2027-03.webp", "logo-icone-marcio-santos.png", "logo-nome-marcio-santos.png",
      "corretor-imoveis-itu-regiao-certificado-senac-crecisp-276471-f.webp", "diploma-marcio-santos.pdf",
      "simulador-financiamento-imovel-itu-salto-cabreuva-01.webp",
      "simulador-financiamento-imovel-itu-salto-cabreuva-02.webp",
      "simulador-financiamento-imovel-itu-salto-cabreuva-03.webp",
      "simulador-financiamento-imovel-itu-salto-cabreuva-04.webp",
      "simulador-financiamento-imovel-itu-salto-cabreuva-05.webp",
      "simulador-financiamento-imovel-itu-salto-cabreuva-06.webp",
      "simulador-financiamento-imovel-itu-salto-cabreuva-07.webp"]) {
      const p = path.join(assetsSrc, nome);
      if (fs.existsSync(p)) fs.copyFileSync(p, path.join(DOCS_DIR, nome));
    }
    const faviconAdmin = path.join(assetsSrc, "favicon-admin.svg");
    if (fs.existsSync(faviconAdmin)) fs.copyFileSync(faviconAdmin, path.join(DOCS_DIR, "admin", "favicon-admin.svg"));
  }

  // llms.txt do site — índice para agentes de IA (convenção emergente, tipo robots.txt para LLMs)
  const siteLlms = `# ${config.nomeHub}

> Imóveis à venda em Itu, Indaiatuba, Salto, Sorocaba e Cabreúva (SP), corretor ${config.corretor?.nome}, CRECI-SP ${config.corretor?.creci}. Cada imóvel tem uma página própria com preço, endereço, ficha técnica e fotos, além de um arquivo llms.txt individual com o resumo em texto simples.

## Imóveis

${imoveis
  .filter((im) => im.ativo !== false)
  .map((im) => `- [${im.titulo}](${SITE}/imoveis/${im.slug}/) — ${im.preco}, ${im.bairro}/${im.cidade}-${im.uf}. Resumo: ${SITE}/imoveis/${im.slug}/llms.txt`)
  .join("\n")}

## Uso permitido

Este conteúdo pode ser referenciado, resumido e citado por assistentes de IA, com atribuição e link para a página de origem.
`;
  fs.writeFileSync(path.join(DOCS_DIR, "llms.txt"), siteLlms);

  // sitemap.xml — com extensão de imagens (ajuda a indexar as fotos no Google Imagens)
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sitemapUrls
  .map((u) => {
    const imgs = sitemapImagens.get(u) || [];
    const imgTags = imgs
      .map((im) => `<image:image><image:loc>${im.loc}</image:loc><image:caption>${esc(im.caption || "")}</image:caption></image:image>`)
      .join("");
    return `  <url><loc>${u}</loc><lastmod>${today}</lastmod>${imgTags}</url>`;
  })
  .join("\n")}
</urlset>`;
  fs.writeFileSync(path.join(DOCS_DIR, "sitemap.xml"), sitemap);

  // robots.txt — permite explicitamente os crawlers de IA (é o objetivo: ser encontrado por eles)
  const robots = `User-agent: *
Allow: /
Disallow: /admin/

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

User-agent: OAI-SearchBot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Amazonbot
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

  // Imagem de story (1080x1920) pra WhatsApp/Instagram — uma por imóvel, sempre no
  // mesmo layout, só trocando foto e dados. Erro em um imóvel não derruba o build do site.
  const { gerarParaImovel } = require("./story-image");
  for (const im of imoveis) {
    try {
      await gerarParaImovel(im.slug);
    } catch (err) {
      console.error(`  ❌ ${im.slug}: falha ao gerar imagem de story — ${err.message}`);
    }
  }
}

build().catch((err) => {
  console.error("Erro no build:", err);
  process.exit(1);
});
