"use client";

import { useEffect, useState } from "react";

// Første besøk: en lukket konvolutt med voksegl. Trykk på seglet →
// seglet brekker, klaffen åpnes og invitasjonskortet glir opp. Deretter
// vises selve kortet med innloggingen (children).

type Stage = "closed" | "seal" | "flap" | "card" | "open";

const SEEN_KEY = "bryllup_konvolutt_apnet";
// Varighet (ms) for hvert steg i animasjonen
const STEPS: [Stage, number][] = [
  ["seal", 0],
  ["flap", 450],
  ["card", 1100],
  ["open", 2300],
];

export function Envelope({
  initials,
  couple,
  dateLabel,
  children,
}: {
  initials: string;
  couple: string;
  dateLabel: string;
  children: React.ReactNode;
}) {
  const [stage, setStage] = useState<Stage>("closed");

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- husker at konvolutten er åpnet før
      if (localStorage.getItem(SEEN_KEY)) setStage("open");
    } catch {}
  }, []);

  const open = () => {
    if (stage !== "closed") return;
    try { localStorage.setItem(SEEN_KEY, "1"); } catch {}
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("open");
      return;
    }
    for (const [s, ms] of STEPS) setTimeout(() => setStage(s), ms);
  };

  if (stage === "open") {
    return <div className="w-full max-w-sm animate-[fadein_0.7s_ease-out]">{children}</div>;
  }

  const sealBroken = stage !== "closed";
  const flapOpen = stage === "flap" || stage === "card";
  const cardOut = stage === "card";

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div
        className="relative aspect-[4/3] w-[min(88vw,26rem)] [perspective:1200px]"
        style={{ marginTop: cardOut ? "8rem" : 0, transition: "margin-top 0.9s ease-out" }}
      >
        {/* Baksiden av konvolutten */}
        <div className="absolute inset-0 rounded-md bg-[#e8dcc8] shadow-xl" />

        {/* Invitasjonskortet inni */}
        <div
          className="absolute inset-x-[6%] bottom-[4%] top-[8%] flex flex-col items-center justify-center rounded-sm bg-paper px-4 text-center shadow-md transition-transform duration-[1100ms] ease-out"
          style={{ transform: cardOut ? "translateY(-62%)" : "translateY(0)", zIndex: 2 }}
        >
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted">Du er invitert til bryllupet til</p>
          <p className="my-2 font-serif text-4xl leading-tight">{couple}</p>
          <div className="my-1 h-px w-12 bg-gold/60" />
          <p className="text-sm text-gold">{dateLabel}</p>
        </div>

        {/* Forsiden (lommen) – dekker nedre del av kortet */}
        <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }} aria-hidden>
          <path d="M0 0 L200 165 L400 0 L400 300 L0 300 Z" fill="#f3ebdd" />
          <path d="M0 300 L200 150 L400 300" fill="none" stroke="#d9cab1" strokeWidth="1.5" />
          <path d="M0 0 L200 165 L400 0" fill="none" stroke="#e2d5bf" strokeWidth="1" />
        </svg>

        {/* Klaffen */}
        <div
          className="absolute inset-x-0 top-0 h-[56%] origin-top transition-transform duration-[650ms] ease-in-out [transform-style:preserve-3d]"
          style={{
            transform: flapOpen ? "rotateX(180deg)" : "rotateX(0deg)",
            zIndex: cardOut ? 1 : 4,
          }}
        >
          <svg viewBox="0 0 400 168" preserveAspectRatio="none" className="h-full w-full drop-shadow-sm" aria-hidden>
            <path d="M0 0 L400 0 L200 168 Z" fill="#efe4d2" stroke="#d9cab1" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Voksseglet */}
        <button
          type="button"
          onClick={open}
          aria-label="Åpne invitasjonen"
          className="group absolute left-1/2 top-[56%] size-24 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-gold/50 sm:size-28"
          style={{ zIndex: 5 }}
          disabled={sealBroken}
        >
          <WaxSeal initials={initials} broken={sealBroken} />
        </button>
      </div>

      <p
        className="animate-pulse text-sm tracking-wide text-muted transition-opacity"
        style={{ opacity: sealBroken ? 0 : 1 }}
      >
        Trykk på seglet for å åpne invitasjonen
      </p>
    </div>
  );
}

function WaxSeal({ initials, broken }: { initials: string; broken: boolean }) {
  // To halvdeler som sprekker fra hverandre når seglet brytes. Venstre halvdel
  // overlapper høyre litt og tegnes øverst, så skjøten ikke synes før det brytes.
  const half = (side: "l" | "r") => (
    <svg
      viewBox="0 0 120 120"
      className="absolute inset-0 h-full w-full transition-all duration-500 ease-out"
      style={{
        clipPath: side === "l" ? "polygon(0 0, 57% 0, 49% 45%, 59% 60%, 50% 100%, 0 100%)" : "polygon(54% 0, 100% 0, 100% 100%, 47% 100%, 56% 60%, 46% 45%)",
        transform: broken ? `translate(${side === "l" ? -14 : 14}px, 18px) rotate(${side === "l" ? -18 : 18}deg)` : "none",
        opacity: broken ? 0 : 1,
      }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`wax-${side}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#b8323f" />
          <stop offset="60%" stopColor="#8e1f2c" />
          <stop offset="100%" stopColor="#5f1119" />
        </radialGradient>
      </defs>
      {/* Ujevn kant som rennende voks */}
      <path
        d="M60 4 C72 3 78 10 88 12 C99 15 104 24 110 33 C116 43 113 52 116 62 C118 74 110 81 106 91 C101 102 91 104 81 110 C71 116 63 113 53 116 C41 118 35 110 25 105 C15 99 12 90 7 80 C2 69 6 60 4 50 C3 38 11 32 17 22 C24 12 33 11 43 6 C49 4 54 4 60 4 Z"
        fill={`url(#wax-${side})`}
      />
      <circle cx="60" cy="60" r="38" fill="none" stroke="#5f1119" strokeOpacity="0.55" strokeWidth="3" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="#d4636c" strokeOpacity="0.35" strokeWidth="1" />
      <text
        x="60"
        y="69"
        textAnchor="middle"
        fontSize="28"
        fontStyle="italic"
        fill="#5f1119"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {initials}
      </text>
      <text
        x="59.2"
        y="68"
        textAnchor="middle"
        fontSize="28"
        fontStyle="italic"
        fill="#eba8ad"
        fillOpacity="0.75"
        style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}
      >
        {initials}
      </text>
    </svg>
  );
  return (
    <span className="relative block h-full w-full drop-shadow-[0_4px_6px_rgba(60,10,15,0.35)] transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
      {half("r")}
      {half("l")}
    </span>
  );
}
