// Alt innhold som ikke ligger i databasen. Endre her, commit og push –
// Vercel deployer automatisk. Tekst merket [FYLL INN] er plassholdere.

export const WEDDING = {
  couple: "Emilie & Jonatan",
  date: new Date("2027-07-31T14:00:00+02:00"),
  dateLabel: "Lørdag 31. juli 2027",
  rsvpDeadline: "1. mai 2027 [FYLL INN]",
  church: { name: "Raufoss kirke", address: "Kirkevegen 4, 2830 Raufoss" },
  // phone: null skjuler nummeret til det er klart
  contact: [
    { role: "Toastmaster", name: "Kommer snart", phone: null },
    { role: "Brudeparet", name: "Emilie & Jonatan", phone: "[FYLL INN]" },
  ] as { role: string; name: string; phone: string | null }[],
};

export const SCHEDULE: { time: string; title: string; place?: string }[] = [
  { time: "14:00", title: "Vielse", place: "Raufoss kirke, Kirkevegen 4, 2830 Raufoss" },
  { time: "15:00", title: "Bussen kjører fra kirken til festen" },
  { time: "18:00", title: "Middag", place: "[FYLL INN festlokale]" },
  { time: "22:00", title: "Kake, kaffe og dans" },
  { time: "ca. 01:30", title: "Bussen kjører hjem (Raufoss og Gjøvik)" },
];

// ---------------------------------------------------------------------------
// Om oss – historien deres. Bilder legges i /public/bilder og refereres som
// "/bilder/filnavn.jpg". Kapitler uten bilde fungerer helt fint.
// ---------------------------------------------------------------------------

export const OUR_STORY: {
  intro: string;
  chapters: { when: string; title: string; text: string; image?: string }[];
} = {
  intro: "[FYLL INN] En kort hilsen fra oss to – hvem vi er og hvorfor vi gleder oss sånn til å feire med akkurat dere.",
  chapters: [
    { when: "[ÅR]", title: "Hvordan vi møttes", text: "[FYLL INN] Historien om første gang vi møttes." },
    { when: "[ÅR]", title: "Første date", text: "[FYLL INN] Hvor gikk vi, og hva skjedde?" },
    { when: "[ÅR]", title: "Frieriet", text: "[FYLL INN] Hvordan, hvor og hvem som gråt mest." },
    { when: "31.07.2027", title: "Bryllupet", text: "Og nå gleder vi oss til å feire med dere!" },
  ],
};

export const PRACTICAL: { title: string; body: string }[] = [
  {
    title: "Antrekk",
    body: "Passende dress, smoking eller kjole. Vi gleder oss til å se dere fine!",
  },
  {
    title: "Parkering",
    body: "[FYLL INN] Vi anbefaler å ta bussen – da kan alle skåle med god samvittighet.",
  },
  {
    title: "Overnatting",
    body: "[FYLL INN] Hotell i nærheten og ev. rabattkode.",
  },
  {
    title: "Barn",
    body: "[FYLL INN] Er barn velkomne, eller er dette en voksenfest?",
  },
  {
    title: "Taler og innslag",
    body: "Ønsker du å holde tale eller ha et innslag? Kryss av i svarskjemaet, så tar toastmaster kontakt.",
  },
];

// ---------------------------------------------------------------------------
// Buss: henter alle ved Raufoss kirke etter vielsen og kjører til festen.
// Hjemtur: fest → Raufoss → Gjøvik, der gjesten velger hvor de går av.
// ---------------------------------------------------------------------------

/** Avstigningssteder på hjemturen. */
export const BUS_STOPS = {
  raufoss: { label: "Raufoss" },
  gjovik: { label: "Gjøvik" },
} as const;

export const BUS_TRIPS = {
  til: { label: "Til festen", detail: "Fra Raufoss kirke rett etter vielsen" },
  hjem: { label: "Hjem", detail: "Fest → Raufoss → Gjøvik, ca. kl. 01:30 (tid ikke endelig)" },
} as const;

/** Seter som er holdt av og ikke kan bookes av gjester. */
export const BUS_RESERVED: Record<keyof typeof BUS_TRIPS, { seat: number; name: string }[]> = {
  til: [],
  hjem: [
    { seat: 1, name: "Emilie" },
    { seat: 2, name: "Jonatan" },
  ],
};

// Vanlig turbuss: 2 + 2 seter med midtgang, 5 seter på bakerste rad.
// Antall seter er ikke bekreftet ennå – endre rows/backRowSeats når det er klart.
export const BUS_LAYOUT = { rows: 11, backRowSeats: 5 };
export const BUS_SEAT_COUNT = BUS_LAYOUT.rows * 4 + BUS_LAYOUT.backRowSeats;

// ---------------------------------------------------------------------------
// Allergier / diett – koden lagres i databasen, etiketten vises.
// ---------------------------------------------------------------------------

export const ALLERGENS = [
  { code: "gluten", label: "Gluten" },
  { code: "laktose", label: "Laktose" },
  { code: "melkeprotein", label: "Melkeprotein" },
  { code: "egg", label: "Egg" },
  { code: "notter", label: "Nøtter" },
  { code: "peanotter", label: "Peanøtter" },
  { code: "fisk", label: "Fisk" },
  { code: "skalldyr", label: "Skalldyr" },
  { code: "soya", label: "Soya" },
  { code: "selleri", label: "Selleri" },
  { code: "sennep", label: "Sennep" },
  { code: "sesam", label: "Sesam" },
  { code: "vegetar", label: "Vegetar" },
  { code: "vegan", label: "Vegan" },
  { code: "alkoholfritt", label: "Alkoholfritt" },
] as const;

export const ALLERGEN_CODES = ALLERGENS.map((a) => a.code) as string[];
export const allergenLabel = (code: string) =>
  ALLERGENS.find((a) => a.code === code)?.label ?? code;
