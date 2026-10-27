"use client";

import { useEffect, useState } from "react";

// Første besøk: hele skjermen er en forseglet konvolutt i håndlaget papir.
// Trykk på seglet → seglet brekker, lys siver ut langs klaffen, klaffen åpnes
// og lyset strømmer ut som fra en dør på gløtt. Kortet glir opp i motlys, lyset
// fyller skjermen, og innloggingen (children) kommer fram.

const STAGES = ["closed", "seal", "flap", "card", "flood", "open"] as const;
type Stage = (typeof STAGES)[number];

const SEEN_KEY = "bryllup_konvolutt_apnet";
const STEPS: [Stage, number][] = [
  ["seal", 0],
  ["flap", 450],
  ["card", 1450],
  ["flood", 3000],
  ["open", 3900],
];

// Varmt, gyllent lys
const LIGHT = "255,238,198";

/** Papir: myk bomullsstruktur belyst fra øvre venstre hjørne + svake fibre. */
function paper(light: string, elevation = 72) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='360' height='360'>
<filter id='p' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
<feTurbulence type='fractalNoise' baseFrequency='0.06' numOctaves='4' seed='11' stitchTiles='stitch' result='n'/>
<feDiffuseLighting in='n' lighting-color='${light}' surfaceScale='0.85' result='l'><feDistantLight azimuth='225' elevation='${elevation}'/></feDiffuseLighting>
<feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='4' stitchTiles='stitch' result='g'/>
<feColorMatrix in='g' type='matrix' values='0 0 0 0 0.62  0 0 0 0 0.5  0 0 0 0 0.42  0 0 0 -0.35 0.2' result='fib'/>
<feComposite in='fib' in2='l' operator='atop'/>
</filter><rect width='100%' height='100%' filter='url(#p)'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

const PAPER = {
  inside: paper("#f0dfcf", 68),
  body: paper("#fff1e5"),
  side: paper("#fdeee1"),
  flap: paper("#fff4ea", 74),
  flapInside: paper("#f1e1d1", 66),
  card: paper("#fffdf9", 78),
};

// Konvoluttens geometri i prosent av skjermen
const TIP_Y = 52; // klaffens spiss (der seglet sitter)
const FLAP_EDGE_Y = 27; // der klaffen treffer sidekantene
const SIDE_LOW_Y = 78; // der sidebrettene treffer sidekantene nederst
const BOTTOM_EDGE_Y = 72; // der bunnbrettet treffer sidekantene

const FLAP_CLIP = `polygon(0 0, 100% 0, 100% ${FLAP_EDGE_Y}%, 50% ${TIP_Y + 1}%, 0 ${FLAP_EDGE_Y}%)`;
// Samme form speilet vertikalt – baksiden av klaffen snus 180° rundt sin egen midtlinje
const FLAP_CLIP_MIRRORED = `polygon(0 100%, 100% 100%, 100% ${100 - FLAP_EDGE_Y}%, 50% ${100 - TIP_Y - 1}%, 0 ${100 - FLAP_EDGE_Y}%)`;

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
  const [animated, setAnimated] = useState(false);

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
    setAnimated(true);
    for (const [s, ms] of STEPS) setTimeout(() => setStage(s), ms);
  };

  const at = (s: Stage) => STAGES.indexOf(stage) >= STAGES.indexOf(s);
  const sealBroken = at("seal");
  const flapOpen = at("flap");
  const cardOut = at("card");
  const flooding = at("flood");

  return (
    <>
      {/* Papirbakgrunn – blir liggende bak innloggingen */}
      <div aria-hidden className="fixed inset-0 -z-10" style={{ backgroundImage: PAPER.inside, backgroundColor: "#e6d7c7" }} />
      <Lighting />

      {stage === "open" ? (
        <>
          <div className="relative w-full max-w-sm animate-[fadein_0.9s_ease-out]">{children}</div>
          {/* Lyset som fylte skjermen tones ned og avslører kortet */}
          {animated && (
            <div aria-hidden className="pointer-events-none fixed inset-0 z-30 animate-[flashout_1.1s_ease-out_forwards]" style={{ background: `rgb(${LIGHT})` }} />
          )}
        </>
      ) : (
        <div className="fixed inset-0 z-10 overflow-hidden [perspective:1800px]">
          {/* Lyset inne i konvolutten – bak kortet, som motlys gjennom en dør på gløtt */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              zIndex: 1,
              opacity: cardOut ? 1 : flapOpen ? 0.75 : 0,
              transition: "opacity 1.3s ease-out",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ background: `radial-gradient(ellipse 75% 42% at 50% ${FLAP_EDGE_Y + 12}%, rgba(255,252,240,1) 0%, rgba(${LIGHT},0.95) 30%, rgba(${LIGHT},0.45) 60%, rgba(${LIGHT},0) 85%)` }}
            />
            <div
              className="absolute -inset-1/2 animate-[spin_80s_linear_infinite]"
              style={{
                transformOrigin: `50% ${50 + (TIP_Y - 50) / 2}%`,
                background: `repeating-conic-gradient(from 0deg at 50% ${50 + (TIP_Y - 50) / 2}%, rgba(${LIGHT},0) 0deg, rgba(${LIGHT},0.55) 2deg, rgba(${LIGHT},0) 6deg, rgba(${LIGHT},0) 14deg)`,
                filter: "blur(5px)",
                maskImage: "radial-gradient(circle at 50% 50%, #000 5%, transparent 32%)",
                WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 5%, transparent 32%)",
              }}
            />
          </div>

          {/* Invitasjonskortet – glir opp i motlys */}
          <div
            className="absolute left-1/2 top-0 flex w-[min(80vw,22rem)] flex-col items-center rounded-[2px] px-6 py-10 text-center"
            style={{
              backgroundImage: PAPER.card,
              backgroundColor: "#fdfaf6",
              boxShadow: `0 0 0 1px rgba(255,255,255,0.6), 0 0 40px 6px rgba(${LIGHT},0.9), 0 18px 40px rgba(90,60,40,0.18)`,
              transform: `translate(-50%, ${cardOut ? "11dvh" : `${TIP_Y + 8}dvh`})`,
              transition: "transform 1.5s cubic-bezier(.2,.7,.2,1)",
              zIndex: 2,
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-[#9a8a7c]">Du er invitert til bryllupet til</p>
            <p className="my-4 font-serif text-4xl leading-tight text-[#3d3530]">{couple}</p>
            <div className="h-px w-10 bg-[#b8955a]/60" />
            <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-[#9a8a7c]">{dateLabel}</p>
          </div>

          {/* Lysstråler som faller ut av åpningen og over kortet */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              zIndex: 2,
              opacity: cardOut ? 0.9 : flapOpen ? 0.5 : 0,
              transition: "opacity 1.4s ease-out",
              maskImage: `radial-gradient(ellipse 70% 55% at 50% ${TIP_Y}%, #000 10%, transparent 75%)`,
              WebkitMaskImage: `radial-gradient(ellipse 70% 55% at 50% ${TIP_Y}%, #000 10%, transparent 75%)`,
            }}
          >
            <div
              className="absolute -inset-1/2 animate-[spin_90s_linear_infinite_reverse]"
              style={{
                transformOrigin: `50% ${50 + (TIP_Y - 50) / 2}%`,
                background: `repeating-conic-gradient(from 0deg at 50% ${50 + (TIP_Y - 50) / 2}%, rgba(${LIGHT},0) 0deg, rgba(${LIGHT},0.35) 2.5deg, rgba(${LIGHT},0) 7deg, rgba(${LIGHT},0) 17deg)`,
                filter: "blur(8px)",
              }}
            />
          </div>

          {/* Sidebrett og bunnbrett: preget kant (lys topp, mørk skygge) */}
          <Fold
            z={3}
            clip={`polygon(0 ${FLAP_EDGE_Y - 1}%, 52% ${TIP_Y + 2}%, 0 ${SIDE_LOW_Y}%)`}
            bg={PAPER.side}
            shadow="drop-shadow(1px 0 0.6px rgba(110,80,60,0.28)) drop-shadow(3px 0 6px rgba(110,80,60,0.10))"
          />
          <Fold
            z={3}
            clip={`polygon(100% ${FLAP_EDGE_Y - 1}%, 48% ${TIP_Y + 2}%, 100% ${SIDE_LOW_Y}%)`}
            bg={PAPER.side}
            shadow="drop-shadow(-1px 0 0.6px rgba(110,80,60,0.28)) drop-shadow(-3px 0 6px rgba(110,80,60,0.10))"
          />
          <Fold
            z={4}
            clip={`polygon(0 ${BOTTOM_EDGE_Y}%, 50% ${TIP_Y + 3}%, 100% ${BOTTOM_EDGE_Y}%, 100% 100%, 0 100%)`}
            bg={PAPER.body}
            shadow="drop-shadow(0 -0.6px 0 rgba(255,255,255,0.75)) drop-shadow(0 -1px 1px rgba(110,80,60,0.22)) drop-shadow(0 -4px 8px rgba(110,80,60,0.10))"
          />

          {/* Lysstripen som siver ut langs klaffkanten – som under en dør */}
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-screen"
            style={{
              zIndex: 5,
              filter: "blur(5px) drop-shadow(0 0 14px rgba(255,236,200,0.9))",
              opacity: flooding ? 0 : sealBroken ? 1 : 0,
              transition: sealBroken && !flapOpen ? "opacity 0.45s ease-in" : "opacity 1s ease-out",
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                background: `rgba(${LIGHT},1)`,
                clipPath: `polygon(0 ${FLAP_EDGE_Y - 0.4}%, 50% ${TIP_Y + 0.6}%, 100% ${FLAP_EDGE_Y - 0.4}%, 100% ${FLAP_EDGE_Y + 1.4}%, 50% ${TIP_Y + 2.4}%, 0 ${FLAP_EDGE_Y + 1.4}%)`,
              }}
            />
          </div>

          {/* Toppklaffen: forside + mørkere innside, snus opp rundt toppkanten */}
          <div
            className="absolute inset-0 origin-top [transform-style:preserve-3d]"
            style={{
              transform: flapOpen ? "rotateX(176deg)" : "rotateX(0deg)",
              transition: "transform 1.05s cubic-bezier(.55,0,.25,1)",
              zIndex: cardOut ? 1 : 6,
            }}
          >
            <div
              className="absolute inset-0 [backface-visibility:hidden]"
              style={{ filter: "drop-shadow(0 0.6px 0.4px rgba(100,70,50,0.35)) drop-shadow(0 6px 10px rgba(100,70,50,0.16))" }}
            >
              <div className="absolute inset-0" style={{ clipPath: FLAP_CLIP, backgroundImage: PAPER.flap, backgroundColor: "#f1e5d9" }} />
            </div>
            <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)]">
              <div
                className="absolute inset-0"
                style={{
                  clipPath: FLAP_CLIP_MIRRORED,
                  backgroundImage: `linear-gradient(to top, rgba(${LIGHT},0.55), rgba(${LIGHT},0) 60%), ${PAPER.flapInside}`,
                  backgroundColor: "#e5d6c5",
                }}
              />
            </div>
          </div>

          {/* Lyset som søler ut over kanten og papiret rundt åpningen */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-screen"
            style={{
              zIndex: 7,
              background: `radial-gradient(ellipse 80% 34% at 50% ${FLAP_EDGE_Y + 6}%, rgba(${LIGHT},0.7), rgba(${LIGHT},0) 72%)`,
              opacity: cardOut ? 1 : flapOpen ? 0.55 : 0,
              transition: "opacity 1.4s ease-out",
            }}
          />

          {/* Voksseglet */}
          <button
            type="button"
            onClick={open}
            aria-label="Åpne invitasjonen"
            disabled={sealBroken}
            className="group absolute left-1/2 size-[min(36vw,10rem)] -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-full outline-none focus-visible:ring-4 focus-visible:ring-[#b8955a]/40"
            style={{ top: `${TIP_Y}%`, zIndex: 8 }}
          >
            <WaxSeal initials={initials} broken={sealBroken} />
          </button>

          <p
            className="absolute inset-x-0 bottom-[16%] text-center text-[11px] font-light uppercase tracking-[0.4em] text-[#7d6e62]"
            style={{ zIndex: 8, opacity: sealBroken ? 0 : 1, transition: "opacity 0.4s" }}
          >
            Trykk på seglet for å åpne
          </p>

          {/* Til slutt fyller lyset hele skjermen – en rund lyskule som vokser fra åpningen */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 size-[300vmax] -translate-x-1/2 -translate-y-1/2"
            style={{ top: `${FLAP_EDGE_Y + 12}%`, zIndex: 20 }}
          >
            <div
              className="size-full rounded-full"
              style={{
                background: `radial-gradient(circle, rgba(255,252,242,1) 0%, rgba(${LIGHT},1) 38%, rgba(${LIGHT},0) 70%)`,
                transform: flooding ? "scale(1)" : "scale(0.05)",
                opacity: flooding ? 1 : 0,
                transition: "transform 0.9s cubic-bezier(.5,0,.75,.3), opacity 0.4s ease-in",
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

/** Lys fra øvre venstre hjørne og mørkere kanter, som et foto av ekte papir. */
function Lighting() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[15]"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 25% 15%, rgba(255,250,240,0.28), rgba(255,250,240,0) 60%), radial-gradient(ellipse 120% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(90,60,40,0.10) 100%)",
      }}
    />
  );
}

function Fold({ clip, bg, shadow, z }: { clip: string; bg: string; shadow: string; z: number }) {
  return (
    <div aria-hidden className="absolute inset-0" style={{ filter: shadow, zIndex: z }}>
      <div className="absolute inset-0" style={{ clipPath: clip, backgroundImage: bg, backgroundColor: "#f3e6da" }} />
    </div>
  );
}

// Ujevn voksklatt med små utløpere, i et 120 × 120-koordinatsystem
const WAX_EDGE =
  "M60 5 C67 4 71 1 76 4 C80 7 86 8 91 12 C99 17 104 22 108 31 C112 38 117 41 115 48 C114 54 117 59 116 65 C115 73 111 79 107 86 C103 94 98 100 90 104 C85 107 82 112 76 112 C70 113 65 116 58 115 C50 115 44 113 37 109 C30 106 23 103 18 96 C13 90 9 85 7 77 C4 70 3 64 4 57 C4 50 2 45 6 39 C9 32 13 25 19 20 C25 14 31 10 39 8 C46 6 52 6 60 5 Z";

const LEAVES: [number, number, number][] = [
  [33, 74, -40], [31, 64, -25], [33, 54, -10], [38, 46, 10],
  [87, 74, 40], [89, 64, 25], [87, 54, 10], [82, 46, -10],
];
const SMALL_LEAVES: [number, number, number][] = [
  [37, 78, 40], [36, 59, 60], [83, 78, -40], [84, 59, -60],
];

/**
 * Seglet tegnes som et høydekart i gråtoner (lyst = høyt) og belyses med
 * SVG-lysfiltre. Det gir ekte relieff: avrundet voks, nedpresset stempel,
 * hevet kvist og initialer, og blanke høylys.
 */
function SealDefs({ initials }: { initials: string }) {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <clipPath id="seal-shape">
          <path d={WAX_EDGE} />
        </clipPath>
        <filter id="seal-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="seal-floor" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        <filter id="seal-relief" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.35" />
        </filter>
        <filter id="seal-light" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="luminanceToAlpha" result="h0" />
          {/* Fin voksstruktur */}
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3" result="grain" />
          <feColorMatrix in="grain" type="luminanceToAlpha" result="grainA" />
          <feComposite in="h0" in2="grainA" operator="arithmetic" k2="1" k3="0.012" result="h" />
          <feGaussianBlur in="h" stdDeviation="0.8" result="hb" />
          <feDiffuseLighting in="hb" surfaceScale="6" diffuseConstant="1" lightingColor="#f6e9d8" result="diff">
            <feDistantLight azimuth="230" elevation="62" />
          </feDiffuseLighting>
          <feSpecularLighting in="hb" surfaceScale="6" specularConstant="0.4" specularExponent="30" lightingColor="#fffaf2" result="spec">
            <feDistantLight azimuth="230" elevation="62" />
          </feSpecularLighting>
          <feComposite in="diff" in2="spec" operator="arithmetic" k2="0.92" k3="0.7" k4="0.13" result="lit" />
          <feComposite in="lit" in2="SourceAlpha" operator="in" />
        </filter>
      </defs>
      <defs>
        <g id="seal-height" clipPath="url(#seal-shape)">
          <rect width="120" height="120" fill="#000" />
          {/* Kuppelformet voks */}
          <path d={WAX_EDGE} fill="#fff" filter="url(#seal-soft)" transform="translate(60 60) scale(0.92) translate(-60 -60)" />
          {/* Stempelets nedpressede bunn med en liten vold rundt */}
          <circle cx="60" cy="60" r="41" fill="none" stroke="#ffffff" strokeWidth="3" filter="url(#seal-floor)" />
          <circle cx="60" cy="60" r="37.5" fill="#7a7a7a" filter="url(#seal-floor)" />
          {/* Hevet motiv */}
          <g filter="url(#seal-relief)">
            <g fill="none" stroke="#bdbdbd" strokeLinecap="round" strokeWidth="1.6">
              <path d="M34 84 C30 70 32 52 44 40" />
              <path d="M86 84 C90 70 88 52 76 40" />
            </g>
            <g fill="#c4c4c4">
              {LEAVES.map(([x, y, r], i) => (
                <ellipse key={i} cx={x} cy={y} rx="2.5" ry="5.4" transform={`rotate(${r} ${x} ${y}) translate(${i < 4 ? -3 : 3} 0)`} />
              ))}
              {SMALL_LEAVES.map(([x, y, r], i) => (
                <ellipse key={`s${i}`} cx={x} cy={y} rx="1.9" ry="4.1" transform={`rotate(${r} ${x} ${y}) translate(${i < 2 ? 3 : -3} 0)`} />
              ))}
            </g>
            <text x="60" y="68" textAnchor="middle" fontSize="23" fontStyle="italic" fill="#cfcfcf" style={{ fontFamily: "var(--font-cormorant), Georgia, serif" }}>
              {initials}
            </text>
          </g>
        </g>
      </defs>
    </svg>
  );
}

function WaxSeal({ initials, broken }: { initials: string; broken: boolean }) {
  // To halvdeler som sprekker fra hverandre. Venstre halvdel overlapper høyre
  // litt og tegnes øverst, så skjøten ikke synes før seglet brytes.
  const half = (side: "l" | "r") => (
    <svg
      viewBox="0 0 120 120"
      className="absolute inset-0 h-full w-full overflow-visible"
      style={{
        clipPath:
          side === "l"
            ? "polygon(0 0, 57% 0, 49% 45%, 59% 60%, 50% 100%, 0 100%)"
            : "polygon(54% 0, 100% 0, 100% 100%, 47% 100%, 56% 60%, 46% 45%)",
        transform: broken ? `translate(${side === "l" ? -22 : 22}px, 34px) rotate(${side === "l" ? -18 : 18}deg)` : "none",
        opacity: broken ? 0 : 1,
        transition: "transform 0.7s cubic-bezier(.4,0,.6,1), opacity 0.7s ease-in",
      }}
      aria-hidden
    >
      <use href="#seal-height" filter="url(#seal-light)" />
      {/* Varm elfenbenstone i voksen, og kvisten farget oliven som på et ekte stempel */}
      <path d={WAX_EDGE} fill="#f3dcc0" opacity="0.18" style={{ mixBlendMode: "multiply" }} />
      <g style={{ mixBlendMode: "multiply" }} opacity="0.85">
        <g fill="none" stroke="#6b7052" strokeLinecap="round" strokeWidth="1.4">
          <path d="M34 84 C30 70 32 52 44 40" />
          <path d="M86 84 C90 70 88 52 76 40" />
        </g>
        <g fill="#737a58">
          {LEAVES.map(([x, y, r], i) => (
            <ellipse key={i} cx={x} cy={y} rx="2.3" ry="5.1" transform={`rotate(${r} ${x} ${y}) translate(${i < 4 ? -3 : 3} 0)`} />
          ))}
          {SMALL_LEAVES.map(([x, y, r], i) => (
            <ellipse key={`s${i}`} cx={x} cy={y} rx="1.7" ry="3.9" transform={`rotate(${r} ${x} ${y}) translate(${i < 2 ? 3 : -3} 0)`} />
          ))}
        </g>
      </g>
    </svg>
  );

  return (
    <span className="relative block h-full w-full drop-shadow-[0_1px_1px_rgba(70,45,30,0.35)] transition-transform duration-200 group-hover:scale-[1.03] group-active:scale-95">
      <SealDefs initials={initials} />
      {/* Kontaktskygge under voksen */}
      <span
        className="absolute inset-[8%] translate-y-[6%] rounded-full bg-[rgba(70,45,30,0.22)] blur-md transition-opacity duration-300"
        style={{ opacity: broken ? 0 : 1 }}
      />
      {half("r")}
      {half("l")}
    </span>
  );
}
