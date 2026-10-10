// Génère les images du README de profil au design de teebostudio.fr (bannière, courbe des 30 derniers
// jours, calendrier avec le serpent) et met à jour le tableau des chiffres dans le README.
//
// Les chiffres viennent de l'API GraphQL de GitHub (calendrier de contributions, dépôts privés compris).
// Le serpent est produit juste avant par Platane/snk dans le même dossier, puis recoloré.
// Le workflow lance ce script chaque jour, publie le dossier sur la branche « output »
// et enregistre le README s'il a changé.
//
// Usage : GITHUB_TOKEN=... node scripts/generate-profile.mjs [login] [dossier]

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { renderBanner } from "./profile/banner.mjs";
import { THEME } from "./profile/kit.mjs";
import { renderChart, renderSnake, statsTable } from "./profile/stats.mjs";

const login = process.argv[2] ?? "TeeBo8";
const outDir = process.argv[3] ?? "dist";
const token = process.env.GITHUB_TOKEN;
const README = new URL("../README.md", import.meta.url);

if (!token) {
  console.error("GITHUB_TOKEN manquant");
  process.exit(1);
}

async function fetchGitHub() {
  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "profile-images" },
    body: JSON.stringify({
      query: `query ($login: String!) {
        user(login: $login) {
          repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
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

  const { repositories, contributionsCollection } = json.data.user;
  const calendar = contributionsCollection.contributionCalendar;
  const days = calendar.weeks.flatMap((week) => week.contributionDays).map((day) => ({ date: day.date, count: day.contributionCount }));
  return { total: calendar.totalContributions, days, publicRepos: repositories.totalCount };
}

const [github, avatar, snake] = await Promise.all([
  fetchGitHub(),
  readFile(new URL("../assets/avatar.png", import.meta.url)).then((buffer) => buffer.toString("base64")),
  readFile(join(outDir, "github-snake-dark.svg"), "utf8"),
]);

await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "banniere.svg"), await renderBanner(THEME, { avatar }));
await writeFile(join(outDir, "courbe.svg"), await renderChart(THEME, github));
await writeFile(join(outDir, "serpent.svg"), await renderSnake(THEME, snake));

// Tableau des chiffres : remplacé entre les deux balises du README
const readme = await readFile(README, "utf8");
if (!readme.includes("<!-- chiffres:debut -->")) throw new Error("Balises « chiffres » absentes du README");
await writeFile(
  README,
  readme.replace(/(<!-- chiffres:debut -->)[\s\S]*?(<!-- chiffres:fin -->)/, (_, start, end) => `${start}\n${statsTable(github)}\n${end}`),
);

console.log(`Images et chiffres à jour pour ${login} : ${github.total} contributions, ${github.publicRepos} dépôts publics`);
