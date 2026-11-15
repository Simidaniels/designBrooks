import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ConsultationCta } from "@/components/public/page-hero";
import { portfolioProjects } from "@/lib/site-content";

export function generateStaticParams() {
  return portfolioProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => p.slug === slug);
  return project
    ? { title: project.title, description: project.summary }
    : { title: "Project" };
}

export default async function PortfolioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  const others = portfolioProjects.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <>
      {/* Hero image band */}
      <section className="relative">
        <div className="relative h-[52vh] min-h-[360px] w-full overflow-hidden">
          <Image src={project.image} alt={project.title} fill priority sizes="100vw" className="object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/25 to-transparent" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto w-full max-w-[1180px] px-5 pb-8 sm:px-7">
              <Link href="/portfolio" className="inline-flex items-center gap-2 text-[0.78rem] font-bold uppercase tracking-[0.18em] text-ivory-100/80 transition hover:text-ivory-50">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All projects
              </Link>
              <p className="mt-4 text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-gold">
                {project.category} · {project.location} · {project.year}
              </p>
              <h1 className="mt-2 max-w-3xl font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.0] text-ivory-50">
                {project.title}
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto grid w-full max-w-[1180px] gap-12 px-5 py-14 sm:px-7 lg:grid-cols-[1.4fr_1fr]">
        <article>
          {project.body.map((para, i) => (
            <p key={i} className="mb-5 max-w-[62ch] text-[1.02rem] leading-[1.75] text-ink/90">{para}</p>
          ))}
        </article>
        <aside className="h-fit rounded-[1.5rem] border border-line bg-surface-soft p-6 backdrop-blur">
          <h2 className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">Project facts</h2>
          <dl className="mt-4 grid gap-4 text-[0.88rem]">
            {[
              ["Category", project.category],
              ["Location", project.location],
              ["Year", project.year],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <dt className="text-muted">{k}</dt>
                <dd className="font-semibold text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-6 text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-accent">Disciplines</h3>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.services.map((s) => (
              <li key={s} className="rounded-full border border-line-strong bg-white/70 px-3 py-1.5 text-[0.78rem] font-semibold text-ink">{s}</li>
            ))}
          </ul>
          <Link href="/request-consultation" className="group mt-7 inline-flex items-center gap-2 text-[0.85rem] font-bold text-accent-dark">
            Discuss a similar project
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </aside>
      </section>

      {/* Next projects */}
      <section className="border-t border-line bg-ivory-100/60">
        <div className="mx-auto w-full max-w-[1180px] px-5 py-12 sm:px-7">
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-accent">Continue exploring</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {others.map((p) => (
              <Link key={p.slug} href={`/portfolio/${p.slug}`} className="group flex items-center gap-5 rounded-2xl border border-line bg-surface-soft p-4 transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
                  <Image src={p.image} alt={p.title} fill sizes="112px" className="object-cover" />
                </div>
                <div>
                  <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.18em] text-accent">{p.category} · {p.location}</p>
                  <p className="mt-1 font-display text-xl font-semibold leading-tight text-ink">{p.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ConsultationCta compact />
    </>
  );
}
