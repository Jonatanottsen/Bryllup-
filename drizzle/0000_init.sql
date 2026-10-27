CREATE TYPE "public"."bus_stop" AS ENUM('gjovik', 'raufoss');--> statement-breakpoint
CREATE TYPE "public"."bus_trip" AS ENUM('til', 'hjem');--> statement-breakpoint
CREATE TYPE "public"."wish_kind" AS ENUM('gave', 'spleis');--> statement-breakpoint
CREATE TABLE "bus_bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trip" "bus_trip" NOT NULL,
	"seat" integer NOT NULL,
	"passenger_name" text NOT NULL,
	"stop" "bus_stop" NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bus_bookings_trip_seat_uq" UNIQUE("trip","seat"),
	CONSTRAINT "bus_bookings_seat_positive" CHECK ("bus_bookings"."seat" > 0)
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"response_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"dietary" text[] DEFAULT '{}'::text[] NOT NULL,
	"dietary_notes" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvp_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"edit_token" text NOT NULL,
	"contact_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"attending" boolean NOT NULL,
	"speech_wanted" boolean DEFAULT false NOT NULL,
	"speech_note" text,
	"message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rsvp_responses_edit_token_unique" UNIQUE("edit_token")
);
--> statement-breakpoint
CREATE TABLE "wishlist_contributions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"name" text NOT NULL,
	"amount_nok" integer NOT NULL,
	"message" text,
	"owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_contributions_amount_positive" CHECK ("wishlist_contributions"."amount_nok" > 0)
);
--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text,
	"image_url" text,
	"price_nok" integer,
	"kind" "wish_kind" DEFAULT 'gave' NOT NULL,
	"goal_nok" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_items_quantity_positive" CHECK ("wishlist_items"."quantity" >= 1),
	CONSTRAINT "wishlist_items_spleis_has_goal" CHECK ("wishlist_items"."kind" <> 'spleis' OR "wishlist_items"."goal_nok" > 0)
);
--> statement-breakpoint
CREATE TABLE "wishlist_reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid NOT NULL,
	"name" text NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_response_id_rsvp_responses_id_fk" FOREIGN KEY ("response_id") REFERENCES "public"."rsvp_responses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_contributions" ADD CONSTRAINT "wishlist_contributions_item_id_wishlist_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."wishlist_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_reservations" ADD CONSTRAINT "wishlist_reservations_item_id_wishlist_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."wishlist_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "guests_response_id_idx" ON "guests" USING btree ("response_id");--> statement-breakpoint
CREATE INDEX "rsvp_responses_email_idx" ON "rsvp_responses" USING btree ("email");--> statement-breakpoint
CREATE INDEX "wishlist_contributions_item_id_idx" ON "wishlist_contributions" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "wishlist_reservations_item_id_idx" ON "wishlist_reservations" USING btree ("item_id");