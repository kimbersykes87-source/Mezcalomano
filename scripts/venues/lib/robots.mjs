// Minimal robots.txt parser and noindex detection. Pure functions.

export const BOT_NAME = "MezcalomanoBot";
export const USER_AGENT = "MezcalomanoBot (hola@mezcalomano.com)";

/** Parse robots.txt into groups: [{agents: [..], rules: [{allow, path}]}]. */
export function parseRobots(text) {
  const groups = [];
  let current = null;
  let lastWasAgent = false;
  for (const raw of String(text || "").split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    if (!line) continue;
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const field = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();
    if (field === "user-agent") {
      if (!current || !lastWasAgent) { current = { agents: [], rules: [] }; groups.push(current); }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if (field === "allow" || field === "disallow") {
      lastWasAgent = false;
      if (current) current.rules.push({ allow: field === "allow", path: value });
    } else {
      lastWasAgent = false;
    }
  }
  return groups;
}

function ruleMatches(rulePath, path) {
  if (rulePath === "") return false;
  const re = new RegExp(`^${rulePath.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\\\$$/, "$")}`);
  return re.test(path);
}

/** Longest matching rule wins; Allow wins ties. No robots groups means allowed. */
export function isAllowed(groups, path, bot = BOT_NAME) {
  const name = bot.toLowerCase();
  const specific = groups.filter((g) => g.agents.some((a) => a !== "*" && name.includes(a)));
  const star = groups.filter((g) => g.agents.includes("*"));
  const use = specific.length > 0 ? specific : star;
  let best = null;
  for (const g of use) {
    for (const r of g.rules) {
      if (!ruleMatches(r.path, path)) continue;
      if (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow)) best = r;
    }
  }
  return best ? best.allow : true;
}

/** True when headers or HTML ask robots not to index the page. */
export function hasNoindex(headers, html) {
  const xr = typeof headers?.get === "function" ? headers.get("x-robots-tag") : headers?.["x-robots-tag"];
  if (xr && /noindex|none/i.test(xr)) return true;
  const metas = String(html || "").match(/<meta\s+[^>]*name=["']robots["'][^>]*>/gi) || [];
  return metas.some((m) => /content=["'][^"']*(noindex|none)/i.test(m));
}
