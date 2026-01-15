import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { addresses, customers } from "@/db/schema";
import { writeAuditLog } from "@/lib/audit";

export const runtime = "edge";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const db = getDb();
  const [customer] = await db.select().from(customers).where(eq(customers.email, email));
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }

  await db
    .update(customers)
    .set({
      name: "Deleted",
      email: `deleted+${customer.id}@mezcalomano.com`,
      phone: "",
      marketingOptIn: 0,
      sex: null,
      birthYear: null,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    })
    .where(eq(customers.id, customer.id));

  await db
    .update(addresses)
    .set({
      name: "Deleted",
      line1: "Deleted",
      line2: null,
      city: "Deleted",
      state: null,
      postalCode: "Deleted",
      country: "Deleted",
      phone: null,
    })
    .where(eq(addresses.customerId, customer.id));

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "customer.delete",
    targetType: "customer",
    targetId: customer.id,
  });

  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 });
}
