"use client";

import * as React from "react";

/**
 * Inquiry unread badge — polls the DB-backed count endpoint so the number
 * stays live (new inquiry → count rises; opening/handling one → it drops).
 * Renders nothing at zero.
 */
export function InquiryBadge({ initialCount }: { initialCount: number }) {
  const [count, setCount] = React.useState(initialCount);

  React.useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  React.useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/api/admin/inquiries/unread-count", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { count?: number };
        if (!cancelled && typeof data.count === "number") setCount(data.count);
      } catch {
        /* keep last known count */
      }
    };
    const interval = window.setInterval(poll, 30_000);
    window.addEventListener("focus", poll);
    poll();
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", poll);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} unread ${count === 1 ? "inquiry" : "inquiries"}`}
      title={`${count} unread ${count === 1 ? "inquiry" : "inquiries"}`}
      className="inline-flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-gold px-1.5 text-[0.62rem] font-extrabold tabular-nums leading-none text-ink-900 shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.4)]"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
