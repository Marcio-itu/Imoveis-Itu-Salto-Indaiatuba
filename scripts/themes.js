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
    bg: "#0E1614",
    surface: "#16211E",
    surfaceAlt: "#1F2E29",
    ink: "#EEF4F2",
    inkMuted: "#A9BAB5",
    accent: "#4E9E97",       // verde-água
    accentSecondary: "#3F6B5E", // verde profundo
    border: "#2A3A35",
    radius: "10px",
    displayWeight: 300,
    displayLetterSpacing: "0.01em",
    eyebrowLetterSpacing: "0.22em",
    fonts: FONTS,
    heroVh: 92,
    showPriceInHero: false,
    stickyCta: false,
    sectionOrder: ["sobre", "ficha", "destaques", "galeria", "parecidos", "contato", "faq"],
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
    radius: "14px",
    displayWeight: 500,
    displayLetterSpacing: "0em",
    eyebrowLetterSpacing: "0.16em",
    fonts: FONTS,
    heroVh: 62,
    showPriceInHero: true,
    stickyCta: false,
    sectionOrder: ["ficha", "sobre", "destaques", "galeria", "parecidos", "contato", "faq"],
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
    radius: "22px",
    displayWeight: 700,
    displayLetterSpacing: "0em",
    eyebrowLetterSpacing: "0.12em",
    fonts: FONTS,
    heroVh: 40,
    showPriceInHero: true,
    stickyCta: true,
    sectionOrder: ["ficha", "destaques", "sobre", "galeria", "parecidos", "contato", "faq"],
  },
};

module.exports = { THEMES };
