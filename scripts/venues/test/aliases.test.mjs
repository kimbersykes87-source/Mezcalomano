import test from "node:test";
import assert from "node:assert/strict";
import { table, csvText } from "./helpers.mjs";
import { buildAliasTable, toSlug } from "../lib/aliases.mjs";
import { foldAccents } from "../lib/text.mjs";

test("alias table covers all 40 deck species", () => {
  assert.equal(table.species.length, 40);
  const ids = new Set([...table.aliases.values()].map((e) => e.id));
  const grouped = new Set(["cuishe", "barril", "madrecuixe", "bicuixe", "tobaziche"]);
  for (const s of table.species) {
    if (grouped.has(s.slug)) continue;
    assert.ok(ids.has(s.slug), `missing species ${s.slug}`);
  }
});

test("slug rule matches src/lib/slug.ts", () => {
  assert.equal(toSlug("Sierra Negra"), "sierra_negra");
  assert.equal(toSlug("Arroqueño"), "arroqueno");
  assert.equal(toSlug("Cincoañero"), "cincoanero");
});

test("accents are folded in aliases", () => {
  assert.equal(foldAccents("Tobalá"), "tobala");
  assert.equal(table.aliases.get("tobala").slug, "tobala");
  assert.equal(table.aliases.get("arroqueno").slug, "arroqueno");
  assert.equal(table.aliases.get("cimarron").slug, "cimarron");
});

test("cuishe, madrecuishe, barril and tobasiche map to one group, not a species", () => {
  for (const a of ["cuishe", "madrecuishe", "madrecuixe", "barril", "tobasiche", "tobaziche", "bicuixe", "cuixe"]) {
    const e = table.aliases.get(a);
    assert.equal(e.type, "group", a);
    assert.equal(e.group, "cuishe_group");
  }
});

test("bare latin names resolve sensibly", () => {
  assert.equal(table.aliases.get("agave angustifolia").slug, "espadin");
  assert.equal(table.aliases.get("agave americana").type, "group");
  assert.equal(table.aliases.get("agave potatorum").slug, "tobala");
});

test("extended names outside the deck exist and are not espadin", () => {
  const e = table.aliases.get("lechuguilla");
  assert.ok(e);
  assert.equal(e.deck, false);
  assert.equal(e.espadin, false);
});

test("angustifolia relatives are flagged for reviewers", () => {
  assert.equal(table.aliases.get("tepemete").angustifoliaVariant, true);
  assert.equal(table.aliases.get("espadin").angustifoliaVariant, undefined);
});

test("empty csv is rejected", () => {
  assert.throws(() => buildAliasTable("common_name,scientific_name\n"));
  assert.ok(csvText.length > 100);
});
