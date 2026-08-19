// teste-catalogo.js
// Teste real para validar publicação no catálogo Home Listings via API

// IMPORTAÇÃO CORRETA PARA COMMONJS (node-fetch v2)
const fetch = require("node-fetch");

// Use o MESMO token que está no GitHub Actions
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

// Seu catálogo real estate
const CATALOG_ID = "2149735395585577";

async function testarCatalogo() {
  if (!ACCESS_TOKEN) {
    console.error("❌ INSTAGRAM_ACCESS_TOKEN não encontrado no ambiente.");
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${CATALOG_ID}/home_listings`;

  const params = new URLSearchParams({
    access_token: ACCESS_TOKEN,

    // Identificador único do imóvel
    home_listing_id: "teste-validacao-js",

    // Campos obrigatórios
    name: "Teste via JS",
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

    // URL do imóvel (pode ser qualquer link válido)
    url: "https://www.google.com",

    // IMAGEM — formato EXATO que a API exige
    "images[0][url]": "https://via.placeholder.com/808"
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
