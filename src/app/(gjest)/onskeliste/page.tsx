import { asc } from "drizzle-orm";
import { WEDDING } from "@/config/wedding";
import { db } from "@/db";
import { wishlistItems } from "@/db/schema";
import { readDeviceId } from "@/lib/session";
import { WishCard, type WishView } from "./WishCard";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const [items, deviceId] = await Promise.all([
    db().query.wishlistItems.findMany({
      orderBy: [asc(wishlistItems.sortOrder), asc(wishlistItems.createdAt)],
      with: { reservations: true, contributions: true },
    }),
    readDeviceId(),
  ]);

  // Gjestene ser aldri hvem andre som har reservert/bidratt – kun status.
  const views: WishView[] = items.map((i) => ({
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
    myContributions: i.contributions.filter((c) => c.ownerId === deviceId).map((c) => ({ id: c.id, amountNok: c.amountNok })),
  }));

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl">Ønskeliste</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          Det viktigste er at dere kommer! Vil du gi noe, kan du reservere en gave her så vi unngår doble gaver – eller bli med på en spleis.
        </p>
      </header>
      {views.length === 0 ? (
        <p className="card text-center text-muted">Ønskelisten kommer snart.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {views.map((v) => <WishCard key={v.id} item={v} vipps={WEDDING.vipps} />)}
        </div>
      )}
    </div>
  );
}
