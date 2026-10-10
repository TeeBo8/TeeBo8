// Socle commun des images du profil : couleurs et polices de teebostudio.fr, mesure du texte,
// retour à la ligne et document SVG. Chaque image est autonome (GitHub l'affiche comme une <img> :
// pas de JS, rien ne se charge de l'extérieur), donc les polices sont intégrées en base64.

import { BRANDS, LUCIDE } from "./icons.mjs";

// Tokens de src/app/globals.css (teebostudio), convertis en hexadécimal
export const THEMES = {
  light: {
    name: "light",
    bg: "#faf9f5",
    fg: "#3d3929",
    mutedFg: "#6a6964",
    border: "#dad9d4",
    line: "#e5e4e0",
    muted: "#ede9de",
    chip: "#ede9de",
    avatarEdge: "#efeee9",
    primary: "#b65331",
    primaryFg: "#ffffff",
  },
  dark: {
    name: "dark",
    bg: "#262624",
    fg: "#c3c0b6",
    mutedFg: "#b7b5a9",
    border: "#3e3e38",
    line: "#353531",
    muted: "#1b1b19",
    chip: "#3a3a36",
    avatarEdge: "#3a3a36",
    primary: "#d97757",
    primaryFg: "#262624",
  },
};

// Mélange d'une couleur sur le fond (équivalent de `fill-primary/30` sur le site)
export function blend(color, background, alpha) {
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

export const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- Polices ----------

export const FACES = {
  sans: { family: "Geist", weights: [400, 500], stack: "Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif" },
  mono: { family: "Geist Mono", weights: [400, 500], stack: "'Geist Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" },
  hand: { family: "Caveat", weights: [500], stack: "Caveat,'Segoe Print','Bradley Hand',cursive" },
};

// Jeu de caractères des mesures : tout ce que les textes du profil utilisent
const CHARSET =
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("") +
  "àâäçéèêëîïôöùûüÿœæÀÂÄÇÉÈÊËÎÏÔÖÙÛÜŒÆ’‘“”«»·–—…€→↗×  ";

const fontUrl = (faces, text) =>
  "https://fonts.googleapis.com/css2?" +
  faces.map(([key, weights]) => `family=${FACES[key].family.replace(/ /g, "+")}:wght@${weights.join(";")}`).join("&") +
  `&text=${encodeURIComponent(text)}`;

// Sans en-tête de navigateur, Google Fonts sert du TrueType : lisible pour les mesures et intégrable tel quel
async function fetchFaces(faces, text) {
  const response = await fetch(fontUrl(faces, text));
  if (!response.ok) throw new Error(`Google Fonts : ${response.status}`);
  const css = await response.text();
  const out = [];
  for (const block of css.matchAll(/@font-face\s*{([^}]*)}/g)) {
    const family = block[1].match(/font-family:\s*'([^']+)'/)[1];
    const weight = Number(block[1].match(/font-weight:\s*(\d+)/)[1]);
    const url = block[1].match(/url\(([^)]+)\)/)[1];
    const buffer = Buffer.from(await (await fetch(url)).arrayBuffer());
    out.push({ family, weight, buffer });
  }
  return out;
}

// Lecture minimale d'un TrueType : avance de chaque caractère (tables cmap, hmtx)
function parseMetrics(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const tables = {};
  for (let i = 0; i < view.getUint16(4); i++) {
    const offset = 12 + i * 16;
    tables[buffer.toString("latin1", offset, offset + 4)] = view.getUint32(offset + 8);
  }
  const unitsPerEm = view.getUint16(tables.head + 18);
  const metricsCount = view.getUint16(tables.hhea + 34);
  const advance = (glyph) => view.getUint16(tables.hmtx + 4 * Math.min(glyph, metricsCount - 1));

  const glyphs = new Map();
  const cmap = tables.cmap;
  for (let i = 0; i < view.getUint16(cmap + 2); i++) {
    const sub = cmap + view.getUint32(cmap + 4 + i * 8 + 4);
    const format = view.getUint16(sub);
    if (format === 4) {
      const segments = view.getUint16(sub + 6) / 2;
      const ends = sub + 14;
      const starts = ends + segments * 2 + 2;
      const deltas = starts + segments * 2;
      const ranges = deltas + segments * 2;
      for (let s = 0; s < segments; s++) {
        const end = view.getUint16(ends + s * 2);
        const start = view.getUint16(starts + s * 2);
        const delta = view.getInt16(deltas + s * 2);
        const range = view.getUint16(ranges + s * 2);
        for (let code = start; code <= end && code !== 0xffff; code++) {
          let glyph = range === 0 ? (code + delta) & 0xffff : view.getUint16(ranges + s * 2 + range + (code - start) * 2);
          if (range !== 0 && glyph !== 0) glyph = (glyph + delta) & 0xffff;
          if (glyph) glyphs.set(code, glyph);
        }
      }
    } else if (format === 12) {
      for (let g = 0; g < view.getUint32(sub + 12); g++) {
        const group = sub + 16 + g * 12;
        const first = view.getUint32(group + 8);
        for (let code = view.getUint32(group); code <= view.getUint32(group + 4); code++) glyphs.set(code, first + code - view.getUint32(group));
      }
    }
  }
  return (char) => {
    const glyph = glyphs.get(char.codePointAt(0));
    return glyph === undefined ? 0.6 : advance(glyph) / unitsPerEm;
  };
}

const metrics = {};

export async function loadMetrics() {
  const faces = await fetchFaces(Object.entries(FACES).map(([key, face]) => [key, face.weights]), CHARSET);
  for (const { family, weight, buffer } of faces) metrics[`${family}/${weight}`] = parseMetrics(buffer);
}

// Largeur d'un texte en px (letter-spacing compris : SVG l'ajoute après chaque caractère)
export function measure(text, { font = "sans", weight = 400, size = 16, spacing = 0 } = {}) {
  const width = metrics[`${FACES[font].family}/${weight}`] ?? (() => 0.6);
  return [...text].reduce((sum, char) => sum + width(char) * size + spacing, 0);
}

// Retour à la ligne d'un texte riche : segments [{ text, fill?, weight?, underline? }]
export function wrap(segments, maxWidth, style) {
  const words = [];
  for (const segment of typeof segments === "string" ? [{ text: segments }] : segments) {
    const parts = segment.text.split(/( )/);
    for (const part of parts) {
      if (part === "") continue;
      if (part === " ") words.push({ ...segment, text: " ", space: true });
      else words.push({ ...segment, text: part });
    }
  }
  const lines = [[]];
  let width = 0;
  for (const word of words) {
    const w = measure(word.text, { ...style, weight: word.weight ?? style.weight });
    if (word.space) {
      if (lines.at(-1).length) {
        lines.at(-1).push(word);
        width += w;
      }
      continue;
    }
    if (width + w > maxWidth && lines.at(-1).length) {
      while (lines.at(-1).at(-1)?.space) lines.at(-1).pop();
      lines.push([]);
      width = 0;
    }
    lines.at(-1).push({ ...word });
    width += w;
  }
  return lines.map((line) => {
    const merged = [];
    for (const word of line) {
      const last = merged.at(-1);
      if (last && last.fill === word.fill && last.weight === word.weight && last.underline === word.underline) last.text += word.text;
      else merged.push({ ...word });
    }
    while (merged.at(-1)?.text.endsWith(" ")) merged.at(-1).text = merged.at(-1).text.trimEnd();
    return merged;
  });
}

// ---------- Document ----------

// Un document = une image : il note les caractères écrits dans chaque police pour n'intégrer que ceux-là
export function createDoc(theme) {
  const used = {};
  const note = (font, weight, text) => {
    used[font] ??= {};
    used[font][weight] = (used[font][weight] ?? "") + text;
  };

  const doc = {
    theme,

    // Texte sur une ligne
    text(text, { x, y, font = "sans", weight = 400, size = 16, fill = theme.fg, anchor, spacing, opacity, cls, extra = "" }) {
      note(font, weight, text);
      return `<text x="${r(x)}" y="${r(y)}" class="${font}${cls ? ` ${cls}` : ""}" font-size="${size}"${weight !== 400 ? ` font-weight="${weight}"` : ""}${spacing ? ` letter-spacing="${spacing}"` : ""} fill="${fill}"${opacity !== undefined ? ` fill-opacity="${opacity}"` : ""}${anchor ? ` text-anchor="${anchor}"` : ""}${extra}>${esc(text)}</text>`;
    },

    // Paragraphe : renvoie le SVG et la hauteur occupée
    paragraph(segments, { x, y, width, font = "sans", weight = 400, size = 16, lineHeight = size * 1.5, fill = theme.fg, maxLines }) {
      let lines = wrap(segments, width, { font, weight, size });
      if (maxLines && lines.length > maxLines) throw new Error(`Texte trop long (${lines.length} lignes au lieu de ${maxLines}) : ${lines.flat().map((w) => w.text).join("")}`);
      const out = lines.map((line, i) => {
        const baseline = y + i * lineHeight;
        let cursor = x;
        const underlines = [];
        const spans = line.map((word) => {
          const w = word.weight ?? weight;
          note(font, w, word.text);
          const width = measure(word.text, { font, weight: w, size });
          if (word.underline) underlines.push(`<line x1="${r(cursor)}" y1="${r(baseline + 3.5)}" x2="${r(cursor + width)}" y2="${r(baseline + 3.5)}" stroke="${word.fill ?? fill}" stroke-opacity="0.35"/>`);
          cursor += width;
          return `<tspan${word.fill ? ` fill="${word.fill}"` : ""}${w !== weight ? ` font-weight="${w}"` : ""}>${esc(word.text)}</tspan>`;
        });
        return `<text x="${r(x)}" y="${r(baseline)}" class="${font}" font-size="${size}"${weight !== 400 ? ` font-weight="${weight}"` : ""} fill="${fill}" xml:space="preserve">${spans.join("")}</text>${underlines.join("")}`;
      });
      return { svg: out.join("\n"), height: lines.length * lineHeight, lines: lines.length };
    },

    // Icône Lucide (trait) ou logo de marque (aplat)
    icon(name, { x, y, size = 16, color = theme.mutedFg, strokeWidth = 2 }) {
      if (LUCIDE[name]) {
        return `<svg x="${r(x)}" y="${r(y)}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${LUCIDE[name]}</svg>`;
      }
      const brand = BRANDS[name];
      if (!brand) throw new Error(`Icône inconnue : ${name}`);
      const [viewBox, body] = typeof brand === "string" ? ["0 0 24 24", brand] : [brand.viewBox, brand.svg];
      return `<svg x="${r(x)}" y="${r(y)}" width="${size}" height="${size}" viewBox="${viewBox}" fill="${color}">${body}</svg>`;
    },

    // Pastille en capitales (tags des cartes, bouton « devis »)
    chip(text, { x, y, fill = theme.chip, color = theme.fg, size = 11, weight = 500, height = 22, padding = 6, radius = 4 }) {
      const label = text.toUpperCase();
      const spacing = size * 0.05;
      const width = measure(label, { font: "mono", weight, size, spacing }) + padding * 2 - spacing;
      return {
        width,
        svg: `<rect x="${r(x)}" y="${r(y)}" width="${r(width)}" height="${height}" rx="${radius}" fill="${fill}"/>${doc.text(label, { x: x + padding, y: y + height / 2 + size * 0.36, font: "mono", weight, size, fill: color, spacing })}`,
      };
    },

    // Case d'icône bordée (24 px sur le site)
    iconBox(name, { x, y, size = 24, iconSize = 14, color, radius = 6 }) {
      return `<rect x="${r(x + 0.5)}" y="${r(y + 0.5)}" width="${size - 1}" height="${size - 1}" rx="${radius}" fill="${theme.muted}" stroke="${theme.border}"/>${doc.icon(name, { x: x + (size - iconSize) / 2, y: y + (size - iconSize) / 2, size: iconSize, color })}`;
    },

    // Titre de section, comme le PanelHeader du site
    heading(text, { x = 24, y = 48, size = 30 } = {}) {
      return doc.text(text, { x, y, size, weight: 500, spacing: -0.6 });
    },

    // `inset` : marge transparente autour du cadre (les cartes côte à côte s'espacent ainsi sans CSS)
    async render({ width, height, title, body, css = "", frame = true, inset = { left: 0, right: 0 } }) {
      const fonts = await embedFonts(used);
      const total = width + inset.left + inset.right;
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${total}" height="${height}" viewBox="0 0 ${total} ${height}" role="img" aria-labelledby="title">
<title id="title">${esc(title)}</title>
<style>${fonts}
${Object.entries(FACES).map(([key, face]) => `.${key}{font-family:${face.stack}}`).join("\n")}
${css}</style>
${frame ? `<g transform="translate(${inset.left} 0)">
<defs><clipPath id="frame"><rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12"/></clipPath></defs>
<g clip-path="url(#frame)">
<rect width="${width}" height="${height}" fill="${theme.bg}"/>
${body}
</g>
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="12" fill="none" stroke="${theme.border}"/>
</g>` : body}
</svg>
`;
    },
  };
  return doc;
}

const r = (value) => Math.round(value * 100) / 100;

// Sous-ensemble des seules lettres utilisées, mis en cache : les versions claire et sombre partagent leurs polices
const fontCache = new Map();
async function embedFonts(used) {
  const faces = Object.entries(used).map(([key, weights]) => [key, Object.keys(weights).map(Number).sort()]);
  if (faces.length === 0) return "";
  const text = [...new Set(Object.values(used).flatMap((weights) => Object.values(weights)).join(""))].sort().join("");
  const key = JSON.stringify([faces, text]);
  if (!fontCache.has(key)) {
    fontCache.set(
      key,
      fetchFaces(faces, text).then((list) =>
        list
          .map(({ family, weight, buffer }) => `@font-face{font-family:'${family}';font-weight:${weight};src:url(data:font/ttf;base64,${buffer.toString("base64")}) format('truetype')}`)
          .join("\n"),
      ),
    );
  }
  return fontCache.get(key);
}
