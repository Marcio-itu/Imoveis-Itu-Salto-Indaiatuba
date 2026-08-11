// scripts/story-image.js
//
// Gera automaticamente a imagem de story (formato 1080x1920, 9:16) que o Marcio fazia
// manualmente pra cada imóvel: um mockup de celular com a foto principal e a ficha do
// imóvel dentro da "tela". O layout é sempre o mesmo — só a foto e os dados do imóvel
// trocam — igual ao pedido original.
//
// Uso:
//   node scripts/story-image.js --slug=algum-slug
//   (roda automaticamente pra todo imóvel dentro de build.js)

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const W = 1080;
const H = 1920;

// Cor da marca (extraída do ícone oficial) — usada aqui de propósito fixa, independente
// da cor por padrão (alto/médio/popular), porque isso é uma peça de MARCA, não de imóvel.
const BRAND_COLOR = "#285A7F"; // azul da marca (ícone novo)
const INK = "#1C1A18";
const INK_MUTED = "#6B655D";
const CREAM = "#FBF9F5";

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Quebra de texto simples por largura aproximada de caractere — sem medição real de
// fonte (o ambiente de build não tem as fontes da marca instaladas), então usamos uma
// largura média por caractere calibrada visualmente pro tamanho de fonte usado.
function wrapText(text, maxCharsPerLine, maxLines) {
  const words = String(text || "").trim().split(/\s+/);
  const lines = [];
  let atual = "";
  for (const w of words) {
    const tentativa = atual ? `${atual} ${w}` : w;
    if (tentativa.length > maxCharsPerLine && atual) {
      lines.push(atual);
      atual = w;
    } else {
      atual = tentativa;
    }
    if (lines.length === maxLines) break;
  }
  if (atual && lines.length < maxLines) lines.push(atual);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    const restante = words.join(" ").length > lines.join(" ").length;
    if (restante && last.length > 3) lines[maxLines - 1] = last.replace(/\s?\S*$/, "") + "…";
  }
  return lines;
}

function formatOperacoes(tiposOperacao) {
  const label = { venda: "VENDA", locacao: "LOCAÇÃO", permuta: "PERMUTA" };
  return (tiposOperacao || ["venda"]).map((o) => label[o] || o.toUpperCase()).join(" · ");
}

// Monta até 4 pares {label, valor} pra grade "Ficha técnica" — casa mostra
// quartos/suítes/banheiros/vagas; terreno mostra área do terreno; comercial usa o que tiver.
function montarFicha(dados) {
  const itens = [];
  if (dados.quartos) itens.push({ valor: dados.quartos, label: dados.quartos === 1 ? "QUARTO" : "QUARTOS" });
  if (dados.suites) itens.push({ valor: dados.suites, label: dados.suites === 1 ? "SUÍTE" : "SUÍTES" });
  if (dados.banheiros) itens.push({ valor: dados.banheiros, label: dados.banheiros === 1 ? "BANHEIRO" : "BANHEIROS" });
  if (dados.vagas) itens.push({ valor: dados.vagas, label: dados.vagas === 1 ? "VAGA" : "VAGAS" });
  if (itens.length < 4 && dados.areaUtil) itens.push({ valor: `${dados.areaUtil}m²`, label: "ÁREA ÚTIL" });
  if (itens.length < 4 && dados.areaTerreno) itens.push({ valor: `${dados.areaTerreno}m²`, label: "TERRENO" });
  return itens.slice(0, 4);
}

// Camada 1: fundo escuro + corpo do celular + tela (cream) — fica ATRÁS da foto.
function svgBase() {
  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2A211B"/>
      <stop offset="100%" stop-color="#12100E"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="44" y="114" width="${W - 88}" height="1722" rx="102" fill="#0B0A09"/>
  <rect x="60" y="130" width="${W - 120}" height="1690" rx="88" fill="${CREAM}"/>
</svg>`;
}

// Camada 2 (por cima da foto): cabeçalho, card branco com os textos, moldura, notch,
// esmaecido inferior e rodapé — nunca redesenha a tela inteira, só o que precisa
// aparecer sobre a foto e sobre a faixa inferior.
function svgOverlay({ bairro, marca, badge, titulo, localizacao, preco, ficha, fotoY, fotoH }) {
  const cardY = fotoY + fotoH - 36; // o card sobe um pouco por cima da foto
  const cardX = 60;
  const cardW = W - 120;

  const linhasTitulo = wrapText(titulo, 26, 2);
  const tituloSvg = linhasTitulo
    .map((l, i) => `<tspan x="${cardX + 44}" dy="${i === 0 ? 0 : 56}">${esc(l)}</tspan>`)
    .join("");

  const fichaW = (cardW - 88) / Math.min(ficha.length || 1, 4);
  const fichaSvg = ficha
    .map(
      (item, i) => `
      <g transform="translate(${cardX + 44 + i * fichaW}, 0)">
        <text x="0" y="0" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="700" fill="${INK}">${esc(item.valor)}</text>
        <text x="0" y="34" font-family="Arial, sans-serif" font-size="17" letter-spacing="0.5" fill="${INK_MUTED}">${esc(item.label)}</text>
      </g>`
    )
    .join("");

  const yLocalizacao = cardY + 134 + (linhasTitulo.length > 1 ? 56 : 0) + 54;
  const yPreco = cardY + 134 + (linhasTitulo.length > 1 ? 56 : 0) + 122;
  const yLinha = cardY + 134 + (linhasTitulo.length > 1 ? 56 : 0) + 160;
  const yFichaLabel = cardY + 134 + (linhasTitulo.length > 1 ? 56 : 0) + 210;
  const yFichaGrid = cardY + 134 + (linhasTitulo.length > 1 ? 56 : 0) + 268;

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${CREAM}" stop-opacity="0"/>
      <stop offset="100%" stop-color="${CREAM}" stop-opacity="1"/>
    </linearGradient>
    <clipPath id="phoneClip"><rect x="60" y="130" width="${W - 120}" height="1690" rx="88"/></clipPath>
    <clipPath id="cardClip"><rect x="${cardX}" y="${cardY}" width="${cardW}" height="1000" rx="46"/></clipPath>
  </defs>

  <g clip-path="url(#phoneClip)">
    <!-- sombra leve no topo da foto, pra header ficar legível em foto clara -->
    <rect x="60" y="130" width="${W - 120}" height="140" fill="#000000" opacity="0.28"/>
    <text x="${cardX + 4}" y="205" font-family="Arial, sans-serif" font-size="34" fill="#FFFFFF">←</text>
    <text x="${cardX + 52}" y="203" font-family="Arial, sans-serif" font-size="27" font-weight="600" fill="#FFFFFF">${esc(bairro)}</text>
    <text x="${W - 60 - 20}" y="203" text-anchor="end" font-family="Arial, sans-serif" font-size="18" letter-spacing="1" fill="#FFFFFF" opacity="0.92">${esc(marca)}</text>

    <g clip-path="url(#cardClip)">
      <rect x="${cardX}" y="${cardY}" width="${cardW}" height="1000" fill="${CREAM}"/>
    </g>

    <text x="${cardX + 44}" y="${cardY + 62}" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="0.5" fill="${BRAND_COLOR}">${esc(badge)}</text>
    <text font-family="Georgia, 'Times New Roman', serif" font-size="50" font-weight="700" fill="${INK}" x="${cardX + 44}" y="${cardY + 134}">${tituloSvg}</text>
    <text x="${cardX + 44}" y="${yLocalizacao}" font-family="Arial, sans-serif" font-size="26" fill="${INK_MUTED}">${esc(localizacao)}</text>
    <text x="${cardX + 44}" y="${yPreco}" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700" fill="${INK}">${esc(preco)}</text>
    <line x1="${cardX + 44}" y1="${yLinha}" x2="${cardX + cardW - 44}" y2="${yLinha}" stroke="#E4DFD6" stroke-width="2"/>
    <text x="${cardX + 44}" y="${yFichaLabel}" font-family="Arial, sans-serif" font-size="18" letter-spacing="1.5" fill="${BRAND_COLOR}" font-weight="700">FICHA TÉCNICA</text>
    <g transform="translate(0, ${yFichaGrid})">${fichaSvg}</g>

    <rect x="${cardX}" y="1680" width="${cardW}" height="140" fill="url(#fade)"/>
    <rect x="${W / 2 - 68}" y="1770" width="136" height="7" rx="3.5" fill="#D8D2C6"/>
  </g>

  <rect x="44" y="114" width="${W - 88}" height="1722" rx="102" fill="none" stroke="#3A322A" stroke-width="3"/>
  <rect x="${W / 2 - 76}" y="150" width="152" height="38" rx="19" fill="#0B0A09"/>

  <text x="${W / 2}" y="${1920 - 46}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" letter-spacing="1" fill="#EFE9DF" opacity="0.85">imoveis-itu-salto.com.br</text>
</svg>`;
}

async function gerarImagemStory(dados, fotoOrigemPath, outPath) {
  const bairro = dados.bairro || dados.cidade || "";
  const marca = "MARCIO SANTOS";
  const badge = `${formatOperacoes(dados.tiposOperacao)} · ${(dados.cidade || "").toUpperCase()}/${dados.uf || "SP"} · REF. ${dados.referencia || ""}`;
  const titulo = dados.titulo || dados.tipo || "Imóvel";
  const localizacao = `${dados.bairro || ""}, ${dados.cidade || ""} - ${dados.uf || "SP"}`;
  const preco = dados.preco || "";
  const ficha = montarFicha(dados);

  const fotoY = 130;
  const fotoH = 900;
  const fotoW = W - 120;

  // Prepara a foto: cobre exatamente a área da "tela" do celular onde ela entra, com os
  // cantos de cima arredondados pra acompanhar a curva da tela do celular (os cantos de
  // baixo não precisam — ficam cobertos pelo card branco por cima).
  const mascaraCantos = Buffer.from(
    `<svg width="${fotoW}" height="${fotoH}"><rect x="0" y="0" width="${fotoW}" height="${fotoH}" rx="88" ry="88"/></svg>`
  );
  const fotoBuffer = await sharp(fotoOrigemPath)
    .rotate()
    .resize({ width: fotoW, height: fotoH, fit: "cover", position: "attention" })
    .composite([{ input: mascaraCantos, blend: "dest-in" }])
    .png()
    .toBuffer();

  const overlaySvg = svgOverlay({ bairro, marca, badge, titulo, localizacao, preco, ficha, fotoY, fotoH });

  await sharp(Buffer.from(svgBase()))
    .composite([
      { input: fotoBuffer, top: fotoY, left: 60 },
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
    ])
    .png()
    .toFile(outPath);
}

async function gerarParaImovel(slug) {
  const imovelDir = path.join(ROOT, "imoveis", slug);
  const dadosPath = path.join(imovelDir, "dados.json");
  if (!fs.existsSync(dadosPath)) {
    console.log(`  ⚠️  ${slug}: dados.json não existe — pulando imagem de story.`);
    return;
  }
  const dados = JSON.parse(fs.readFileSync(dadosPath, "utf8"));
  const fotos = dados.fotos || [];
  const hero = fotos.find((f) => f.hero) || fotos[0];
  if (!hero) {
    console.log(`  ⚠️  ${slug}: sem fotos — pulando imagem de story.`);
    return;
  }
  const fotoPath = path.join(imovelDir, "fotos", hero.arquivo);
  if (!fs.existsSync(fotoPath)) {
    console.log(`  ⚠️  ${slug}: foto hero não encontrada em disco (${hero.arquivo}) — pulando.`);
    return;
  }
  const outDir = path.join(ROOT, "docs", "imoveis", slug);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "story.png");
  await gerarImagemStory(dados, fotoPath, outPath);
  console.log(`  📱 story.png gerado para ${slug}`);
}

async function main() {
  const args = process.argv.slice(2);
  const slugArg = args.find((a) => a.startsWith("--slug="));
  if (slugArg) {
    await gerarParaImovel(slugArg.split("=")[1]);
    return;
  }
  const imoveisDir = path.join(ROOT, "imoveis");
  if (!fs.existsSync(imoveisDir)) return;
  const slugs = fs.readdirSync(imoveisDir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  for (const slug of slugs) {
    try {
      await gerarParaImovel(slug);
    } catch (err) {
      console.error(`  ❌ ${slug}: falha ao gerar imagem de story — ${err.message}`);
    }
  }
}

module.exports = { gerarImagemStory, gerarParaImovel };

if (require.main === module) {
  main();
}
