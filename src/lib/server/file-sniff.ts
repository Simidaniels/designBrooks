import "server-only";

/* Magic-byte sniffing for accepted upload formats. */
export type SniffResult = { kind: "pdf" | "jpg" | "png" | "webp" | "dwg" | "dxf" | "zip" | "unknown"; ok: boolean };

export function sniff(buffer: Buffer): SniffResult {
  const head = buffer.subarray(0, 16);
  const is = (bytes: number[], offset = 0) => bytes.every((b, i) => head[offset + i] === b);
  if (is([0x25, 0x50, 0x44, 0x46])) return { kind: "pdf", ok: true }; // %PDF
  if (is([0x89, 0x50, 0x4e, 0x47])) return { kind: "png", ok: true };
  if (is([0xff, 0xd8, 0xff])) return { kind: "jpg", ok: true };
  if (is([0x52, 0x49, 0x46, 0x46]) && buffer.subarray(8, 12).toString("ascii") === "WEBP")
    return { kind: "webp", ok: true };
  if (is([0x50, 0x4b, 0x03, 0x04]) || is([0x50, 0x4b, 0x05, 0x06])) return { kind: "zip", ok: true };
  if (head.subarray(0, 4).toString("ascii") === "AC10") return { kind: "dwg", ok: true };
  const ascii = buffer.subarray(0, 128).toString("latin1");
  if (ascii.includes("SECTION") || ascii.includes("ENTITIES")) return { kind: "dxf", ok: true };
  return { kind: "unknown", ok: false };
}

export const IMAGE_KINDS = new Set(["jpg", "png", "webp"]);
