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

export async function watermarkPdf(
  source: Buffer,
  clientName: string,
  reference: string
): Promise<Buffer> {
  const doc = await PDFDocument.load(source, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const label = WM_TEXT(clientName, reference);

  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    // Diagonal band watermark across the page
    const fontSize = Math.max(16, Math.floor(width / 34));
    const textWidth = font.widthOfTextAtSize(label, fontSize);
    for (let y = height * 0.15; y < height; y += 130) {
      for (let x = -textWidth / 2; x < width + textWidth / 2; x += textWidth + 40) {
        page.drawText(label, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.35, 0.32, 0.28),
          opacity: 0.16,
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
  return Buffer.from(bytes);
}

export async function watermarkImage(
  source: Buffer,
  clientName: string,
  reference: string
): Promise<Buffer> {
  const image = sharp(source);
  const meta = await image.metadata();
  const width = meta.width ?? 1600;
  const height = meta.height ?? 1200;
  const label = WM_TEXT(clientName, reference);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <pattern id="wm" width="${Math.round(width / 1.6)}" height="${Math.round(height / 4.2)}" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
        <text x="0" y="${Math.round(height / 9)}" font-family="Helvetica, Arial, sans-serif" font-weight="800" font-size="${Math.max(18, Math.round(width / 38))}" fill="#1f1b17" fill-opacity="0.22" letter-spacing="2">${label}</text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wm)"/>
    <rect x="0" y="${height - 26}" width="${width}" height="26" fill="#1f1b17" fill-opacity="0.9"/>
    <text x="12" y="${height - 8}" font-family="Helvetica, Arial, sans-serif" font-weight="700" font-size="13" fill="#e8e2d4" letter-spacing="2">${label} — NOT FOR ISSUE</text>
  </svg>`;

  const format = meta.format === "png" ? "png" : "jpeg";
  const out = image.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]);
  return format === "png" ? out.png({ compressionLevel: 9 }).toBuffer() : out.jpeg({ quality: 78 }).toBuffer();
}
