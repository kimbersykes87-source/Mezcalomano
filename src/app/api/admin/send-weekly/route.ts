import { NextResponse } from "next/server";
import { isLoggedIn } from "@/lib/admin/auth";
import { lastWeek, sendWeekly } from "@/lib/admin/weekly";
import { logRun } from "@/lib/metrics/store";

/** "Send the weekly email now" button on the dashboard (logged-in only). Does not count as the Monday send. */
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isLoggedIn())) return NextResponse.json({ ok: false, error: "Please log in again." }, { status: 401 });
  const week = lastWeek();
  try {
    const sent = await sendWeekly(week);
    await logRun(week.from, "weekly_email_test", true, `test sent to ${sent.to}`);
    return NextResponse.json({ ok: true, ...sent });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await logRun(week.from, "weekly_email_test", false, message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
