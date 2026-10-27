import { Nav } from "@/components/Nav";
import { requireAdmin } from "@/lib/session";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

const LINKS = [
  { href: "/admin", label: "Oversikt" },
  { href: "/admin/gjester", label: "Gjester" },
  { href: "/admin/buss", label: "Buss" },
  { href: "/admin/onskeliste", label: "Ønskeliste" },
  { href: "/", label: "Til siden ↗" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <Nav links={LINKS} title="Admin" />
      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {children}
        <form action={logout} className="pt-8 text-center">
          <button className="text-sm text-muted underline">Logg ut</button>
        </form>
      </main>
    </>
  );
}
