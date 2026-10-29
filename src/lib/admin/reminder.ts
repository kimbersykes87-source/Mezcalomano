import { defaultWeekEnd, hasEntry } from "./instagram-manual";
import { postMail, weeklyTo } from "./weekly";

const adminUrl = () => process.env.ADMIN_URL?.trim() || "https://admin.mezcalomano.com";

const day = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

/** Sunday evening nudge to hola@: enter this week's Instagram figures before the Monday email. */
export function renderReminder(weekEnd: string): { subject: string; html: string; text: string } {
  const link = `${adminUrl()}/instagram`;
  const subject = `Instagram numbers needed for Monday's report (week ending ${day(weekEnd)})`;
  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#272926">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1ea"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff">
<tr><td style="background:#272926;padding:18px 22px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:1px">MEZCAL<span style="color:#DFB725">Ó</span>MANO</td></tr>
<tr><td style="padding:20px 22px;font-size:15px;line-height:1.5">
<p style="margin:0 0 12px">Whoever is nearest a phone: please add this week's Instagram numbers so they make Monday's 8:00 report. It takes about a minute.</p>
<ol style="margin:0 0 18px;padding-left:20px">
<li>In the Instagram app, open @mezcalomano, then Professional dashboard, and set the range to the last 7 days.</li>
<li>Note total followers, profile visits, views, viewers, interactions, accounts engaged and external link taps.</li>
<li>Enter them on the form below.</li>
</ol>
<p style="margin:0"><a href="${link}" style="background:#84866D;color:#ffffff;text-decoration:none;padding:10px 16px;display:inline-block;font-size:14px">Enter this week's figures</a></p>
<p style="margin:18px 0 0;font-size:13px;color:#6b6b63">Week ending Sunday ${day(weekEnd)}. You will be asked to log in to the dashboard first.</p>
</td></tr></table>
<p style="font-size:12px;color:#8a877d;margin:12px 0 0">Sent automatically every Sunday at 6:00 pm London time, only if the figures are not in yet.</p>
</td></tr></table></body></html>`;
  const text = `Please add this week's Instagram numbers so they make Monday's 8:00 report.\n\n1. In the Instagram app, open @mezcalomano, then Professional dashboard, last 7 days.\n2. Note total followers, profile visits, views, viewers, interactions, accounts engaged and external link taps.\n3. Enter them here: ${link}\n\nWeek ending Sunday ${day(weekEnd)}. You will be asked to log in first.\n`;
  return { subject, html, text };
}

export async function sendReminder(): Promise<{ sent: boolean; to?: string; weekEnd: string }> {
  const weekEnd = defaultWeekEnd();
  if (await hasEntry(weekEnd)) return { sent: false, weekEnd };
  const to = weeklyTo();
  await postMail(to, renderReminder(weekEnd));
  return { sent: true, to, weekEnd };
}
