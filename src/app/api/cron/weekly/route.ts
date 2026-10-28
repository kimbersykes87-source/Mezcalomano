import { NextResponse } from "next/server";
import { alreadySent, lastWeek, sendWeekly } from "@/lib/admin/weekly";
import { logRun, serviceClient } from "@/lib/metrics/store";

/**
 * Monday email trigger. Supabase pg_cron calls this at 07:00 and 08:00 UTC
 * every Monday; it only sends on the call that falls at 08:00 London time, and
 * only once per week. Auth: Bearer token equal to the `weekly_trigger` token
 * kept in Supabase admin_tokens (made inside the database, never shown), or CRON_SECRET.
 * `?force=1` skips the time check (it still needs the token).
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
  if (!force && !(now.weekday === "Mon" && now.hour === 8)) {
    return NextResponse.json({ ok: true, skipped: `not 08:00 Monday in London (${now.weekday} ${now.hour}:00)` });
  }

  const week = lastWeek();
  if (!force && (await alreadySent(week.from))) {
    return NextResponse.json({ ok: true, skipped: "already sent this week" });
  }
  try {
    const sent = await sendWeekly(week);
    await logRun(week.from, "weekly_email", true, `sent to ${sent.to}: ${sent.subject}`);
    return NextResponse.json({ ok: true, ...sent });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logRun(week.from, "weekly_email", false, message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
