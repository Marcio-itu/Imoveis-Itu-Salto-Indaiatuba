// teste-catalogo.js
// Teste real para validar publicação no catálogo Home Listings via API

const fetch = require("node-fetch");

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const CATALOG_ID = "2149735395585577";

async function testarCatalogo() {
  if (!ACCESS_TOKEN) {
    console.error("❌ INSTAGRAM_ACCESS_TOKEN não encontrado no ambiente.");
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${CATALOG_ID}/home_listings`;

  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,

    home_listing_id: "teste-validacao-js",

    name: "Teste via JS",
    availability: "for_sale",
    listing_type: "for_sale",
    property_type: "house",
    price: "123456",
    currency: "BRL",

    "address[street_address]": "Rua Exemplo 123",
    "address[city]": "Itu",
    "address[region]": "SP",
    "address[country]": "BR",
    "address[latitude]": "-23.2645",
    "address[longitude]": "-47.2992",

    url: "https://www.google.com",

    // CORREÇÃO: formato aceito pela API
    "images[0][image_url]": "https://via.placeholder.com/808"
  });

  console.log("📡 Enviando teste ao catálogo...");

  try {
    const res = await fetch(url, { method: "POST", body: params });
    const data = await res.json();

    console.log("📥 Resposta da API:");
    console.log(JSON.stringify(data, null, 2));

    if (data.error) {
      console.error("❌ Erro:", data.error.message);
    } else {
      console.log("✅ Sucesso! Item criado no catálogo.");
    }
  } catch (err) {
    console.error("❌ Erro ao enviar requisição:", err.message);
  }
}

testarCatalogo();
