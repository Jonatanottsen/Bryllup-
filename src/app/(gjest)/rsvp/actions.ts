"use server";

import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ALLERGEN_CODES } from "@/config/wedding";
import { db } from "@/db";
import { guests, rsvpResponses } from "@/db/schema";
import { RSVP_COOKIE } from "@/lib/auth";
import { requireGuest } from "@/lib/session";


const optionalText = z
  .string()
  .trim()
  .max(2000)
  .optional()
  .transform((v) => (v ? v : null));

const RsvpSchema = z
  .object({
    token: z.string().optional(),
    contactName: z.string().trim().min(2, "Skriv inn navnet ditt").max(120),
    email: z.email("Ugyldig e-postadresse").trim().toLowerCase(),
    phone: z
      .string()
      .trim()
      .regex(/^\+?[\d\s-]{8,16}$/, "Ugyldig telefonnummer"),
    attending: z.boolean(),
    speechWanted: z.boolean(),
    speechNote: optionalText,
    message: optionalText,
    guests: z
      .array(
        z.object({
          fullName: z.string().trim().min(2, "Alle personer må ha navn").max(120),
          dietary: z.array(z.enum(ALLERGEN_CODES as [string, ...string[]])).max(20),
          dietaryNotes: optionalText,
        }),
      )
      .min(1, "Legg til minst én person")
      .max(12),
  })
  .transform((v) => ({
    ...v,
    // Ikke lagre allergier/taler for de som ikke kommer
    speechWanted: v.attending && v.speechWanted,
    speechNote: v.attending && v.speechWanted ? v.speechNote : null,
    guests: v.guests.map((g) => (v.attending ? g : { ...g, dietary: [], dietaryNotes: null })),
  }));

export type RsvpState = { error?: string };

export async function submitRsvp(_: RsvpState, form: FormData): Promise<RsvpState> {
  await requireGuest();

  let raw: unknown;
  try {
    raw = JSON.parse(String(form.get("payload")));
  } catch {
    return { error: "Noe gikk galt med skjemaet. Prøv igjen." };
  }
  const parsed = RsvpSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Ugyldig skjema" };
  const data = parsed.data;

  const values = {
    contactName: data.contactName,
    email: data.email,
    phone: data.phone,
    attending: data.attending,
    speechWanted: data.speechWanted,
    speechNote: data.speechNote,
    message: data.message,
  };

  const existing = data.token
    ? await db().query.rsvpResponses.findFirst({
        where: eq(rsvpResponses.editToken, data.token),
        columns: { id: true, editToken: true },
      })
    : undefined;

  const responseId = existing?.id ?? crypto.randomUUID();
  const editToken = existing?.editToken ?? crypto.randomUUID().replace(/-/g, "");
  const guestRows = data.guests.map((g, i) => ({ ...g, responseId, sortOrder: i }));

  // neon-http batch kjøres som én transaksjon: alt eller ingenting.
  if (existing) {
    await db().batch([
      db().update(rsvpResponses).set({ ...values, updatedAt: new Date() }).where(eq(rsvpResponses.id, responseId)),
      db().delete(guests).where(eq(guests.responseId, responseId)),
      db().insert(guests).values(guestRows),
    ]);
  } else {
    await db().batch([
      db().insert(rsvpResponses).values({ id: responseId, editToken, ...values }),
      db().insert(guests).values(guestRows),
    ]);
  }

  (await cookies()).set(RSVP_COOKIE, editToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  redirect(`/rsvp?kode=${editToken}&takk=1`);
}
