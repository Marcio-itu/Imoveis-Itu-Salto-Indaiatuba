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
  return "R$ " + digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

module.exports = { slugify, esc, parsePreco, formatPreco };
