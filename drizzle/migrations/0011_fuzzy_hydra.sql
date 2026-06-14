ALTER TABLE "order_items" ALTER COLUMN "menu_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "deal_id" integer;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_deal_id_deals_id_fk" FOREIGN KEY ("deal_id") REFERENCES "public"."deals"("id") ON DELETE no action ON UPDATE no action;