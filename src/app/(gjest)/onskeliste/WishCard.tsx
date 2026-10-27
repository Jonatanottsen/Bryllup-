"use client";

import { useState, useTransition } from "react";
import { cancelReservation, contribute, deleteContribution, reserveItem, type WishResult } from "./actions";

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
  myContributions: { id: string; amountNok: number }[];
};

const nok = (n: number) => `${n.toLocaleString("nb-NO")} kr`;
const NAME_KEY = "bryllup_navn";
const storedName = () => {
  try { return localStorage.getItem(NAME_KEY) ?? ""; } catch { return ""; }
};

export function WishCard({ item, vipps }: { item: WishView; vipps: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [thanks, setThanks] = useState(false);
  const [pending, start] = useTransition();

  const run = (fn: () => Promise<WishResult>, after?: () => void) => {
    setError(null);
    start(async () => {
      const res = await fn();
      if (res.error) setError(res.error);
      else {
        try { if (name.trim()) localStorage.setItem(NAME_KEY, name.trim()); } catch {}
        setOpen(false);
        after?.();
      }
    });
  };

  const openForm = () => { setName(storedName()); setOpen(true); setThanks(false); };
  const left = item.quantity - item.reservedCount;
  const pct = item.goalNok ? Math.min(100, Math.round((item.raisedNok / item.goalNok) * 100)) : 0;
  const soldOut = item.kind === "gave" && left <= 0;

  return (
    <article className={`card flex flex-col gap-3 ${soldOut && item.myReservations.length === 0 ? "opacity-60" : ""}`}>
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- bilder fra vilkårlige nettbutikker
        <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full rounded-xl object-cover" />
      )}
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-2xl">{item.title}</h2>
        {item.kind === "spleis" && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">Spleis</span>}
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
                <strong>{nok(item.raisedNok)}</strong> av {nok(item.goalNok ?? 0)} · {item.contributorCount} bidragsytere
              </p>
            </div>
            {item.myContributions.map((c) => (
              <p key={c.id} className="success flex items-center justify-between">
                Du har bidratt med {nok(c.amountNok)}
                <button className="btn-danger" disabled={pending} onClick={() => run(() => deleteContribution(c.id))}>Fjern</button>
              </p>
            ))}
            {thanks && (
              <p className="rounded-lg bg-gold/10 p-3 text-sm">
                Tusen takk! 💛 Vipps beløpet til <strong>{vipps}</strong> og merk betalingen med «{item.title}».
              </p>
            )}
            {!open && <button className="btn w-full" onClick={openForm}>Bli med på spleisen</button>}
          </>
        )}

        {open && (
          <div className="space-y-2 rounded-xl bg-cream p-3">
            <input className="input" placeholder="Ditt navn" value={name} onChange={(e) => setName(e.target.value)} />
            {item.kind === "spleis" && (
              <>
                <input className="input" type="number" inputMode="numeric" min={50} step={50} placeholder="Beløp i kr" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <input className="input" placeholder="Hilsen (valgfritt)" value={message} onChange={(e) => setMessage(e.target.value)} />
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
                    : run(() => contribute({ itemId: item.id, name, amountNok: amount, message }), () => {
                        setThanks(true);
                        setAmount("");
                        setMessage("");
                      })
                }
              >
                {pending ? "Lagrer …" : item.kind === "gave" ? "Reserver" : "Registrer bidrag"}
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
