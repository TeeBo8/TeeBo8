// Socle commun des images du profil : couleurs et polices de teebostudio.fr, document SVG.
// Chaque image est autonome (GitHub l'affiche comme une <img> : pas de JS, rien ne se charge de
// l'extérieur), donc les polices sont intégrées en base64. Une seule version, sombre comme le site,
// lisible sur les fonds clair et sombre de GitHub.

// Tokens du thème sombre de src/app/globals.css (teebostudio), convertis en hexadécimal
export const THEME = {
  bg: "#262624",
  fg: "#c3c0b6",
  mutedFg: "#b7b5a9",
  border: "#3e3e38",
  line: "#353531",
  avatarEdge: "#3a3a36",
  primary: "#d97757",
};

// Mélange d'une couleur sur le fond (équivalent de `fill-primary/30` sur le site)
function blend(color, background, alpha) {
  const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const [a, b] = [parse(color), parse(background)];
  return `#${a.map((v, i) => Math.round(v * alpha + b[i] * (1 - alpha)).toString(16).padStart(2, "0")).join("")}`;
}

// Niveaux du calendrier de contributions, comme sur le site
export const levelColors = (theme) => [
  blend(theme.fg, theme.bg, 0.08),
  blend(theme.primary, theme.bg, 0.3),
  blend(theme.primary, theme.bg, 0.55),
  blend(theme.primary, theme.bg, 0.8),
  theme.primary,
];

const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const r = (value) => Math.round(value * 100) / 100;

const FACES = {
  sans: { family: "Geist", stack: "Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" },
  mono: { family: "Geist Mono", stack: "'Geist Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" },
};

// Un document = une image : il note les caractères écrits dans chaque police pour n'intégrer que ceux-là
export function createDoc(theme) {
  const used = {};
  return {
    text(text, { x, y, font = "sans", weight = 400, size = 16, fill = theme.fg, anchor, spacing, opacity, cls, extra = "" }) {
      used[font] ??= {};
      used[font][weight] = (used[font][weight] ?? "") + text;
      return `<text x="${r(x)}" y="${r(y)}" class="${font}${cls ? ` ${cls}` : ""}" font-size="${size}"${weight !== 400 ? ` font-weight="${weight}"` : ""}${spacing ? ` letter-spacing="${spacing}"` : ""} fill="${fill}"${opacity !== undefined ? ` fill-opacity="${opacity}"` : ""}${anchor ? ` text-anchor="${anchor}"` : ""}${extra}>${esc(text)}</text>`;
    },

    async render({ width, height, title, body, css = "" }) {
      const fonts = await embedFonts(used);
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title">
<title id="title">${esc(title)}</title>
<style>${fonts}
${Object.entries(FACES).map(([key, face]) => `.${key}{font-family:${face.stack}}`).join("\n")}
${css}</style>
<defs><clipPath id="frame"><rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12"/></clipPath></defs>
<g clip-path="url(#frame)">
<rect width="${width}" height="${height}" fill="${theme.bg}"/>
${body}
</g>
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="none" stroke="${theme.border}"/>
</svg>
`;
    },
  };
}

// Sous-ensemble Google Fonts des seules lettres utilisées. Sans en-tête de navigateur, Google Fonts sert
// du TrueType, intégrable tel quel. Sans réseau, l'image reste lisible avec les polices du système.
async function embedFonts(used) {
  const faces = Object.entries(used).map(([key, weights]) => [FACES[key].family, Object.keys(weights).sort()]);
  if (faces.length === 0) return "";
  const text = [...new Set(Object.values(used).flatMap((weights) => Object.values(weights)).join(""))].join("");
  const url =
    "https://fonts.googleapis.com/css2?" +
    faces.map(([family, weights]) => `family=${family.replace(/ /g, "+")}:wght@${weights.join(";")}`).join("&") +
    `&text=${encodeURIComponent(text)}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google Fonts : ${response.status}`);
    const css = await response.text();
    const out = [];
    for (const block of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
      const family = block[1].match(/font-family:\s*'([^']+)'/)[1];
      const weight = block[1].match(/font-weight:\s*(\d+)/)[1];
      const buffer = Buffer.from(await (await fetch(block[1].match(/url\(([^)]+)\)/)[1])).arrayBuffer());
      out.push(`@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/ttf;base64,${buffer.toString("base64")}) format('truetype')}`);
    }
    return out.join("\n");
  } catch (error) {
    console.warn(`Polices non intégrées : ${error.message}`);
    return "";
  }
}
