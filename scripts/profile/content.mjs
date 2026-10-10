// Textes du profil, repris de teebostudio.fr (mêmes mots que le site) : pour changer un texte, c'est ici.
// Uniquement des faits vérifiables, comme sur le site.

export const SITE = "https://teebostudio.fr";
export const CAL_URL = "https://cal.com/thibault-wvmzrm/30min";

export const HERO = {
  name: "Thibault Leture",
  sentences: [
    "Développeur web freelance à Bordeaux.",
    "Sites, applications web et intégration de l’IA.",
    "Next.js · React · TypeScript.",
  ],
  overview: [
    [
      { icon: "codeXml", text: "Fondateur de TeeboStudio" },
      { icon: "mapPin", text: "Bordeaux, France" },
      { icon: "mail", text: "contact@teebostudio.fr", underline: true },
    ],
    [
      { icon: "claude", text: "Membre du programme Claude Startups" },
      { icon: "clock", text: "Réponse sous 24 h" },
      { icon: "send", text: "Recevoir un devis gratuit sous 24 h", pill: true },
    ],
  ],
  proofs: [
    { label: "Sites clients livrés", value: "2" },
    { label: "Clients payants · BeeDirectory", value: "7+" },
    { label: "Délai de réponse", value: "24 h" },
  ],
  online: ["Les Clefs du Crédit", "Cabinet Delcros", "BeeDirectory"],
};

export const SOCIALS = [
  { file: "lien-site", icon: "globe", label: "teebostudio.fr", href: SITE },
  { file: "lien-linkedin", icon: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/thibault-leture-5740242a1/" },
  { file: "lien-x", icon: "x", label: "X", href: "https://x.com/THIBAUL76280609" },
  { file: "lien-indiehackers", icon: "indiehackers", label: "Indie Hackers", href: "https://www.indiehackers.com/Teebostudio" },
  { file: "lien-email", icon: "mail", label: "E-mail", href: "mailto:contact@teebostudio.fr" },
];

// Segments : `strong` = texte en couleur principale du texte, `link` = souligné
export const INTRO = {
  title: "Bonjour",
  bullets: [
    [{ text: "Je suis " }, { text: "Thibault Leture", strong: true }, { text: ", développeur web freelance depuis plus de 3 ans : vous travaillez avec la personne qui écrit le code." }],
    [{ text: "J’accompagne les TPE et PME de Bordeaux et de Gironde en rendez-vous, et partout en France à distance." }],
    [{ text: "Spécialisé en Next.js et React, avec l’IA " }, { text: "Claude", strong: true, link: true }, { text: " intégrée quand elle fait gagner du temps. Le code, le domaine et les comptes sont à votre nom." }],
  ],
};

export const PROJECTS = [
  { file: "projet-clefs-du-credit", name: "Les Clefs du Crédit", icon: "globe", kind: "Projet client · Site vitrine", text: "Site d’un courtier en prêt immobilier : simulateur, blog, référencement local.", stack: "Next.js · MDX · Resend", href: "https://www.lesclefsducredit.fr" },
  { file: "projet-cabinet-delcros", name: "Cabinet Delcros", icon: "globe", kind: "Projet client · Site vitrine", text: "Site d’un courtier bordelais, avec cinq simulateurs de prêt testés.", stack: "Next.js · Zod · Vitest", href: "https://cabinetdelcros.com" },
];

export const PORTFOLIO = { text: "Les études de cas détaillées :", link: "teebostudio.fr/portfolio", href: `${SITE}/portfolio` };

export const TESTIMONIALS = [
  { name: "Christopher Tassin", role: "Gérant · lesclefsducredit.fr", icon: "lesclefsducredit-icon.png", content: "Un travail professionnel et minutieux. Le site est moderne, rapide et exactement ce qu'il nous fallait pour développer notre activité. Je recommande vivement !" },
  { name: "Lucas Delcros", role: "Gérant · cabinetdelcros.com", icon: "cabinetdelcros-icon.png", content: "Thibault a créé le site de mon cabinet de A à Z : un design qui me ressemble, des simulateurs de prêt qui me ramènent des contacts et une vidéo de présentation en bonus. Il est à l'écoute, réactif, et il a intégré chacun de mes retours. Je recommande." },
  { name: "Valentin Macovei", role: "Créateur de newsletter · valentinsecondtry.com", icon: "secondtry-icon.png", content: "Thibault communique très bien, c'est très simple de travailler avec lui. Je lui ai demandé un panneau d'administration utilisateurs : tout était réglé à la perfection en quelques heures." },
];

export const CODE = {
  title: "Côté code",
  bullets: [
    ["TypeScript strict de bout en bout", " : schéma Drizzle, API tRPC et validation Zod partagent les mêmes types, du navigateur à la base."],
    ["Un bug, d’abord un test", " : j’écris le test qui le reproduit, puis je corrige jusqu’à ce qu’il passe."],
    ["Petits commits, une pull request par sujet", ", avec une CI qui bloque au premier avertissement de lint, test rouge ou build cassé."],
    ["Revue de code à froid", " avant chaque mise en production, pour trouver ce qu’on ne voit plus quand on a la tête dans le projet."],
    ["Claude Code au quotidien", " : je m’en sers pour aller plus vite, et je relis, teste et sais expliquer tout ce qui part en production."],
  ],
};

// Couleurs de marque : [thème clair, thème sombre] ; null = couleur du texte
export const STACK = [
  { category: "Langage et framework", tools: [["TypeScript", "typescript", ["#3178C6", "#3178C6"]], ["Next.js", "nextdotjs", null], ["React", "react", ["#087EA4", "#61DAFB"]]] },
  { category: "Interface", tools: [["Tailwind CSS", "tailwindcss", ["#06B6D4", "#06B6D4"]], ["shadcn/ui", "shadcnui", null], ["Motion", "framer", ["#0055FF", "#4C8DFF"]], ["Figma", "figma", ["#F24E1E", "#F24E1E"]]] },
  { category: "Données et API", tools: [["PostgreSQL", "postgresql", ["#4169E1", "#7C9BF5"]], ["Neon", "neon", ["#00A86B", "#00E599"]], ["Drizzle ORM", "drizzle", ["#6B8E00", "#C5F74F"]], ["tRPC", "trpc", ["#2596BE", "#2596BE"]], ["Zod", "zod", ["#408AFF", "#408AFF"]]] },
  { category: "Comptes, paiements, emails", tools: [["Better Auth", "betterauth", null], ["Stripe", "stripe", ["#635BFF", "#8A84FF"]], ["Resend", "resend", null]] },
  { category: "IA et contenus", tools: [["Claude", "claude", ["#D97757", "#D97757"]], ["MDX", "mdx", ["#C98A00", "#F9AC00"]], ["Remotion", "clapperboard", ["#0B84F3", "#0B84F3"]]] },
  { category: "Tests et mise en ligne", tools: [["Vitest", "vitest", ["#6E9F18", "#6E9F18"]], ["Playwright", "playwright", ["#2EAD33", "#2EAD33"]], ["GitHub", "github", null], ["GitHub Actions", "githubactions", ["#2088FF", "#2088FF"]], ["Vercel", "vercel", null], ["pnpm", "pnpm", ["#F69220", "#F69220"]]] },
];

export const CONTACT = {
  title: "Un projet, une mission ?",
  text: "Premier appel de 30 minutes, gratuit et sans engagement. Réponse sous 24 h.",
  button: "Prendre contact",
  email: "contact@teebostudio.fr",
  href: `${SITE}/#contact`,
};
