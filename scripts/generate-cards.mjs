// Génère les cartes de statistiques du README de profil, en SVG.
//
// Les chiffres viennent de l'API GraphQL de GitHub (calendrier public de
// contributions). Aucun service tiers : le workflow lance ce script chaque
// jour et publie les fichiers sur la branche « output », avec le serpent.
//
// Usage : GITHUB_TOKEN=... node scripts/generate-cards.mjs [login] [dossier]

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const login = process.argv[2] ?? "TeeBo8";
const outDir = process.argv[3] ?? "dist";
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error("GITHUB_TOKEN manquant");
  process.exit(1);
}

const THEMES = {
  light: {
    surface: "#ffffff",
    border: "#d1d9e0",
    ink: "#1f2328",
    muted: "#59636e",
    grid: "#eaeef2",
    accent: "#047857",
  },
  dark: {
    surface: "#0d1117",
    border: "#3d444d",
    ink: "#f0f6fc",
    muted: "#9198a1",
    grid: "#21262d",
    accent: "#0ea371",
  },
};

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif";

async function fetchDays() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "profile-cards",
    },
    body: JSON.stringify({
      query: `query ($login: String!) {
        user(login: $login) {
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks { contributionDays { date contributionCount } }
            }
          }
        }
      }`,
      variables: { login },
    }),
  });

  const json = await response.json();
  if (!response.ok || json.errors) {
    throw new Error(`API GitHub : ${JSON.stringify(json.errors ?? json)}`);
  }

  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks
    .flatMap((week) => week.contributionDays)
    .map((day) => ({ date: day.date, count: day.contributionCount }));

  return { total: calendar.totalContributions, days };
}

export function computeStats(days) {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }

  // La journée en cours n'est pas finie : un zéro aujourd'hui ne casse pas la série.
  let index = days.length - 1;
  if (index >= 0 && days[index].count === 0) index -= 1;
  let current = 0;
  while (index >= 0 && days[index].count > 0) {
    current += 1;
    index -= 1;
  }

  return {
    activeDays: days.filter((day) => day.count > 0).length,
    current,
    longest,
  };
}

const formatNumber = (value) =>
  value.toLocaleString("fr-FR").replace(/\s/g, " ");

const plural = (value, word) => `${word}${value > 1 ? "s" : ""}`;

const shortDate = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

const escapeXml = (text) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function frame(width, height, theme, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
  <title>${escapeXml(title)}</title>
  <rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${theme.surface}" stroke="${theme.border}"/>
  <g font-family="${FONT}">
${body}
  </g>
</svg>
`;
}

function statsCard(theme, total, stats) {
  const width = 840;
  const height = 124;
  const tiles = [
    { value: formatNumber(total), label: "contributions", note: "12 derniers mois" },
    { value: formatNumber(stats.activeDays), label: stats.activeDays > 1 ? "jours actifs" : "jour actif", note: "12 derniers mois" },
    { value: formatNumber(stats.current), label: plural(stats.current, "jour") + " d'affilée", note: "série en cours" },
    { value: formatNumber(stats.longest), label: plural(stats.longest, "jour") + " d'affilée", note: "plus longue série" },
  ];
  const tileWidth = width / tiles.length;

  const body = tiles
    .map((tile, i) => {
      const cx = tileWidth * i + tileWidth / 2;
      const separator =
        i === 0
          ? ""
          : `    <line x1="${tileWidth * i}" y1="26" x2="${tileWidth * i}" y2="${height - 26}" stroke="${theme.grid}"/>\n`;
      return `${separator}    <text x="${cx}" y="56" text-anchor="middle" font-size="32" font-weight="700" fill="${theme.ink}">${tile.value}</text>
    <text x="${cx}" y="80" text-anchor="middle" font-size="13" font-weight="600" fill="${theme.ink}">${escapeXml(tile.label)}</text>
    <text x="${cx}" y="99" text-anchor="middle" font-size="12" fill="${theme.muted}">${escapeXml(tile.note)}</text>`;
    })
    .join("\n");

  const title = `${formatNumber(total)} contributions sur 12 mois, ${stats.activeDays} jours actifs, série en cours de ${stats.current} jours, plus longue série de ${stats.longest} jours`;
  return frame(width, height, theme, title, body);
}

function niceMax(value) {
  if (value <= 5) return 5;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 4, 5, 8, 10]) {
    if (step * magnitude >= value) return step * magnitude;
  }
  return value;
}

function activityCard(theme, days) {
  const width = 840;
  const height = 250;
  const plot = { left: 44, right: width - 24, top: 58, bottom: height - 40 };
  const recent = days.slice(-30);
  const max = niceMax(Math.max(...recent.map((day) => day.count)));

  const x = (i) => plot.left + (i * (plot.right - plot.left)) / (recent.length - 1);
  const y = (count) => plot.bottom - (count / max) * (plot.bottom - plot.top);
  const point = (day, i) => `${x(i).toFixed(1)},${y(day.count).toFixed(1)}`;

  const line = recent.map(point).join(" ");
  const area = `${plot.left},${plot.bottom} ${line} ${plot.right},${plot.bottom}`;

  const grid = [0, max / 2, max]
    .map(
      (value) => `    <line x1="${plot.left}" y1="${y(value)}" x2="${plot.right}" y2="${y(value)}" stroke="${theme.grid}"/>
    <text x="${plot.left - 8}" y="${y(value) + 4}" text-anchor="end" font-size="11" fill="${theme.muted}">${Math.round(value)}</text>`
    )
    .join("\n");

  const ticks = recent
    .map((day, i) => ({ day, i }))
    .filter(({ i }) => (recent.length - 1 - i) % 7 === 0)
    .map(
      ({ day, i }) =>
        `    <text x="${x(i).toFixed(1)}" y="${plot.bottom + 20}" text-anchor="${i === recent.length - 1 ? "end" : "middle"}" font-size="11" fill="${theme.muted}">${shortDate(day.date)}</text>`
    )
    .join("\n");

  // Deux étiquettes seulement : le pic et le dernier jour.
  const peakIndex = recent.reduce((best, day, i) => (day.count > recent[best].count ? i : best), 0);
  const lastIndex = recent.length - 1;
  const labelled = [...new Set([peakIndex, lastIndex])];
  const markers = labelled
    .map((i) => {
      const cx = x(i);
      const cy = y(recent[i].count);
      const anchor = i > recent.length - 3 ? "end" : "middle";
      const labelX = anchor === "end" ? cx - 10 : cx;
      const labelY = anchor === "end" ? cy + 4 : cy - 11;
      return `    <circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="${theme.accent}" stroke="${theme.surface}" stroke-width="2"/>
    <text x="${labelX.toFixed(1)}" y="${labelY.toFixed(1)}" text-anchor="${anchor}" font-size="12" font-weight="600" fill="${theme.ink}" stroke="${theme.surface}" stroke-width="3" paint-order="stroke">${recent[i].count}</text>`;
    })
    .join("\n");

  const sum = recent.reduce((total, day) => total + day.count, 0);
  const body = `    <text x="24" y="32" font-size="14" font-weight="600" fill="${theme.ink}">Contributions par jour</text>
    <text x="${width - 24}" y="32" text-anchor="end" font-size="12" fill="${theme.muted}">30 derniers jours · ${formatNumber(sum)} au total</text>
${grid}
    <polygon points="${area}" fill="${theme.accent}" fill-opacity="0.12"/>
    <polyline points="${line}" fill="none" stroke="${theme.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
${markers}
${ticks}`;

  const title = `Contributions par jour sur les 30 derniers jours : ${sum} au total, pic à ${recent[peakIndex].count} le ${shortDate(recent[peakIndex].date)}`;
  return frame(width, height, theme, title, body);
}

const { total, days } = await fetchDays();
const stats = computeStats(days);

await mkdir(outDir, { recursive: true });
for (const [name, theme] of Object.entries(THEMES)) {
  const suffix = name === "dark" ? "-dark" : "";
  await writeFile(join(outDir, `stats${suffix}.svg`), statsCard(theme, total, stats));
  await writeFile(join(outDir, `activity${suffix}.svg`), activityCard(theme, days));
}

console.log(
  `${login} : ${total} contributions, ${stats.activeDays} jours actifs, série ${stats.current}, record ${stats.longest}`
);
