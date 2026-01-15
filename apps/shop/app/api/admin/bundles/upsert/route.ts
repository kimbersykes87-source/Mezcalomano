import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { bundles } from "@/db/schema";
import { createId } from "@/lib/ids";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const bundleId = String(formData.get("bundleId") ?? "");
  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");

  const db = getDb();
  const id = bundleId || createId("bundle");
  const existing = await db.select().from(bundles).where(eq(bundles.id, id));
  if (existing[0]) {
    await db.update(bundles).set({ name, description }).where(eq(bundles.id, id));
  } else {
    await db.insert(bundles).values({
      id,
      name,
      description,
      isActive: 1,
      createdAt: Date.now(),
    });
  }

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "bundle.upsert",
    targetType: "bundle",
    targetId: id,
  });

  return NextResponse.redirect(new URL("/admin/bundles", request.url), { status: 303 });
}
