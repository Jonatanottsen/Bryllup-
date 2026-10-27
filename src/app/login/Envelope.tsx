"use client";

import { useEffect, useState } from "react";

// Første besøk: hele skjermen er en forseglet konvolutt i håndlaget papir.
// Trykk på seglet → seglet brekker, klaffen åpnes, invitasjonskortet glir opp,
// og deretter vises selve innloggingen (children) på papirbakgrunnen.

type Stage = "closed" | "seal" | "flap" | "card" | "fade" | "open";

const SEEN_KEY = "bryllup_konvolutt_apnet";
const STEPS: [Stage, number][] = [
  ["seal", 0],
  ["flap", 500],
  ["card", 1300],
  ["fade", 2700],
  ["open", 3400],
];

/** Papirstruktur: fraktal støy belyst skrått, som en flis som kan gjentas. */
function paper(light: string, elevation = 70, scale = 1.3) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='p' x='0' y='0' width='100%' height='100%'><feTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='5' seed='11' stitchTiles='stitch'/><feDiffuseLighting lighting-color='${light}' surfaceScale='${scale}'><feDistantLight azimuth='225' elevation='${elevation}'/></feDiffuseLighting></filter><rect width='100%' height='100%' filter='url(#p)'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

const PAPER = {
  inside: paper("#eadbcb", 68),
  body: paper("#f8ebdf"),
  side: paper("#f6e8dc"),
  flap: paper("#fbefe4", 72),
};

// Konvoluttens geometri i prosent av skjermen: en bred, flat toppklaff som
// møtes ved seglet, og sidebrett som starter et stykke ned på kanten.
const TIP_Y = 52; // klaffens spiss (der seglet sitter)
const FLAP_EDGE_Y = 27; // der klaffen treffer sidekantene
const SIDE_LOW_Y = 78; // der sidebrettene treffer sidekantene nederst
const BOTTOM_EDGE_Y = 72; // der bunnbrettet treffer sidekantene

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

  const sealBroken = stage !== "closed";
  const flapOpen = stage === "flap" || stage === "card" || stage === "fade";
  const cardOut = stage === "card" || stage === "fade";
  const fading = stage === "fade";

  return (
    <>
      {/* Papirbakgrunn – blir liggende bak innloggingen */}
      <div aria-hidden className="fixed inset-0 -z-10" style={{ backgroundImage: PAPER.inside, backgroundColor: "#e6d7c7" }} />

      {stage === "open" ? (
        <div className="relative w-full max-w-sm animate-[fadein_0.8s_ease-out]">{children}</div>
      ) : (
        <div
          className="fixed inset-0 z-10 overflow-hidden [perspective:1600px]"
          style={{ opacity: fading ? 0 : 1, transition: "opacity 0.7s ease-in" }}
        >
          {/* Invitasjonskortet ligger inni konvolutten */}
          <div
            className="absolute left-1/2 top-0 flex w-[min(80vw,22rem)] flex-col items-center rounded-[3px] px-6 py-10 text-center shadow-[0_10px_30px_rgba(90,60,40,0.18)]"
            style={{
              backgroundColor: "#fdfaf6",
              // Starter skjult bak lommen, glir opp i åpningen under klaffen
              transform: `translate(-50%, ${cardOut ? "12dvh" : `${TIP_Y + 8}dvh`})`,
              transition: "transform 1.3s cubic-bezier(.2,.7,.2,1)",
              zIndex: 2,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9a8a7c]">Du er invitert til bryllupet til</p>
            <p className="my-4 font-serif text-4xl leading-tight text-[#3d3530]">{couple}</p>
            <div className="h-px w-10 bg-[#b8955a]/60" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-[#9a8a7c]">{dateLabel}</p>
          </div>

          {/* Sidebrett og bunnbrett – med svak skygge langs kantene (preget papir) */}
          <Fold z={3} clip={`polygon(0 ${FLAP_EDGE_Y - 1}%, 52% ${TIP_Y + 2}%, 0 ${SIDE_LOW_Y}%)`} bg={PAPER.side} shadow="drop-shadow(1px 0 1.5px rgba(120,90,70,0.22))" />
          <Fold z={3} clip={`polygon(100% ${FLAP_EDGE_Y - 1}%, 48% ${TIP_Y + 2}%, 100% ${SIDE_LOW_Y}%)`} bg={PAPER.side} shadow="drop-shadow(-1px 0 1.5px rgba(120,90,70,0.22))" />
          <Fold z={4} clip={`polygon(0 ${BOTTOM_EDGE_Y}%, 50% ${TIP_Y + 3}%, 100% ${BOTTOM_EDGE_Y}%, 100% 100%, 0 100%)`} bg={PAPER.body} shadow="drop-shadow(0 -1px 2px rgba(120,90,70,0.2))" />

          {/* Toppklaffen */}
          <div
            className="absolute inset-0 origin-top"
            style={{
              transform: flapOpen ? "rotateX(178deg)" : "rotateX(0deg)",
              transition: "transform 0.8s cubic-bezier(.5,0,.3,1)",
              zIndex: cardOut ? 1 : 5,
              filter: "drop-shadow(0 2px 3px rgba(110,80,60,0.25))",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                clipPath: `polygon(0 0, 100% 0, 100% ${FLAP_EDGE_Y}%, 50% ${TIP_Y + 1}%, 0 ${FLAP_EDGE_Y}%)`,
                backgroundImage: PAPER.flap,
                backgroundColor: "#f1e5d9",
              }}
            />
          </div>

          {/* Voksseglet */}
          <button
            type="button"
            onClick={open}
            aria-label="Åpne invitasjonen"
            disabled={sealBroken}
            className="group absolute left-1/2 size-[min(34vw,9.5rem)] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#b8955a]/40"
            style={{ top: `${TIP_Y}%`, zIndex: 6 }}
          >
            <WaxSeal initials={initials} broken={sealBroken} />
          </button>

          <p
            className="absolute inset-x-0 bottom-[16%] text-center text-[11px] font-light uppercase tracking-[0.4em] text-[#7d6e62]"
            style={{ zIndex: 6, opacity: sealBroken ? 0 : 1, transition: "opacity 0.4s" }}
          >
            Trykk på seglet for å åpne
          </p>
        </div>
      )}
    </>
  );
}

function Fold({ clip, bg, shadow, z }: { clip: string; bg: string; shadow: string; z: number }) {
  return (
    <div aria-hidden className="absolute inset-0" style={{ filter: shadow, zIndex: z }}>
      <div className="absolute inset-0" style={{ clipPath: clip, backgroundImage: bg, backgroundColor: "#f3e6da" }} />
    </div>
  );
}

const WAX_EDGE =
  "M60 4 C72 3 78 9 88 12 C99 15 105 23 110 33 C116 43 114 52 116 62 C118 74 111 81 106 91 C101 101 91 105 81 110 C71 116 63 113 53 116 C41 118 34 111 25 105 C15 99 12 90 7 80 C2 69 6 60 4 50 C3 38 10 31 17 22 C24 12 33 10 43 6 C49 4 54 4 60 4 Z";

// Blader langs kvisten: [x, y, rotasjon]
const LEAVES = [
  [33, 74, -40], [31, 64, -25], [33, 54, -10], [38, 46, 10],
  [87, 74, 40], [89, 64, 25], [87, 54, 10], [82, 46, -10],
];
const SMALL_LEAVES = [
  [37, 78, 40], [36, 59, 60], [83, 78, -40], [84, 59, -60],
];

function WaxSeal({ initials, broken }: { initials: string; broken: boolean }) {
  // To halvdeler som sprekker fra hverandre. Venstre halvdel overlapper høyre
  // litt og tegnes øverst, så skjøten ikke synes før seglet brytes.
  const half = (side: "l" | "r") => (
    <svg
      viewBox="0 0 120 120"
      className="absolute inset-0 h-full w-full"
      style={{
        clipPath:
          side === "l"
            ? "polygon(0 0, 57% 0, 49% 45%, 59% 60%, 50% 100%, 0 100%)"
            : "polygon(54% 0, 100% 0, 100% 100%, 47% 100%, 56% 60%, 46% 45%)",
        transform: broken ? `translate(${side === "l" ? -18 : 18}px, 26px) rotate(${side === "l" ? -16 : 16}deg)` : "none",
        opacity: broken ? 0 : 1,
        transition: "transform 0.6s cubic-bezier(.4,0,.6,1), opacity 0.6s ease-in",
      }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`wax-${side}`} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#fbf6ef" />
          <stop offset="55%" stopColor="#ece2d5" />
          <stop offset="100%" stopColor="#cfc0ae" />
        </radialGradient>
      </defs>

      {/* Voksen med ujevn, rennende kant */}
      <path d={WAX_EDGE} fill={`url(#wax-${side})`} />
      {/* Fordypningen fra stempelet */}
      <circle cx="60" cy="60" r="39" fill="#ebe1d4" />
      <circle cx="60" cy="60" r="39" fill="none" stroke="#bfae99" strokeWidth="2.2" />
      <circle cx="60.6" cy="60.8" r="39" fill="none" stroke="#fffaf3" strokeOpacity="0.9" strokeWidth="1" />

      {/* Plantekvist i bue rundt initialene */}
      <g fill="none" stroke="#4f5340" strokeLinecap="round" strokeWidth="1.3">
        <path d="M34 84 C30 70 32 52 44 40" />
        <path d="M86 84 C90 70 88 52 76 40" />
      </g>
      <g fill="#5d6249">
        {LEAVES.map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx="2.4" ry="5.2" opacity="0.92" transform={`rotate(${r} ${x} ${y}) translate(${i < 4 ? -3 : 3} 0)`} />
        ))}
        {SMALL_LEAVES.map(([x, y, r], i) => (
          <ellipse key={`s${i}`} cx={x} cy={y} rx="1.8" ry="4" opacity="0.75" transform={`rotate(${r} ${x} ${y}) translate(${i < 2 ? 3 : -3} 0)`} />
        ))}
      </g>

      {/* Initialene, preget inn i voksen */}
      <text x="60.7" y="68.7" textAnchor="middle" fontSize="23" fontStyle="italic" fill="#fffaf2" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
        {initials}
      </text>
      <text x="60" y="68" textAnchor="middle" fontSize="23" fontStyle="italic" fill="#6b5d4c" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
        {initials}
      </text>
    </svg>
  );

  return (
    <span className="relative block h-full w-full drop-shadow-[0_6px_8px_rgba(90,65,45,0.28)] transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-95">
      {half("r")}
      {half("l")}
    </span>
  );
}
