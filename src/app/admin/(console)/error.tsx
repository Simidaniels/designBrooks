"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Console error boundary — catches failed page loads so a broken route
 * never leaves navigation feedback stuck. The sidebar stays interactive.
 */
export default function ConsoleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[admin console] route error:", error);
    // Release any pending navigation indicator so it cannot get stuck.
    window.dispatchEvent(new Event("admin:navigation-failed"));
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-ivory-100/50 px-6 py-16 text-center">
      <span className="rounded-2xl bg-danger-soft p-3 text-danger">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ink">This page could not be loaded</h1>
      <p className="mt-2 max-w-md text-[0.86rem] leading-relaxed text-muted">
        The navigation failed before the page was ready. You can retry without losing your place in the console.
      </p>
      <Button className="mt-6" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
