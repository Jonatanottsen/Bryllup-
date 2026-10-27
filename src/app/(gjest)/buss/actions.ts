"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BUS_SEAT_COUNT } from "@/config/wedding";
import { db, isUniqueViolation } from "@/db";
import { busBookings, busStop, busTrip } from "@/db/schema";
import { getDeviceId, requireGuest } from "@/lib/session";

const BookingSchema = z.object({
  trip: z.enum(busTrip.enumValues),
  seat: z.coerce.number().int().min(1).max(BUS_SEAT_COUNT),
  passengerName: z.string().trim().min(2, "Skriv inn navn").max(80),
  stop: z.enum(busStop.enumValues, "Velg stopp"),
});

export type BusResult = { error?: string; ok?: boolean };

export async function bookSeat(input: z.input<typeof BookingSchema>): Promise<BusResult> {
  await requireGuest();
  const parsed = BookingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  try {
    await db().insert(busBookings).values({ ...parsed.data, ownerId: await getDeviceId() });
  } catch (e) {
    if (isUniqueViolation(e)) return { error: "Beklager, noen rakk å ta dette setet. Velg et annet." };
    throw e;
  }
  revalidatePath("/buss");
  return { ok: true };
}

export async function cancelSeat(id: string): Promise<BusResult> {
  await requireGuest();
  if (!z.uuid().safeParse(id).success) return { error: "Ugyldig booking" };
  await db()
    .delete(busBookings)
    .where(and(eq(busBookings.id, id), eq(busBookings.ownerId, await getDeviceId())));
  revalidatePath("/buss");
  return { ok: true };
}
