import test from "node:test";
import assert from "node:assert/strict";
import { nyAdapter, txAdapter, caAdapter, coAdapter } from "../lib/licences/index.mjs";
import { labelChains } from "../lib/chain.mjs";

const TODAY = "2026-11-15";

test("NY keeps liquor stores and drops groceries and expired licences", () => {
  const row = { licensepermitid: "0340-1", description: "Liquor Store", legalname: "ABC LLC", dba: "Corner Wines",
    actualaddressofpremises: "1 Main St", city: "BROOKLYN", zipcode: "11201", expirationdate: "2027-03-01T00:00:00.000",
    georeference: { coordinates: [-73.99, 40.69] } };
  const r = nyAdapter(row, TODAY);
  assert.equal(r.venue_type, "store");
  assert.equal(r.name, "Corner Wines");
  assert.equal(r.city, "Brooklyn");
  assert.equal(r.lat, 40.69);
  assert.equal(nyAdapter({ ...row, description: "Grocery Store" }, TODAY), null);
  assert.equal(nyAdapter({ ...row, expirationdate: "2026-01-01T00:00:00.000" }, TODAY), null);
});

test("TX keeps package stores and mixed beverage, drops other codes", () => {
  const row = { license_type: "P", license_id: "P123", license_status: "Active", expiration_date: "2027-02-01T00:00:00.000",
    trade_name: "Lone Star Spirits", owner: "LSS INC", address: "5 Elm", city: "AUSTIN", zip: "78701" };
  assert.equal(txAdapter(row, TODAY).venue_type, "store");
  assert.equal(txAdapter({ ...row, license_type: "MB" }, TODAY).venue_type, null);
  assert.equal(txAdapter({ ...row, license_type: "BG" }, TODAY), null);
  assert.equal(txAdapter({ ...row, license_status: "Cancelled", primary_status: "Cancelled" }, TODAY), null);
});

test("CA keeps active type 21, 47, 48 licences only", () => {
  const row = { "License Type": "48", "File Number": "00000001", "Lic or App": "LIC", "Type Status": "ACTIVE",
    "Expir Date": "20270301", "Primary Name": "BAR INC", "DBA Name": "The Tiki Room", " Prem Addr 1": "9 Pier", " Prem City": "OAKLAND", " Prem Zip": "94607-1234" };
  const r = caAdapter(row, TODAY);
  assert.equal(r.venue_type, "bar");
  assert.equal(r.zip, "94607");
  assert.equal(caAdapter({ ...row, "License Type": "41" }, TODAY), null);
  assert.equal(caAdapter({ ...row, "Type Status": "PEND" }, TODAY), null);
  assert.equal(caAdapter({ ...row, "Lic or App": "APP" }, TODAY), null);
});

test("CO keeps stores and taverns, drops delivery permits", () => {
  const row = { licensee_name: "AKAAM Inc", doing_business_as: "Sandhu Liquor", license_number: "03-13165",
    license_type: "Retail Liquor Store (city)", expiration: "2027-05-07T00:00:00.000", street_address: "1080 E 10th",
    city: "Broomfield", zip: "80020.0", location: { coordinates: [-105.05, 39.93] } };
  assert.equal(coAdapter(row, TODAY).venue_type, "store");
  assert.equal(coAdapter({ ...row, license_type: "Tavern (city)" }, TODAY).venue_type, "bar");
  assert.equal(coAdapter({ ...row, license_type: "Delivery Permit" }, TODAY), null);
});

test("chain labelling by repeated name, domain and national list", () => {
  const four = [1, 2, 3, 4].map((i) => ({ name: `Joe's Liquors #${i}`, website: null }));
  const out = labelChains([...four, { name: "Casa Mezcal", website: "https://casamezcal.com" }, { name: "Total Wine & More", website: null }]);
  assert.equal(out[0].chain_status, "chain");
  assert.equal(out[4].chain_status, "independent");
  assert.equal(out[5].chain_status, "chain");
  const three = labelChains([1, 2, 3].map((i) => ({ name: `Shop ${i}x`, website: "https://x.com" })));
  assert.equal(three[0].chain_status, "independent");
});
