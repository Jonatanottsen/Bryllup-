import Link from "next/link";
import { WEDDING } from "@/config/wedding";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { href: "/om-oss", title: "Om oss", text: "Historien om hvordan vi møttes – og alt som skjedde etterpå.", icon: "💛" },
  { href: "/program", title: "Program", text: "Fra vielsen i kirken til siste dans.", icon: "🕰️" },
  { href: "/praktisk", title: "Praktisk info", text: "Antrekk, overnatting og hvem du kan spørre.", icon: "📍" },
  { href: "/buss", title: "Buss", text: "Velg plass på bussen fra kirken – og hjem igjen.", icon: "🚌" },
  { href: "/onskeliste", title: "Ønskeliste", text: "Reserver en gave, eller spleis sammen med andre.", icon: "🎁" },
  { href: "/rsvp", title: "Svar", text: `Gi oss beskjed innen ${WEDDING.rsvpDeadline}.`, icon: "✉️" },
];

// Serverkomponent som rendres per forespørsel, så "nå" er trygt å lese her.
const daysUntilWedding = () => Math.ceil((WEDDING.date.getTime() - Date.now()) / 86_400_000);

export default function HomePage() {
  const days = daysUntilWedding();
  return (
    <div className="space-y-16">
      <section className="relative -mx-4 overflow-hidden px-4 py-16 text-center sm:py-24">
        {/* Dekorative sirkler i bakgrunnen */}
        <div aria-hidden className="pointer-events-none absolute left-10 top-10 size-56 rounded-full bg-sage-light/70 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute bottom-10 right-10 size-56 rounded-full bg-gold/15 blur-3xl" />

        <div className="relative">
          <p className="text-sm uppercase tracking-[0.4em] text-muted">Vi gifter oss</p>
          <h1 className="my-6 text-6xl leading-none sm:text-8xl md:text-9xl">
            Emilie
            <span className="block py-2 font-serif text-4xl italic text-gold sm:inline sm:px-6 sm:text-6xl">&amp;</span>
            Jonatan
          </h1>
          <div className="mx-auto my-6 h-px w-24 bg-gold/60" />
          <p className="text-xl">{WEDDING.dateLabel}</p>
          <p className="mt-1 text-muted">{WEDDING.church.name}</p>

          {days > 0 && (
            <p className="mt-8 text-muted">
              <span className="block font-serif text-6xl text-ink">{days}</span>
              dager igjen
            </p>
          )}

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/rsvp" className="btn px-7 py-3 text-base">Svar på invitasjonen</Link>
            <Link href="/program" className="btn-outline px-7 py-3 text-base">Se programmet</Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((c) => (
          <Link key={c.href} href={c.href} className="card group transition hover:-translate-y-0.5 hover:shadow-md">
            <span className="text-2xl" aria-hidden>{c.icon}</span>
            <h2 className="mt-2 text-3xl group-hover:text-sage-dark">{c.title}</h2>
            <p className="mt-1 text-muted">{c.text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
