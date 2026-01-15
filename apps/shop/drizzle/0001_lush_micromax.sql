PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_addresses` (
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
--> statement-breakpoint
INSERT INTO `__new_addresses`("id", "customer_id", "order_id", "type", "name", "line1", "line2", "city", "state", "postal_code", "country", "phone", "created_at") SELECT "id", "customer_id", "order_id", "type", "name", "line1", "line2", "city", "state", "postal_code", "country", "phone", "created_at" FROM `addresses`;--> statement-breakpoint
DROP TABLE `addresses`;--> statement-breakpoint
ALTER TABLE `__new_addresses` RENAME TO `addresses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;