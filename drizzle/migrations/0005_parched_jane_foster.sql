ALTER TABLE "menus" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "has_sizes" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "standard_price" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "price_small" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "price_medium" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "menus" ADD COLUMN "price_large" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "menus" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "menus" DROP COLUMN "is_available";