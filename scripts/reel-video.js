// scripts/reel-video.js
//
// Gera automaticamente um vídeo vertical (1080x1920, formato Reels/Stories/TikTok) por
// imóvel: as fotos com efeito Ken Burns (zoom/pan lento), transições suaves em crossfade
// entre elas, texto sobreposto (título, localização, preço), um card de encerramento com
// chamada pra ação, e uma trilha sonora (assets/trilhas/, licenciadas do YouTube Audio
// Library) com fade de entrada e saída.
//
// Precisa do ffmpeg instalado no ambiente (já vem pronto nos runners do GitHub Actions).
//
// Uso:
//   node scripts/reel-video.js --slug=algum-slug

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync } = require("child_process");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const W = 1080;
const H = 1920;
const FPS = 25;
const SEGUNDOS_POR_FOTO = 3.6;
const DUR_TRANSICAO = 0.6; // crossfade entre clipes
const DUR_CTA = 3.2; // card de encerramento
const MAX_FOTOS = 10; // mesmo teto do carrossel do Instagram — o reel usa exatamente as fotos marcadas "redes sociais" no admin, na mesma ordem
const MIN_FOTOS_PARA_ESTICAR = 3; // com poucas fotos, aumenta o tempo de cada uma pro vídeo não ficar curto demais

// Faixas licenciadas via YouTube Audio Library, baixadas manualmente (não por scraping) e
// normalizadas em volume — ver assets/trilhas/LICENCAS.md.
const TRILHAS = [
  "beautiful-wonderful-you", "once-in-a-while-i-dream", "gone-away", "town-this-small",
  "paradise", "saddled-up-at-dawn", "fields-of-fariness", "when-it-ends",
  "stay-the-same", "happy-is",
];

const TRILHA_LABEL = {
  "beautiful-wonderful-you": "Beautiful Wonderful You — Jason Fabus",
  "once-in-a-while-i-dream": "Once In A While I Dream — Tama Shutts",
  "gone-away": "Gone Away — Blue Beat Review",
  "town-this-small": "Town This Small — Anno Domini Beats",
  "paradise": "Paradise — Anno Domini Beats",
  "saddled-up-at-dawn": "Saddled Up At Dawn — Patrick Jordan Patrikios",
  "fields-of-fariness": "Fields of Fariness — Patrick Jordan Patrikios",
  "when-it-ends": "When It Ends — Cosplay",
  "stay-the-same": "Stay the Same (Small Town) — Bill Douglas, Rod Kim",
  "happy-is": "Happy Is (feat. Sybil Rose) — Splitshine",
};

const BRAND_COLOR = "#F15D03";

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
}

function ffmpegSilencioso(args) {
  return execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
}

function esc(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function wrapText(text, maxCharsPerLine, maxLines) {
  const words = String(text || "").trim().split(/\s+/);
  const lines = [];
  let atual = "";
  for (const w of words) {
    const tentativa = atual ? `${atual} ${w}` : w;
    if (tentativa.length > maxCharsPerLine && atual) { lines.push(atual); atual = w; } else { atual = tentativa; }
    if (lines.length === maxLines) break;
  }
  if (atual && lines.length < maxLines) lines.push(atual);
  return lines;
}

async function gerarOverlayTexto(dados) {
  const titulo = wrapText(dados.titulo || "Imóvel", 24, 2);
  const localizacao = `${dados.bairro || ""}, ${dados.cidade || ""} - ${dados.uf || "SP"}`;
  const preco = dados.preco || "";
  const tituloSvg = titulo.map((l, i) => `<tspan x="64" dy="${i === 0 ? 0 : 52}">${esc(l)}</tspan>`).join("");

  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.78"/>
    </linearGradient>
  </defs>
  <rect x="0" y="${H - 480}" width="${W}" height="480" fill="url(#fade)"/>
  <rect x="64" y="${H - 400}" width="200" height="44" rx="22" fill="${BRAND_COLOR}"/>
  <text x="164" y="${H - 370}" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF">MARCIO SANTOS</text>
  <text font-family="Georgia, 'Times New Roman', serif" font-size="46" font-weight="700" fill="#FFFFFF" x="64" y="${H - 300}">${tituloSvg}</text>
  <text x="64" y="${H - 220}" font-family="Arial, sans-serif" font-size="26" fill="#EDEDED">${esc(localizacao)}</text>
  <text x="64" y="${H - 160}" font-family="Georgia, 'Times New Roman', serif" font-size="44" font-weight="700" fill="#FFFFFF">${esc(preco)}</text>
  <text x="64" y="${H - 100}" font-family="Arial, sans-serif" font-size="22" fill="#D8D8D8">imoveis-itu-salto.com.br</text>
</svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function gerarCardEncerramento(dados, config) {
  const iconPath = path.join(ROOT, "assets", "logo-icone-marcio-santos.png");
  const iconBuffer = fs.existsSync(iconPath) ? await sharp(iconPath).resize({ height: 220 }).toBuffer() : null;
  const iconMeta = iconBuffer ? await sharp(iconBuffer).metadata() : null;
  const whatsapp = config?.corretor?.whatsapp || "";
  const numLocal = whatsapp.replace(/^55/, "");
  const whatsappFmt = numLocal.length === 11
    ? numLocal.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")
    : numLocal.length === 10
      ? numLocal.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3")
      : whatsapp;

  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2A211B"/>
      <stop offset="100%" stop-color="#12100E"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <text x="${W / 2}" y="${H / 2 - 60}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="52" font-weight="700" fill="#FFFFFF">Quer saber mais?</text>
  <rect x="${W / 2 - 260}" y="${H / 2 + 10}" width="520" height="86" rx="43" fill="${BRAND_COLOR}"/>
  <text x="${W / 2}" y="${H / 2 + 63}" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="700" fill="#FFFFFF">WhatsApp ${esc(whatsappFmt || "")}</text>
  <text x="${W / 2}" y="${H / 2 + 160}" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#D8D2C6">imoveis-itu-salto.com.br</text>
</svg>`;

  let canvas = sharp(Buffer.from(svg));
  if (iconBuffer && iconMeta) {
    canvas = canvas.composite([{ input: iconBuffer, left: Math.round(W / 2 - iconMeta.width / 2), top: H / 2 - 380 }]);
  }
  return canvas.png().toBuffer();
}

function gerarClipeFoto(fotoPath, outPath, indice, duracao) {
  const zoomIn = indice % 2 === 0;
  const panRight = Math.floor(indice / 2) % 2 === 0;
  const frames = Math.round(duracao * FPS);
  const zExpr = zoomIn ? `min(zoom+0.0012,1.16)` : `if(eq(on,0),1.16,max(zoom-0.0012,1.0))`;
  const xExpr = panRight ? `(iw-iw/zoom)/2+((iw-iw/zoom)/2)*0.5*on/${frames}` : `(iw-iw/zoom)/2-((iw-iw/zoom)/2)*0.5*on/${frames}`;
  ffmpeg([
    "-loop", "1", "-i", fotoPath,
    "-vf", `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2},zoompan=z='${zExpr}':x='${xExpr}':y='(ih-ih/zoom)/2':d=${frames}:s=${W}x${H}:fps=${FPS},format=yuv420p`,
    "-t", String(duracao),
    "-c:v", "libx264", "-preset", "veryfast",
    outPath,
  ]);
}

function gerarClipeEstatico(imgPath, outPath, duracao) {
  ffmpeg([
    "-loop", "1", "-i", imgPath,
    "-vf", `scale=${W}:${H},format=yuv420p`,
    "-t", String(duracao),
    "-c:v", "libx264", "-preset", "veryfast",
    outPath,
  ]);
}

function concatenarComCrossfade(clipes, duracoes, outPath) {
  const inputs = clipes.flatMap((c) => ["-i", c]);
  let cumulativa = duracoes[0];
  const partes = [];
  let labelAnterior = "0:v";
  for (let i = 1; i < clipes.length; i++) {
    const offset = Math.max(cumulativa - DUR_TRANSICAO, 0);
    const labelSaida = i === clipes.length - 1 ? "vout" : `v${i}`;
    partes.push(`[${labelAnterior}][${i}:v]xfade=transition=fade:duration=${DUR_TRANSICAO}:offset=${offset.toFixed(3)}[${labelSaida}]`);
    labelAnterior = labelSaida;
    cumulativa = cumulativa + duracoes[i] - DUR_TRANSICAO;
  }
  const filterComplex = partes.join(";");
  ffmpeg([
    ...inputs,
    "-filter_complex", filterComplex,
    "-map", clipes.length > 1 ? "[vout]" : "0:v",
    "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
    outPath,
  ]);
  return cumulativa;
}

async function gerarVideo(dados, fotosPaths, trilha, config, outPath) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "reel-"));
  try {
    const numFotos = Math.min(fotosPaths.length, MAX_FOTOS);
    const segundosPorFoto = numFotos < MIN_FOTOS_PARA_ESTICAR ? SEGUNDOS_POR_FOTO * 1.6 : SEGUNDOS_POR_FOTO;

    const clipes = [];
    const duracoes = [];
    fotosPaths.slice(0, MAX_FOTOS).forEach((fotoPath, i) => {
      const clipePath = path.join(tmpDir, `clip${i}.mp4`);
      gerarClipeFoto(fotoPath, clipePath, i, segundosPorFoto);
      clipes.push(clipePath);
      duracoes.push(segundosPorFoto);
    });

    const ctaBuffer = await gerarCardEncerramento(dados, config);
    const ctaImgPath = path.join(tmpDir, "cta.png");
    fs.writeFileSync(ctaImgPath, ctaBuffer);
    const ctaClipPath = path.join(tmpDir, "cta.mp4");
    gerarClipeEstatico(ctaImgPath, ctaClipPath, DUR_CTA);
    clipes.push(ctaClipPath);
    duracoes.push(DUR_CTA);

    const semTextoPath = path.join(tmpDir, "sem-texto.mp4");
    const duracaoTotal = concatenarComCrossfade(clipes, duracoes, semTextoPath);

    const overlayBuffer = await gerarOverlayTexto(dados);
    const overlayPath = path.join(tmpDir, "overlay.png");
    fs.writeFileSync(overlayPath, overlayBuffer);
    const duracaoFotos = duracaoTotal - DUR_CTA + DUR_TRANSICAO;

    const comOverlayPath = path.join(tmpDir, "com-overlay.mp4");
    ffmpeg([
      "-i", semTextoPath, "-i", overlayPath,
      "-filter_complex",
      `[1:v]fade=t=in:st=0.2:d=0.5:alpha=1[ov];[0:v][ov]overlay=0:0:enable='lt(t,${duracaoFotos.toFixed(3)})':format=auto,fade=t=in:st=0:d=0.4,fade=t=out:st=${(duracaoTotal - 0.5).toFixed(3)}:d=0.5`,
      "-c:v", "libx264", "-preset", "veryfast", "-pix_fmt", "yuv420p",
      comOverlayPath,
    ]);

    const trilhaPath = path.join(ROOT, "assets", "trilhas", `${trilha}.mp3`);
    ffmpeg([
      "-i", comOverlayPath,
      "-i", trilhaPath,
      "-shortest",
      "-af", `afade=t=in:st=0:d=1,afade=t=out:st=${Math.max(duracaoTotal - 1.5, 0).toFixed(3)}:d=1.5,volume=0.85`,
      "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
      outPath,
    ]);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

function ffmpegDisponivel() {
  try {
    ffmpegSilencioso(["-version"]);
    return true;
  } catch {
    return false;
  }
}

function hashSlug(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

async function gerarParaImovel(slug) {
  if (!ffmpegDisponivel()) {
    console.log("  ⚠️  ffmpeg não encontrado neste ambiente — pulando geração de vídeo.");
    return;
  }
  const imovelDir = path.join(ROOT, "imoveis", slug);
  const dadosPath = path.join(imovelDir, "dados.json");
  if (!fs.existsSync(dadosPath)) {
    console.log(`  ⚠️  ${slug}: dados.json não existe — pulando vídeo.`);
    return;
  }
  const dados = JSON.parse(fs.readFileSync(dadosPath, "utf8"));
  if (dados.rascunho) return;

  const fotos = (dados.fotos || []);
  if (!fotos.length) {
    console.log(`  ⚠️  ${slug}: sem fotos — pulando vídeo.`);
    return;
  }
  // O reel usa exatamente as fotos que o corretor marcou "usar nas redes sociais" no admin,
  // na mesma ordem em que aparecem na galeria — as mesmas que vão pro carrossel do Instagram.
  // Imóveis antigos, publicados antes dessa marcação existir, não têm nenhuma foto com
  // .social=true — nesse caso cai no comportamento antigo (as primeiras fotos da galeria).
  const selecionadas = fotos.filter((f) => f.social);
  const fotosParaVideo = (selecionadas.length ? selecionadas : fotos).slice(0, MAX_FOTOS);
  const fotosPaths = fotosParaVideo
    .map((f) => path.join(imovelDir, "fotos", f.arquivo))
    .filter((p) => fs.existsSync(p));
  if (!fotosPaths.length) {
    console.log(`  ⚠️  ${slug}: fotos referenciadas não encontradas em disco — pulando vídeo.`);
    return;
  }

  const config = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
  const trilha = TRILHAS.includes(dados.trilhaSonora) ? dados.trilhaSonora : TRILHAS[hashSlug(slug) % TRILHAS.length];

  const outDir = path.join(ROOT, "docs", "imoveis", slug);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "reel.mp4");
  await gerarVideo(dados, fotosPaths, trilha, config, outPath);
  console.log(`  🎬 reel.mp4 gerado para ${slug} (trilha: ${TRILHA_LABEL[trilha] || trilha})`);
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
      console.error(`  ❌ ${slug}: falha ao gerar vídeo — ${err.message}`);
    }
  }
}

module.exports = { gerarParaImovel, TRILHAS, TRILHA_LABEL };

if (require.main === module) {
  main();
}
