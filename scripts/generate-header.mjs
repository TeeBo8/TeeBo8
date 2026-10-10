// Génère l'entête du README de profil, en SVG : la même mise en page que le haut de teebostudio.fr
// (monogramme TS en relief, avatar, nom, phrases qui défilent, aperçu).
//
// Le monogramme reprend le dessin de TsMarkIsometric (site TeeboStudio), lui-même inspiré de
// chanhdai.com — Copyright (c) 2026 Chánh Đại, licence MIT. GitHub affiche le SVG comme une image :
// pas de JS, donc la lueur qui suit le curseur sur le site fait ici le tour du mot toute seule.
// Avatar et polices (Geist, sous-ensemble Google Fonts) sont intégrés au fichier : une image SVG
// ne charge rien de l'extérieur.
//
// Usage : node scripts/generate-header.mjs [dossier]

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const outDir = process.argv[2] ?? "dist";

// Couleurs du site (tokens de globals.css convertis en hexadécimal)
const THEMES = {
  light: {
    bg: "#faf9f5",
    fg: "#3d3929",
    mutedFg: "#6a6964",
    border: "#dad9d4",
    line: "#e5e4e0",
    muted: "#ede9de",
    avatarEdge: "#efeee9",
    primary: "#b65331",
    primaryFg: "#ffffff",
  },
  dark: {
    bg: "#262624",
    fg: "#c3c0b6",
    mutedFg: "#b7b5a9",
    border: "#3e3e38",
    line: "#353531",
    muted: "#1b1b19",
    avatarEdge: "#3a3a36",
    primary: "#d97757",
    primaryFg: "#262624",
  },
};

const NAME = "Thibault Leture";
const SENTENCES = [
  "Développeur web freelance à Bordeaux.",
  "Sites, applications web et intégration de l’IA.",
  "Next.js · React · TypeScript.",
];
const OVERVIEW = [
  [
    { icon: "code", text: "Fondateur de TeeboStudio" },
    { icon: "pin", text: "Bordeaux, France" },
    { icon: "mail", text: "contact@teebostudio.fr", link: true },
  ],
  [
    { icon: "claude", text: "Membre du programme Claude Startups" },
    { icon: "clock", text: "Réponse sous 24 h" },
    { icon: "send", text: "DEMANDER UN DEVIS GRATUIT", pill: true },
  ],
];

// Icônes Lucide (licence ISC) et logo Claude (Simple Icons, CC0), en 24 × 24
const ICONS = {
  code: '<path d="m18 16 4-4-4-4"/><path d="m6 8-4 4 4 4"/><path d="m14.5 4-5 16"/>',
  pin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  mail: '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/><rect x="2" y="4" width="20" height="16" rx="2"/>',
  clock: '<path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="10"/>',
  send: '<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"/><path d="m21.854 2.147-10.94 10.939"/>',
};
const CLAUDE_PATH = "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z";

// ---------- Monogramme TS isométrique (même calcul que sur le site) ----------

const A = 28;
const H = 12;
const T_CELLS = ["#####", "..#..", "..#..", "..#..", "..#.."];
const S_CELLS = ["####", "#...", "####", "...#", "####"];

const cells = [];
T_CELLS.forEach((row, y) => [...row].forEach((c, x) => c === "#" && cells.push([x, y])));
S_CELLS.forEach((row, y) => [...row].forEach((c, x) => c === "#" && cells.push([x + 6, y])));
const occupied = new Set(cells.map(([x, y]) => `${x},${y}`));
const has = (x, y) => occupied.has(`${x},${y}`);
const project = (x, y, z) => `${(x + y) * A},${((y - x) * A) / 2 - z}`;

const topFaces = [];
const sideFaces = [];
const edges = [];
const edge = (a, b) => edges.push(`M${a} L${b}`);

for (const [x, y] of cells) {
  const south = !has(x, y + 1);
  const west = !has(x - 1, y);
  topFaces.push([project(x, y, H), project(x + 1, y, H), project(x + 1, y + 1, H), project(x, y + 1, H)].join(" "));
  if (!has(x, y - 1)) edge(project(x, y, H), project(x + 1, y, H));
  if (!has(x + 1, y)) edge(project(x + 1, y, H), project(x + 1, y + 1, H));
  if (south) edge(project(x, y + 1, H), project(x + 1, y + 1, H));
  if (west) edge(project(x, y, H), project(x, y + 1, H));
  if (south) {
    sideFaces.push([project(x, y + 1, H), project(x + 1, y + 1, H), project(x + 1, y + 1, 0), project(x, y + 1, 0)].join(" "));
    edge(project(x, y + 1, 0), project(x + 1, y + 1, 0));
    if (!(has(x - 1, y) && !has(x - 1, y + 1))) edge(project(x, y + 1, H), project(x, y + 1, 0));
    if (!(has(x + 1, y) && !has(x + 1, y + 1))) edge(project(x + 1, y + 1, H), project(x + 1, y + 1, 0));
  }
  if (west) {
    sideFaces.push([project(x, y, H), project(x, y + 1, H), project(x, y + 1, 0), project(x, y, 0)].join(" "));
    edge(project(x, y, 0), project(x, y + 1, 0));
    if (!(has(x, y - 1) && !has(x - 1, y - 1))) edge(project(x, y, H), project(x, y, 0));
    if (!(has(x, y + 1) && !has(x - 1, y + 1))) edge(project(x, y + 1, H), project(x, y + 1, 0));
  }
}
const edgePath = edges.join(" ");
const VIEW = { x: -16, y: -168, w: 452, h: 254 };

// ---------- Mise en page (en px, comme le hero du site dans sa colonne de 1024 px) ----------

const W = 1024;
const AVATAR_COL = 164; // case de 160 px + marges
const MONO_W = 680;
const SCALE = MONO_W / VIEW.w;
const MONO_X = AVATAR_COL + (W - AVATAR_COL - MONO_W) / 2;
const MONO_Y = 16;
const FIGURE_H = MONO_Y * 2 + VIEW.h * SCALE; // bas du monogramme = filet du nom
const NAME_H = 44;
const TAGLINE_H = 36;
const TOP_H = Math.round(FIGURE_H) + NAME_H + 1 + TAGLINE_H;
const AVATAR_Y = TOP_H - 3 - 160;
const ITEM_H = 24;
const ITEM_GAP = 10;
const OVERVIEW_H = 16 * 2 + ITEM_H * 3 + ITEM_GAP * 2;
const HEIGHT = TOP_H + OVERVIEW_H;
const FIGURE_BOTTOM = Math.round(FIGURE_H);

// Point du sol du monogramme, dans le repère de l'entête
const toHeader = (x, y) => [
  MONO_X + ((x + y) * A - VIEW.x) * SCALE,
  MONO_Y + (((y - x) * A) / 2 - VIEW.y) * SCALE,
];
// Lignes de construction : trois arêtes du socle prolongées, comme sur le site
const GUIDE_ANGLE = Math.atan(1 / 2);
const GUIDES = [
  [...toHeader(0, 5), -GUIDE_ANGLE],
  [...toHeader(0, 0), GUIDE_ANGLE],
  [...toHeader(10, 0), GUIDE_ANGLE],
].map(([x, y, angle]) => {
  const dx = Math.cos(angle) * 2000;
  const dy = Math.sin(angle) * 2000;
  return `M${(x - dx).toFixed(1)},${(y - dy).toFixed(1)} L${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`;
});

const esc = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// ---------- Polices : sous-ensemble Geist et Geist Mono intégré en base64 ----------

async function fontFaces() {
  const chars = [...new Set([NAME, "Fig. 1.", ...SENTENCES, ...OVERVIEW.flat().map((item) => item.text)].join(""))].join("");
  const url = `https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@400;500&text=${encodeURIComponent(chars)}`;
  try {
    // Un navigateur récent obtient du woff2
    const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36" } })).text();
    let out = css;
    for (const [, fontUrl] of css.matchAll(/url\((https:[^)]+)\)/g)) {
      const buffer = Buffer.from(await (await fetch(fontUrl)).arrayBuffer());
      out = out.replace(fontUrl, `data:font/woff2;base64,${buffer.toString("base64")}`);
    }
    return out.replace(/\/\*[^*]*\*\//g, "").replace(/\s+/g, " ").replace(/unicode-range:[^;]+;/g, "");
  } catch (error) {
    // Sans réseau, l'entête reste lisible avec les polices du système
    console.warn(`Polices non intégrées : ${error.message}`);
    return "";
  }
}

// ---------- Rendu ----------

function overviewItem(item, x, y, theme) {
  const icon =
    item.icon === "claude"
      ? `<svg x="${x + 5}" y="${y + 5}" width="14" height="14" viewBox="0 0 24 24"><path d="${CLAUDE_PATH}" fill="#D97757"/></svg>`
      : `<svg x="${x + 5}" y="${y + 5}" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${theme.mutedFg}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[item.icon]}</svg>`;
  const box = `<rect x="${x + 0.5}" y="${y + 0.5}" width="23" height="23" rx="6" fill="${theme.muted}" stroke="${theme.border}"/>`;
  const textX = x + 24 + 16;
  const baseline = y + 17;

  if (item.pill) {
    // Bouton « devis » : capitales, text-xs, tracking-wider
    const width = item.text.length * 7.8 + 20;
    return `${box}${icon}<rect x="${textX}" y="${y}" width="${width.toFixed(1)}" height="24" rx="6" fill="${theme.primary}"/><text x="${textX + 10}" y="${y + 16}" class="mono" font-size="12" font-weight="500" letter-spacing="0.6" fill="${theme.primaryFg}">${esc(item.text)}</text>`;
  }
  const underline = item.link
    ? `<line x1="${textX}" y1="${baseline + 3.5}" x2="${(textX + item.text.length * 8.4).toFixed(1)}" y2="${baseline + 3.5}" stroke="${theme.fg}" stroke-opacity="0.3"/>`
    : "";
  return `${box}${icon}<text x="${textX}" y="${baseline}" class="mono" font-size="14" fill="${theme.fg}">${esc(item.text)}</text>${underline}`;
}

function render(theme, fonts, avatar) {
  const monoTransform = `translate(${(MONO_X - VIEW.x * SCALE).toFixed(2)} ${(MONO_Y - VIEW.y * SCALE).toFixed(2)}) scale(${SCALE.toFixed(4)})`;
  const sentenceCycle = SENTENCES.length * 3.2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${HEIGHT}" viewBox="0 0 ${W} ${HEIGHT}" role="img" aria-labelledby="title">
<title id="title">Thibault Leture, fondateur de TeeboStudio : développeur web freelance à Bordeaux</title>
<style>${fonts}
.sans{font-family:Geist,-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif}
.mono{font-family:'Geist Mono',ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.flip{opacity:0;animation:flip ${sentenceCycle}s infinite}
.flip:nth-of-type(2){animation-delay:3.2s}
.flip:nth-of-type(3){animation-delay:6.4s}
@keyframes flip{0%{opacity:0;transform:translateY(4px)}5%{opacity:1;transform:none}30%{opacity:1}33.33%{opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.flip{animation:none}.flip:first-of-type{opacity:1}.glow-anim{display:none}}
</style>
<defs>
  <clipPath id="frame"><rect x="0.5" y="0.5" width="${W - 1}" height="${HEIGHT - 1}" rx="12"/></clipPath>
  <clipPath id="top"><rect width="${W}" height="${TOP_H}"/></clipPath>
  <clipPath id="avatar-circle"><circle cx="82" cy="${AVATAR_Y + 80}" r="44"/></clipPath>
  <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-26.565)">
    <line x1="0" y1="0.5" x2="5" y2="0.5" stroke="${theme.fg}" stroke-opacity="0.15"/>
  </pattern>
  <radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="210" cy="-41" r="150">
    <stop offset="0" stop-color="${theme.primary}"/>
    <stop offset="1" stop-color="${theme.primary}" stop-opacity="0"/>
    <animate class="glow-anim" attributeName="cx" values="30;210;390;210;30" dur="12s" repeatCount="indefinite"/>
    <animate class="glow-anim" attributeName="cy" values="-60;-140;-60;30;-60" dur="12s" repeatCount="indefinite"/>
  </radialGradient>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${HEIGHT}" fill="${theme.bg}"/>

  <g clip-path="url(#top)" fill="none" stroke="${theme.line}" stroke-dasharray="6 3">
    ${GUIDES.map((d) => `<path d="${d}"/>`).join("\n    ")}
  </g>

  <g transform="${monoTransform}">
    ${sideFaces.map((points) => `<polygon points="${points}" fill="${theme.bg}"/>`).join("")}
    ${topFaces.map((points) => `<polygon points="${points}" fill="${theme.bg}"/><polygon points="${points}" fill="url(#hatch)"/>`).join("")}
    <path d="${edgePath}" fill="none" stroke="${theme.fg}" stroke-opacity="0.25" stroke-linecap="round"/>
    <path d="${edgePath}" fill="none" stroke="url(#glow)" stroke-width="1.5" stroke-linecap="round"/>
  </g>
  <text x="${W - 16}" y="${FIGURE_BOTTOM - 16}" text-anchor="end" class="sans" font-size="14" letter-spacing="0.35" fill="${theme.mutedFg}" fill-opacity="0.6">Fig. 1.</text>

  <g stroke="${theme.line}">
    <line x1="0" y1="${AVATAR_Y - 3.5}" x2="${W}" y2="${AVATAR_Y - 3.5}"/>
    <line x1="${AVATAR_COL - 0.5}" y1="${AVATAR_Y - 3.5}" x2="${AVATAR_COL - 0.5}" y2="${TOP_H}"/>
    <line x1="${AVATAR_COL}" y1="${FIGURE_BOTTOM + 0.5}" x2="${W}" y2="${FIGURE_BOTTOM + 0.5}"/>
    <line x1="${AVATAR_COL}" y1="${FIGURE_BOTTOM + NAME_H + 1.5}" x2="${W}" y2="${FIGURE_BOTTOM + NAME_H + 1.5}"/>
    <line x1="0" y1="${TOP_H + 0.5}" x2="${W}" y2="${TOP_H + 0.5}"/>
    <line x1="${W / 2 + 0.5}" y1="${TOP_H}" x2="${W / 2 + 0.5}" y2="${HEIGHT}" stroke-dasharray="4 4"/>
  </g>

  <rect x="2.5" y="${AVATAR_Y + 0.5}" width="159" height="159" rx="16" fill="${theme.bg}" stroke="${theme.border}"/>
  <rect x="4.5" y="${AVATAR_Y + 2.5}" width="155" height="155" rx="14" fill="none" stroke="${theme.avatarEdge}" stroke-width="3"/>
  <image href="data:image/png;base64,${avatar}" x="38" y="${AVATAR_Y + 36}" width="88" height="88" clip-path="url(#avatar-circle)"/>

  <text x="${AVATAR_COL + 16}" y="${FIGURE_BOTTOM + 6 + 31}" class="sans" font-size="32" font-weight="500" letter-spacing="-0.8" fill="${theme.fg}">${NAME}</text>
  <g class="mono" font-size="14" fill="${theme.mutedFg}">
    ${SENTENCES.map((sentence) => `<text class="flip" x="${AVATAR_COL + 16}" y="${FIGURE_BOTTOM + NAME_H + 1 + 23}">${esc(sentence)}</text>`).join("\n    ")}
  </g>

  ${OVERVIEW.map((column, c) =>
    column.map((item, i) => overviewItem(item, c * (W / 2) + 24, TOP_H + 16 + i * (ITEM_H + ITEM_GAP), theme)).join("\n  "),
  ).join("\n  ")}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${HEIGHT - 1}" rx="12" fill="none" stroke="${theme.border}"/>
</svg>
`;
}

const [fonts, avatarBuffer] = await Promise.all([fontFaces(), readFile(new URL("../assets/avatar.png", import.meta.url))]);
const avatar = avatarBuffer.toString("base64");

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "header.svg"), render(THEMES.light, fonts, avatar));
await writeFile(join(outDir, "header-dark.svg"), render(THEMES.dark, fonts, avatar));
console.log(`Entête générée (${W} × ${HEIGHT})`);
