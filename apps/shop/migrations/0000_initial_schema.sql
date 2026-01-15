-- Initial schema migration for Mezcalomano Shop
-- Creates all tables in dependency order

CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`hs_code` text NOT NULL,
	`weight_grams` integer NOT NULL,
	`width_in` text NOT NULL,
	`height_in` text NOT NULL,
	`depth_in` text NOT NULL,
	`origin_country` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE TABLE `prices` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`currency` text NOT NULL,
	`unit_amount` integer NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`stripe_price_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `bundles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE TABLE `bundle_items` (
	`id` text PRIMARY KEY NOT NULL,
	`bundle_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`bundle_id`) REFERENCES `bundles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`marketing_opt_in` integer DEFAULT 0 NOT NULL,
	`sex` text,
	`birth_year` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`deleted_at` integer
);

CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`status` text NOT NULL,
	`payment_status` text NOT NULL,
	`fulfillment_status` text NOT NULL,
	`customer_email` text,
	`shipping_country` text,
	`shipping_service` text,
	`currency` text NOT NULL,
	`subtotal_amount` integer NOT NULL,
	`tax_amount` integer NOT NULL,
	`shipping_amount` integer NOT NULL,
	`total_amount` integer NOT NULL,
	`stripe_checkout_session_id` text,
	`stripe_payment_intent_id` text,
	`stripe_charge_id` text,
	`tax_calculation_json` text,
	`duties_notice_shown` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `addresses` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`order_id` text,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`line1` text NOT NULL,
	`line2` text,
	`city` text NOT NULL,
	`state` text,
	`postal_code` text NOT NULL,
	`country` text NOT NULL,
	`phone` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`price_id` text,
	`name` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_amount` integer NOT NULL,
	`tax_amount` integer NOT NULL,
	`total_amount` integer NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`price_id`) REFERENCES `prices`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`provider` text NOT NULL,
	`status` text NOT NULL,
	`amount` integer NOT NULL,
	`currency` text NOT NULL,
	`stripe_payment_intent_id` text,
	`stripe_charge_id` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `shipments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`carrier` text,
	`service` text,
	`tracking_number` text,
	`status` text NOT NULL,
	`shipstation_order_id` text,
	`shipstation_shipment_id` text,
	`label_url` text,
	`shipped_at` integer,
	`delivered_at` integer,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`on_hand` integer DEFAULT 0 NOT NULL,
	`reserved` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `inventory_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`source` text NOT NULL,
	`on_hand` integer NOT NULL,
	`snapshot_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `shipping_zones` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`countries_csv` text NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE TABLE `shipping_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`zone_id` text NOT NULL,
	`service_level` text NOT NULL,
	`currency` text NOT NULL,
	`amount` integer NOT NULL,
	`min_days` integer,
	`max_days` integer,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`zone_id`) REFERENCES `shipping_zones`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE `webhooks_log` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text NOT NULL,
	`event_id` text NOT NULL,
	`event_type` text NOT NULL,
	`signature` text,
	`payload_json` text NOT NULL,
	`received_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`processed_at` integer,
	`status` text NOT NULL,
	`error_message` text
);

CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_type` text NOT NULL,
	`actor_id` text,
	`action` text NOT NULL,
	`target_type` text,
	`target_id` text,
	`metadata_json` text,
	`ip_address` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);

CREATE TABLE `consent_log` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`session_id` text NOT NULL,
	`region` text NOT NULL,
	`consent_status` text NOT NULL,
	`user_agent` text,
	`ip_address` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
