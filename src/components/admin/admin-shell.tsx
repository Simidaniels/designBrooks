"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Activity,
  Building2,
  ChevronRight,
  Inbox,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Settings,
  FileText,
  Users,
  UploadCloud,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { InquiryBadge } from "@/components/admin/inquiry-badge";
import { NavFeedbackProvider, TopProgressBar, NavItemSpinner, useNavFeedback } from "@/components/admin/navigation-feedback";

const NAV = [
  { section: "Overview", items: [{ href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  {
    section: "Manage",
    items: [
      { href: "/admin/clients", label: "Clients", icon: Users },
      { href: "/admin/projects", label: "Projects", icon: Building2 },
      { href: "/admin/documents", label: "Documents", icon: FileText },
      { href: "/admin/documents/upload", label: "Upload Document", icon: UploadCloud },
      { href: "/admin/access-links", label: "Access Links", icon: Link2 },
    ],
  },
  {
    section: "Insight",
    items: [
      { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
      { href: "/admin/activity", label: "Activity Log", icon: Activity },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

function SidebarNavItem({
  item,
  unreadInquiries,
}: {
  item: { href: string; label: string; icon: typeof LayoutDashboard };
  unreadInquiries: number;
}) {
  const pathname = usePathname();
  const { pendingHref, isNavigating, startNavigation } = useNavFeedback();

  const active =
    pathname === item.href ||
    (item.href !== "/admin/documents" && pathname.startsWith(`${item.href}/`)) ||
    (item.href === "/admin/documents" && pathname === "/admin/documents");
  const pending = pendingHref === item.href;
  const highlighted = active || pending;
  const Icon = item.icon;

  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        aria-busy={pending || undefined}
        onClick={(event) => {
          if (item.href === pathname) {
            event.preventDefault();
            return;
          }
          if (isNavigating && pendingHref === item.href) {
            event.preventDefault(); // duplicate click on the in-flight destination
            return;
          }
          startNavigation(item.href);
        }}
        className={cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.84rem] font-semibold text-ivory-100/65 transition",
          "hover:bg-white/5 hover:text-ivory-50",
          highlighted && "bg-accent/25 text-ivory-50"
        )}
      >
        <Icon className={cn("h-4 w-4 shrink-0", highlighted ? "text-gold" : "text-ivory-100/40 group-hover:text-ivory-100/70")} aria-hidden="true" />
        <span className="flex-1">{item.label}</span>
        {item.href === "/admin/inquiries" && <InquiryBadge initialCount={unreadInquiries} />}
        {pending ? (
          <NavItemSpinner visible />
        ) : (
          active && <ChevronRight className="h-4 w-4 text-gold/70" aria-hidden="true" />
        )}
      </Link>
    </li>
  );
}

export function AdminShell({
  children,
  adminEmail,
  unreadInquiries = 0,
}: {
  children: React.ReactNode;
  adminEmail: string;
  unreadInquiries?: number;
}) {
  return (
    <NavFeedbackProvider>
      <AdminShellInner adminEmail={adminEmail} unreadInquiries={unreadInquiries}>
        {children}
      </AdminShellInner>
    </NavFeedbackProvider>
  );
}

function AdminShellInner({
  children,
  adminEmail,
  unreadInquiries = 0,
}: {
  children: React.ReactNode;
  adminEmail: string;
  unreadInquiries?: number;
}) {
  const pathname = usePathname();
  const { isNavigating } = useNavFeedback();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setOpen(false), [pathname]);

  React.useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sidebar = (
    <aside className="flex h-full w-[268px] flex-col bg-ink-900 text-ivory-100">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <Image src="/images/loggoo.webp" alt="Design Brooks logo" width={44} height={44} className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/15" />
        <div>
          <p className="text-[0.72rem] font-extrabold uppercase leading-tight tracking-[0.18em]">Design Brooks</p>
          <p className="text-[0.62rem] uppercase tracking-[0.2em] text-gold/80">Admin Console</p>
        </div>
      </div>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4 thin-scroll">
        {NAV.map((group) => (
          <div key={group.section} className="mb-5">
            <p className="mb-1.5 px-3 text-[0.6rem] font-extrabold uppercase tracking-[0.24em] text-ivory-100/40">
              {group.section}
            </p>
            <ul className="grid gap-0.5">
              {group.items.map((item) => (
                <SidebarNavItem key={item.href} item={item} unreadInquiries={unreadInquiries} />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <p className="truncate px-3 pb-1 text-[0.62rem] uppercase tracking-[0.18em] text-ivory-100/35" title={adminEmail}>
          {adminEmail}
        </p>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.76rem] font-semibold text-ivory-100/50 transition hover:bg-danger/20 hover:text-danger-soft"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-ivory-200 text-ink">
      {/* Desktop sidebar — fixed */}
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <button aria-label="Close menu" className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 h-full shadow-card">
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 z-10 rounded-lg p-2 text-ivory-100/60 hover:bg-white/10">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      {/* Main column */}
      <div className="relative lg:pl-[268px]">
        {/* Screen-reader navigation status */}
        <span role="status" aria-live="polite" className="sr-only">
          {isNavigating ? "Loading next page…" : ""}
        </span>

        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-ivory-100/90 px-4 backdrop-blur-xl sm:px-6">
          {/* Slim progress indicator at the top of the content area */}
          <TopProgressBar />
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg border border-line bg-white/70 p-2 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <p className="hidden text-[0.78rem] font-bold text-muted sm:block">
              Design Brooks <span className="mx-1.5 text-sand">/</span> <span className="text-ink">Admin Console</span>
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success-soft px-3 py-1.5 text-[0.62rem] font-extrabold uppercase tracking-[0.16em] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> Live
          </span>
        </header>

        <main className="mx-auto w-full max-w-[1200px] p-4 sm:p-6 lg:p-8">{children}</main>

        <footer className="border-t border-line px-6 py-4 text-center text-[0.68rem] text-faint">
          Powered by{" "}
          <a
            href="https://simidaniels.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-accent-dark transition-colors hover:text-accent hover:underline underline-offset-2"
          >
            Simidaniels
          </a>
        </footer>
      </div>
    </div>
  );
}
