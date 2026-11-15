"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/about", label: "Studio" },
  { href: "/portfolio", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/insights", label: "Insights" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ivory-100/85 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-7">
        <Link href="/" aria-label="Design Brooks — home" className="group flex items-center gap-3">
          <Image
            src="/images/loggoo.webp"
            alt="Design Brooks logo"
            width={48}
            height={48}
            priority
            className="h-11 w-11 rounded-xl object-cover shadow-soft"
          />
          <span className="text-[0.78rem] font-extrabold uppercase leading-tight tracking-[0.16em] text-ink">
            Design<br className="hidden sm:block" /> Brooks
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "text-[0.88rem] font-semibold text-muted transition hover:text-ink",
                  active && "text-accent-dark underline underline-offset-8 decoration-accent/50 decoration-2"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/request-consultation"
            className="rounded-full border border-line-strong bg-white/60 px-5 py-2.5 text-[0.82rem] font-bold text-ink transition hover:border-accent hover:text-accent-dark"
          >
            Start a Project
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="rounded-xl border border-line bg-white/60 p-3 text-ink transition hover:border-accent lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div id="mobile-nav" className="border-t border-line bg-ivory-100 px-5 pb-6 pt-3 shadow-card lg:hidden">
          <nav aria-label="Mobile" className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-4 py-3 text-[0.95rem] font-semibold text-ink transition hover:bg-white/70"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/request-consultation"
              className="mt-2 rounded-xl bg-ink px-4 py-3.5 text-center text-[0.9rem] font-bold text-ivory-50"
            >
              Start a Project
            </Link>
            <Link
              href="/client-access"
              className="rounded-xl border border-line px-4 py-3 text-center text-[0.82rem] font-semibold text-muted"
            >
              Client document access
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
