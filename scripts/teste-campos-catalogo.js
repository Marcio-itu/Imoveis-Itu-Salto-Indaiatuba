// Descobrir campos obrigatórios do catálogo Home Listings

const fetch = require("node-fetch");

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const CATALOG_ID = "2149735395585577";

async function descobrirCampos() {
  if (!ACCESS_TOKEN) {
    console.error("❌ INSTAGRAM_ACCESS_TOKEN não encontrado.");
    return;
  }

  const url = `https://graph.facebook.com/v21.0/${CATALOG_ID}/home_listings?metadata=1&access_token=${ACCESS_TOKEN}`;

  console.log("📡 Consultando metadados do catálogo...");

  const res = await fetch(url);
  const data = await res.json();

  console.log("📥 Resposta da API (metadados):");
  console.log(JSON.stringify(data, null, 2));

  if (!data?.metadata?.fields) {
    console.error("❌ A API não retornou metadados.");
    return;
  }

  const obrigatorios = [];
  const opcionais = [];

  for (const campo of data.metadata.fields) {
    if (campo.required) obrigatorios.push(campo.name);
    else opcionais.push(campo.name);
  }

  console.log("\n🔎 CAMPOS OBRIGATÓRIOS:");
  console.log(obrigatorios);

  console.log("\n🟦 CAMPOS OPCIONAIS:");
  console.log(opcionais);
}

descobrirCampos();
