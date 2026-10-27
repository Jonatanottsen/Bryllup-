import "server-only";
import { asc, desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { guests, rsvpResponses } from "@/db/schema";

export async function getStats() {
  const [row] = (
    await db().execute<{
      responses: number;
      attending_guests: number;
      declined_guests: number;
      speeches: number;
      bus_til: number;
      bus_hjem: number;
      reserved: number;
      raised: number;
    }>(sql`
      SELECT
        (SELECT count(*) FROM rsvp_responses)::int AS responses,
        (SELECT count(*) FROM guests g JOIN rsvp_responses r ON r.id = g.response_id WHERE r.attending)::int AS attending_guests,
        (SELECT count(*) FROM guests g JOIN rsvp_responses r ON r.id = g.response_id WHERE NOT r.attending)::int AS declined_guests,
        (SELECT count(*) FROM rsvp_responses WHERE attending AND speech_wanted)::int AS speeches,
        (SELECT count(*) FROM bus_bookings WHERE trip = 'til')::int AS bus_til,
        (SELECT count(*) FROM bus_bookings WHERE trip = 'hjem')::int AS bus_hjem,
        (SELECT count(*) FROM wishlist_reservations)::int AS reserved,
        (SELECT coalesce(sum(amount_nok), 0) FROM wishlist_contributions)::int AS raised
    `)
  ).rows;
  return row;
}

/** Antall gjester (som kommer) per allergi/diett – til kjøkkenet. */
export async function getDietarySummary() {
  return (
    await db().execute<{ code: string; count: number }>(sql`
      SELECT d.code, count(*)::int AS count
      FROM guests g
      JOIN rsvp_responses r ON r.id = g.response_id AND r.attending
      CROSS JOIN LATERAL unnest(g.dietary) AS d(code)
      GROUP BY d.code
      ORDER BY count DESC, d.code
    `)
  ).rows;
}

export async function getResponses() {
  return db().query.rsvpResponses.findMany({
    orderBy: [desc(rsvpResponses.attending), asc(rsvpResponses.contactName)],
    with: { guests: { orderBy: asc(guests.sortOrder) } },
  });
}
