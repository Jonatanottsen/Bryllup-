// Alt innhold som ikke ligger i databasen. Endre her, commit og push –
// Vercel deployer automatisk. Tekst merket [FYLL INN] er plassholdere.

export const WEDDING = {
  couple: "Emilie & Jonatan",
  date: new Date("2027-07-31T14:00:00+02:00"),
  dateLabel: "Lørdag 31. juli 2027",
  rsvpDeadline: "1. mai 2027 [FYLL INN]",
  // Vipps-nummer for spleis på ønskelisten
  vipps: "[FYLL INN Vipps-nummer]",
  contact: [
    { role: "Toastmaster", name: "[FYLL INN]", phone: "[FYLL INN]" },
    { role: "Brudeparet", name: "Emilie & Jonatan", phone: "[FYLL INN]" },
  ],
};

export const SCHEDULE: { time: string; title: string; place?: string }[] = [
  { time: "14:00", title: "Vielse", place: "[FYLL INN kirke]" },
  { time: "15:30", title: "Mottakelse og bilder", place: "[FYLL INN]" },
  { time: "18:00", title: "Middag", place: "[FYLL INN festlokale]" },
  { time: "22:00", title: "Kake, kaffe og dans" },
  { time: "02:00", title: "Bussen kjører hjem" },
];

export const PRACTICAL: { title: string; body: string }[] = [
  {
    title: "Antrekk",
    body: "[FYLL INN] f.eks. Mørk dress / bunad. Vi gleder oss til å se dere fine!",
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
// Buss: henter i Gjøvik → Raufoss → fest, og kjører samme vei hjem.
// ---------------------------------------------------------------------------

export const BUS_STOPS = {
  gjovik: { label: "Gjøvik", pickup: "[FYLL INN tid/sted, f.eks. 12:45 Skysstasjonen]" },
  raufoss: { label: "Raufoss", pickup: "[FYLL INN tid/sted, f.eks. 13:10 Raufoss stasjon]" },
} as const;

export const BUS_TRIPS = {
  til: { label: "Til bryllupet", detail: "Gjøvik → Raufoss → vielse" },
  hjem: { label: "Hjem", detail: "Fest → Raufoss → Gjøvik, kl. 02:00 [FYLL INN]" },
} as const;

// Vanlig turbuss: 2 + 2 seter med midtgang, 5 seter på bakerste rad.
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
