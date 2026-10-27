"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import {
  busBookings,
  rsvpResponses,
  wishlistContributions,
  wishlistItems,
  wishlistReservations,
} from "@/db/schema";
import { endSession, requireAdmin } from "@/lib/session";

export async function logout() {
  await endSession();
  redirect("/login");
}

const id = z.uuid();

export async function deleteResponse(responseId: string) {
  await requireAdmin();
  await db().delete(rsvpResponses).where(eq(rsvpResponses.id, id.parse(responseId)));
  revalidatePath("/admin", "layout");
}

export async function deleteBooking(bookingId: string) {
  await requireAdmin();
  await db().delete(busBookings).where(eq(busBookings.id, id.parse(bookingId)));
  revalidatePath("/admin/buss");
  revalidatePath("/buss");
}

export async function deleteReservation(reservationId: string) {
  await requireAdmin();
  await db().delete(wishlistReservations).where(eq(wishlistReservations.id, id.parse(reservationId)));
  revalidatePath("/admin/onskeliste");
  revalidatePath("/onskeliste");
}

export async function deleteContributionAdmin(contributionId: string) {
  await requireAdmin();
  await db().delete(wishlistContributions).where(eq(wishlistContributions.id, id.parse(contributionId)));
  revalidatePath("/admin/onskeliste");
  revalidatePath("/onskeliste");
}

const optional = z
  .string()
  .trim()
  .transform((v) => v || null);
const optionalInt = z
  .string()
  .trim()
  .transform((v) => (v ? Number(v) : null))
  .pipe(z.number().int().min(0).nullable());

const WishSchema = z
  .object({
    id: z.union([z.uuid(), z.literal("")]),
    title: z.string().trim().min(1, "Tittel mangler").max(200),
    description: optional,
    url: optional.pipe(z.url("Ugyldig lenke").nullable()),
    imageUrl: optional.pipe(z.url("Ugyldig bildelenke").nullable()),
    priceNok: optionalInt,
    kind: z.enum(["gave", "spleis"]),
    goalNok: optionalInt,
    quantity: z.coerce.number().int().min(1).max(50),
    sortOrder: z.coerce.number().int().default(0),
  })
  .refine((v) => v.kind !== "spleis" || (v.goalNok ?? 0) > 0, {
    message: "Spleis må ha et mål (kr)",
  });

export type WishFormState = { error?: string; ok?: boolean };

export async function saveWishItem(_: WishFormState, form: FormData): Promise<WishFormState> {
  await requireAdmin();
  const parsed = WishSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const { id: itemId, ...values } = parsed.data;
  if (values.kind === "gave") values.goalNok = null;

  if (itemId) await db().update(wishlistItems).set(values).where(eq(wishlistItems.id, itemId));
  else await db().insert(wishlistItems).values(values);

  revalidatePath("/admin/onskeliste");
  revalidatePath("/onskeliste");
  return { ok: true };
}

export async function deleteWishItem(itemId: string) {
  await requireAdmin();
  await db().delete(wishlistItems).where(eq(wishlistItems.id, id.parse(itemId)));
  revalidatePath("/admin/onskeliste");
  revalidatePath("/onskeliste");
}
