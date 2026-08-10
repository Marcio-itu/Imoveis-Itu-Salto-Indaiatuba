#!/usr/bin/env node
// scripts/publish-social.js
//
// Publica o imóvel recém-adicionado/alterado no Instagram (@corretor_marcio_itu)
// via Graph API v26.0. Roda depois do build (precisa que /docs já tenha as fotos
// em .webp publicadas em produção, pois o Instagram busca a imagem por URL pública).
//
// Uso:
//   node scripts/publish-social.js                        (detecta o imóvel pelo git diff)
//   node scripts/publish-social.js --slug=casa-praia-preta
//   node scripts/publish-social.js --slug=casa-praia-preta --dry-run
//   node scripts/publish-social.js --slug=casa-praia-preta --force   (republica mesmo já tendo social_log.json)
//
// Variáveis de ambiente:
//   INSTAGRAM_ACCESS_TOKEN  (obrigatório, exceto em --dry-run)
//   INSTAGRAM_USER_ID       (opcional — default é a conta @corretor_marcio_itu)
//   IMOVEL_SLUG             (alternativa ao --slug=, útil no workflow_dispatch)

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { formatPreco } = require("./utils");

const ROOT = path.join(__dirname, "..");
const IMOVEIS_DIR = path.join(ROOT, "imoveis");
const GRAPH_VERSION = "v26.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;
const DEFAULT_IG_USER_ID = "17841455795855812"; // @corretor_marcio_itu
const REPO_RAW_BASE = "https://raw.githubusercontent.com/Marcio-itu/Imoveis-Itu-Salto-Indaiatuba/main/docs";

// ---------- args / env ----------

function parseArgs(argv) {
  const out = { dryRun: false, force: false, slug: null };
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") out.dryRun = true;
    else if (a === "--force") out.force = true;
    else if (a.startsWith("--slug=")) out.slug = a.slice("--slug=".length).trim();
  }
  return out;
}

// ---------- descobrir qual(is) imóvel(is) mudou(aram) ----------

function slugsFromGitDiff() {
  let saida = "";
  try {
    saida = execSync("git diff --name-only HEAD~1 HEAD -- imoveis", {
      cwd: ROOT,
      encoding: "utf8",
    });
  } catch (err) {
    console.warn("Aviso: não consegui rodar git diff (histórico raso ou primeiro commit?):", err.message);
    return [];
  }
  const slugs = new Set();
  for (const linha of saida.split("\n")) {
    const m = linha.match(/^imoveis\/([^/]+)\//);
    if (m) slugs.add(m[1]);
  }
  return [...slugs];
}

function resolverSlugs(args) {
  if (args.slug) return [args.slug];
  // Workflow manda IMOVEL_SLUGS (plural) com um ou mais slugs separados por espaço/vírgula
  // — o job "build" detecta via git diff e repassa pro job "publish-instagram" assim,
  // porque esse segundo job faz checkout raso (sem HEAD~1 disponível).
  if (process.env.IMOVEL_SLUGS) {
    const slugs = process.env.IMOVEL_SLUGS.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (slugs.length) return slugs;
  }
  if (process.env.IMOVEL_SLUG) return [process.env.IMOVEL_SLUG.trim()];
  return slugsFromGitDiff();
}

// ---------- dados do imóvel ----------

function carregarImovel(slug) {
  const dir = path.join(IMOVEIS_DIR, slug);
  const dadosPath = path.join(dir, "dados.json");
  if (!fs.existsSync(dadosPath)) {
    throw new Error(`imoveis/${slug}/dados.json não encontrado`);
  }
  const imovel = JSON.parse(fs.readFileSync(dadosPath, "utf8"));
  imovel._dir = dir;
  return imovel;
}

function carregarConfig() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
}

// Reproduz a mesma transformação de nome que scripts/build.js faz ao converter
// fotos para WebP (mantém o nome-base, troca só a extensão). A imagem pública
// vive em /docs, não em /imoveis — é lá que o Instagram consegue buscar.
function urlPublicaFoto(dominio, slug, arquivo) {
  const baseSemExt = arquivo.replace(/\.[^.]+$/, "");
  return `${dominio.replace(/\/$/, "")}/imoveis/${slug}/fotos/${baseSemExt}.webp`;
}

function urlFallbackGithub(slug, arquivo) {
  const baseSemExt = arquivo.replace(/\.[^.]+$/, "");
  return `${REPO_RAW_BASE}/imoveis/${slug}/fotos/${baseSemExt}.webp`;
}

function hashtagify(str) {
  return String(str || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function montarLegenda(imovel, config) {
  const corretor = { ...(config.corretor || {}), ...(imovel.corretor || {}) };
  const tipo = (imovel.tipo || "imóvel").replace(/^\w/, (c) => c.toUpperCase());
  const preco = formatPreco(imovel.preco).replace(/\u00A0/g, " ");

  const linhaSpecs = [
    imovel.quartos && `🛏️ ${imovel.quartos} quartos`,
    imovel.banheiros && `🚿 ${imovel.banheiros} banhos`,
    imovel.vagas && `🚗 ${imovel.vagas} vagas`,
    imovel.areaUtil && `📐 ${imovel.areaUtil}m²`,
  ].filter(Boolean).join(" | ");

  const descCurta = (imovel.descricaoCurta || "").trim();

  const hashtags = [
    "#imoveisitu", "#imoveis", "#itu", "#salto", "#indaiatuba", "#corretorimoveis",
    imovel.bairro ? `#${hashtagify(imovel.bairro)}` : null,
  ].filter(Boolean).join(" ");

  const linhas = [
    `🏡 ${tipo} em ${imovel.bairro} - ${imovel.cidade}`,
    linhaSpecs,
    `💰 ${preco}`,
    "",
    descCurta,
    "",
    `📲 Link completo na bio / WhatsApp ${corretor.whatsapp || corretor.telefone || ""} — CRECI ${corretor.creci || ""}`,
    hashtags,
  ];

  return linhas.filter((l) => l !== undefined && l !== null).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

// ---------- Graph API ----------

class GraphError extends Error {
  constructor(payload) {
    const msg = payload?.error?.message || "Erro desconhecido na Graph API";
    super(msg);
    this.code = payload?.error?.code;
    this.subcode = payload?.error?.error_subcode;
    this.payload = payload;
  }
}

async function graphCall(token, pathSegment, method, params) {
  const url = new URL(`${GRAPH_BASE}${pathSegment}`);
  let body;
  const headers = { Authorization: `Bearer ${token}` };
  if (method === "GET") {
    for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
  } else {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(params || {});
  }
  const resp = await fetch(url, { method, headers, body });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || json.error) {
    throw new GraphError(json);
  }
  return json;
}

async function aguardarContainerPronto(token, containerId, { tentativas = 12, intervaloMs = 3000 } = {}) {
  for (let i = 0; i < tentativas; i++) {
    const status = await graphCall(token, `/${containerId}`, "GET", { fields: "status_code" });
    if (status.status_code === "FINISHED") return;
    if (status.status_code === "ERROR") {
      throw new Error(`Container ${containerId} falhou no processamento (status_code=ERROR)`);
    }
    await new Promise((r) => setTimeout(r, intervaloMs));
  }
  throw new Error(`Container ${containerId} não ficou pronto (timeout)`);
}

// Cria um container de imagem, tentando a URL de produção e, se falhar, a URL crua do GitHub.
async function criarContainerImagem(token, igUserId, imageUrl, imageUrlFallback, extraParams) {
  try {
    return await graphCall(token, `/${igUserId}/media`, "POST", { image_url: imageUrl, ...extraParams });
  } catch (err) {
    console.warn(`  aviso: falhou com a URL de produção (${err.message}). Tentando fallback raw.githubusercontent...`);
    return await graphCall(token, `/${igUserId}/media`, "POST", { image_url: imageUrlFallback, ...extraParams });
  }
}

// ---------- publicação de um imóvel ----------

async function publicarImovel(slug, { dryRun, force, token, igUserId, config }) {
  console.log(`\n=== ${slug} ===`);
  const imovel = carregarImovel(slug);

  const logPath = path.join(imovel._dir, "social_log.json");
  if (fs.existsSync(logPath) && !force) {
    console.log(`  já publicado anteriormente (social_log.json existe) — pulando. Use --force para republicar.`);
    return { slug, status: "skipped" };
  }

  const fotos = (imovel.fotos || []).slice();
  if (!fotos.length) {
    console.warn(`  nenhuma foto cadastrada em imoveis/${slug}/dados.json — nada a publicar.`);
    return { slug, status: "sem-fotos" };
  }
  // hero primeiro (vira a capa do carrossel / a imagem única)
  fotos.sort((a, b) => (b.hero ? 1 : 0) - (a.hero ? 1 : 0));
  const fotosLimitadas = fotos.slice(0, 10); // limite do Instagram p/ carrossel

  const legenda = montarLegenda(imovel, config);
  const urls = fotosLimitadas.map((f) => ({
    principal: urlPublicaFoto(config.dominio, slug, f.arquivo),
    fallback: urlFallbackGithub(slug, f.arquivo),
  }));

  if (dryRun) {
    console.log(`  [dry-run] tipo: ${urls.length > 1 ? "CARROSSEL" : "IMAGEM ÚNICA"}`);
    console.log(`  [dry-run] fotos:`);
    urls.forEach((u) => console.log(`    - ${u.principal}`));
    console.log(`  [dry-run] legenda:\n---\n${legenda}\n---`);
    return { slug, status: "dry-run" };
  }

  if (!token) throw new Error("INSTAGRAM_ACCESS_TOKEN não definido no ambiente");

  let creationId;
  let tipo;

  if (urls.length === 1) {
    tipo = "single";
    const container = await criarContainerImagem(token, igUserId, urls[0].principal, urls[0].fallback, { caption: legenda });
    await aguardarContainerPronto(token, container.id);
    creationId = container.id;
  } else {
    tipo = "carousel";
    const childIds = [];
    for (const u of urls) {
      const item = await criarContainerImagem(token, igUserId, u.principal, u.fallback, { is_carousel_item: "true" });
      childIds.push(item.id);
    }
    const carouselContainer = await graphCall(token, `/${igUserId}/media`, "POST", {
      media_type: "CAROUSEL",
      children: childIds.join(","),
      caption: legenda,
    });
    await aguardarContainerPronto(token, carouselContainer.id);
    creationId = carouselContainer.id;
  }

  const publicado = await graphCall(token, `/${igUserId}/media_publish`, "POST", { creation_id: creationId });
  const detalhes = await graphCall(token, `/${publicado.id}`, "GET", { fields: "permalink" }).catch(() => ({}));

  const log = {
    slug,
    tipo,
    instagram_media_id: publicado.id,
    permalink: detalhes.permalink || null,
    publicadoEm: new Date().toISOString(),
    fotosPublicadas: urls.map((u) => u.principal),
  };
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2) + "\n");
  console.log(`  publicado: ${log.permalink || log.instagram_media_id}`);
  return { slug, status: "ok", log };
}

// ---------- main ----------

async function main() {
  const args = parseArgs(process.argv);
  const config = carregarConfig();
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const igUserId = process.env.INSTAGRAM_USER_ID || DEFAULT_IG_USER_ID;

  const slugs = resolverSlugs(args);
  if (!slugs.length) {
    console.log("Nenhum imóvel alterado detectado (git diff vazio) e nenhum --slug/IMOVEL_SLUG informado. Nada a fazer.");
    return;
  }

  const resultados = [];
  for (const slug of slugs) {
    try {
      const r = await publicarImovel(slug, { dryRun: args.dryRun, force: args.force, token, igUserId, config });
      resultados.push(r);
    } catch (err) {
      if (err instanceof GraphError && err.code === 190) {
        console.error(`  [${slug}] TOKEN EXPIRADO - renovar em developers.facebook.com`);
      } else {
        console.error(`  [${slug}] erro ao publicar: ${err.message}`);
      }
      resultados.push({ slug, status: "erro", erro: err.message });
    }
  }

  const falhas = resultados.filter((r) => r.status === "erro");
  console.log(`\nResumo: ${resultados.length} imóvel(is) processado(s), ${falhas.length} falha(s).`);
  // Não derruba o processo com exit code != 0 por falha de publicação social —
  // o workflow já roda este script com continue-on-error: true, mas mantemos
  // isso aqui também para quem rodar o script manualmente sem essa proteção.
}

main().catch((err) => {
  console.error("Erro fatal em publish-social.js:", err.message);
  process.exit(1);
});
