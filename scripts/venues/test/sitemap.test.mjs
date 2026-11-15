import test from "node:test";
import assert from "node:assert/strict";
import { table } from "./helpers.mjs";
import { analyzeSlugs, parseSitemap, slugTitle } from "../lib/sitemap.mjs";

test("parses sitemap and sitemap index", () => {
  assert.equal(parseSitemap("<sitemapindex><sitemap><loc>https://a.com/p.xml</loc></sitemap></sitemapindex>").isIndex, true);
  assert.deepEqual(parseSitemap("<urlset><url><loc>https://a.com/x?a=1&amp;b=2</loc></url></urlset>").locs, ["https://a.com/x?a=1&b=2"]);
});
test("slug becomes a title", () => {
  assert.equal(slugTitle("https://a.com/products/del-maguey-tobala-mezcal.html"), "del maguey tobala mezcal");
});
test("two species in mezcal product slugs qualify the site's list", () => {
  const urls = ["https://a.com/products/del-maguey-tobala-mezcal", "https://a.com/products/mezcal-tepextate-750ml", "https://a.com/products/vodka-classic"];
  const { result, mezcal_urls } = analyzeSlugs(urls, table);
  assert.equal(mezcal_urls, 2);
  assert.ok(result.distinctNonEspadin.length >= 2);
});
