import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { insightPosts } from "@/lib/site-content";
import { formatDate } from "@/lib/utils";

export function generateStaticParams() {
  return insightPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = insightPosts.find((p) => p.slug === slug);
  return post ? { title: post.title, description: post.excerpt } : { title: "Insight" };
}

export default async function InsightDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = insightPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <article className="mx-auto w-full max-w-[840px] px-5 py-14 sm:px-7 sm:py-20">
      <Link href="/insights" className="inline-flex items-center gap-2 text-[0.76rem] font-bold uppercase tracking-[0.18em] text-muted transition hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All insights
      </Link>
      <p className="mt-6 text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-accent">
        {post.category} · {formatDate(post.date)} · {post.readTime}
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.02] tracking-tight text-ink">
        {post.title}
      </h1>
      <div className="mt-8 border-t border-line pt-8">
        {post.body.map((para, i) => (
          <p key={i} className="mb-6 text-[1.05rem] leading-[1.8] text-ink/90">{para}</p>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-8">
        <p className="text-[0.85rem] text-muted">Written by the Design Brooks studio.</p>
        <Link href="/request-consultation" className="group inline-flex items-center gap-2 text-[0.85rem] font-bold text-accent-dark">
          Work with the studio
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
