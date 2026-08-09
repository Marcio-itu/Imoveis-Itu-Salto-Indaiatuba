const { esc, formatPreco } = require("./utils");

const FOTOS_FINANCIAMENTO = [
  "simulador-financiamento-imovel-itu-salto-cabreuva-01.webp",
  "simulador-financiamento-imovel-itu-salto-cabreuva-02.webp",
  "simulador-financiamento-imovel-itu-salto-cabreuva-03.webp",
  "simulador-financiamento-imovel-itu-salto-cabreuva-04.webp",
  "simulador-financiamento-imovel-itu-salto-cabreuva-05.webp",
  "simulador-financiamento-imovel-itu-salto-cabreuva-06.webp",
  "simulador-financiamento-imovel-itu-salto-cabreuva-07.webp",
];

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
  .bullets{list-style:none;margin-top:20px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px 24px}
  .bullets li{font-size:15px;color:var(--ink)}
  .tag b{color:var(--accent)}

  .ficha{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1px;background:var(--border);
    border:1px solid var(--border);border-radius:var(--radius);overflow:hidden}
  .ficha div{background:var(--surface);padding:22px 18px}
  .ficha .num{font-family:${t.fonts.display};font-size:28px;display:block}
  .ficha .lbl{font-size:12px;color:var(--ink-muted);text-transform:uppercase;letter-spacing:.08em}

  .galeria{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .galeria figure{margin:0;overflow:hidden;border-radius:var(--radius);background:var(--surface);
    box-shadow:0 2px 10px rgba(0,0,0,.08);transition:box-shadow .25s ease}
  .foto-abrir{border:none;background:none;padding:0;margin:0;cursor:pointer;display:block;width:100%;
    font:inherit;color:inherit;text-align:left}
  .foto-abrir:hover figure{box-shadow:0 6px 20px rgba(0,0,0,.14)}
  .galeria img{aspect-ratio:4/3;object-fit:cover;transition:transform .35s ease;width:100%;display:block}
  .foto-abrir:hover img{transform:scale(1.04)}
  @media (max-width:720px){.galeria{grid-template-columns:repeat(2,1fr)}}

  .lightbox{position:fixed;inset:0;background:rgba(10,14,12,.94);z-index:200;display:none;
    align-items:center;justify-content:center}
  .lightbox.aberto{display:flex}
  .lightbox-img{max-width:88vw;max-height:82vh;object-fit:contain;border-radius:6px;
    box-shadow:0 20px 60px rgba(0,0,0,.5)}
  .lightbox-fechar{position:absolute;top:20px;right:20px;background:rgba(255,255,255,.12);
    color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:999px;padding:9px 18px;
    font-size:13px;font-weight:600;cursor:pointer;font-family:${t.fonts.body}}
  .lightbox-fechar:hover{background:rgba(255,255,255,.22)}
  .lightbox-seta{position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.12);
    color:#fff;border:1px solid rgba(255,255,255,.25);border-radius:50%;width:48px;height:48px;
    font-size:26px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center}
  .lightbox-seta:hover{background:rgba(255,255,255,.22)}
  .lightbox-prev{left:16px}
  .lightbox-next{right:16px}
  .lightbox-contador{position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
    color:rgba(255,255,255,.75);font-size:13px;font-family:${t.fonts.body}}
  @media (max-width:640px){
    .lightbox-seta{width:40px;height:40px;font-size:22px}
    .lightbox-fechar{top:12px;right:12px;padding:8px 14px;font-size:12px}
  }

  p.resumo{font-size:19px;font-weight:600;color:var(--ink);max-width:62ch;line-height:1.4}
  p.disclaimer{font-size:13px;font-style:italic;color:var(--ink-muted);max-width:62ch;line-height:1.5;margin-top:22px}

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
  .corretor{margin-top:26px;font-size:14px;color:var(--ink-muted)}

  footer{padding:36px 0;font-size:13px;color:var(--ink-muted)}
  footer a{color:var(--ink-muted)}

  .sticky-cta{position:fixed;left:0;right:0;bottom:0;z-index:20;background:var(--surface);
    border-top:1px solid var(--border);padding:12px 20px;display:flex;justify-content:space-between;
    align-items:center;gap:14px;box-shadow:0 -6px 18px rgba(0,0,0,.08)}
  .sticky-cta .preco-mini{font-family:${t.fonts.display};font-size:17px}
  .sticky-cta .cta{padding:11px 20px;font-size:14px}

  .banner-financiamento{position:relative;border-radius:var(--radius);overflow:hidden;min-height:280px;
    display:flex;align-items:center;box-shadow:0 10px 30px rgba(0,0,0,.14)}
  .banner-financiamento img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .banner-financiamento::after{content:"";position:absolute;inset:0;
    background:linear-gradient(90deg,rgba(0,40,110,.88) 0%,rgba(0,40,110,.72) 45%,rgba(0,40,110,.25) 100%)}
  .banner-financiamento-conteudo{position:relative;z-index:2;padding:36px 40px;max-width:420px;color:#fff}
  .banner-financiamento-conteudo .eyebrow{color:#9FC1F5}
  .banner-financiamento-conteudo h2{color:#fff;margin-top:8px}
  .banner-financiamento-conteudo p{color:rgba(255,255,255,.85);font-size:15px;margin-top:10px}
  .btn-caixa{display:inline-flex;align-items:center;gap:8px;margin-top:20px;background:#fff;color:#0046C0;
    text-decoration:none;font-weight:800;font-size:14px;letter-spacing:.03em;padding:13px 24px;
    border-radius:999px;transition:transform .15s,box-shadow .15s}
  .btn-caixa:hover{transform:translateY(-2px);box-shadow:0 6px 18px rgba(0,0,0,.2)}
  @media (max-width:640px){ .banner-financiamento-conteudo{padding:28px 24px} }
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
    auto.push({ pergunta: "Aceita financiamento?", resposta: "Sim, este imóvel aceita financiamento." });
  }
  auto.push({
    pergunta: "Se fosse possível financiar este imóvel, quanto ficaria a parcela?",
    resposta: "O valor da parcela depende de vários fatores — valor de entrada, prazo, taxa de juros do banco escolhido e renda do comprador. Para ter uma referência, use nosso simulador de financiamento: os valores exibidos ali são apenas uma estimativa, sujeita à análise de crédito de cada instituição financeira.",
    temBotaoSimulador: true,
  });
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
${inativo ? `<div style="background:#3A3826;color:#F3EFE4;text-align:center;padding:12px 20px;font-size:14px">Este imóvel não está mais disponível para novos contatos.</div>` : ""}
<header class="topbar">
  <div class="wrap">
    <a class="back" href="${esc(hubUrl)}">← ${esc(imovel.bairro)}</a>
    <a class="brand" href="${esc(hubUrl)}">Inteligência Imobiliária</a>
  </div>
</header>

<section class="hero" style="border:0;padding:0">
  ${hero.arquivo ? `<img src="${fotosBaseUrl}/${esc(hero.arquivo)}" alt="${esc(hero.alt || imovel.titulo)}" onerror="this.style.display='none'">` : ""}
  <div class="wrap hero-content">
    <div class="plaqueta">${imovel.padrao === "alto-padrao" ? `<b>${esc(theme.label)}</b> · ` : ""}${operacaoLabel ? `${esc(operacaoLabel)} · ` : ""}${esc(imovel.cidade)}/${esc(imovel.uf)} · ref. ${esc(imovel.referencia || imovel.slug)}</div>
    ${temPermuta ? `<div style="font-size:13px;color:rgba(255,255,255,.75);margin-top:2px">Estuda-se permuta</div>` : ""}
    <h1>${esc(imovel.titulo)}</h1>
    <div class="hero-meta">
      <span>${imovel.condominio ? `Condomínio ${esc(imovel.condominio)}, ` : ""}${esc(imovel.bairro)}, ${esc(imovel.cidade)} - ${esc(imovel.uf)}</span>
    </div>
    ${
      theme.showPriceInHero
        ? `<div class="preco">${esc(formatPreco(imovel.preco))}${precoSufixo}${imovel.financiamento ? ` · <span style="opacity:.85;font-size:15px">Aceita financiamento</span>` : ""}</div>`
        : ""
    }
  </div>
</section>

${(() => {
  const blocks = {};

  const bulletsAuto = [];
  bulletsAuto.push(`${formatPreco(imovel.preco)}${precoSufixo}${imovel.financiamento ? " - aceita financiamento" : ""}`);
  if (imovel.quartos) bulletsAuto.push(`${imovel.quartos} quartos`);
  if (imovel.suites) bulletsAuto.push(`${imovel.suites} suítes`);
  if (imovel.banheiros) bulletsAuto.push(`${imovel.banheiros} banheiros (totais)`);
  if (imovel.vagas) bulletsAuto.push(`${imovel.vagas} vagas`);
  if (imovel.areaUtil) bulletsAuto.push(`${imovel.areaUtil} m² de área útil`);
  if (imovel.areaTerreno) bulletsAuto.push(`${imovel.areaTerreno} m² de terreno`);
  (imovel.acessorios || []).forEach((a) => bulletsAuto.push(a));
  (imovel.caracteristicasExtras || []).forEach((c) => bulletsAuto.push(c));
  const bulletsFinais = [...(imovel.dadosTecnicos || []), ...bulletsAuto];

  blocks.sobre = `<section id="sobre">
    <div class="wrap">
      <span class="eyebrow">Sobre o imóvel</span>
      <h2 style="margin-top:10px">${esc(imovel.tituloSecao || "Sobre este imóvel")}</h2>
      <p class="resumo" style="margin-top:14px">${esc(imovel.resumo || imovel.descricaoCurta)}</p>
      ${(imovel.descricaoLonga || []).map((p) => `<p class="lead" style="margin-top:14px">${esc(p)}</p>`).join("")}
      ${bulletsFinais.length ? `<ul class="bullets">${bulletsFinais.map((d) => `<li>✔️ ${esc(d)}</li>`).join("")}</ul>` : ""}
      <p class="disclaimer">✍️ As informações disponíveis neste momento foram elaboradas com o máximo de cuidado e fornecidas diretamente pelo proprietário ou corretor parceiro${(imovel.parceria?.instagrams || []).length ? `: ${imovel.parceria.instagrams.map((h) => `@${esc(h.replace(/^@/, ""))}`).join(", ")}` : ""}.</p>
      <p class="disclaimer">⚠️ Em respeito à boa-fé objetiva (art. 422 do CC), o preço vigente será confirmado no contato antes da formalização de qualquer proposta.</p>
      <a class="cta" style="margin-top:22px" href="${esc(shareUrl)}" target="_blank" rel="noopener">Compartilhe este imóvel</a>
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
          ? `<p class="preco" style="color:var(--ink);margin-bottom:22px">${esc(formatPreco(imovel.preco))}${precoSufixo}${imovel.financiamento ? ` <span style="opacity:.7;font-size:15px;font-family:${theme.fonts.body}">· Aceita financiamento</span>` : ""}</p>`
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

  const tituloGaleria = imovel.padrao === "alto-padrao" ? "Deleite-se com as fotos"
    : imovel.padrao === "medio-padrao" ? "Fotos pra você curtir"
    : "Fotos";

  blocks.galeria = fotos.length
    ? `<section id="galeria">
    <div class="wrap">
      <span class="eyebrow">Galeria</span>
      <h2 style="margin-top:10px">${esc(tituloGaleria)}</h2>
      <div class="galeria">
        ${fotos
          .map(
            (f, i) =>
              `<button type="button" class="foto-abrir" data-idx="${i}" aria-label="Ampliar foto ${i + 1} de ${fotos.length}">
            <figure><img src="${fotosBaseUrl}/${esc(f.arquivo)}" alt="${esc(f.alt || imovel.titulo)}" loading="lazy" onerror="this.style.display='none'"></figure>
          </button>`
          )
          .join("")}
      </div>
    </div>

    <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-label="Foto ampliada">
      <button type="button" class="lightbox-fechar" id="lightboxFechar" aria-label="Voltar para o imóvel">✕ Voltar</button>
      <button type="button" class="lightbox-seta lightbox-prev" id="lightboxPrev" aria-label="Foto anterior">‹</button>
      <img class="lightbox-img" id="lightboxImg" alt="">
      <button type="button" class="lightbox-seta lightbox-next" id="lightboxNext" aria-label="Próxima foto">›</button>
      <div class="lightbox-contador" id="lightboxContador"></div>
    </div>
    <script>
    (function(){
      var fotosUrls = ${JSON.stringify(fotos.map((f) => `${fotosBaseUrl}/${f.arquivo}`))};
      var lightbox = document.getElementById("lightbox");
      var img = document.getElementById("lightboxImg");
      var contador = document.getElementById("lightboxContador");
      var idx = 0;
      function mostrar(i){
        idx = (i + fotosUrls.length) % fotosUrls.length;
        img.src = fotosUrls[idx];
        contador.textContent = (idx + 1) + " / " + fotosUrls.length;
      }
      function abrir(i){
        mostrar(i);
        lightbox.classList.add("aberto");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      }
      function fechar(){
        lightbox.classList.remove("aberto");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      }
      document.querySelectorAll(".foto-abrir").forEach(function(btn){
        btn.addEventListener("click", function(){ abrir(Number(btn.dataset.idx)); });
      });
      document.getElementById("lightboxFechar").addEventListener("click", fechar);
      document.getElementById("lightboxPrev").addEventListener("click", function(){ mostrar(idx - 1); });
      document.getElementById("lightboxNext").addEventListener("click", function(){ mostrar(idx + 1); });
      lightbox.addEventListener("click", function(e){ if (e.target === lightbox) fechar(); });
      document.addEventListener("keydown", function(e){
        if (!lightbox.classList.contains("aberto")) return;
        if (e.key === "Escape") fechar();
        if (e.key === "ArrowLeft") mostrar(idx - 1);
        if (e.key === "ArrowRight") mostrar(idx + 1);
      });
    })();
    </script>
  </section>`
    : "";

  blocks.financiamento = simuladorUrl
    ? `<section id="financiamento">
    <div class="wrap">
      <div class="banner-financiamento">
        <img id="fotoFinanciamento" alt="" onerror="this.style.display='none'">
        <div class="banner-financiamento-conteudo">
          <span class="eyebrow">Simulador de financiamento</span>
          <h2 style="margin-top:8px">Já pensou como ficaria a parcela deste imóvel?</h2>
          <p>Simule condições de financiamento em poucos minutos — é rápido, gratuito e sem compromisso.</p>
          <a class="btn-caixa" href="${esc(simuladorUrl)}" target="_blank" rel="noopener">Simular financiamento</a>
        </div>
      </div>
    </div>
    <script>
    (function(){
      var fotos = ${JSON.stringify(FOTOS_FINANCIAMENTO.map((f) => `${siteRoot}/${f}`))};
      var chave = "sim_ultima_foto";
      var ultima = -1;
      try { ultima = parseInt(sessionStorage.getItem(chave), 10); } catch(e){}
      var candidatos = fotos.map(function(_, i){ return i; }).filter(function(i){ return i !== ultima; });
      var idx = candidatos.length ? candidatos[Math.floor(Math.random() * candidatos.length)] : 0;
      try { sessionStorage.setItem(chave, String(idx)); } catch(e){}
      var img = document.getElementById("fotoFinanciamento");
      if (img) img.src = fotos[idx];
      setTimeout(function(){
        fotos.forEach(function(url, i){ if (i === idx) return; var pre = new Image(); pre.src = url; });
      }, 1500);
    })();
    </script>
  </section>`
    : "";

  blocks.parecidos = parecidos.length
    ? `<section id="parecidos">
    <div class="wrap">
      <span class="eyebrow">É uma satisfação ter você aqui</span>
      <h2 style="margin-top:10px">Confira outros imóveis</h2>
      <div class="parecidos-grid">
        ${parecidos
          .map(
            (p) => `<a class="parecido-card" href="${esc(p.url)}">
          ${p.thumb ? `<img src="${esc(p.thumb)}" loading="lazy" alt="${esc(p.titulo)}" onerror="this.style.display='none'">` : ""}
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
        ${faqs.map((f) => `<details class="faq-item"><summary>${esc(f.pergunta)}</summary><p>${esc(f.resposta)}${f.temBotaoSimulador && simuladorUrl ? `<br><a class="btn-caixa" style="margin-top:14px;background:#0046C0;color:#fff" href="${esc(simuladorUrl)}" target="_blank" rel="noopener">Simular financiamento</a>` : ""}</p></details>`).join("")}
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
        <br>${esc(imovel.bairro)}, ${esc(imovel.cidade)} - ${esc(imovel.uf)}
        <br>${imovel.corretor?.email ? `<a href="mailto:${esc(imovel.corretor.email)}">${esc(imovel.corretor.email)}</a>` : ""}${imovel.corretor?.instagram ? ` · <a href="${esc(imovel.corretor.instagram)}" target="_blank" rel="noopener">Instagram</a>` : ""}
      </div>
    </div>
  </section>`;

  const order = theme.sectionOrder || ["sobre", "ficha", "destaques", "galeria", "financiamento", "parecidos", "contato"];
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
    · Imóvel publicado em: ${esc(formatDateBR(imovel.publicadoEm))}
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
