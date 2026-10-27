# Emilie & Jonatan – 31. juli 2027 💍

Bryllupsside med svarskjema (RSVP), allergier, praktisk info, setevalg på bussen og ønskeliste med reservering og spleis.

**Teknologi:** Next.js 16 (App Router) · Neon Postgres · Drizzle ORM · Tailwind CSS · Vercel

## Sider

| Side | Hva |
|---|---|
| `/` | Forside med nedtelling og program |
| `/rsvp` | Svarskjema: navn, e-post, telefon, kommer/kommer ikke, hele følget, allergier per person, tale/innslag, hilsen. Gjesten kan endre svaret senere. |
| `/praktisk` | Program, buss, antrekk, overnatting, kontakt |
| `/buss` | Interaktivt busskart, der gjestene velger sete og stopp (Gjøvik/Raufoss) separat for turen dit og turen hjem |
| `/onskeliste` | Gaver kan reserveres. Ved spleis registrerer gjesten et beløp og får Vipps-info. |
| `/admin` | Kun for brudeparet: oversikt, gjesteliste, allergioppsummering, taler, busslister, administrasjon av ønskelisten og CSV-eksport |

## Oppsett (én gang)

### 1. Neon (database)
1. Lag et prosjekt på [neon.tech](https://neon.tech) (velg region **Europe (Frankfurt)**).
2. Kopier **pooled connection string** (Connection Details → "Pooled connection").

### 2. Lag tabellene
```bash
npm install
cp .env.example .env.local      # fyll inn verdiene
npm run db:migrate
```

### 3. Vercel
1. Importer GitHub-repoet i Vercel.
2. Legg inn disse under **Settings → Environment Variables**:

| Variabel | Beskrivelse |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `GUEST_PASSWORD` | Fellespassordet som står på invitasjonen. Store og små bokstaver spiller ingen rolle. |
| `ADMIN_PASSWORD` | Kun for dere to |
| `SESSION_SECRET` | Tilfeldig streng: `openssl rand -base64 32` |

3. Deploy. Hver push til `main` deployes automatisk.

> Tips: Du kan også bruke Neon-integrasjonen i Vercel (Storage → Neon), som setter `DATABASE_URL` for deg.

## Endre innhold

Alt av tekst, tider, steder, bussholdeplasser, Vipps-nummer og allergiliste ligger i
**[`src/config/wedding.ts`](src/config/wedding.ts)**. Søk etter `[FYLL INN]`.

Ønsker legges inn, endres og slettes i adminpanelet på `/admin/onskeliste`.

## Datamodell

```
rsvp_responses 1───* guests                (et svar kan gjelde hele følget)
wishlist_items 1───* wishlist_reservations (gave: maks `quantity` reservasjoner)
               1───* wishlist_contributions (spleis: beløp mot `goal_nok`)
bus_bookings   UNIQUE(trip, seat)          (to gjester kan aldri få samme sete)
```

- **Integritet i databasen:** unik-constraint på sete per tur, CHECK-constraints på beløp/antall/mål, og fremmednøkler med `ON DELETE CASCADE`.
- **Atomiske operasjoner:** RSVP-endringer kjøres som én transaksjon (`db.batch`). Gave-reservering er en betinget insert, så en gave ikke kan overbookes.
- **Personvern:** Gjester ser bare fornavn på bussen og ser aldri hvem som har reservert eller gitt hva. I admin er giverne skjult som standard, så dere ikke får spoilet gavene. Klikk «Vis hvem som har gitt hva» etter bryllupet for takkekort.
- **Eksport:** CSV-filer (semikolon og UTF-8 BOM, slik at de åpnes riktig i norsk Excel) for gjester, allergier til kjøkkenet, busslister og gaver.

### Endre skjemaet
```bash
# rediger src/db/schema.ts, deretter:
npm run db:generate   # lager ny SQL-migrering i drizzle/
npm run db:migrate    # kjører den mot databasen
```

## Lokal utvikling
```bash
npm run dev        # http://localhost:3000
npm run lint
npm run typecheck
```
Tips: Lag en egen **Neon-branch** for utvikling, så tester dere aldri mot ekte gjestedata.
