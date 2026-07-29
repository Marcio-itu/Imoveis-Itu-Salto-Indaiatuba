const { esc } = require("./utils");

const PADRAO_COR = { "alto-padrao": "#B08D57", "medio-padrao": "#2F5D7C", "padrao-popular": "#E0562B" };

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
  .wrap{max-width:1080px;margin:0 auto;padding:56px 24px 80px}
  h1{font-family:${t.fonts.display};font-weight:500;font-size:clamp(28px,5vw,40px);margin-bottom:8px}
  p.sub{color:${t.inkMuted};margin-bottom:32px}
  .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${t.accent};font-weight:600}
  a{color:inherit}

  .filtros{background:rgba(255,255,255,.75);backdrop-filter:blur(10px);border:1px solid ${t.border};
    border-radius:14px;padding:18px 20px;margin:28px 0 36px;box-shadow:0 4px 18px rgba(0,0,0,.05)}
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
  .contagem{font-size:13px;color:${t.inkMuted};margin-bottom:16px}

  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
  a.card{display:block;background:#fff;border:1px solid ${t.border};border-radius:14px;overflow:hidden;
    text-decoration:none;color:${t.ink};box-shadow:0 2px 10px rgba(0,0,0,.05);transition:transform .2s,box-shadow .2s}
  a.card:hover{transform:translateY(-3px);box-shadow:0 10px 26px rgba(0,0,0,.10)}
  a.card .thumb{width:100%;aspect-ratio:4/3;object-fit:cover;background:${t.surface}}
  a.card .body{padding:14px 16px}
  a.card .tag{display:inline-block;font-size:10px;letter-spacing:.06em;text-transform:uppercase;
    padding:4px 9px;border-radius:999px;color:#fff;margin-bottom:8px}
  a.card .tit{font-family:${t.fonts.display};font-size:17px;line-height:1.25}
  a.card .meta{font-size:13px;color:${t.inkMuted};margin-top:4px}
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
    areaServed: cidadesConfig.map((c) => ({ "@type": "City", name: c, containedInPlace: { "@type": "State", name: config?.regiao?.uf === "SP" ? "São Paulo" : config?.regiao?.uf } })),
    address: { "@type": "PostalAddress", addressLocality: config?.regiao?.cidadePrincipal, addressRegion: config?.regiao?.uf, addressCountry: "BR" },
  };

  const dadosJs = JSON.stringify(
    imoveis.map((i) => ({
      titulo: i.titulo, cidade: i.cidade, bairro: i.bairro, uf: i.uf,
      preco: i.preco, precoNumerico: i.precoNumerico || 0,
      padrao: i.padrao, padraoLabel: i.padraoLabel, url: i.url, thumb: i.thumb,
    }))
  );

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Imóveis por cidade — ${esc(nomeHub)}</title>
<meta name="description" content="Imóveis à venda em ${esc(cidadesConfig.join(", "))}, incluindo casas em condomínio no interior de São Paulo. Busque por cidade, bairro e faixa de preço.">
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
  <h1>Imóveis por cidade</h1>
  <p class="sub">${esc(cidadesComImovel.join(", ") || cidadesConfig.join(", "))}</p>

  <div class="filtros">
    <div class="chips" id="chipsCidade"></div>
    <div class="filtros-linha">
      <div class="campo">
        <label>Bairro</label>
        <select id="fBairro"><option value="">Todos os bairros</option></select>
      </div>
      <div class="campo">
        <label>Preço mínimo</label>
        <input type="number" id="fMin" placeholder="0" min="0" step="10000">
      </div>
      <div class="campo">
        <label>Preço máximo</label>
        <input type="number" id="fMax" placeholder="Sem limite" min="0" step="10000">
      </div>
      <button class="limpar" id="fLimpar" type="button">Limpar filtros</button>
    </div>
  </div>

  <p class="contagem" id="contagem"></p>
  <div class="grid" id="grid"></div>
  <div class="vazio" id="vazio" style="display:none">Nenhum imóvel encontrado com esses filtros.</div>

  <footer>${esc(creci)}</footer>
</div>

<script>
const IMOVEIS = ${dadosJs};
const PADRAO_COR = ${JSON.stringify(PADRAO_COR)};
${formatarPrecoJs()}

let cidadeAtiva = "";

function cidadesDisponiveis(){ return [...new Set(IMOVEIS.map(i=>i.cidade))].sort((a,b)=>a.localeCompare(b,'pt-BR')); }
function bairrosDisponiveis(cidade){
  return [...new Set(IMOVEIS.filter(i => !cidade || i.cidade===cidade).map(i=>i.bairro))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
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
  const min = Number(document.getElementById("fMin").value) || 0;
  const max = Number(document.getElementById("fMax").value) || Infinity;
  const filtrados = IMOVEIS.filter(i =>
    (!cidadeAtiva || i.cidade === cidadeAtiva) &&
    (!bairro || i.bairro === bairro) &&
    i.precoNumerico >= min && i.precoNumerico <= max
  );
  const grid = document.getElementById("grid");
  const vazio = document.getElementById("vazio");
  document.getElementById("contagem").textContent = filtrados.length + (filtrados.length===1?" imóvel":" imóveis") + " encontrado" + (filtrados.length===1?"":"s");
  if (!filtrados.length){ grid.innerHTML = ""; vazio.style.display = "block"; return; }
  vazio.style.display = "none";
  grid.innerHTML = filtrados.map(i => \`
    <a class="card" href="\${i.url}">
      \${i.thumb ? '<img class="thumb" src="'+i.thumb+'" loading="lazy" alt="'+i.titulo+'">' : ''}
      <div class="body">
        <span class="tag" style="background:\${PADRAO_COR[i.padrao]||'#999'}">\${i.padraoLabel}</span>
        <div class="tit">\${i.titulo}</div>
        <div class="meta">\${i.bairro}, \${i.cidade} - \${i.uf}</div>
        <div class="preco">\${i.preco}</div>
      </div>
    </a>\`).join("");
}

document.getElementById("fBairro").onchange = aplicarFiltros;
document.getElementById("fMin").oninput = aplicarFiltros;
document.getElementById("fMax").oninput = aplicarFiltros;
document.getElementById("fLimpar").onclick = () => {
  cidadeAtiva = ""; document.getElementById("fBairro").value = "";
  document.getElementById("fMin").value = ""; document.getElementById("fMax").value = "";
  renderChips(); renderBairros(); aplicarFiltros();
};

renderChips(); renderBairros(); aplicarFiltros();
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
<meta name="robots" content="index, follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>${hubCss(theme)}</style>
</head>
<body>
<div class="wrap">
  <span class="eyebrow"><a href="${esc(hubUrl)}" style="color:inherit">← Todas as cidades</a></span>
  <h1>${esc(bairroNome)}</h1>
  <p class="sub">${imoveis.length} ${imoveis.length === 1 ? "imóvel disponível" : "imóveis disponíveis"}</p>
  <div class="grid">
    ${imoveis
      .map(
        (im) => `<a class="card" href="../imoveis/${esc(im.slug)}/">
        ${im.thumb ? `<img class="thumb" src="${esc(im.thumb)}" loading="lazy" alt="${esc(im.titulo)}">` : ""}
        <div class="body">
          <span class="tag" style="background:${PADRAO_COR[im.padrao] || "#999"}">${esc(im.padraoLabel)}</span>
          <div class="tit">${esc(im.titulo)}</div>
          <div class="meta">${esc(im.preco)}</div>
        </div>
      </a>`
      )
      .join("")}
  </div>
</div>
</body>
</html>`;
}

module.exports = { renderMainHub, renderBairroHub };
