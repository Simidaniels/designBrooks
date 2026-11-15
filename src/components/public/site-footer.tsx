import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-ink text-ivory-100">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-14 sm:px-7 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/loggoo.webp"
              alt="Design Brooks logo"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/15"
            />
            <span className="text-[0.78rem] font-extrabold uppercase leading-tight tracking-[0.16em]">
              Design<br />Brooks
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-[0.85rem] leading-relaxed text-ivory-100/70">
            Architecture and interiors for residential, workplace, hospitality and cultural
            spaces — designed with restraint, delivered with precision.
          </p>
        </div>

        <nav aria-label="Studio">
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-gold">Studio</p>
          <ul className="mt-3 grid gap-2 text-[0.86rem] text-ivory-100/80">
            <li><Link href="/about" className="transition hover:text-ivory-50">About the studio</Link></li>
            <li><Link href="/services" className="transition hover:text-ivory-50">Services</Link></li>
            <li><Link href="/portfolio" className="transition hover:text-ivory-50">Selected projects</Link></li>
            <li><Link href="/insights" className="transition hover:text-ivory-50">Insights</Link></li>
          </ul>
        </nav>

        <nav aria-label="Clients">
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-gold">Clients</p>
          <ul className="mt-3 grid gap-2 text-[0.86rem] text-ivory-100/80">
            <li><Link href="/client-access" className="transition hover:text-ivory-50">Client document access</Link></li>
            <li><Link href="/request-consultation" className="transition hover:text-ivory-50">Request a consultation</Link></li>
            <li><Link href="/contact" className="transition hover:text-ivory-50">Contact the studio</Link></li>
          </ul>
        </nav>

        <div>
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.2em] text-gold">Studio</p>
          <ul className="mt-3 grid gap-2 text-[0.86rem] text-ivory-100/80">
            <li className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-ivory-100/40" /> Lagos · New York · Remote collaborations</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-ivory-100/40" /> <a href="mailto:hello@designbrooks.com" className="transition hover:text-ivory-50">hello@designbrooks.com</a></li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-ivory-100/40" /> <a href="tel:+2340000000000" className="transition hover:text-ivory-50">+234 (0) 000 000 0000</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-5 py-5 text-[0.72rem] text-ivory-100/50 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p>© {new Date().getFullYear()} Design Brooks. All rights reserved. <span className="text-white/25">·</span> Powered by{" "}
            <a
              href="https://simidaniels.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold/80 transition-colors hover:text-gold hover:underline underline-offset-2"
            >
              Simidaniels
            </a>
          </p>
          <p>Crafted for clients who value clarity, detail, and enduring design quality.</p>
        </div>
      </div>
    </footer>
  );
}
