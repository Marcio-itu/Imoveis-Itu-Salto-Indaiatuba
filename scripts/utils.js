function slugify(str) {
  return String(str)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function esc(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parsePreco(str) {
  const n = Number(String(str || "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

// Garante "R$ 450.000" no site mesmo se dados.json tiver o preço sem formatação nenhuma.
function formatPreco(str) {
  const raw = String(str || "").trim();
  if (!raw) return raw;
  if (/R\$/.test(raw)) return raw; // já formatado (admin já aplica isso ao digitar)
  const digitos = raw.replace(/\D/g, "");
  if (!digitos) return raw;
  return "R$\u00A0" + digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Carrega Google Fonts sem bloquear a renderização da página (troca o <link rel="stylesheet">
// simples — que é render-blocking — por preload + ativação assíncrona, com fallback via
// <noscript> pra quem tiver JS desligado). Resolve o "Render Blocking Resources Test" do
// relatório de SEO sem trocar a fonte usada em cada página.
function fontLinkTag(href) {
  return `<link rel="preload" as="style" href="${href}">
<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'">
<noscript><link rel="stylesheet" href="${href}"></noscript>`;
}

// Preposição certa pra nome de bairro em frase tipo "Casa à venda [prep] [bairro]".
// "em" só está correto pra nome próprio puro (Pinheirinho, Liberdade); bairro que começa
// com uma palavra comum (Jardim, Vila, Parque...) pede a contração dessa palavra com "em"
// (no/na), senão a frase sai errada tipo "em Jardim Convenção" em vez de "no Jardim
// Convenção". Lista cobre os prefixos mais comuns de bairro no Brasil; o que não bate
// com nenhum prefixo conhecido continua usando "em" (comportamento de antes, seguro pra
// nome próprio sem artigo).
const PREFIXOS_MASCULINOS = ["jardim", "parque", "conjunto", "residencial", "condomínio", "condominio", "centro", "bosque", "recanto", "núcleo", "nucleo", "loteamento", "alto", "distrito"];
const PREFIXOS_FEMININOS = ["vila", "chácara", "chacara", "chácaras", "chacaras", "colina", "colinas", "cidade", "granja", "fazenda", "estância", "estancia"];
function prepBairro(nome) {
  const primeira = (nome || "").trim().split(/\s+/)[0]?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (PREFIXOS_MASCULINOS.some((p) => p.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === primeira)) return "no";
  if (PREFIXOS_FEMININOS.some((p) => p.normalize("NFD").replace(/[\u0300-\u036f]/g, "") === primeira)) return "na";
  return "em";
}

module.exports = { slugify, esc, parsePreco, formatPreco, fontLinkTag, prepBairro };
