import { asc } from "drizzle-orm";
import { BUS_SEAT_COUNT, BUS_STOPS, WEDDING } from "@/config/wedding";
import { db } from "@/db";
import { busBookings } from "@/db/schema";
import { readDeviceId } from "@/lib/session";
import { BusMap, type SeatInfo } from "./BusMap";

export const dynamic = "force-dynamic";

export default async function BusPage() {
  const [rows, deviceId] = await Promise.all([
    db().select().from(busBookings).orderBy(asc(busBookings.seat)),
    readDeviceId(),
  ]);

  // Andre gjester ser bare fornavn; eieren ser hele navnet.
  const bookings: SeatInfo[] = rows.map((b) => {
    const mine = b.ownerId === deviceId;
    return {
      id: b.id,
      trip: b.trip,
      seat: b.seat,
      stop: b.stop,
      mine,
      name: mine ? b.passengerName : b.passengerName.split(" ")[0],
    };
  });

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl">Bussen</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          Bussen henter alle ved {WEDDING.church.name} rett etter vielsen og kjører til festen. Etter festen kjører den
          hjem via {Object.values(BUS_STOPS).map((s) => s.label).join(" og ")}. Velg sete for hver vei – sitt med dem du vil!
        </p>
      </header>
      <BusMap bookings={bookings} seatCount={BUS_SEAT_COUNT} />
    </div>
  );
}
