import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const timestampMs = () => sql`(unixepoch() * 1000)`;

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  hsCode: text("hs_code").notNull(),
  weightGrams: integer("weight_grams").notNull(),
  widthIn: text("width_in").notNull(),
  heightIn: text("height_in").notNull(),
  depthIn: text("depth_in").notNull(),
  originCountry: text("origin_country").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const prices = sqliteTable("prices", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  currency: text("currency").notNull(),
  unitAmount: integer("unit_amount").notNull(),
  isActive: integer("is_active").notNull().default(1),
  stripePriceId: text("stripe_price_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const bundles = sqliteTable("bundles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const bundleItems = sqliteTable("bundle_items", {
  id: text("id").primaryKey(),
  bundleId: text("bundle_id").notNull().references(() => bundles.id),
  productId: text("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
});

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  marketingOptIn: integer("marketing_opt_in").notNull().default(0),
  sex: text("sex"),
  birthYear: integer("birth_year"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
  deletedAt: integer("deleted_at", { mode: "timestamp_ms" }),
});

export const addresses = sqliteTable("addresses", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customers.id),
  orderId: text("order_id").references(() => orders.id),
  type: text("type").notNull(),
  name: text("name").notNull(),
  line1: text("line1").notNull(),
  line2: text("line2"),
  city: text("city").notNull(),
  state: text("state"),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  phone: text("phone"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customers.id),
  status: text("status").notNull(),
  paymentStatus: text("payment_status").notNull(),
  fulfillmentStatus: text("fulfillment_status").notNull(),
  customerEmail: text("customer_email"),
  shippingCountry: text("shipping_country"),
  shippingService: text("shipping_service"),
  currency: text("currency").notNull(),
  subtotalAmount: integer("subtotal_amount").notNull(),
  taxAmount: integer("tax_amount").notNull(),
  shippingAmount: integer("shipping_amount").notNull(),
  totalAmount: integer("total_amount").notNull(),
  stripeCheckoutSessionId: text("stripe_checkout_session_id"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  taxCalculationJson: text("tax_calculation_json"),
  dutiesNoticeShown: integer("duties_notice_shown").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const orderItems = sqliteTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  productId: text("product_id").references(() => products.id),
  priceId: text("price_id").references(() => prices.id),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull(),
  unitAmount: integer("unit_amount").notNull(),
  taxAmount: integer("tax_amount").notNull(),
  totalAmount: integer("total_amount").notNull(),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  provider: text("provider").notNull(),
  status: text("status").notNull(),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeChargeId: text("stripe_charge_id"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const shipments = sqliteTable("shipments", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id),
  carrier: text("carrier"),
  service: text("service"),
  trackingNumber: text("tracking_number"),
  status: text("status").notNull(),
  shipStationOrderId: text("shipstation_order_id"),
  shipStationShipmentId: text("shipstation_shipment_id"),
  labelUrl: text("label_url"),
  shippedAt: integer("shipped_at", { mode: "timestamp_ms" }),
  deliveredAt: integer("delivered_at", { mode: "timestamp_ms" }),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  onHand: integer("on_hand").notNull().default(0),
  reserved: integer("reserved").notNull().default(0),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const inventorySnapshots = sqliteTable("inventory_snapshots", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id),
  source: text("source").notNull(),
  onHand: integer("on_hand").notNull(),
  snapshotAt: integer("snapshot_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const shippingZones = sqliteTable("shipping_zones", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  countriesCsv: text("countries_csv").notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const shippingRates = sqliteTable("shipping_rates", {
  id: text("id").primaryKey(),
  zoneId: text("zone_id").notNull().references(() => shippingZones.id),
  serviceLevel: text("service_level").notNull(),
  currency: text("currency").notNull(),
  amount: integer("amount").notNull(),
  minDays: integer("min_days"),
  maxDays: integer("max_days"),
  isActive: integer("is_active").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const webhooksLog = sqliteTable("webhooks_log", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  eventId: text("event_id").notNull(),
  eventType: text("event_type").notNull(),
  signature: text("signature"),
  payloadJson: text("payload_json").notNull(),
  receivedAt: integer("received_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
  processedAt: integer("processed_at", { mode: "timestamp_ms" }),
  status: text("status").notNull(),
  errorMessage: text("error_message"),
});

export const auditLog = sqliteTable("audit_log", {
  id: text("id").primaryKey(),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  metadataJson: text("metadata_json"),
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});

export const consentLog = sqliteTable("consent_log", {
  id: text("id").primaryKey(),
  customerId: text("customer_id").references(() => customers.id),
  sessionId: text("session_id").notNull(),
  region: text("region").notNull(),
  consentStatus: text("consent_status").notNull(),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull().default(timestampMs()),
});
