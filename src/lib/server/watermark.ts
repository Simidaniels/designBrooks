import "server-only";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import sharp from "sharp";

/* ─────────────────────────────────────────────────
   Server-side watermarking for restricted previews.
   RESTRICTED documents never reach the client original —
   only these generated derivatives are served.
   ───────────────────────────────────────────────── */

const WM_TEXT = (clientName: string, reference: string) =>
  `DESIGN BROOKS  ·  ${clientName.toUpperCase()}  ·  ${reference}  ·  CONFIDENTIAL PREVIEW`;

/* Escape text interpolated into the SVG overlay — raw client names with
   `&`, `<` or `>` would otherwise corrupt the SVG and fail watermarking. */
const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export type WatermarkResult = { buffer: Buffer; ext: "jpg" | "png" | "pdf" };

export async function watermarkPdf(
  source: Buffer,
  clientName: string,
  reference: string
): Promise<WatermarkResult> {
  const doc = await PDFDocument.load(source, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const label = WM_TEXT(clientName, reference);

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    const fontSize = Math.max(16, Math.floor(width / 34));
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    for (let y = height * 0.15; y < height; y += 120) {
      for (let x = -textWidth / 2; x < width + textWidth / 2; x += textWidth + 40) {
        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.35, 0.32, 0.28),
          opacity: 0.2,
          rotate: degrees(-28),
        });
      }
    }
    // Permanent footer strip
    page.drawRectangle({ x: 0, y: 0, width, height: 14, color: rgb(0.12, 0.11, 0.09), opacity: 0.85 });
    const footer = `${label}  —  NOT FOR ISSUE`;
    page.drawText(footer, { x: 16, y: 4, size: 7, font, color: rgb(0.88, 0.85, 0.78) });
  }

  const bytes = await doc.save();
  return { buffer: Buffer.from(bytes), ext: "pdf" };
}

export async function watermarkImage(
  source: Buffer,
  clientName: string,
  reference: string
): Promise<WatermarkResult> {
  const image = sharp(source);
  const meta = await image.metadata();
  const width = meta.width ?? 1600;
  const height = meta.height ?? 1200;
  const label = escapeXml(WM_TEXT(clientName, reference));
  const isPng = meta.format === "png";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <pattern id="wm" width="${Math.round(width / 1.6)}" height="${Math.round(height / 4.2)}" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
        <text x="0" y="${Math.round(height / 9)}" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="${Math.max(18, Math.round(width / 38))}" fill="#1f1b17" fill-opacity="0.25" letter-spacing="2">${label}</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wm)"/>
    <rect x="0" y="${height - 26}" width="${width}" height="26" fill="#1f1b17" fill-opacity="0.9"/>
    <text x="12" y="${height - 8}" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="13" fill="#e8e2d4" letter-spacing="2">${label} — NOT FOR ISSUE</text>
  </svg>`;

  const out = image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);
  const buffer = isPng
    ? await out.png({ compressionLevel: 9 }).toBuffer()
    : await out.jpeg({ quality: 78 }).toBuffer();
  return { buffer, ext: isPng ? "png" : "jpg" };
}
