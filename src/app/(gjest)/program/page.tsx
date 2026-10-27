import Link from "next/link";
import { BUS_TRIPS, SCHEDULE, WEDDING } from "@/config/wedding";

export const metadata = { title: `Program – ${WEDDING.couple}` };

const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export default function ProgramPage() {
  return (
    <div className="space-y-10">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted">{WEDDING.dateLabel}</p>
        <h1 className="mt-2 text-5xl sm:text-6xl">Program</h1>
      </header>

      <ol className="relative mx-auto max-w-2xl space-y-6 before:absolute before:inset-y-3 before:left-[6rem] before:w-px before:bg-gold/40">
        {SCHEDULE.map((s) => (
          <li key={s.time + s.title} className="relative flex gap-8">
            <span className="w-20 shrink-0 pt-4 text-right font-serif text-xl text-gold sm:text-2xl">{s.time}</span>
            <span className="absolute left-[6rem] top-6 size-3 -translate-x-1/2 rounded-full bg-gold ring-4 ring-cream" />
            <div className="card flex-1 p-4">
              <h2 className="text-2xl">{s.title}</h2>
              {s.place && (
                <a className="text-sm text-sage-dark underline" href={mapsUrl(s.place)} target="_blank" rel="noreferrer">
                  {s.place} ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      <section className="card mx-auto max-w-2xl text-center">
        <h2 className="text-3xl">Buss</h2>
        <p className="mt-2 text-muted">
          {BUS_TRIPS.til.detail.charAt(0).toUpperCase() + BUS_TRIPS.til.detail.slice(1)}. Hjem: {BUS_TRIPS.hjem.detail}.
        </p>
        <Link href="/buss" className="btn mt-4">Velg sete på bussen</Link>
      </section>
    </div>
  );
}
