"use client";

import { useState, useTransition } from "react";
import {
  cancelReservation,
  contribute,
  deleteContribution,
  reserveItem,
  stepDownAsOrganizer,
  volunteerToOrganize,
  type WishResult,
} from "./actions";

export type WishView = {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  imageUrl: string | null;
  priceNok: number | null;
  kind: "gave" | "spleis";
  quantity: number;
  goalNok: number | null;
  reservedCount: number;
  myReservations: { id: string; name: string }[];
  raisedNok: number;
  contributorCount: number;
  myContributions: { id: string; amountNok: number; willOrganize: boolean }[];
  organizer: { name: string; phone: string } | null;
  /** Kun satt for den som ordner gaven – trenger oversikt for å kreve inn. */
  contributors: { name: string; amountNok: number; message: string | null }[] | null;
};

const nok = (n: number) => `${n.toLocaleString("nb-NO")} kr`;
const NAME_KEY = "bryllup_navn";
const PHONE_KEY = "bryllup_tlf";
const stored = (key: string) => {
  try { return localStorage.getItem(key) ?? ""; } catch { return ""; }
};
const remember = (key: string, value: string) => {
  try { if (value.trim()) localStorage.setItem(key, value.trim()); } catch {}
};

export function WishCard({ item }: { item: WishView }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [organize, setOrganize] = useState(false);
  const [phone, setPhone] = useState("");
  const [volunteering, setVolunteering] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<WishResult>, after?: () => void) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        remember(NAME_KEY, name);
        remember(PHONE_KEY, phone);
        setOpen(false);
        after?.();
      }
    });
  };

  const openForm = () => {
    setName(stored(NAME_KEY));
    setPhone(stored(PHONE_KEY));
    setOrganize(false);
    setOpen(true);
  };

  const left = item.quantity - item.reservedCount;
  const goal = item.goalNok ?? 0;
  const pct = goal ? Math.min(100, Math.round((item.raisedNok / goal) * 100)) : 0;
  const funded = item.kind === "spleis" && goal > 0 && item.raisedNok >= goal;
  const soldOut = item.kind === "gave" && left <= 0;
  const iOrganize = item.myContributions.some((c) => c.willOrganize);

  return (
    <article className={`card flex flex-col gap-3 ${soldOut && item.myReservations.length === 0 ? "opacity-60" : ""}`}>
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- bilder fra vilkårlige nettbutikker
        <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
      )}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-2xl">{item.title}</h2>
        {item.kind === "spleis" && <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">Spleis</span>}
      </div>
      {item.description && <p className="text-sm text-muted">{item.description}</p>}
      <div className="flex flex-wrap gap-x-4 text-sm">
        {item.priceNok != null && <span>ca. {nok(item.priceNok)}</span>}
        {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-sage-dark underline">Se produktet ↗</a>}
      </div>

      <div className="mt-auto space-y-3">
        {item.kind === "gave" ? (
          <>
            <p className="text-sm">
              {soldOut ? "✓ Reservert" : item.quantity > 1 ? `${left} av ${item.quantity} ledige` : "Ledig"}
            </p>
            {item.myReservations.map((r) => (
              <p key={r.id} className="success flex items-center justify-between">
                Du har reservert denne ({r.name})
                <button className="btn-danger" disabled={pending} onClick={() => run(() => cancelReservation(r.id))}>Angre</button>
              </p>
            ))}
            {!soldOut && !open && <button className="btn w-full" onClick={openForm}>Jeg kjøper denne</button>}
          </>
        ) : (
          <>
            <div>
              <div className="h-3 overflow-hidden rounded-full bg-sage-light">
                <div className="h-full rounded-full bg-sage transition-all" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-sm">
                <strong>{nok(item.raisedNok)}</strong> av {nok(goal)} · {item.contributorCount} med i spleisen
                {funded && " · Fullfinansiert 🎉"}
              </p>
            </div>

            {/* Hvem ordner gaven? */}
            {iOrganize ? (
              <div className="rounded-lg bg-gold/10 p-3 text-sm">
                <p className="font-medium">🛍️ Du ordner denne gaven</p>
                <p className="mt-1 text-muted">De andre Vippser bidraget sitt til deg. Kjøp gaven når spleisen er klar.</p>
                {item.contributors && (
                  <ul className="mt-2 divide-y divide-black/5">
                    {item.contributors.map((c, i) => (
                      <li key={i} className="flex justify-between py-1">
                        <span>{c.name}{c.message && <em className="text-muted"> «{c.message}»</em>}</span>
                        <span>{nok(c.amountNok)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className="btn-danger mt-1 px-0"
                  disabled={pending}
                  onClick={() => run(() => stepDownAsOrganizer(item.myContributions.find((c) => c.willOrganize)!.id))}
                >
                  Jeg kan likevel ikke ordne gaven
                </button>
              </div>
            ) : item.organizer ? (
              <p className="rounded-lg bg-gold/10 p-3 text-sm">
                🛍️ <strong>{item.organizer.name}</strong> ordner gaven. Vipps bidraget ditt til{" "}
                <a className="font-medium underline" href={`tel:${item.organizer.phone}`}>{item.organizer.phone}</a>{" "}
                og merk betalingen med «{item.title}».
              </p>
            ) : (
              <p className="rounded-lg border border-dashed border-gold/50 p-3 text-sm text-muted">
                Ingen har tatt ansvar for å kjøpe gaven ennå. Vent med å Vippse til noen har meldt seg, eller meld deg selv!
              </p>
            )}

            {item.myContributions.map((c) => (
              <div key={c.id} className="success space-y-2">
                <p className="flex items-center justify-between">
                  Ditt bidrag: {nok(c.amountNok)}
                  <button className="btn-danger" disabled={pending} onClick={() => run(() => deleteContribution(c.id))}>Fjern</button>
                </p>
                {!item.organizer && !iOrganize &&
                  (volunteering === c.id ? (
                    <div className="flex gap-2">
                      <input className="input py-1" type="tel" placeholder="Ditt telefonnummer" value={phone} onChange={(e) => setPhone(e.target.value)} />
                      <button
                        className="btn shrink-0 px-3 py-1"
                        disabled={pending}
                        onClick={() => run(() => volunteerToOrganize(c.id, phone), () => setVolunteering(null))}
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <button className="text-sm underline" onClick={() => { setPhone(stored(PHONE_KEY)); setVolunteering(c.id); }}>
                      Jeg kan kjøpe og ordne gaven
                    </button>
                  ))}
              </div>
            ))}

            {!open && !funded && <button className="btn w-full" onClick={openForm}>Bli med på spleisen</button>}
          </>
        )}

        {open && (
          <div className="space-y-2 rounded-xl bg-cream p-3">
            <input className="input" placeholder="Ditt navn" value={name} onChange={(e) => setName(e.target.value)} />
            {item.kind === "spleis" && (
              <>
                <input className="input" type="number" inputMode="numeric" min={50} step={50} placeholder="Beløp i kr" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <input className="input" placeholder="Hilsen (valgfritt)" value={message} onChange={(e) => setMessage(e.target.value)} />
                {!item.organizer && !iOrganize && (
                  <>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" className="mt-0.5 size-4 accent-sage" checked={organize} onChange={(e) => setOrganize(e.target.checked)} />
                      Jeg kan kjøpe og ordne gaven. De andre Vippser til meg.
                    </label>
                    {organize && (
                      <input className="input" type="tel" placeholder="Telefonnummer (for Vipps)" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    )}
                  </>
                )}
              </>
            )}
            {error && <p className="error">{error}</p>}
            <div className="flex gap-2">
              <button className="btn-outline flex-1" type="button" onClick={() => setOpen(false)}>Avbryt</button>
              <button
                className="btn flex-1"
                disabled={pending}
                onClick={() =>
                  item.kind === "gave"
                    ? run(() => reserveItem(item.id, name))
                    : run(
                        () => contribute({ itemId: item.id, name, amountNok: amount, message, willOrganize: organize, phone }),
                        () => { setAmount(""); setMessage(""); },
                      )
                }
              >
                {pending ? "Lagrer …" : item.kind === "gave" ? "Reserver" : "Bli med"}
              </button>
            </div>
          </div>
        )}
        {error && !open && <p className="error">{error}</p>}
      </div>
    </article>
  );
}
