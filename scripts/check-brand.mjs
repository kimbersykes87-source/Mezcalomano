// Fails if site.css or the Shopify theme CSS uses a color that is not in docs/brand-tokens.json,
// so a brand color is changed in one list and both stylesheets follow.
import { readFileSync } from "node:fs";

const tokens = JSON.parse(readFileSync("docs/brand-tokens.json", "utf8"));
const allowed = new Set(Object.values(tokens.colors).map((c) => c.toUpperCase()));
allowed.add("#FFF");

let bad = 0;
for (const file of ["src/styles/site.css", "docs/shopify-theme/mezcalomano.css"]) {
  const css = readFileSync(file, "utf8");
  const found = new Set((css.match(/#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b/g) ?? []).map((c) => c.toUpperCase()));
  for (const c of found) {
    if (!allowed.has(c)) {
      console.error(`${file}: ${c} is not in docs/brand-tokens.json`);
      bad++;
    }
  }
}
if (bad) process.exit(1);
console.log("Brand colors OK in both stylesheets.");
