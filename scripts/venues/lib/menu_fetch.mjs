// Menu page fetching helpers (PDF text, OCR, optional rendering). No stage side effects on import.
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { politeGet } from "./http.mjs";
import { htmlToText, looksImageOnly } from "./text.mjs";

export const MAX_PAGES_PER_SITE = 6;
export const CACHE_DIR = path.resolve(".cache/venues");

export function pdfToText(buffer) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mm-pdf-"));
  const file = path.join(tmp, "menu.pdf");
  fs.writeFileSync(file, buffer);
  try {
    return execFileSync("pdftotext", ["-layout", file, "-"], { encoding: "utf8", timeout: 60000 });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

export function ocrImage(buffer) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mm-ocr-"));
  const file = path.join(tmp, "menu.img");
  fs.writeFileSync(file, buffer);
  try {
    return execFileSync("tesseract", [file, "-", "-l", "eng+spa"], { encoding: "utf8", timeout: 120000 });
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

async function renderWithPlaywright(url) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ userAgent: "MezcalomanoBot (hola@mezcalomano.com)" });
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    return await page.content();
  } finally {
    await browser.close();
  }
}

/** Fetch one page and return {format, text, status, ...}. Exported for reuse by one-off scripts. */
export async function fetchPage(url, opts = {}) {
  const res = await politeGet(url, opts);
  if (!res.ok) return { ok: false, reason: res.reason, status: res.status };
  if (res.notModified) return { ok: true, notModified: true };
  const isPdf = /pdf/i.test(res.contentType) || /\.pdf($|\?)/i.test(url);
  const isImage = /^image\//i.test(res.contentType);
  if (isPdf) {
    const text = pdfToText(res.body);
    return { ok: true, format: "pdf", text, html: null, etag: res.etag, lastModified: res.lastModified, status: res.status };
  }
  if (isImage) {
    if (opts.ocr) return { ok: true, format: "ocr", text: ocrImage(res.body), status: res.status };
    return { ok: true, format: "ocr", text: "", imageOnly: true, status: res.status };
  }
  let html = res.text || "";
  let text = htmlToText(html);
  if (opts.render && text.length < 300 && /<script/i.test(html)) {
    html = await renderWithPlaywright(url);
    text = htmlToText(html);
  }
  return { ok: true, format: "html", html, text, imageOnly: looksImageOnly(html, text), etag: res.etag, lastModified: res.lastModified, status: res.status };
}

