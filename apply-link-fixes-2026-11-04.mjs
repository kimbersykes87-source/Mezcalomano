// Removes 8 producer links found dead, sold out, wrong or not shipping to the US
// during the 4 Nov 2026 hand check. Run from the repo root on an up to date main:
//   node apply-link-fixes-2026-11-04.mjs --dry-run   (shows what would change)
//   node apply-link-fixes-2026-11-04.mjs             (writes the file)
// Safe to run twice and safe if the bot changed the file since: it matches by species and exact link.
import fs from "node:fs";

const FILE = "data/Species_Final - Website.csv";
const DRY = process.argv.includes("--dry-run");

const REMOVALS = [
  ["Jabalí", "https://www.magueymelate.com/product/jabali-375-ml-noel/", "will not ship to the US"],
  ["Papalote", "https://www.magueymelate.com/product/cupreata-2007-375ml-isaias/", "wrong species"],
  ["Sierra Negra", "https://www.magueymelate.com/product/sierra-negra-375-ml-everardo/", "sold out"],
  ["Tobaziche", "https://delmaguey.com/tobaziche/", "page gone"],
  ["Arroqueño", "https://mezcalkoch.com/expresiones/arroqueno.php", "page gone"],
  ["Lumbre", "https://mezcalkoch.com/expresiones/lumbre.php", "page gone"],
  ["Mexicano", "https://mezcalkoch.com/expresiones/mexicano.php", "page gone"],
  ["Pulquero", "https://gomadreshop.com/products/puntiagudo-pulquero?_pos=1&_sid=ceaa25d05&_ss=r", "page gone"],
];
// Deliberately NOT removed: Chahuiqui (K&L, sold out) is the only producer and only link for that species.

function parse(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; }
      else f += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\r") { /* handled with \n */ }
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f !== "" || row.length) { row.push(f); rows.push(row); }
  return rows;
}
const field = (v) => (/[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
const serialize = (rows, eol) => rows.map((r) => r.map(field).join(",")).join(eol) + eol;

const raw = fs.readFileSync(FILE, "utf8");
const eol = raw.includes("\r\n") ? "\r\n" : "\n";
const rows = parse(raw);
if (serialize(rows, eol) !== raw) { console.error("Round trip check failed, file not touched."); process.exit(1); }

const head = rows[0], iName = head.indexOf("common_name"), iProd = head.indexOf("producers"), iLink = head.indexOf("producer_links");
if (iName < 0 || iProd < 0 || iLink < 0) { console.error("Columns not found."); process.exit(1); }

let changed = 0;
for (const [species, url, why] of REMOVALS) {
  const row = rows.find((r) => r[iName] === species);
  if (!row) { console.log(`SKIP  ${species}: row not found`); continue; }
  const wrapped = row[iProd].startsWith('"') && row[iProd].endsWith('"');
  const prods = (wrapped ? row[iProd].slice(1, -1) : row[iProd]).split(",");
  const links = row[iLink].split(",");
  if (prods.length !== links.length) { console.error(`STOP  ${species}: producers (${prods.length}) and links (${links.length}) do not pair. Fix by hand.`); process.exit(1); }
  const k = links.findIndex((l) => l.trim() === url);
  if (k < 0) { console.log(`SKIP  ${species}: link already gone  (${url})`); continue; }
  if (links.length === 1) { console.log(`KEEP  ${species}: only link, not removed`); continue; }
  const gone = prods[k];
  prods.splice(k, 1); links.splice(k, 1);
  row[iProd] = wrapped ? '"' + prods.join(",") + '"' : prods.join(",");
  row[iLink] = links.join(",");
  changed++;
  console.log(`CUT   ${species}: ${gone} (${why}); ${links.length} left`);
}
if (!changed) { console.log("Nothing to change."); process.exit(0); }
if (DRY) { console.log(`\nDry run: ${changed} link(s) would be removed. File not written.`); process.exit(0); }
fs.writeFileSync(FILE, serialize(rows, eol));
console.log(`\nWrote ${FILE}: ${changed} link(s) removed.`);
