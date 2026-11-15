import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { insightPosts } from "@/lib/site-content";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Insights",
  description: "Studio notes, material intelligence and practice essays from Design Brooks.",
};

export default function InsightsPage() {
  const [lead, ...rest] = insightPosts;

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Notes from the studio."
        intro="Occasional essays on architecture, materials and practice — written by the people who draw the lines."
      />

      <section className="mx-auto w-full max-w-[1180px] px-5 py-16 sm:px-7">
        {/* Lead article */}
        <Link href={`/insights/${lead.slug}`} className="group block overflow-hidden rounded-[1.5rem] border border-line bg-ink text-ivory-100 transition hover:shadow-card">
          <div className="grid gap-6 p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.2em] text-gold">{lead.category} · {formatDate(lead.date)} · {lead.readTime}</p>
              <h2 className="mt-4 font-display text-[clamp(1.8rem,3.5vw,3rem)] font-semibold leading-[1.05] text-ivory-50">{lead.title}</h2>
              <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-ivory-100/75">{lead.excerpt}</p>
            </div>
            <div className="flex lg:justify-end">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[0.8rem] font-bold uppercase tracking-wider text-ivory-100/80 transition group-hover:border-gold group-hover:text-gold">
                Read the essay <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
          </div>
        </Link>

        {/* Remaining posts */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {rest.map((post) => (
            <Link key={post.slug} href={`/insights/${post.slug}`} className="group rounded-[1.5rem] border border-line bg-surface-soft p-7 backdrop-blur transition hover:-translate-y-1 hover:shadow-soft">
              <p className="text-[0.64rem] font-extrabold uppercase tracking-[0.18em] text-accent">{post.category} · {formatDate(post.date)} · {post.readTime}</p>
              <h3 className="mt-3 font-display text-[1.6rem] font-semibold leading-snug text-ink">{post.title}</h3>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">{post.excerpt}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-[0.8rem] font-bold text-accent-dark">Read essay <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
