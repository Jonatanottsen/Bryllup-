import { asc } from "drizzle-orm";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { readDeviceId } from "@/lib/session";
import { WishCard, type WishView } from "./WishCard";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const [items, deviceId] = await Promise.all([
    db().query.wishlistItems.findMany({
      orderBy: [asc(wishlistItems.sortOrder), asc(wishlistItems.createdAt)],
      with: {
        reservations: true,
        contributions: { orderBy: (c, { asc }) => asc(c.createdAt) },
      },
    }),
    readDeviceId(),
  ]);

  // Gjestene ser aldri hvem andre som har reservert/bidratt – kun status.
  // Unntak: den som ordner en spleis (har selv valgt å vise navn og nummer),
  // og den ansvarlige selv, som ser bidragsyterne for å kunne kreve inn.
  const views: WishView[] = items.map((i) => {
    const organizer = i.contributions.find((c) => c.willOrganize);
    const iOrganize = !!organizer && organizer.ownerId === deviceId;
    return {
      id: i.id,
      title: i.title,
      description: i.description,
      url: i.url,
      imageUrl: i.imageUrl,
      priceNok: i.priceNok,
      kind: i.kind,
      quantity: i.quantity,
      goalNok: i.goalNok,
      reservedCount: i.reservations.length,
      myReservations: i.reservations.filter((r) => r.ownerId === deviceId).map((r) => ({ id: r.id, name: r.name })),
      raisedNok: i.contributions.reduce((s, c) => s + c.amountNok, 0),
      contributorCount: i.contributions.length,
      myContributions: i.contributions
        .filter((c) => c.ownerId === deviceId)
        .map((c) => ({ id: c.id, amountNok: c.amountNok, willOrganize: c.willOrganize })),
      organizer: organizer ? { name: organizer.name, phone: organizer.phone ?? "" } : null,
      contributors: iOrganize
        ? i.contributions.map((c) => ({ name: c.name, amountNok: c.amountNok, message: c.message }))
        : null,
    };
  });

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl">Ønskeliste</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          Det viktigste er at dere kommer! Vil du gi noe, kan du reservere en gave her så vi unngår doble gaver – eller gå sammen med andre om en større gave. På en spleis tar én av dere ansvar for å kjøpe gaven, og de andre Vippser bidraget sitt til den personen.
        </p>
      </header>
      {views.length === 0 ? (
        <p className="card text-center text-muted">Ønskelisten kommer snart.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {views.map((v) => <WishCard key={v.id} item={v} />)}
        </div>
      )}
    </div>
  );
}
