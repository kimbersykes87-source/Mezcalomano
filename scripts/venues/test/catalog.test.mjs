import test from "node:test";
import assert from "node:assert/strict";
import { table } from "./helpers.mjs";
import { analyzeCatalog, normalizeProducts, storeQualifies, isMezcalProduct, detectPlatform } from "../lib/catalog.mjs";

const shop = (titles) => normalizeProducts({ products: titles.map((t) => ({ title: t[0], product_type: t[1] ?? "Mezcal", tags: "", vendor: "", variants: [{ price: "59.00", available: true }] })) }, "shopify");

test("store with two non-espadin species qualifies", () => {
  const r = analyzeCatalog(shop([["Del Maguey Tobalá Mezcal 750ml"], ["Vago Espadín Mezcal"], ["Mezcal Tepextate 750ml"], ["Lime Margarita Salt", "Mixers"]]), table);
  assert.ok(storeQualifies(r), JSON.stringify(r.distinctNonEspadin));
  assert.ok(r.claims.every((c) => c.source_kind === "catalog_product"));
  assert.equal(r.catalog.mezcal_products, 3);
});

test("espadin only store does not qualify", () => {
  const r = analyzeCatalog(shop([["Casa Espadín Mezcal 750ml"], ["Joven Espadín Mezcal 1L"]]), table);
  assert.equal(storeQualifies(r), false);
});

test("tequila and merch are ignored", () => {
  assert.equal(isMezcalProduct({ title: "Tequila Blanco", type: "Tequila", tags: "", vendor: "" }), false);
  assert.equal(isMezcalProduct({ title: "Mezcal Tobalá", type: "", tags: "", vendor: "" }), true);
  const r = analyzeCatalog(shop([["Tequila Reposado", "Tequila"], ["Gift card", "Gift"]]), table);
  assert.equal(r.status, "no_menu_found");
});

test("platform detection", () => {
  assert.equal(detectPlatform('<script src="https://cdn.shopify.com/x.js">'), "shopify");
  assert.equal(detectPlatform("<html>plain</html>"), null);
});

import { fetchCatalog } from "../lib/catalog.mjs";
test("fetchCatalog reads JSON from body when text is absent", async () => {
  const pages = {
    "https://shop.test": { ok: true, text: '<script src="https://cdn.shopify.com/a.js"></script>' },
    "https://shop.test/products.json?limit=250&page=1": { ok: true, body: Buffer.from(JSON.stringify({ products: [{ title: "Mezcal Tobalá", variants: [{ price: "50" }] }] })) },
  };
  const c = await fetchCatalog("https://shop.test", async (u) => pages[u] ?? { ok: false, reason: "parse_error" });
  assert.equal(c.ok, true);
  assert.equal(c.products.length, 1);
});
