"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, isUniqueViolation } from "@/db";
import { wishlistContributions, wishlistReservations } from "@/db/schema";
import { getDeviceId, requireGuest } from "@/lib/session";

export type WishResult = { error?: string; ok?: boolean };

const name = z.string().trim().min(2, "Skriv inn navnet ditt").max(80);
const phone = z
  .string()
  .trim()
  .regex(/^\+?[\d\s-]{8,16}$/, "Skriv inn et gyldig telefonnummer (brukes til Vipps)");

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

const ContributionSchema = z
  .object({
    itemId: z.uuid(),
    name,
    amountNok: z.coerce.number().int("Hele kroner").min(50, "Minst 50 kr").max(100_000),
    message: z.string().trim().max(500).optional(),
    willOrganize: z.boolean().default(false),
    phone: z.string().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.willOrganize && !phone.safeParse(v.phone ?? "").success) {
      ctx.addIssue({ code: "custom", message: "Den som ordner gaven må oppgi telefonnummer (til Vipps)" });
    }
  });

export async function contribute(input: z.input<typeof ContributionSchema>): Promise<WishResult> {
  await requireGuest();
  const parsed = ContributionSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { itemId, message, willOrganize, phone: rawPhone, ...rest } = parsed.data;

  const item = await db().query.wishlistItems.findFirst({
    where: (t, { eq }) => eq(t.id, itemId),
    with: { contributions: { columns: { amountNok: true, willOrganize: true } } },
  });
  if (item?.kind !== "spleis") return { error: "Fant ikke spleisen." };
  const raised = item.contributions.reduce((s, c) => s + c.amountNok, 0);
  if (item.goalNok && raised >= item.goalNok) return { error: "Denne spleisen er allerede fullfinansiert 🎉" };
  // Bare én ansvarlig: kommer noen i forkjøpet, lagres bidraget uten ansvar.
  const organize = willOrganize && !item.contributions.some((c) => c.willOrganize);

  const row = {
    itemId,
    ...rest,
    message: message || null,
    willOrganize: organize,
    phone: willOrganize ? rawPhone!.trim() : null,
    ownerId: await getDeviceId(),
  };
  try {
    await db().insert(wishlistContributions).values(row);
  } catch (e) {
    if (!isUniqueViolation(e)) throw e;
    await db().insert(wishlistContributions).values({ ...row, willOrganize: false });
  }
  return done();
}

/** Et eksisterende bidrag melder seg som ansvarlig, hvis ingen andre er det. */
export async function volunteerToOrganize(contributionId: string, rawPhone: string): Promise<WishResult> {
  await requireGuest();
  const parsed = z.object({ id: z.uuid(), phone }).safeParse({ id: contributionId, phone: rawPhone });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const res = await db()
    .execute(sql`
    UPDATE wishlist_contributions c
    SET will_organize = true, phone = ${parsed.data.phone}
    WHERE c.id = ${parsed.data.id}
      AND c.owner_id = ${await getDeviceId()}
      AND NOT EXISTS (
        SELECT 1 FROM wishlist_contributions o
        WHERE o.item_id = c.item_id AND o.will_organize
      )
    RETURNING c.id
  `)
    .catch((e) => {
      if (isUniqueViolation(e)) return { rows: [] };
      throw e;
    });
  if (res.rows.length === 0) return { error: "Noen andre har allerede tatt ansvar for denne gaven." };
  return done();
}

export async function stepDownAsOrganizer(contributionId: string): Promise<WishResult> {
  await requireGuest();
  if (!z.uuid().safeParse(contributionId).success) return { error: "Ugyldig" };
  await db()
    .update(wishlistContributions)
    .set({ willOrganize: false })
    .where(and(eq(wishlistContributions.id, contributionId), eq(wishlistContributions.ownerId, await getDeviceId())));
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
