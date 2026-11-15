import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { PageHero, ConsultationCta } from "@/components/public/page-hero";
import { portfolioProjects } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Selected Projects",
  description: "Residential, workplace, cultural and adaptive reuse projects by Design Brooks — New York, Lagos, Berlin, Sydney and Ottawa.",
};

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Selected Projects"
        title="Distinct work across residential, workplace, and cultural environments."
        intro="A selection of built work and current studies. Each project page describes the brief, the response, and the disciplines involved."
      />

      <section className="mx-auto grid w-full max-w-[1180px] gap-6 px-5 py-16 sm:grid-cols-2 sm:px-7">
        {portfolioProjects.map((project) => (
          <Link
            key={project.slug}
            href={`/portfolio/${project.slug}`}
            className="group overflow-hidden rounded-[1.5rem] border border-line bg-surface-soft shadow-soft transition hover:-translate-y-1 hover:shadow-card"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={project.image}
                alt={project.title}
                fill
                sizes="(min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute right-4 top-4 rounded-full bg-ink/70 p-2 backdrop-blur transition group-hover:bg-accent">
                <ArrowUpRight className="h-4 w-4 text-ivory-50" aria-hidden="true" />
              </span>
            </div>
            <div className="p-6">
              <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.18em] text-accent">
                {project.category} · {project.location} · {project.year}
              </p>
              <h2 className="mt-2 font-display text-[1.7rem] font-semibold leading-tight text-ink">{project.title}</h2>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">{project.summary}</p>
            </div>
          </Link>
        ))}
      </section>

      <ConsultationCta />
    </>
  );
}
