import "server-only";
import { prisma } from "./db";
import type { ActorType, Prisma } from "@prisma/client";

export async function logActivity(input: {
  actorType: ActorType;
  action: string;
  detail: string;
  adminId?: string | null;
  projectId?: string | null;
  documentId?: string | null;
  accessLinkId?: string | null;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    await prisma.activityLog.create({
      data: {
        actorType: input.actorType,
        action: input.action,
        detail: input.detail,
        adminId: input.adminId ?? undefined,
        projectId: input.projectId ?? undefined,
        documentId: input.documentId ?? undefined,
        accessLinkId: input.accessLinkId ?? undefined,
        metadata: input.metadata === undefined ? undefined : JSON.stringify(input.metadata),
      },
    });
  } catch (err) {
    // Activity logging must never break the primary flow
    console.error("[activity] failed to log:", err);
  }
}
