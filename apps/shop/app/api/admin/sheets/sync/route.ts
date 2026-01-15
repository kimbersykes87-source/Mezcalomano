import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/admin-auth";
import { writeAuditLog } from "@/lib/audit";
import { runSheetsSync } from "@/lib/sheets-sync";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  await runSheetsSync();
  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "sheets.sync_requested",
  });

  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
