"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { WishlistItem } from "@/db/schema";
import { saveWishItem } from "../../actions";

export function WishForm({ item, onDone }: { item?: WishlistItem; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveWishItem, {});
  const [kind, setKind] = useState(item?.kind ?? "gave");
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      if (!item) ref.current?.reset();
      onDone?.();
    }
  }, [state, item, onDone]);

  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <div className="sm:col-span-2">
        <label className="label">Tittel</label>
        <input name="title" className="input" required defaultValue={item?.title} />
      </div>
      <div className="sm:col-span-2">
        <label className="label">Beskrivelse</label>
        <textarea name="description" className="input" rows={2} defaultValue={item?.description ?? ""} />
      </div>
      <div>
        <label className="label">Lenke til produkt</label>
        <input name="url" type="url" className="input" defaultValue={item?.url ?? ""} />
      </div>
      <div>
        <label className="label">Bildelenke</label>
        <input name="imageUrl" type="url" className="input" defaultValue={item?.imageUrl ?? ""} />
      </div>
      <div>
        <label className="label">Type</label>
        <select name="kind" className="input" value={kind} onChange={(e) => setKind(e.target.value as "gave" | "spleis")}>
          <option value="gave">Gave (reserveres)</option>
          <option value="spleis">Spleis (bidrag mot mål)</option>
        </select>
      </div>
      {kind === "spleis" ? (
        <div>
          <label className="label">Mål for spleis (kr)</label>
          <input name="goalNok" type="number" min={1} className="input" required defaultValue={item?.goalNok ?? ""} />
          <input type="hidden" name="quantity" value="1" />
        </div>
      ) : (
        <div>
          <label className="label">Antall vi ønsker oss</label>
          <input name="quantity" type="number" min={1} className="input" defaultValue={item?.quantity ?? 1} />
          <input type="hidden" name="goalNok" value="" />
        </div>
      )}
      <div>
        <label className="label">Pris ca. (kr)</label>
        <input name="priceNok" type="number" min={0} className="input" defaultValue={item?.priceNok ?? ""} />
      </div>
      <div>
        <label className="label">Sortering (lavest først)</label>
        <input name="sortOrder" type="number" className="input" defaultValue={item?.sortOrder ?? 0} />
      </div>
      {state.error && <p className="error sm:col-span-2">{state.error}</p>}
      <button className="btn sm:col-span-2" disabled={pending}>{pending ? "Lagrer …" : item ? "Lagre endringer" : "Legg til ønske"}</button>
    </form>
  );
}

export function EditWish({ item }: { item: WishlistItem }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <div className="mt-3 rounded-xl bg-cream p-3">
      <WishForm item={item} onDone={() => setOpen(false)} />
      <button className="mt-2 text-sm underline" onClick={() => setOpen(false)}>Avbryt</button>
    </div>
  ) : (
    <button className="btn-outline px-3 py-1 text-xs" onClick={() => setOpen(true)}>Rediger</button>
  );
}
