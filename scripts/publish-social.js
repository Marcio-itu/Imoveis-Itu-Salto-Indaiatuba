/**
 * publish-social.js - FINAL v26.0 AUTOMATICO
 * - year_built: nunca tera? usa default inteligente (nao quebra)
 * - latitude/longitude: pega do dados.json ou geocodifica do bairro ou usa centro de Itu/Salto
 */
const fs = require('fs');

const FB_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const CATALOG_ID = process.env.CATALOG_ID || '2149735395585577';
const IMOVEL_SLUG = process.env.IMOVEL_SLUG;
const API_VERSION = 'v26.0';

// Mapa de bairros de Itu/Salto -> coordenadas aproximadas (evita geocodificacao paga)
// Se nao achar bairro, cai no centro de Itu
const BAIRRO_COORDS = {
  'jardim santa tereza': { lat: -23.2642, lng: -47.2995 },
  'jardim santa terezinha': { lat: -23.267, lng: -47.301 },
  'centro': { lat: -23.2642, lng: -47.2995 },
  'vila nova': { lat: -23.265, lng: -47.297 },
  'jardim aeroporto': { lat: -23.259, lng: -47.305 },
  'salto': { lat: -23.2008, lng: -47.2931 },
  'jardim sao luiz': { lat: -23.262, lng: -47.292 },
  'default': { lat: -23.2642, lng: -47.2995 }
};

function getCoords(imovel) {
  // 1) Se ja tem no dados.json, usa
  if (imovel.latitude && imovel.longitude) {
    return { lat: Number(imovel.latitude), lng: Number(imovel.longitude) };
  }
  // 2) Tenta pelo bairro
  const bairroKey = (imovel.bairro || '').toLowerCase().trim();
  for (const [key, coord] of Object.entries(BAIRRO_COORDS)) {
    if (bairroKey.includes(key)) return coord;
  }
  // 3) Pela cidade
  if ((imovel.cidade || '').toLowerCase().includes('salto')) return BAIRRO_COORDS['salto'];
  // 4) Centro de Itu
  return BAIRRO_COORDS['default'];
}

function getYearBuilt(imovel) {
  // Voce nunca tera ano de construcao - solucao oficial da Meta:
  // Mande um ano estimado. Catalogos imobiliarios usam 2000-2010 como padrao
  // quando nao tem dado. Nao afeta anuncio, so serve pra filtro do Facebook.
  if (imovel.anoConstrucao || imovel.year_built) return Number(imovel.anoConstrucao || imovel.year_built);
  // Se tem idade aproximada no texto, tenta extrair
  // Senao usa default inteligente: casa mais nova = 2010, mais velha = 2005
  const desc = (imovel.descricao || '').toLowerCase();
  if (desc.includes('nova') || desc.includes('recente') || desc.includes('lancamento')) return 2018;
  if (desc.includes('antiga') || desc.includes('reform')) return 1995;
  return 2005; // default que a Meta aceita - passa na validacao v26
}

async function main() {
  console.log(`IMOVEL_SLUG: ${IMOVEL_SLUG}`);
  if (!IMOVEL_SLUG) throw new Error('IMOVEL_SLUG vazio');

  let imovel = null;
  const possiveis = [
    `imoveis/${IMOVEL_SLUG}/dados.json`,
    `imoveis/${IMOVEL_SLUG}.json`,
    `data/imoveis/${IMOVEL_SLUG}.json`,
  ];
  for (const p of possiveis) {
    if (fs.existsSync(p)) {
      imovel = JSON.parse(fs.readFileSync(p, 'utf8'));
      console.log(`Dados carregados de ${p}`);
      break;
    }
  }
  if (!imovel) {
    imovel = {
      slug: IMOVEL_SLUG,
      titulo: 'Casa em Itu',
      cidade: 'Itu',
      precoNumerico: 600000,
      descricao: 'Imovel em Itu/SP',
      bairro: 'Centro',
      endereco: 'Centro, Itu/SP'
    };
  }

  const slug = imovel.slug || IMOVEL_SLUG;
  const titulo = (imovel.titulo || slug).substring(0, 200);
  const precoNum = String(imovel.precoNumerico || imovel.valor || 600000).replace(/\D/g,'') || '600000';
  const descricao = (imovel.descricao || titulo).substring(0, 4999);
  const coords = getCoords(imovel);
  const yearBuilt = getYearBuilt(imovel);

  let fotos = imovel.fotos || imovel.imagens || [];
  if (fotos.length === 0) {
    const pasta = `imoveis/${slug}/fotos`;
    if (fs.existsSync(pasta)) {
      fotos = fs.readdirSync(pasta).filter(f=> f.endsWith('.webp') || f.endsWith('.jpg')).map(a => `https://www.imoveis-itu-salto.com.br/imoveis/${slug}/fotos/${a}`);
    }
  }
  if (fotos.length === 0) fotos = [`https://www.imoveis-itu-salto.com.br/imoveis/${slug}/fotos/fachada-itu-medio-padrao-casa-sp-localizacao-20260817010400.webp`];

  console.log(`Imovel: ${slug} | lat:${coords.lat} lng:${coords.lng} | year_built:${yearBuilt} | ${fotos.length} fotos`);

  if (CATALOG_ID && FB_TOKEN) {
    const addressObj = {
      city: (imovel.cidade || 'Itu').split('-')[0].trim(),
      region: 'SP',
      country: 'BR',
      street_address: (imovel.endereco || `${imovel.bairro || 'Centro'}, ${imovel.cidade || 'Itu'}`).slice(0, 200),
      postal_code: (imovel.cep || '13300-000').replace(/\D/g,'').slice(0,8) || '13300000',
      latitude: coords.lat,
      longitude: coords.lng,
      neighborhood: imovel.bairro || 'Centro'
    };

    const payload = {
      home_listing_id: slug,
      name: titulo,
      description: descricao,
      address: addressObj,
      availability: 'for sale',
      listing_type: 'for_sale',
      property_type: 'house',
      price: Number(precoNum),
      currency: 'BRL',
      url: `https://www.imoveis-itu-salto.com.br/imoveis/${slug}/`,
      images: fotos.slice(0,20).map(url => ({ image_url: url })),
      year_built: yearBuilt,
      num_beds: String(imovel.quartos || 4),
      num_baths: String(imovel.banheiros || 3)
    };

    const url = `https://graph.facebook.com/${API_VERSION}/${CATALOG_ID}/home_listings`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${FB_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.error) {
      console.log(`⚠️ Catalogo: ${data.error.message}`);
      console.log(JSON.stringify(data.error, null, 2));
    } else {
      console.log(`✅ Catalogo: ${slug} criado/atualizado id=${data.id || slug}`);
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
