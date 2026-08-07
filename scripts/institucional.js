const { esc } = require("./utils");

const FONTS = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', -apple-system, Helvetica, Arial, sans-serif",
};

// CSS compartilhado pelas páginas institucionais — mesma paleta neutra do hub (não compete com
// nenhum padrão de imóvel), pra manter a identidade única do site em qualquer página.
function institucionalCss() {
  return `
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{background-color:#FAF8F4;color:#17241F;font-family:${FONTS.body};line-height:1.6;min-height:100vh}
  .wrap{max-width:760px;margin:0 auto;padding:0 24px}
  a{color:inherit}
  .topo{padding:28px 0}
  .voltar{display:inline-flex;align-items:center;gap:6px;text-decoration:none;color:#5E756E;font-size:14px}
  .voltar:hover{color:#2F5D7C}
  .eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#4E9E97;font-weight:600}
  h1{font-family:${FONTS.display};font-weight:500;font-size:clamp(28px,5vw,40px);line-height:1.15;
    margin-top:10px;letter-spacing:-.01em}
  .sub{color:#5E756E;font-size:16px;margin-top:8px}
  .credential{display:inline-block;font-size:12px;letter-spacing:.06em;color:#5E756E;
    border:1px solid #DCD5C4;border-radius:999px;padding:6px 14px;margin-top:16px}
  .divider{height:1px;background:linear-gradient(90deg,#DCD5C4,transparent);margin:32px 0}
  section{padding:8px 0 36px}
  p{margin-top:14px;font-size:16px;color:#293832}
  p:first-of-type{margin-top:0}
  .lang-tag{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8A7F63;font-weight:600;
    margin-top:36px;display:block}
  footer{border-top:1px solid #DCD5C4;padding:26px 0;font-size:13px;color:#5E756E}
  `;
}

function renderSobrePage(config, siteUrl) {
  const nome = config?.corretor?.nome || "Marcio Santos";
  const creci = config?.corretor?.creci ? `CRECI-SP ${config.corretor.creci}` : "";
  const cidades = (config?.regiao?.cidadesAtendidas || []).join(", ");
  const cidadePrincipal = config?.regiao?.cidadePrincipal || "Itu";

  const titulo = `Sobre ${esc(nome)} — Corretor de Imóveis em ${esc(cidadePrincipal)}/SP`;
  const descricao = `Conheça ${nome}, corretor de imóveis (${creci}) em ${cidadePrincipal} e região. Atendimento consultivo com mais de 20 anos de experiência profissional em marketing e trade marketing aplicados ao mercado imobiliário.`;

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: nome,
    jobTitle: "Corretor de Imóveis",
    url: `${siteUrl}sobre/`,
    image: `${siteUrl}marcio-santos-corretor.webp`,
    telephone: config?.corretor?.telefone,
    email: config?.corretor?.email,
    ...(config?.corretor?.instagram ? { sameAs: [config.corretor.instagram] } : {}),
    ...(creci ? { hasCredential: { "@type": "EducationalOccupationalCredential", credentialCategory: "license", name: creci } } : {}),
    worksFor: { "@type": "RealEstateAgent", name: config?.nomeHub, url: siteUrl },
    alumniOf: { "@type": "CollegeOrUniversity", name: "SENAC Rio Grande do Sul" },
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<meta name="description" content="${esc(descricao)}">
<link rel="canonical" href="${siteUrl}sobre/">
<meta property="og:type" content="profile">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:image" content="${siteUrl}marcio-santos-corretor.webp">
<meta property="og:url" content="${siteUrl}sobre/">
<link rel="icon" type="image/png" sizes="32x32" href="${siteUrl}favicon-cliente-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="${siteUrl}favicon-cliente-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<script type="application/ld+json">${JSON.stringify(personLd)}</script>
<style>${institucionalCss()}
  .foto-bio{width:100%;max-width:340px;border-radius:14px;overflow:hidden;margin:22px 0 4px;
    box-shadow:0 10px 30px rgba(0,0,0,.10)}
  .foto-bio img{width:100%;display:block}
  .diploma-link{display:inline-flex;align-items:center;gap:6px;font-size:13px;color:#5E756E;
    text-decoration:none;border-bottom:1px solid #DCD5C4;padding-bottom:2px;margin-top:8px}
  .diploma-link:hover{color:#2F5D7C;border-color:#2F5D7C}
  .diploma-link svg{width:14px;height:14px}
</style>
</head>
<body>
<div class="wrap">
  <div class="topo">
    <a class="voltar" href="${siteUrl}">← Voltar para os imóveis</a>
  </div>

  <span class="eyebrow">Sobre o corretor</span>
  <h1>${esc(nome)}</h1>
  <p class="sub">Corretor de imóveis em ${esc(cidadePrincipal)} e região — ${esc(cidades)}</p>
  ${creci ? `<span class="credential">${esc(creci)}</span>` : ""}

  <div class="foto-bio">
    <img src="${siteUrl}marcio-santos-corretor.webp" alt="${esc(nome)}, corretor de imóveis ${esc(creci)}" width="900" height="1260">
  </div>

  <section>
    <p>${esc(nome)} é corretor de imóveis (${esc(creci)}) em ${esc(cidadePrincipal)} e região, com formação técnica em Transações Imobiliárias pela Escola SENAC Rio Grande do Sul (2023, 960 horas). Atua com atendimento próximo e consultivo, ajudando famílias e investidores a encontrar o imóvel certo em ${esc(cidades)}.</p>
    <p>Antes de se dedicar ao mercado imobiliário, construiu mais de 20 anos de carreira em marketing e trade marketing — período em que liderou equipes e estratégias de expansão em empresas como a Starrett do Brasil e o Grupo Agronelli, gerenciando orçamentos superiores a R$ 10 milhões e lançando dezenas de linhas de produto no mercado nacional e latino-americano. Essa bagagem corporativa hoje se traduz diretamente na forma como cada imóvel é apresentado, posicionado e divulgado — com o mesmo rigor estratégico usado antes para grandes marcas.</p>
    <p>O resultado é um atendimento que une transparência, atenção aos detalhes e uma visão de mercado pouco comum entre corretores — sempre com foco no que mais importa numa decisão como essa: encontrar o imóvel certo, sem pressa e sem letras miúdas.</p>
    <a class="diploma-link" href="${siteUrl}diploma-marcio-santos.pdf" target="_blank" rel="noopener">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v5h5"/></svg>
      Ver diplomação
    </a>
  </section>

  <div class="divider"></div>

  <span class="lang-tag">English</span>
  <section>
    <p>${esc(nome)} is a licensed real estate broker (${esc(creci)}) serving ${esc(cidadePrincipal)} and the surrounding region — ${esc(cidades)} — in São Paulo state, Brazil, with a technical degree in Real Estate Transactions from SENAC Rio Grande do Sul (2023, 960 hours). He offers close, consultative service to families and investors looking for the right property in the region.</p>
    <p>Before turning to real estate, he spent over 20 years in marketing and trade marketing, leading teams and expansion strategy at companies such as Starrett Brazil and Grupo Agronelli — managing budgets above R$ 10 million and launching dozens of product lines across the Brazilian and Latin American markets. That corporate background now shapes directly how he presents, positions, and promotes every property he represents.</p>
    <p>The result is a service built on transparency, attention to detail, and a market perspective uncommon among brokers — always focused on what matters most in a decision like this: finding the right property, without rush and without fine print.</p>
  </section>

  <footer>
    ${esc(config?.nomeHub || "")} · ${esc(creci)} · <a href="${siteUrl}">${esc(cidadePrincipal)} e região</a>
  </footer>
</div>
</body>
</html>`;
}

function renderInvestidoresPage(config, siteUrl) {
  const nome = config?.corretor?.nome || "Marcio Santos";
  const cidadePrincipal = config?.regiao?.cidadePrincipal || "Itu";
  const titulo = `Investidores — Oportunidades Imobiliárias em ${esc(cidadePrincipal)}/SP | ${esc(nome)}`;
  const descricao = `Área para investidores de ${esc(nome)}, corretor de imóveis em ${esc(cidadePrincipal)}/SP: oportunidades de alta procura, seleção consultiva de imóveis para investimento. Em breve.`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${titulo}</title>
<meta name="description" content="${esc(descricao)}">
<link rel="canonical" href="${siteUrl}investidores/">
<meta name="robots" content="index, follow">
<meta property="og:title" content="${titulo}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:url" content="${siteUrl}investidores/">
<link rel="icon" type="image/png" sizes="32x32" href="${siteUrl}favicon-cliente-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="${siteUrl}favicon-cliente-180.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:wght@400;500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>${institucionalCss()}
  body{background:#0E1614;color:#EEF4F2}
  .voltar{color:#A9BAB5}
  .voltar:hover{color:#4E9E97}
  .eyebrow{color:#4E9E97}
  .sub,p{color:#C7D3CF}
  .credential{border-color:#2A3A35;color:#A9BAB5}
  .divider{background:linear-gradient(90deg,#2A3A35,transparent)}
  footer{border-color:#2A3A35;color:#A9BAB5}
  .login-card{background:#16211E;border:1px solid #2A3A35;border-radius:14px;padding:32px 28px;
    margin-top:32px;max-width:380px;margin-left:auto;margin-right:auto;text-align:center}
  .login-card label{display:block;text-align:left;font-size:12px;color:#A9BAB5;margin:16px 0 6px}
  .login-card input{width:100%;border:1px solid #2A3A35;background:#0E1614;color:#EEF4F2;
    border-radius:8px;padding:11px 13px;font-size:14px;font-family:inherit}
  .login-card input::placeholder{color:#5E756E}
  .login-btn{width:100%;margin-top:22px;background:#4E9E97;color:#0E1614;border:none;border-radius:999px;
    padding:13px;font-weight:700;font-size:14px;cursor:pointer}
  .esqueci{display:block;margin-top:14px;font-size:12px;color:#5E756E;text-decoration:none}
  .esqueci:hover{color:#4E9E97}
  .badge-em-breve{display:inline-block;background:rgba(78,158,151,.15);color:#4E9E97;font-size:11px;
    letter-spacing:.08em;text-transform:uppercase;font-weight:700;border-radius:999px;padding:5px 14px;margin-top:18px}
</style>
</head>
<body>
<div class="wrap">
  <div class="topo">
    <a class="voltar" href="${siteUrl}">← Voltar para os imóveis</a>
  </div>

  <span class="eyebrow">Área do investidor</span>
  <h1>Caro investidor, seja bem-vindo.</h1>
  <p class="sub">Uma seleção dedicada a quem enxerga imóveis como oportunidade — não apenas como moradia.</p>
  <span class="badge-em-breve">Em construção</span>

  <section>
    <p>Estamos preparando um espaço exclusivo para investidores: imóveis de alta procura, oportunidades fora da vitrine pública e análises de potencial de valorização em ${esc(cidadePrincipal)} e região — curadoria feita pessoalmente por ${esc(nome)}.</p>
    <p>Cadastre-se abaixo para ser avisado assim que este espaço for liberado.</p>

    <form class="login-card" onsubmit="return false" aria-label="Cadastro de investidor (em breve)">
      <label for="invEmail">E-mail</label>
      <input type="email" id="invEmail" placeholder="seu@email.com" autocomplete="off">
      <label for="invSenha">Senha</label>
      <input type="password" id="invSenha" placeholder="••••••••" autocomplete="off">
      <button class="login-btn" type="button" onclick="alert('Essa área ainda está em preparação — em breve você poderá se cadastrar por aqui. Enquanto isso, fale direto comigo pelo WhatsApp.')">Entrar</button>
      <a class="esqueci" href="#" onclick="event.preventDefault();alert('Essa área ainda está em preparação.')">Esqueci minha senha</a>
    </form>
  </section>

  <footer>
    ${esc(config?.nomeHub || "")} · <a href="${siteUrl}">${esc(cidadePrincipal)} e região</a>
  </footer>
</div>
</body>
</html>`;
}

module.exports = { renderSobrePage, renderInvestidoresPage };
