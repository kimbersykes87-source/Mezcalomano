// Four source adapters. Each returns { text, links:[{url,title}], model, raw }.
// Keys come from environment variables only. Nothing here logs a key or a URL that contains one.

const strip = (s) => String(s ?? "").replace(/(api_key=)[^&\s"]+/gi, "$1***").replace(/(key[=:]\s*)[A-Za-z0-9_\-.]{12,}/gi, "$1***");

async function http(url, opts, label) {
  const res = await fetch(url, opts);
  const body = await res.text();
  if (!res.ok) throw new Error(`${label} HTTP ${res.status}: ${strip(body).slice(0, 400)}`);
  try { return JSON.parse(body); } catch { throw new Error(`${label} returned non JSON: ${strip(body).slice(0, 200)}`); }
}

const need = (name) => {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
};

const dedupe = (links) => {
  const seen = new Set();
  return links.filter((l) => l.url && !seen.has(l.url) && seen.add(l.url));
};

export async function openai(question, cfg) {
  const data = await http("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${need("OPENAI_API_KEY")}` },
    body: JSON.stringify({ model: cfg.openai.model, tools: [{ type: "web_search" }], input: question }),
  }, "openai");
  let text = "";
  const links = [];
  for (const item of data.output ?? []) {
    if (item.type !== "message") continue;
    for (const c of item.content ?? []) {
      if (c.type === "output_text") {
        text += c.text ?? "";
        for (const a of c.annotations ?? []) if (a.type === "url_citation") links.push({ url: a.url, title: a.title });
      }
    }
  }
  return { text, links: dedupe(links), model: data.model ?? cfg.openai.model, raw: data };
}

export async function anthropic(question, cfg) {
  const messages = [{ role: "user", content: question }];
  let text = "";
  const links = [];
  let model = cfg.anthropic.model;
  let last;
  for (let i = 0; i <= (cfg.anthropic.maxContinues ?? 5); i++) {
    last = await http("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": need("ANTHROPIC_API_KEY"),
        "anthropic-version": "2023-06-01",
        // Needed only when the key is not scoped to a workspace. The ID is not a secret.
        ...(process.env.ANTHROPIC_WORKSPACE_ID ? { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } : {}),
      },
      body: JSON.stringify({
        model: cfg.anthropic.model,
        max_tokens: 2500,
        tools: [{ type: cfg.anthropic.tool, name: "web_search", max_uses: 5 }],
        messages,
      }),
    }, "anthropic");
    model = last.model ?? model;
    for (const b of last.content ?? []) {
      if (b.type === "text") {
        text += b.text ?? "";
        for (const c of b.citations ?? []) if (c.url) links.push({ url: c.url, title: c.title });
      } else if (b.type === "web_search_tool_result" && Array.isArray(b.content)) {
        for (const r of b.content) if (r.url) links.push({ url: r.url, title: r.title });
      }
    }
    if (last.stop_reason !== "pause_turn") break;
    messages.push({ role: "assistant", content: last.content });
  }
  return { text, links: dedupe(links), model, raw: last };
}

function collectUrls(node, out) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach((n) => collectUrls(n, out));
  for (const [k, v] of Object.entries(node)) {
    if ((k === "url" || k === "uri") && typeof v === "string" && /^https?:/.test(v)) out.push({ url: v, title: node.title });
    else collectUrls(v, out);
  }
}

export async function gemini(question, cfg) {
  const key = need("GEMINI_API_KEY");
  const base = "https://generativelanguage.googleapis.com/v1beta";
  const headers = { "Content-Type": "application/json", "x-goog-api-key": key };
  if (cfg.gemini.api === "generateContent") {
    // Fallback format. Grounding on 2.5 and older models is billed per prompt.
    const data = await http(`${base}/models/${cfg.gemini.model}:generateContent`, {
      method: "POST", headers,
      body: JSON.stringify({ contents: [{ parts: [{ text: question }] }], tools: [{ google_search: {} }] }),
    }, "gemini");
    const cand = data.candidates?.[0];
    const text = (cand?.content?.parts ?? []).map((p) => p.text ?? "").join("");
    const links = [];
    for (const ch of cand?.groundingMetadata?.groundingChunks ?? []) if (ch.web?.uri) links.push({ url: ch.web.uri, title: ch.web.title });
    return { text, links: dedupe(links), model: data.modelVersion ?? cfg.gemini.model, raw: data };
  }
  const data = await http(`${base}/interactions`, {
    method: "POST", headers,
    body: JSON.stringify({ model: cfg.gemini.model, input: question, tools: [{ type: "google_search" }] }),
  }, "gemini");
  const parts = [];
  for (const o of data.outputs ?? []) if (o.type === "text" && o.text) parts.push(o.text);
  const links = [];
  collectUrls(data.outputs, links);
  return { text: parts.join("\n"), links: dedupe(links), model: data.model ?? cfg.gemini.model, raw: data };
}

function flattenBlocks(blocks, out = []) {
  for (const b of blocks ?? []) {
    if (b.snippet) out.push(b.snippet);
    if (b.text) out.push(b.text);
    if (Array.isArray(b.list)) for (const li of b.list) { if (li.snippet) out.push(li.snippet); flattenBlocks(li.list, out); }
    if (b.text_blocks) flattenBlocks(b.text_blocks, out);
  }
  return out;
}

export async function google(question, cfg) {
  const key = need("SERPAPI_KEY");
  const p = new URLSearchParams({ engine: "google", q: question, gl: cfg.google.gl, hl: cfg.google.hl, api_key: key });
  let data = await http(`https://serpapi.com/search.json?${p}`, {}, "serpapi");
  let ao = data.ai_overview;
  if (ao?.page_token) {
    const p2 = new URLSearchParams({ engine: "google_ai_overview", page_token: ao.page_token, api_key: key });
    data = await http(`https://serpapi.com/search.json?${p2}`, {}, "serpapi-ai-overview");
    ao = data.ai_overview ?? ao;
  }
  if (!ao) return { text: "", links: [], model: "google-ai-overview", raw: { note: "no AI Overview shown for this query" } };
  const text = flattenBlocks(ao.text_blocks).join("\n");
  const links = (ao.references ?? []).map((r) => ({ url: r.link, title: r.title }));
  return { text, links: dedupe(links), model: "google-ai-overview", raw: ao };
}

export const ADAPTERS = { openai, anthropic, gemini, google };
