const { esc, formatPreco, fontLinkTag } = require("./utils");

const PADRAO_COR = { "alto-padrao": "#4E9E97", "medio-padrao": "#2F5D7C", "padrao-popular": "#E0562B", "padrao-neutro": "#8A7F63" };
const FOTOS_DESTAQUE = ["imoveis-itu-salto-indaiatuba-2027-01.webp", "imoveis-itu-salto-indaiatuba-2027-02.webp", "imoveis-itu-salto-indaiatuba-2027-03.webp"];

// Hub usa paleta neutra própria (não é nenhum dos 3 temas de imóvel) —
// é a vitrine, não deve competir visualmente com nenhum padrão específico.
function hubCss(t) {
  return `
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{
    background-color:#FAF8F4;
    background-image:
      radial-gradient(circle at 12% -10%, rgba(47,93,124,.08) 0%, transparent 45%),
      radial-gradient(circle at 88% 0%, rgba(176,141,87,.10) 0%, transparent 40%),
      radial-gradient(circle at 50% 100%, rgba(31,138,95,.06) 0%, transparent 50%);
    background-attachment:fixed;
    color:${t.ink};font-family:${t.fonts.body};line-height:1.55;min-height:100vh}
  .wrap{max-width:1080px;margin:0 auto;padding:0 24px}
  .header-sticky{position:sticky;top:0;z-index:80;background:rgba(250,248,244,.92);backdrop-filter:blur(8px)}
  .wrap-top{padding-top:6px;padding-bottom:7px}
  .wrap-main{padding-top:26px;padding-bottom:88px}
  .site-header{display:flex;justify-content:flex-start;align-items:center;flex-wrap:nowrap;gap:2px}
  .brand-logo-wrap{display:flex;align-items:center;gap:10px}
  .brand-icone{height:55px;width:auto;display:block}
  .brand-nome{height:77px;width:auto;display:block}

  /* --- menu hambúrguer + painel lateral --- */
  .menu-toggle{border:none;background:none;cursor:pointer;padding:8px;position:relative;
    display:flex;flex-direction:column;justify-content:center;gap:4px;width:34px;height:34px;flex:none}
  .menu-toggle span{display:block;height:2px;width:100%;background:${t.ink};border-radius:2px;
    transition:opacity .2s ease,transform .2s ease}
  .menu-toggle::before,.menu-toggle::after{content:"";position:absolute;left:9px;right:9px;top:50%;
    height:2px;background:${t.ink};border-radius:2px;opacity:0;transform:rotate(0deg);
    transition:opacity .2s ease,transform .25s ease}
  .menu-toggle.aberto span{opacity:0;transform:scaleX(.4)}
  .menu-toggle.aberto::before{opacity:1;transform:rotate(45deg)}
  .menu-toggle.aberto::after{opacity:1;transform:rotate(-45deg)}
  .menu-overlay{position:fixed;inset:0;background:rgba(20,25,23,.45);opacity:0;pointer-events:none;
    transition:opacity .3s ease;z-index:90}
  .menu-overlay.aberto{opacity:1;pointer-events:auto}
  .menu-lateral{position:fixed;top:0;left:0;bottom:0;width:300px;max-width:86vw;background:#FFFDF9;
    box-shadow:8px 0 30px rgba(0,0,0,.18);z-index:95;transform:translateX(-100%);
    transition:transform .35s cubic-bezier(.22,.9,.3,1);display:flex;flex-direction:column;
    padding:26px 22px 22px}
  .menu-lateral.aberto{transform:translateX(0)}
  .menu-fechar{align-self:flex-end;border:none;background:none;cursor:pointer;font-size:20px;
    color:${t.inkMuted};padding:6px;margin-bottom:10px}
  .menu-topo{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${t.inkMuted};
    font-weight:600;margin-bottom:14px}
  .menu-item{display:flex;align-items:center;gap:14px;padding:14px 8px;text-decoration:none;
    color:${t.ink};border-bottom:1px solid ${t.border};font-size:15px;font-weight:500;
    transition:color .15s,padding-left .15s}
  .menu-item:hover{color:${t.accent};padding-left:14px}
  .menu-item svg{width:20px;height:20px;flex:none;color:${t.accent}}
  .menu-item .menu-item-sub{display:block;font-size:12px;font-weight:400;color:${t.inkMuted};margin-top:2px}
  .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${t.accent};font-weight:600}
  .grupo-label{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${t.inkMuted};
    font-weight:600;margin-bottom:8px;display:inline-flex;align-items:center;gap:5px}
  .grupo-label svg{width:12px;height:12px;flex:none}

  .hero-photo-mobile{position:relative;width:100%;aspect-ratio:2/1;overflow:hidden;background:${t.surface}}
  .hero-photo-mobile img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  @media (min-width:900px){.hero-photo-mobile{display:none}}

  .filtros-headline{font-family:${t.fonts.display};font-weight:500;font-size:clamp(24px,4vw,29px);
    line-height:1.18;letter-spacing:-.01em;margin-bottom:10px;max-width:22ch}
  .filtros-sub{font-size:14.5px;line-height:1.5;color:${t.inkMuted};margin-bottom:20px;max-width:42ch}
  .busca-inteligente{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;
    color:${t.accent};text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px}
  .busca-inteligente svg{width:13px;height:13px;flex:none}

  .tabs-op{display:flex;gap:26px;border-bottom:1px solid ${t.border};margin-bottom:18px}
  .tabs-op:empty{display:none;border:none;margin:0}
  .tabs-op .chip{border:none;background:none;padding:4px 2px 12px;font-size:14px;color:${t.inkMuted};
    border-radius:0;position:relative;font-weight:500;box-shadow:none}
  .tabs-op .chip.on{color:${t.ink};font-weight:600;background:none}
  .tabs-op .chip.on::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;background:${t.accent}}
  a{color:inherit}

  .search-shell{display:grid;grid-template-columns:1fr;gap:22px}
  .banner-photos{display:none}
  @media (min-width:900px){
    .search-shell{grid-template-columns:1.05fr .95fr;align-items:stretch}
    .banner-photos{display:block;position:relative;border-radius:18px;overflow:hidden;min-height:420px;
      box-shadow:0 10px 30px rgba(0,0,0,.10)}
    .banner-photos img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  }

  .filtros{background:rgba(255,255,255,.75);backdrop-filter:blur(10px);border:1px solid ${t.border};
    border-radius:14px;padding:18px 20px;box-shadow:0 4px 18px rgba(0,0,0,.05)}
  .chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
  .chip{border:1px solid ${t.border};background:#fff;padding:8px 16px;border-radius:999px;font-size:13px;
    cursor:pointer;transition:.15s}
  .chip.on{background:${t.accent};border-color:${t.accent};color:#fff}
  .filtros-linha{display:flex;flex-wrap:wrap;gap:12px;align-items:center}
  .filtros-linha select,.filtros-linha input{border:1px solid ${t.border};border-radius:8px;padding:9px 12px;
    font-size:14px;font-family:inherit;background:#fff}
  .filtros-linha label{font-size:12px;color:${t.inkMuted};display:block;margin-bottom:4px}
  .campo{display:flex;flex-direction:column}
  .campo input{width:120px}
  .limpar{background:none;border:none;color:${t.accent};font-size:13px;cursor:pointer;text-decoration:underline;
    margin-left:auto;align-self:flex-end}
  .cta-buscar{display:block;width:100%;margin-top:18px;padding:15px;border:none;border-radius:999px;
    background:${t.accent};color:#fff;font-size:15px;font-weight:600;cursor:pointer;text-align:center;
    text-decoration:none;transition:filter .15s}
  .cta-buscar:hover{filter:brightness(1.08)}
  .contagem{font-size:13px;color:${t.inkMuted};margin-bottom:16px}

  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
  .card-wrap{position:relative;display:flex}
  a.card{display:flex;flex-direction:column;height:100%;width:100%;position:relative;background:#fff;border:1px solid ${t.border};border-radius:14px;overflow:hidden;
    text-decoration:none;color:${t.ink};box-shadow:0 2px 10px rgba(0,0,0,.05);transition:transform .2s,box-shadow .2s}
  a.card:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(0,0,0,.10)}
  a.card .thumb{width:100%;aspect-ratio:4/3;object-fit:cover;background:${t.surface};flex:none}
  a.card .body{padding:14px 16px;display:flex;flex-direction:column;flex:1}
  a.card .tag{display:inline-block;font-size:10px;letter-spacing:.06em;text-transform:uppercase;
    padding:4px 9px;border-radius:999px;color:#fff;margin-bottom:8px}
  a.card .tit{font-family:${t.fonts.display};font-size:17px;line-height:1.25}
  .wa-share{position:absolute;right:10px;bottom:10px;width:34px;height:34px;border-radius:50%;
    background:rgba(226,99,46,.16);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,.12);transition:background .15s,transform .15s;z-index:2}
  .wa-share svg{width:16px;height:16px;color:#C9531F}
  .wa-share:hover{background:rgba(226,99,46,.32);transform:scale(1.08)}
  a.card .meta{font-size:13px;color:${t.inkMuted};margin-top:4px}

  .site-footer{margin-top:64px;padding-top:40px;border-top:1px solid ${t.border}}
  .footer-brand{font-family:${t.fonts.display};font-size:21px;letter-spacing:.01em;margin-bottom:30px;color:${t.ink}}
  .footer-cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:28px;margin-bottom:32px}
  .footer-label{font-size:11px;letter-spacing:.13em;text-transform:uppercase;color:${t.accent};font-weight:600;margin-bottom:12px}
  .footer-cols > div > div:not(.footer-label){font-size:14px;color:${t.inkMuted};line-height:1.9}
  .footer-cols a{color:${t.inkMuted};text-decoration:none;border-bottom:1px solid transparent;transition:.15s}
  .footer-cols a:hover{color:${t.ink};border-bottom-color:${t.accent}}
  .compartilhar-site{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;
    padding:24px 0;margin-bottom:20px;border-top:1px solid ${t.border};border-bottom:1px solid ${t.border}}
  .compartilhar-site span{font-size:13px;color:${t.inkMuted}}
  .btn-enviar-site{display:inline-flex;align-items:center;gap:7px;color:#C9531F;text-decoration:none;
    font-size:13px;font-weight:600;border:1px solid rgba(201,83,31,.35);border-radius:999px;
    padding:8px 16px;transition:background .15s,border-color .15s}
  .btn-enviar-site svg{width:14px;height:14px}
  .btn-enviar-site:hover{background:rgba(201,83,31,.08);border-color:#C9531F}
  .footer-bottom{font-size:12px;color:${t.inkMuted};padding-top:24px;border-top:1px solid ${t.border}}
  a.card .preco{font-family:${t.fonts.display};font-size:15px;margin-top:8px}

  a.item{display:block;background:#fff;border:1px solid ${t.border};border-radius:${t.radius};
    padding:18px 22px;margin-bottom:12px;text-decoration:none;color:${t.ink};transition:border-color .2s;
    box-shadow:0 2px 10px rgba(0,0,0,.05)}
  a.item:hover{border-color:${t.accent}}
  a.item .tit{font-family:${t.fonts.display};font-size:19px}
  a.item .meta{font-size:13px;color:${t.inkMuted};margin-top:4px}

  .vazio{padding:40px 20px;text-align:center;color:${t.inkMuted};background:rgba(255,255,255,.6);
    border-radius:14px;border:1px dashed ${t.border}}
  footer{margin-top:56px;font-size:13px;color:${t.inkMuted}}
  `;
}

function formatarPrecoJs() {
  return `function formatBRL(n){ return n ? n.toLocaleString('pt-BR',{style:'currency',currency:'BRL',maximumFractionDigits:0}) : ''; }`;
}

function renderMainHub(imoveis, theme, siteUrl, config) {
  const nomeHub = config?.nomeHub || "Inteligência Imobiliária";
  const creci = config?.corretor?.creci ? `CRECI-SP ${config.corretor.creci}` : "";
  const cidadesConfig = config?.regiao?.cidadesAtendidas || [];
  const cidadesComImovel = [...new Set(imoveis.map((i) => i.cidade))];

  const orgLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: config?.corretor?.nome,
    url: siteUrl,
    telephone: config?.corretor?.telefone,
    email: config?.corretor?.email,
    ...(config?.corretor?.instagram ? { sameAs: [config.corretor.instagram] } : {}),
    ...(config?.corretor?.creci ? { identifier: { "@type": "PropertyValue", propertyID: "CRECI-SP", value: config.corretor.creci } } : {}),
    areaServed: cidadesConfig.map((c) => ({ "@type": "City", name: c, containedInPlace: { "@type": "State", name: config?.regiao?.uf === "SP" ? "São Paulo" : config?.regiao?.uf } })),
    address: { "@type": "PostalAddress", addressLocality: config?.regiao?.cidadePrincipal, addressRegion: config?.regiao?.uf, addressCountry: "BR" },
  };

  const dadosJs = JSON.stringify(
    imoveis.map((i) => ({
      titulo: i.titulo, cidade: i.cidade, bairro: i.bairro, uf: i.uf,
      preco: i.preco, precoNumerico: i.precoNumerico || 0, precoSufixo: i.precoSufixo || "",
      padrao: i.padrao, padraoLabel: i.padraoLabel, url: i.url, thumb: i.thumb,
      tiposOperacao: i.tiposOperacao || [i.tipoOperacao || "venda"],
    }))
  );

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
${config?.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(config.googleSiteVerification)}" />` : ""}
<title>Imóveis à Venda em Itu e Salto | Casas, Apartamentos e Terrenos</title>
<meta name="description" content="Compre casas, apartamentos, terrenos, chácaras e condomínios à venda em ${esc(cidadesConfig.join(", "))}. Busca inteligente por cidade, bairro e faixa de preço.">
<meta property="og:type" content="website">
<meta property="og:title" content="Imóveis à Venda em Itu e Salto | Casas, Apartamentos e Terrenos">
<meta property="og:description" content="Casas, apartamentos, terrenos, chácaras e condomínios em Itu, Salto e região. Busca inteligente para você encontrar o que procura.">
<meta property="og:url" content="${esc(siteUrl)}">
<meta property="og:image" content="${siteUrl}imoveis-itu-salto-indaiatuba-2027-01.webp">
<meta property="og:locale" content="pt_BR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Imóveis à Venda em Itu e Salto | Casas, Apartamentos e Terrenos">
<meta name="twitter:description" content="Casas, apartamentos, terrenos, chácaras e condomínios em Itu, Salto e região. Busca inteligente para você encontrar o que procura.">
<meta name="twitter:image" content="${siteUrl}imoveis-itu-salto-indaiatuba-2027-01.webp">
<link rel="canonical" href="${esc(siteUrl)}">
<meta name="robots" content="index, follow">
<link rel="icon" type="image/png" sizes="32x32" href="${siteUrl}favicon-cliente-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="${siteUrl}favicon-cliente-180.png">
<meta name="geo.region" content="BR-${esc(config?.regiao?.uf || "SP")}">
<meta name="geo.placename" content="${esc(config?.regiao?.cidadePrincipal || "")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLinkTag("https://fonts.googleapis.com/css2?family=Fraunces:wght@500&family=Inter:wght@400;500;600&display=swap")}
<script type="application/ld+json">${JSON.stringify(orgLd)}</script>
<style>${hubCss(theme)}</style>
${config?.analytics?.cloudflareToken ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${config.analytics.cloudflareToken}"}'></script>` : ""}
</head>
<body>
<div class="menu-overlay" id="menuOverlay"></div>
<nav class="menu-lateral" id="menuLateral" aria-hidden="true">
  <button class="menu-fechar" id="menuFechar" aria-label="Fechar menu">✕</button>
  <span class="menu-topo">Menu</span>
  <a class="menu-item" href="${siteUrl}investidores/">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>
    <span>Investidores</span>
  </a>
  <a class="menu-item" href="${esc(config?.simuladorFinanciamento || "#")}" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="2"/><path d="M8 6.5h8" stroke-linecap="round"/><circle cx="8.3" cy="10.5" r=".6" fill="currentColor" stroke="none"/><circle cx="12" cy="10.5" r=".6" fill="currentColor" stroke="none"/><circle cx="15.7" cy="10.5" r=".6" fill="currentColor" stroke="none"/><circle cx="8.3" cy="14" r=".6" fill="currentColor" stroke="none"/><circle cx="12" cy="14" r=".6" fill="currentColor" stroke="none"/><circle cx="15.7" cy="14" r=".6" fill="currentColor" stroke="none"/><circle cx="8.3" cy="17.5" r=".6" fill="currentColor" stroke="none"/><circle cx="12" cy="17.5" r=".6" fill="currentColor" stroke="none"/></svg>
    <span>Simule financiamento</span>
  </a>
  ${(config?.outrosSites || []).map(s => `<a class="menu-item" href="${esc(s.url)}" target="_blank" rel="noopener">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
    <span>${esc(s.label)}</span>
  </a>`).join("")}
  <a class="menu-item" href="${siteUrl}sobre/">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6.2 7-6.2s7 2.6 7 6.2"/></svg>
    <span>Sobre o corretor</span>
  </a>
</nav>
<script>
document.addEventListener("DOMContentLoaded", function(){
  var toggle = document.getElementById("menuToggle");
  var overlay = document.getElementById("menuOverlay");
  var painel = document.getElementById("menuLateral");
  var fechar = document.getElementById("menuFechar");
  if (!toggle || !overlay || !painel || !fechar) return;
  function abrir(){
    toggle.classList.add("aberto"); toggle.setAttribute("aria-expanded","true");
    overlay.classList.add("aberto"); painel.classList.add("aberto");
    painel.setAttribute("aria-hidden","false"); document.body.style.overflow = "hidden";
  }
  function fecharMenu(){
    toggle.classList.remove("aberto"); toggle.setAttribute("aria-expanded","false");
    overlay.classList.remove("aberto"); painel.classList.remove("aberto");
    painel.setAttribute("aria-hidden","true"); document.body.style.overflow = "";
  }
  toggle.addEventListener("click", function(){
    toggle.classList.contains("aberto") ? fecharMenu() : abrir();
  });
  overlay.addEventListener("click", fecharMenu);
  fechar.addEventListener("click", fecharMenu);
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") fecharMenu(); });
});
</script>

<div class="header-sticky" id="headerSticky">
  <div class="wrap wrap-top">
    <div class="site-header">
      <button class="menu-toggle" id="menuToggle" aria-label="Abrir menu" aria-expanded="false" aria-controls="menuLateral">
        <span></span><span></span><span></span>
      </button>
      <span class="brand-logo-wrap">
        <img class="brand-icone" src="${siteUrl}logo-icone-marcio-santos.png" alt="">
        <img class="brand-nome" src="${siteUrl}logo-nome-marcio-santos.png" alt="${esc(config?.corretor?.nome || "Marcio Santos")}${creci ? ` — ${esc(creci)}` : ""}">
      </span>
    </div>
  </div>
</div>
<script>
document.getElementById("headerSticky").addEventListener("click", function(e){
  if (e.target.closest(".menu-toggle")) return;
  if (confirm("Gostaria de falar com Márcio por WhatsApp?")){
    window.open("https://wa.me/+551132806090", "_blank");
  }
});
</script>

<div class="hero-photo-mobile" aria-hidden="true">
  <img id="fotoDestaqueMobile" alt="Imóvel à venda em Itu e região" onerror="this.style.display='none'">
</div>

<div class="wrap wrap-main">
  <div class="search-shell">
    <div class="filtros">
      <h1 class="filtros-headline">Imóveis à venda em Itu e Salto</h1>
      <p class="filtros-sub">Casas, apartamentos, terrenos, chácaras e condomínios em Itu, Salto e região.</p>
      <div class="tabs-op" id="chipsOperacao"></div>
      <span class="busca-inteligente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg> Busca</span>
      <span class="grupo-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg> Cidade</span>
      <div class="chips" id="chipsCidade"></div>
      <div class="filtros-linha">
        <div class="campo">
          <label><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:12px;height:12px;vertical-align:-1px;margin-right:3px"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>Bairro</label>
          <select id="fBairro"><option value="">Todos os bairros</option></select>
        </div>
        <div class="campo">
          <label>Preço mínimo</label>
          <input type="text" inputmode="numeric" id="fMin" placeholder="R$ 0">
        </div>
        <div class="campo">
          <label>Preço máximo</label>
          <input type="text" inputmode="numeric" id="fMax" placeholder="Sem limite">
        </div>
        <button class="limpar" id="fLimpar" type="button">Limpar filtros</button>
      </div>
      <a class="cta-buscar" href="#grid">Ver imóveis</a>
    </div>
    <div class="banner-photos" aria-hidden="true">
      <img id="fotoDestaqueDesktop" alt="Imóvel à venda em Itu e região" onerror="this.style.display='none'">
    </div>
  </div>

  <script>
  (function(){
    // Uma foto por sessão de navegação (não fica trocando sozinha). Ao voltar pra home depois
    // de ver um imóvel (nova carga de página), sorteia outra — evitando repetir a última mostrada.
    // As outras 2 ficam pré-carregando em segundo plano, então quando trocar já está no cache.
    var fotos = ${JSON.stringify(FOTOS_DESTAQUE.map(f => siteUrl + f))};
    var chaveUltima = "hub_ultima_foto_destaque";
    var ultima = -1;
    try { ultima = parseInt(sessionStorage.getItem(chaveUltima), 10); } catch(e){}
    var candidatos = fotos.map(function(_, i){ return i; }).filter(function(i){ return i !== ultima; });
    var idx = candidatos.length ? candidatos[Math.floor(Math.random() * candidatos.length)] : 0;
    try { sessionStorage.setItem(chaveUltima, String(idx)); } catch(e){}

    var escolhida = fotos[idx];
    var m = document.getElementById("fotoDestaqueMobile");
    var d = document.getElementById("fotoDestaqueDesktop");
    if (m) m.src = escolhida;
    if (d) d.src = escolhida;

    // Pré-carrega as outras fotos em segundo plano (baixa prioridade, depois que a página assentar)
    // pra próxima troca não exigir carregamento na frente do cliente.
    setTimeout(function(){
      fotos.forEach(function(url, i){
        if (i === idx) return;
        var img = new Image();
        img.src = url;
      });
    }, 1500);
  })();
  </script>

  <p class="contagem" id="contagem"></p>
  <div class="grid" id="grid"></div>
  <div class="vazio" id="vazio" style="display:none">Nenhum imóvel encontrado com esses filtros.</div>

  <footer class="site-footer">
    <div class="footer-brand">${esc(nomeHub)}</div>
    <div class="footer-cols">
      <div>
        <div class="footer-label">Corretor</div>
        <div>${esc(config?.corretor?.nome || "")}</div>
        <div>${esc(creci)}</div>
      </div>
      <div>
        <div class="footer-label">Contato</div>
        ${config?.corretor?.email ? `<div><a href="mailto:${esc(config.corretor.email)}">${esc(config.corretor.email)}</a></div>` : ""}
        ${config?.corretor?.whatsapp ? `<div><a href="https://wa.me/${config.corretor.whatsapp.replace(/\D/g, "")}" target="_blank" rel="noopener">WhatsApp</a></div>` : ""}
        ${config?.corretor?.instagram ? `<div><a href="${esc(config.corretor.instagram)}" target="_blank" rel="noopener">Instagram</a></div>` : ""}
      </div>
      <div>
        <div class="footer-label">Atendemos</div>
        <div>${esc(cidadesConfig.join(" · "))}</div>
      </div>
    </div>
    <div class="compartilhar-site">
      <span>Envie este site para alguém especial</span>
      <a class="btn-enviar-site" href="https://wa.me/?text=${encodeURIComponent(`Dá uma olhada nesse site de imóveis: ${siteUrl}`)}" target="_blank" rel="noopener" aria-label="Enviar este site pelo WhatsApp">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
        Enviar
      </a>
    </div>
    <div class="footer-bottom">© ${new Date().getFullYear()} ${esc(nomeHub)}. Todos os direitos reservados.</div>
  </footer>
</div>

<script>
const IMOVEIS = ${dadosJs};
const PADRAO_COR = ${JSON.stringify(PADRAO_COR)};
${formatarPrecoJs()}

let cidadeAtiva = "";
let operacaoAtiva = "";
const OPERACAO_LABEL = { venda: "Comprar", locacao: "Alugar", permuta: "Permutar" };

function cidadesDisponiveis(){ return [...new Set(IMOVEIS.map(i=>i.cidade))].sort((a,b)=>a.localeCompare(b,'pt-BR')); }
function bairrosDisponiveis(cidade){
  return [...new Set(IMOVEIS.filter(i => !cidade || i.cidade===cidade).map(i=>i.bairro))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
}
function operacoesDisponiveis(){ return [...new Set(IMOVEIS.flatMap(i=>i.tiposOperacao||["venda"]))]; }

function renderChipsOperacao(){
  const box = document.getElementById("chipsOperacao");
  const ops = operacoesDisponiveis();
  if (ops.length <= 1){ box.innerHTML = ""; return; } // não mostra filtro se só tem um tipo de operação
  box.innerHTML = '<span class="chip' + (operacaoAtiva===""?" on":"") + '" data-o="">Todos os tipos</span>' +
    ops.map(o => '<span class="chip' + (operacaoAtiva===o?" on":"") + '" data-o="' + o + '">' + (OPERACAO_LABEL[o]||o) + '</span>').join("");
  box.querySelectorAll(".chip").forEach(el => el.onclick = () => {
    operacaoAtiva = el.dataset.o;
    renderChipsOperacao(); aplicarFiltros();
  });
}
function renderChips(){
  const box = document.getElementById("chipsCidade");
  const cidades = cidadesDisponiveis();
  box.innerHTML = '<span class="chip' + (cidadeAtiva===""?" on":"") + '" data-c="">Todas</span>' +
    cidades.map(c => '<span class="chip' + (cidadeAtiva===c?" on":"") + '" data-c="' + c.replace(/"/g,'') + '">' + c + '</span>').join("");
  box.querySelectorAll(".chip").forEach(el => el.onclick = () => {
    cidadeAtiva = el.dataset.c;
    document.getElementById("fBairro").value = "";
    renderChips(); renderBairros(); aplicarFiltros();
  });
}
function renderBairros(){
  const sel = document.getElementById("fBairro");
  const atual = sel.value;
  const bairros = bairrosDisponiveis(cidadeAtiva);
  sel.innerHTML = '<option value="">Todos os bairros</option>' + bairros.map(b => '<option value="' + b.replace(/"/g,'') + '">' + b + '</option>').join("");
  if (bairros.includes(atual)) sel.value = atual;
}
function aplicarFiltros(){
  const bairro = document.getElementById("fBairro").value;
  const min = Number(document.getElementById("fMin").value.replace(/\\D/g, "")) || 0;
  const max = Number(document.getElementById("fMax").value.replace(/\\D/g, "")) || Infinity;
  const filtrados = IMOVEIS.filter(i =>
    (!cidadeAtiva || i.cidade === cidadeAtiva) &&
    (!operacaoAtiva || (i.tiposOperacao||["venda"]).includes(operacaoAtiva)) &&
    (!bairro || i.bairro === bairro) &&
    i.precoNumerico >= min && i.precoNumerico <= max
  );
  const grid = document.getElementById("grid");
  const vazio = document.getElementById("vazio");
  document.getElementById("contagem").textContent = filtrados.length + (filtrados.length===1?" imóvel":" imóveis") + " encontrado" + (filtrados.length===1?"":"s");
  if (!filtrados.length){ grid.innerHTML = ""; vazio.style.display = "block"; return; }
  vazio.style.display = "none";
  grid.innerHTML = filtrados.map(i => \`
    <div class="card-wrap">
    <a class="card" href="\${i.url}">
      \${i.thumb ? '<img class="thumb" src="'+i.thumb+'" loading="lazy" alt="'+i.titulo+'" onerror="this.style.display=\\'none\\'">' : ''}
      <div class="body">
        \${i.padrao === "alto-padrao" ? '<span class="tag" style="background:'+(PADRAO_COR[i.padrao]||'#999')+'">'+i.padraoLabel+'</span>' : ''}
        <div class="tit">\${i.titulo}</div>
        <div class="meta">\${["venda","locacao"].filter(o=>(i.tiposOperacao||["venda"]).includes(o)).map(o=>OPERACAO_LABEL[o]).join(" / ")} · \${i.bairro}, \${i.cidade} - \${i.uf}</div>
        \${(i.tiposOperacao||[]).includes("permuta") ? '<div class="meta" style="opacity:.75">Estuda-se permuta</div>' : ''}
        <div class="preco">\${i.preco}\${i.precoSufixo}</div>
      </div>
    </a>
    <a class="wa-share" href="https://wa.me/?text=\${encodeURIComponent('Confira este imóvel: ' + i.url)}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
    </a>
    </div>\`).join("");
}

document.getElementById("fBairro").onchange = aplicarFiltros;
function mascararPreco(id){
  const el = document.getElementById(id);
  const digitos = el.value.replace(/\\D/g, "");
  el.value = digitos ? "R$ " + Number(digitos).toLocaleString("pt-BR") : "";
  aplicarFiltros();
}
document.getElementById("fMin").oninput = () => mascararPreco("fMin");
document.getElementById("fMax").oninput = () => mascararPreco("fMax");
document.getElementById("fLimpar").onclick = () => {
  cidadeAtiva = ""; operacaoAtiva = ""; document.getElementById("fBairro").value = "";
  document.getElementById("fMin").value = ""; document.getElementById("fMax").value = "";
  renderChips(); renderChipsOperacao(); renderBairros(); aplicarFiltros();
};

renderChips(); renderChipsOperacao(); renderBairros(); aplicarFiltros();
</script>
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
<meta property="og:type" content="website">
<meta property="og:title" content="Imóveis em ${esc(bairroNome)} — ${esc(nomeHub)}">
<meta property="og:description" content="Imóveis à venda em ${esc(bairroNome)}.">
<meta property="og:url" content="${esc(hubUrl)}">
<meta property="og:image" content="${hubUrl}imoveis-itu-salto-indaiatuba-2027-01.webp">
<meta name="twitter:card" content="summary_large_image">
<meta name="robots" content="index, follow">
<link rel="apple-touch-icon" sizes="180x180" href="${hubUrl}favicon-cliente-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fontLinkTag("https://fonts.googleapis.com/css2?family=Fraunces:wght@500&family=Inter:wght@400;500;600&display=swap")}
<style>${hubCss(theme)}</style>
${config?.analytics?.cloudflareToken ? `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${config.analytics.cloudflareToken}"}'></script>` : ""}
</head>
<body>
<div class="wrap">
  <span class="eyebrow"><a href="${esc(hubUrl)}" style="color:inherit">← Todas as cidades</a></span>
  <h1>${esc(bairroNome)}</h1>
  <p class="sub">${imoveis.length} ${imoveis.length === 1 ? "imóvel disponível" : "imóveis disponíveis"}</p>
  <div class="grid">
    ${imoveis
      .map(
        (im) => `<div class="card-wrap">
        <a class="card" href="../imoveis/${esc(im.slug)}/">
        ${im.thumb ? `<img class="thumb" src="${esc(im.thumb)}" loading="lazy" alt="${esc(im.titulo)}" onerror="this.style.display='none'">` : ""}
        <div class="body">
          ${im.padrao === "alto-padrao" ? `<span class="tag" style="background:${PADRAO_COR[im.padrao] || "#999"}">${esc(im.padraoLabel)}</span>` : ""}
          <div class="tit">${esc(im.titulo)}</div>
          <div class="meta">${esc(formatPreco(im.preco))}${esc(im.precoSufixo || "")}</div>
        </div>
      </a>
      <a class="wa-share" href="https://wa.me/?text=${encodeURIComponent(`Confira este imóvel: ${hubUrl}imoveis/${im.slug}/`)}" target="_blank" rel="noopener" aria-label="Compartilhar no WhatsApp">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7z"/></svg>
      </a>
      </div>`
      )
      .join("")}
  </div>
</div>
</body>
</html>`;
}

module.exports = { renderMainHub, renderBairroHub };
