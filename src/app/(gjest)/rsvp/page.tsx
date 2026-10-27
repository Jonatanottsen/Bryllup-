import { asc, eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { WEDDING } from "@/config/wedding";
import { db } from "@/db";
import { guests, rsvpResponses } from "@/db/schema";
import { RSVP_COOKIE } from "@/lib/auth";
import { RsvpForm, type RsvpInitial } from "./RsvpForm";

export const dynamic = "force-dynamic";

export default async function RsvpPage({
  searchParams,
}: {
  searchParams: Promise<{ kode?: string; takk?: string; ny?: string }>;
}) {
  const sp = await searchParams;
  const token = sp.ny ? undefined : sp.kode ?? (await cookies()).get(RSVP_COOKIE)?.value;

  const existing = token
    ? await db().query.rsvpResponses.findFirst({
        where: eq(rsvpResponses.editToken, token),
        with: { guests: { orderBy: asc(guests.sortOrder) } },
      })
    : undefined;

  const initial: RsvpInitial = existing
    ? {
        token: existing.editToken,
        contactName: existing.contactName,
        email: existing.email,
        phone: existing.phone,
        attending: existing.attending,
        speechWanted: existing.speechWanted,
        speechNote: existing.speechNote ?? "",
        message: existing.message ?? "",
        guests: existing.guests.map((g) => ({
          fullName: g.fullName,
          dietary: g.dietary,
          dietaryNotes: g.dietaryNotes ?? "",
        })),
      }
    : {
        contactName: "",
        email: "",
        phone: "",
        attending: null,
        speechWanted: false,
        speechNote: "",
        message: "",
        guests: [{ fullName: "", dietary: [], dietaryNotes: "" }],
      };

  const h = await headers();
  const editUrl = existing
    ? `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}/rsvp?kode=${existing.editToken}`
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="text-center">
        <h1 className="text-5xl">Svar på invitasjonen</h1>
        <p className="mt-2 text-muted">Vi setter pris på svar innen {WEDDING.rsvpDeadline}.</p>
      </header>

      {sp.takk && existing && (
        <div className="card space-y-2 border-sage/40 bg-sage-light">
          <h2 className="text-3xl">
            {existing.attending ? "Takk! Vi gleder oss til å se deg 💛" : "Takk for at du ga beskjed 💛"}
          </h2>
          <p className="text-sm">
            Du kan endre svaret ditt når som helst fra denne nettleseren, eller med denne lenken:
          </p>
          <p className="break-all rounded-lg bg-white p-2 font-mono text-xs">{editUrl}</p>
        </div>
      )}

      {existing && !sp.takk && (
        <p className="success">
          Du har allerede svart – her kan du endre svaret.{" "}
          <a href="/rsvp?ny=1" className="underline">Svare for noen andre?</a>
        </p>
      )}

      <RsvpForm key={existing?.id ?? "ny"} initial={initial} />
    </div>
  );
}
