import Link from "next/link";
import { BUS_TRIPS, PRACTICAL, WEDDING } from "@/config/wedding";

export default function PracticalPage() {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl">Praktisk informasjon</h1>
        <p className="mt-2 text-muted">Alt du trenger å vite. Se også <Link href="/program" className="underline">programmet</Link>.</p>
      </header>

      <section className="card">
        <h2 className="mb-4 text-3xl">Buss</h2>
        <ul className="space-y-2">
          <li><strong>{BUS_TRIPS.til.label}:</strong> {BUS_TRIPS.til.detail} ({WEDDING.church.address})</li>
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
              <strong>{c.role}:</strong> {c.name}
              {c.phone && (
                <>
                  {" · "}
                  <a className="underline" href={`tel:${c.phone}`}>{c.phone}</a>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
