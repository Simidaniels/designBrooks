"use client";

import * as React from "react";
import { Activity, Search, User, MonitorSmartphone, Server, Filter } from "lucide-react";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/admin/page-header";
import type { ActivityEvent, ActivityActor } from "@/lib/types";

const ACTOR_ICON: Record<ActivityActor, typeof User> = {
  admin: User,
  client: MonitorSmartphone,
  system: Server,
};

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  const [query, setQuery] = React.useState("");
  const [actor, setActor] = React.useState<"all" | ActivityActor>("all");

  const filtered = events.filter((event) => {
    if (actor !== "all" && event.actor !== actor) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [event.action, event.detail].join(" ").toLowerCase().includes(q);
  });

  const groups = filtered.reduce<Record<string, ActivityEvent[]>>((acc, event) => {
    const key = new Date(event.at).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    (acc[key] ??= []).push(event);
    return acc;
  }, {});

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" aria-hidden="true" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search actions and details…" aria-label="Search activity" className="pl-11" />
        </div>
        <Select value={actor} onChange={(e) => setActor(e.target.value as typeof actor)} aria-label="Filter by actor" className="sm:w-44">
          <option value="all">All actors</option>
          <option value="admin">Admin actions</option>
          <option value="client">Client events</option>
          <option value="system">System events</option>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Filter className="h-10 w-10" />} title="Nothing recorded" body="Real activity appears here as the team works — uploads, link events, client opens and downloads." />
      ) : (
        <div className="grid gap-6">
          {Object.entries(groups).map(([day, dayEvents]) => (
            <section key={day}>
              <h2 className="mb-3 flex items-center gap-3 text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-muted">
                <Activity className="h-4 w-4 text-accent" aria-hidden="true" /> {day}
                <span className="h-px flex-1 bg-line-strong" aria-hidden="true" />
              </h2>
              <ol className="relative grid gap-0 border-l-2 border-line-strong pl-6">
                {dayEvents.map((event) => {
                  const Icon = ACTOR_ICON[event.actor] ?? Server;
                  return (
                    <li key={event.id} className="relative pb-5 last:pb-0">
                      <span className="absolute -left-[31px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-line-strong bg-ivory-100">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                      </span>
                      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface-soft p-4 shadow-soft">
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="mt-0.5 rounded-lg bg-accent/10 p-2 text-accent-dark">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0">
                            <span className="block text-[0.86rem] font-bold leading-snug text-ink">{event.action}</span>
                            <span className="mt-0.5 block text-[0.75rem] leading-snug text-muted">{event.detail}</span>
                          </span>
                        </div>
                        <time className="shrink-0 text-[0.68rem] font-semibold tabular-nums uppercase tracking-wider text-faint" dateTime={event.at}>
                          {new Date(event.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
