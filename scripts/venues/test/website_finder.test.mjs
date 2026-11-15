import test from "node:test";
import assert from "node:assert/strict";
import { cleanWebsite, findWebsite, indexPlaces, nameScore } from "../lib/website_finder.mjs";

const places = [
  { id: "a", name: "Corner Wine and Spirits", website: "https://cornerwine.com", lat: 40.0, lng: -105.0, zip: "80301" },
  { id: "b", name: "Other Shop", website: "https://other.com", lat: 40.0001, lng: -105.0001, zip: "80301" },
  { id: "c", name: "Far Wine and Spirits", website: "https://far.com", lat: 40.05, lng: -105.0, zip: "80302" },
];
const idx = indexPlaces(places);

test("matches by name and distance", () => {
  const m = findWebsite({ name: "Corner Wine & Spirits LLC", lat: 40.00005, lng: -105.00002, zip: "80301" }, idx);
  assert.equal(m.place_id, "a");
  assert.equal(m.how, "name_and_distance");
});
test("a nearby place with a different name is not a match", () => {
  assert.equal(findWebsite({ name: "Totally Different Cellar", lat: 40.0, lng: -105.0, zip: "80301" }, idx), null);
});
test("falls back to zip and exact name when there are no coordinates", () => {
  const m = findWebsite({ name: "Corner Wine and Spirits", lat: null, lng: null, zip: "80301" }, idx);
  assert.equal(m.how, "name_and_zip");
  assert.equal(findWebsite({ name: "Corner Wine", lat: null, lng: null, zip: "80301" }, idx), null);
});
test("social and marketplace links are not websites", () => {
  assert.equal(cleanWebsite("https://www.facebook.com/shop"), null);
  assert.equal(cleanWebsite("https://doordash.com/store/x"), null);
  assert.equal(cleanWebsite("shop.example.com/path?x=1"), "https://shop.example.com");
  assert.ok(nameScore("The Wine Cellar", "Wine Cellar Inc") >= 0.5);
});
