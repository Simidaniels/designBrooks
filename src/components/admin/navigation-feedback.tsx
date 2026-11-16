"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Client-side navigation feedback for the admin console.
 *
 * - `startNavigation(href)` is called from sidebar links on click.
 * - The pending state is cleared when the pathname actually changes, but kept
 *   visible for a minimum of ~500ms so fast navigations still read as "loading".
 * - Page navigation itself is never delayed — only the indicator's lifetime.
 * - A failsafe timer clears the indicator if navigation errors out and the
 *   pathname never changes.
 */

const MIN_VISIBLE_MS = 500;
const FAILSAFE_MS = 10000;
const HISTORY_FAILSAFE_MS = 2500;
export const HISTORY_NAVIGATION = "__history__";

type NavFeedbackContextValue = {
  /** href currently being navigated to, HISTORY_NAVIGATION for back/forward, or null when idle */
  pendingHref: string | null;
  isNavigating: boolean;
  startNavigation: (href: string) => void;
};

const NavFeedbackContext = React.createContext<NavFeedbackContextValue | null>(null);

export function useNavFeedback() {
  const ctx = React.useContext(NavFeedbackContext);
  if (!ctx) throw new Error("useNavFeedback must be used within <NavFeedbackProvider>");
  return ctx;
}

export function NavFeedbackProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pathnameRef = React.useRef(pathname);
  const pendingRef = React.useRef<string | null>(null);
  const startedAtRef = React.useRef(0);
  const clearTimer = React.useRef<number | undefined>(undefined);
  const failsafeTimer = React.useRef<number | undefined>(undefined);

  const [pendingHref, setPendingHref] = React.useState<string | null>(null);

  const clearPending = React.useCallback(() => {
    window.clearTimeout(clearTimer.current);
    window.clearTimeout(failsafeTimer.current);
    pendingRef.current = null;
    setPendingHref(null);
  }, []);

  const beginPending = React.useCallback((key: string, failsafeMs: number) => {
    window.clearTimeout(clearTimer.current);
    window.clearTimeout(failsafeTimer.current);
    startedAtRef.current = Date.now();
    pendingRef.current = key;
    setPendingHref(key);
    failsafeTimer.current = window.setTimeout(() => {
      pendingRef.current = null;
      setPendingHref(null);
    }, failsafeMs);
  }, []);

  const startNavigation = React.useCallback(
    (href: string) => {
      if (href === pathnameRef.current) return; // already on the destination
      if (pendingRef.current === href) return; // duplicate click on the same item
      beginPending(href, FAILSAFE_MS);
    },
    [beginPending]
  );

  // When the pathname changes (navigation committed), clear pending state —
  // but guarantee a minimum visible time for the feedback.
  React.useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    if (pendingRef.current == null) return;
    window.clearTimeout(failsafeTimer.current);
    window.clearTimeout(clearTimer.current);
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);
    clearTimer.current = window.setTimeout(() => {
      pendingRef.current = null;
      setPendingHref(null);
    }, remaining);
  }, [pathname]);

  // Navigation failures caught by route error boundaries — clear feedback immediately.
  React.useEffect(() => {
    const onNavFailed = () => clearPending();
    window.addEventListener("admin:navigation-failed", onNavFailed);
    return () => window.removeEventListener("admin:navigation-failed", onNavFailed);
  }, [clearPending]);

  // Browser back/forward — show the top indicator even without a sidebar click.
  React.useEffect(() => {
    const onPopState = () => beginPending(HISTORY_NAVIGATION, HISTORY_FAILSAFE_MS);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [beginPending]);

  // Cleanup timers on unmount
  React.useEffect(
    () => () => {
      window.clearTimeout(clearTimer.current);
      window.clearTimeout(failsafeTimer.current);
    },
    []
  );

  const value = React.useMemo<NavFeedbackContextValue>(
    () => ({ pendingHref, isNavigating: pendingHref !== null, startNavigation }),
    [pendingHref, startNavigation]
  );

  return <NavFeedbackContext.Provider value={value}>{children}</NavFeedbackContext.Provider>;
}

/** Slim progress indicator pinned to the top of the content area. */
export function TopProgressBar() {
  const { pendingHref } = useNavFeedback();
  const [phase, setPhase] = React.useState<"idle" | "active" | "done">("idle");

  React.useEffect(() => {
    if (pendingHref !== null) {
      setPhase("active");
      return;
    }
    setPhase((current) => (current === "active" ? "done" : current));
  }, [pendingHref]);

  // Separate effect to retire the "done" fade after it plays out
  React.useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(() => setPhase("idle"), 450);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] overflow-hidden"
    >
      <div
        className={cn(
          "h-full bg-gradient-to-r from-gold via-accent to-gold",
          phase === "active" ? "nav-progress-active" : "nav-progress-done"
        )}
      />
    </div>
  );
}

/** Subtle spinner shown beside the pending sidebar item. Fixed size, opacity-toggled. */
export function NavItemSpinner({ visible }: { visible: boolean }) {
  return (
    <span
      aria-hidden={!visible}
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center transition-opacity duration-200",
        visible ? "opacity-100" : "opacity-0"
      )}
    >
      {visible && <Loader2 className="spinner-slow h-4 w-4 text-gold" />}
    </span>
  );
}
