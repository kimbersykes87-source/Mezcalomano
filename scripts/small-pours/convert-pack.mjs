#!/usr/bin/env node
/**
 * Convert a signed off Small Pours pack (markdown + heroes) into PostEntry TypeScript files.
 *
 * Usage: node scripts/small-pours/convert-pack.mjs <packDir> [--write]
 *
 * Without --write it reports what it would do and changes nothing.
 * Re-runnable: it regenerates each article file from the markdown, so a copy fix is a
 * markdown edit plus another run, not a hand edit of TypeScript.
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const packDir = process.argv[2];
const WRITE = process.argv.includes("--write");
if (!packDir) {
  console.error("usage: convert-pack.mjs <packDir> [--write]");
  process.exit(1);
}

const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const LIB = path.join(REPO, "src/lib/small-pours");
const PUBLIC_IMG = path.join(REPO, "public/small-pours");
const HERO_WEBP_QUALITY = 82; // matches scripts/build-hero-webp.mjs
const CHECKED = "2026-11-08"; // the pack's sign off date

/** Categories. The 8 that already existed keep theirs; the 6 new ones reuse existing labels. */
const CATEGORY = {
  "gifts-for-tequila-lovers": "Gifts",
  "artesanal-vs-ancestral-mezcal": "Basics",
  "bats-and-agave": "Culture",
  "how-long-does-agave-take-to-grow": "Agave",
  "is-mezcal-smoky": "Flavor",
  "karwinskii-family-explained": "Agave",
  "mezcal-cocktails-that-taste-of-agave": "Drinks",
  "who-makes-mezcal": "Culture",
  // new in batch 1, proposed from the existing vocabulary, for Siona to confirm
  "what-is-mezcal": "Basics",
  "types-of-agave": "Agave",
  "what-does-mezcal-taste-like": "Flavor",
  "joven-reposado-anejo-mezcal": "Basics",
  "raicilla-bacanora-sotol": "Basics",
  "can-mezcal-be-made-outside-mexico": "Rules",
};

/**
 * Trims to signed off copy, kept here so they are explicit, survive a re-run and can be
 * listed for Siona. Each one only shortens a field that broke the length guidance in
 * types.ts; the wording and the search phrase are otherwise unchanged.
 * AWAITING SIONA'S SIGN OFF (2026-11-08).
 */
const OVERRIDES = {
  "gifts-for-tequila-lovers": {
    title: "Gifts for Tequila and Mezcal Lovers, Not Another Bottle", // was 62 chars, guide is 60
  },
  "what-does-mezcal-taste-like": {
    description:
      "What does mezcal taste like? Cooked agave first, then fruit, herbs, smoke, minerals or funk. What shapes the flavor, and how to find one you like.", // was 165, guide is 155
  },
  "what-is-mezcal": {
    // The stills are clay, clad in brick. "clay stills" alone reads as wrong to anyone
    // looking at the photo, on a page whose own table turns on clay pots vs copper.
    alt: "A man tending the brick-clad clay stills at a palenque, with green hills behind.",
  },
  "can-mezcal-be-made-outside-mexico": {
    description:
      "Can mezcal be made outside Mexico? No. Which states are in mezcal's denomination of origin, what other agave spirits are called, and the Jalisco case.", // was 158, guide is 155
  },
};

/**
 * Slugs whose hero has been replaced from a better original than the pack shipped.
 * The pack image is left alone for these, so a re-run does not undo the upgrade.
 * Pass --force-images to overwrite anyway.
 */
/** Kimber's sign off, slug to go-live date. Re-runs keep these published. */
const APPROVED = { "types-of-agave": "2026-11-09", "what-is-mezcal": "2026-11-09", "what-does-mezcal-taste-like": "2026-11-09", "is-mezcal-smoky": "2026-11-09", "artesanal-vs-ancestral-mezcal": "2026-11-09", "joven-reposado-anejo-mezcal": "2026-11-09", "karwinskii-family-explained": "2026-11-09", "how-long-does-agave-take-to-grow": "2026-11-09", "who-makes-mezcal": "2026-11-09", "bats-and-agave": "2026-11-09", "can-mezcal-be-made-outside-mexico": "2026-11-09" };

const HERO_UPGRADED = new Set([
  "raicilla-bacanora-sotol", // 2400x1000 from Adobe Stock 366732977 "Sotol in the Chihuahuan Desert" (free licence, 6240x4160), crop y 1530 to 4130, 2026-11-09
  "can-mezcal-be-made-outside-mexico", // 2400x1000 from MZM_20240626_S06_roadside_oaxaca-sign_01.heic (4284x5712 portrait), cropped to the sign: x 936 to 4284, y 1485, 3348x1395, 2026-11-09
  "who-makes-mezcal", // 2400x1000 from MZM_20240626_S05_palenque_bottle_02.heic (3024x4032 portrait, full width, crop top 780; bottle label removed in Photoshop by Kimber, edited file saved over the same JPG), 2026-11-09
  "how-long-does-agave-take-to-grow", // 2400x1000 from Unsplash (Stephan de Maranthi) full size 5000x3330, full width, crop top 880, 2026-11-09
  "karwinskii-family-explained", // 2000x1500 from IMG20261109121540 (phone photo, rotated, white balanced, then cleaned to all leather in Photoshop, cropped to the 12:5 banner shape the cards and hero display at, 2400x1000; rotated 0.9 degrees clockwise so the card row is level), 2026-11-09
  "joven-reposado-anejo-mezcal", // 2000x1500 from MZM_20240718_S14_palenque_barrels_01, centered crop, 2026-11-09
  "artesanal-vs-ancestral-mezcal", // 2000x1500 from MZM_20240718_S14_palenque_roasting-pit_01, crop left 1024, 2026-11-09
  "what-does-mezcal-taste-like", // 2400x1800 from Unsplash (Nahima Aparicio) full size, crop top 900, 2026-11-09
  "what-is-mezcal", // 2400x1800 from MZM_20240718_S14_palenque_horno_01, 2026-11-09
]);

function parseFrontMatter(raw) {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!m) throw new Error("no front matter");
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const k = line.match(/^([a-z_]+):\s*(.*)$/);
    if (!k) continue;
    let v = k[2].trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    fm[k[1]] = v;
  }
  return { fm, body: raw.slice(m[0].length) };
}

/** Markdown body (no front matter, no FAQ) into PostBlock objects. */
function parseBlocks(md) {
  const lines = md.split(/\r?\n/);
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (line.startsWith("## ")) { blocks.push({ type: "h2", text: line.slice(3).trim() }); i++; continue; }
    if (line.startsWith("### ")) { blocks.push({ type: "h3", text: line.slice(4).trim() }); i++; continue; }

    if (line.trimStart().startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].trimStart().startsWith("|")) {
        rows.push(lines[i].trim()); i++;
      }
      const cells = (r) => r.replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const head = cells(rows[0]);
      const body = rows.slice(1).filter((r) => !/^\|[\s:|-]+\|$/.test(r)).map(cells);
      blocks.push({ type: "table", head, rows: body });
      continue;
    }

    if (/^[-*]\s/.test(line.trim())) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, "")); i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !lines[i].startsWith("#") &&
           !lines[i].trimStart().startsWith("|") && !/^[-*]\s/.test(lines[i].trim())) {
      para.push(lines[i].trim()); i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

function parseFaq(md) {
  const out = [];
  const parts = md.split(/^### /m).slice(1);
  for (const p of parts) {
    const [q, ...rest] = p.split(/\r?\n/);
    const a = rest.join("\n").trim().split(/\r?\n\s*\r?\n/)[0].replace(/\s*\r?\n\s*/g, " ").trim();
    if (q.trim() && a) out.push({ q: q.trim(), a });
  }
  return out;
}

const camel = (slug) => slug.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
/** JSON with unquoted keys where they are safe identifiers, to match the hand written files. */
const ts = (v) =>
  JSON.stringify(v, null, 2)
    .replace(/^(\s*)"([A-Za-z_$][A-Za-z0-9_$]*)":/gm, "$1$2:")
    .replace(/\n/g, "\n  ");

// ---- run ----
const postsDir = path.join(packDir, "posts");
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md")).sort();

const slugs = files.map((f) => parseFrontMatter(fs.readFileSync(path.join(postsDir, f), "utf8")).fm.slug);
const inBatch = new Set(slugs);
const strippedLinks = [];
const overridden = [];
const report = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
  const { fm, body } = parseFrontMatter(raw);
  const slug = fm.slug;

  const answerMatch = body.match(/\*\*Answer \(shown first\):\*\*\s*([\s\S]*?)(?=\r?\n\r?\n)/);
  if (!answerMatch) throw new Error(`${file}: no answer block`);
  let answer = answerMatch[1].replace(/\s*\r?\n\s*/g, " ").trim();

  const afterAnswer = body.slice(answerMatch.index + answerMatch[0].length);
  const faqIdx = afterAnswer.search(/^## FAQ\s*$/m);
  const bodyMd = faqIdx === -1 ? afterAnswer : afterAnswer.slice(0, faqIdx);
  const faqMd = faqIdx === -1 ? "" : afterAnswer.slice(faqIdx);

  let blocks = parseBlocks(bodyMd);
  const faq = parseFaq(faqMd);

  // /diaries/ -> /small-pours/ , and drop links to posts not in this batch (keep the words)
  const fix = (s) => {
    let out = s.replace(/\/diaries\//g, "/small-pours/");
    out = out.replace(/\[([^\]]+)\]\(\/small-pours\/([a-z0-9-]+)([^)]*)\)/g, (m0, label, target) => {
      if (inBatch.has(target)) return m0;
      strippedLinks.push({ post: slug, target, label });
      return label;
    });
    return out;
  };
  const walk = (b) => {
    if (b.type === "p" || b.type === "h2" || b.type === "h3") return { ...b, text: fix(b.text) };
    if (b.type === "list") return { ...b, items: b.items.map(fix) };
    return { ...b, head: b.head.map(fix), rows: b.rows.map((r) => r.map(fix)) };
  };
  blocks = blocks.map(walk);
  answer = fix(answer);
  const faqFixed = faq.map((f) => ({ q: fix(f.q), a: fix(f.a) }));

  const keepHero = HERO_UPGRADED.has(slug) && !process.argv.includes("--force-images");
  const imgName = `${slug}-hero.webp`;
  const srcImg = path.join(packDir, fm.hero_image);
  const destImg = path.join(PUBLIC_IMG, imgName);
  const heroInPlace = keepHero && fs.existsSync(destImg);

  // Heroes ship as WebP: same quality as the site's other heroes at about a third less
  // weight. An upgraded hero is left alone, and its real dimensions go in the entry.
  if (WRITE && !heroInPlace) {
    fs.mkdirSync(PUBLIC_IMG, { recursive: true });
    await sharp(srcImg).webp({ quality: HERO_WEBP_QUALITY, effort: 6 }).toFile(destImg);
  }
  const { width, height } = await sharp(heroInPlace || WRITE ? destImg : srcImg).metadata();

  const category = CATEGORY[slug];
  if (!category) throw new Error(`${file}: no category mapped for ${slug}`);

  const over = OVERRIDES[slug] ?? {};
  if (over.title || over.description || over.alt) {
    overridden.push({ slug, fields: Object.keys(over).join(", ") });
  }

  const entry = {
    slug,
    title: over.title ?? fm.title,
    description: over.description ?? fm.description,
    category,
    answer,
    ...(APPROVED[slug] ? { status: "published", published: APPROVED[slug] } : { status: "review" }),
    updated: CHECKED,
    image: { src: `/small-pours/${imgName}`, alt: over.alt ?? fm.hero_alt, width, height },
    body: blocks,
    faq: faqFixed,
  };

  const varName = camel(slug);
  const out =
    `import type { PostEntry } from "./types";\n\n` +
    `/** Generated from the signed off pack by scripts/small-pours/convert-pack.mjs. Edit the markdown, not this file. */\n` +
    `export const ${varName}: PostEntry = ${ts(entry)};\n`;

  if (WRITE) {
    fs.writeFileSync(path.join(LIB, `${slug}.ts`), out.replace(/\n/g, "\r\n"), "utf8");
  }
  report.push({ slug, varName, blocks: blocks.length, faq: faqFixed.length, image: `${width}x${height}` });
}

console.table(report);
if (strippedLinks.length) {
  console.log("\nLinks removed (words kept), target not in this batch:");
  for (const s of strippedLinks) console.log(`  ${s.post}  ->  /${s.target}   "${s.label}"`);
}
if (overridden.length) {
  console.log("\nTrimmed to fit the length guidance, awaiting Siona's sign off:");
  for (const o of overridden) console.log(`  ${o.slug}  (${o.fields})`);
}
// A standing list of what has to be relinked once batch 2 publishes. Regenerated on every
// run, so it cannot drift from the posts themselves.
if (WRITE) {
  const byTarget = new Map();
  for (const s of strippedLinks) {
    if (!byTarget.has(s.target)) byTarget.set(s.target, []);
    byTarget.get(s.target).push(s);
  }
  const posts = new Set(strippedLinks.map((s) => s.post)).size;
  const lines = [
    "# Small Pours: links to restore when batch 2 goes live",
    "",
    "Generated by scripts/small-pours/convert-pack.mjs. Do not edit by hand.",
    "",
    "These links were removed because their target was not published yet. The brief said to",
    "keep the words and drop the link. When the post in each heading goes live, put the link",
    "back in the pack markdown and re-run the converter.",
    "",
    `${strippedLinks.length} links across ${posts} posts, waiting on ${byTarget.size} unpublished posts.`,
    "",
  ];
  for (const [target, items] of [...byTarget].sort()) {
    lines.push(`## ${target}`, "");
    lines.push("| Linked from | Words left in place |", "| --- | --- |");
    for (const i of items) lines.push(`| ${i.post} | ${i.label} |`);
    lines.push("");
  }
  fs.writeFileSync(path.join(REPO, "docs/SMALL_POURS_RELINK.md"), lines.join("\r\n"), "utf8");
  console.log("\nWrote docs/SMALL_POURS_RELINK.md");
}
console.log(`\n${WRITE ? "WROTE" : "DRY RUN"}: ${report.length} posts`);
