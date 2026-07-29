const { esc } = require("./utils");

function css(t) {
  return `
  :root{
    --bg:${t.bg}; --surface:${t.surface}; --surface-alt:${t.surfaceAlt};
    --ink:${t.ink}; --ink-muted:${t.inkMuted};
    --accent:${t.accent}; --accent-2:${t.accentSecondary};
    --border:${t.border}; --radius:${t.radius};
  }
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background:var(--bg);color:var(--ink);font-family:${t.fonts.body};line-height:1.55;
    -webkit-font-smoothing:antialiased}
  img{max-width:100%;display:block}
  a{color:inherit}
  .wrap{max-width:1120px;margin:0 auto;padding:0 24px}
  .eyebrow{font-size:12px;letter-spacing:${t.eyebrowLetterSpacing};text-transform:uppercase;color:var(--accent);font-weight:600}
  h1,h2,h3{font-family:${t.fonts.display};font-weight:${t.displayWeight};letter-spacing:${t.displayLetterSpacing};line-height:1.08}
  h1{font-size:clamp(34px,6vw,64px)}
  h2{font-size:clamp(24px,3.6vw,34px);margin-bottom:20px}
  p.lead{font-size:19px;color:var(--ink-muted);max-width:62ch}

  header.topbar{position:absolute;top:0;left:0;right:0;z-index:5;padding:22px 0}
  header.topbar .wrap{display:flex;justify-content:space-between;align-items:center}
  .brand{font-family:${t.fonts.display};font-size:15px;letter-spacing:0.04em;color:#fff;text-decoration:none;
    text-shadow:0 1px 6px rgba(0,0,0,.5)}
  .back{font-size:13px;color:#fff;text-decoration:none;opacity:.85;text-shadow:0 1px 6px rgba(0,0,0,.5)}

  body{${t.stickyCta ? "padding-bottom:76px;" : ""}}
  .hero{position:relative;min-height:${t.heroVh}vh;display:flex;align-items:flex-end;background:#000}
  .hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.82}
  .hero::after{content:"";position:absolute;inset:0;
    background:linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.1) 40%,rgba(0,0,0,.75) 100%)}
  .hero-content{position:relative;z-index:2;padding:64px 0 48px;color:#fff;width:100%}
  .hero-content h1{color:#fff;text-shadow:0 2px 20px rgba(0,0,0,.35)}
  .plaqueta{display:inline-flex;gap:10px;align-items:center;background:rgba(255,255,255,.08);
    border:1px solid rgba(255,255,255,.35);backdrop-filter:blur(6px);padding:8px 14px;border-radius:var(--radius);
    font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#fff;margin-bottom:18px}
  .plaqueta b{color:var(--accent)}
  .hero-meta{display:flex;flex-wrap:wrap;gap:24px;margin-top:22px;font-size:14px;color:rgba(255,255,255,.85)}
  .preco{font-family:${t.fonts.display};font-size:clamp(22px,3vw,30px);color:#fff;margin-top:14px}

  section{padding:72px 0;border-bottom:1px solid var(--border)}
  .tags{display:flex;flex-wrap:wrap;gap:10px}
  .tag{border:1px solid var(--border);background:var(--surface);padding:9px 16px;border-radius:var(--radius);font-size:14px}
  .tag b{color:var(--accent)}

  .ficha{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;background:var(--border);
    border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
  .ficha div{background:var(--surface);padding:22px 18px}
  .ficha .num{font-family:${t.fonts.display};font-size:28px;display:block}
  .ficha .lbl{font-size:12px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:.08em}

  .galeria{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .galeria figure{margin:0;overflow:hidden;border-radius:var(--radius);background:var(--surface);
    box-shadow:0 2px 10px rgba(0,0,0,.08);transition:box-shadow .25s ease}
  .galeria a:hover figure{box-shadow:0 6px 20px rgba(0,0,0,.14)}
  .galeria img{aspect-ratio:4/3;object-fit:cover;transition:transform .35s ease}
  .galeria a:hover img{transform:scale(1.04)}
  @media (max-width:720px){.galeria{grid-template-columns:repeat(2,1fr)}}

  .contato{background:var(--surface-alt)}
  .cta{display:inline-block;background:var(--accent);color:#fff;padding:16px 30px;border-radius:var(--radius);
    text-decoration:none;font-weight:600;font-size:15px}
  .cta:hover{opacity:.92}
  .corretor{margin-top:26px;font-size:14px;color:var(--ink-muted)}

  footer{padding:36px 0;font-size:13px;color:var(--ink-muted)}
  footer a{color:var(--ink-muted)}

  .sticky-cta{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);
    border-top:1px solid var(--border);padding:12px 20px;display:flex;justify-content:space-between;
    align-items:center;gap:14px;box-shadow:0 -6px 18px rgba(0,0,0,.08)}
  .sticky-cta .preco-mini{font-family:${t.fonts.display};font-size:17px}
  .sticky-cta .cta{padding:11px 20px;font-size:14px}
  `;
}

function jsonLd(imovel, canonicalUrl, imagesUrls) {
  const precoNumerico = Number(String(imovel.preco).replace(/[^\d]/g, "")) || undefined;
  const data = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: imovel.titulo,
    description: imovel.descricaoCurta,
    url: canonicalUrl,
    datePosted: imovel.publicadoEm,
    image: imagesUrls,
    address: {
      "@type": "PostalAddress",
      streetAddress: imovel.bairro,
      addressLocality: imovel.cidade,
      addressRegion: imovel.uf,
      addressCountry: "BR",
    },
    ...(imovel.geo ? { geo: { "@type": "GeoCoordinates", latitude: imovel.geo.lat, longitude: imovel.geo.lng } } : {}),
    numberOfRooms: imovel.quartos,
    numberOfBathroomsTotal: imovel.banheiros,
    ...(imovel.areaUtil ? { floorSize: { "@type": "QuantitativeValue", value: imovel.areaUtil, unitCode: "MTK" } } : {}),
    offers: {
      "@type": "Offer",
      price: precoNumerico,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    ...(imovel.corretor
      ? { seller: { "@type": "RealEstateAgent", name: imovel.corretor.nome, telephone: imovel.corretor.telefone || imovel.corretor.whatsapp, email: imovel.corretor.email } }
      : {}),
    ...(imovel.condominio
      ? { additionalProperty: { "@type": "PropertyValue", name: "Condomínio", value: imovel.condominio } }
      : {}),
  };
  return JSON.stringify(data);
}

function renderPropertyPage(imovel, theme, opts) {
  const { canonicalUrl, hubUrl, fotosBaseUrl } = opts;
  const fotos = imovel.fotos || [];
  const hero = fotos.find((f) => f.hero) || fotos[0] || {};
  const imagesUrls = fotos.map((f) => `${fotosBaseUrl}/${f.arquivo}`);

  const specs = [
    imovel.quartos && { num: imovel.quartos, lbl: "Quartos" },
    imovel.suites && { num: imovel.suites, lbl: "Suítes" },
    imovel.banheiros && { num: imovel.banheiros, lbl: "Banheiros" },
    imovel.vagas && { num: imovel.vagas, lbl: "Vagas" },
    imovel.areaUtil && { num: `${imovel.areaUtil} m²`, lbl: "Área útil" },
    imovel.areaTerreno && { num: `${imovel.areaTerreno} m²`, lbl: "Área terreno" },
  ].filter(Boolean);

  const whatsMsg = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${imovel.titulo}" (ref. ${imovel.referencia || imovel.slug}).`
  );
  const whatsUrl = imovel.corretor?.whatsapp
    ? `https://wa.me/${imovel.corretor.whatsapp.replace(/\D/g, "")}?text=${whatsMsg}`
    : "#";

  const tituloSeo = imovel.condominio
    ? `${imovel.titulo} — Condomínio ${imovel.condominio}, ${imovel.bairro}, ${imovel.cidade}/${imovel.uf}`
    : `${imovel.titulo} — ${imovel.bairro}, ${imovel.cidade}/${imovel.uf}`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tituloSeo)} | ${esc(theme.label)}</title>
<meta name="description" content="${esc(imovel.descricaoCurta)}">
<link rel="canonical" href="${esc(canonicalUrl)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="geo.region" content="BR-${esc(imovel.uf)}">
<meta name="geo.placename" content="${esc(imovel.cidade)}">
${imovel.geo ? `<meta name="geo.position" content="${imovel.geo.lat};${imovel.geo.lng}">\n<meta name="ICBM" content="${imovel.geo.lat}, ${imovel.geo.lng}">` : ""}

<meta property="og:type" content="website">
<meta property="og:title" content="${esc(imovel.titulo)}">
<meta property="og:description" content="${esc(imovel.descricaoCurta)}">
<meta property="og:url" content="${esc(canonicalUrl)}">
${hero.arquivo ? `<meta property="og:image" content="${esc(fotosBaseUrl)}/${esc(hero.arquivo)}">` : ""}
<meta name="twitter:card" content="summary_large_image">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,500;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${jsonLd(imovel, canonicalUrl, imagesUrls)}</script>
<style>${css(theme)}</style>
</head>
<body>
<header class="topbar">
  <div class="wrap">
    <a class="back" href="${esc(hubUrl)}">← ${esc(imovel.bairro)}</a>
    <a class="brand" href="${esc(hubUrl)}">Inteligência Imobiliária</a>
  </div>
</header>

<section class="hero" style="border:0;padding:0">
  ${hero.arquivo ? `<img src="${fotosBaseUrl}/${esc(hero.arquivo)}" alt="${esc(hero.alt || imovel.titulo)}">` : ""}
  <div class="wrap hero-content">
    <div class="plaqueta"><b>${esc(theme.label)}</b> · ${esc(imovel.cidade)}/${esc(imovel.uf)} · ref. ${esc(imovel.referencia || imovel.slug)}</div>
    <h1>${esc(imovel.titulo)}</h1>
    <div class="hero-meta">
      <span>${imovel.condominio ? `Condomínio ${esc(imovel.condominio)}, ` : ""}${esc(imovel.bairro)}, ${esc(imovel.cidade)} - ${esc(imovel.uf)}</span>
    </div>
    ${
      theme.showPriceInHero
        ? `<div class="preco">${esc(imovel.preco)}${imovel.financiamento ? ` · <span style="opacity:.85;font-size:15px">${esc(imovel.financiamento)}</span>` : ""}</div>`
        : ""
    }
  </div>
</section>

${(() => {
  const blocks = {};

  blocks.sobre = `<section id="sobre">
    <div class="wrap">
      <span class="eyebrow">Sobre o imóvel</span>
      <h2 style="margin-top:10px">${esc(imovel.tituloSecao || "Um lugar para viver")}</h2>
      ${(imovel.descricaoLonga || []).map((p) => `<p class="lead" style="margin-top:14px">${esc(p)}</p>`).join("")}
    </div>
  </section>`;

  blocks.ficha = specs.length
    ? `<section id="ficha">
    <div class="wrap">
      <span class="eyebrow">Ficha técnica</span>
      <h2 style="margin-top:10px">Características</h2>
      ${imovel.condominio ? `<p class="lead" style="margin-top:-8px;margin-bottom:18px;font-size:15px">Condomínio ${esc(imovel.condominio)}</p>` : ""}
      ${
        !theme.showPriceInHero
          ? `<p class="preco" style="color:var(--ink);margin-bottom:22px">${esc(imovel.preco)}${imovel.financiamento ? ` <span style="opacity:.7;font-size:15px;font-family:${theme.fonts.body}">· ${esc(imovel.financiamento)}</span>` : ""}</p>`
          : ""
      }
      <div class="ficha">
        ${specs.map((s) => `<div><span class="num">${esc(s.num)}</span><span class="lbl">${esc(s.lbl)}</span></div>`).join("")}
      </div>
    </div>
  </section>`
    : "";

  blocks.destaques = (imovel.diferenciais || []).length
    ? `<section id="destaques">
    <div class="wrap">
      <span class="eyebrow">Destaques</span>
      <h2 style="margin-top:10px">O que diferencia este imóvel</h2>
      <div class="tags">${imovel.diferenciais.map((d) => `<span class="tag">${esc(d)}</span>`).join("")}</div>
    </div>
  </section>`
    : "";

  blocks.galeria = fotos.length
    ? `<section id="galeria">
    <div class="wrap">
      <span class="eyebrow">Galeria</span>
      <h2 style="margin-top:10px">Fotos</h2>
      <div class="galeria">
        ${fotos
          .map(
            (f) =>
              `<a href="${fotosBaseUrl}/${esc(f.arquivo)}" target="_blank" rel="noopener">
            <figure><img src="${fotosBaseUrl}/${esc(f.arquivo)}" alt="${esc(f.alt || imovel.titulo)}" loading="lazy"></figure>
          </a>`
          )
          .join("")}
      </div>
    </div>
  </section>`
    : "";

  blocks.contato = `<section id="contato" class="contato" style="border-bottom:0">
    <div class="wrap">
      <span class="eyebrow">Contato</span>
      <h2 style="margin-top:10px">Vamos conversar sobre este imóvel?</h2>
      <a class="cta" href="${esc(whatsUrl)}" target="_blank" rel="noopener">Falar no WhatsApp</a>
      <div class="corretor">
        ${imovel.corretor?.nome ? `${esc(imovel.corretor.nome)} · ` : ""}${imovel.corretor?.creci ? `CRECI ${esc(imovel.corretor.creci)}` : ""}
        <br>${esc(imovel.endereco || `${imovel.bairro}, ${imovel.cidade} - ${imovel.uf}`)}
        <br>${imovel.corretor?.email ? `<a href="mailto:${esc(imovel.corretor.email)}">${esc(imovel.corretor.email)}</a>` : ""}${imovel.corretor?.instagram ? ` · <a href="${esc(imovel.corretor.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}
      </div>
    </div>
  </section>`;

  const order = theme.sectionOrder || ["sobre", "ficha", "destaques", "galeria", "contato"];
  return `<main>${order.map((k) => blocks[k] || "").join("\n")}</main>`;
})()}

${
  theme.stickyCta
    ? `<div class="sticky-cta">
  <span class="preco-mini">${esc(imovel.preco)}</span>
  <a class="cta" href="${esc(whatsUrl)}" target="_blank" rel="noopener">Falar no WhatsApp</a>
</div>`
    : ""
}

<footer>
  <div class="wrap">
    Inteligência Imobiliária. Construindo Confiança. · ${imovel.corretor?.creci ? `CRECI-SP ${esc(imovel.corretor.creci)}` : ""}
    ${imovel.corretor?.instagram ? `· <a href="${esc(imovel.corretor.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}
    · Nascimento: ${esc(formatDateBR(imovel.publicadoEm))}
    · <a href="${esc(hubUrl)}">Ver outros imóveis em ${esc(imovel.bairro)}</a>
  </div>
</footer>
</body>
</html>`;
}

function formatDateBR(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

module.exports = { renderPropertyPage, jsonLd };
