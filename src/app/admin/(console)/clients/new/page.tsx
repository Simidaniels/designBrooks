import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { ClientForm } from "@/components/admin/client-form";
import { prisma } from "@/lib/server/db";

export const metadata: Metadata = { title: "Add client" };
export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const rows = await prisma.client.findMany({ where: { email: { not: null } }, select: { email: true } });
  const existingEmails = rows.map((r) => r.email!.toLowerCase());

  return (
    <>
      <PageHeader
        eyebrow="Clients"
        title="Add client"
        description="Only the name is required. Email is checked for likely duplicates; everything persists in PostgreSQL."
        actions={
          <Link href="/admin/clients" className="inline-flex h-11 items-center gap-2 rounded-xl border border-line-strong bg-white/60 px-5 text-[0.82rem] font-bold text-ink transition hover:border-accent">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to clients
          </Link>
        }
      />
      <div className="max-w-3xl">
        <ClientForm existingEmails={existingEmails} />
      </div>
    </>
  );
}
