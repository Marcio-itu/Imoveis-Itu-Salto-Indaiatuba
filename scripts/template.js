const { esc, formatPreco } = require("./utils");

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

  p.resumo{font-size:19px;font-weight:600;color:var(--ink);max-width:62ch;line-height:1.4}

  .faq-list{display:grid;gap:10px;max-width:72ch}
  .faq-item{border:1px solid var(--border);border-radius:var(--radius);background:var(--surface);padding:2px 18px}
  .faq-item summary{font-family:${t.fonts.body};font-size:16px;font-weight:600;padding:14px 0;cursor:pointer;
    list-style:none;display:flex;justify-content:space-between;align-items:center;gap:12px}
  .faq-item summary::-webkit-details-marker{display:none}
  .faq-item summary::after{content:"+";color:var(--accent);font-weight:400;font-size:20px;flex:none}
  .faq-item[open] summary::after{content:"–"}
  .faq-item p{font-size:15px;color:var(--ink-muted);line-height:1.5;padding-bottom:16px;margin-top:-4px}

  .contato{background:var(--surface-alt)}
  .parecidos-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px}
  a.parecido-card{display:block;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);
    overflow:hidden;text-decoration:none;color:var(--ink);transition:transform .2s,box-shadow .2s;box-shadow:0 2px 10px rgba(0,0,0,.06)}
  a.parecido-card:hover{transform:translateY(-3px);box-shadow:0 8px 22px rgba(0,0,0,.12)}
  a.parecido-card img{width:100%;aspect-ratio:4/3;object-fit:cover}
  a.parecido-card .pbody{padding:12px 14px}
  a.parecido-card .ptit{font-family:${t.fonts.display};font-size:15px;line-height:1.3}
  a.parecido-card .pmeta{font-size:12px;color:var(--ink-muted);margin-top:3px}
  a.parecido-card .ppreco{font-family:${t.fonts.display};font-size:14px;margin-top:6px}
  .cta{display:inline-block;background:#25D366;color:#fff;padding:16px 30px;border-radius:var(--radius);
    text-decoration:none;font-weight:600;font-size:15px;animation:cta-shake 5s ease-in-out infinite}
  .cta:hover{background:#1EBE5B;opacity:.92;animation-play-state:paused}
  @keyframes cta-shake{
    0%,94%,100%{transform:rotate(0)}
    95%{transform:rotate(-4deg)}
    96%{transform:rotate(4deg)}
    97%{transform:rotate(-3deg)}
    98%{transform:rotate(3deg)}
    99%{transform:rotate(0)}
  }
  @media (prefers-reduced-motion: reduce){ .cta{animation:none} }
  .cta-share{display:inline-block;margin-left:12px;color:var(--ink-muted);text-decoration:none;
    font-size:14px;border-bottom:1px solid var(--border);padding-bottom:2px}
  .cta-share:hover{color:var(--ink);border-color:var(--ink-muted)}
  .corretor{margin-top:26px;font-size:14px;color:var(--ink-muted)}

  footer{padding:36px 0;font-size:13px;color:var(--ink-muted)}
  footer a{color:var(--ink-muted)}

  .sticky-cta{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);
    border-top:1px solid var(--border);padding:12px 20px;display:flex;justify-content:space-between;
    align-items:center;gap:14px;box-shadow:0 -6px 18px rgba(0,0,0,.08)}
  .sticky-cta .preco-mini{font-family:${t.fonts.display};font-size:17px}
  .sticky-cta .cta{padding:11px 20px;font-size:14px}

  .sim-tab{position:fixed;top:50%;right:0;transform:translateY(-50%);z-index:25;
    background:var(--accent);color:#fff;text-decoration:none;
    padding:18px 9px;border-radius:12px 0 0 12px;
    display:flex;flex-direction:column;align-items:center;
    box-shadow:0 4px 16px rgba(0,0,0,.2);
    transition:transform .2s ease,padding .2s ease;
    animation:sim-tab-pulse 5s ease-in-out 3;}
  .sim-tab:hover{transform:translateY(-50%) scale(1.08);padding-right:13px}
  .sim-tab .sim-tab-label{writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);
    display:flex;flex-direction:column;align-items:center;gap:2px}
  .sim-tab .sim-tab-t{font-family:${t.fonts.body};font-size:15px;font-weight:700;letter-spacing:.05em}
  .sim-tab .sim-tab-s{font-family:${t.fonts.body};font-size:11px;font-weight:500;opacity:.85;letter-spacing:.03em}
  @keyframes sim-tab-pulse{
    0%,92%,100%{transform:translateY(-50%) scale(1)}
    4%{transform:translateY(-50%) scale(1.08)}
    8%{transform:translateY(-50%) scale(1)}
  }
  @media (prefers-reduced-motion: reduce){ .sim-tab{animation:none} }
  @media (max-width:640px){
    .sim-tab{padding:13px 7px}
    .sim-tab .sim-tab-t{font-size:13px}
    .sim-tab .sim-tab-s{font-size:10px}
  }
  `;
}

const OPERACAO_LABEL = { venda: "Venda", locacao: "Locação", permuta: "Permuta" };
const BUSINESS_FUNCTION = {
  locacao: "http://purl.org/goodrelations/v1#LeaseOut",
  permuta: "http://purl.org/goodrelations/v1#Exchange",
  venda: "http://purl.org/goodrelations/v1#Sell",
};
// Compatível com imóveis antigos que ainda tenham só "tipoOperacao" (string) em vez de "tiposOperacao" (array).
function operacoesDe(imovel) {
  if (Array.isArray(imovel.tiposOperacao) && imovel.tiposOperacao.length) return imovel.tiposOperacao;
  return [imovel.tipoOperacao || "venda"];
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
    offers: operacoesDe(imovel).map((o) => ({
      "@type": "Offer",
      price: precoNumerico,
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
      businessFunction: BUSINESS_FUNCTION[o] || BUSINESS_FUNCTION.venda,
    })),
    ...(imovel.corretor
      ? { seller: {
          "@type": "RealEstateAgent",
          name: imovel.corretor.nome,
          telephone: imovel.corretor.telefone || imovel.corretor.whatsapp,
          email: imovel.corretor.email,
          ...(imovel.corretor.creci ? { identifier: { "@type": "PropertyValue", propertyID: "CRECI-SP", value: imovel.corretor.creci } } : {}),
          ...(imovel.corretor.instagram ? { sameAs: [imovel.corretor.instagram] } : {}),
        } }
      : {}),
    ...(imovel.condominio
      ? { additionalProperty: { "@type": "PropertyValue", name: "Condomínio", value: imovel.condominio } }
      : {}),
  };
  return JSON.stringify(data);
}

function buildFaqs(imovel) {
  if (Array.isArray(imovel.perguntas) && imovel.perguntas.length) {
    return imovel.perguntas.filter((p) => p.pergunta && p.resposta);
  }
  const auto = [];
  if (imovel.condominio) {
    auto.push({ pergunta: "Em qual condomínio fica o imóvel?", resposta: `Fica no condomínio ${imovel.condominio}, bairro ${imovel.bairro}, ${imovel.cidade}/${imovel.uf}.` });
  } else {
    auto.push({ pergunta: "Em qual bairro fica o imóvel?", resposta: `Fica no bairro ${imovel.bairro}, em ${imovel.cidade}/${imovel.uf}.` });
  }
  const ops = operacoesDe(imovel);
  const opsPrincipais = ["venda", "locacao"].filter((o) => ops.includes(o));
  const temPermuta = ops.includes("permuta");
  if (opsPrincipais.length) {
    let resposta = `Este imóvel está disponível para ${opsPrincipais.map((o) => OPERACAO_LABEL[o].toLowerCase()).join(" e ")}.`;
    if (temPermuta) resposta += " Estuda-se permuta.";
    auto.push({ pergunta: "O imóvel é para venda, locação ou permuta?", resposta });
  } else if (temPermuta) {
    auto.push({ pergunta: "O imóvel aceita permuta?", resposta: "Estuda-se permuta." });
  }
  if (imovel.financiamento) {
    auto.push({ pergunta: "Aceita financiamento?", resposta: imovel.financiamento });
  }
  if (imovel.vagas) {
    auto.push({ pergunta: "Quantas vagas de garagem tem?", resposta: `${imovel.vagas} vaga${imovel.vagas > 1 ? "s" : ""} de garagem.` });
  }
  if (imovel.areaUtil) {
    auto.push({ pergunta: "Qual a área do imóvel?", resposta: `${imovel.areaUtil} m² de área útil${imovel.areaTerreno ? ` e ${imovel.areaTerreno} m² de terreno` : ""}.` });
  }
  return auto;
}

function faqLd(faqs) {
  if (!faqs.length) return null;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.pergunta,
      acceptedAnswer: { "@type": "Answer", text: f.resposta },
    })),
  });
}

function breadcrumbLd(siteRoot, hubUrl, bairro, canonicalUrl, titulo) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: `${siteRoot}/` },
      { "@type": "ListItem", position: 2, name: bairro, item: hubUrl },
      { "@type": "ListItem", position: 3, name: titulo, item: canonicalUrl },
    ],
  });
}

function renderPropertyPage(imovel, theme, opts) {
  const { canonicalUrl, hubUrl, fotosBaseUrl, siteRoot, parecidos = [], analyticsToken, simuladorUrl } = opts;
  const fotos = imovel.fotos || [];
  const hero = fotos.find((f) => f.hero) || fotos[0] || {};
  const imagesUrls = fotos.map((f) => `${fotosBaseUrl}/${f.arquivo}`);

  const specs = [
    imovel.quartos && { num: imovel.quartos, lbl: "Quartos" },
    imovel.suites && { num: imovel.suites, lbl: "Suítes" },
    imovel.banheiros && { num: imovel.banheiros, lbl: "Banheiros (Totais)" },
    imovel.vagas && { num: imovel.vagas, lbl: "Vagas" },
    imovel.areaUtil && { num: `${imovel.areaUtil} m²`, lbl: "Área útil" },
    imovel.areaTerreno && { num: `${imovel.areaTerreno} m²`, lbl: "Área terreno" },
  ].filter(Boolean);

  const opsAtivas = operacoesDe(imovel);
  const temPermuta = opsAtivas.includes("permuta");
  const operacaoLabel = ["venda", "locacao"].filter((o) => opsAtivas.includes(o)).map((o) => OPERACAO_LABEL[o]).join(" / ") || (temPermuta ? "" : "Venda");
  // Venda tem destaque sobre locação: se ambas existirem, o preço não leva sufixo "/mês".
  const precoSufixo = (opsAtivas.includes("locacao") && !opsAtivas.includes("venda")) ? "/mês" : "";

  const whatsMsg = encodeURIComponent(
    `Olá! Tenho interesse no imóvel "${imovel.titulo}" (ref. ${imovel.referencia || imovel.slug}).`
  );
  const whatsUrl = imovel.corretor?.whatsapp
    ? `https://wa.me/${imovel.corretor.whatsapp.replace(/\D/g, "")}?text=${whatsMsg}`
    : "#";
  const shareMsg = encodeURIComponent(
    `Olha esse imóvel: "${imovel.titulo}" — ${formatPreco(imovel.preco)}${precoSufixo}. ${canonicalUrl}`
  );
  const shareUrl = `https://wa.me/?text=${shareMsg}`;

  const tituloSeo = imovel.condominio
    ? `${imovel.titulo} — Condomínio ${imovel.condominio}, ${imovel.bairro}, ${imovel.cidade}/${imovel.uf}`
    : `${imovel.titulo} — ${imovel.bairro}, ${imovel.cidade}/${imovel.uf}`;

  const inativo = imovel.ativo === false;
  const faqs = buildFaqs(imovel);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(tituloSeo)} | ${esc(theme.label)}</title>
<meta name="description" content="${esc(imovel.descricaoCurta)}">
<link rel="canonical" href="${esc(canonicalUrl)}">
<meta name="robots" content="${inativo ? "noindex, nofollow" : "index, follow, max-image-preview:large"}">
<link rel="icon" type="image/png" sizes="32x32" href="${esc(siteRoot)}/favicon-cliente-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="${esc(siteRoot)}/favicon-cliente-180.png">
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
${faqs.length ? `<script type="application/ld+json">${faqLd(faqs)}</script>` : ""}
<script type="application/ld+json">${breadcrumbLd(siteRoot, hubUrl, imovel.bairro, canonicalUrl, imovel.titulo)}</script>
<style>${css(theme)}</style>
${analyticsToken ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${analyticsToken}"}'></script>` : ""}
</head>
<body>
${simuladorUrl ? `<a href="${esc(simuladorUrl)}" target="_blank" rel="noopener" class="sim-tab" aria-label="Simular financiamento deste imóvel (abre em nova aba)">
  <span class="sim-tab-label">
    <span class="sim-tab-t">SIMULE</span>
    <span class="sim-tab-s">financiamento</span>
  </span>
</a>` : ""}
${inativo ? `<div style="background:#3A3826;color:#F3EFE4;text-align:center;padding:12px 20px;font-size:14px">Este imóvel não está mais disponível para novos contatos.</div>` : ""}
<header class="topbar">
  <div class="wrap">
    <a class="back" href="${esc(hubUrl)}">← ${esc(imovel.bairro)}</a>
    <a class="brand" href="${esc(hubUrl)}">Inteligência Imobiliária</a>
  </div>
</header>

<section class="hero" style="border:0;padding:0">
  ${hero.arquivo ? `<img src="${fotosBaseUrl}/${esc(hero.arquivo)}" alt="${esc(hero.alt || imovel.titulo)}">` : ""}
  <div class="wrap hero-content">
    <div class="plaqueta"><b>${esc(theme.label)}</b>${operacaoLabel ? ` · ${esc(operacaoLabel)}` : ""} · ${esc(imovel.cidade)}/${esc(imovel.uf)} · ref. ${esc(imovel.referencia || imovel.slug)}</div>
    ${temPermuta ? `<div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:2px">Estuda-se permuta</div>` : ""}
    <h1>${esc(imovel.titulo)}</h1>
    <div class="hero-meta">
      <span>${imovel.condominio ? `Condomínio ${esc(imovel.condominio)}, ` : ""}${esc(imovel.bairro)}, ${esc(imovel.cidade)} - ${esc(imovel.uf)}</span>
    </div>
    ${
      theme.showPriceInHero
        ? `<div class="preco">${esc(formatPreco(imovel.preco))}${precoSufixo}${imovel.financiamento ? ` · <span style="opacity:.85;font-size:15px">${esc(imovel.financiamento)}</span>` : ""}</div>`
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
      <p class="resumo" style="margin-top:14px">${esc(imovel.resumo || imovel.descricaoCurta)}</p>
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
          ? `<p class="preco" style="color:var(--ink);margin-bottom:22px">${esc(formatPreco(imovel.preco))}${precoSufixo}${imovel.financiamento ? ` <span style="opacity:.7;font-size:15px;font-family:${theme.fonts.body}">· ${esc(imovel.financiamento)}</span>` : ""}</p>`
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

  blocks.parecidos = parecidos.length
    ? `<section id="parecidos">
    <div class="wrap">
      <span class="eyebrow">Você também pode gostar</span>
      <h2 style="margin-top:10px">Imóveis parecidos</h2>
      <div class="parecidos-grid">
        ${parecidos
          .map(
            (p) => `<a class="parecido-card" href="${esc(p.url)}">
          ${p.thumb ? `<img src="${esc(p.thumb)}" loading="lazy" alt="${esc(p.titulo)}">` : ""}
          <div class="pbody">
            <div class="ptit">${esc(p.titulo)}</div>
            <div class="pmeta">${esc(p.bairro)}, ${esc(p.cidade)} - ${esc(p.uf)}</div>
            <div class="ppreco">${esc(formatPreco(p.preco))}${esc(p.precoSufixo || "")}</div>
          </div>
        </a>`
          )
          .join("")}
      </div>
    </div>
  </section>`
    : "";

  blocks.faq = faqs.length
    ? `<section id="faq">
    <div class="wrap">
      <span class="eyebrow">Perguntas frequentes</span>
      <h2 style="margin-top:10px">Tire suas dúvidas</h2>
      <div class="faq-list">
        ${faqs.map((f) => `<details class="faq-item"><summary>${esc(f.pergunta)}</summary><p>${esc(f.resposta)}</p></details>`).join("")}
      </div>
    </div>
  </section>`
    : "";

  blocks.contato = `<section id="contato" class="contato" style="border-bottom:0">
    <div class="wrap">
      <span class="eyebrow">Contato</span>
      <h2 style="margin-top:10px">Vamos conversar sobre este imóvel?</h2>
      <a class="cta" href="${esc(whatsUrl)}" target="_blank" rel="noopener">Falar no WhatsApp</a>
      <a class="cta-share" href="${esc(shareUrl)}" target="_blank" rel="noopener">↗ Enviar este imóvel pra alguém</a>
      <div class="corretor">
        ${imovel.corretor?.nome ? `${esc(imovel.corretor.nome)} · ` : ""}${imovel.corretor?.creci ? `CRECI ${esc(imovel.corretor.creci)}` : ""}
        <br>${esc(imovel.bairro)}, ${esc(imovel.cidade)} - ${esc(imovel.uf)}
        <br>${imovel.corretor?.email ? `<a href="mailto:${esc(imovel.corretor.email)}">${esc(imovel.corretor.email)}</a>` : ""}${imovel.corretor?.instagram ? ` · <a href="${esc(imovel.corretor.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}
      </div>
    </div>
  </section>`;

  const order = theme.sectionOrder || ["sobre", "ficha", "destaques", "galeria", "parecidos", "contato"];
  return `<main>${order.map((k) => blocks[k] || "").join("\n")}</main>`;
})()}

${
  theme.stickyCta
    ? `<div class="sticky-cta">
  <span class="preco-mini">${esc(formatPreco(imovel.preco))}${precoSufixo}</span>
  <a class="cta" href="${esc(whatsUrl)}" target="_blank" rel="noopener">Falar no WhatsApp</a>
</div>`
    : ""
}

<footer>
  <div class="wrap">
    Inteligência Imobiliária, Construindo Confiança · ${imovel.corretor?.creci ? `CRECI-SP ${esc(imovel.corretor.creci)}` : ""}
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

module.exports = { renderPropertyPage, jsonLd, buildFaqs, breadcrumbLd };
