import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, ConsultationCta } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";
import { ArrowRight, Check } from "lucide-react";

export const metadata: Metadata = {
  title: "Services",
  description: "Architectural design, interior architecture, design advisory, project coordination — end-to-end support for serious, design-led projects.",
};

const SERVICES = [
  {
    no: "01",
    title: "Architectural Design",
    body: "Concept design, spatial planning, facade development, and complete detailed design packages for new builds and major renovations.",
    includes: ["Feasibility & site appraisal", "Concept and planning logic", "Façade and material development", "Technical drawing packages", "Heritage & planning submissions"],
  },
  {
    no: "02",
    title: "Interior Architecture",
    body: "Interior layouts, finish palettes, lighting direction, custom joinery design, and atmosphere-led material selection.",
    includes: ["Space planning & joinery design", "Lighting and atmosphere", "Material and finish palettes", "Furniture curation & procurement", "Art and accessory placement"],
  },
  {
    no: "03",
    title: "Design Advisory",
    body: "Feasibility studies, site reviews, project visioning, and strategic input for property owners, developers and brands.",
    includes: ["Feasibility & yield studies", "Site selection reviews", "Brand-space translation", "Design due diligence", "Portfolio strategy"],
  },
  {
    no: "04",
    title: "Project Coordination",
    body: "Documentation support and collaboration with consultants, contractors, and fabricators through full project delivery.",
    includes: ["Consultant coordination", "Documentation management", "Site review & quality oversight", "Procurement support", "Handover & aftercare"],
  },
];

const CAPABILITIES = [
  "Private residences & villas",
  "Workplace & commercial interiors",
  "Boutique hospitality & F&B",
  "Cultural & civic buildings",
  "Adaptive reuse & refurbishment",
  "Gallery & exhibition environments",
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="End-to-end support for serious, design-led projects."
        intro="From the first site visit to the final handover photograph, Design Brooks carries the full arc of the work — architecture, interiors, advisory and delivery — under one accountable roof."
      />

      <section className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-7">
        <div className="grid gap-5 lg:grid-cols-2">
          {SERVICES.map((s) => (
            <article key={s.no} className="group flex flex-col rounded-[1.5rem] border border-line bg-surface-soft p-7 backdrop-blur transition hover:-translate-y-1 hover:shadow-soft">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="font-display text-[1.9rem] font-semibold leading-tight text-ink">{s.title}</h2>
                <span className="font-display text-3xl font-semibold text-sand">{s.no}</span>
              </div>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{s.body}</p>
              <ul className="mt-5 grid gap-2 border-t border-line pt-5">
                {s.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[0.86rem] text-ink/85">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Capabilities strip */}
      <section className="border-y border-line bg-ivory-100/70">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-7">
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-accent">Capabilities</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CAPABILITIES.map((c) => (
              <li key={c} className="rounded-full border border-line-strong bg-white/70 px-4 py-2 text-[0.84rem] font-semibold text-ink">{c}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-7">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">FAQ</p>
        <h2 className="mt-3 font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-semibold leading-[1.05] text-ink">Helpful details before we begin.</h2>
        <div className="mt-8 grid gap-3">
          {[
            ["What kind of projects do you take on?", "Residential, hospitality, workplace, and selected cultural projects — including new builds, interior architecture, and high-value refurbishments."],
            ["Can you work with existing buildings?", "Yes. Refurbishment and adaptive reuse are a core part of our work, especially where layout, identity and finish quality need a strong redesign strategy."],
            ["Do you collaborate with contractors and consultants?", "Yes. We regularly coordinate with structural, MEP, lighting, landscape and construction teams to keep design and delivery aligned."],
            ["Where are you based?", "Lagos and New York, with project teams that collaborate remotely and on site across West Africa, Europe, North America and Australia."],
          ].map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-line bg-surface-soft p-6">
              <summary className="cursor-pointer list-none font-display text-[1.35rem] font-semibold text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">{q}<span className="text-accent transition-transform group-open:rotate-45">+</span></span>
              </summary>
              <p className="mt-3 max-w-3xl text-[0.92rem] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <ConsultationCta compact />
    </>
  );
}
