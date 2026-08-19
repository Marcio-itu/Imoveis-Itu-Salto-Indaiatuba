/**
 * publish-social.js - COMPLETO v26.0 - IG + FB PAGE + CATALOGO
 * Fix: mantem Instagram e Facebook Page que sumiram + catalogo com year_built e lat/lng automatico
 */
const fs = require('fs');

const INSTAGRAM_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID || process.env.INSTAGRAM_ACCOUNT_ID;
const FB_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const FB_CATALOG_TOKEN = process.env.FB_CATALOG_TOKEN || FB_TOKEN;
const FB_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const CATALOG_ID = process.env.CATALOG_ID || '2149735395585577';
const IMOVEL_SLUG = process.env.IMOVEL_SLUG;
const API_VERSION = 'v26.0';

const BAIRRO_COORDS = {
  'jardim santa tereza': { lat: -23.2642, lng: -47.2995 },
  'centro': { lat: -23.2642, lng: -47.2995 },
  'salto': { lat: -23.2008, lng: -47.2931 },
  'default': { lat: -23.2642, lng: -47.2995 }
};

function getCoords(imovel) {
  if (imovel.latitude && imovel.longitude) return { lat: Number(imovel.latitude), lng: Number(imovel.longitude) };
  const bairroKey = (imovel.bairro || '').toLowerCase().trim();
  for (const [key, coord] of Object.entries(BAIRRO_COORDS)) {
    if (bairroKey.includes(key)) return coord;
  }
  if ((imovel.cidade || '').toLowerCase().includes('salto')) return BAIRRO_COORDS['salto'];
  return BAIRRO_COORDS['default'];
}

function getYearBuilt(imovel) {
  if (imovel.anoConstrucao || imovel.year_built) return Number(imovel.anoConstrucao || imovel.year_built);
  const desc = (imovel.descricao || '').toLowerCase();
  if (desc.includes('nova') || desc.includes('recente')) return 2018;
  if (desc.includes('antiga') || desc.includes('reform')) return 1995;
  return 2005;
}

async function publishInstagramCarrossel(fotos, legenda) {
  if (!INSTAGRAM_TOKEN || !INSTAGRAM_USER_ID) {
    console.log('IG: token ou user_id nao configurado, pulando');
    return;
  }
  try {
    console.log(`IG: criando carrossel com ${fotos.length} fotos...`);
    // Cria containers filhos
    const children = [];
    for (const fotoUrl of fotos.slice(0,10)) {
      const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_USER_ID}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: fotoUrl,
          is_carousel_item: true,
          access_token: INSTAGRAM_TOKEN
        })
      });
      const data = await res.json();
      if (data.id) children.push(data.id);
      else console.log('IG filho erro', JSON.stringify(data));
    }
    if (children.length === 0) throw new Error('Nenhum filho criado');
    
    // Cria container carrossel
    const resCar = await fetch(`https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_USER_ID}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        media_type: 'CAROUSEL',
        children: children.join(','),
        caption: legenda,
        access_token: INSTAGRAM_TOKEN
      })
    });
    const carData = await resCar.json();
    if (!carData.id) { console.log('IG carrossel erro', JSON.stringify(carData)); return; }
    
    // Publica
    const resPub = await fetch(`https://graph.facebook.com/${API_VERSION}/${INSTAGRAM_USER_ID}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ creation_id: carData.id, access_token: INSTAGRAM_TOKEN })
    });
    const pubData = await resPub.json();
    if (pubData.id) console.log(`✅ Instagram publicado: ${pubData.id}`);
    else console.log('IG publish erro', JSON.stringify(pubData));
  } catch (e) {
    console.log(`⚠️ IG erro: ${e.message}`);
  }
}

async function publishFacebookPageCarrossel(fotos, legenda) {
  if (!FB_TOKEN || !FB_PAGE_ID) {
    console.log('FB Page: token ou page_id nao configurado, pulando');
    return;
  }
  try {
    console.log(`FB Page: publicando carrossel ${FB_PAGE_ID} com ${fotos.length} fotos...`);
    // Facebook Page carrossel - upload fotos nao publicadas
    const photoIds = [];
    for (const fotoUrl of fotos.slice(0,10)) {
      const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${FB_PAGE_ID}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fotoUrl, published: false, access_token: FB_TOKEN })
      });
      const data = await res.json();
      if (data.id) photoIds.push({ media_fbid: data.id });
    }
    if (photoIds.length === 0) throw new Error('Nenhuma foto FB enviada');
    
    const resPost = await fetch(`https://graph.facebook.com/${API_VERSION}/${FB_PAGE_ID}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: legenda,
        attached_media: photoIds,
        access_token: FB_TOKEN
      })
    });
    const postData = await resPost.json();
    if (postData.id) console.log(`✅ Facebook Page publicado: ${postData.id}`);
    else console.log('FB Page erro', JSON.stringify(postData));
  } catch (e) {
    console.log(`⚠️ FB Page erro: ${e.message}`);
  }
}

async function main() {
  console.log(`IMOVEL_SLUG: ${IMOVEL_SLUG}`);
  if (!IMOVEL_SLUG) throw new Error('IMOVEL_SLUG vazio');

  let imovel = null;
  const possiveis = [`imoveis/${IMOVEL_SLUG}/dados.json`, `imoveis/${IMOVEL_SLUG}.json`, `data/imoveis/${IMOVEL_SLUG}.json`];
  for (const p of possiveis) {
    if (fs.existsSync(p)) { imovel = JSON.parse(fs.readFileSync(p, 'utf8')); console.log(`Dados de ${p}`); break; }
  }
  if (!imovel) {
    imovel = { slug: IMOVEL_SLUG, titulo: 'Casa em Itu', cidade: 'Itu', precoNumerico: 600000, descricao: 'Imovel em Itu/SP', bairro: 'Centro', endereco: 'Centro, Itu/SP', quartos: 4, banheiros: 3 };
  }

  const slug = imovel.slug || IMOVEL_SLUG;
  const titulo = (imovel.titulo || imovel.nome || slug).substring(0, 200);
  const cidade = imovel.cidade || 'Itu - SP';
  const precoStr = imovel.preco || `R$ ${imovel.precoNumerico || 600000}`;
  const precoNum = String(imovel.precoNumerico || imovel.valor || 600000).replace(/\D/g,'') || '600000';
  const descricao = (imovel.descricao || imovel.descricaoCompleta || titulo).substring(0, 4999);

  let fotos = imovel.fotos || imovel.imagens || [];
  if (fotos.length === 0) {
    const pasta = `imoveis/${slug}/fotos`;
    if (fs.existsSync(pasta)) {
      fotos = fs.readdirSync(pasta).filter(f=> f.endsWith('.webp') || f.endsWith('.jpg')).map(a => `https://www.imoveis-itu-salto.com.br/imoveis/${slug}/fotos/${a}`);
    }
  }
  if (fotos.length === 0) fotos = [`https://www.imoveis-itu-salto.com.br/imoveis/${slug}/fotos/sala-estar-espacoso-itu-medio-padrao-casa-sp-localizacao-20260817010520.webp`];

  const coords = getCoords(imovel);
  const yearBuilt = getYearBuilt(imovel);
  console.log(`Imovel: ${slug} | ${cidade} | lat:${coords.lat} lng:${coords.lng} | year_built:${yearBuilt} | ${fotos.length} fotos`);

  const legenda = `${titulo}\n${cidade}\n${precoStr}\n\n${descricao.slice(0,500)}\n\nhttps://www.imoveis-itu-salto.com.br/imoveis/${slug}/`;

  // 1) Instagram
  await publishInstagramCarrossel(fotos, legenda);
  // 2) Facebook Page
  await publishFacebookPageCarrossel(fotos, legenda);

  // 3) Catalogo - com token separado
  if (CATALOG_ID && FB_CATALOG_TOKEN) {
    console.log(`Catalogo ${CATALOG_ID}: enviando ${slug} na ${API_VERSION}...`);
    try {
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
        headers: { 'Authorization': `Bearer ${FB_CATALOG_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.error) {
        console.log(`⚠️ Catalogo: ${data.error.message}`);
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log(`✅ Catalogo: ${slug} id=${data.id || slug}`);
      }
    } catch (e) {
      console.log(`⚠️ Catalogo erro: ${e.message}`);
    }
  } else {
    console.log('CATALOG_ID ou FB_CATALOG_TOKEN nao configurado, pulando catalogo');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
