import test from "node:test";
import assert from "node:assert/strict";
import { table, fixture } from "./helpers.mjs";
import { analyzeMenu, badgeFor, countDistinct, editDistance, FAILURE_REASONS } from "../lib/extract.mjs";
import { capLine } from "../lib/text.mjs";

const slugs = (r) => r.distinctNonEspadin.slice().sort();

test("species named on an HTML menu are counted with their lines and headings", () => {
  const r = analyzeMenu({ html: fixture("species_named.html"), format: "html" }, table);
  assert.equal(r.status, "ok");
  assert.deepEqual(slugs(r), ["arroqueno", "jabali", "tepextate", "tobala"]);
  const tobala = r.claims.find((c) => c.species_slug === "tobala" && c.counts);
  assert.match(tobala.line_text, /Candelaria/);
  assert.equal(tobala.heading, "Mezcal");
  assert.equal(r.failureReason, null);
  assert.equal(badgeFor(r.distinctNonEspadin.length), "Species listed");
});

test("cocktail mentions on the same page are weak and never counted", () => {
  const r = analyzeMenu({ html: fixture("species_named.html"), format: "html" }, table);
  const cocktail = r.claims.filter((c) => c.reasons.includes("cocktail_mention"));
  assert.ok(cocktail.length >= 1);
  assert.ok(cocktail.every((c) => c.confidence === "weak" && c.counts === false));
});

test("espadin only list: recorded, excluded from the non espadin count", () => {
  const r = analyzeMenu({ text: fixture("espadin_only.txt") }, table);
  assert.equal(r.distinctNonEspadin.length, 0);
  assert.ok(r.espadin.length >= 4);
  assert.equal(r.failureReason, "no_species");
  assert.equal(badgeFor(0), null);
});

test("cocktail only mentions never count and end as no_species", () => {
  const r = analyzeMenu({ text: fixture("cocktail_only.txt") }, table);
  assert.equal(r.distinctNonEspadin.length, 0);
  assert.ok(r.claims.length >= 3);
  assert.ok(r.claims.every((c) => c.counts === false));
  assert.equal(r.failureReason, "no_species");
});

test("marketing prose is weak even under a mezcal heading", () => {
  const r = analyzeMenu({ text: "# Mezcal\nOur bar team travels to Oaxaca every year to find coyote and arroqueño for our guests, and we love sharing the story of every palenque we visit." }, table);
  assert.ok(r.claims.length >= 1);
  assert.ok(r.claims.every((c) => !c.counts));
});

test("ambiguous cuishe group lines count once, as a group", () => {
  const r = analyzeMenu({ text: fixture("cuishe_group.txt") }, table);
  assert.deepEqual(slugs(r), ["cuishe_group"]);
  assert.ok(r.claims.every((c) => c.species_slug === null && c.species_group === "cuishe_group"));
  assert.equal(r.claims[0].species_name, "Cuishe group");
  assert.equal(badgeFor(r.distinctNonEspadin.length), null); // one group is not two species
});

test("PDF text layer with column spacing is read as a bottle list", () => {
  const r = analyzeMenu({ text: fixture("menu_pdf.txt"), format: "pdf" }, table);
  assert.equal(r.status, "ok");
  assert.deepEqual(slugs(r), ["coyote", "cuishe_group", "sierra_negra", "tepextate", "tobala"]);
  assert.equal(badgeFor(r.distinctNonEspadin.length), "Deep list");
  assert.equal(r.espadin.length, 1);
});

test("PDF without a text layer returns image_only", () => {
  const r = analyzeMenu({ text: "  \n ", format: "pdf" }, table);
  assert.equal(r.status, "image_only");
  assert.equal(r.failureReason, "image_only");
});

test("image only HTML menu returns image_only", () => {
  const r = analyzeMenu({ html: fixture("image_only.html") }, table);
  assert.equal(r.status, "image_only");
  assert.equal(r.claims.length, 0);
});

test("bot blocked page returns blocked", () => {
  const r = analyzeMenu({ html: fixture("blocked.html"), httpStatus: 200 }, table);
  assert.equal(r.status, "blocked");
  assert.equal(r.failureReason, "blocked");
  const r2 = analyzeMenu({ text: "Forbidden", httpStatus: 403 }, table);
  assert.equal(r2.status, "blocked");
});

test("OCR output is a proposal only: low confidence and never counted", () => {
  const r = analyzeMenu({ text: fixture("ocr_menu.txt"), format: "ocr" }, table);
  assert.equal(r.lowConfidence, true);
  assert.ok(r.claims.length >= 2);
  assert.ok(r.claims.every((c) => c.confidence === "low_ocr" && c.counts === false));
  assert.equal(r.distinctNonEspadin.length, 0);
});

test("blends are recorded as blends and count only the species the line names", () => {
  const r = analyzeMenu({ text: "# Mezcal\nAlipús Ensamble: espadín y tobalá, 2 oz, 47% $15" }, table);
  assert.equal(r.espadin.length, 1);
  assert.equal(r.espadin[0].blend, true);
  const t = r.claims.find((c) => c.species_slug === "tobala");
  assert.equal(t.blend, true);
  assert.equal(t.counts, true);
});

test("ordinary words that are also agave names need agave context", () => {
  const r = analyzeMenu({ text: fixture("ambiguous_words.txt") }, table);
  const alto = r.claims.filter((c) => c.species_slug === "alto");
  const wine = alto.find((c) => /Adige/.test(c.line_text));
  assert.ok(!wine || wine.counts === false);
  const verde = r.claims.find((c) => /Vinho/.test(c.line_text));
  assert.ok(!verde || verde.counts === false);
  assert.ok(r.claims.some((c) => c.species_slug === "coyote" && c.counts));
  assert.ok(r.claims.some((c) => c.species_slug === "alto" && c.counts && /Inaequidens/.test(c.line_text)));
});

test("regression: Pinata home page prose with the word alto is not a species claim", () => {
  const r = analyzeMenu({ text: "# Gastronomía mexicana y destilados de agave\nTodo esto acompañado de una coctelería de alto nivel y una auténtica mezcalería." }, table);
  assert.equal(r.distinctNonEspadin.length, 0);
  assert.ok(r.claims.every((c) => !c.counts));
});

test("a bare short species line under a mezcal heading still counts", () => {
  const r = analyzeMenu({ text: "# Mezcal\nTobalá\nTepextate" }, table);
  assert.deepEqual(r.distinctNonEspadin.slice().sort(), ["tepextate", "tobala"]);
});

test("whole word matching: substrings do not match", () => {
  const r = analyzeMenu({ text: "# Mezcal\nTobalado house special 2 oz $12\nMontanas Rocosas flight $20 2 oz" }, table);
  assert.equal(r.claims.length, 0);
});

test("accent folding and plural forms match", () => {
  const r = analyzeMenu({ text: "# Mezcal\nTOBALÁ 2 oz $19\nTepeztates flight 3 x 1 oz $30" }, table);
  assert.deepEqual(slugs(r), ["tepextate", "tobala"]);
});

test("unknown agave looking terms are collected, not matched", () => {
  const r = analyzeMenu({ text: "# Mezcal\nAgave Pelotona 2 oz $12\nTobalaa 2 oz 45% $18" }, table);
  const terms = r.unknownTerms.map((t) => t.term).sort();
  assert.ok(terms.includes("pelotona"));
  assert.ok(terms.includes("tobalaa"));
  assert.equal(r.unknownTerms.find((t) => t.term === "tobalaa").nearest, "tobala");
  assert.equal(r.distinctNonEspadin.length, 0);
});

test("stored lines are capped at 300 characters and keep the heading", () => {
  const long = `Tobalá 2 oz $22 ${"x".repeat(500)}`;
  const r = analyzeMenu({ text: `# Mezcal\n${long}` }, table);
  assert.ok(r.claims[0].line_text.length <= 300);
  assert.equal(r.claims[0].heading, "Mezcal");
  assert.ok(capLine("a".repeat(1000)).length <= 300);
});

test("page with no mezcal at all is no_menu_found", () => {
  const r = analyzeMenu({ text: "Opening hours Monday to Friday.\nContact us for private events." }, table);
  assert.equal(r.status, "no_menu_found");
  assert.equal(r.failureReason, "no_menu_found");
});

test("failure reasons are limited to the fixed list", () => {
  assert.deepEqual(FAILURE_REASONS, ["blocked", "no_menu_found", "image_only", "no_species", "timeout", "parse_error"]);
});

test("badges follow section 4.2", () => {
  assert.equal(badgeFor(1), null);
  assert.equal(badgeFor(2), "Species listed");
  assert.equal(badgeFor(4), "Species listed");
  assert.equal(badgeFor(5), "Deep list");
  assert.equal(countDistinct([{ counts: true, species_slug: "a" }, { counts: true, species_slug: "a" }, { counts: false, species_slug: "b" }]).length, 1);
});

test("edit distance helper", () => {
  assert.equal(editDistance("tobala", "tobalaa"), 1);
  assert.equal(editDistance("abc", "xyz", 1), 2);
});
