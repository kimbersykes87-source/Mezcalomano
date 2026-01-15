PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
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
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "customer_id", "status", "payment_status", "fulfillment_status", "customer_email", "shipping_country", "shipping_service", "currency", "subtotal_amount", "tax_amount", "shipping_amount", "total_amount", "stripe_checkout_session_id", "stripe_payment_intent_id", "stripe_charge_id", "tax_calculation_json", "duties_notice_shown", "created_at", "updated_at") SELECT "id", "customer_id", "status", "payment_status", "fulfillment_status", "customer_email", "shipping_country", "shipping_service", "currency", "subtotal_amount", "tax_amount", "shipping_amount", "total_amount", "stripe_checkout_session_id", "stripe_payment_intent_id", "stripe_charge_id", "tax_calculation_json", "duties_notice_shown", "created_at", "updated_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;