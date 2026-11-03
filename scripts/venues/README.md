# Venues pipeline (Phase 0 foundations)

Plan: project doc `VENUES_MAP_LAYER_PLAN_2026-11-02.md` (plan v2). Goal: a visitor can find a bar near them that lists mezcal made from species other than espadín. Accuracy beats coverage. Nothing in this folder publishes a venue.

## What is here

| File | Stage | What it does |
|---|---|---|
| `lib/aliases.mjs` | | Builds the alias table from `data/Species_Final - Website.csv` (40 species) plus an extended list of other agave names. Accent folded, ambiguous groups (cuishe, madrecuixe, barril, tobaziche, bicuixe), everyday words that need agave context (alto, verde, coyote...). |
| `lib/extract.mjs` | 5 | `analyzeMenu()`: section 4.3 rules. Returns proposed claims, espadín mentions, unknown terms, capped matched lines (300 characters plus heading) and a status. |
| `discover.mjs` | 1 | Seeds CSV and Overture bounding box queries (DuckDB) into `venues` and `venue_sources`. Records release id and licence. |
| `resolve.mjs` | 2 | Possible duplicates into `merge_review` (normalized name, geohash 7, name similarity). No auto merge. Aggregator domains never act as a key (`lib/resolve.mjs`). |
| `geocode_check.mjs` | 3 | Source point against address geocode, 100 m rule. Nominatim, 1 request per second, `MezcalomanoBot (hola@mezcalomano.com)`. |
| `fetch_menu.mjs` | 4 | At most 6 pages per site, 1 request per second per host, robots.txt and noindex obeyed, conditional requests, content hash. `pdftotext` for PDFs, `tesseract` for images (low confidence), Playwright only with `--render`. Blocks are recorded as `blocked` and never worked around. |
| `extract.mjs` | 5 | Reads cached menu text for new snapshots and writes `proposed` claims and `unknown_terms`. |
| `export.mjs` | 7 | Builds `venues.geojson` from approved, unexpired claims on venues that pass the publish rule (`lib/publish.mjs`). |
| `backup_export.mjs` | | Nightly CSV export of the public tables for the `venues-data` branch. Never exports `venue_submissions`. |

Every stage writes a `pipeline_runs` row with counts and failure reasons from the fixed list: `blocked`, `no_menu_found`, `image_only`, `no_species`, `timeout`, `parse_error`.

## Running

Environment (from `.env.local` or GitHub secrets, never in Git): `NEXT_PUBLIC_SUPABASE_URL` (or `SUPABASE_URL`) and `SUPABASE_SERVICE_ROLE_KEY`. Without them every stage runs in dry mode and prints its record.

```
npm run test:venues                       # no network
node scripts/venues/discover.mjs --seeds scripts/venues/seeds/barcelona.csv
node scripts/venues/discover.mjs --overture --release 2026-10-21.0 --bbox=2.05,41.32,2.23,41.47 --licence "<from the release notes>"
node scripts/venues/resolve.mjs
node scripts/venues/geocode_check.mjs --limit 20
node scripts/venues/fetch_menu.mjs --limit 25 [--render] [--ocr]
node scripts/venues/extract.mjs
node scripts/venues/export.mjs --out venues.geojson
```

The workflow lives in `docs/github-workflows/venues-ingest.yml`. Save it by hand to `.github/workflows/` (Claude cannot write under `.github`).

## Seeds file format

CSV with header `name,address,city,country_code,lat,lng,website,list_name,note`. One row per bar from a person's own knowledge, an awards list or a brand locator. Facts only, attributed in `list_name` and `note`, no bulk copying of third party lists. `lat` and `lng` are optional. `country_code` is two letters.

## Rules that matter

- A species match counts only on a bottle listing style line (price, volume, ABV, village or producer) or under a mezcal, agave or destilados heading. Cocktail and marketing mentions are `weak` and go to review.
- Espadín is recorded but never counted. Blends count only for the species the line names. Local names that overlap (cuishe group) count once, as a group.
- OCR output is a proposal only (`low_ocr`), never counted.
- Menu text is never stored whole: capped matched lines only.
- Machines propose, humans approve. `export.mjs` needs approved claims, a fresh snapshot, a verified pin, no open reports and `status = published`.
- Overture and OpenStreetMap: check the licence at build time, store the release id, attribute OSM (ODbL).
- No Instagram, Facebook, TripAdvisor, Yelp or Google as menu sources.

## Tests

`npm run test:venues` runs `scripts/venues/test/*.test.mjs` with synthetic fixtures in `test/fixtures/` (species named, espadín only, cocktail only, cuishe group, PDF text, image only, blocked, OCR, ambiguous words). Replace them with real saved menus in Phase 1.
