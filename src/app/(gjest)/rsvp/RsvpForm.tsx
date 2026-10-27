"use client";

import { useActionState, useState } from "react";
import { ALLERGENS } from "@/config/wedding";
import { submitRsvp } from "./actions";
import { RunawayNo } from "./RunawayNo";

type Guest = { fullName: string; dietary: string[]; dietaryNotes: string };
export type RsvpInitial = {
  token?: string;
  contactName: string;
  email: string;
  phone: string;
  attending: boolean | null;
  speechWanted: boolean;
  speechNote: string;
  message: string;
  guests: Guest[];
};

const emptyGuest = (): Guest => ({ fullName: "", dietary: [], dietaryNotes: "" });

export function RsvpForm({ initial }: { initial: RsvpInitial }) {
  const [state, formAction, pending] = useActionState(submitRsvp, {});
  const [f, setF] = useState(initial);
  const [noKey, setNoKey] = useState(0);
  const set = <K extends keyof RsvpInitial>(k: K, v: RsvpInitial[K]) => setF((p) => ({ ...p, [k]: v }));
  const setGuest = (i: number, g: Partial<Guest>) =>
    set("guests", f.guests.map((x, j) => (j === i ? { ...x, ...g } : x)));

  // Første person følger kontaktnavnet til man endrer den selv
  const onContactName = (v: string) => {
    const g = [...f.guests];
    if (g[0] && (g[0].fullName === "" || g[0].fullName === f.contactName)) g[0] = { ...g[0], fullName: v };
    setF((p) => ({ ...p, contactName: v, guests: g }));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="payload" value={JSON.stringify(f)} />

      <fieldset className="card space-y-4">
        <legend className="sr-only">Kontaktinformasjon</legend>
        <h2 className="text-2xl">Kontaktinformasjon</h2>
        <div>
          <label className="label" htmlFor="contactName">Navn</label>
          <input id="contactName" className="input" required value={f.contactName} onChange={(e) => onContactName(e.target.value)} autoComplete="name" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="email">E-post</label>
            <input id="email" type="email" className="input" required value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Telefon</label>
            <input id="phone" type="tel" className="input" required value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          </div>
        </div>
      </fieldset>

      <fieldset className="card">
        <h2 className="mb-4 text-2xl">Kommer du?</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              set("attending", true);
              setNoKey((k) => k + 1); // sender en rømt nei-knapp hjem igjen
            }}
            className={`rounded-xl border-2 p-4 text-left transition ${f.attending === true ? "border-sage bg-sage-light" : "border-black/10 hover:border-sage/50"}`}
          >
            Ja, jeg/vi kommer! 🥂
          </button>
          {f.attending === false ? (
            <div className="rounded-xl border-2 border-sage bg-sage-light p-4">
              Dessverre, jeg/vi kan ikke 😢
            </div>
          ) : (
            <RunawayNo key={noKey} onDecline={() => set("attending", false)} />
          )}
        </div>
      </fieldset>

      {f.attending !== null && (
        <fieldset className="card space-y-5">
          <h2 className="text-2xl">{f.attending ? "Hvem kommer?" : "Hvem svarer du for?"}</h2>
          <p className="text-sm text-muted">Legg til alle i følget ditt (partner, barn) med fullt navn.</p>
          {f.guests.map((g, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-black/10 p-4">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="label" htmlFor={`g${i}`}>Person {i + 1}</label>
                  <input id={`g${i}`} className="input" required placeholder="Fullt navn" value={g.fullName} onChange={(e) => setGuest(i, { fullName: e.target.value })} />
                </div>
                {f.guests.length > 1 && (
                  <button type="button" className="btn-danger mb-1" onClick={() => set("guests", f.guests.filter((_, j) => j !== i))}>
                    Fjern
                  </button>
                )}
              </div>
              {f.attending && (
                <>
                  <p className="text-sm font-medium">Allergier og diett</p>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGENS.map((a) => {
                      const on = g.dietary.includes(a.code);
                      return (
                        <button
                          type="button"
                          key={a.code}
                          aria-pressed={on}
                          onClick={() => setGuest(i, { dietary: on ? g.dietary.filter((d) => d !== a.code) : [...g.dietary, a.code] })}
                          className={`rounded-full border px-3 py-1 text-sm transition ${on ? "border-sage bg-sage text-white" : "border-black/15 hover:border-sage"}`}
                        >
                          {a.label}
                        </button>
                      );
                    })}
                  </div>
                  <input className="input" placeholder="Annet / kommentar (f.eks. alvorlig nøtteallergi)" value={g.dietaryNotes} onChange={(e) => setGuest(i, { dietaryNotes: e.target.value })} />
                </>
              )}
            </div>
          ))}
          {f.guests.length < 12 && (
            <button type="button" className="btn-outline" onClick={() => set("guests", [...f.guests, emptyGuest()])}>
              + Legg til person
            </button>
          )}
        </fieldset>
      )}

      {f.attending && (
        <fieldset className="card space-y-3">
          <h2 className="text-2xl">Tale eller innslag</h2>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="size-5 accent-sage" checked={f.speechWanted} onChange={(e) => set("speechWanted", e.target.checked)} />
            Jeg/vi ønsker å holde tale eller ha et innslag
          </label>
          {f.speechWanted && (
            <textarea className="input" rows={2} placeholder="Hvem, og hva slags innslag? Ca. hvor lenge?" value={f.speechNote} onChange={(e) => set("speechNote", e.target.value)} />
          )}
        </fieldset>
      )}

      {f.attending !== null && (
        <fieldset className="card space-y-3">
          <label className="label text-2xl font-serif" htmlFor="message">Hilsen til brudeparet (valgfritt)</label>
          <textarea id="message" className="input" rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} />
        </fieldset>
      )}

      {state.error && <p className="error">{state.error}</p>}
      <button className="btn w-full py-3 text-base" disabled={pending || f.attending === null}>
        {pending ? "Sender …" : f.token ? "Oppdater svaret" : "Send svar"}
      </button>
    </form>
  );
}
