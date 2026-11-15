"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Archive, ArrowUpRight, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/admin/page-header";
import { archiveClientAction } from "@/lib/actions/clients";
import { formatDate } from "@/lib/utils";
import type { Client } from "@/lib/types";

type Filter = "all" | "active" | "archived";

export function ClientsTable({ clients, projectCounts }: { clients: Client[]; projectCounts: Record<string, number> }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const filtered = clients.filter((c) => {
    if (filter === "active" && c.archived) return false;
    if (filter === "archived" && !c.archived) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [c.fullName, c.email, c.company, c.location, c.phone]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(q));
  });

  const archive = async (id: string) => {
    setBusyId(id);
    await archiveClientAction(id);
    setBusyId(null);
    router.refresh();
  };

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, company, location…" aria-label="Search clients" className="pl-11" />
        </div>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Filter clients" className="sm:w-44">
          <option value="all">All clients</option>
          <option value="active">Active only</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No clients match"
          body="Try a different search, or add the first client."
          action={<Button onClick={() => router.push("/admin/clients/new")}><Plus aria-hidden="true" /> Add client</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-soft shadow-soft thin-scroll">
          <table className="data-table w-full min-w-[760px] border-collapse">
            <thead>
              <tr>
                <th>Client</th>
                <th>Company / Location</th>
                <th>Projects</th>
                <th>Added</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => (
                <tr key={client.id}>
                  <td>
                    <Link href={`/admin/clients/${client.id}`} className="group block">
                      <span className="font-bold text-ink transition group-hover:text-accent-dark">{client.fullName}</span>
                      <span className="mt-0.5 block text-[0.7rem] text-muted">{client.email ?? "No email"}{client.phone ? ` · ${client.phone}` : ""}</span>
                    </Link>
                  </td>
                  <td className="text-muted">{client.company ?? "—"}<span className="block text-[0.7rem]">{client.location}</span></td>
                  <td><span className="font-bold tabular-nums text-ink">{projectCounts[client.id] ?? 0}</span></td>
                  <td className="text-muted">{formatDate(client.createdAt)}</td>
                  <td>{client.archived ? <Badge tone="danger">Archived</Badge> : <Badge tone="success">Active</Badge>}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => archive(client.id)}
                        disabled={busyId === client.id}
                        title={client.archived ? "Restore client" : "Archive client"}
                        aria-label={client.archived ? `Restore ${client.fullName}` : `Archive ${client.fullName}`}
                        className="rounded-lg p-2 text-faint transition hover:bg-danger-soft hover:text-danger disabled:opacity-40"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/admin/clients/${client.id}`}
                        aria-label={`Open ${client.fullName}`}
                        className="rounded-lg p-2 text-faint transition hover:bg-accent/10 hover:text-accent-dark"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-3 text-[0.7rem] text-faint">{filtered.length} of {clients.length} clients · persisted in PostgreSQL.</p>
    </>
  );
}
