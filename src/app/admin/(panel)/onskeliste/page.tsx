import { asc } from "drizzle-orm";
import Link from "next/link";
import { ConfirmButton } from "@/components/ConfirmButton";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { deleteContributionAdmin, deleteReservation, deleteWishItem } from "../../actions";
import { EditWish, WishForm } from "./WishForm";

const nok = (n: number) => `${n.toLocaleString("nb-NO")} kr`;

export default async function WishlistAdmin({ searchParams }: { searchParams: Promise<{ vis?: string }> }) {
  const reveal = (await searchParams).vis === "1";
  const items = await db().query.wishlistItems.findMany({
    orderBy: [asc(wishlistItems.sortOrder), asc(wishlistItems.createdAt)],
    with: { reservations: true, contributions: true },
  });

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-5xl">Ønskeliste</h1>
        <div className="flex gap-2">
          <Link className="btn-outline" href={reveal ? "/admin/onskeliste" : "/admin/onskeliste?vis=1"}>
            {reveal ? "🙈 Skjul hvem som har gitt hva" : "👀 Vis hvem som har gitt hva"}
          </Link>
          {reveal && <a className="btn-outline" href="/admin/eksport/onskeliste">CSV (til takkekort)</a>}
        </div>
      </div>

      <section className="card">
        <h2 className="mb-4 text-3xl">Legg til ønske</h2>
        <WishForm />
      </section>

      <section className="space-y-3">
        {items.map((i) => {
          const raised = i.contributions.reduce((s, c) => s + c.amountNok, 0);
          return (
            <article key={i.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-2xl">{i.title} {i.kind === "spleis" && <span className="text-sm text-gold">· Spleis</span>}</h3>
                  <p className="text-sm text-muted">
                    {i.kind === "gave"
                      ? `${i.reservations.length} av ${i.quantity} reservert`
                      : `${nok(raised)} av ${nok(i.goalNok ?? 0)} · ${i.contributions.length} bidrag`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <EditWish item={i} />
                  <ConfirmButton action={deleteWishItem.bind(null, i.id)} confirm={`Slette «${i.title}»? Reservasjoner og bidrag slettes også.`}>Slett</ConfirmButton>
                </div>
              </div>
              {reveal && (i.reservations.length > 0 || i.contributions.length > 0) && (
                <ul className="mt-3 divide-y divide-black/5 text-sm">
                  {i.reservations.map((r) => (
                    <li key={r.id} className="flex justify-between py-1">
                      <span>🎁 {r.name}</span>
                      <ConfirmButton action={deleteReservation.bind(null, r.id)} confirm="Fjerne reservasjonen?">Fjern</ConfirmButton>
                    </li>
                  ))}
                  {i.contributions.map((c) => (
                    <li key={c.id} className="flex justify-between py-1">
                      <span>💛 {c.name} – {nok(c.amountNok)}{c.message && <em className="text-muted"> «{c.message}»</em>}</span>
                      <ConfirmButton action={deleteContributionAdmin.bind(null, c.id)} confirm="Fjerne bidraget?">Fjern</ConfirmButton>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
        {items.length === 0 && <p className="card text-center text-muted">Ingen ønsker lagt inn ennå.</p>}
      </section>
    </>
  );
}
