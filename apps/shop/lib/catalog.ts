import { and, eq, inArray } from "drizzle-orm";

import { getDb } from "@/db";
import { prices, products } from "@/db/schema";

export const getActiveProductWithPrice = async (productId?: string) => {
  const db = getDb();
  const conditions = [eq(products.isActive, 1), eq(prices.isActive, 1)];
  if (productId) {
    conditions.push(eq(products.id, productId));
  }
  const rows = await db
    .select({
      productId: products.id,
      name: products.name,
      description: products.description,
      hsCode: products.hsCode,
      weightGrams: products.weightGrams,
      widthIn: products.widthIn,
      heightIn: products.heightIn,
      depthIn: products.depthIn,
      originCountry: products.originCountry,
      priceId: prices.id,
      unitAmount: prices.unitAmount,
      currency: prices.currency,
    })
    .from(products)
    .innerJoin(prices, eq(prices.productId, products.id))
    .where(and(...conditions));

  return rows[0] ?? null;
};

export const getProductsByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const db = getDb();
  return db
    .select({
      productId: products.id,
      name: products.name,
      description: products.description,
      hsCode: products.hsCode,
      weightGrams: products.weightGrams,
      widthIn: products.widthIn,
      heightIn: products.heightIn,
      depthIn: products.depthIn,
      originCountry: products.originCountry,
      priceId: prices.id,
      unitAmount: prices.unitAmount,
      currency: prices.currency,
    })
    .from(products)
    .innerJoin(prices, eq(prices.productId, products.id))
    .where(and(eq(products.isActive, 1), eq(prices.isActive, 1), inArray(products.id, ids)));
};
