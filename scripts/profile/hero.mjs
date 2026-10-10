// Entête du profil : le haut de teebostudio.fr (monogramme TS, avatar, nom, aperçu), puis le calendrier
// de contributions avec le serpent (Fig. 2) et la bande de preuves.
//
// Le monogramme reprend le dessin de TsMarkIsometric (site TeeboStudio), lui-même inspiré de
// chanhdai.com — Copyright (c) 2026 Chánh Đại, licence MIT. Sans JS, la lueur qui suit le curseur
// sur le site fait ici le tour du mot toute seule.

import { createDoc, levelColors, measure } from "./kit.mjs";
import { HERO } from "./content.mjs";

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

// ---------- Mise en page (px du hero du site, dans sa colonne de 1024 px) ----------

const W = 1024;
const AVATAR_COL = 164;
const MONO_W = 680;
const SCALE = MONO_W / VIEW.w;
const MONO_X = AVATAR_COL + (W - AVATAR_COL - MONO_W) / 2;
const MONO_Y = 16;
const FIGURE_BOTTOM = Math.round(MONO_Y * 2 + VIEW.h * SCALE);
const NAME_H = 44;
const TAGLINE_H = 36;
const TOP_H = FIGURE_BOTTOM + NAME_H + 1 + TAGLINE_H;
const AVATAR_Y = TOP_H - 3 - 160;
const ITEM_H = 24;
const ITEM_GAP = 10;
const OVERVIEW_BOTTOM = TOP_H + 16 * 2 + ITEM_H * 3 + ITEM_GAP * 2;

const toHeader = (x, y) => [MONO_X + ((x + y) * A - VIEW.x) * SCALE, MONO_Y + (((y - x) * A) / 2 - VIEW.y) * SCALE];
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

const SENTENCE_SECONDS = 3.2;

function overviewItem(doc, item, x, y) {
  const { theme } = doc;
  const box = doc.iconBox(item.icon, { x, y, color: item.icon === "claude" ? "#D97757" : theme.mutedFg });
  const textX = x + 24 + 16;
  if (item.pill) {
    const chip = doc.chip(item.text, { x: textX, y, fill: theme.primary, color: theme.primaryFg, size: 12, height: 24, padding: 10, radius: 6 });
    return box + chip.svg;
  }
  return box + doc.paragraph([{ text: item.text, underline: item.underline }], { x: textX, y: y + 17, width: 400, font: "mono", size: 14 }).svg;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeZone: "UTC" });
const formatDate = (iso) => dateFormatter.format(new Date(`${iso}T00:00:00Z`));

// Le serpent (généré par Platane/snk) est intégré dans la figure, recoloré aux couleurs du thème :
// ses couleurs sont des variables CSS (--ce case vide, --c0 à --c4 niveaux, --cs serpent, --cb contour)
function snakeFigure(snakeSvg, theme) {
  const viewBox = snakeSvg.match(/viewBox="([^"]+)"/)[1];
  const levels = levelColors(theme);
  const vars = `--cb:transparent;--cs:${theme.fg};--ce:${levels[0]};${levels.map((color, i) => `--c${i}:${color}`).join(";")}`;
  const inner = snakeSvg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/:root\{[^}]*\}/, `:root{${vars}}`);
  const [, , vw, vh] = viewBox.split(" ").map(Number);
  return { viewBox, inner, ratio: vh / vw };
}

export async function renderHero(theme, { avatar, snake, contributions }) {
  const doc = createDoc(theme);
  const monoTransform = `translate(${(MONO_X - VIEW.x * SCALE).toFixed(2)} ${(MONO_Y - VIEW.y * SCALE).toFixed(2)}) scale(${SCALE.toFixed(4)})`;

  // Fig. 2 : calendrier de contributions
  const figure = snakeFigure(snake, theme);
  const SNAKE_W = 880;
  const SNAKE_H = SNAKE_W * figure.ratio;
  const FIG_Y = OVERVIEW_BOTTOM + 20;
  const CAPTION_Y = FIG_Y + SNAKE_H + 18;
  const PROOFS_Y = CAPTION_Y + 26;

  const { first, last } = contributions;
  const caption = [
    { text: "Fig. 2. ", font: "sans" },
    { text: `Contributions du ${formatDate(first)} au ${formatDate(last)}, dépôts privés compris. Source : GitHub.` },
  ];
  const captionX = (W - SNAKE_W) / 2;
  const levels = levelColors(theme);
  const legendRight = captionX + SNAKE_W;
  const legendEnd = legendRight - measure("Plus", { font: "mono", size: 12 }) - 6;
  const legendCells = levels.map((color, i) => `<rect x="${legendEnd - (5 - i) * 14 + 3}" y="${CAPTION_Y - 10}" width="11" height="11" rx="2" fill="${color}"/>`);

  // Bande de preuves : largeur de chaque case = son libellé + marges, la dernière prend le reste
  const fieldLabel = (text, x, y) => doc.text(text.toUpperCase(), { x, y, font: "mono", weight: 500, size: 10, spacing: 1, fill: theme.mutedFg });
  let cursor = 0;
  const proofBoxes = HERO.proofs.map((proof) => {
    const width = Math.ceil(measure(proof.label.toUpperCase(), { font: "mono", weight: 500, size: 10, spacing: 1 })) + 48;
    const box = { proof, x: cursor, width };
    cursor += width + 1;
    return box;
  });
  // Les sites en ligne passent à la ligne si la case est trop étroite (jamais au milieu d'un nom) : la bande grandit d'autant
  const onlineSegments = HERO.online.flatMap((name, i) => [...(i ? [{ text: " · ", fill: theme.mutedFg }] : []), { text: name.replace(/ /g, " "), underline: true }]);
  const online = doc.paragraph(onlineSegments, { x: cursor + 24, y: PROOFS_Y + 52, width: W - cursor - 48, font: "mono", size: 12, lineHeight: 20 });
  const PROOFS_H = Math.max(72, 52 + online.height);
  const HEIGHT = PROOFS_Y + PROOFS_H;
  const proofCells = proofBoxes.map(
    ({ proof, x, width }) =>
      `${fieldLabel(proof.label, x + 24, PROOFS_Y + 28)}${doc.text(typeof proof.value === "function" ? proof.value(contributions) : proof.value, { x: x + 24, y: PROOFS_Y + 54, font: "mono", weight: 500, size: 18 })}<line x1="${x + width + 0.5}" y1="${PROOFS_Y}" x2="${x + width + 0.5}" y2="${HEIGHT}" stroke="${theme.line}"/>`,
  );

  const body = `
  <g clip-path="url(#top)" fill="none" stroke="${theme.line}" stroke-dasharray="6 3">
    ${GUIDES.map((d) => `<path d="${d}"/>`).join("\n    ")}
  </g>
  <g transform="${monoTransform}">
    ${sideFaces.map((points) => `<polygon points="${points}" fill="${theme.bg}"/>`).join("")}
    ${topFaces.map((points) => `<polygon points="${points}" fill="${theme.bg}"/><polygon points="${points}" fill="url(#hatch)"/>`).join("")}
    <path d="${edgePath}" fill="none" stroke="${theme.fg}" stroke-opacity="0.25" stroke-linecap="round"/>
    <path d="${edgePath}" fill="none" stroke="url(#glow)" stroke-width="1.5" stroke-linecap="round"/>
  </g>
  ${doc.text("Fig. 1.", { x: W - 16, y: FIGURE_BOTTOM - 16, anchor: "end", size: 14, spacing: 0.35, fill: theme.mutedFg, opacity: 0.6 })}

  <g stroke="${theme.line}">
    <line x1="0" y1="${AVATAR_Y - 3.5}" x2="${W}" y2="${AVATAR_Y - 3.5}"/>
    <line x1="${AVATAR_COL - 0.5}" y1="${AVATAR_Y - 3.5}" x2="${AVATAR_COL - 0.5}" y2="${TOP_H}"/>
    <line x1="${AVATAR_COL}" y1="${FIGURE_BOTTOM + 0.5}" x2="${W}" y2="${FIGURE_BOTTOM + 0.5}"/>
    <line x1="${AVATAR_COL}" y1="${FIGURE_BOTTOM + NAME_H + 1.5}" x2="${W}" y2="${FIGURE_BOTTOM + NAME_H + 1.5}"/>
    <line x1="0" y1="${TOP_H + 0.5}" x2="${W}" y2="${TOP_H + 0.5}"/>
    <line x1="${W / 2 + 0.5}" y1="${TOP_H}" x2="${W / 2 + 0.5}" y2="${OVERVIEW_BOTTOM}" stroke-dasharray="4 4"/>
    <line x1="0" y1="${OVERVIEW_BOTTOM + 0.5}" x2="${W}" y2="${OVERVIEW_BOTTOM + 0.5}"/>
    <line x1="0" y1="${PROOFS_Y + 0.5}" x2="${W}" y2="${PROOFS_Y + 0.5}"/>
  </g>

  <rect x="2.5" y="${AVATAR_Y + 0.5}" width="159" height="159" rx="16" fill="${theme.bg}" stroke="${theme.border}"/>
  <rect x="4.5" y="${AVATAR_Y + 2.5}" width="155" height="155" rx="14" fill="none" stroke="${theme.avatarEdge}" stroke-width="3"/>
  <image href="data:image/png;base64,${avatar}" x="38" y="${AVATAR_Y + 36}" width="88" height="88" clip-path="url(#avatar-circle)"/>

  ${doc.text(HERO.name, { x: AVATAR_COL + 16, y: FIGURE_BOTTOM + 37, size: 32, weight: 500, spacing: -0.8 })}
  ${HERO.sentences.map((sentence) => doc.text(sentence, { x: AVATAR_COL + 16, y: FIGURE_BOTTOM + NAME_H + 24, font: "mono", size: 14, fill: theme.mutedFg, cls: "flip" })).join("\n  ")}

  ${HERO.overview.map((column, c) => column.map((item, i) => overviewItem(doc, item, c * (W / 2) + 24, TOP_H + 16 + i * (ITEM_H + ITEM_GAP))).join("\n  ")).join("\n  ")}

  <svg x="${captionX}" y="${FIG_Y}" width="${SNAKE_W}" height="${SNAKE_H.toFixed(1)}" viewBox="${figure.viewBox}">${figure.inner}</svg>
  ${captionSvg(doc, caption, captionX, CAPTION_Y)}
  ${doc.text("Moins", { x: legendEnd - 5 * 14 - 3, y: CAPTION_Y, font: "mono", size: 12, fill: theme.mutedFg, anchor: "end" })}
  ${legendCells.join("")}
  ${doc.text("Plus", { x: legendRight, y: CAPTION_Y, font: "mono", size: 12, fill: theme.mutedFg, anchor: "end" })}

  ${proofCells.join("\n  ")}
  ${fieldLabel("En ligne", cursor + 24, PROOFS_Y + 28)}
  ${online.svg}
  `;

  const css = `.flip{opacity:0;animation:flip ${HERO.sentences.length * SENTENCE_SECONDS}s infinite}
.flip:nth-of-type(2){animation-delay:${SENTENCE_SECONDS}s}
.flip:nth-of-type(3){animation-delay:${SENTENCE_SECONDS * 2}s}
@keyframes flip{0%{opacity:0;transform:translateY(4px)}5%{opacity:1;transform:none}30%{opacity:1}33.33%{opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.flip{animation:none}.flip:first-of-type{opacity:1}}`;

  const defs = `<defs>
  <clipPath id="top"><rect width="${W}" height="${TOP_H}"/></clipPath>
  <clipPath id="avatar-circle"><circle cx="82" cy="${AVATAR_Y + 80}" r="44"/></clipPath>
  <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-26.565)">
    <line x1="0" y1="0.5" x2="5" y2="0.5" stroke="${theme.fg}" stroke-opacity="0.15"/>
  </pattern>
  <radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="210" cy="-41" r="150">
    <stop offset="0" stop-color="${theme.primary}"/>
    <stop offset="1" stop-color="${theme.primary}" stop-opacity="0"/>
    <animate attributeName="cx" values="30;210;390;210;30" dur="12s" repeatCount="indefinite"/>
    <animate attributeName="cy" values="-60;-140;-60;30;-60" dur="12s" repeatCount="indefinite"/>
  </radialGradient>
</defs>`;

  // Les phrases qui défilent sont regroupées pour que :nth-of-type compte bien les trois
  const grouped = body.replace(
    new RegExp(`((?:<text[^>]*class="mono flip"[^>]*>[^<]*</text>\\s*){${HERO.sentences.length}})`),
    "<g>$1</g>",
  );

  return doc.render({
    width: W,
    height: HEIGHT,
    title: "Thibault Leture, fondateur de TeeboStudio : développeur web freelance à Bordeaux. Sites, applications web et intégration de l’IA.",
    body: defs + grouped,
    css,
  });
}

function captionSvg(doc, segments, x, y) {
  const { theme } = doc;
  const [fig, rest] = segments;
  const figSvg = doc.text(fig.text.trim(), { x, y, size: 12, spacing: 0.3, fill: theme.mutedFg, opacity: 0.6 });
  return `${figSvg}${doc.paragraph([{ text: rest.text }], { x: x + measure("Fig. 2.", { size: 12, spacing: 0.3 }) + 6, y, width: 700, font: "mono", size: 12, fill: theme.mutedFg, maxLines: 1 }).svg}`;
}
