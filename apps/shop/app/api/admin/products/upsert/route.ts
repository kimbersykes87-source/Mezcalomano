import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { prices, products } from "@/db/schema";
import { createId } from "@/lib/ids";
import { writeAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  const formData = await request.formData();
  const productId = String(formData.get("productId") ?? "");
  const priceId = String(formData.get("priceId") ?? "");

  const name = String(formData.get("name") ?? "");
  const description = String(formData.get("description") ?? "");
  const hsCode = String(formData.get("hsCode") ?? "");
  const originCountry = String(formData.get("originCountry") ?? "");
  const weightGrams = Number(formData.get("weightGrams") ?? 0);
  const widthIn = String(formData.get("widthIn") ?? "");
  const heightIn = String(formData.get("heightIn") ?? "");
  const depthIn = String(formData.get("depthIn") ?? "");
  const currency = String(formData.get("currency") ?? "USD").toUpperCase();
  const unitAmount = Number(formData.get("unitAmount") ?? 0);

  const db = getDb();
  const id = productId || createId("prod");

  const existingProduct = await db.select().from(products).where(eq(products.id, id));
  if (existingProduct[0]) {
    await db
      .update(products)
      .set({
        name,
        description,
        hsCode,
        originCountry,
        weightGrams,
        widthIn,
        heightIn,
        depthIn,
        updatedAt: Date.now(),
      })
      .where(eq(products.id, id));
  } else {
    await db.insert(products).values({
      id,
      name,
      description,
      hsCode,
      originCountry,
      weightGrams,
      widthIn,
      heightIn,
      depthIn,
      isActive: 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  const priceRowId = priceId || createId("price");
  const existingPrice = await db.select().from(prices).where(eq(prices.id, priceRowId));
  if (existingPrice[0]) {
    await db
      .update(prices)
      .set({ unitAmount, currency, isActive: 1 })
      .where(eq(prices.id, priceRowId));
  } else {
    await db.insert(prices).values({
      id: priceRowId,
      productId: id,
      currency,
      unitAmount,
      isActive: 1,
      createdAt: Date.now(),
    });
  }

  await writeAuditLog({
    actorType: "admin",
    actorId: admin.email,
    action: "product.upsert",
    targetType: "product",
    targetId: id,
  });

  return NextResponse.redirect(new URL("/admin/products", request.url), { status: 303 });
}
