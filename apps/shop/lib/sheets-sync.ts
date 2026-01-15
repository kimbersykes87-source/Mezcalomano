import { google } from "googleapis";
import { inArray } from "drizzle-orm";

import { env } from "@/lib/env";
import { getDb } from "@/db";
import {
  inventory,
  inventorySnapshots,
  orders,
  shipments,
  customers,
  payments,
} from "@/db/schema";

const getSheetsClient = () => {
  const privateKey = env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT(
    env.GOOGLE_SHEETS_CLIENT_EMAIL,
    undefined,
    privateKey,
    ["https://www.googleapis.com/auth/spreadsheets"],
  );
  return google.sheets({ version: "v4", auth });
};

export const runSheetsSync = async () => {
  const db = getDb();
  const sheets = getSheetsClient();

  const orderRows = await db.select().from(orders);
  const orderIds = orderRows.map((order) => order.id);
  const shipmentRows = orderIds.length ? await db.select().from(shipments).where(inArray(shipments.orderId, orderIds)) : [];
  const paymentRows = orderIds.length ? await db.select().from(payments).where(inArray(payments.orderId, orderIds)) : [];
  const inventoryRows = await db.select().from(inventory);
  const inventorySnapshotRows = await db.select().from(inventorySnapshots);
  const customerRows = await db.select().from(customers);

  const ordersValues = [
    [
      "order_id",
      "created_at",
      "payment_status",
      "fulfillment_status",
      "total_amount",
      "currency",
      "tracking_number",
      "refund_status",
    ],
    ...orderRows.map((order) => {
      const shipment = shipmentRows.find((row) => row.orderId === order.id);
      const payment = paymentRows.find((row) => row.orderId === order.id);
      return [
        order.id,
        order.createdAt,
        order.paymentStatus,
        order.fulfillmentStatus,
        order.totalAmount,
        order.currency,
        shipment?.trackingNumber ?? "",
        payment?.status ?? "",
      ];
    }),
  ];

  const inventoryValues = [
    ["product_id", "on_hand", "reserved", "updated_at"],
    ...inventoryRows.map((row) => [row.productId, row.onHand, row.reserved, row.updatedAt]),
  ];

  const snapshotValues = [
    ["product_id", "source", "on_hand", "snapshot_at"],
    ...inventorySnapshotRows.map((row) => [row.productId, row.source, row.onHand, row.snapshotAt]),
  ];

  const marketingValues = [
    ["total_customers", "marketing_opt_in"],
    [
      customerRows.length,
      customerRows.filter((row) => row.marketingOptIn === 1).length,
    ],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: "Orders!A1",
    valueInputOption: "RAW",
    requestBody: { values: ordersValues },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: "Inventory!A1",
    valueInputOption: "RAW",
    requestBody: { values: inventoryValues },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: "InventorySnapshots!A1",
    valueInputOption: "RAW",
    requestBody: { values: snapshotValues },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: env.GOOGLE_SHEETS_SPREADSHEET_ID,
    range: "Marketing!A1",
    valueInputOption: "RAW",
    requestBody: { values: marketingValues },
  });
};
