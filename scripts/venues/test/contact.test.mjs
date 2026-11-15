import test from "node:test";
import assert from "node:assert/strict";
import { contactLinks, extractEmails, findContactEmail, pickBestEmail } from "../lib/contact.mjs";

test("extracts mailto links and plain text, drops junk", () => {
  const html = '<a href="mailto:Info@CornerWine.com?subject=Hi">Email</a> orders [at] cornerwine.com <img src="logo@2x.png"> noreply@x.com user@sentry.io';
  assert.deepEqual(extractEmails(html).sort(), ["info@cornerwine.com", "orders@cornerwine.com"]);
});

test("prefers same domain role addresses over personal or third party", () => {
  const best = pickBestEmail(["jane.doe@cornerwine.com", "info@cornerwine.com", "hello@agency.com"], "https://www.cornerwine.com");
  assert.equal(best, "info@cornerwine.com");
});

test("finds a contact page link and falls back to Overture", async () => {
  assert.deepEqual(contactLinks('<a href="/pages/contact-us">Contact</a><a href="/shop">Shop</a>', "https://a.com"), ["https://a.com/pages/contact-us"]);
  const pages = {
    "https://a.com": { ok: true, text: '<a href="/contact">Contact</a>' },
    "https://a.com/contact": { ok: true, text: "Write to hello@a.com" },
  };
  const r = await findContactEmail("https://a.com", async (u) => pages[u] ?? { ok: false });
  assert.deepEqual(r, { email: "hello@a.com", source: "website", page: "https://a.com/contact" });
  const o = await findContactEmail("https://b.com", async () => ({ ok: false }), "Owner@B.com");
  assert.equal(o.email, "owner@b.com");
  assert.equal(o.source, "overture");
});
