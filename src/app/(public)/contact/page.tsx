import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { PageHero } from "@/components/public/page-hero";
import { InquiryForm } from "@/components/public/inquiry-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Speak with the Design Brooks studio — Lagos, Nigeria, and remote and onsite collaborations worldwide.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Planning a new project or a professional refurbishment?"
        intro="Tell us about your location, project type, timeline and level of support required. We work with private clients, brands and institutions looking for thoughtful design leadership."
      />

      <section className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-16 sm:px-7 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Direct details */}
        <div className="h-fit rounded-[1.5rem] border border-line bg-ink p-8 text-ivory-100">
          <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-gold">Studio</p>
          <ul className="mt-5 grid gap-5 text-[0.95rem]">
            <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold/80" aria-hidden="true" /><span>Lagos, Nigeria<br /><span className="text-ivory-100/60">Remote and Onsite Collaborations</span></span></li>
            <li className="flex items-center gap-3"><Mail className="h-5 w-5 shrink-0 text-gold/80" aria-hidden="true" /><a href="mailto:hello@designbrooks.com" className="break-all transition hover:text-ivory-50">hello@designbrooks.com</a></li>
            <li className="flex items-center gap-3"><Phone className="h-5 w-5 shrink-0 text-gold/80" aria-hidden="true" /><a href="tel:+2348039764433" className="transition hover:text-ivory-50">+234 803 976 4433</a></li>
            <li className="flex items-start gap-3"><Clock className="mt-0.5 h-5 w-5 shrink-0 text-gold/80" aria-hidden="true" /><span>Mon–Fri, 09:00–18:00 WAT<br /><span className="text-ivory-100/60">Site visits by appointment</span></span></li>
          </ul>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-gold">Existing client?</p>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-ivory-100/70">
              Your project documents are delivered through your private project link.
              If you’ve lost it, ask your project lead to re-send it — links are revoked on request for security.
            </p>
            <a href="/client-access" className="mt-3 inline-flex text-[0.82rem] font-bold text-gold underline-offset-4 hover:underline">Go to client document access →</a>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-[1.5rem] border border-line bg-surface-soft p-7 backdrop-blur sm:p-8">
          <h2 className="font-display text-2xl font-semibold text-ink">Send an enquiry</h2>
          <p className="mt-1 text-[0.84rem] text-muted">We reply within two business days.</p>
          <div className="mt-6">
            <InquiryForm variant="contact" />
          </div>
        </div>
      </section>
    </>
  );
}
