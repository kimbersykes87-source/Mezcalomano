import test from "node:test";
import assert from "node:assert/strict";
import { dedupeLeads, leadsFromJsonLd, leadsFromStockistJson, leadsFromText, locatorLinks, stockistWidgetId } from "../lib/stockists.mjs";

test("finds locator links on the same site only", () => {
  const html = '<a href="/pages/where-to-buy">Where to buy</a><a href="https://other.com/stockists">x</a><a href="/about">About</a>';
  assert.deepEqual(locatorLinks(html, "https://brand.com"), ["https://brand.com/pages/where-to-buy"]);
});
test("reads schema.org places", () => {
  const html = '<script type="application/ld+json">{"@type":"LiquorStore","name":"Corner Wine","address":{"streetAddress":"1 Main St","addressLocality":"Denver","addressRegion":"CO","postalCode":"80202"},"url":"https://cornerwine.com"}</script>';
  const l = leadsFromJsonLd(html);
  assert.equal(l[0].name, "Corner Wine");
  assert.equal(l[0].zip, "80202");
});
test("stockist.co widget id and json", () => {
  assert.equal(stockistWidgetId('<div data-stockist-widget-tag="u1234"></div>'), "u1234");
  const l = leadsFromStockistJson([{ name: "Bar X", address_line_1: "5 Elm", city: "Austin", state: "TX", postal_code: "78701" }]);
  assert.equal(l[0].state, "TX");
});
test("text lists in two shapes, deduped", () => {
  const text = "Corner Wine\n1 Main St\nDenver, CO 80202\n\nTiki Bar - 9 Pier Rd, Oakland, CA 94607\nnot an address line";
  const l = dedupeLeads(leadsFromText(text));
  assert.deepEqual(l.map((x) => x.name), ["Corner Wine", "Tiki Bar"]);
  assert.equal(l[1].zip, "94607");
});

import { leadsFromWpsl, wpslBase, wpslUrls } from "../lib/stockists.mjs";
test("wp store locator", () => {
  assert.equal(wpslBase("var wpslSettings = {}", "https://b.com/locations/"), "https://b.com/wp-admin/admin-ajax.php");
  assert.equal(wpslBase("<html></html>", "https://b.com"), null);
  assert.equal(wpslUrls("https://b.com/wp-admin/admin-ajax.php").length, 4);
  const l = leadsFromWpsl([{ store: "Tiki &amp; Co", address: "1 A St", city: "Austin", state: "TX", zip: "78701", url: "https://tiki.com", email: "hi@tiki.com" }]);
  assert.equal(l[0].name, "Tiki & Co");
  assert.equal(l[0].email, "hi@tiki.com");
});
