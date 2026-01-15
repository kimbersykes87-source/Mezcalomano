import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { shippingRates, shippingZones } from "@/db/schema";

export type ShippingRate = {
  id: string;
  serviceLevel: string;
  currency: string;
  amount: number;
  minDays: number | null;
  maxDays: number | null;
};

const parseCountries = (csv: string) =>
  csv
    .split(",")
    .map((entry) => entry.trim().toUpperCase())
    .filter(Boolean);

export const getShippingRatesForCountry = async (country: string) => {
  const db = getDb();
  const zones = await db.select().from(shippingZones).where(eq(shippingZones.isActive, 1));
  const normalizedCountry = country.toUpperCase();

  const matchingZone =
    zones.find((zone) => parseCountries(zone.countriesCsv).includes(normalizedCountry)) ??
    zones.find((zone) => parseCountries(zone.countriesCsv).includes("*"));

  if (!matchingZone) return [];

  const rates = await db
    .select()
    .from(shippingRates)
    .where(eq(shippingRates.zoneId, matchingZone.id));

  return rates.map((rate) => ({
    id: rate.id,
    serviceLevel: rate.serviceLevel,
    currency: rate.currency,
    amount: rate.amount,
    minDays: rate.minDays ?? null,
    maxDays: rate.maxDays ?? null,
  }));
};
