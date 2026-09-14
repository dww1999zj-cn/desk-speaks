#!/usr/bin/env node
/**
 * Xiaohongshu cover: strong before/after + one big hook line.
 *   node scripts/compose-xhs-cover.mjs
 */
import sharp from "sharp";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const BEFORE = resolve(ROOT, "public/marketing/desk-showcase-before.png");
const AFTER = resolve(ROOT, "public/marketing/desk-showcase-after-v10c.png");
const OUT = resolve(ROOT, "public/marketing/xhs-cover.png");

const W = 1080;
const H = 1440;
const cream = { r: 245, g: 240, b: 232 };
const photoTop = 280;
const photoH = 980;
const photoW = W - 64;
const photoLeft = 32;
const halfW = Math.floor(photoW / 2);
const font =
  "system-ui,'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif";

async function findRailY(buf, width, height) {
  const { data } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const lum = (x, y) => {
    const i = (y * width + x) * 3;
    return (data[i] + data[i + 1] + data[i + 2]) / 3;
  };
  let bestY = Math.round(height * 0.18);
  let bestScore = -1;
  const x0 = Math.round(width * 0.15);
  const x1 = Math.round(width * 0.85);
  const y0 = Math.round(height * 0.08);
  const y1 = Math.round(height * 0.35);
  for (let y = y0 + 1; y < y1; y++) {
    let score = 0;
    let n = 0;
    for (let x = x0; x < x1; x += 2) {
      score += Math.abs(lum(x, y) - lum(x, y - 1));
      n++;
    }
    score /= n;
    if (score > bestScore) {
      bestScore = score;
      bestY = y;
    }
  }
  return bestY;
}

async function coverRgb(path) {
  return sharp(path)
    .resize(photoW, photoH, { fit: "cover", position: "centre" })
    .removeAlpha()
    .png()
    .toBuffer();
}

async function alignVertical(buf, dy) {
  if (dy === 0) return buf;
  const canvasH = photoH + Math.abs(dy) + 4;
  const top = dy > 0 ? dy : 0;
  const composed = await sharp({
    create: {
      width: photoW,
      height: canvasH,
      channels: 3,
      background: cream,
    },
  })
    .composite([{ input: buf, left: 0, top }])
    .png()
    .toBuffer();
  return sharp(composed)
    .extract({
      left: 0,
      top: dy < 0 ? -dy : 0,
      width: photoW,
      height: photoH,
    })
    .png()
    .toBuffer();
}

const [beforeRaw, afterRaw] = await Promise.all([
  coverRgb(BEFORE),
  coverRgb(AFTER),
]);
const beforeRail = await findRailY(beforeRaw, photoW, photoH);
const afterRail = await findRailY(afterRaw, photoW, photoH);
const shift = afterRail - beforeRail;

const beforeAligned = await alignVertical(beforeRaw, shift);

const leftHalf = await sharp(beforeAligned)
  .modulate({ brightness: 0.72, saturation: 0.68 })
  .extract({ left: 0, top: 0, width: halfW, height: photoH })
  .png()
  .toBuffer();

const rightHalf = await sharp(afterRaw)
  .modulate({ brightness: 1.18, saturation: 1.1 })
  .extract({ left: halfW, top: 0, width: photoW - halfW, height: photoH })
  .png()
  .toBuffer();

const divider = await sharp({
  create: {
    width: 4,
    height: photoH,
    channels: 4,
    background: { r: 255, g: 255, b: 255, alpha: 0.95 },
  },
})
  .png()
  .toBuffer();

const handleR = 32;
const handleSvg = Buffer.from(
  `<svg width="${handleR * 2}" height="${handleR * 2}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${handleR}" cy="${handleR}" r="${handleR - 1}" fill="white" stroke="#e8e2d8" stroke-width="2"/>
  <path d="M${handleR - 10} ${handleR} l7-7 M${handleR - 10} ${handleR} l7 7" stroke="#2c2c2a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M${handleR + 10} ${handleR} l-7-7 M${handleR + 10} ${handleR} l-7 7" stroke="#2c2c2a" stroke-width="2.4" fill="none" stroke-linecap="round"/>
</svg>`
);

const labelBefore = Buffer.from(
  `<svg width="110" height="44" xmlns="http://www.w3.org/2000/svg">
  <rect width="110" height="44" rx="10" fill="rgba(44,44,42,0.6)"/>
  <text x="55" y="29" text-anchor="middle" font-family="${font}" font-size="22" font-weight="700" fill="white">改造前</text>
</svg>`
);
const labelAfter = Buffer.from(
  `<svg width="110" height="44" xmlns="http://www.w3.org/2000/svg">
  <rect width="110" height="44" rx="10" fill="rgba(61,107,79,0.85)"/>
  <text x="55" y="29" text-anchor="middle" font-family="${font}" font-size="22" font-weight="700" fill="white">改造后</text>
</svg>`
);

const split = await sharp({
  create: { width: photoW, height: photoH, channels: 3, background: cream },
})
  .composite([
    { input: leftHalf, left: 0, top: 0 },
    { input: rightHalf, left: halfW, top: 0 },
    { input: divider, left: halfW - 2, top: 0 },
    {
      input: handleSvg,
      left: halfW - handleR,
      top: Math.round(photoH / 2 - handleR),
    },
    { input: labelBefore, left: 16, top: 16 },
    { input: labelAfter, left: photoW - 126, top: 16 },
  ])
  .png()
  .toBuffer();

const radius = 28;
const mask = Buffer.from(
  `<svg width="${photoW}" height="${photoH}"><rect width="${photoW}" height="${photoH}" rx="${radius}" fill="white"/></svg>`
);
const photoRounded = await sharp(split)
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

const headerSvg = Buffer.from(
  `<svg width="${W}" height="${photoTop}" xmlns="http://www.w3.org/2000/svg">
  <text x="${W / 2}" y="108" text-anchor="middle" font-family="${font}" font-size="44" font-weight="800" fill="#2c2c2a">救命，原来我的桌面</text>
  <text x="${W / 2}" y="168" text-anchor="middle" font-family="${font}" font-size="44" font-weight="800" fill="#2c2c2a">可以长这样</text>
</svg>`
);

const footerH = H - photoTop - photoH;
const footerSvg = Buffer.from(
  `<svg width="${W}" height="${footerH}" xmlns="http://www.w3.org/2000/svg">
  <text x="${W / 2}" y="90" text-anchor="middle" font-family="${font}" font-size="26" font-weight="600" fill="#8a8278">同一张桌子 · 改造前后</text>
</svg>`
);

await sharp({
  create: { width: W, height: H, channels: 3, background: cream },
})
  .composite([
    { input: headerSvg, left: 0, top: 0 },
    { input: photoRounded, left: photoLeft, top: photoTop },
    { input: footerSvg, left: 0, top: photoTop + photoH },
  ])
  .png()
  .toFile(OUT);

console.log("Wrote", OUT, `(${W}x${H})`);
