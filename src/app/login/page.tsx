import { LoginForm } from "@/components/LoginForm";
import { WEDDING } from "@/config/wedding";
import { guestLogin } from "./actions";
import { Envelope } from "./Envelope";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden px-4 py-10">
      <Envelope initials="E&J" couple={WEDDING.couple} dateLabel={WEDDING.dateLabel}>
        <div className="card text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-muted">Velkommen til bryllupet til</p>
          <h1 className="my-3 text-5xl">{WEDDING.couple}</h1>
          <p className="mb-6 text-gold">{WEDDING.dateLabel}</p>
          <div className="text-left">
            <LoginForm action={guestLogin} next={next} label="Passord fra invitasjonen" />
          </div>
        </div>
      </Envelope>
    </main>
  );
}
