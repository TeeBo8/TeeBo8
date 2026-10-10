// Chiffres GitHub du profil : tableau en texte pour le README, courbe des 30 derniers jours et calendrier
// avec le serpent. Les images sont en gros caractères pour rester lisibles sur un téléphone.

import { createDoc, levelColors } from "./kit.mjs";

const W = 1024;
const numberFormatter = new Intl.NumberFormat("fr-FR");
const format = (value) => numberFormatter.format(value);
const plural = (value, word) => `${word}${value > 1 ? "s" : ""}`;
const shortDate = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

export function computeStats(days) {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  // La journée en cours n'est pas finie : un zéro aujourd'hui ne casse pas la série
  let index = days.length - 1;
  if (index >= 0 && days[index].count === 0) index -= 1;
  let current = 0;
  while (index >= 0 && days[index].count > 0) {
    current += 1;
    index -= 1;
  }
  return { activeDays: days.filter((day) => day.count > 0).length, current, longest };
}

// Tableau Markdown recopié chaque jour dans le README, entre les balises « chiffres »
export function statsTable({ total, days, publicRepos }) {
  const stats = computeStats(days);
  return [
    // Une ligne par chiffre : lisible sur un téléphone, sans défilement horizontal
    "| Sur 12 mois | |",
    "|---|--:|",
    `| Contributions | **${format(total)}** |`,
    `| Jours actifs | **${format(stats.activeDays)}** |`,
    `| Série en cours | **${stats.current} ${plural(stats.current, "jour")}** |`,
    `| Plus longue série | **${stats.longest} ${plural(stats.longest, "jour")}** |`,
    `| Dépôts publics | **${publicRepos}** |`,
    "",
    "<sub>Dépôts privés compris. Mis à jour chaque jour à partir de l'API GitHub.</sub>",
  ].join("\n");
}

// Graduation lisible au-dessus du maximum (5, 10, 20, 40, 50, 80, 100…)
function niceMax(value) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 4, 5, 8, 10]) if (step * magnitude >= value) return step * magnitude;
  return value;
}

export async function renderChart(theme, { days }) {
  const doc = createDoc(theme);
  const recent = days.slice(-30);
  const sum = recent.reduce((acc, day) => acc + day.count, 0);
  const max = niceMax(Math.max(...recent.map((day) => day.count)));
  const plot = { left: 96, right: W - 40, top: 136, bottom: 400 };
  const height = plot.bottom + 72;
  const x = (i) => plot.left + (i * (plot.right - plot.left)) / (recent.length - 1);
  const y = (count) => plot.bottom - (count / max) * (plot.bottom - plot.top);
  const line = recent.map((day, i) => `${x(i).toFixed(1)},${y(day.count).toFixed(1)}`).join(" ");
  const area = `${plot.left},${plot.bottom} ${line} ${plot.right},${plot.bottom}`;

  const grid = [0, max / 2, max]
    .map(
      (value) => `<line x1="${plot.left}" y1="${y(value)}" x2="${plot.right}" y2="${y(value)}" stroke="${theme.line}"${value ? ' stroke-dasharray="6 6"' : ""}/>
${doc.text(String(Math.round(value)), { x: plot.left - 16, y: y(value) + 8, anchor: "end", font: "mono", size: 22, fill: theme.mutedFg })}`,
    )
    .join("\n");
  const ticks = recent
    .map((day, i) => ({ day, i }))
    .filter(({ i }) => (recent.length - 1 - i) % 7 === 0)
    .map(({ day, i }) => doc.text(shortDate(day.date), { x: x(i), y: plot.bottom + 44, anchor: i === recent.length - 1 ? "end" : "middle", font: "mono", size: 22, fill: theme.mutedFg }))
    .join("\n");

  // Deux repères seulement : le pic et le dernier jour
  const peak = recent.reduce((best, day, i) => (day.count > recent[best].count ? i : best), 0);
  const last = recent.length - 1;
  const markers = [...new Set([peak, last])]
    .map((i) => {
      const cx = x(i);
      const cy = y(recent[i].count);
      const end = i > recent.length - 3;
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="7" fill="${theme.primary}" stroke="${theme.bg}" stroke-width="3"/>
${doc.text(String(recent[i].count), { x: end ? cx - 18 : cx, y: end ? cy + 9 : cy - 18, anchor: end ? "end" : "middle", font: "mono", weight: 500, size: 26, extra: ` stroke="${theme.bg}" stroke-width="5" paint-order="stroke"` })}`;
    })
    .join("\n");

  return doc.render({
    width: W,
    height,
    title: `Contributions par jour sur les 30 derniers jours : ${sum} au total, pic à ${recent[peak].count} le ${shortDate(recent[peak].date)}.`,
    body: `${doc.text("Contributions par jour", { x: 32, y: 64, size: 34, weight: 500, spacing: -0.8 })}
${doc.text(`30 jours · ${format(sum)} au total`, { x: W - 32, y: 62, anchor: "end", font: "mono", size: 22, fill: theme.mutedFg })}
${grid}
<polygon points="${area}" fill="${theme.primary}" fill-opacity="0.14"/>
<polyline points="${line}" fill="none" stroke="${theme.primary}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
${markers}
${ticks}`,
  });
}

// Calendrier de contributions mangé par le serpent (Platane/snk), recoloré aux couleurs du site :
// ses couleurs sont des variables CSS (--ce case vide, --c0 à --c4 niveaux, --cs serpent, --cb contour)
export async function renderSnake(theme, snakeSvg) {
  const doc = createDoc(theme);
  const viewBox = snakeSvg.match(/viewBox="([^"]+)"/)[1];
  const [, , vw, vh] = viewBox.split(" ").map(Number);
  const levels = levelColors(theme);
  const vars = `--cb:transparent;--cs:${theme.fg};--ce:${levels[0]};${levels.map((color, i) => `--c${i}:${color}`).join(";")}`;
  const inner = snakeSvg
    .replace(/^[\s\S]*?<svg[^>]*>/, "")
    .replace(/<\/svg>\s*$/, "")
    .replace(/:root\{[^}]*\}/, `:root{${vars}}`);
  const padding = 24;
  const width = W - padding * 2;
  const height = (width * vh) / vw + padding * 2;
  return doc.render({
    width: W,
    height: Math.round(height),
    title: "Calendrier des contributions de l'année, parcouru par un serpent",
    body: `<svg x="${padding}" y="${padding}" width="${width}" height="${(width * vh) / vw}" viewBox="${viewBox}">${inner}</svg>`,
  });
}
