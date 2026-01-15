ALTER TABLE `orders` ADD `payment_status` text NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `fulfillment_status` text NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `customer_email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_country` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_service` text;