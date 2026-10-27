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
        {/* Samme uttrykk som invitasjonskortet i konvolutten */}
        <div className="rounded-[3px] bg-[#fdfaf6] px-6 py-10 text-center shadow-[0_10px_30px_rgba(90,60,40,0.18)]">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#9a8a7c]">Du er invitert til bryllupet til</p>
          <h1 className="my-4 text-4xl leading-tight sm:text-5xl">{WEDDING.couple}</h1>
          <div className="mx-auto h-px w-10 bg-gold/60" />
          <p className="mb-8 mt-4 text-[11px] uppercase tracking-[0.3em] text-[#9a8a7c]">{WEDDING.dateLabel}</p>
          <div className="text-left">
            <LoginForm action={guestLogin} next={next} label="Passord fra invitasjonen" />
          </div>
        </div>
      </Envelope>
    </main>
  );
}
