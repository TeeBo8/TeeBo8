// Panneaux du profil, dans l'ordre de l'accueil de teebostudio.fr. Chaque fonction renvoie un SVG complet.
// Mises en page adaptées de chanhdai.com — Copyright (c) 2026 Chánh Đại, licence MIT.

import { blend, createDoc, measure } from "./kit.mjs";
import { AUDIT, CODE, CONTACT, INTRO, PORTFOLIO, PROCESS, STACK, TESTIMONIALS } from "./content.mjs";

const W = 1024;
// Les cartes vont par deux sur une ligne du README (width="50%", collées) : chaque image fait la moitié
// d'un panneau plein (même échelle), dont une marge transparente du côté intérieur pour l'espace entre les deux
const CARD_GAP = 8;
const CARD_W = W / 2 - CARD_GAP;
const cardInset = (index) => (index % 2 === 0 ? { left: 0, right: CARD_GAP } : { left: CARD_GAP, right: 0 });

// ---------- Liens (réseaux, site, e-mail) : une petite case par lien, comme sous le profil du site ----------

export async function renderSocial(theme, social) {
  const doc = createDoc(theme);
  const size = 36;
  return doc.render({
    width: size,
    height: size,
    title: social.label,
    frame: false,
    body: `<rect x="0.5" y="0.5" width="${size - 1}" height="${size - 1}" rx="7" fill="${theme.bg}" stroke="${theme.border}"/>${doc.icon(social.icon, { x: 9, y: 9, size: 18, color: blend(theme.fg, theme.bg, 0.8) })}`,
  });
}

// ---------- Titres de section ----------

export async function renderTitle(theme, { title, aside }) {
  const doc = createDoc(theme);
  const height = 80;
  const right = aside
    ? `${doc.text(aside, { x: W - 48, y: 48, anchor: "end", font: "mono", size: 13, fill: theme.mutedFg })}${doc.icon("arrowUpRight", { x: W - 42, y: 37, size: 14, color: theme.mutedFg })}`
    : "";
  return doc.render({ width: W, height, title, body: `${doc.heading(title, { y: 52 })}${right}` });
}

// Ligne de lien centrée (« Pas sûr de ce qu'il vous faut ? … »)
export async function renderLinkStrip(theme, { text, link }) {
  const doc = createDoc(theme);
  const height = 52;
  const textW = measure(text, { size: 15 });
  const linkW = measure(link, { size: 15, weight: 500 });
  const x = (W - (textW + 6 + linkW + 20)) / 2;
  return doc.render({
    width: W,
    height,
    title: `${text} ${link}`,
    body: `${doc.text(text, { x, y: 31, size: 15, fill: theme.mutedFg })}${doc.text(link, { x: x + textW + 6, y: 31, size: 15, weight: 500, fill: theme.primary })}${doc.icon("arrowUpRight", { x: x + textW + 6 + linkW + 4, y: 19, size: 15, color: theme.primary })}`,
  });
}

// ---------- « Bonjour » et « Côté code » : titre puis liste à puces ----------

async function renderList(theme, { title, bullets, handwritten, label }) {
  const doc = createDoc(theme);
  const headerH = handwritten ? 56 : 80;
  const head = handwritten
    ? doc.text(title, { x: 24, y: 40, font: "hand", weight: 500, size: 30 })
    : doc.heading(title, { y: 52 });
  let y = headerH + 16 + 18;
  const items = bullets.map((segments) => {
    const rich = segments.map((segment) => ({
      text: segment.text,
      fill: segment.strong ? theme.fg : undefined,
      weight: segment.weight,
      underline: segment.link,
    }));
    const paragraph = doc.paragraph(rich, { x: 44, y, width: W - 44 - 24, size: 16, lineHeight: 26, fill: theme.mutedFg });
    const dot = `<circle cx="29" cy="${y - 5}" r="2.5" fill="${theme.mutedFg}" fill-opacity="0.6"/>`;
    y += paragraph.height + 8;
    return dot + paragraph.svg;
  });
  const height = y - 18 - 8 + 18;
  return doc.render({
    width: W,
    height,
    title: label,
    body: `${head}<line x1="0" y1="${headerH + 0.5}" x2="${W}" y2="${headerH + 0.5}" stroke="${theme.line}"/>${items.join("\n")}`,
  });
}

export const renderIntro = (theme) =>
  renderList(theme, { title: INTRO.title, bullets: INTRO.bullets, handwritten: true, label: INTRO.bullets.map((b) => b.map((s) => s.text).join("")).join(" ") });

export const renderCode = (theme) =>
  renderList(theme, {
    title: CODE.title,
    bullets: CODE.bullets.map(([lead, rest]) => [{ text: lead, strong: true, weight: 500 }, { text: rest }]),
    label: `${CODE.title} : ${CODE.bullets.map(([lead, rest]) => lead + rest).join(" ")}`,
  });

// ---------- Cartes (expertises et réalisations) ----------

function cardDecor(doc, decor, width, height) {
  const { theme } = doc;
  if (decor === "mesh") {
    // Fond génératif de la carte « Sites web » (public/expertise-mesh.svg du site), estompé vers le bas à gauche
    return `<defs>
  <filter id="mesh" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.0055" numOctaves="2" seed="11"/>
    <feColorMatrix values="1 1 1 0 -1  1 1 1 0 -1  1 1 1 0 -1  0 0 0 0 1"/>
    <feComponentTransfer>
      <feFuncR type="discrete" tableValues="0.725 0.663 0.851 0.910 0.953 0.851"/>
      <feFuncG type="discrete" tableValues="0.675 0.310 0.467 0.627 0.851 0.467"/>
      <feFuncB type="discrete" tableValues="0.604 0.188 0.341 0.498 0.769 0.341"/>
    </feComponentTransfer>
    <feGaussianBlur stdDeviation="14"/>
  </filter>
  <linearGradient id="fade" x1="0" y1="1" x2="1" y2="0"><stop offset="0.05" stop-color="#fff" stop-opacity="0"/><stop offset="0.75" stop-color="#fff"/></linearGradient>
  <mask id="fade-mask"><rect width="${width}" height="${height}" fill="url(#fade)"/></mask>
</defs>
<g mask="url(#fade-mask)" opacity="0.25"><svg width="${width}" height="${height}" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice"><rect width="800" height="450" filter="url(#mesh)"/></svg></g>`;
  }
  if (decor === "dots") {
    // Trame de points terracotta, qui s'estompe vers le texte en bas à gauche
    return `<defs>
  <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1" fill="${blend(theme.primary, theme.bg, 0.55)}"/></pattern>
  <linearGradient id="fade" x1="0" y1="0.29" x2="1" y2="0.71"><stop offset="0.4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>
  <mask id="fade-mask"><rect width="${width}" height="${height}" fill="url(#fade)"/></mask>
</defs>
<rect width="${width}" height="${height}" fill="url(#dots)" mask="url(#fade-mask)"/>`;
  }
  return "";
}

// Pastille calée à droite : elle est dessinée en x = 0, puis décalée de sa propre largeur
const alignRight = (chip, right) => `<g transform="translate(${(right - chip.width).toFixed(2)} 0)">${chip.svg}</g>`;

function chipsRow(doc, labels, { x, y, maxX, highlight }) {
  let cursor = x;
  const out = [];
  for (const label of labels) {
    const strong = label === highlight;
    const chip = doc.chip(label, {
      x: cursor,
      y,
      fill: strong ? doc.theme.primary : doc.theme.chip,
      color: strong ? doc.theme.primaryFg : doc.theme.fg,
    });
    if (cursor + chip.width > maxX) throw new Error(`Étiquettes trop larges : ${labels.join(", ")}`);
    out.push(chip.svg);
    cursor += chip.width + 6;
  }
  return out.join("");
}

export async function renderExpertise(theme, expertise, index) {
  const doc = createDoc(theme);
  const height = 330;
  const iconSize = 36;
  const titleY = expertise.note ? height - 88 : height - 62;
  const metaY = titleY + 30;
  const titleW = measure(expertise.name, { size: 34, weight: 500, spacing: -0.85 });
  const note = expertise.note
    ? `${doc.icon("claude", { x: 32, y: metaY + 13, size: 13, color: "#D97757" })}${doc.text(expertise.note, { x: 51, y: metaY + 24, font: "mono", size: 13, fill: theme.fg })}${alignRight(doc.chip(expertise.badge, { x: 0, y: metaY + 9, fill: theme.primary, color: theme.primaryFg }), CARD_W - 32)}`
    : "";
  return doc.render({
    width: CARD_W,
    height,
    inset: cardInset(index),
    title: `${expertise.name} : ${expertise.tags.join(", ")}. ${expertise.price}, ${expertise.delay}.`,
    body: `${cardDecor(doc, expertise.decor, CARD_W, height)}
${chipsRow(doc, expertise.tags, { x: 32, y: 32, maxX: CARD_W - 32 - iconSize - 12 })}
<rect x="${CARD_W - 32 - iconSize + 0.5}" y="28.5" width="${iconSize - 1}" height="${iconSize - 1}" rx="8" fill="${theme.bg}" stroke="${theme.border}"/>${doc.icon(expertise.icon, { x: CARD_W - 32 - iconSize + 9, y: 37, size: 18, color: theme.fg, strokeWidth: 1.75 })}
${doc.text(expertise.name, { x: 32, y: titleY, size: 34, weight: 500, spacing: -0.85 })}${doc.icon("arrowUpRight", { x: 32 + titleW + 8, y: titleY - 18, size: 18, color: theme.fg })}
${doc.paragraph([{ text: expertise.price, weight: 500, fill: theme.fg }, { text: ` · ${expertise.delay}`, fill: theme.mutedFg }], { x: 32, y: metaY, width: 400, font: "mono", size: 13 }).svg}
${note}`,
  });
}

export async function renderProject(theme, project, index) {
  const doc = createDoc(theme);
  const height = 260;
  const iconSize = 36;
  const tags = [...project.kind.split(" · "), ...(project.open ? ["Code ouvert"] : [])];
  const text = doc.paragraph(project.text, { x: 32, y: 0, width: CARD_W - 64, size: 15, lineHeight: 23, fill: theme.mutedFg, maxLines: 2 });
  const stackY = height - 30;
  const textY = stackY - 32 - (text.lines - 1) * 23;
  const titleY = textY - 34;
  const titleW = measure(project.name, { size: 28, weight: 500, spacing: -0.7 });
  return doc.render({
    width: CARD_W,
    height,
    inset: cardInset(index),
    title: `${project.name} (${tags.join(", ")}) : ${project.text} ${project.stack}`,
    body: `${chipsRow(doc, tags, { x: 32, y: 32, maxX: CARD_W - 32 - iconSize - 12, highlight: "Code ouvert" })}
<rect x="${CARD_W - 32 - iconSize + 0.5}" y="28.5" width="${iconSize - 1}" height="${iconSize - 1}" rx="8" fill="${theme.bg}" stroke="${theme.border}"/>${doc.icon(project.open ? "github" : project.icon, { x: CARD_W - 32 - iconSize + 9, y: 37, size: 18, color: theme.fg, strokeWidth: 1.75 })}
${doc.text(project.name, { x: 32, y: titleY, size: 28, weight: 500, spacing: -0.7 })}${doc.icon("arrowUpRight", { x: 32 + titleW + 6, y: titleY - 16, size: 16, color: theme.fg })}
${doc.paragraph(project.text, { x: 32, y: textY, width: CARD_W - 64, size: 15, lineHeight: 23, fill: theme.mutedFg }).svg}
${doc.text(project.stack, { x: 32, y: stackY, font: "mono", size: 12, fill: theme.mutedFg })}`,
  });
}

// ---------- Témoignages : trois cartes sur une ligne ----------

// Nom et rôle à droite de l'icône ; un rôle trop long passe sur deux lignes, le bloc reste centré sur l'icône
function footer(doc, testimonial, x, iconY, width) {
  const role = doc.paragraph(testimonial.role, { x, y: 0, width, size: 12, lineHeight: 15, maxLines: 2 });
  const top = iconY + 18 - (18 + role.height) / 2;
  return `${doc.text(testimonial.name, { x, y: top + 13, size: 14, weight: 500 })}
${doc.paragraph(testimonial.role, { x, y: top + 18 + 12, width, size: 12, lineHeight: 15, fill: doc.theme.mutedFg }).svg}`;
}

export async function renderTestimonials(theme, icons) {
  const doc = createDoc(theme);
  const headerH = 80;
  const gap = 8;
  const cardW = (W - gap * 4) / 3;
  const quotes = TESTIMONIALS.map((t) => doc.paragraph(t.content, { x: 0, y: 0, width: cardW - 40, size: 15, lineHeight: 24 }));
  const cardH = 20 + 18 + Math.max(...quotes.map((q) => q.height)) + 24 + 36 + 20;
  const height = headerH + gap + cardH + gap;
  const cards = TESTIMONIALS.map((t, i) => {
    const x = gap + i * (cardW + gap);
    const y = headerH + gap;
    const footY = y + cardH - 20 - 36;
    return `<rect x="${x + 0.5}" y="${y + 0.5}" width="${cardW - 1}" height="${cardH - 1}" rx="12" fill="none" stroke="${theme.border}"/>
${doc.paragraph(t.content, { x: x + 20, y: y + 20 + 16, width: cardW - 40, size: 15, lineHeight: 24 }).svg}
<clipPath id="icon-${i}"><rect x="${x + 20}" y="${footY}" width="36" height="36" rx="8"/></clipPath>
<image href="data:image/png;base64,${icons[t.icon]}" x="${x + 20}" y="${footY}" width="36" height="36" clip-path="url(#icon-${i})"/>
${footer(doc, t, x + 68, footY, cardW - 68 - 20)}`;
  });
  return doc.render({
    width: W,
    height,
    title: `Témoignages. ${TESTIMONIALS.map((t) => `« ${t.content} » ${t.name}, ${t.role}.`).join(" ")}`,
    body: `${doc.heading("Témoignages", { y: 52 })}<line x1="0" y1="${headerH + 0.5}" x2="${W}" y2="${headerH + 0.5}" stroke="${theme.line}"/>${cards.join("\n")}`,
  });
}

// ---------- Méthode : quatre étapes, un cube de plus à chaque fois ----------

const CUBE = 18;
const cubePoint = (x, y, z) => `${(x - y) * CUBE},${((x + y) * CUBE) / 2 - z * CUBE}`;

function cubeFigure(theme, cubes, x, y, size) {
  const sorted = [...cubes].sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  const faces = sorted.map(([cx, cy, cz], index) => {
    const top = [cubePoint(cx, cy, cz + 1), cubePoint(cx + 1, cy, cz + 1), cubePoint(cx + 1, cy + 1, cz + 1), cubePoint(cx, cy + 1, cz + 1)].join(" ");
    const right = [cubePoint(cx + 1, cy, cz + 1), cubePoint(cx + 1, cy + 1, cz + 1), cubePoint(cx + 1, cy + 1, cz), cubePoint(cx + 1, cy, cz)].join(" ");
    const left = [cubePoint(cx, cy + 1, cz + 1), cubePoint(cx + 1, cy + 1, cz + 1), cubePoint(cx + 1, cy + 1, cz), cubePoint(cx, cy + 1, cz)].join(" ");
    const last = index === sorted.length - 1;
    return `<polygon points="${top}"${last ? ` fill="${blend(theme.primary, theme.bg, 0.25)}" stroke="${theme.primary}"` : ""}/><polygon points="${right}"/><polygon points="${left}"/>`;
  });
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="-40 -42 80 84" fill="${theme.bg}" stroke="${theme.mutedFg}" stroke-width="1" stroke-dasharray="1.5 2.5" stroke-linejoin="round">${faces.join("")}</svg>`;
}

export async function renderProcess(theme) {
  const doc = createDoc(theme);
  const headerH = 80;
  const cellW = W / 2;
  const figure = 96;
  const textX = 32 + figure + 24;
  const textW = cellW - textX - 32;
  const texts = PROCESS.steps.map((step) => doc.paragraph(step.text, { x: 0, y: 0, width: textW, size: 14, lineHeight: 22 }));
  const cellH = 32 * 2 + Math.max(figure, 16 + 8 + 24 + 8 + Math.max(...texts.map((t) => t.height)));
  const gridBottom = headerH + cellH * 2;
  const height = gridBottom + 56;
  const cells = PROCESS.steps.map((step, i) => {
    const x = (i % 2) * cellW;
    const y = headerH + Math.floor(i / 2) * cellH;
    const blockH = 16 + 8 + 24 + 8 + texts[i].height;
    const top = y + (cellH - blockH) / 2;
    return `${cubeFigure(theme, step.cubes, x + 32, y + (cellH - figure) / 2, figure)}
${doc.text(String(i + 1).padStart(2, "0"), { x: x + textX, y: top + 12, font: "mono", size: 12, fill: theme.mutedFg, opacity: 0.8 })}
${doc.text(step.title, { x: x + textX, y: top + 16 + 8 + 16, size: 18, weight: 500, spacing: -0.45 })}
${doc.paragraph(step.text, { x: x + textX, y: top + 16 + 8 + 24 + 8 + 14, width: textW, size: 14, lineHeight: 22, fill: theme.mutedFg }).svg}`;
  });
  const firstW = measure(PROCESS.first, { size: 14 });
  const bookW = measure(PROCESS.book, { size: 14, weight: 500 });
  const ctaX = (W - firstW - 5 - bookW) / 2;
  return doc.render({
    width: W,
    height,
    title: `${PROCESS.title}. ${PROCESS.steps.map((s, i) => `${i + 1}. ${s.title} : ${s.text}`).join(" ")} ${PROCESS.first} ${PROCESS.book}.`,
    body: `${doc.heading(PROCESS.title, { y: 52 })}
<g stroke="${theme.line}">
  <line x1="0" y1="${headerH + 0.5}" x2="${W}" y2="${headerH + 0.5}"/>
  <line x1="0" y1="${headerH + cellH + 0.5}" x2="${W}" y2="${headerH + cellH + 0.5}" stroke-dasharray="4 4"/>
  <line x1="${cellW + 0.5}" y1="${headerH}" x2="${cellW + 0.5}" y2="${gridBottom}" stroke-dasharray="4 4"/>
  <line x1="0" y1="${gridBottom + 0.5}" x2="${W}" y2="${gridBottom + 0.5}"/>
</g>
${cells.join("\n")}
${doc.text(PROCESS.first, { x: ctaX, y: gridBottom + 33, size: 14, fill: theme.mutedFg })}${doc.text(PROCESS.book, { x: ctaX + firstW + 5, y: gridBottom + 33, size: 14, weight: 500, fill: theme.primary })}`,
  });
}

// ---------- Stack : les outils en lignes numérotées, par catégorie ----------

export async function renderStack(theme) {
  const doc = createDoc(theme);
  const headerH = 80;
  const toolsX = 300;
  const rowGap = 14;
  let y = headerH;
  const rows = STACK.map((group, index) => {
    // Outils en flux : retour à la ligne quand la rangée est pleine
    const placed = [];
    let cx = toolsX;
    let line = 0;
    for (const [name, icon, colors] of group.tools) {
      const w = 18 + 8 + measure(name, { size: 15 });
      if (cx + w > W - 24) {
        cx = toolsX;
        line += 1;
      }
      placed.push({ name, icon, color: colors ? colors[theme.name === "light" ? 0 : 1] : theme.fg, x: cx, line });
      cx += w + 28;
    }
    const rowH = 20 * 2 + (line + 1) * 22 + line * rowGap;
    const top = y;
    y += rowH;
    return `${index ? `<line x1="0" y1="${top + 0.5}" x2="${W}" y2="${top + 0.5}" stroke="${theme.line}" stroke-dasharray="4 4"/>` : ""}
${doc.text(String(index + 1).padStart(2, "0"), { x: 24, y: top + 20 + 16, font: "mono", size: 12, fill: theme.mutedFg, opacity: 0.8 })}
${doc.text(group.category.toUpperCase(), { x: 64, y: top + 20 + 16, font: "mono", weight: 500, size: 11, spacing: 0.55, fill: theme.mutedFg })}
${placed.map((tool) => `${doc.icon(tool.icon, { x: tool.x, y: top + 20 + tool.line * (22 + rowGap) + 2, size: 18, color: tool.color, strokeWidth: 2 })}${doc.text(tool.name, { x: tool.x + 26, y: top + 20 + tool.line * (22 + rowGap) + 16, size: 15 })}`).join("")}`;
  });
  const count = STACK.reduce((sum, group) => sum + group.tools.length, 0);
  return doc.render({
    width: W,
    height: y,
    title: `Stack : ${STACK.map((g) => `${g.category} (${g.tools.map((t) => t[0]).join(", ")})`).join(" ; ")}`,
    body: `${doc.heading("Stack", { y: 52 })}${doc.text(`${count} outils`, { x: W - 24, y: 50, anchor: "end", font: "mono", size: 13, fill: theme.mutedFg })}<line x1="0" y1="${headerH + 0.5}" x2="${W}" y2="${headerH + 0.5}" stroke="${theme.line}"/>${rows.join("\n")}`,
  });
}

// ---------- Contact ----------

export async function renderContact(theme) {
  const doc = createDoc(theme);
  const height = 200;
  const button = doc.chip(CONTACT.button, { x: 24, y: 128, fill: theme.primary, color: theme.primaryFg, size: 12, height: 36, padding: 16, radius: 8 });
  return doc.render({
    width: W,
    height,
    title: `${CONTACT.title} ${CONTACT.text} ${CONTACT.button} : ${CONTACT.email}`,
    body: `${doc.heading(CONTACT.title, { y: 60 })}
${doc.text(CONTACT.text, { x: 24, y: 98, size: 16, fill: theme.mutedFg })}
${button.svg}
${doc.icon("mail", { x: 24 + button.width + 24, y: 139, size: 14, color: theme.mutedFg })}${doc.text(CONTACT.email, { x: 24 + button.width + 46, y: 151, font: "mono", size: 14 })}`,
  });
}

export { AUDIT, PORTFOLIO };
