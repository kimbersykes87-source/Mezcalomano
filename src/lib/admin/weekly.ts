import { addDays, buildSummary, fmtMoney, fmtNumber, headlineChange, type Summary } from "./summary";
import { londonYesterday } from "@/lib/metrics/time";
import { serviceClient } from "@/lib/metrics/store";

/**
 * The Monday email: last week (Monday to Sunday, London time) against the week
 * before, sent from hola@ to hola@ through a Google Apps Script web app.
 *
 * Env: WEEKLY_EMAIL_URL (the script's /exec URL), WEEKLY_EMAIL_TOKEN (Sensitive,
 * same value as the script property SHARED_SECRET), optional WEEKLY_EMAIL_TO
 * (defaults to hola@mezcalomano.com), optional ADMIN_URL.
 */

export const weeklyTo = () => process.env.WEEKLY_EMAIL_TO?.trim() || "hola@mezcalomano.com";
const adminUrl = () => process.env.ADMIN_URL?.trim() || "https://admin.mezcalomano.com";

/** Last full Monday to Sunday before today (London). */
export function lastWeek(): { from: string; to: string } {
  const yesterday = londonYesterday();
  const dow = new Date(`${yesterday}T12:00:00Z`).getUTCDay();
  const to = addDays(yesterday, -(dow === 0 ? 0 : dow));
  return { from: addDays(to, -6), to };
}

const day = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function topList(title: string, rows: { name: string; value: number }[], unit: string): { html: string; text: string } {
  if (!rows.length) return { html: "", text: "" };
  const html = `<h3 style="font-size:15px;margin:22px 0 6px;color:#272926">${esc(title)}</h3><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px">${rows
    .map(
      (r) =>
        `<tr><td style="padding:4px 0;border-bottom:1px solid #e6e2d8">${esc(r.name)}</td><td style="padding:4px 0;border-bottom:1px solid #e6e2d8;text-align:right;white-space:nowrap">${fmtNumber(r.value)} ${unit}</td></tr>`
    )
    .join("")}</table>`;
  const text = `\n${title}\n${rows.map((r) => `  ${r.name}: ${fmtNumber(r.value)} ${unit}`).join("\n")}\n`;
  return { html, text };
}

export function renderWeekly(s: Summary): { subject: string; html: string; text: string } {
  const { from, to } = s.current;
  const subject = `Mezcalómano weekly: ${day(from)} to ${day(to)}`;

  const rowsHtml = s.headlines
    .map((h) => {
      const v = h.format === "money" ? fmtMoney(h.value) : fmtNumber(h.value);
      const c = headlineChange(h);
      const color = c?.startsWith("+") || c === "new" ? "#4f7a3c" : c?.startsWith("-") ? "#a4492a" : "#6b6b63";
      return `<tr><td style="padding:7px 0;border-bottom:1px solid #e6e2d8">${esc(h.label)}</td><td style="padding:7px 0;border-bottom:1px solid #e6e2d8;text-align:right;font-weight:700;white-space:nowrap">${v}</td><td style="padding:7px 0 7px 12px;border-bottom:1px solid #e6e2d8;text-align:right;color:${color};white-space:nowrap;font-size:13px">${c ?? ""}</td></tr>`;
    })
    .join("");
  const rowsText = s.headlines
    .map((h) => {
      const v = h.format === "money" ? fmtMoney(h.value) : fmtNumber(h.value);
      const c = headlineChange(h);
      return `  ${h.label}: ${v}${c ? ` (${c} vs week before)` : ""}`;
    })
    .join("\n");

  const first = s.funnel[0]?.value ?? 0;
  const funnelText = s.funnel
    .map((f) => `${f.label} ${fmtNumber(f.value)}${first ? ` (${Math.round(((f.value ?? 0) / first) * 100)}%)` : ""}`)
    .join(", then ");

  const lists = [
    topList("Top pages on mezcalomano.com", s.current.top("web_main", "page_views_by_path", 5), "views"),
    topList("Where site visitors came from", s.current.top("web_main", "visits_by_referrer", 5), "visits"),
    topList("Where shop sessions came from", s.current.top("shop", "sessions_by_referrer", 5), "sessions"),
    topList("Sales by product", s.current.top("shop", "units_by_sku", 5), "decks"),
    topList("Producer clicks by species", s.current.top("clicks", "producer_clicks_by_species", 5), "clicks"),
  ];

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#272926">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff">
<tr><td style="background:#272926;padding:18px 22px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:1px">MEZCAL<span style="color:#DFB725">Ó</span>MANO WEEKLY</td></tr>
<tr><td style="padding:20px 22px">
<p style="margin:0 0 14px;font-size:15px">${day(from)} to ${day(to)}, compared with the week before.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px">${rowsHtml}</table>
<h3 style="font-size:15px;margin:22px 0 6px;color:#272926">Shop funnel</h3>
<p style="margin:0;font-size:14px">${esc(funnelText)}</p>
${lists.map((l) => l.html).join("")}
<p style="margin:26px 0 0"><a href="${adminUrl()}" style="background:#84866D;color:#ffffff;text-decoration:none;padding:10px 16px;display:inline-block;font-size:14px">Open the dashboard</a></p>
</td></tr></table>
<p style="font-size:12px;color:#8a877d;margin:12px 0 0">Sent automatically every Monday at 08:00 London time.</p>
</td></tr></table></body></html>`;

  const text = `Mezcalómano weekly, ${day(from)} to ${day(to)} (vs the week before)\n\n${rowsText}\n\nShop funnel: ${funnelText}\n${lists
    .map((l) => l.text)
    .join("")}\nDashboard: ${adminUrl()}\n`;

  return { subject, html, text };
}

export async function sendWeekly(range = lastWeek()): Promise<{ to: string; subject: string }> {
  const url = process.env.WEEKLY_EMAIL_URL?.trim();
  const token = process.env.WEEKLY_EMAIL_TOKEN?.trim();
  if (!url || !token) throw new Error("WEEKLY_EMAIL_URL or WEEKLY_EMAIL_TOKEN is not set");
  const summary = await buildSummary(range.from, range.to);
  const mail = renderWeekly(summary);
  const to = weeklyTo();
  await postMail(to, mail);
  return { to, subject: mail.subject };
}

/** Sends one email through the Apps Script web app (hola@ only). */
export async function postMail(to: string, mail: { subject: string; html: string; text: string }): Promise<void> {
  const url = process.env.WEEKLY_EMAIL_URL?.trim();
  const token = process.env.WEEKLY_EMAIL_TOKEN?.trim();
  if (!url || !token) throw new Error("WEEKLY_EMAIL_URL or WEEKLY_EMAIL_TOKEN is not set");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, to, ...mail }),
    redirect: "follow",
  });
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!data?.ok) throw new Error(`email script: ${data?.error ?? `HTTP ${res.status}`}`);
}

/** True if the email for the week starting `from` was already sent. */
export async function alreadySent(from: string): Promise<boolean> {
  const { count } = await serviceClient()
    .from("metrics_runs")
    .select("id", { count: "exact", head: true })
    .eq("source", "weekly_email")
    .eq("day", from)
    .eq("ok", true);
  return (count ?? 0) > 0;
}
