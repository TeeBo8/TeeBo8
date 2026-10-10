// Panneaux du profil, dans l'ordre de l'accueil de teebostudio.fr. Chaque fonction renvoie un SVG complet.
// Mises en page adaptées de chanhdai.com — Copyright (c) 2026 Chánh Đại, licence MIT.

import { blend, createDoc, measure } from "./kit.mjs";
import { CODE, CONTACT, INTRO, PORTFOLIO, STACK, TESTIMONIALS } from "./content.mjs";

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

// Ligne de lien centrée (« Les études de cas détaillées : … »)
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

// ---------- Cartes des réalisations ----------

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

export { PORTFOLIO };
