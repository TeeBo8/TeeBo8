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

export const EXPERTISES = [
  { file: "expertise-sites", name: "Sites web", icon: "globe", tags: ["Landing page", "Site vitrine", "Site + CMS"], price: "Dès 300 €", delay: "2 à 14 jours", href: `${SITE}/creation-site-web`, decor: "mesh" },
  { file: "expertise-applications", name: "Applications web", icon: "appWindow", tags: ["Sur-mesure", "SaaS", "Tableau de bord"], price: "Dès 2 990 €", delay: "Selon projet", href: `${SITE}/saas` },
  { file: "expertise-identite", name: "Identité & vidéo", icon: "palette", tags: ["Logo", "Vidéo motion", "Réseaux sociaux"], price: "Dès 290 €", delay: "Dès 3 jours", href: `${SITE}/video-motion-design` },
  { file: "expertise-ia", name: "Intégration IA", icon: "sparkles", tags: ["Claude", "Automatisations n8n", "Assistant"], price: "Dès 490 €", delay: "3 jours à 2 semaines", href: `${SITE}/integration-ia`, decor: "dots", badge: "Nouveau", note: "Membre de Claude for Startups" },
];

export const AUDIT = { text: "Pas sûr de ce qu’il vous faut ?", link: "Commencez par l’audit gratuit de votre site", href: `${SITE}/audit-gratuit` };

// `open` : dépôt public, la carte mène au code
export const PROJECTS = [
  { file: "projet-clefs-du-credit", name: "Les Clefs du Crédit", icon: "globe", kind: "Projet client · Site vitrine", text: "Site d’un courtier en prêt immobilier : simulateur, blog, référencement local.", stack: "Next.js · MDX · Resend", href: "https://www.lesclefsducredit.fr" },
  { file: "projet-cabinet-delcros", name: "Cabinet Delcros", icon: "globe", kind: "Projet client · Site vitrine", text: "Site d’un courtier bordelais, avec cinq simulateurs de prêt testés.", stack: "Next.js · Zod · Vitest", href: "https://cabinetdelcros.com" },
  { file: "projet-beedirectory", name: "BeeDirectory", icon: "layoutDashboard", kind: "Projet personnel · SaaS en production", text: "Annuaire de newsletters pour trouver où sponsoriser. Clients payants.", stack: "Next.js · Neon · Drizzle · Better Auth · Stripe", href: "https://bee-directory.com" },
  { file: "projet-neuroblend", name: "NeuroBlend", icon: "store", kind: "Démo · Place de marché", open: true, text: "Trois rôles (client, vendeur, admin), paiements répartis par Stripe Connect, démo en un clic.", stack: "Next.js · Drizzle · Stripe Connect", href: "https://github.com/TeeBo8/NeuroBlend-Marketplace" },
  { file: "projet-nopaynodate", name: "NoPayNoDate", icon: "creditCard", kind: "Démo · Application avec paiement", open: true, text: "Dépôt bloqué puis versé ou remboursé par Stripe Connect, chat en temps réel, démo en un clic.", stack: "Next.js · tRPC · Stripe Connect", href: "https://github.com/TeeBo8/nopaynodate" },
  { file: "projet-conformefr", name: "ConformeFR", icon: "codeXml", kind: "Projet personnel · Outil gratuit", open: true, text: "Mentions légales où la loi reste du code testé et où le modèle de langage ne fait qu’expliquer.", stack: "Next.js · tRPC · Drizzle · Claude", href: "https://github.com/TeeBo8/conforme" },
  { file: "projet-teebostudio", name: "TeeboStudio", icon: "sparkles", kind: "Mon site · En production", text: "Audit de site gratuit rédigé par IA et assistant Claude, en français et en anglais.", stack: "Next.js · Claude · Stripe · Resend", href: SITE },
  { file: "projet-video", name: "La vidéo TeeboStudio", icon: "clapperboard", kind: "Motion design · Remotion", open: true, text: "Une vidéo écrite en React : une composition, trois formats, deux thèmes, rendue par GitHub Actions.", stack: "Remotion · React · GitHub Actions", href: "https://github.com/TeeBo8/teebostudio-video" },
];

export const PORTFOLIO = { text: "Les études de cas détaillées :", link: "teebostudio.fr/portfolio", href: `${SITE}/portfolio` };

export const TESTIMONIALS = [
  { name: "Christopher Tassin", role: "Gérant · lesclefsducredit.fr", icon: "lesclefsducredit-icon.png", content: "Un travail professionnel et minutieux. Le site est moderne, rapide et exactement ce qu'il nous fallait pour développer notre activité. Je recommande vivement !" },
  { name: "Lucas Delcros", role: "Gérant · cabinetdelcros.com", icon: "cabinetdelcros-icon.png", content: "Thibault a créé le site de mon cabinet de A à Z : un design qui me ressemble, des simulateurs de prêt qui me ramènent des contacts et une vidéo de présentation en bonus. Il est à l'écoute, réactif, et il a intégré chacun de mes retours. Je recommande." },
  { name: "Valentin Macovei", role: "Créateur de newsletter · valentinsecondtry.com", icon: "secondtry-icon.png", content: "Thibault communique très bien, c'est très simple de travailler avec lui. Je lui ai demandé un panneau d'administration utilisateurs : tout était réglé à la perfection en quelques heures." },
];

export const PROCESS = {
  title: "Comment ça se passe",
  steps: [
    { title: "Appel de 30 minutes", text: "Gratuit et sans engagement. Vous me présentez votre activité et votre besoin, je vous dis franchement ce qui est utile… et ce qui ne l’est pas.", cubes: [[0, 0, 0]] },
    { title: "Devis à prix fixe", text: "Pages, fonctionnalités, délai et prix : tout est écrit noir sur blanc avant de commencer. Pas de dépassement surprise.", cubes: [[0, 0, 0], [1, 0, 0]] },
    { title: "Conception et développement", text: "Maquette validée ensemble, puis développement. Un lien de prévisualisation vous permet de suivre l’avancement et de donner votre avis.", cubes: [[0, 0, 0], [1, 0, 0], [0, 1, 0]] },
    { title: "Mise en ligne et prise en main", text: "Nom de domaine, hébergement, référencement de base et suivi des visites. Le code et les comptes sont à votre nom.", cubes: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]] },
  ],
  first: "Première étape :",
  book: "réserver l’appel de 30 minutes",
};

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
