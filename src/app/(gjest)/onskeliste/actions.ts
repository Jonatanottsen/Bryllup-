"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { wishlistContributions, wishlistReservations } from "@/db/schema";
import { getDeviceId, requireGuest } from "@/lib/session";

export type WishResult = { error?: string; ok?: boolean };

const name = z.string().trim().min(2, "Skriv inn navnet ditt").max(80);

function done(): WishResult {
  revalidatePath("/onskeliste");
  revalidatePath("/admin/onskeliste");
  return { ok: true };
}

export async function reserveItem(itemId: string, guestName: string): Promise<WishResult> {
  await requireGuest();
  const parsed = z.object({ itemId: z.uuid(), name }).safeParse({ itemId, name: guestName });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const owner = await getDeviceId();

  // Betinget insert: lagres bare hvis det fortsatt er ledige eksemplarer.
  const res = await db().execute(sql`
    INSERT INTO wishlist_reservations (item_id, name, owner_id)
    SELECT i.id, ${parsed.data.name}, ${owner}
    FROM wishlist_items i
    WHERE i.id = ${parsed.data.itemId}
      AND i.kind = 'gave'
      AND (SELECT count(*) FROM wishlist_reservations r WHERE r.item_id = i.id) < i.quantity
    RETURNING id
  `);
  if (res.rows.length === 0) return { error: "Denne gaven er allerede reservert." };
  return done();
}

export async function cancelReservation(id: string): Promise<WishResult> {
  await requireGuest();
  if (!z.uuid().safeParse(id).success) return { error: "Ugyldig" };
  await db()
    .delete(wishlistReservations)
    .where(and(eq(wishlistReservations.id, id), eq(wishlistReservations.ownerId, await getDeviceId())));
  return done();
}

const ContributionSchema = z.object({
  itemId: z.uuid(),
  name,
  amountNok: z.coerce.number().int("Hele kroner").min(50, "Minst 50 kr").max(100_000),
  message: z.string().trim().max(500).optional(),
});

export async function contribute(input: z.input<typeof ContributionSchema>): Promise<WishResult> {
  await requireGuest();
  const parsed = ContributionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { itemId, message, ...rest } = parsed.data;
  const item = await db().query.wishlistItems.findFirst({ where: (t, { eq }) => eq(t.id, itemId) });
  if (item?.kind !== "spleis") return { error: "Fant ikke spleisen." };
  await db().insert(wishlistContributions).values({
    itemId,
    ...rest,
    message: message || null,
    ownerId: await getDeviceId(),
  });
  return done();
}

export async function deleteContribution(id: string): Promise<WishResult> {
  await requireGuest();
  if (!z.uuid().safeParse(id).success) return { error: "Ugyldig" };
  await db()
    .delete(wishlistContributions)
    .where(and(eq(wishlistContributions.id, id), eq(wishlistContributions.ownerId, await getDeviceId())));
  return done();
}
