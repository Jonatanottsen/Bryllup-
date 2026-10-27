ALTER TABLE "bus_bookings" ALTER COLUMN "stop" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wishlist_contributions" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "wishlist_contributions" ADD COLUMN "will_organize" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "wishlist_contributions_one_organizer_uq" ON "wishlist_contributions" USING btree ("item_id") WHERE "wishlist_contributions"."will_organize";--> statement-breakpoint
UPDATE "bus_bookings" SET "stop" = NULL WHERE "trip" = 'til';--> statement-breakpoint
ALTER TABLE "bus_bookings" ADD CONSTRAINT "bus_bookings_stop_only_home" CHECK (("bus_bookings"."trip" = 'hjem') = ("bus_bookings"."stop" IS NOT NULL));--> statement-breakpoint
ALTER TABLE "wishlist_contributions" ADD CONSTRAINT "wishlist_contributions_organizer_has_phone" CHECK (NOT "wishlist_contributions"."will_organize" OR "wishlist_contributions"."phone" IS NOT NULL);