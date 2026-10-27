import Link from "next/link";
import { SCHEDULE, WEDDING } from "@/config/wedding";

export const dynamic = "force-dynamic";

const CARDS = [
  { href: "/rsvp", title: "Svar på invitasjonen", text: `Gi oss beskjed innen ${WEDDING.rsvpDeadline}, og fortell oss om allergier.` },
  { href: "/praktisk", title: "Praktisk informasjon", text: "Tider, steder, antrekk og alt du lurer på." },
  { href: "/buss", title: "Buss", text: "Velg plass på bussen fra kirken til festen – og hjem igjen til Raufoss eller Gjøvik." },
  { href: "/onskeliste", title: "Ønskeliste", text: "Reserver en gave, eller spleis på en gave sammen med andre." },
];

// Serverkomponent som rendres per forespørsel, så "nå" er trygt å lese her.
const daysUntilWedding = () => Math.ceil((WEDDING.date.getTime() - Date.now()) / 86_400_000);

export default function HomePage() {
  const days = daysUntilWedding();
  return (
    <div className="space-y-14">
      <section className="py-10 text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-muted">Vi gifter oss</p>
        <h1 className="my-4 text-6xl sm:text-8xl">{WEDDING.couple}</h1>
        <p className="text-xl text-gold">{WEDDING.dateLabel}</p>
        {days > 0 && (
          <p className="mt-6 text-muted">
            Bare <span className="font-serif text-3xl text-ink">{days}</span> dager igjen
          </p>
        )}
        <Link href="/rsvp" className="btn mt-8">Svar på invitasjonen</Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="card transition hover:-translate-y-0.5 hover:shadow-md">
            <h2 className="text-3xl">{c.title}</h2>
            <p className="mt-2 text-muted">{c.text}</p>
          </Link>
        ))}
      </section>

      <section className="card">
        <h2 className="mb-4 text-3xl">Dagen</h2>
        <ol className="space-y-3">
          {SCHEDULE.map((s) => (
            <li key={s.time + s.title} className="flex gap-4">
              <span className="w-20 shrink-0 font-medium text-gold">{s.time}</span>
              <span>
                {s.title}
                {s.place && <span className="text-muted"> · {s.place}</span>}
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
