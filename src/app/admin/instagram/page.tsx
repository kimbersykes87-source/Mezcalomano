import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { defaultWeekEnd, FIRST_WEEK, savedEntry } from "@/lib/admin/instagram-manual";
import { addDays } from "@/lib/admin/summary";
import InstagramForm from "./InstagramForm";

export const metadata: Metadata = { title: "Instagram figures" };
export const dynamic = "force-dynamic";

export default async function InstagramPage() {
  await requireAdmin("/instagram");
  const weekEnd = defaultWeekEnd();
  const saved = await savedEntry(weekEnd);
  const weeks = [0, 1, 2, 3].map((i) => addDays(weekEnd, -7 * i)).filter((d) => d >= FIRST_WEEK);
  return (
    <div className="adm-wrap" style={{ maxWidth: 640 }}>
      <p className="adm-brand">
        Mezcal<span>ó</span>mano <span>admin</span>
      </p>
      <p className="adm-sub" style={{ margin: "4px 0 18px" }}>
        <Link href="/admin">Back to the dashboard</Link>
      </p>
      <section className="adm-section">
        <h2>Instagram figures, weekly</h2>
        <p className="adm-sub" style={{ marginTop: 0 }}>
          Open @mezcalomano in the Instagram app (or instagram.com/accounts/insights on a computer), go to Professional dashboard, and set the range to the last 7 days. Copy each number across. Only the first two are required.
          Saving again for the same week replaces the earlier entry.
        </p>
        <InstagramForm
          weeks={weeks}
          initialWeek={weekEnd}
          initialSaved={saved}
        />
      </section>
    </div>
  );
}
