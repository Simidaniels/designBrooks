/* Generates public/sample-documents/design-brooks-sample-drawing.pdf (demo asset) */
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { writeFileSync, mkdirSync } from "fs";

const ink = rgb(0.12, 0.11, 0.09);
const accent = rgb(0.52, 0.39, 0.27);
const faint = rgb(0.75, 0.72, 0.68);

const doc = await PDFDocument.create();
const bold = await doc.embedFont(StandardFonts.HelveticaBold);
const body = await doc.embedFont(StandardFonts.Helvetica);

function titleBlock(page, { project, ref, rev, sheet, title }) {
  const { width, height } = page.getSize();
  // Title block
  page.drawRectangle({ x: width - 220, y: 40, width: 180, height: 130, borderColor: ink, borderWidth: 1.2 });
  page.drawLine({ start: { x: width - 220, y: 140 }, end: { x: width - 40, y: 140 }, thickness: 0.8, color: ink });
  page.drawLine({ start: { x: width - 220, y: 105 }, end: { x: width - 40, y: 105 }, thickness: 0.8, color: ink });
  page.drawLine({ start: { x: width - 220, y: 75 }, end: { x: width - 40, y: 75 }, thickness: 0.8, color: ink });
  page.drawText("DESIGN BROOKS", { x: width - 210, y: 150, size: 9, font: bold, color: accent });
  page.drawText(project.slice(0, 30), { x: width - 210, y: 118, size: 11, font: bold, color: ink });
  page.drawText(`${ref}  ·  ${title}`, { x: width - 210, y: 86, size: 8, font: body, color: ink });
  page.drawText(`Sheet ${sheet}   Rev ${rev}   Scale 1:100   A3`, { x: width - 210, y: 52, size: 8, font: body, color: ink });
  // North arrow
  page.drawCircle({ x: 70, y: height - 70, size: 18, borderColor: ink, borderWidth: 1.2 });
  page.drawLine({ start: { x: 70, y: height - 84 }, end: { x: 70, y: height - 52 }, thickness: 1.4, color: ink });
  page.drawText("N", { x: 65.5, y: height - 48, size: 10, font: bold, color: ink });
  // Border
  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: ink, borderWidth: 2 });
}

// ————— Page 1: Floor plan —————
{
  const page = doc.addPage([840, 595]); // A3 landscape
  titleBlock(page, { project: "Ikoyi Duplex House", ref: "DB-2026-014", rev: "C", sheet: "A-101", title: "Ground & First Floor Plans" });
  page.drawText("GROUND FLOOR PLAN", { x: 60, y: 500, size: 16, font: bold, color: ink });
  // Outer wall
  page.drawRectangle({ x: 90, y: 140, width: 480, height: 300, borderColor: ink, borderWidth: 3.5 });
  // Room dividers
  page.drawLine({ start: { x: 300, y: 140 }, end: { x: 300, y: 440 }, thickness: 2.2, color: ink });
  page.drawLine({ start: { x: 90, y: 290 }, end: { x: 300, y: 290 }, thickness: 2.2, color: ink });
  page.drawLine({ start: { x: 430, y: 290 }, end: { x: 570, y: 290 }, thickness: 2.2, color: ink });
  // Door openings (white gaps + arcs)
  const rooms = [
    [140, 350, "LIVING", "32.4 m2"],
    [150, 205, "DINING", "18.1 m2"],
    [370, 205, "KITCHEN", "21.7 m2"],
    [395, 385, "GUEST WC", "4.2 m2"],
    [480, 380, "STUDY", "12.6 m2"],
  ];
  for (const [x, y, name, area] of rooms) {
    page.drawText(name, { x, y, size: 10, font: bold, color: ink });
    page.drawText(area, { x, y: y - 13, size: 8, font: body, color: accent });
  }
  // Dimension lines
  page.drawLine({ start: { x: 90, y: 115 }, end: { x: 570, y: 115 }, thickness: 0.8, color: faint });
  page.drawText("12.40 m", { x: 305, y: 100, size: 8, font: body, color: faint });
  page.drawLine({ start: { x: 60, y: 140 }, end: { x: 60, y: 440 }, thickness: 0.8, color: faint });
  page.drawText("8.00 m", { x: 30, y: 290, size: 8, font: body, color: faint });
}

// ————— Page 2: Elevation —————
{
  const page = doc.addPage([840, 595]);
  titleBlock(page, { project: "Ikoyi Duplex House", ref: "DB-2026-014", rev: "C", sheet: "A-201", title: "Front Elevation & Section A-A" });
  page.drawText("FRONT ELEVATION (SOUTH)", { x: 60, y: 500, size: 16, font: bold, color: ink });
  // Ground line
  page.drawLine({ start: { x: 50, y: 150 }, end: { x: 620, y: 150 }, thickness: 1.6, color: ink });
  // Building massing
  page.drawRectangle({ x: 130, y: 150, width: 380, height: 210, borderColor: ink, borderWidth: 2.6 });
  page.drawLine({ start: { x: 110, y: 360 }, end: { x: 530, y: 360 }, thickness: 4, color: ink }); // overhang
  // Openings
  page.drawRectangle({ x: 165, y: 175, width: 60, height: 110, borderColor: ink, borderWidth: 1.4 });
  page.drawRectangle({ x: 280, y: 210, width: 130, height: 105, borderColor: ink, borderWidth: 1.4 });
  page.drawRectangle({ x: 445, y: 175, width: 42, height: 110, borderColor: ink, borderWidth: 1.4 });
  page.drawText("VERANDA", { x: 152, y: 120, size: 8, font: body, color: faint });
  page.drawText("CLIMATE SCREEN", { x: 265, y: 120, size: 8, font: body, color: faint });
  page.drawText("ENTRY", { x: 442, y: 120, size: 8, font: body, color: faint });
}

mkdirSync("public/sample-documents", { recursive: true });
const bytes = await doc.save();
writeFileSync("public/sample-documents/design-brooks-sample-drawing.pdf", bytes);
console.log("Sample PDF written:", bytes.length, "bytes");
