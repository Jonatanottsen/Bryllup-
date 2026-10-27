import { asc } from "drizzle-orm";
import { ConfirmButton } from "@/components/ConfirmButton";
import { BUS_RESERVED, BUS_SEAT_COUNT, BUS_STOPS, BUS_TRIPS } from "@/config/wedding";
import { db } from "@/db";
import { busBookings, type BusStop, type BusTrip } from "@/db/schema";
import { deleteBooking } from "../../actions";

export default async function BusAdmin() {
  const rows = await db().select().from(busBookings).orderBy(asc(busBookings.seat));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-5xl">Busslister</h1>
        <a className="btn-outline" href="/admin/eksport/buss">Eksporter (CSV)</a>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {(Object.keys(BUS_TRIPS) as BusTrip[]).map((trip) => {
          const tripRows = rows.filter((r) => r.trip === trip);
          return (
            <section key={trip} className="card">
              <h2 className="text-3xl">{BUS_TRIPS[trip].label}</h2>
              <p className="mb-4 text-sm text-muted">{tripRows.length} av {BUS_SEAT_COUNT - BUS_RESERVED[trip].length} seter booket · {BUS_TRIPS[trip].detail}</p>
              {BUS_RESERVED[trip].length > 0 && (
                <p className="mb-3 text-sm text-rose">
                  ♥ Holdt av: {BUS_RESERVED[trip].map((r) => `sete ${r.seat} ${r.name}`).join(", ")}
                </p>
              )}
              {(trip === "til" ? [null] : (Object.keys(BUS_STOPS) as BusStop[])).map((stop) => {
                const list = tripRows.filter((r) => r.stop === stop);
                return (
                  <div key={stop ?? "alle"} className="mb-4">
                    <h3 className="mb-1 text-xl">
                      {stop ? `Går av i ${BUS_STOPS[stop].label}` : "Passasjerer fra kirken"} ({list.length})
                    </h3>
                    <ul className="divide-y divide-black/5 text-sm">
                      {list.map((r) => (
                        <li key={r.id} className="flex items-center justify-between py-1.5">
                          <span><span className="inline-block w-14 text-muted">Sete {r.seat}</span>{r.passengerName}</span>
                          <ConfirmButton action={deleteBooking.bind(null, r.id)} confirm={`Fjerne ${r.passengerName} fra sete ${r.seat}?`}>Fjern</ConfirmButton>
                        </li>
                      ))}
                      {list.length === 0 && <li className="py-1.5 text-muted">Ingen</li>}
                    </ul>
                  </div>
                );
              })}
            </section>
          );
        })}
      </div>
    </>
  );
}
