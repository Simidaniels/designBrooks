/* Server-side only — imported by server actions (and integration tests).
   Deliberately omitted the `server-only` package marker so the module stays
   importable in plain Node test runners; never import it from client code.

   Converts a public inquiry into (or links it with) a client record,
   atomically and idempotently:

   - Idempotent: an inquiry whose `clientId` is already set is never
     re-converted — no duplicate client is created.
   - Race-safe: conversions take a per-email advisory lock inside the
     transaction, so simultaneous conversions of inquiries sharing an email
     are serialized; the second one links to the client the first created.
   - Atomic: inquiry status, client creation/linking and activity logging
     happen in one serializable transaction — either all of it commits or
     nothing is written (an inquiry is never left wrongly marked Converted).
   - Retryable: serialization failures (P2034) and the impossible-but-guarded
     claim loss are retried up to 3 attempts; the retry then observes the
     winner's clientId and returns the idempotent outcome. */
import { prisma } from "./db";
import type { Prisma } from "@prisma/client";

export type ConversionOutcome = "created" | "linked" | "already-linked";

export type ConversionResult =
  | { ok: true; outcome: ConversionOutcome; clientId: string; message: string }
  | { ok: false; error: string };

class ConcurrentClaim extends Error {
  constructor() {
    super("Inquiry was claimed by a concurrent conversion");
    this.name = "ConcurrentClaim";
  }
}

const CREATE_MSG = "Successfully converted. Client has been added to your Clients.";
const LINK_MSG = "This inquiry has been linked to an existing client.";

const logConversion = (
  tx: Prisma.TransactionClient,
  adminId: string,
  action: string,
  detail: string,
  clientId: string,
  inquiryId: string
) =>
  tx.activityLog
    .create({
      data: {
        actorType: "ADMIN",
        adminId,
        action,
        detail,
        metadata: JSON.stringify({ inquiryId, clientId }),
      },
    })
    .catch(() => undefined);

type InTransaction = () => Promise<ConversionResult>;

async function withRetry(run: InTransaction, attempts = 3): Promise<ConversionResult> {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await run();
    } catch (err) {
      const code = (err as { code?: string } | null)?.code;
      const retryable = code === "P2034" || err instanceof ConcurrentClaim;
      if (!retryable || attempt >= attempts) throw err;
    }
  }
}

export async function convertInquiryToClient(inquiryId: string, adminId: string): Promise<ConversionResult> {
  try {
    return await withRetry(() =>
      prisma.$transaction(
        async (tx) => {
          const inquiry = await tx.inquiry.findUnique({ where: { id: inquiryId } });
          if (!inquiry) return { ok: false as const, error: "Inquiry not found." };

          // Serialize conversions on the inquiry's email (falls back to its id)
          const lockKey = inquiry.email?.trim() ? inquiry.email.trim().toLowerCase() : inquiry.id;
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`;

          // Re-read after the lock — a concurrent transaction may have completed
          const fresh = await tx.inquiry.findUnique({ where: { id: inquiryId } });
          if (!fresh) return { ok: false as const, error: "Inquiry not found." };
          if (fresh.clientId) {
            return { ok: true as const, outcome: "already-linked" as const, clientId: fresh.clientId, message: LINK_MSG };
          }

          const email = fresh.email?.trim().toLowerCase() || null;
          const existing = email
            ? await tx.client.findFirst({
                where: { email: { equals: email, mode: "insensitive" } },
                orderBy: { createdAt: "asc" },
              })
            : null;

          if (existing) {
            const claimed = await tx.inquiry.updateMany({
              where: { id: fresh.id, clientId: null },
              data: { clientId: existing.id, status: "CONVERTED", isRead: true },
            });
            if (claimed.count === 0) {
              const winner = await tx.inquiry.findUnique({ where: { id: fresh.id }, select: { clientId: true } });
              return { ok: true as const, outcome: "already-linked" as const, clientId: winner?.clientId ?? existing.id, message: LINK_MSG };
            }
            await logConversion(tx, adminId, "Inquiry linked to existing client", `${fresh.name} <${fresh.email}> → client ${existing.id}`, existing.id, fresh.id);
            return { ok: true as const, outcome: "linked" as const, clientId: existing.id, message: LINK_MSG };
          }

          const brief = (fresh.description ?? "").trim();
          const notes = [
            `Converted inquiry — ${fresh.service}${fresh.location ? ` · ${fresh.location}` : ""}`,
            brief,
          ]
            .filter(Boolean)
            .join("\n")
            .slice(0, 4000);

          const client = await tx.client.create({
            data: {
              fullName: fresh.name.trim().slice(0, 120),
              email: fresh.email.trim().toLowerCase(),
              phone: fresh.phone?.trim() || null,
              location: fresh.location?.trim() || null,
              internalNotes: notes || null,
            },
          });

          const claimed = await tx.inquiry.updateMany({
            where: { id: fresh.id, clientId: null },
            data: { clientId: client.id, status: "CONVERTED", isRead: true },
          });
          if (claimed.count === 0) {
            // Shouldn't happen while holding the advisory lock — roll back and retry,
            // which lands in the idempotent path above.
            throw new ConcurrentClaim();
          }

          await logConversion(tx, adminId, "Client created from inquiry", `${client.fullName} <${client.email ?? "no email"}>`, client.id, fresh.id);
          return { ok: true as const, outcome: "created" as const, clientId: client.id, message: CREATE_MSG };
        },
        { isolationLevel: "Serializable", maxWait: 5000, timeout: 15000 }
      )
    );
  } catch (err) {
    console.error("[inquiry-conversion] failed:", err);
    return { ok: false as const, error: "Conversion failed — nothing was changed. Please try again." };
  }
}
