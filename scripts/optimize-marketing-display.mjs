#!/usr/bin/env node
/**
 * Rebuild homepage WebP display assets from PNG masters.
 *   node scripts/optimize-marketing-display.mjs
 */
import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { statSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DIR = resolve(ROOT, "public/marketing");

const JOBS = [
  {
    src: "desk-showcase-before.png",
    out960: "desk-showcase-before-display.webp",
    out640: "desk-showcase-before-display-640.webp",
  },
  {
    src: "desk-showcase-after-v10c.png",
    out960: "desk-showcase-after-v10c-display.webp",
    out640: "desk-showcase-after-v10c-display-640.webp",
  },
];

for (const job of JOBS) {
  const src = resolve(DIR, job.src);
  for (const [width, outName, quality] of [
    [960, job.out960, 78],
    [640, job.out640, 75],
  ]) {
    const out = resolve(DIR, outName);
    await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(out);
    console.log(
      outName,
      `${(statSync(out).size / 1024).toFixed(1)}KB`,
      `← ${(statSync(src).size / 1024).toFixed(0)}KB`
    );
  }
}
