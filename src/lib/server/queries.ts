import "server-only";
import { prisma } from "./db";
import type {
  AccessLink,
  AccessMode,
  ActivityEvent,
  Client,
  DocumentCategory,
  Inquiry,
  InquiryStatus,
  Project,
  ProjectStatus,
  ProjectType,
  StudioDocument,
} from "@/lib/types";

/* DB enum → UI union mappers (keep UI stable) */
const PROJECT_TYPE_MAP: Record<string, ProjectType> = {
  RESIDENTIAL: "residential",
  COMMERCIAL: "commercial",
  INTERIOR_DESIGN: "interior_design",
  RENOVATION: "renovation",
  OTHER: "other",
};
const PROJECT_TYPE_UNMAP: Record<ProjectType, string> = {
  residential: "RESIDENTIAL",
  commercial: "COMMERCIAL",
  interior_design: "INTERIOR_DESIGN",
  renovation: "RENOVATION",
  other: "OTHER",
};
const CATEGORY_MAP: Record<string, DocumentCategory> = {
  ARCHITECTURAL: "architectural",
  STRUCTURAL: "structural",
  ELECTRICAL: "electrical",
  PLUMBING: "plumbing",
  RENDER_3D: "3d-render",
  OTHER: "other",
};
const CATEGORY_UNMAP: Record<DocumentCategory, string> = {
  architectural: "ARCHITECTURAL",
  structural: "STRUCTURAL",
  electrical: "ELECTRICAL",
  plumbing: "PLUMBING",
  "3d-render": "RENDER_3D",
  other: "OTHER",
};
const INQUIRY_STATUS_MAP: Record<string, InquiryStatus> = {
  NEW: "new",
  CONTACTED: "contacted",
  CONVERTED: "converted",
  ARCHIVED: "archived",
};
const INQUIRY_STATUS_UNMAP: Record<InquiryStatus, string> = {
  new: "NEW",
  contacted: "CONTACTED",
  converted: "CONVERTED",
  archived: "ARCHIVED",
};

export const mapProjectType = (v: string) => PROJECT_TYPE_MAP[v] ?? "other";
export const unmapProjectType = (v: ProjectType) => PROJECT_TYPE_UNMAP[v] ?? "OTHER";
export const mapCategory = (v: string) => CATEGORY_MAP[v] ?? "other";
export const unmapCategory = (v: DocumentCategory) => CATEGORY_UNMAP[v] ?? "OTHER";
export const mapInquiryStatus = (v: string) => INQUIRY_STATUS_MAP[v] ?? "new";
export const unmapInquiryStatus = (v: InquiryStatus) => INQUIRY_STATUS_UNMAP[v] ?? "NEW";

/* ————— Mappers ————— */
type ClientRow = {
  id: string; fullName: string; email: string | null; phone: string | null;
  company: string | null; location: string | null; internalNotes: string | null;
  archivedAt: Date | null; createdAt: Date;
};
export function mapClient(c: ClientRow): Client {
  return {
    id: c.id,
    fullName: c.fullName,
    email: c.email ?? undefined,
    phone: c.phone ?? undefined,
    company: c.company ?? undefined,
    location: c.location ?? undefined,
    internalNotes: c.internalNotes ?? undefined,
    createdAt: c.createdAt.toISOString(),
    archived: Boolean(c.archivedAt),
  };
}

type ProjectRow = {
  id: string; clientId: string; name: string; reference: string | null;
  type: string; location: string | null; description: string | null;
  coverImage: string | null; status: string; createdAt: Date;
};
export function mapProject(p: ProjectRow): Project {
  return {
    id: p.id,
    clientId: p.clientId,
    name: p.name,
    reference: p.reference ?? "—",
    type: mapProjectType(p.type),
    location: p.location ?? undefined,
    description: p.description ?? undefined,
    coverImage: p.coverImage ?? "/images/house.jpg",
    status: p.status as ProjectStatus,
    createdAt: p.createdAt.toISOString(),
  };
}

type DocumentRow = {
  id: string; projectId: string; name: string; category: string;
  originalFileName: string; mimeType: string; fileSize: number; fileType: string;
  accessMode: string; revision: string; status: string; createdAt: Date;
};
export function mapDocument(d: DocumentRow): StudioDocument {
  return {
    id: d.id,
    projectId: d.projectId,
    name: d.name,
    category: mapCategory(d.category),
    fileName: d.originalFileName,
    fileSize: d.fileSize,
    fileType: d.fileType,
    accessMode: d.accessMode as AccessMode,
    revision: d.revision,
    status: d.status.toLowerCase() as StudioDocument["status"],
    uploadedAt: d.createdAt.toISOString(),
  };
}

type LinkRow = {
  id: string; projectId: string; status: string; createdAt: Date;
  expiresAt: Date | null; lastAccessedAt: Date | null; openCount: number;
};
export function mapAccessLink(l: LinkRow): Omit<AccessLink, "token"> {
  return {
    id: l.id,
    projectId: l.projectId,
    status: l.status as AccessLink["status"],
    createdAt: l.createdAt.toISOString(),
    expiresAt: l.expiresAt?.toISOString() ?? null,
    lastAccessedAt: l.lastAccessedAt?.toISOString() ?? null,
    openCount: l.openCount,
  };
}

type ActivityRow = {
  id: string; actorType: string; action: string; detail: string;
  projectId: string | null; createdAt: Date;
};
export function mapActivity(a: ActivityRow): ActivityEvent {
  return {
    id: a.id,
    at: a.createdAt.toISOString(),
    actor: a.actorType.toLowerCase() as ActivityEvent["actor"],
    action: a.action,
    detail: a.detail,
    projectId: a.projectId ?? undefined,
  };
}

type InquiryRowFull = {
  id: string; name: string; email: string; service: string; location: string | null;
  description: string | null; status: string; isRead: boolean; createdAt: Date; clientId: string | null;
};
export function mapInquiry(i: InquiryRowFull): Inquiry {
  return {
    id: i.id,
    name: i.name,
    email: i.email,
    service: i.service,
    location: i.location ?? undefined,
    description: i.description ?? undefined,
    createdAt: i.createdAt.toISOString(),
    status: mapInquiryStatus(i.status),
    isRead: i.isRead,
    clientId: i.clientId,
  };
}

/* ————— Query helpers ————— */
export async function getClients() {
  const rows = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapClient);
}
export async function getProjects() {
  const rows = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapProject);
}
export async function getDocuments() {
  const rows = await prisma.document.findMany({ where: { archivedAt: null }, orderBy: { createdAt: "desc" } });
  return rows.map(mapDocument);
}
export async function getInquiryRows(limit?: number) {
  return prisma.inquiry.findMany({ orderBy: { createdAt: "desc" }, ...(limit ? { take: limit } : {}) });
}
