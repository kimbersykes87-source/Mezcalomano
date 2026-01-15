import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  void request;
  const admin = await requireAdmin();
  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "sheets.sync_requested",
  });

  return NextResponse.json(
    { ok: false, error: "Google Sheets sync not configured yet. See docs/NEXT_STEPS.md" },
    { status: 501 },
  );
}
