// scripts/publish-social.js
//
// Publica automaticamente no Instagram (feed, foto única ou carrossel) o imóvel que
// acabou de ser adicionado/atualizado em imoveis/**. Roda depois do build (precisa das
// fotos .webp já geradas em docs/imoveis/{slug}/fotos/, que são as que ficam públicas).
//
// Como descobrir qual imóvel publicar (nessa ordem de prioridade):
//   1. --slug=algum-slug                       (uso manual/local)
//   2. IMOVEL_SLUG=algum-slug                   (um slug só — é o que o workflow usa)
//   3. IMOVEL_SLUG="algum-slug outro-slug"      (vários, separados por espaço, dentro da mesma variável)
//   4. git diff --name-only HEAD~1              (fallback automático: descobre sozinho o que mudou em imoveis/)
//
// Uso local pra testar sem publicar de verdade:
//   node scripts/publish-social.js --slug=casa-praia-preta --dry-run
//
// Graph API v26.0. Sem dependências além do fetch nativo do Node 20.

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const GRAPH = "https://graph.facebook.com/v26.0";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const slugArg = args.find((a) => a.startsWith("--slug="));

const IG_USER_ID_PADRAO = "17841455795855812";
const IG_USER_ID_RAW = process.env.INSTAGRAM_USER_ID || IG_USER_ID_PADRAO;
// Proteção contra o clássico bug do YAML/Actions: um número grande sem aspas no workflow
// (ex.: INSTAGRAM_USER_ID: 17841455795855812) pode chegar aqui já convertido para
// "1.78414557958558E+16" pelo parser do runner — e nesse ponto os últimos dígitos já
// foram perdidos (não dá pra reconstruir o ID original a partir da notação científica).
// Isso quebra a Graph API com "Object ... does not exist", difícil de diagnosticar pelo
// log. Em vez de tentar "consertar" um número já corrompido, ignoramos e caímos pro ID
// correto que já sabemos ser o certo.
const veioCorrompido = /e\+?\d/i.test(IG_USER_ID_RAW) || /\./.test(IG_USER_ID_RAW);
const IG_USER_ID = veioCorrompido ? IG_USER_ID_PADRAO : IG_USER_ID_RAW;
if (veioCorrompido) {
  console.error(
    `  aviso: INSTAGRAM_USER_ID chegou corrompido em notação científica (${IG_USER_ID_RAW}) — falta aspas em volta do valor no workflow (ex.: INSTAGRAM_USER_ID: "${IG_USER_ID_PADRAO}"). Usando o ID padrão (${IG_USER_ID}) como proteção, mas corrija o workflow.`
  );
}
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || "";

// IDs criados hoje (09/05/2026)
const PAGE_ID = process.env.FACEBOOK_PAGE_ID || "111021645138305"; // Imóveis Itu Salto Sorocaba
const CATALOG_ID = process.env.CATALOG_ID || "925058123358743"; // Catalog_Real_Estate
const BUSINESS_ID = "858693698625808";


// --- utilidades ---------------------------------------------------------

function log(...parts) {
  console.log(...parts);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function semAcentos(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function slugParaHashtag(str) {
  return semAcentos(str).replace(/[^a-z0-9]/g, "");
}

// Descobre quais imóveis (slugs) mudaram nesse push, na ordem de prioridade descrita acima.
// IMOVEL_SLUG aceita um slug só ("casa-praia-preta") ou vários separados por espaço
// ("casa-praia-preta terreno-em-salto"), sempre no singular — é a única variável que
// o workflow usa pra passar isso pro script.
function detectarSlugs() {
  if (slugArg) return [slugArg.split("=")[1]];
  if (process.env.IMOVEL_SLUG) {
    return process.env.IMOVEL_SLUG.split(/\s+/).filter(Boolean);
  }
  try {
    const diff = execSync("git diff --name-only HEAD~1 HEAD -- imoveis/", {
      cwd: ROOT,
      encoding: "utf8",
    });
    const slugs = new Set();
    for (const linha of diff.split("\n")) {
      const m = linha.match(/^imoveis\/([^/]+)\//);
      if (m) slugs.add(m[1]);
    }
    return [...slugs];
  } catch (err) {
    log("  aviso: não consegui rodar git diff pra detectar o imóvel alterado:", err.message);
    return [];
  }
}

// --- montagem da legenda -------------------------------------------------

function montarLegenda(dados, config) {
  const linhas = [];
  linhas.push(`🏡 ${dados.titulo || "Imóvel"}`);
  linhas.push(`${dados.bairro}, ${dados.cidade} - ${dados.uf || "SP"}`);
  if (dados.preco) linhas.push(`💰 ${dados.preco}`);

  // FICHA TÉCNICA — os mesmos números da seção "Ficha técnica" do site (nem mais nem menos).
  const specs = [];
  if (dados.quartos) specs.push(`🛏️ ${dados.quartos} quartos`);
  if (dados.suites) specs.push(`${dados.suites} suítes`);
  if (dados.banheiros) specs.push(`🚿 ${dados.banheiros} banheiros`);
  if (dados.vagas) specs.push(`🚗 ${dados.vagas} vagas`);
  if (dados.areaUtil) specs.push(`📐 ${dados.areaUtil}m² úteis`);
  if (dados.areaTerreno) specs.push(`${dados.areaTerreno}m² de terreno`);
  if (specs.length) linhas.push("", "FICHA TÉCNICA", specs.join(" | "));

  // DESTAQUE — os mesmos Diferenciais da seção "Destaques" do site.
  if ((dados.diferenciais || []).length) {
    linhas.push("", "DESTAQUE", dados.diferenciais.join(", "));
  }

  // SOBRE ESTE IMÓVEL — mesmo título, frase de efeito e parágrafos da seção "Sobre o imóvel" do site.
  const textoReal = dados.resumo || dados.descricaoCurta;
  if (textoReal || (dados.descricaoLonga || []).length) {
    linhas.push("", (dados.tituloSecao || "SOBRE ESTE IMÓVEL").toUpperCase());
    if (textoReal) linhas.push(textoReal);
    (dados.descricaoLonga || []).forEach((p) => linhas.push(p));
  }

  // Os dois avisos — texto idêntico ao rodapé da seção "Sobre o imóvel" do site.
  const instagramsParceria = (dados.parceria?.instagrams || []);
  linhas.push(
    "",
    `✍️ As informações disponíveis neste momento foram elaboradas com o máximo de cuidado e fornecidas diretamente pelo proprietário ou corretor parceiro${instagramsParceria.length ? `: ${instagramsParceria.map((h) => `@${h.replace(/^@/, "")}`).join(", ")}` : ""}.`,
    "⚠️ Em respeito à boa-fé objetiva (art. 422 do CC), o preço vigente será confirmado no contato antes da formalização de qualquer proposta."
  );

  const whatsapp = config?.corretor?.whatsapp || "";
  const creci = config?.corretor?.creci || "";
  linhas.push("", `📲 Link completo na bio / WhatsApp ${whatsapp} CRECI ${creci}`);

  const bairroTag = slugParaHashtag(dados.bairro || "");
  const hashtags = ["#imoveisitu", "#imoveis", "#itu", "#salto", "#indaiatuba", "#corretorimoveis"];
  if (bairroTag) hashtags.push(`#${bairroTag}`);
  linhas.push(hashtags.join(" "));

  let legenda = linhas.join("\n");

  // Instagram recusa legenda com mais de 2200 caracteres — corta preservando o fim
  // (link/CRECI/hashtags), que é a parte que não pode faltar.
  const LIMITE_INSTAGRAM = 2200;
  if (legenda.length > LIMITE_INSTAGRAM) {
    const rodape = linhas.slice(-3).join("\n"); // link + CRECI + hashtags
    const corpoDisponivel = LIMITE_INSTAGRAM - rodape.length - 20;
    legenda = legenda.slice(0, corpoDisponivel).trim() + "…\n\n" + rodape;
  }

  return legenda;
}

// --- URLs públicas das fotos ---------------------------------------------

// dados.json (fonte, em imoveis/) referencia .jpg/.png; depois do build, a versão
// pública em docs/imoveis/{slug}/fotos/ é sempre .webp com o mesmo nome-base.
function urlPublicaFoto(config, slug, nomeArquivo) {
  const dominio = config.dominio.replace(/\/$/, "");
  const baseSemExt = nomeArquivo.replace(/\.[^.]+$/, "");
  return `${dominio}/imoveis/${slug}/fotos/${baseSemExt}.webp`;
}

function urlRawGithubFallback(slug, nomeArquivo) {
  const baseSemExt = nomeArquivo.replace(/\.[^.]+$/, "");
  return `https://raw.githubusercontent.com/Marcio-itu/Imoveis-Itu-Salto-Indaiatuba/main/docs/imoveis/${slug}/fotos/${baseSemExt}.webp`;
}

function listarFotos(dados) {
  const fotos = (dados.fotos || []).slice();
  // --- FILTRO ANTI-REJEIÇÃO INSTAGRAM ---
  // Instagram rejeita imagens com muito texto/gráfico (planta baixa, card comercial)
  // Essas fotos continuam no site, mas não vão pro Instagram
  const TERMOS_BLOQUEADOS = ['planta', 'baixa', 'comercial', 'card', 'capa-comercial', 'logo', 'capa', 'anuncio', 'banner'];
  const fotosFiltradas = fotos.filter(f => {
    const nome = (f.arquivo || '').toLowerCase();
    const ambiente = (f.ambiente || '').toLowerCase();
    // Se o nome contém termo bloqueado, pula
    if (TERMOS_BLOQUEADOS.some(t => nome.includes(t) && !nome.includes('fachada') && !nome.includes('frente'))) {
        // exceção: permite se for explicitamente fachada, mas planta mesmo bloqueia
        if (nome.includes('planta')) return false;
        if (nome.includes('comercial-card') || nome.includes('capa-comercial')) return false;
    }
    // Checagem mais precisa
    if (/planta.*baixa|comercial.*card|capa.comercial/i.test(nome)) return false;
    return true;
  });
  
  const listaFinal = fotosFiltradas.length >= 1 ? fotosFiltradas : fotos; // fallback: se filtrar tudo, usa original
  if (fotosFiltradas.length < fotos.length) {
    console.log(`  filtro: ${fotos.length - fotosFiltradas.length} foto(s) comercial/planta removida(s) do Instagram`);
  }
  
  // hero primeiro, se marcada
  listaFinal.sort((a, b) => (b.hero ? 1 : 0) - (a.hero ? 1 : 0));
  return listaFinal.slice(0, 10); // limite do Instagram para carrossel
}

// --- chamadas à Graph API -------------------------------------------------

async function graphPost(pathSegment, body) {
  const url = `${GRAPH}/${pathSegment}`;
  const params = new URLSearchParams({ ...body, access_token: ACCESS_TOKEN });
  const res = await fetch(url, { method: "POST", body: params });
  const data = await res.json();
  if (!res.ok || data.error) {
    const err = data.error || {};
    if (err.code === 190) {
      console.error("TOKEN EXPIRADO - renovar em developers.facebook.com");
    }
    const msg = err.message || `HTTP ${res.status}`;
    throw new Error(`Graph API (${pathSegment}): ${msg}`);
  }
  return data;
}

async function aguardarContainerPronto(containerId, tentativas = 10) {
  for (let i = 0; i < tentativas; i++) {
    const url = `${GRAPH}/${containerId}?fields=status_code&access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status_code === "FINISHED") return true;
    if (data.status_code === "ERROR") throw new Error(`Container ${containerId} falhou (status ERROR)`);
    await sleep(2000);
  }
  return false; // segue tentando publicar mesmo assim; o media_publish acusa se não estiver pronto
}

async function criarItemCarrossel(imageUrl) {
  const data = await graphPost(`${IG_USER_ID}/media`, {
    image_url: imageUrl,
    is_carousel_item: "true",
  });
  return data.id;
}

async function publicarFotoUnica(imageUrl, legenda) {
  const container = await graphPost(`${IG_USER_ID}/media`, {
    image_url: imageUrl,
    caption: legenda,
  });
  await aguardarContainerPronto(container.id);
  return graphPost(`${IG_USER_ID}/media_publish`, { creation_id: container.id });
}

async function publicarCarrossel(imageUrls, legenda) {
  const ids = [];
  for (const url of imageUrls) {
    const id = await criarItemCarrossel(url);
    ids.push(id);
  }
  const container = await graphPost(`${IG_USER_ID}/media`, {
    media_type: "CAROUSEL",
    caption: legenda,
    children: ids.join(","),
  });
  await aguardarContainerPronto(container.id);
  return graphPost(`${IG_USER_ID}/media_publish`, { creation_id: container.id });
}

// tenta a URL pública do domínio; se o Instagram não conseguir baixar (erro típico de
// image_url), tenta de novo com a URL raw do GitHub como plano B
async function comFallbackDeUrl(fn, urlPrincipal, urlFallback) {
  try {
    return await fn(urlPrincipal);
  } catch (err) {
    if (/image_url|does not exist|malformed|400/i.test(err.message)) {
      log(`  aviso: falhou com a URL do domínio (${err.message}). Tentando raw.githubusercontent.com...`);
      return fn(urlFallback);
    }
    throw err;
  }
}

// --- Facebook Page + Catálogo -------------------------------------------

async function publicarNaPaginaFacebook(slug, dados, fotos, legenda, config) {
  if (!PAGE_ID) {
    log("  FB Page: PAGE_ID não configurado - pulando");
    return null;
  }
  try {
    // Para Facebook Page, podemos usar todas as fotos (inclui planta, etc)
    // mas o Facebook também prefere fotos reais. Vamos usar as filtradas do Instagram mesmo
    const urls = fotos.map(f => urlPublicaFoto(config, slug, f.arquivo));
    
    if (fotos.length === 1) {
      log(`  FB Page: publicando foto única na página ${PAGE_ID}...`);
      const data = await graphPost(`${PAGE_ID}/photos`, {
        url: urls[0],
        caption: legenda,
      });
      log(`  ✅ FB Page foto: id=${data.id || data.post_id}`);
      return data;
    } else {
      // Carrossel na Page: precisa upload unpublished + feed com attached_media
      log(`  FB Page: publicando carrossel com ${urls.length} fotos na página ${PAGE_ID}...`);
      const mediaIds = [];
      for (const url of urls) {
        const up = await graphPost(`${PAGE_ID}/photos`, {
          url: url,
          published: "false",
        });
        mediaIds.push(up.id);
        await sleep(800);
      }
      const attached = mediaIds.map(id => ({ media_fbid: id }));
      const feed = await graphPost(`${PAGE_ID}/feed`, {
        message: legenda,
        attached_media: JSON.stringify(attached),
      });
      log(`  ✅ FB Page carrossel: id=${feed.id}`);
      return feed;
    }
  } catch (err) {
    console.error(`  ⚠️ FB Page falhou (não crítico): ${err.message}`);
    return null;
  }
}

async function publicarNoCatalogo(slug, dados, fotos, config) {
  if (!CATALOG_ID) {
    log("  Catálogo: CATALOG_ID não configurado - pulando");
    return null;
  }
  try {
    // Monta dados pro formato HOME_LISTING do Facebook
    const precoNumerico = parseInt((dados.preco || '').replace(/[^0-9]/g, '')) || 0;
    const imagemPrincipal = fotos[0] ? urlPublicaFoto(config, slug, fotos[0].arquivo) : '';
    const todasImagens = fotos.map(f => ({ url: urlPublicaFoto(config, slug, f.arquivo) }));
    
    const homeListing = {
      home_listing_id: slug,
      name: (dados.titulo || slug).slice(0, 100),
      description: (dados.resumo || dados.descricaoCurta || dados.titulo || '').slice(0, 5000),
      address: {
        city: dados.cidade || 'Itu',
        region: dados.uf || 'SP',
        country: 'BR',
        neighborhood: dados.bairro || '',
      },
      availability: 'available',
      listing_type: 'for_sale',
      property_type: (dados.tipo || '').toLowerCase().includes('casa') ? 'house' : 'house',
      price: precoNumerico,
      currency: 'BRL',
      num_beds: parseInt(dados.quartos) || 0,
      num_baths: parseInt(dados.banheiros) || 0,
      image: todasImagens.slice(0, 20),
      url: `${config.dominio.replace(/\/$/, "")}/imoveis/${slug}/`,
    };
    
    // Remove campos vazios
    if (!homeListing.price) delete homeListing.price;
    
    log(`  Catálogo ${CATALOG_ID}: enviando ${slug}...`);
    
    const payload = {
      access_token: ACCESS_TOKEN,
      item_type: 'HOME_LISTING',
      requests: JSON.stringify([{
        method: 'CREATE',
        data: homeListing
      }])
    };
    
    const url = `${GRAPH}/${CATALOG_ID}/items_batch`;
    const params = new URLSearchParams(payload);
    const res = await fetch(url, { method: 'POST', body: params });
    const data = await res.json();
    
    if (!res.ok || data.error) {
      throw new Error(data.error?.message || JSON.stringify(data));
    }
    
    log(`  ✅ Catálogo: ${slug} enviado - ${JSON.stringify(data).slice(0, 200)}`);
    return data;
  } catch (err) {
    // Se já existe, tenta UPDATE
    if (/already exists|duplicate|already being used/i.test(err.message)) {
      try {
        log(`  Catálogo: ${slug} já existe, tentando UPDATE...`);
        const precoNumerico = parseInt((dados.preco || '').replace(/[^0-9]/g, '')) || 0;
        const imagemPrincipal = fotos[0] ? urlPublicaFoto(config, slug, fotos[0].arquivo) : '';
        const homeListing = {
          home_listing_id: slug,
          name: (dados.titulo || slug).slice(0, 100),
          price: precoNumerico,
          currency: 'BRL',
          availability: 'available',
          url: `${config.dominio.replace(/\/$/, "")}/imoveis/${slug}/`,
        };
        const payload = {
          access_token: ACCESS_TOKEN,
          item_type: 'HOME_LISTING',
          requests: JSON.stringify([{
            method: 'UPDATE',
            data: homeListing
          }])
        };
        const url = `${GRAPH}/${CATALOG_ID}/items_batch`;
        const params = new URLSearchParams(payload);
        const res = await fetch(url, { method: 'POST', body: params });
        const data = await res.json();
        log(`  ✅ Catálogo UPDATE: ${slug}`);
        return data;
      } catch (e2) {
        console.error(`  ⚠️ Catálogo UPDATE falhou: ${e2.message}`);
      }
    }
    console.error(`  ⚠️ Catálogo falhou (não crítico): ${err.message}`);
    return null;
  }
}

// --- publicação de um imóvel ----------------------------------------------

// Confere se cada URL de foto já está respondendo (200 e com corpo de verdade, não uma
// página de erro do GitHub Pages) antes de mandar pro Instagram — evita o erro "Only photo
// or video can be accepted as media type" que acontece quando o Instagram busca a imagem
// antes do CDN terminar de propagar o arquivo recém-publicado.
async function aguardarFotosDisponiveis(urls, tentativas = 6, esperaMs = 5000) {
  for (const url of urls) {
    let ok = false;
    for (let i = 0; i < tentativas && !ok; i++) {
      try {
        const res = await fetch(url, { method: "HEAD" });
        if (res.ok) {
          ok = true;
        } else if (i < tentativas - 1) {
          log(`  aguardando foto ficar disponível (tentativa ${i + 1}/${tentativas}, status ${res.status}): ${url}`);
          await sleep(esperaMs);
        }
      } catch {
        if (i < tentativas - 1) await sleep(esperaMs);
      }
    }
    if (!ok) log(`  aviso: ${url} não respondeu 200 depois de ${tentativas} tentativas — publicando mesmo assim.`);
  }
}

async function publicarImovel(slug, config) {
  const imovelDir = path.join(ROOT, "imoveis", slug);
  const dadosPath = path.join(imovelDir, "dados.json");
  if (!fs.existsSync(dadosPath)) {
    log(`  ⚠️  ${slug}: imoveis/${slug}/dados.json não existe (imóvel removido?) — pulando.`);
    return;
  }

  const dados = readJSON(dadosPath);
  if (dados.rascunho) {
    log(`  📝 ${slug}: ainda é rascunho — pulando publicação social até ser publicado de verdade.`);
    return;
  }
  const fotos = listarFotos(dados);
  if (!fotos.length) {
    log(`  ⚠️  ${slug}: sem fotos cadastradas — pulando.`);
    return;
  }

  const legenda = montarLegenda(dados, config);
  const urls = fotos.map((f) => urlPublicaFoto(config, slug, f.arquivo));
  const urlsFallback = fotos.map((f) => urlRawGithubFallback(slug, f.arquivo));

  log(`\n📸 ${slug}: ${fotos.length} foto(s), publicando como ${fotos.length === 1 ? "imagem única" : "carrossel"}`);
  log("--- legenda ---");
  log(legenda);
  log("--- fotos ---");
  urls.forEach((u) => log(" -", u));

  if (!DRY_RUN) {
    // O commit que sobe as fotos e o commit que dispara este script acontecem quase juntos —
    // o Instagram pode tentar buscar a imagem antes do CDN do GitHub Pages terminar de servir
    // o arquivo novo. Confirma que cada URL já responde 200 antes de mandar pro Graph API,
    // esperando um pouco e tentando de novo se ainda não estiver pronta.
    await aguardarFotosDisponiveis(urls);
  }

  if (DRY_RUN) {
    log("  (dry-run: nada foi enviado à Meta Graph API)");
    return;
  }

  if (!ACCESS_TOKEN) {
    console.error("  ❌ INSTAGRAM_ACCESS_TOKEN não configurado — pulando publicação.");
    return;
  }

  let resultado;
  if (fotos.length === 1) {
    resultado = await comFallbackDeUrl(
      (url) => publicarFotoUnica(url, legenda),
      urls[0],
      urlsFallback[0]
    );
  } else {
    try {
      resultado = await publicarCarrossel(urls, legenda);
    } catch (err) {
      if (/image_url|does not exist|malformed|400/i.test(err.message)) {
        log(`  aviso: carrossel falhou com URLs do domínio (${err.message}). Tentando raw.githubusercontent.com...`);
        resultado = await publicarCarrossel(urlsFallback, legenda);
      } else {
        throw err;
      }
    }
  }

  const mediaId = resultado.id;
  const permalink = await buscarPermalink(mediaId);
  salvarLog(imovelDir, { instagram_media_id: mediaId, permalink, data: new Date().toISOString() });
  log(`  ✅ Instagram publicado! media_id=${mediaId}${permalink ? " permalink=" + permalink : ""}`);

  // 2. Publica na Página do Facebook (Imóveis Itu Salto Sorocaba - 111021645138305)
  await publicarNaPaginaFacebook(slug, dados, fotos, legenda, config);

  // 3. Publica no Catálogo Real Estate (925058123358743)
  await publicarNoCatalogo(slug, dados, fotos, config);
}

async function buscarPermalink(mediaId) {
  try {
    const url = `${GRAPH}/${mediaId}?fields=permalink&access_token=${ACCESS_TOKEN}`;
    const res = await fetch(url);
    const data = await res.json();
    return data.permalink || null;
  } catch {
    return null;
  }
}

function salvarLog(imovelDir, entrada) {
  const logPath = path.join(imovelDir, "social_log.json");
  let log_ = [];
  if (fs.existsSync(logPath)) {
    try {
      log_ = JSON.parse(fs.readFileSync(logPath, "utf8"));
      if (!Array.isArray(log_)) log_ = [log_];
    } catch {
      log_ = [];
    }
  }
  log_.push(entrada);
  fs.writeFileSync(logPath, JSON.stringify(log_, null, 2));
}

// Só comita o social_log.json quando roda dentro do GitHub Actions (evita mexer no
// git local de quem está só testando/rodando na máquina).
function commitarLogsSeNecessario() {
  if (DRY_RUN || !process.env.GITHUB_ACTIONS) return;
  // só tenta comitar se pelo menos um social_log.json existe de fato — evita o
  // "fatal: pathspec ... did not match any files" quando nenhuma publicação deu certo
  // (glob sem match nenhum faz o git falhar "duro", mesmo sendo uma situação normal).
  const algumLogExiste = fs
    .readdirSync(path.join(ROOT, "imoveis"), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .some((d) => fs.existsSync(path.join(ROOT, "imoveis", d.name, "social_log.json")));
  if (!algumLogExiste) return;
  try {
    execSync("git add imoveis/*/social_log.json", { cwd: ROOT, stdio: "pipe" });
    const status = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" });
    if (!status.trim()) return;
    execSync('git config user.name "github-actions"', { cwd: ROOT });
    execSync('git config user.email "actions@github.com"', { cwd: ROOT });
    execSync('git commit -m "chore: registra publicação em redes sociais [automático]"', { cwd: ROOT });
    for (let i = 0; i < 5; i++) {
      try {
        execSync("git pull --rebase origin main", { cwd: ROOT, stdio: "inherit" });
        execSync("git push", { cwd: ROOT, stdio: "inherit" });
        return;
      } catch {
        log(`  push do social_log.json rejeitado, tentando de novo (${i + 1}/5)...`);
      }
    }
    log("  não consegui commitar social_log.json depois de várias tentativas (não crítico).");
  } catch (err) {
    log("  aviso: não consegui commitar social_log.json:", err.message);
  }
}

// --- main ------------------------------------------------------------------

async function main() {
  const config = readJSON(path.join(ROOT, "config.json"));
  const slugs = detectarSlugs();

  if (!slugs.length) {
    log("Nenhum imóvel alterado detectado em imoveis/ — nada para publicar.");
    return;
  }

  log(`Imóveis a publicar: ${slugs.join(", ")}${DRY_RUN ? " (dry-run)" : ""}`);

  for (const slug of slugs) {
    try {
      await publicarImovel(slug, config);
    } catch (err) {
      // nunca deixa um imóvel com erro derrubar os outros nem o workflow principal
      console.error(`  ❌ ${slug}: falha ao publicar — ${err.message}`);
    }
  }

  commitarLogsSeNecessario();
}

main().catch((err) => {
  console.error("Erro inesperado em publish-social.js:", err.message);
  process.exitCode = 1; // o job no workflow tem continue-on-error: true
});
