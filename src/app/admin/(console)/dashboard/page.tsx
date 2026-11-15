import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Building2,
  Hammer,
  CheckCircle2,
  FileText,
  ArrowRight,
  ArrowUpRight,
  Link2,
  Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ProjectStatusBadge, InquiryStatusBadge } from "@/components/admin/status-badge";
import { prisma } from "@/lib/server/db";
import { mapProject, mapDocument, mapActivity, mapInquiry } from "@/lib/server/queries";
import { CATEGORY_LABELS, formatDate, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [
    clientCount,
    projectCount,
    activeCount,
    completedCount,
    documentCount,
    newInquiryCount,
    activeProjects,
    recentActivity,
    recentInquiries,
    recentDocuments,
    latestDocument,
    documentsLast28Days,
  ] = await Promise.all([
    prisma.client.count({ where: { archivedAt: null } }),
    prisma.project.count(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.document.count({ where: { archivedAt: null } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.project.findMany({
      where: { status: "ACTIVE" },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: { client: { select: { fullName: true } } },
    }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
    prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.document.findMany({
      where: { archivedAt: null },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { project: { select: { name: true } } },
    }),
    prisma.document.findFirst({ orderBy: { createdAt: "desc" }, select: { createdAt: true } }),
    prisma.document.findMany({
      where: { createdAt: { gte: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000) } },
      select: { createdAt: true },
    }),
  ]);

  // Trailing 7-day upload chart anchored to the latest upload (or today)
  const anchor = latestDocument?.createdAt ?? new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(anchor);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const uploadsPerDay = days.map((day) => {
    const key = day.toDateString();
    return documentsLast28Days.filter((d) => d.createdAt.toDateString() === key).length;
  });
  const maxUploads = Math.max(1, ...uploadsPerDay);

  const active = activeProjects.map(mapProject);
  const activity = recentActivity.map(mapActivity);
  const inquiries = recentInquiries.map(mapInquiry);
  const clientNameByProject = new Map(activeProjects.map((p) => [p.id, p.client.fullName]));

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Good morning, Design Brooks."
        description="A calm summary of the studio — clients, projects, documents and link activity. Revenue is intentionally not shown: the MVP does not process payments."
        actions={
          <Link href="/admin/projects/new" className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-[0.82rem] font-bold text-ivory-50 transition hover:bg-accent-dark">
            New project <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total clients" value={clientCount} icon={Users} />
        <StatCard label="Total projects" value={projectCount} icon={Building2} hint="across all clients" />
        <StatCard label="Active projects" value={activeCount} icon={Hammer} hint="in delivery" />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle2} hint="handed over" />
        <StatCard label="Documents" value={documentCount} icon={FileText} hint="in the portal" />
        <StatCard label="New inquiries" value={newInquiryCount} icon={Inbox} hint="awaiting reply" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Left column */}
        <div className="grid gap-6">
          {/* Active projects */}
          <section className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Active projects</h2>
              <Link href="/admin/projects" className="text-[0.75rem] font-bold text-accent-dark hover:underline">View all →</Link>
            </div>
            {active.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line-strong p-6 text-center text-[0.85rem] text-muted">
                No active projects yet — <Link href="/admin/projects/new" className="font-bold text-accent-dark hover:underline">create the first one</Link>.
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-line">
                {active.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/projects/${p.id}`} className="group flex items-center gap-4 py-3">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.coverImage} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.88rem] font-bold text-ink transition group-hover:text-accent-dark">{p.name}</span>
                        <span className="mt-0.5 block text-[0.7rem] text-muted">{clientNameByProject.get(p.id)} · {p.reference}</span>
                      </span>
                      <ProjectStatusBadge status={p.status} />
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-faint transition group-hover:text-accent-dark" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Upload rhythm */}
          <section className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Uploads — trailing 7 days</h2>
              <Link href="/admin/documents/upload" className="text-[0.75rem] font-bold text-accent-dark hover:underline">Upload document →</Link>
            </div>
            <div className="mt-4 grid h-36 grid-cols-7 items-end gap-2" role="img" aria-label="Documents uploaded per day over the trailing 7 days">
              {days.map((day, i) => (
                <div key={i} className="flex h-full flex-col items-center justify-end gap-1.5">
                  <span className="text-[0.65rem] font-bold tabular-nums text-muted">{uploadsPerDay[i] || ""}</span>
                  <div
                    className="w-full rounded-t-md bg-accent/70 transition-all"
                    style={{ height: `${(uploadsPerDay[i] / maxUploads) * 72 + 4}%` }}
                  />
                  <span className="text-[0.6rem] font-bold uppercase text-faint">{day.toLocaleDateString("en-GB", { weekday: "short" })}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right column — activity + inquiries */}
        <div className="grid gap-6">
          <section className="rounded-2xl border border-line bg-ink p-5 text-ivory-100 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-gold">Recent activity</h2>
              <Link href="/admin/activity" className="text-[0.75rem] font-bold text-ivory-100/60 hover:text-ivory-50">Full log →</Link>
            </div>
            {activity.length === 0 ? (
              <p className="mt-4 text-[0.82rem] text-ivory-100/55">No activity yet. Actions you take in the console will appear here.</p>
            ) : (
              <ol className="mt-4 grid gap-3">
                {activity.map((event) => (
                  <li key={event.id} className="flex items-start gap-3 border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold/70" aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="block text-[0.78rem] font-bold leading-snug text-ivory-100/90">{event.action}</span>
                      <span className="mt-0.5 block truncate text-[0.7rem] text-ivory-100/55">{event.detail}</span>
                      <span className="mt-1 block text-[0.62rem] uppercase tracking-wider text-ivory-100/35">{timeAgo(event.at)} · {event.actor}</span>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Recent inquiries</h2>
              <Link href="/admin/inquiries" className="text-[0.75rem] font-bold text-accent-dark hover:underline">View all →</Link>
            </div>
            {inquiries.length === 0 ? (
              <p className="mt-3 text-[0.82rem] text-muted">No inquiries yet. Submissions from the public site appear here.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {inquiries.map((inq) => (
                  <li key={inq.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block truncate text-[0.82rem] font-bold text-ink">{inq.name}</span>
                      <span className="block text-[0.68rem] text-muted">{inq.service}{inq.location ? ` · ${inq.location}` : ""} · {formatDate(inq.createdAt)}</span>
                    </span>
                    <InquiryStatusBadge status={inq.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface-soft p-5 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-muted">Recent uploads</h2>
              <Link href="/admin/documents" className="text-[0.75rem] font-bold text-accent-dark hover:underline">Documents →</Link>
            </div>
            {recentDocuments.length === 0 ? (
              <p className="mt-3 text-[0.82rem] text-muted">Nothing uploaded yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-line">
                {recentDocuments.map((doc) => {
                  const mapped = mapDocument(doc);
                  return (
                    <li key={doc.id} className="py-2.5">
                      <span className="flex items-center justify-between gap-3">
                        <span className="min-w-0">
                          <span className="block truncate text-[0.82rem] font-bold text-ink">{mapped.name}</span>
                          <span className="block text-[0.68rem] text-muted">{doc.project.name} · {CATEGORY_LABELS[mapped.category]} · {timeAgo(mapped.uploadedAt)}</span>
                        </span>
                        {mapped.status === "processing" || mapped.status === "failed" ? (
                          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.6rem] font-extrabold uppercase tracking-wider ${mapped.status === "failed" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}>
                            {mapped.status}
                          </span>
                        ) : (
                          <Link2 className="h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
