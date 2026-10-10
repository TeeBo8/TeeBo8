// Bannière du profil : le haut de teebostudio.fr (monogramme TS en relief, avatar, nom, phrases qui
// défilent), en gros caractères pour rester lisible une fois réduite sur un téléphone.
//
// Le monogramme reprend le dessin de TsMarkIsometric (site TeeboStudio), lui-même inspiré de
// chanhdai.com — Copyright (c) 2026 Chánh Đại, licence MIT. Sans JS, la lueur qui suit le curseur
// sur le site fait ici le tour du mot toute seule.

import { createDoc } from "./kit.mjs";

const NAME = "Thibault Leture";
const SENTENCES = [
  "Développeur web freelance à Bordeaux.",
  "Sites, applications web et intégration de l’IA.",
  "Next.js · React · TypeScript.",
];
const SENTENCE_SECONDS = 3.2;

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

// ---------- Mise en page ----------

const W = 1024;
const MONO_W = 640;
const SCALE = MONO_W / VIEW.w;
const MONO_X = (W - MONO_W) / 2;
const MONO_Y = 20;
const FIGURE_BOTTOM = Math.round(MONO_Y * 2 + VIEW.h * SCALE);
const AVATAR = 168;
const AVATAR_COL = AVATAR + 32;
const NAME_H = AVATAR + 32;
const TAGLINE_H = 84;
const HEIGHT = FIGURE_BOTTOM + NAME_H + TAGLINE_H;

const toBanner = (x, y) => [MONO_X + ((x + y) * A - VIEW.x) * SCALE, MONO_Y + (((y - x) * A) / 2 - VIEW.y) * SCALE];
const GUIDE_ANGLE = Math.atan(1 / 2);
const GUIDES = [
  [...toBanner(0, 5), -GUIDE_ANGLE],
  [...toBanner(0, 0), GUIDE_ANGLE],
  [...toBanner(10, 0), GUIDE_ANGLE],
].map(([x, y, angle]) => {
  const dx = Math.cos(angle) * 2000;
  const dy = Math.sin(angle) * 2000;
  return `M${(x - dx).toFixed(1)},${(y - dy).toFixed(1)} L${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`;
});

export async function renderBanner(theme, { avatar }) {
  const doc = createDoc(theme);
  const monoTransform = `translate(${(MONO_X - VIEW.x * SCALE).toFixed(2)} ${(MONO_Y - VIEW.y * SCALE).toFixed(2)}) scale(${SCALE.toFixed(4)})`;
  const avatarY = FIGURE_BOTTOM + 16;
  const imageSize = 100;

  const sentences = SENTENCES.map((sentence) =>
    doc.text(sentence, { x: 32, y: FIGURE_BOTTOM + NAME_H + 53, font: "mono", size: 30, fill: theme.mutedFg, cls: "flip" }),
  );

  const body = `<defs>
  <clipPath id="top"><rect width="${W}" height="${FIGURE_BOTTOM}"/></clipPath>
  <clipPath id="avatar-circle"><circle cx="${16 + AVATAR / 2}" cy="${avatarY + AVATAR / 2}" r="${imageSize / 2}"/></clipPath>
  <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-26.565)">
    <line x1="0" y1="0.5" x2="5" y2="0.5" stroke="${theme.fg}" stroke-opacity="0.15"/>
  </pattern>
  <radialGradient id="glow" gradientUnits="userSpaceOnUse" cx="210" cy="-41" r="150">
    <stop offset="0" stop-color="${theme.primary}"/>
    <stop offset="1" stop-color="${theme.primary}" stop-opacity="0"/>
    <animate attributeName="cx" values="30;210;390;210;30" dur="12s" repeatCount="indefinite"/>
    <animate attributeName="cy" values="-60;-140;-60;30;-60" dur="12s" repeatCount="indefinite"/>
  </radialGradient>
</defs>
<g clip-path="url(#top)" fill="none" stroke="${theme.line}" stroke-dasharray="6 3">
  ${GUIDES.map((d) => `<path d="${d}"/>`).join("\n  ")}
</g>
<g transform="${monoTransform}">
  ${sideFaces.map((points) => `<polygon points="${points}" fill="${theme.bg}"/>`).join("")}
  ${topFaces.map((points) => `<polygon points="${points}" fill="${theme.bg}"/><polygon points="${points}" fill="url(#hatch)"/>`).join("")}
  <path d="${edgePath}" fill="none" stroke="${theme.fg}" stroke-opacity="0.25" stroke-linecap="round"/>
  <path d="${edgePath}" fill="none" stroke="url(#glow)" stroke-width="1.5" stroke-linecap="round"/>
</g>
${doc.text("Fig. 1.", { x: W - 20, y: FIGURE_BOTTOM - 20, anchor: "end", size: 18, spacing: 0.45, fill: theme.mutedFg, opacity: 0.6 })}

<g stroke="${theme.line}">
  <line x1="0" y1="${FIGURE_BOTTOM + 0.5}" x2="${W}" y2="${FIGURE_BOTTOM + 0.5}"/>
  <line x1="${AVATAR_COL - 0.5}" y1="${FIGURE_BOTTOM}" x2="${AVATAR_COL - 0.5}" y2="${FIGURE_BOTTOM + NAME_H}"/>
  <line x1="0" y1="${FIGURE_BOTTOM + NAME_H + 0.5}" x2="${W}" y2="${FIGURE_BOTTOM + NAME_H + 0.5}"/>
</g>

<rect x="16.5" y="${avatarY + 0.5}" width="${AVATAR - 1}" height="${AVATAR - 1}" rx="18" fill="${theme.bg}" stroke="${theme.border}"/>
<rect x="18.5" y="${avatarY + 2.5}" width="${AVATAR - 5}" height="${AVATAR - 5}" rx="16" fill="none" stroke="${theme.avatarEdge}" stroke-width="3"/>
<image href="data:image/png;base64,${avatar}" x="${16 + (AVATAR - imageSize) / 2}" y="${avatarY + (AVATAR - imageSize) / 2}" width="${imageSize}" height="${imageSize}" clip-path="url(#avatar-circle)"/>

${doc.text(NAME, { x: AVATAR_COL + 32, y: FIGURE_BOTTOM + NAME_H / 2 + 24, size: 68, weight: 500, spacing: -1.6 })}
<g>${sentences.join("")}</g>`;

  return doc.render({
    width: W,
    height: HEIGHT,
    title: `${NAME} : ${SENTENCES.join(" ")}`,
    body,
    css: `.flip{opacity:0;animation:flip ${SENTENCES.length * SENTENCE_SECONDS}s infinite}
.flip:nth-of-type(2){animation-delay:${SENTENCE_SECONDS}s}
.flip:nth-of-type(3){animation-delay:${SENTENCE_SECONDS * 2}s}
@keyframes flip{0%{opacity:0;transform:translateY(4px)}5%{opacity:1;transform:none}30%{opacity:1}33.33%{opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion:reduce){.flip{animation:none}.flip:first-of-type{opacity:1}}`,
  });
}
