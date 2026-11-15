import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ShieldX } from "lucide-react";
import { PortalView } from "@/components/client/portal-view";
import { resolveClientToken } from "@/lib/server/client-links";
import { prisma } from "@/lib/server/db";
import { mapDocument } from "@/lib/server/queries";
import { logActivity } from "@/lib/server/activity";

export const metadata: Metadata = {
  title: "Project Portal",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ivory-200 text-ink">
      <header className="sticky top-0 z-30 border-b border-line bg-ivory-100/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/loggoo.webp" alt="Design Brooks logo" width={40} height={40} className="h-10 w-10 rounded-xl object-cover shadow-soft" />
            <span className="text-[0.72rem] font-extrabold uppercase leading-tight tracking-[0.18em] text-ink">Design<br />Brooks</span>
          </Link>
          <span className="text-[0.72rem] font-bold uppercase tracking-[0.2em] text-muted">Private Project Portal</span>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-line bg-ivory-100/60">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col items-center justify-between gap-2 px-4 py-5 text-[0.7rem] text-faint sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} Design Brooks · Private document portal <span className="text-white/30">·</span> Powered by{" "}
            <a
              href="https://simidaniels.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-accent-dark transition-colors hover:text-accent hover:underline underline-offset-2"
            >
              Simidaniels
            </a>
          </p>
          <p>Documents are confidential to the intended recipient.</p>
        </div>
      </footer>
    </div>
  );
}

function BlockedScreen({ variant }: { variant: "expired" | "invalid" }) {
  const copy =
    variant === "expired"
      ? { title: "This link has expired.", body: "The private link you used is no longer valid. Ask your project lead at Design Brooks to send you a fresh one." }
      : { title: "This link is no longer active.", body: "The link may be mistyped, withdrawn, or revoked. Contact your project lead at Design Brooks for assistance, or request a fresh link." };

  return (
    <ClientShell>
      <div className="mx-auto flex w-full max-w-[620px] flex-col items-center px-6 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <ShieldX className="h-8 w-8" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink">{copy.title}</h1>
        <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-muted">{copy.body}</p>
        <Link href="/contact" className="mt-8 inline-flex h-12 items-center rounded-full bg-ink px-6 text-[0.85rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
          Contact the studio
        </Link>
      </div>
    </ClientShell>
  );
}

export default async function ClientProjectPage({ params }: { params: Promise<{ token: string }> }) {
  const { token: rawToken } = await params;
  const token = decodeURIComponent(rawToken ?? "");

  const link = await resolveClientToken(token);
  if (!link) {
    return <BlockedScreen variant="invalid" />;
  }
  if (link.status === "EXPIRED") {
    return <BlockedScreen variant="expired" />;
  }
  if (link.status !== "ACTIVE") {
    return <BlockedScreen variant="invalid" />;
  }

  // Count the open + remember it (every valid portal load)
  await prisma.projectAccessLink
    .update({
      where: { id: link.id },
      data: { openCount: { increment: 1 }, lastAccessedAt: new Date() },
    })
    .catch(() => undefined);
  await logActivity({
    actorType: "CLIENT",
    action: "Project link opened",
    detail: `${link.project.name} · reference ${link.project.reference}`,
    projectId: link.projectId,
    accessLinkId: link.id,
  });

  const documentRows = await prisma.document.findMany({
    where: { projectId: link.projectId, archivedAt: null },
    orderBy: [{ category: "asc" }, { createdAt: "asc" }],
  });
  const documents = documentRows.map(mapDocument);

  return (
    <ClientShell>
      <PortalView
        project={{
          name: link.project.name,
          reference: link.project.reference ?? "—",
          location: link.project.location ?? undefined,
          description: link.project.description ?? undefined,
          clientName: link.project.client.fullName,
          createdAt: link.project.createdAt.toISOString(),
        }}
        documents={documents}
        token={token}
      />
    </ClientShell>
  );
}
