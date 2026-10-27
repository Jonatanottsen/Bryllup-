"use client";

import { useEffect, useState, useTransition } from "react";
import { BUS_LAYOUT, BUS_STOPS, BUS_TRIPS } from "@/config/wedding";
import type { BusStop, BusTrip } from "@/db/schema";
import { bookSeat, cancelSeat } from "./actions";

export type SeatInfo = { id: string; trip: BusTrip; seat: number; name: string; stop: BusStop; mine: boolean };

const NAME_KEY = "bryllup_navn";

export function BusMap({ bookings, seatCount }: { bookings: SeatInfo[]; seatCount: number }) {
  const [trip, setTrip] = useState<BusTrip>("til");
  const [selected, setSelected] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [stop, setStop] = useState<BusStop | "">("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- leser lagret navn etter hydrering
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {}
  }, []);

  const taken = new Map(bookings.filter((b) => b.trip === trip).map((b) => [b.seat, b]));
  const mine = bookings.filter((b) => b.mine);
  const free = seatCount - taken.size;

  const book = () => {
    if (selected === null) return;
    setError(null);
    start(async () => {
      const res = await bookSeat({ trip, seat: selected, passengerName: name, stop: stop as BusStop });
      if (res.error) setError(res.error);
      else {
        try { localStorage.setItem(NAME_KEY, name.trim()); } catch {}
        setSelected(null);
      }
    });
  };

  const cancel = (id: string) => start(async () => { await cancelSeat(id); });

  const seat = (n: number) => {
    const b = taken.get(n);
    const isSel = selected === n;
    const cls = b
      ? b.mine
        ? "bg-gold text-white border-gold"
        : "bg-black/10 text-muted border-transparent cursor-not-allowed"
      : isSel
        ? "bg-sage text-white border-sage scale-105"
        : "bg-white border-sage/40 hover:border-sage hover:bg-sage-light";
    return (
      <button
        key={n}
        type="button"
        disabled={!!b}
        onClick={() => { setSelected(isSel ? null : n); setError(null); }}
        title={b ? `${b.name} (${BUS_STOPS[b.stop].label})` : `Sete ${n} – ledig`}
        aria-label={b ? `Sete ${n}, opptatt av ${b.name}` : `Sete ${n}, ledig`}
        className={`flex h-12 w-full flex-col items-center justify-center rounded-t-xl rounded-b-md border-2 text-[10px] leading-tight transition ${cls}`}
      >
        <span className="font-semibold">{n}</span>
        {b && <span className="max-w-full truncate px-0.5">{b.name}</span>}
      </button>
    );
  };

  const rows = Array.from({ length: BUS_LAYOUT.rows }, (_, r) => r * 4);
  const backStart = BUS_LAYOUT.rows * 4;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div>
        <div className="mb-4 flex gap-2">
          {(Object.keys(BUS_TRIPS) as BusTrip[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTrip(t); setSelected(null); setError(null); }}
              className={`flex-1 rounded-xl border-2 p-3 text-left transition ${trip === t ? "border-sage bg-sage-light" : "border-black/10 bg-white"}`}
            >
              <div className="font-medium">{BUS_TRIPS[t].label}</div>
              <div className="text-xs text-muted">{BUS_TRIPS[t].detail}</div>
            </button>
          ))}
        </div>

        {/* Bussen sett ovenfra, fronten øverst */}
        <div className="mx-auto max-w-sm rounded-[2.5rem] border-4 border-ink/70 bg-cream p-4 shadow-inner">
          <div className="mb-4 flex items-center justify-between border-b-2 border-dashed border-ink/20 pb-3 text-xs text-muted">
            <div className="flex size-12 items-center justify-center rounded-full border-2 border-ink/40">🛞</div>
            <span>Sjåfør</span>
            <span className="rounded bg-ink/10 px-2 py-1">Dør ▸</span>
          </div>
          <div className="space-y-2">
            {rows.map((base) => (
              <div key={base} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_0.5fr_minmax(0,1fr)_minmax(0,1fr)] gap-1.5">
                {seat(base + 1)}
                {seat(base + 2)}
                <div />
                {seat(base + 3)}
                {seat(base + 4)}
              </div>
            ))}
            <div className="grid gap-1.5 pt-1" style={{ gridTemplateColumns: `repeat(${BUS_LAYOUT.backRowSeats}, minmax(0, 1fr))` }}>
              {Array.from({ length: BUS_LAYOUT.backRowSeats }, (_, i) => seat(backStart + i + 1))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-muted">
          <span className="flex items-center gap-1"><span className="size-3 rounded border-2 border-sage/40 bg-white" /> Ledig</span>
          <span className="flex items-center gap-1"><span className="size-3 rounded bg-sage" /> Valgt</span>
          <span className="flex items-center gap-1"><span className="size-3 rounded bg-gold" /> Dine seter</span>
          <span className="flex items-center gap-1"><span className="size-3 rounded bg-black/10" /> Opptatt</span>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="card">
          <p className="text-sm text-muted">{BUS_TRIPS[trip].label}</p>
          <p className="font-serif text-4xl">{free} <span className="text-lg">ledige seter</span></p>
        </div>

        <div className="card space-y-3">
          {selected === null ? (
            <p className="text-muted">Trykk på et ledig sete for å velge det. Du kan booke flere seter, f.eks. til hele familien.</p>
          ) : (
            <>
              <h2 className="text-2xl">Sete {selected} – {BUS_TRIPS[trip].label.toLowerCase()}</h2>
              <div>
                <label className="label" htmlFor="pname">Navn på passasjer</label>
                <input id="pname" className="input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <p className="label">{trip === "til" ? "Hvor går du på?" : "Hvor går du av?"}</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(BUS_STOPS) as BusStop[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStop(s)}
                      className={`rounded-lg border-2 p-2 text-sm ${stop === s ? "border-sage bg-sage-light" : "border-black/10"}`}
                    >
                      {BUS_STOPS[s].label}
                    </button>
                  ))}
                </div>
                {stop && trip === "til" && <p className="mt-2 text-xs text-muted">Henting: {BUS_STOPS[stop].pickup}</p>}
              </div>
              {error && <p className="error">{error}</p>}
              <button className="btn w-full" disabled={pending || name.trim().length < 2 || !stop} onClick={book}>
                {pending ? "Booker …" : "Book sete"}
              </button>
            </>
          )}
        </div>

        {mine.length > 0 && (
          <div className="card">
            <h2 className="mb-3 text-2xl">Dine seter</h2>
            <ul className="space-y-2 text-sm">
              {mine.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2">
                  <span>
                    <strong>{BUS_TRIPS[b.trip].label}:</strong> sete {b.seat} · {b.name} · {BUS_STOPS[b.stop].label}
                  </span>
                  <button className="btn-danger" disabled={pending} onClick={() => cancel(b.id)}>Avbestill</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
