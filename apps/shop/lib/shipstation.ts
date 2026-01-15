import crypto from "crypto";

import { env } from "@/lib/env";

export type ShipStationOrder = {
  orderNumber: string;
  orderKey: string;
  orderDate: string;
  orderStatus: "awaiting_shipment" | "on_hold" | "shipped" | "cancelled";
  customerEmail: string;
  billTo: ShipStationAddress;
  shipTo: ShipStationAddress;
  items: ShipStationLineItem[];
  amountPaid: number;
  taxAmount: number;
  shippingAmount: number;
  requestedShippingService?: string | null;
  advancedOptions: {
    storeId: number;
  };
  internationalOptions?: ShipStationInternationalOptions;
};

export type ShipStationAddress = {
  name: string;
  company?: string | null;
  street1: string;
  street2?: string | null;
  city: string;
  state?: string | null;
  postalCode: string;
  country: string;
  phone?: string | null;
};

export type ShipStationLineItem = {
  lineItemKey: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  weight: { value: number; units: "grams" };
  productId?: string | null;
};

export type ShipStationInternationalOptions = {
  contents: "merchandise";
  customsItems: Array<{
    description: string;
    quantity: number;
    value: number;
    harmonizedTariffCode: string;
    countryOfOrigin: string;
  }>;
};

const shipStationFetch = async <T>(path: string, init: RequestInit) => {
  const auth = Buffer.from(`${env.SHIPSTATION_API_KEY}:${env.SHIPSTATION_API_SECRET}`).toString("base64");
  const response = await fetch(`https://ssapi.shipstation.com${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ShipStation error: ${response.status} ${errorText}`);
  }

  return (await response.json()) as T;
};

export const createShipStationOrder = async (order: ShipStationOrder) => {
  return shipStationFetch<{ orderId: number }>("/orders/createorder", {
    method: "POST",
    body: JSON.stringify(order),
  });
};

export const verifyShipStationSignature = (payload: string, signature: string) => {
  const hmac = crypto.createHmac("sha256", env.SHIPSTATION_WEBHOOK_SECRET);
  hmac.update(payload, "utf8");
  const digest = hmac.digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
};
