import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { getRequestContext } from "@cloudflare/next-on-pages";
import "@/lib/cloudflare-env";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const days = Number(formData.get("days") ?? 365);
  const retentionDays = Number.isFinite(days) ? Math.max(30, days) : 365;

  const { env } = getRequestContext();
  await env.KV.put("retention:days", String(retentionDays));

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "retention.updated",
    metadata: { days: retentionDays },
  });

  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
