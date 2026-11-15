import type { Metadata } from "next";
import Image from "next/image";
import { PageHero, ConsultationCta } from "@/components/public/page-hero";
import { Reveal } from "@/components/public/reveal";

export const metadata: Metadata = {
  title: "The Studio",
  description: "Design Brooks is a multidisciplinary architecture and interiors studio rooted in precision, atmosphere and real-world function. Lagos · New York · Berlin collaborations.",
};

const PRINCIPLES = [
  { title: "Context first", body: "Every project begins with a careful reading of site, brief, budget and emotional tone." },
  { title: "Material honesty", body: "We specify what ages well — stone, limewash, oak, brass — and let surfaces carry rooms." },
  { title: "Spatial calm", body: "Clean geometry, natural light and quiet proportions over decoration." },
  { title: "Buildable creativity", body: "Rigorous documentation and consultant coordination keep design intent intact on site." },
];

const PROCESS = [
  { step: "01", title: "Brief & Discovery", body: "Goals, spatial needs, budget parameters, timelines and the intended emotional quality of the space." },
  { step: "02", title: "Concept Development", body: "Early studies translate the brief into a coherent design direction, planning logic and material narrative." },
  { step: "03", title: "Detail & Coordination", body: "Drawings, specifications and technical decisions refined so the design moves into execution with confidence." },
  { step: "04", title: "Delivery Support", body: "Throughout procurement and construction, we protect design intent and maintain quality outcomes." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="The Studio"
        title="Professional design rooted in precision, atmosphere, and real-world function."
        intro="Design Brooks was founded on a simple conviction: architecture should be visually quiet, materially rich, and resolved with total clarity — from first sketch to final handover."
      />

      <section className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-16 sm:px-7 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-line bg-surface-soft p-8 backdrop-blur">
          <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">Our Philosophy</p>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink">
            Every project begins with a careful reading of context: the site, the brief, the budget,
            and the emotional tone the space should carry. We shape each response through a disciplined
            design process that keeps creativity purposeful and buildable.
          </p>
          <p className="mt-4 text-[1.05rem] leading-relaxed text-ink">
            Our work is defined by clean geometry, layered material palettes, natural light, and a strong
            sense of spatial calm. The outcome is architecture that feels contemporary, durable, and deeply
            considered — and a delivery process clients describe as calm.
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6">
            {[["12+", "Years practice"], ["48", "Projects delivered"], ["92%", "Referral clients"], ["4", "Countries"]].map(([n, d]) => (
              <div key={n}>
                <dt className="font-display text-4xl font-semibold text-accent-dark">{n}</dt>
                <dd className="mt-1 text-[0.75rem] uppercase tracking-wider text-muted">{d}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative min-h-[380px] overflow-hidden rounded-[2rem] shadow-card">
          <Image src="/images/office.webp" alt="Design Brooks studio — project model table in New York" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover object-[60%_40%]" />
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto w-full max-w-[1180px] px-5 pb-16 sm:px-7">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">Principles</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map((p) => (
            <Reveal key={p.title}>
              <div className="h-full rounded-2xl border border-line bg-surface-soft p-6">
                <h2 className="font-display text-[1.4rem] font-semibold text-ink">{p.title}</h2>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">{p.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto w-full max-w-[1180px] px-5 pb-16 sm:px-7">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">Process</p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(1.8rem,3.5vw,2.8rem)] font-semibold leading-[1.05] text-ink">A structured approach that keeps creative work disciplined and buildable.</h2>
        <ol className="mt-8 grid gap-4">
          {PROCESS.map((step) => (
            <li key={step.step} className="grid grid-cols-[64px_1fr] items-start gap-5 rounded-2xl border border-line bg-surface-soft p-6 sm:grid-cols-[88px_220px_1fr]">
              <span className="font-display text-4xl font-semibold text-accent/80">{step.step}</span>
              <h3 className="font-display text-2xl font-semibold text-ink">{step.title}</h3>
              <p className="col-span-2 text-[0.9rem] leading-relaxed text-muted sm:col-span-1">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <ConsultationCta />
    </>
  );
}
