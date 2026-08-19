// teste-catalogo.js
// Envia um item completo para o catálogo Home Listings sem looping

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

    // Identificador único
    home_listing_id: "teste-validacao-js",

    // Campos obrigatórios
    name: "Casa de Teste Completa",
    availability: "for_sale",
    listing_type: "for_sale",
    property_type: "house",
    price: "123456",
    currency: "BRL",

    // Endereço completo
    "address[street_address]": "Rua Exemplo 123",
    "address[city]": "Itu",
    "address[region]": "SP",
    "address[country]": "BR",
    "address[latitude]": "-23.2645",
    "address[longitude]": "-47.2992",

    // Campos estruturais obrigatórios
    year_built: "2005",
    num_bedrooms: "3",
    num_bathrooms: "2",
    parking_spaces: "2",
    lot_size: "250",
    square_footage: "180",

    // URL do imóvel
    url: "https://www.google.com",

    // Imagem obrigatória
    "images[0][image_url]": "https://via.placeholder.com/808"
  });

  console.log("📡 Enviando item completo ao catálogo...");

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
