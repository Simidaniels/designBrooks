import { Badge } from "@/components/ui/badge";
import type { AccessMode, ProjectStatus } from "@/lib/types";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  switch (status) {
    case "ACTIVE":
      return <Badge tone="success"><span className="h-1.5 w-1.5 rounded-full bg-success" />Active</Badge>;
    case "COMPLETED":
      return <Badge tone="ink"><span className="h-1.5 w-1.5 rounded-full bg-ivory-50" />Completed</Badge>;
    case "DRAFT":
      return <Badge tone="warning"><span className="h-1.5 w-1.5 rounded-full bg-warning" />Draft</Badge>;
    case "ARCHIVED":
      return <Badge tone="danger">Archived</Badge>;
  }
}

/* ADMIN-ONLY badge — never render this on client-facing surfaces */
export function AccessModeBadge({ mode }: { mode: AccessMode }) {
  return mode === "FULL_ACCESS" ? (
    <Badge tone="success">Full access · Paid</Badge>
  ) : (
    <Badge tone="warning">Restricted · Not paid</Badge>
  );
}

export function LinkStatusBadge({ status }: { status: "ACTIVE" | "REVOKED" | "EXPIRED" }) {
  switch (status) {
    case "ACTIVE":
      return <Badge tone="success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />Active</Badge>;
    case "REVOKED":
      return <Badge tone="danger">Revoked</Badge>;
    case "EXPIRED":
      return <Badge tone="neutral">Expired</Badge>;
  }
}

export function InquiryStatusBadge({ status }: { status: "new" | "contacted" | "converted" | "archived" }) {
  switch (status) {
    case "new":
      return <Badge tone="accent">New</Badge>;
    case "contacted":
      return <Badge tone="warning">Contacted</Badge>;
    case "converted":
      return <Badge tone="success">Converted</Badge>;
    case "archived":
      return <Badge tone="neutral">Archived</Badge>;
  }
}
