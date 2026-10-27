import { asc, sql } from "drizzle-orm";
import { allergenLabel, BUS_STOPS, BUS_TRIPS } from "@/config/wedding";
import { db } from "@/db";
import { busBookings } from "@/db/schema";
import { getRole } from "@/lib/session";
import { getResponses } from "../../queries";

export const dynamic = "force-dynamic";

type Cell = string | number | boolean | null | undefined;

function toCsv(header: string[], rows: Cell[][]) {
  const esc = (v: Cell) => {
    let s = v == null ? "" : String(v);
    // Hindre formel-injeksjon i Excel, men la rene telefonnumre (+47 …) være
    if (/^[=@\t\r]/.test(s) || (/^[+-]/.test(s) && !/^[+-][\d\s-]*$/.test(s))) s = `'${s}`;
    return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // Semikolon + BOM = åpnes riktig i norsk Excel med æøå
  return "﻿" + [header, ...rows].map((r) => r.map(esc).join(";")).join("\r\n");
}

async function build(type: string) {
  switch (type) {
    case "gjester": {
      const responses = await getResponses();
      return toCsv(
        ["Navn", "Kommer", "Allergier/diett", "Kommentar allergi", "Kontaktperson", "E-post", "Telefon", "Tale/innslag", "Om innslaget", "Hilsen", "Svart"],
        responses.flatMap((r) =>
          r.guests.map((g) => [
            g.fullName,
            r.attending ? "Ja" : "Nei",
            g.dietary.map(allergenLabel).join(", "),
            g.dietaryNotes,
            r.contactName,
            r.email,
            r.phone,
            r.speechWanted ? "Ja" : "",
            r.speechNote,
            r.message,
            r.updatedAt.toISOString().slice(0, 10),
          ]),
        ),
      );
    }
    case "allergier": {
      const rows = (
        await db().execute<{ full_name: string; dietary: string[]; dietary_notes: string | null }>(sql`
          SELECT g.full_name, g.dietary, g.dietary_notes
          FROM guests g JOIN rsvp_responses r ON r.id = g.response_id
          WHERE r.attending AND (cardinality(g.dietary) > 0 OR coalesce(g.dietary_notes, '') <> '')
          ORDER BY g.full_name
        `)
      ).rows;
      return toCsv(
        ["Navn", "Allergier/diett", "Kommentar"],
        rows.map((r) => [r.full_name, r.dietary.map(allergenLabel).join(", "), r.dietary_notes]),
      );
    }
    case "buss": {
      const rows = await db().select().from(busBookings).orderBy(asc(busBookings.trip), asc(busBookings.stop), asc(busBookings.seat));
      return toCsv(
        ["Tur", "Stopp", "Sete", "Navn"],
        rows.map((r) => [BUS_TRIPS[r.trip].label, BUS_STOPS[r.stop].label, r.seat, r.passengerName]),
      );
    }
    case "onskeliste": {
      const items = await db().query.wishlistItems.findMany({ with: { reservations: true, contributions: true } });
      return toCsv(
        ["Gave", "Fra", "Beløp (kr)", "Hilsen"],
        items.flatMap((i) => [
          ...i.reservations.map((r) => [i.title, r.name, "", ""]),
          ...i.contributions.map((c) => [i.title, c.name, c.amountNok, c.message]),
        ]),
      );
    }
  }
  return null;
}

export async function GET(_: Request, { params }: { params: Promise<{ type: string }> }) {
  if ((await getRole()) !== "admin") return new Response("Ikke tilgang", { status: 401 });
  const { type } = await params;
  const csv = await build(type);
  if (csv === null) return new Response("Ukjent eksport", { status: 404 });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
