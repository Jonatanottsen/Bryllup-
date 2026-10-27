import Image from "next/image";
import { OUR_STORY, WEDDING } from "@/config/wedding";

export const metadata = { title: `Om oss – ${WEDDING.couple}` };

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <header className="text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Historien vår</p>
        <h1 className="mt-2 text-5xl sm:text-6xl">Om oss</h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">{OUR_STORY.intro}</p>
      </header>

      <ol className="relative mx-auto max-w-3xl space-y-10 before:absolute before:inset-y-2 before:left-4 before:w-px before:bg-gold/40 sm:before:left-1/2">
        {OUR_STORY.chapters.map((c, i) => (
          <li key={c.title} className="relative pl-12 sm:grid sm:grid-cols-2 sm:gap-10 sm:pl-0">
            <span className="absolute left-4 top-2 size-3 -translate-x-1/2 rounded-full bg-gold ring-4 ring-cream sm:left-1/2" />
            <div className={i % 2 ? "sm:col-start-2" : "sm:text-right"}>
              <p className="text-sm font-medium tracking-wide text-gold">{c.when}</p>
              <h2 className="mt-1 text-3xl">{c.title}</h2>
              <p className="mt-2 whitespace-pre-line text-muted">{c.text}</p>
            </div>
            {c.image && (
              <div className={`mt-4 sm:mt-0 ${i % 2 ? "sm:col-start-1 sm:row-start-1" : ""}`}>
                <Image src={c.image} alt={c.title} width={600} height={450} className="w-full rounded-2xl object-cover shadow-sm" />
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
