import "server-only";
import { prisma } from "./db";
import { hashToken } from "./auth";

/**
 * Resolves a client project token.
 * Returns the link (with project + client) or null when invalid.
 * Lazily transitions ACTIVE → EXPIRED once the expiry passes.
 * Revoked tokens are never resurrected.
 */
export async function resolveClientToken(rawToken: string | null | undefined) {
  if (!rawToken) return null;
  const tokenHash = hashToken(rawToken);
  const link = await prisma.projectAccessLink.findUnique({
    where: { tokenHash },
    include: { project: { include: { client: true } } },
  });
  if (!link) return null;

  if (link.status === "ACTIVE" && link.expiresAt && link.expiresAt.getTime() <= Date.now()) {
    await prisma.projectAccessLink.update({ where: { id: link.id }, data: { status: "EXPIRED" } });
    return { ...link, status: "EXPIRED" as const };
  }
  return link;
}

export type ResolvedLink = NonNullable<Awaited<ReturnType<typeof resolveClientToken>>>;

/** Fetches a document that belongs to the link's project (never anything else). */
export async function authorizedDocument(link: ResolvedLink, documentId: string) {
  const document = await prisma.document.findFirst({
    where: { id: documentId, projectId: link.projectId, archivedAt: null },
  });
  return document;
}
