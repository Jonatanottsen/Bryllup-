import Link from "next/link";
import { BUS_STOPS, BUS_TRIPS, PRACTICAL, SCHEDULE, WEDDING } from "@/config/wedding";

export default function PracticalPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl">Praktisk informasjon</h1>
        <p className="mt-2 text-muted">{WEDDING.dateLabel}</p>
      </header>

      <section className="card">
        <h2 className="mb-4 text-3xl">Program</h2>
        <ol className="space-y-3">
          {SCHEDULE.map((s) => (
            <li key={s.time + s.title} className="flex gap-4">
              <span className="w-14 shrink-0 font-medium text-gold">{s.time}</span>
              <span>
                {s.title}
                {s.place && (
                  <>
                    {" · "}
                    <a
                      className="text-sage-dark underline"
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.place)}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.place}
                    </a>
                  </>
                )}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2 className="mb-4 text-3xl">Buss</h2>
        <ul className="space-y-2">
          {Object.values(BUS_STOPS).map((s) => (
            <li key={s.label}><strong>{s.label}:</strong> {s.pickup}</li>
          ))}
          <li><strong>{BUS_TRIPS.hjem.label}:</strong> {BUS_TRIPS.hjem.detail}</li>
        </ul>
        <Link href="/buss" className="btn mt-4">Velg sete på bussen</Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {PRACTICAL.map((p) => (
          <section key={p.title} className="card">
            <h2 className="mb-2 text-2xl">{p.title}</h2>
            <p className="whitespace-pre-line text-muted">{p.body}</p>
          </section>
        ))}
      </div>

      <section className="card">
        <h2 className="mb-4 text-3xl">Kontakt</h2>
        <ul className="space-y-2">
          {WEDDING.contact.map((c) => (
            <li key={c.role}>
              <strong>{c.role}:</strong> {c.name} · <a className="underline" href={`tel:${c.phone}`}>{c.phone}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
