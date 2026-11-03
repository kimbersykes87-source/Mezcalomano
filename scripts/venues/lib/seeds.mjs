// Seeds file format and parser (plan section 5).
// CSV header: name,address,city,country_code,lat,lng,website,list_name,note
// One row per bar from a person's own knowledge, an awards list or a brand locator.
// lat and lng are optional; the geocode check fills them. Facts only, attributed
// in list_name and note, no bulk copying of third party lists.

import Papa from "papaparse";

export const SEED_COLUMNS = ["name", "address", "city", "country_code", "lat", "lng", "website", "list_name", "note"];

export function parseSeeds(csvText) {
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  const rows = [];
  const errors = [];
  parsed.data.forEach((r, i) => {
    const name = (r.name || "").trim();
    if (!name) { errors.push(`row ${i + 2}: name is required`); return; }
    const lat = r.lat ? Number(r.lat) : null;
    const lng = r.lng ? Number(r.lng) : null;
    if ((lat !== null && !Number.isFinite(lat)) || (lng !== null && !Number.isFinite(lng))) {
      errors.push(`row ${i + 2}: lat/lng must be numbers`); return;
    }
    const cc = (r.country_code || "").trim().toUpperCase();
    if (cc && cc.length !== 2) { errors.push(`row ${i + 2}: country_code must be 2 letters`); return; }
    rows.push({
      name, address: (r.address || "").trim() || null, city: (r.city || "").trim() || null,
      country_code: cc || null, lat, lng, website: (r.website || "").trim() || null,
      list_name: (r.list_name || "").trim() || null, note: (r.note || "").trim() || null,
    });
  });
  return { rows, errors };
}

export function slugifyVenue(name, city) {
  return `${name} ${city || ""}`.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}
