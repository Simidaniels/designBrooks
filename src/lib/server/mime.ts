const MIME_BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  dwg: "application/acad",
  dxf: "application/dxf",
  zip: "application/zip",
};

export function contentTypeFor(ext: string): string {
  return MIME_BY_EXT[ext.toLowerCase()] ?? "application/octet-stream";
}

/** Path-segment-safe, header-injection-proof download filename. */
export function safeFileName(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, "_").slice(0, 200) || "document";
}
