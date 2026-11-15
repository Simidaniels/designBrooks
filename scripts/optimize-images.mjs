/* Converts heavy photographic PNGs/JPGs to WebP and rewrites references in src/. */
import sharp from "sharp";
import { readdirSync, readFileSync, writeFileSync, statSync, rmSync } from "fs";
import { join, extname } from "path";

const DIR = "public/images";
const big = readdirSync(DIR).filter((f) => /\.(png|jpg)$/i.test(f) && statSync(join(DIR, f)).size > 800 * 1024);

for (const file of big) {
  const src = join(DIR, file);
  const out = src.replace(/\.(png|jpg)$/i, ".webp");
  await sharp(src).resize({ width: 2200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(out);
  console.log(`${file} ${(statSync(src).size / 1e6).toFixed(2)}MB -> ${(statSync(out).size / 1e6).toFixed(2)}MB`);
  rmSync(src); // originals remain in legacy/llb/img
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]
  );

const files = walk("src").filter((f) => /\.(tsx|ts|css)$/.test(f));
for (const f of files) {
  let text = readFileSync(f, "utf8");
  let next = text;
  for (const b of big) {
    const from = `/images/${b}`;
    const to = `/images/${b.replace(/\.(png|jpg)$/i, ".webp")}`;
    next = next.split(from).join(to);
  }
  if (next !== text) {
    writeFileSync(f, next);
    console.log("updated refs:", f);
  }
}
