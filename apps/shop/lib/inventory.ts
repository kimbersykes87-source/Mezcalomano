import { getCloudflareContext } from "@opennextjs/cloudflare";

import "@/lib/cloudflare-env";

export type InventoryReservationItem = {
  productId: string;
  quantity: number;
};

const ensureInventoryUpdated = (changes: number | undefined) => {
  if (!changes || changes < 1) {
    throw new Error("Insufficient inventory available.");
  }
};

export const reserveInventory = async (items: InventoryReservationItem[]) => {
  const { env } = getCloudflareContext();
  const checks = await Promise.all(
    items.map((item) =>
      env.DB.prepare("SELECT on_hand, reserved FROM inventory WHERE product_id = ?")
        .bind(item.productId)
        .first<{ on_hand: number; reserved: number }>(),
    ),
  );
  checks.forEach((row, index) => {
    const item = items[index];
    if (!row || row.on_hand - row.reserved < item.quantity) {
      throw new Error("Insufficient inventory available.");
    }
  });
  const statements = items.map((item) =>
    env.DB.prepare(
      "UPDATE inventory SET reserved = reserved + ? WHERE product_id = ? AND (on_hand - reserved) >= ?",
    ).bind(item.quantity, item.productId, item.quantity),
  );
  const results = await env.DB.batch(statements);
  results.forEach((result) => ensureInventoryUpdated(result.meta?.changes));
};

export const commitInventory = async (items: InventoryReservationItem[]) => {
  const { env } = getCloudflareContext();
  const statements = items.map((item) =>
    env.DB.prepare(
      "UPDATE inventory SET on_hand = on_hand - ?, reserved = reserved - ? WHERE product_id = ? AND reserved >= ?",
    ).bind(item.quantity, item.quantity, item.productId, item.quantity),
  );
  const results = await env.DB.batch(statements);
  results.forEach((result) => ensureInventoryUpdated(result.meta?.changes));
};

export const releaseInventory = async (items: InventoryReservationItem[]) => {
  const { env } = getCloudflareContext();
  const statements = items.map((item) =>
    env.DB.prepare(
      "UPDATE inventory SET reserved = CASE WHEN reserved >= ? THEN reserved - ? ELSE 0 END WHERE product_id = ?",
    ).bind(item.quantity, item.quantity, item.productId),
  );
  await env.DB.batch(statements);
};
