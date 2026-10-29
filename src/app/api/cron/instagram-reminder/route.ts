import { NextResponse } from "next/server";
import { sendReminder } from "@/lib/admin/reminder";
import { logRun, serviceClient } from "@/lib/metrics/store";
import { defaultWeekEnd } from "@/lib/admin/instagram-manual";

/**
 * Sunday reminder trigger. Supabase pg_cron calls this at 17:00 and 18:00 UTC
 * every Sunday; it only acts at 18:00 London time, only once per week, and
 * only when the week's Instagram figures are not in yet. Same Bearer token as
 * the weekly email. `?force=1` skips the time and once-a-week checks.
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function authorised(header: string | null): Promise<boolean> {
  const given = header?.replace(/^Bearer\s+/i, "").trim();
  if (!given) return false;
  const cron = process.env.CRON_SECRET?.trim();
  if (cron && given === cron) return true;
  const { data } = await serviceClient().from("admin_tokens").select("token").eq("provider", "weekly_trigger").maybeSingle();
  return Boolean(data?.token) && data!.token === given;
}

function londonNow() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", weekday: "short", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  return { weekday: parts.find((p) => p.type === "weekday")?.value, hour: Number(parts.find((p) => p.type === "hour")?.value) };
}

export async function GET(request: Request) {
  if (!(await authorised(request.headers.get("authorization")))) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const force = new URL(request.url).searchParams.get("force") === "1";
  const now = londonNow();
  if (!force && !(now.weekday === "Sun" && now.hour === 18)) {
    return NextResponse.json({ ok: true, skipped: `not 18:00 Sunday in London (${now.weekday} ${now.hour}:00)` });
  }
  const weekEnd = defaultWeekEnd();
  if (!force) {
    const { count } = await serviceClient()
      .from("metrics_runs")
      .select("id", { count: "exact", head: true })
      .eq("source", "instagram_reminder")
      .eq("day", weekEnd)
      .eq("ok", true);
    if ((count ?? 0) > 0) return NextResponse.json({ ok: true, skipped: "already sent this week" });
  }
  try {
    const result = await sendReminder();
    await logRun(weekEnd, "instagram_reminder", true, result.sent ? `sent to ${result.to}` : "figures already entered, no email");
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logRun(weekEnd, "instagram_reminder", false, message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
