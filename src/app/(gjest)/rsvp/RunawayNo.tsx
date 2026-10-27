"use client";

import { useRef, useState } from "react";

// En spøk: «Nei»-knappen rømmer hver gang noen prøver å trykke på den, og kan
// aldri trykkes. Etter noen forsøk dukker en diskré «takk nei»-lenke opp
// øverst til høyre, så det fortsatt er mulig å svare nei.

const TEXTS = [
  "Dessverre, jeg/vi kan ikke",
  "Sikker? 🥺",
  "Nesten!",
  "Prøv igjen 😄",
  "Ikke i dag!",
  "Det blir kake …",
  "Og dans! 💃",
  "Neppe 😇",
  "Gi opp 😂",
  "Du er for treg!",
];

/** Antall forsøk før den ekte «takk nei»-lenken vises. */
const ESCAPE_AFTER = 4;
const MARGIN = 16;
const TOP_SAFE = 80; // under menyen

type Pos = { left: number; top: number };

export function RunawayNo({ onDecline }: { onDecline: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [tries, setTries] = useState(0);
  // Lukkes lenken, kommer den tilbake etter nye forsøk
  const [closedAt, setClosedAt] = useState<number | null>(null);

  const flee = (pointer?: { x: number; y: number }) => {
    const el = ref.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const maxX = Math.max(MARGIN, window.innerWidth - width - MARGIN);
    const maxY = Math.max(TOP_SAFE, window.innerHeight - height - MARGIN);
    // Finn et sted et godt stykke unna fingeren/musepekeren
    let next: Pos = { left: MARGIN, top: TOP_SAFE };
    for (let i = 0; i < 20; i++) {
      next = {
        left: MARGIN + Math.random() * (maxX - MARGIN),
        top: TOP_SAFE + Math.random() * (maxY - TOP_SAFE),
      };
      if (!pointer) break;
      const dx = next.left + width / 2 - pointer.x;
      const dy = next.top + height / 2 - pointer.y;
      if (Math.hypot(dx, dy) > 180) break;
    }
    setPos(next);
    setTries((t) => t + 1);
  };

  const label = TEXTS[tries % TEXTS.length];
  const showHatch = tries >= ESCAPE_AFTER && (closedAt === null || tries >= closedAt + ESCAPE_AFTER);

  return (
    <>
      {/* Holder plassen i rutenettet når knappen har stukket av */}
      {pos && <div aria-hidden className="hidden rounded-xl border-2 border-dashed border-black/10 sm:block" />}
      <button
        ref={ref}
        type="button"
        aria-label="Nei (denne knappen er litt sjenert – bruk lenken øverst til høyre)"
        onPointerEnter={(e) => e.pointerType === "mouse" && flee({ x: e.clientX, y: e.clientY })}
        onPointerDown={(e) => {
          e.preventDefault();
          flee({ x: e.clientX, y: e.clientY });
        }}
        onClick={(e) => {
          e.preventDefault();
          flee();
        }}
        style={pos ? { position: "fixed", left: pos.left, top: pos.top, zIndex: 40 } : undefined}
        className={`touch-none select-none rounded-xl border-2 border-black/10 bg-white p-4 text-left shadow-sm transition-[left,top] duration-200 ease-out ${pos ? "shadow-lg" : ""}`}
      >
        {label}
      </button>

      {showHatch && (
        <div className="fixed right-3 top-16 z-50 max-w-[15rem] animate-[fadein_0.6s_ease-out] rounded-xl border border-black/10 bg-white/95 p-3 text-xs shadow-lg backdrop-blur">
          <button
            type="button"
            aria-label="Lukk"
            className="absolute right-1.5 top-1 text-muted hover:text-ink"
            onClick={() => setClosedAt(tries)}
          >
            ×
          </button>
          <p className="pr-3 text-muted">Okei, okei … 😢</p>
          <button
            type="button"
            className="mt-1 font-medium text-rose underline"
            onClick={() => {
              setPos(null);
              setTries(0);
              onDecline();
            }}
          >
            Jeg kan dessverre ikke komme
          </button>
        </div>
      )}
    </>
  );
}
