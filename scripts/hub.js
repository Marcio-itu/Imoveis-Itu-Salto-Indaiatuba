const { esc } = require("./utils");

// Hub usa sempre a paleta "médio padrão": é vitrine neutra, não deve
// competir visualmente com o padrão de cada imóvel listado.
function hubCss(t) {
  return `
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:${t.bg};color:${t.ink};font-family:${t.fonts.body};line-height:1.55}
  .wrap{max-width:760px;margin:0 auto;padding:64px 24px}
  h1{font-family:${t.fonts.display};font-weight:500;font-size:clamp(28px,5vw,40px);margin-bottom:8px}
  p.sub{color:${t.inkMuted};margin-bottom:40px}
  .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${t.accent};font-weight:600}
  a.item{display:block;background:${t.surface};border:1px solid ${t.border};border-radius:${t.radius};
    padding:18px 22px;margin-bottom:12px;text-decoration:none;color:${t.ink};transition:border-color .2s}
  a.item:hover{border-color:${t.accent}}
  a.item .tit{font-family:${t.fonts.display};font-size:19px}
  a.item .meta{font-size:13px;color:${t.inkMuted};margin-top:4px}
  footer{margin-top:56px;font-size:13px;color:${t.inkMuted}}
  `;
}

function renderMainHub(bairros, theme, siteUrl, config) {
  const nomeHub = config?.nomeHub || "Inteligência Imobiliária";
  const creci = config?.corretor?.creci ? `CRECI-SP ${config.corretor.creci}` : "";
  const cidades = config?.regiao?.cidadesAtendidas || [];
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: config?.corretor?.nome,
    url: siteUrl,
    telephone: config?.corretor?.telefone,
    email: config?.corretor?.email,
    ...(config?.corretor?.instagram ? { sameAs: [config.corretor.instagram] } : {}),
    areaServed: cidades.map((c) => ({ "@type": "City", name: c, containedInPlace: { "@type": "State", name: config?.regiao?.uf === "SP" ? "São Paulo" : config?.regiao?.uf } })),
    address: { "@type": "PostalAddress", addressLocality: config?.regiao?.cidadePrincipal, addressRegion: config?.regiao?.uf, addressCountry: "BR" },
  };
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Imóveis por bairro — ${esc(nomeHub)}</title>
<meta name="description" content="Imóveis à venda em ${esc(cidades.join(", "))}, incluindo casas em condomínio no interior de São Paulo.">
<link rel="canonical" href="${esc(siteUrl)}">
<meta name="robots" content="index, follow">
<meta name="geo.region" content="BR-${esc(config?.regiao?.uf || "SP")}">
<meta name="geo.placename" content="${esc(config?.regiao?.cidadePrincipal || "")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(orgLd)}</script>
<style>${hubCss(theme)}</style>
</head>
<body>
<div class="wrap">
  <span class="eyebrow">${esc(nomeHub)}</span>
  <h1>Imóveis por bairro</h1>
  <p class="sub">${esc(cidades.join(", "))}</p>
  ${bairros
    .map(
      (b) => `<a class="item" href="./${esc(b.slug)}/">
      <div class="tit">${esc(b.nome)}</div>
      <div class="meta">${b.count} imóvel${b.count === 1 ? "" : "eis"}</div>
    </a>`
    )
    .join("")}
  <footer>${esc(creci)}</footer>
</div>
</body>
</html>`;
}

function renderBairroHub(bairroNome, imoveis, theme, hubUrl, config) {
  const nomeHub = config?.nomeHub || "Inteligência Imobiliária";
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Imóveis em ${esc(bairroNome)} — ${esc(nomeHub)}</title>
<meta name="description" content="Imóveis à venda em ${esc(bairroNome)}.">
<meta name="robots" content="index, follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>${hubCss(theme)}</style>
</head>
<body>
<div class="wrap">
  <span class="eyebrow"><a href="${esc(hubUrl)}" style="color:inherit">← Todos os bairros</a></span>
  <h1>${esc(bairroNome)}</h1>
  <p class="sub">${imoveis.length} imóvel${imoveis.length === 1 ? "" : "eis"} disponíve${imoveis.length === 1 ? "l" : "is"}</p>
  ${imoveis
    .map(
      (im) => `<a class="item" href="../imoveis/${esc(im.slug)}/">
      <div class="tit">${esc(im.titulo)}</div>
      <div class="meta">${esc(im.preco)} · ${esc(im.padraoLabel)}</div>
    </a>`
    )
    .join("")}
</div>
</body>
</html>`;
}

module.exports = { renderMainHub, renderBairroHub };
