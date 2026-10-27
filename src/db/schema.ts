import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

// ---------------------------------------------------------------------------
// RSVP
// Ett svar (response) per innsending. Et svar kan gjelde flere personer
// (par, familie), og hver person ligger i `guests` med egne allergier.
// ---------------------------------------------------------------------------

export const rsvpResponses = pgTable(
  "rsvp_responses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Hemmelig token som lar gjesten endre svaret sitt senere.
    editToken: text("edit_token").notNull().unique(),
    contactName: text("contact_name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull(),
    attending: boolean("attending").notNull(),
    speechWanted: boolean("speech_wanted").notNull().default(false),
    speechNote: text("speech_note"),
    message: text("message"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("rsvp_responses_email_idx").on(t.email)],
);

export const guests = pgTable(
  "guests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    responseId: uuid("response_id")
      .notNull()
      .references(() => rsvpResponses.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    // Koder fra ALLERGENS i src/config/wedding.ts, f.eks. {gluten,laktose}
    dietary: text("dietary")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    dietaryNotes: text("dietary_notes"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("guests_response_id_idx").on(t.responseId)],
);

// ---------------------------------------------------------------------------
// Buss
// Ett sete kan bare bookes én gang per tur – håndheves av unik-constraint,
// så to gjester som klikker samtidig aldri får samme sete.
// Turen dit har ett hentested (kirken), så `stop` gjelder kun hjemturen.
// ---------------------------------------------------------------------------

export const busTrip = pgEnum("bus_trip", ["til", "hjem"]);
export const busStop = pgEnum("bus_stop", ["gjovik", "raufoss"]);

export const busBookings = pgTable(
  "bus_bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trip: busTrip("trip").notNull(),
    seat: integer("seat").notNull(),
    passengerName: text("passenger_name").notNull(),
    stop: busStop("stop"),
    // Anonym nettleser-id, slik at den som booket kan avbestille selv.
    ownerId: text("owner_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    unique("bus_bookings_trip_seat_uq").on(t.trip, t.seat),
    check("bus_bookings_seat_positive", sql`${t.seat} > 0`),
    check(
      "bus_bookings_stop_only_home",
      sql`(${t.trip} = 'hjem') = (${t.stop} IS NOT NULL)`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// Ønskeliste
// "gave"   = vanlig gave som reserveres (quantity = hvor mange vi ønsker oss)
// "spleis" = gruppegave: gjestene bidrar med beløp mot prisen (goal_nok),
//            og én av dem (will_organize) kjøper gaven og tar imot Vipps.
// ---------------------------------------------------------------------------

export const wishKind = pgEnum("wish_kind", ["gave", "spleis"]);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    url: text("url"),
    imageUrl: text("image_url"),
    priceNok: integer("price_nok"),
    kind: wishKind("kind").notNull().default("gave"),
    goalNok: integer("goal_nok"),
    quantity: integer("quantity").notNull().default(1),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [
    check("wishlist_items_quantity_positive", sql`${t.quantity} >= 1`),
    check(
      "wishlist_items_spleis_has_goal",
      sql`${t.kind} <> 'spleis' OR ${t.goalNok} > 0`,
    ),
  ],
);

export const wishlistReservations = pgTable(
  "wishlist_reservations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => wishlistItems.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    ownerId: text("owner_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("wishlist_reservations_item_id_idx").on(t.itemId)],
);

export const wishlistContributions = pgTable(
  "wishlist_contributions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    itemId: uuid("item_id")
      .notNull()
      .references(() => wishlistItems.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amountNok: integer("amount_nok").notNull(),
    message: text("message"),
    phone: text("phone"),
    willOrganize: boolean("will_organize").notNull().default(false),
    ownerId: text("owner_id").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("wishlist_contributions_item_id_idx").on(t.itemId),
    // Maks én ansvarlig per spleis, også ved samtidige innsendinger.
    uniqueIndex("wishlist_contributions_one_organizer_uq")
      .on(t.itemId)
      .where(sql`${t.willOrganize}`),
    check("wishlist_contributions_amount_positive", sql`${t.amountNok} > 0`),
    check(
      "wishlist_contributions_organizer_has_phone",
      sql`NOT ${t.willOrganize} OR ${t.phone} IS NOT NULL`,
    ),
  ],
);

export const rsvpResponsesRelations = relations(rsvpResponses, ({ many }) => ({
  guests: many(guests),
}));
export const guestsRelations = relations(guests, ({ one }) => ({
  response: one(rsvpResponses, { fields: [guests.responseId], references: [rsvpResponses.id] }),
}));
export const wishlistItemsRelations = relations(wishlistItems, ({ many }) => ({
  reservations: many(wishlistReservations),
  contributions: many(wishlistContributions),
}));
export const wishlistReservationsRelations = relations(wishlistReservations, ({ one }) => ({
  item: one(wishlistItems, { fields: [wishlistReservations.itemId], references: [wishlistItems.id] }),
}));
export const wishlistContributionsRelations = relations(wishlistContributions, ({ one }) => ({
  item: one(wishlistItems, { fields: [wishlistContributions.itemId], references: [wishlistItems.id] }),
}));

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type BusTrip = (typeof busTrip.enumValues)[number];
export type BusStop = (typeof busStop.enumValues)[number];
