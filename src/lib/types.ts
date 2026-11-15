/* Design Brooks — shared domain types (UI prototype; backend deferred) */

export type ProjectType =
  | "residential"
  | "commercial"
  | "interior_design"
  | "renovation"
  | "other";

export type ProjectStatus = "DRAFT" | "ACTIVE" | "COMPLETED" | "ARCHIVED";

export type Client = {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  company?: string;
  location?: string;
  internalNotes?: string;
  createdAt: string; // ISO
  archived?: boolean;
};

export type Project = {
  id: string;
  clientId: string;
  name: string;
  reference: string;
  type: ProjectType;
  location?: string;
  description?: string;
  coverImage: string;
  status: ProjectStatus;
  createdAt: string;
};

export type DocumentCategory =
  | "architectural"
  | "structural"
  | "electrical"
  | "plumbing"
  | "3d-render"
  | "other";

export type AccessMode = "RESTRICTED_PREVIEW" | "FULL_ACCESS";

export type UploadStatus = "ready" | "processing" | "failed";

export type StudioDocument = {
  id: string;
  projectId: string;
  name: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: number; // bytes
  fileType: string; // e.g. "PDF", "DWG", "PNG"
  accessMode: AccessMode;
  revision: string;
  status: UploadStatus;
  uploadedAt: string;
};

export type AccessLinkStatus = "ACTIVE" | "REVOKED" | "EXPIRED";
export type LinkExpiry = "never" | "7" | "30" | "90";

export type AccessLink = {
  id: string;
  projectId: string;
  /** Raw token — present only immediately after generation; never stored or listed later. */
  token?: string;
  status: AccessLinkStatus;
  createdAt: string;
  expiresAt: string | null;
  lastAccessedAt: string | null;
  openCount: number;
};

export type ActivityActor = "admin" | "client" | "system";

export type ActivityEvent = {
  id: string;
  at: string;
  actor: ActivityActor;
  action: string;
  detail: string;
  projectId?: string;
};

export type InquiryStatus = "new" | "contacted" | "converted" | "archived";

export type Inquiry = {
  id: string;
  name: string;
  email: string;
  service: string;
  location?: string;
  description?: string;
  createdAt: string;
  status: InquiryStatus;
  isRead: boolean;
};

export type PortfolioProject = {
  slug: string;
  title: string;
  category: string;
  location: string;
  year: string;
  image: string;
  services: string[];
  summary: string;
  body: string[];
  featured?: boolean;
};

export type InsightPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  body: string[];
};
