// Licence list adapters for the pilot states (plan v3, Phase 1).
// Each adapter turns one raw row into a common record, or null when the row is not a retail venue
// we want (grocery, convenience, wholesale, delivery, temporary, inactive). Pure functions, no network.
// Output: { licence_state, licence_number, licence_type, licence_status, licence_expires_on,
//           name, dba, address, city, zip, lat, lng, venue_type }
// venue_type is 'store', 'bar', 'restaurant' or null when the licence alone cannot say.

const clean = (v) => String(v ?? "").replace(/\s+/g, " ").trim();
const title = (v) => clean(v).toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
const dateOnly = (v) => {
  const s = clean(v);
  if (!s) return null;
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/) || s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  return m[1].length === 4 ? `${m[1]}-${m[2]}-${m[3]}` : `${m[3]}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
};
const activeByDate = (iso, today) => (iso ? iso >= today : true);

function base(state, number, type, status, expires, name, dba, address, city, zip, lat, lng, venueType) {
  const nm = clean(dba) || clean(name);
  if (!nm || !number) return null;
  return {
    licence_state: state, licence_number: clean(number), licence_type: type, licence_status: status,
    licence_expires_on: expires, name: nm, legal_name: clean(name) || null,
    address: clean(address) || null, city: title(city) || null, zip: clean(zip).slice(0, 5) || null,
    lat: Number.isFinite(lat) ? lat : null, lng: Number.isFinite(lng) ? lng : null, venue_type: venueType,
  };
}

// New York. Dataset 9s3h-dpkz (active list). Keep stores, restaurants, bars, clubs, hotels.
const NY_KEEP = new Map([
  ["liquor store", "store"], ["restaurant", "restaurant"], ["food & beverage business", "restaurant"],
  ["additional bar", "bar"], ["club", "bar"], ["hotel", "restaurant"],
  ["tavern", "bar"], ["bar", "bar"],
]);
export function nyAdapter(row, today) {
  const desc = clean(row.description).toLowerCase();
  if (!NY_KEEP.has(desc)) return null;
  const expires = dateOnly(row.expirationdate);
  if (!activeByDate(expires, today)) return null;
  const coords = row.georeference?.coordinates;
  return base("NY", row.licensepermitid, clean(row.description), "active", expires, row.legalname, row.dba,
    row.actualaddressofpremises, row.city, row.zipcode,
    coords ? Number(coords[1]) : NaN, coords ? Number(coords[0]) : NaN, NY_KEEP.get(desc));
}

// Texas. Dataset 7hf9-qc9f on data.texas.gov. P = package store, MB = mixed beverage (bars and restaurants).
// Codes beyond these two are beer and wine or non retail and are dropped. Confirm against the TABC code list.
const TX_KEEP = new Map([["P", "store"], ["MB", null]]);
export function txAdapter(row, today) {
  const code = clean(row.license_type).toUpperCase();
  if (!TX_KEEP.has(code)) return null;
  const status = clean(row.license_status).toLowerCase();
  if (status && !/^(active|a|in effect)/.test(status) && !/active/.test(clean(row.primary_status).toLowerCase())) return null;
  const expires = dateOnly(row.expiration_date);
  if (!activeByDate(expires, today)) return null;
  return base("TX", row.license_id, code, "active", expires, row.owner, row.trade_name,
    row.address, row.city, row.zip, NaN, NaN, TX_KEEP.get(code));
}

// California. ABC Daily Data Export. 21 off sale general, 47 on sale general eating place, 48 on sale general public premises.
const CA_KEEP = new Map([["21", "store"], ["47", "restaurant"], ["48", "bar"]]);
export function caAdapter(row, today) {
  const code = clean(row["License Type"]);
  if (!CA_KEEP.has(code)) return null;
  if (clean(row["Lic or App"]).toUpperCase() !== "LIC" || clean(row["Type Status"]).toUpperCase() !== "ACTIVE") return null;
  const expires = dateOnly(row["Expir Date"]) || (/^\d{8}$/.test(clean(row["Expir Date"]))
    ? `${clean(row["Expir Date"]).slice(0, 4)}-${clean(row["Expir Date"]).slice(4, 6)}-${clean(row["Expir Date"]).slice(6, 8)}` : null);
  if (!activeByDate(expires, today)) return null;
  return base("CA", `${code}-${clean(row["File Number"])}`, code, "active", expires, row["Primary Name"], row["DBA Name"],
    clean(row[" Prem Addr 1"] ?? row["Prem Addr 1"]), row[" Prem City"] ?? row["Prem City"],
    row[" Prem Zip"] ?? row["Prem Zip"], NaN, NaN, CA_KEEP.get(code));
}

// Colorado. Dataset ier5-5ms2 (active list, public domain). Drop delivery, manufacturing, wholesale and event permits.
export function coAdapter(row, today) {
  const t = clean(row.license_type).toLowerCase();
  let venue = null;
  if (/^retail liquor store/.test(t)) venue = "store";
  else if (/^tavern/.test(t)) venue = "bar";
  else if (/^(hotel and restaurant|hotel & restaurant|restaurant|club|arts|racetrack|optional premises|beer and wine)/.test(t)) venue = "restaurant";
  if (!venue || /delivery|permit|wholesale|manufactur/.test(t)) return null;
  const expires = dateOnly(row.expiration);
  if (!activeByDate(expires, today)) return null;
  const c = row.location?.coordinates;
  return base("CO", row.license_number, clean(row.license_type), "active", expires, row.licensee_name, row.doing_business_as,
    row.street_address, row.city, row.zip, c ? Number(c[1]) : NaN, c ? Number(c[0]) : NaN, venue);
}

export const ADAPTERS = { NY: nyAdapter, TX: txAdapter, CA: caAdapter, CO: coAdapter };
