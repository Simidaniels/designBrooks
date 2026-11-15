import type { Metadata } from "next";
import { PageHero } from "@/components/public/page-hero";
import { InquiryForm } from "@/components/public/inquiry-form";

export const metadata: Metadata = {
  title: "Request a Consultation",
  description: "Book an initial consultation with the Design Brooks studio — for private clients, brands, developers and institutions.",
};

export default function RequestConsultationPage() {
  return (
    <>
      <PageHero
        eyebrow="Request a Consultation"
        title="Every exceptional building begins with a conversation."
        intro="A focused 45-minute consultation to read your brief, test the ambition against budget and site, and outline how the studio could carry the work. Complimentary for qualified projects."
      />

      <section className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-16 sm:px-7 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="h-fit rounded-[1.5rem] border border-line bg-ivory-100/70 p-7">
          <h2 className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">What to expect</h2>
          <ol className="mt-4 grid gap-4 text-[0.9rem] leading-relaxed text-ink/90">
            {[
              "A short call to understand your site, ambitions and timeline.",
              "An outline of scope, likely programme and fee structure.",
              "If we’re a fit, a written proposal and first-visit date.",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[0.72rem] font-bold text-ivory-50">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-6 border-t border-line pt-5 text-[0.8rem] text-muted">
            Prefer email? <a className="font-semibold text-accent-dark underline-offset-2 hover:underline" href="mailto:hello@designbrooks.com">hello@designbrooks.com</a>
          </div>
        </aside>

        <div className="rounded-[1.5rem] border border-line bg-surface-soft p-7 backdrop-blur sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">Your project brief</h2>
          <p className="mt-1 text-[0.84rem] text-muted">Fields marked * are required.</p>
          <div className="mt-6">
            <InquiryForm variant="consultation" />
          </div>
        </div>
      </section>
    </>
  );
}
