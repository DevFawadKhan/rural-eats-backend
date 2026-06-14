ALTER TABLE "customers" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD COLUMN "is_guest" boolean DEFAULT false NOT NULL;