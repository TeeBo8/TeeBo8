// « En chiffres » : contributions, jours actifs et séries sur 12 mois, puis courbe des 30 derniers jours.
// Mêmes calculs que les anciennes cartes du profil, au design de teebostudio.fr.

import { createDoc } from "./kit.mjs";

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

// Graduation lisible au-dessus du maximum (5, 10, 20, 40, 50, 80, 100…)
function niceMax(value) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 4, 5, 8, 10]) if (step * magnitude >= value) return step * magnitude;
  return value;
}

export async function renderStats(theme, { total, days }) {
  const doc = createDoc(theme);
  const stats = computeStats(days);
  const headerH = 80;

  // Quatre cases, comme la bande de preuves du site
  const tiles = [
    { value: format(total), label: "contributions", note: "12 derniers mois" },
    { value: format(stats.activeDays), label: stats.activeDays > 1 ? "jours actifs" : "jour actif", note: "12 derniers mois" },
    { value: format(stats.current), label: `${plural(stats.current, "jour")} d’affilée`, note: "série en cours" },
    { value: format(stats.longest), label: `${plural(stats.longest, "jour")} d’affilée`, note: "plus longue série" },
  ];
  const tileW = W / tiles.length;
  const tilesH = 112;
  const tilesSvg = tiles
    .map((tile, i) => {
      const x = i * tileW + 24;
      return `${i ? `<line x1="${i * tileW + 0.5}" y1="${headerH}" x2="${i * tileW + 0.5}" y2="${headerH + tilesH}" stroke="${theme.line}" stroke-dasharray="4 4"/>` : ""}
${doc.text(tile.note.toUpperCase(), { x, y: headerH + 30, font: "mono", weight: 500, size: 10, spacing: 1, fill: theme.mutedFg })}
${doc.text(tile.value, { x, y: headerH + 68, font: "mono", weight: 500, size: 32, spacing: -0.5 })}
${doc.text(tile.label, { x, y: headerH + 92, size: 14, fill: theme.mutedFg })}`;
    })
    .join("\n");

  // Courbe des 30 derniers jours
  const chartTop = headerH + tilesH;
  const recent = days.slice(-30);
  const sum = recent.reduce((acc, day) => acc + day.count, 0);
  const max = niceMax(Math.max(...recent.map((day) => day.count)));
  const plot = { left: 64, right: W - 32, top: chartTop + 76, bottom: chartTop + 256 };
  const height = plot.bottom + 64;
  const x = (i) => plot.left + (i * (plot.right - plot.left)) / (recent.length - 1);
  const y = (count) => plot.bottom - (count / max) * (plot.bottom - plot.top);
  const line = recent.map((day, i) => `${x(i).toFixed(1)},${y(day.count).toFixed(1)}`).join(" ");
  const area = `${plot.left},${plot.bottom} ${line} ${plot.right},${plot.bottom}`;

  const grid = [0, max / 2, max]
    .map(
      (value) => `<line x1="${plot.left}" y1="${y(value)}" x2="${plot.right}" y2="${y(value)}" stroke="${theme.line}"${value ? ' stroke-dasharray="4 4"' : ""}/>
${doc.text(String(Math.round(value)), { x: plot.left - 12, y: y(value) + 4, anchor: "end", font: "mono", size: 11, fill: theme.mutedFg })}`,
    )
    .join("\n");
  const ticks = recent
    .map((day, i) => ({ day, i }))
    .filter(({ i }) => (recent.length - 1 - i) % 7 === 0)
    .map(({ day, i }) => doc.text(shortDate(day.date), { x: x(i), y: plot.bottom + 22, anchor: i === recent.length - 1 ? "end" : "middle", font: "mono", size: 11, fill: theme.mutedFg }))
    .join("\n");

  // Deux repères seulement : le pic et le dernier jour
  const peak = recent.reduce((best, day, i) => (day.count > recent[best].count ? i : best), 0);
  const last = recent.length - 1;
  const markers = [...new Set([peak, last])]
    .map((i) => {
      const cx = x(i);
      const cy = y(recent[i].count);
      const end = i > recent.length - 3;
      return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="${theme.primary}" stroke="${theme.bg}" stroke-width="2"/>
${doc.text(String(recent[i].count), { x: end ? cx - 12 : cx, y: end ? cy + 4 : cy - 12, anchor: end ? "end" : "middle", font: "mono", weight: 500, size: 12, extra: ` stroke="${theme.bg}" stroke-width="3" paint-order="stroke"` })}`;
    })
    .join("\n");

  return doc.render({
    width: W,
    height,
    title: `En chiffres : ${format(total)} contributions sur 12 mois, ${stats.activeDays} jours actifs, série en cours de ${stats.current} jours, plus longue série de ${stats.longest} jours. Sur les 30 derniers jours : ${sum} contributions, pic à ${recent[peak].count} le ${shortDate(recent[peak].date)}.`,
    body: `${doc.heading("En chiffres", { y: 52 })}
<g stroke="${theme.line}">
  <line x1="0" y1="${headerH + 0.5}" x2="${W}" y2="${headerH + 0.5}"/>
  <line x1="0" y1="${chartTop + 0.5}" x2="${W}" y2="${chartTop + 0.5}"/>
</g>
${tilesSvg}
${doc.text("Contributions par jour", { x: 24, y: chartTop + 40, size: 16, weight: 500 })}
${doc.text(`30 derniers jours · ${format(sum)} au total`, { x: W - 24, y: chartTop + 40, anchor: "end", font: "mono", size: 12, fill: theme.mutedFg })}
${grid}
<polygon points="${area}" fill="${theme.primary}" fill-opacity="0.14"/>
<polyline points="${line}" fill="none" stroke="${theme.primary}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
${markers}
${ticks}
${doc.text("Fig. 3.", { x: 24, y: height - 20, size: 12, spacing: 0.3, fill: theme.mutedFg, opacity: 0.6 })}${doc.text("Dépôts privés compris. Source : API GitHub, mise à jour chaque jour.", { x: 72, y: height - 20, font: "mono", size: 12, fill: theme.mutedFg })}`,
  });
}
