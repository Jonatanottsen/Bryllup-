import Link from "next/link";
import { allergenLabel, BUS_RESERVED, BUS_SEAT_COUNT } from "@/config/wedding";
import { getDietarySummary, getStats } from "../queries";

function Stat({ label, value, href }: { label: string; value: string | number; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="font-serif text-5xl">{value}</p>
    </>
  );
  return href ? <Link href={href} className="card hover:shadow-md">{body}</Link> : <div className="card">{body}</div>;
}

export default async function AdminHome() {
  const [s, dietary] = await Promise.all([getStats(), getDietarySummary()]);
  return (
    <>
      <h1 className="text-5xl">Oversikt</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Gjester som kommer" value={s.attending_guests} href="/admin/gjester" />
        <Stat label="Kan ikke komme" value={s.declined_guests} href="/admin/gjester" />
        <Stat label="Svar mottatt" value={s.responses} href="/admin/gjester" />
        <Stat label="Taler / innslag" value={s.speeches} href="/admin/gjester#taler" />
        <Stat label="Buss til festen" value={`${s.bus_til}/${BUS_SEAT_COUNT - BUS_RESERVED.til.length}`} href="/admin/buss" />
        <Stat label="Buss hjem" value={`${s.bus_hjem}/${BUS_SEAT_COUNT - BUS_RESERVED.hjem.length}`} href="/admin/buss" />
        <Stat label="Gaver reservert" value={s.reserved} href="/admin/onskeliste" />
        <Stat label="Spleis registrert" value={`${s.raised.toLocaleString("nb-NO")} kr`} href="/admin/onskeliste" />
      </div>

      <section className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-3xl">Allergier og diett</h2>
          <a className="btn-outline" href="/admin/eksport/allergier">Last ned til kjøkkenet (CSV)</a>
        </div>
        {dietary.length === 0 ? (
          <p className="text-muted">Ingen registrert ennå.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-3">
            {dietary.map((d) => (
              <li key={d.code} className="flex justify-between rounded-lg bg-cream px-3 py-2">
                <span>{allergenLabel(d.code)}</span>
                <strong>{d.count}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
