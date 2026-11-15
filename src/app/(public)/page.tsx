import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Compass, DraftingCompass, Handshake, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/public/reveal";
import { portfolioProjects } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Design Brooks | Architecture & Interiors — Lagos, Nigeria",
  description:
    "Design Brooks is a multidisciplinary architecture and interiors studio delivering thoughtful residential, hospitality, workplace, and cultural environments.",
};

const VALUES = [
  { icon: DraftingCompass, label: "Disciplined Design", body: "Clear concepts, elegant proportions, and highly resolved detailing." },
  { icon: ShieldCheck, label: "Professional Delivery", body: "Structured process, consultant coordination, and dependable communication." },
  { icon: Handshake, label: "Client-Centered", body: "Design decisions shaped around lifestyle, operations, and long-term value." },
];

const SERVICES = [
  { title: "Architectural Design", body: "Concept design, spatial planning, facade development, and detailed design packages for new builds and major renovations." },
  { title: "Interior Architecture", body: "Interior layouts, finish palettes, lighting direction, custom joinery design, and atmosphere-led material selection." },
  { title: "Design Advisory", body: "Feasibility studies, site reviews, project visioning, and strategic input for property owners and developers." },
  { title: "Project Coordination", body: "Documentation support and collaboration with consultants, contractors, and fabricators through delivery." },
];

export default function HomePage() {
  const featured = portfolioProjects.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      {/* ————— HERO ————— */}
      <section className="mx-auto grid w-full max-w-[1180px] items-center gap-10 px-5 pb-16 pt-10 sm:px-7 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pt-16">
        <div>
          <Reveal>
            <p className="mb-5 flex items-center gap-3 text-[0.7rem] font-extrabold uppercase tracking-[0.22em] text-accent">
              <Compass className="h-4 w-4" aria-hidden="true" /> Architecture · Interiors · Spatial Strategy
            </p>
          </Reveal>
          <Reveal>
            <h1 className="font-display text-[clamp(3.4rem,8vw,6.4rem)] font-semibold leading-[0.97] tracking-tight text-ink">
              Designed with restraint.<br />Built to feel<br />exceptional.
            </h1>
          </Reveal>
          <Reveal>
            <p className="mt-6 max-w-[34rem] text-[1.02rem] leading-relaxed text-muted">
              Design Brooks is a multidisciplinary architecture and interiors studio delivering
              thoughtful residential, hospitality, workplace, and cultural environments —
              with clarity, precision, and calm design leadership.
            </p>
          </Reveal>
          <Reveal>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/portfolio" className="group inline-flex h-[52px] items-center gap-2 rounded-full bg-ink px-7 text-[0.9rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
                Explore Projects
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link href="/request-consultation" className="inline-flex h-[52px] items-center rounded-full border border-line-strong bg-white/60 px-7 text-[0.9rem] font-bold text-ink transition hover:border-accent hover:text-accent-dark">
                Request a Consultation
              </Link>
            </div>
          </Reveal>
          <Reveal>
            <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6">
              {[["12+", "Years of design practice"], ["48", "Completed private & commercial projects"], ["4", "Countries with built work"]].map(([n, d]) => (
                <div key={n}>
                  <dt className="font-display text-[2rem] font-semibold leading-none text-accent-dark">{n}</dt>
                  <dd className="mt-1.5 text-[0.74rem] leading-snug text-muted">{d}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        {/* Hero collage — preserved from the legacy site, modernised */}
        <Reveal className="relative mx-auto min-h-[420px] w-full max-w-[560px] sm:min-h-[560px] lg:min-h-[660px]">
          <div className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-card sm:left-16">
            <Image src="/images/house.jpg" alt="Design Brooks residential architecture project in Ikoyi" fill priority sizes="(min-width:1024px) 45vw, 90vw" className="object-cover" />
          </div>
          <div className="absolute bottom-4 left-0 h-40 w-32 overflow-hidden rounded-2xl border-[6px] border-ivory-100 shadow-card sm:bottom-12 sm:h-56 sm:w-48 lg:h-64 lg:w-56">
            <Image src="/images/gray-sofa.webp" alt="Design Brooks interior design detail" fill sizes="(min-width:1024px) 20vw, 40vw" className="object-cover" />
          </div>
          <div className="absolute bottom-40 right-1 max-w-[210px] rounded-2xl bg-ink/95 p-4 text-ivory-100 shadow-soft backdrop-blur sm:bottom-44 sm:right-2 sm:max-w-[240px] sm:p-5">
            <p className="text-[0.6rem] font-extrabold uppercase tracking-[0.2em] text-gold">Current focus</p>
            <p className="mt-1.5 text-[0.8rem] leading-snug text-ivory-100/90">High-end residential, adaptive reuse, boutique hospitality.</p>
          </div>
        </Reveal>
      </section>

      {/* ————— INTRO STATEMENT ————— */}
      <section className="mx-auto w-full max-w-[1180px] px-5 pb-16 sm:px-7">
        <Reveal>
          <p className="max-w-[62rem] font-display text-[clamp(1.9rem,4vw,3.3rem)] font-medium leading-[1.08] text-ink">
            We create architecture that is visually quiet, materially rich, and confidently
            resolved from concept to completion.
          </p>
        </Reveal>
      </section>

      {/* ————— VALUES ————— */}
      <section className="mx-auto grid w-full max-w-[1180px] gap-4 px-5 pb-20 sm:grid-cols-3 sm:px-7">
        {VALUES.map(({ icon: Icon, label, body }) => (
          <Reveal key={label}>
            <div className="h-full rounded-2xl border border-line bg-surface-soft p-6 backdrop-blur">
              <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
              <p className="mt-4 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-accent">{label}</p>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">{body}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ————— FEATURED PROJECTS ————— */}
      <section className="bg-ink py-20 text-ivory-100">
        <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-7">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-gold">Selected Projects</p>
              <h2 className="mt-3 max-w-xl font-display text-[clamp(2.2rem,4.5vw,3.6rem)] font-semibold leading-[1.02]">
                Distinct work across three continents.
              </h2>
            </div>
            <Link href="/portfolio" className="group inline-flex items-center gap-2 text-[0.85rem] font-bold text-ivory-100/80 transition hover:text-ivory-50">
              View all projects
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featured.map((project) => (
              <Link key={project.slug} href={`/portfolio/${project.slug}`} className="group">
                <figure className="overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      sizes="(min-width:768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute right-4 top-4 rounded-full bg-ink/70 p-2 backdrop-blur transition group-hover:bg-accent">
                      <ArrowUpRight className="h-4 w-4 text-ivory-50" aria-hidden="true" />
                    </span>
                  </div>
                  <figcaption className="flex items-baseline justify-between gap-4 border-b border-white/10 py-4">
                    <div>
                      <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.18em] text-gold">{project.category} · {project.location}</p>
                      <h3 className="mt-1.5 font-display text-2xl font-semibold leading-tight text-ivory-50">{project.title}</h3>
                    </div>
                    <span className="text-[0.75rem] tabular-nums text-ivory-100/50">{project.year}</span>
                  </figcaption>
                </figure>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ————— SERVICES PREVIEW ————— */}
      <section className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-7">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">Services</p>
        <h2 className="mt-3 max-w-2xl font-display text-[clamp(2.2rem,4.5vw,3.6rem)] font-semibold leading-[1.02] text-ink">
          End-to-end support for serious, design-led projects.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service, i) => (
            <div key={service.title} className="group rounded-2xl border border-line bg-surface-soft p-6 backdrop-blur transition hover:-translate-y-1 hover:shadow-soft">
              <span className="font-display text-3xl font-semibold text-sand">0{i + 1}</span>
              <h3 className="mt-4 font-display text-[1.5rem] font-semibold leading-tight text-ink">{service.title}</h3>
              <p className="mt-2 text-[0.84rem] leading-relaxed text-muted">{service.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/services" className="group inline-flex items-center gap-2 text-[0.85rem] font-bold text-accent-dark">
            Explore full services & process
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ————— CTA BAND ————— */}
      <section className="mx-auto w-full max-w-[1180px] px-5 pb-20 sm:px-7">
        <div className="relative overflow-hidden rounded-[2rem] shadow-card">
          <Image src="/images/office.webp" alt="Design Brooks studio with project model" fill sizes="100vw" className="object-cover object-[60%_35%]" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900/85 via-ink-900/45 to-transparent" />
          <div className="relative max-w-lg p-8 sm:p-12">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-gold">Start a Project</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.02] text-ivory-50">
              Have a site, a brief, or an ambition? Let’s read it together.
            </h2>
            <Link href="/request-consultation" className="mt-7 inline-flex h-[52px] items-center gap-2 rounded-full bg-gold px-7 text-[0.9rem] font-extrabold text-ink-900 transition hover:bg-ivory-50">
              Request a consultation
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
