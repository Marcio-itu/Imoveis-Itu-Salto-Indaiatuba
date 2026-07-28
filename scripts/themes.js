// Paletas por padrão do imóvel.
// Mesma família tipográfica nas 3 (identidade de marca única),
// variando peso, cor e "temperatura" visual por padrão.

const FONTS = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', -apple-system, Helvetica, Arial, sans-serif",
};

const THEMES = {
  "alto-padrao": {
    label: "Alto padrão",
    bg: "#16150F",
    surface: "#201F17",
    surfaceAlt: "#2B2A1F",
    ink: "#F3EFE4",
    inkMuted: "#B9B4A2",
    accent: "#B08D57",       // latão
    accentSecondary: "#4A5D50", // verde-oliva escuro
    border: "#3A3826",
    radius: "0px",
    displayWeight: 300,
    displayLetterSpacing: "0.01em",
    eyebrowLetterSpacing: "0.22em",
    fonts: FONTS,
    heroVh: 92,
    showPriceInHero: false,
    stickyCta: false,
    sectionOrder: ["sobre", "ficha", "destaques", "galeria", "contato"],
  },
  "medio-padrao": {
    label: "Médio padrão",
    bg: "#FFFFFF",
    surface: "#F4F6F5",
    surfaceAlt: "#EAF0EE",
    ink: "#1E2A28",
    inkMuted: "#5B6A67",
    accent: "#2F5D7C",       // azul petróleo
    accentSecondary: "#D98B3B", // laranja quente (CTA)
    border: "#DCE3E1",
    radius: "6px",
    displayWeight: 500,
    displayLetterSpacing: "0em",
    eyebrowLetterSpacing: "0.16em",
    fonts: FONTS,
    heroVh: 62,
    showPriceInHero: true,
    stickyCta: false,
    sectionOrder: ["ficha", "sobre", "destaques", "galeria", "contato"],
  },
  "padrao-popular": {
    label: "Padrão popular",
    bg: "#FFFDF7",
    surface: "#FFF3E0",
    surfaceAlt: "#FFE7C2",
    ink: "#26241E",
    inkMuted: "#6B6558",
    accent: "#E0562B",       // laranja vibrante
    accentSecondary: "#1F8A5F", // verde fresco
    border: "#F3D9B1",
    radius: "16px",
    displayWeight: 700,
    displayLetterSpacing: "0em",
    eyebrowLetterSpacing: "0.12em",
    fonts: FONTS,
    heroVh: 40,
    showPriceInHero: true,
    stickyCta: true,
    sectionOrder: ["ficha", "destaques", "sobre", "galeria", "contato"],
  },
};

module.exports = { THEMES };
