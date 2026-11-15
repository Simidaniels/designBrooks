import Link from "next/link";
import { ArrowRight } from "lucide-react";

/* Compact interior-page hero used across the public site */
export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="border-b border-line bg-ivory-100/60">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-7 sm:py-20">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.6rem,5.5vw,4.4rem)] font-semibold leading-[1.0] tracking-tight text-ink">
          {title}
        </h1>
        {intro && <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-muted">{intro}</p>}
      </div>
    </section>
  );
}

export function ConsultationCta({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 pb-20 sm:px-7">
      <div className="flex flex-col items-start justify-between gap-6 rounded-[1.5rem] border border-line bg-surface-soft p-8 backdrop-blur sm:flex-row sm:items-center">
        <div>
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-accent">Ready when you are</p>
          <p className="mt-2 font-display text-2xl font-semibold leading-snug text-ink sm:text-3xl">
            {compact ? "Tell us about the project you’re imagining." : "Every exceptional building begins with a conversation."}
          </p>
        </div>
        <Link
          href="/request-consultation"
          className="group inline-flex h-[52px] shrink-0 items-center gap-2 rounded-full bg-ink px-7 text-[0.88rem] font-bold text-ivory-50 transition hover:bg-accent-dark"
        >
          Request a Consultation
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
