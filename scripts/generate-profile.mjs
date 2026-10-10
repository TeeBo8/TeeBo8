// Génère toutes les images du README de profil, aux couleurs et au design de teebostudio.fr,
// en version claire et sombre (fichier.svg et fichier-dark.svg).
//
// Les chiffres viennent de l'API GraphQL de GitHub (calendrier de contributions, dépôts privés compris).
// Le serpent est produit juste avant par Platane/snk dans le même dossier, puis intégré à l'entête.
// Le workflow lance ce script chaque jour et publie le dossier sur la branche « output ».
//
// Usage : GITHUB_TOKEN=... node scripts/generate-profile.mjs [login] [dossier]

import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { PROJECTS, SOCIALS } from "./profile/content.mjs";
import { renderHero } from "./profile/hero.mjs";
import { loadMetrics, THEMES } from "./profile/kit.mjs";
import {
  PORTFOLIO,
  renderCode,
  renderContact,
  renderIntro,
  renderLinkStrip,
  renderProject,
  renderSocial,
  renderStack,
  renderTestimonials,
  renderTitle,
} from "./profile/sections.mjs";
import { renderStats } from "./profile/stats.mjs";

const login = process.argv[2] ?? "TeeBo8";
const outDir = process.argv[3] ?? "dist";
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error("GITHUB_TOKEN manquant");
  process.exit(1);
}

async function fetchContributions() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-images" },
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
  if (!response.ok || json.errors) throw new Error(`API GitHub : ${JSON.stringify(json.errors ?? json)}`);

  const calendar = json.data.user.contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((week) => week.contributionDays).map((day) => ({ date: day.date, count: day.contributionCount }));
  return { total: calendar.totalContributions, days, first: days[0].date, last: days.at(-1).date };
}

const readBase64 = async (path) => (await readFile(new URL(path, import.meta.url))).toString("base64");

const [contributions, avatar, , snakeLight, snakeDark] = await Promise.all([
  fetchContributions(),
  readBase64("../assets/avatar.png"),
  loadMetrics(),
  readFile(join(outDir, "github-snake.svg"), "utf8"),
  readFile(join(outDir, "github-snake-dark.svg"), "utf8"),
]);
const clientIcons = Object.fromEntries(
  await Promise.all(
    (await readdir(new URL("../assets/clients/", import.meta.url))).map(async (file) => [file, await readBase64(`../assets/clients/${file}`)]),
  ),
);

// Nom du fichier → rendu pour un thème
const IMAGES = {
  hero: (theme) => renderHero(theme, { avatar, snake: theme.name === "dark" ? snakeDark : snakeLight, contributions }),
  ...Object.fromEntries(SOCIALS.map((social) => [social.file, (theme) => renderSocial(theme, social)])),
  intro: renderIntro,
  chiffres: (theme) => renderStats(theme, contributions),
  temoignages: (theme) => renderTestimonials(theme, clientIcons),
  "titre-realisations": (theme) => renderTitle(theme, { title: "Réalisations", aside: "teebostudio.fr/portfolio" }),
  ...Object.fromEntries(PROJECTS.map((project, index) => [project.file, (theme) => renderProject(theme, project, index)])),
  portfolio: (theme) => renderLinkStrip(theme, PORTFOLIO),
  code: renderCode,
  stack: renderStack,
  contact: renderContact,
};

await mkdir(outDir, { recursive: true });
for (const [name, render] of Object.entries(IMAGES)) {
  await writeFile(join(outDir, `${name}.svg`), await render(THEMES.light));
  await writeFile(join(outDir, `${name}-dark.svg`), await render(THEMES.dark));
}
console.log(`${Object.keys(IMAGES).length * 2} images générées pour ${login} (${contributions.total} contributions)`);
