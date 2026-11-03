import test from "node:test";
import assert from "node:assert/strict";
import { parseRobots, isAllowed, hasNoindex } from "../lib/robots.mjs";
import { pickMenuLinks, throttle, MIN_INTERVAL_MS } from "../lib/http.mjs";
import { geohash, haversineMeters, pinCheck } from "../lib/geo.mjs";
import { comparePair, isAggregatorDomain, mergeKeyDomain, trigramSimilarity, websiteDomain } from "../lib/resolve.mjs";
import { buildGeoJson, evaluatePublishRule } from "../lib/publish.mjs";
import { parseSeeds, slugifyVenue } from "../lib/seeds.mjs";
import { htmlToText, normalizeVenueName, contentHash } from "../lib/text.mjs";
import { cleanFailures } from "../lib/stage.mjs";
import { overtureSql } from "../discover.mjs";

test("robots.txt: specific agent group beats *, longest rule wins", () => {
  const g = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/menu\n\nUser-agent: MezcalomanoBot\nDisallow: /secret\n");
  assert.equal(isAllowed(g, "/secret/x"), false);
  assert.equal(isAllowed(g, "/private/a"), true); // bot group has no rule for it
  const star = parseRobots("User-agent: *\nDisallow: /private\nAllow: /private/menu");
  assert.equal(isAllowed(star, "/private/a"), false);
  assert.equal(isAllowed(star, "/private/menu"), true);
  assert.equal(isAllowed([], "/anything"), true);
  assert.equal(isAllowed(parseRobots("User-agent: *\nDisallow: /"), "/menu"), false);
});

test("noindex is detected in headers and meta", () => {
  assert.equal(hasNoindex({ "x-robots-tag": "noindex" }, ""), true);
  assert.equal(hasNoindex({}, '<meta name="robots" content="noindex, nofollow">'), true);
  assert.equal(hasNoindex({}, '<meta name="robots" content="index,follow">'), false);
});

test("throttle waits for one second per host", async () => {
  const waits = [];
  let t = 1_000_000;
  const sleep = async (ms) => { waits.push(ms); t += ms; };
  await throttle("example.test", () => t, sleep);
  await throttle("example.test", () => t, sleep);
  assert.equal(waits.length, 1);
  assert.ok(waits[0] <= MIN_INTERVAL_MS && waits[0] > 0);
});

test("menu links: same host or PDF only, capped", () => {
  const html = '<a href="/menu">Menu</a><a href="/about">About</a><a href="https://other.test/carta.pdf">Carta</a><a href="https://other.test/page">x menu</a><a href="/mezcal-list">Mezcal</a>';
  const links = pickMenuLinks(html, "https://bar.test/", 5);
  assert.deepEqual(links, ["https://bar.test/menu", "https://other.test/carta.pdf", "https://bar.test/mezcal-list"]);
  assert.equal(pickMenuLinks(html, "https://bar.test/", 1).length, 1);
});

test("geohash and distance", () => {
  assert.equal(geohash(57.64911, 10.40744, 7), "u4pruyd");
  const d = haversineMeters(41.3851, 2.1734, 41.3852, 2.1735);
  assert.ok(d > 5 && d < 20);
  assert.equal(pinCheck({ lat: 41.3851, lng: 2.1734 }, { lat: 41.3852, lng: 2.1735 }).ok, true);
  assert.equal(pinCheck({ lat: 41.3851, lng: 2.1734 }, { lat: 41.3951, lng: 2.1734 }).ok, false);
});

test("aggregator domains never act as a merge key", () => {
  assert.equal(isAggregatorDomain("instagram.com"), true);
  assert.equal(isAggregatorDomain("shop.linktr.ee"), true);
  assert.equal(mergeKeyDomain("https://www.instagram.com/bar"), null);
  assert.equal(mergeKeyDomain("https://www.pinatacantina.com/"), "pinatacantina.com");
  assert.equal(websiteDomain("pinatacantina.com/menu"), "pinatacantina.com");
});

test("pairs: near and similar goes to review, chains far apart stay separate", () => {
  const a = { name: "Piñata Cantina", lat: 41.3851, lng: 2.1734, website: "https://pinatacantina.com" };
  const b = { name: "Pinata Cantina Bar", lat: 41.38512, lng: 2.17342, website: "https://www.pinatacantina.com" };
  const hit = comparePair(a, b);
  assert.ok(hit);
  assert.match(hit.reason, /near_and_similar_name/);
  const far = { ...b, lat: 41.45, lng: 2.25 };
  assert.equal(comparePair(a, far), null);
  assert.equal(comparePair({ name: "Bar Uno", lat: 1, lng: 1 }, { name: "Cafe Dos", lat: 1.00001, lng: 1.00001 }), null);
  assert.ok(trigramSimilarity("pinata", "pinata") === 1);
  assert.equal(normalizeVenueName("The Piñata Cantina"), "pinata");
});

const venue = (extra = {}) => ({ id: "v1", slug: "bar", name: "Bar", lat: 1, lng: 2, status: "published", pin_verified_at: "2026-10-01", closed_signals: [], ...extra });
const claim = (slug, extra = {}) => ({ state: "approved", kind: "species_listed", species_slug: slug, ...extra });
const snap = (days) => ({ status: "ok", url: "https://bar.test/menu", fetched_at: new Date(Date.now() - days * 86400000).toISOString() });

test("publish rule: all five gates", () => {
  const ok = evaluatePublishRule({ venue: venue(), claims: [claim("tobala"), claim("tepextate")], snapshots: [snap(10)] });
  assert.equal(ok.ok, true);
  assert.equal(ok.badge, "Species listed");
  assert.deepEqual(evaluatePublishRule({ venue: venue(), claims: [claim("tobala")], snapshots: [snap(10)] }).failures, ["fewer_than_2_distinct_species"]);
  assert.ok(evaluatePublishRule({ venue: venue(), claims: [claim("a"), claim("b")], snapshots: [snap(120)] }).failures.includes("no_menu_snapshot_within_90_days"));
  assert.ok(evaluatePublishRule({ venue: venue({ pin_verified_at: null }), claims: [claim("a"), claim("b")], snapshots: [snap(1)] }).failures.includes("pin_not_verified"));
  assert.ok(evaluatePublishRule({ venue: venue(), claims: [claim("a"), claim("b")], snapshots: [snap(1)], openReports: [{ id: 1 }] }).failures.includes("unresolved_closed_signal_or_report"));
  assert.ok(evaluatePublishRule({ venue: venue({ status: "in_review" }), claims: [claim("a"), claim("b")], snapshots: [snap(1)] }).failures.includes("not_approved_by_a_human"));
});

test("publish rule ignores proposed, rejected and expired claims", () => {
  const claims = [claim("a"), claim("b", { state: "proposed" }), claim("c", { state: "rejected" }), claim("d", { expires_at: "2020-01-01" })];
  assert.equal(evaluatePublishRule({ venue: venue(), claims, snapshots: [snap(1)] }).ok, false);
});

test("five distinct species earn the deep list badge; groups count once", () => {
  const claims = ["a", "b", "c", "d", "e"].map((s) => claim(s));
  assert.equal(evaluatePublishRule({ venue: venue(), claims, snapshots: [snap(1)] }).badge, "Deep list");
  const g = [claim(null, { species_group: "cuishe_group" }), claim(null, { species_group: "cuishe_group" })];
  assert.equal(evaluatePublishRule({ venue: venue(), claims: g, snapshots: [snap(1)] }).distinct.length, 1);
});

test("geojson contains only venues that pass the rule and never contacts", () => {
  const good = { venue: venue({ website: "https://bar.test", email: "private@x.test" }), claims: [claim("tobala"), claim("tepextate")], snapshots: [snap(3)], openReports: [] };
  const bad = { venue: venue({ slug: "bad" }), claims: [claim("tobala")], snapshots: [snap(3)] };
  const geo = buildGeoJson([good, bad]);
  assert.equal(geo.features.length, 1);
  assert.equal(geo.features[0].properties.slug, "bar");
  assert.deepEqual(geo.features[0].geometry.coordinates, [2, 1]);
  assert.ok(!JSON.stringify(geo).includes("private@x.test"));
});

test("seeds parser validates rows", () => {
  const { rows, errors } = parseSeeds("name,address,city,country_code,lat,lng,website,list_name,note\nPiñata Cantina,Carrer de Casanova 19,Barcelona,es,41.38,2.16,https://pinatacantina.com,submission,\n,x,,,,,,,\nBad,,,ESP,,,,,\nBad2,,,ES,abc,,,,\n");
  assert.equal(rows.length, 1);
  assert.equal(rows[0].country_code, "ES");
  assert.equal(errors.length, 3);
  assert.equal(slugifyVenue("Piñata Cantina", "Barcelona"), "pinata-cantina-barcelona");
});

test("text helpers", () => {
  const t = htmlToText("<h2>Mezcal</h2><p>Tobal&aacute; &amp; more</p><script>var a=1</script><li>Line two</li>");
  assert.equal(t, "# Mezcal\nTobalá & more\nLine two");
  assert.equal(contentHash("a"), contentHash("a"));
  assert.notEqual(contentHash("a"), contentHash("b"));
});

test("only fixed failure reasons survive into pipeline_runs", () => {
  assert.deepEqual(cleanFailures({ blocked: 2, weird: 5, no_species: 1 }), { blocked: 2, no_species: 1 });
});

test("Overture query records bbox and release and stays inside categories", () => {
  const sql = overtureSql({ release: "2026-10-21.0", bbox: [2.05, 41.32, 2.23, 41.47] });
  assert.match(sql, /release\/2026-10-21\.0\/theme=places/);
  assert.match(sql, /BETWEEN 2\.05 AND 2\.23/);
  assert.match(sql, /'cocktail_bar'/);
});
