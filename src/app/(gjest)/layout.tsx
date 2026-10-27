import { Nav } from "@/components/Nav";
import { WEDDING } from "@/config/wedding";

const LINKS = [
  { href: "/", label: "Hjem" },
  { href: "/om-oss", label: "Om oss" },
  { href: "/program", label: "Program" },
  { href: "/praktisk", label: "Praktisk info" },
  { href: "/buss", label: "Buss" },
  { href: "/onskeliste", label: "Ønskeliste" },
  { href: "/rsvp", label: "Svar", cta: true },
];

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav links={LINKS} title="E & J" />
      <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
      <footer className="py-10 text-center text-sm text-muted">
        {WEDDING.couple} · {WEDDING.dateLabel}
      </footer>
    </>
  );
}
