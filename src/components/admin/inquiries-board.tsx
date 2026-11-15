"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Mail,
  Check,
  Archive,
  MessageSquare,
  Loader2,
  Inbox,
  ChevronDown,
  FileText,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/admin/page-header";
import { InquiryStatusBadge } from "@/components/admin/status-badge";
import { setInquiryStatusAction, markInquiryReadAction } from "@/lib/actions/inquiries";
import { cn, formatDateTime } from "@/lib/utils";
import type { Inquiry, InquiryStatus } from "@/lib/types";

const FILTERS: Array<"all" | InquiryStatus> = ["all", "new", "contacted", "converted", "archived"];

export function InquiriesBoard({ inquiries }: { inquiries: Inquiry[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | InquiryStatus>("all");
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const counts = React.useMemo(
    () =>
      FILTERS.reduce<Record<string, number>>((acc, f) => {
        acc[f] = f === "all" ? inquiries.length : inquiries.filter((i) => i.status === f).length;
        return acc;
      }, {}),
    [inquiries]
  );
  const unreadCount = inquiries.filter((i) => i.status === "new" && !i.isRead).length;

  const visible = inquiries.filter((i) => {
    if (filter !== "all" && i.status !== filter) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [i.name, i.email, i.service, i.location, i.description]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const openInquiry = async (inquiry: Inquiry) => {
    const opening = openId !== inquiry.id;
    setOpenId((current) => (current === inquiry.id ? null : inquiry.id));
    if (opening && !inquiry.isRead) {
      await markInquiryReadAction(inquiry.id);
      router.refresh();
    }
  };

  const advance = async (id: string, status: InquiryStatus) => {
    setBusyId(id);
    await setInquiryStatusAction(id, status);
    setBusyId(null);
    router.refresh();
  };

  if (inquiries.length === 0) {
    return (
      <EmptyState
        icon={<Inbox className="h-10 w-10" />}
        title="No inquiries yet"
        body="Submissions from the public contact and consultation forms will appear here."
      />
    );
  }

  return (
    <div>
      {/* ————— Toolbar: search + status filters ————— */}
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, service, location…"
            aria-label="Search inquiries"
            className="h-11 rounded-xl border-line-strong bg-white/85 pl-11"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-faint transition hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={cn(
                "rounded-full border px-4 py-2 text-[0.73rem] font-bold capitalize transition",
                filter === f
                  ? "border-ink bg-ink text-ivory-50 shadow-soft"
                  : "border-line-strong bg-white/60 text-muted hover:border-ink/30 hover:text-ink"
              )}
            >
              {f === "all" ? "All" : f} · {counts[f]}
            </button>
          ))}
        </div>
      </div>

      {/* ————— Summary line ————— */}
      <p className="mb-2 flex flex-wrap items-center gap-x-3 text-[0.72rem] text-faint">
        <span><strong className="text-ink">{visible.length}</strong> {visible.length === 1 ? "inquiry" : "inquiries"} shown</span>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-warning">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" /> {unreadCount} unread
          </span>
        )}
      </p>

      {/* ————— CRM table ————— */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface-soft shadow-soft thin-scroll">
        <table className="data-table w-full min-w-[860px] border-collapse">
          <thead>
            <tr>
              <th className="w-[26%]">Client</th>
              <th className="w-[13%]">Type</th>
              <th className="w-[17%]">Location</th>
              <th className="w-[15%]">Submitted</th>
              <th className="w-[15%]">Status</th>
              <th className="w-12" aria-label="Expand" />
            </tr>
          </thead>
          <tbody>
            {visible.map((inquiry) => {
              const open = openId === inquiry.id;
              const unread = inquiry.status === "new" && !inquiry.isRead;
              return (
                <React.Fragment key={inquiry.id}>
                  {/* Row — clickable */}
                  <tr
                    onClick={() => openInquiry(inquiry)}
                    className={cn("cursor-pointer", unread && "bg-gold/[0.07]", open && "bg-accent/[0.06]")}
                    aria-expanded={open}
                  >
                    <td>
                      <span className="flex items-center gap-2">
                        {unread && (
                          <span
                            aria-label="Unread"
                            title="Unread"
                            className="h-2 w-2 shrink-0 rounded-full bg-gold"
                          />
                        )}
                        <span className="min-w-0">
                          <span className={cn("block truncate", unread ? "font-extrabold text-ink" : "font-semibold text-ink/90")}>
                            {inquiry.name}
                          </span>
                          <span className="block truncate text-[0.68rem] text-muted">{inquiry.email}</span>
                        </span>
                      </span>
                    </td>
                    <td className="text-muted">{inquiry.service}</td>
                    <td className="text-muted">{inquiry.location ?? "—"}</td>
                    <td className="whitespace-nowrap tabular-nums text-muted">{formatDateTime(inquiry.createdAt)}</td>
                    <td><InquiryStatusBadge status={inquiry.status} /></td>
                    <td className="pr-2 text-right">
                      <ChevronDown
                        className={cn("ml-auto h-4 w-4 text-faint transition-transform duration-300", open && "rotate-180 text-accent-dark")}
                        aria-hidden="true"
                      />
                    </td>
                  </tr>

                  {/* Expanded detail panel */}
                  {open && (
                    <tr>
                      <td colSpan={6} className="!border-b border-line bg-ivory-100/70 p-0">
                        <div className="grid gap-4 border-l-2 border-accent/60 px-5 py-4 lg:grid-cols-[1fr_auto] lg:gap-8 lg:px-6">
                          {/* Brief */}
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-accent">
                              <FileText className="h-3.5 w-3.5" aria-hidden="true" /> Project brief
                            </p>
                            <p className="mt-1.5 max-w-[68ch] text-[0.86rem] leading-relaxed text-ink/90">
                              {inquiry.description?.trim() || "No brief provided — the client left no additional message."}
                            </p>
                            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.72rem] text-muted">
                              <span>Received <strong className="text-ink">{formatDateTime(inquiry.createdAt)}</strong></span>
                              <span>Service <strong className="text-ink">{inquiry.service}</strong></span>
                              {inquiry.location && <span>Location <strong className="text-ink">{inquiry.location}</strong></span>}
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col items-stretch gap-2 border-t border-line pt-3 lg:w-52 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                            <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.2em] text-muted">Actions</p>
                            <a
                              href={`mailto:${inquiry.email}?subject=${encodeURIComponent(`Design Brooks — your ${inquiry.service.toLowerCase()} enquiry`)}`}
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex h-9 items-center gap-2 rounded-lg bg-ink px-3.5 text-[0.75rem] font-bold text-ivory-50 transition hover:bg-accent-dark"
                            >
                              <Mail className="h-4 w-4" aria-hidden="true" /> Contact client
                            </a>
                            {inquiry.status === "new" && (
                              <button
                                onClick={() => advance(inquiry.id, "contacted")}
                                disabled={busyId === inquiry.id}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-white/70 px-3.5 text-[0.75rem] font-bold text-ink transition hover:border-accent hover:text-accent-dark disabled:opacity-60"
                              >
                                {busyId === inquiry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquare className="h-4 w-4" />} Mark contacted
                              </button>
                            )}
                            {inquiry.status !== "converted" && (
                              <button
                                onClick={() => advance(inquiry.id, "converted")}
                                disabled={busyId === inquiry.id}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-success/40 bg-success-soft px-3.5 text-[0.75rem] font-bold text-success transition hover:bg-success/15 disabled:opacity-60"
                              >
                                {busyId === inquiry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Mark converted
                              </button>
                            )}
                            {inquiry.status !== "archived" && (
                              <button
                                onClick={() => advance(inquiry.id, "archived")}
                                disabled={busyId === inquiry.id}
                                className="inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[0.75rem] font-bold text-faint transition hover:bg-danger-soft hover:text-danger disabled:opacity-60"
                              >
                                {busyId === inquiry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />} Archive
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Inbox className="mx-auto h-8 w-8 text-sand" aria-hidden="true" />
                  <p className="mt-3 font-display text-xl font-semibold text-ink">Nothing matches</p>
                  <p className="mt-1 text-[0.82rem] text-muted">Clear the search or choose a different status filter.</p>
                  <button
                    onClick={() => { setQuery(""); setFilter("all"); }}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-line-strong bg-white/70 px-4 text-[0.8rem] font-bold text-ink transition hover:border-accent"
                  >
                    <X className="h-4 w-4" aria-hidden="true" /> Clear filters
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-2 text-[0.68rem] text-faint">
        Select a row to read the brief and act on it. Opening marks it as read.
      </p>
    </div>
  );
}
