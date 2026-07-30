#!/usr/bin/env node
/**
 * Promo poster: true half/half splice (left BEFORE, right AFTER).
 * Usage:
 *   node scripts/compose-promo-poster.mjs           # zh (default)
 *   node scripts/compose-promo-poster.mjs --locale en
 *   node scripts/compose-promo-poster.mjs --locale all
 */
import sharp from "sharp";
import QRCode from "qrcode";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

/** Same pair as homepage DeskShowcaseCompare */
const BEFORE = resolve(ROOT, "public/marketing/desk-showcase-before.png");
const AFTER = resolve(ROOT, "public/marketing/desk-showcase-after-v10c.png");

const LOCALES = {
  zh: {
    site: "https://desk.zeabur.app/zh",
    out: resolve(ROOT, "public/marketing/promo-half-half-qr.png"),
    outBase: resolve(ROOT, "public/marketing/promo-half-half-base.png"),
    title: "工位设计师",
    subtitle: "上传一张照片 · 看见改造后的工位",
    badge: "我的工位",
    badgeW: 132,
    before: "改造前",
    after: "改造后",
    cta: "扫码开始改造",
    font: "system-ui,'PingFang SC','Microsoft YaHei',sans-serif",
  },
  en: {
    site: "https://desk.zeabur.app/en",
    out: resolve(ROOT, "public/marketing/promo-half-half-qr-en.png"),
    outBase: resolve(ROOT, "public/marketing/promo-half-half-base-en.png"),
    title: "Desk Designer",
    subtitle: "Upload a photo · See your renovated desk",
    badge: "My Desk",
    badgeW: 120,
    before: "Before",
    after: "After",
    cta: "Scan to renovate",
    font: "system-ui,-apple-system,'Segoe UI',sans-serif",
  },
};

const W = 1080;
const H = 1440;
const PAD = 56;
const cream = { r: 245, g: 240, b: 232 };
const headerH = 270;
const footerH = 220;
const photoH = H - headerH - footerH;
const photoW = W - PAD * 2;
const photoTop = headerH;
const halfW = Math.floor(photoW / 2);

async function findRailY(buf, width, height) {
  const { data } = await sharp(buf)
    .raw()
    .toBuffer({ resolveWithObject: true });
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
  const extractTop = dy < 0 ? -dy : 0;
  return sharp(composed)
    .extract({ left: 0, top: extractTop, width: photoW, height: photoH })
    .png()
    .toBuffer();
}

async function buildPhotoBase() {
  const [beforeRaw, afterRaw] = await Promise.all([
    coverRgb(BEFORE),
    coverRgb(AFTER),
  ]);

  const beforeRail = await findRailY(beforeRaw, photoW, photoH);
  const afterRail = await findRailY(afterRaw, photoW, photoH);
  const shift = afterRail - beforeRail;
  console.log(`Rail align: beforeY=${beforeRail} afterY=${afterRail} shift=${shift}`);

  const beforeAligned = await alignVertical(beforeRaw, shift);

  const leftHalf = await sharp(beforeAligned)
    .modulate({ brightness: 0.74, saturation: 0.7 })
    .extract({ left: 0, top: 0, width: halfW, height: photoH })
    .png()
    .toBuffer();

  const rightHalf = await sharp(afterRaw)
    .modulate({ brightness: 1.2, saturation: 1.1 })
    .extract({ left: halfW, top: 0, width: photoW - halfW, height: photoH })
    .png()
    .toBuffer();

  const divW = 3;
  const divider = await sharp({
    create: {
      width: divW,
      height: photoH,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0.95 },
    },
  })
    .png()
    .toBuffer();

  const handleR = 28;
  const handleSvg = Buffer.from(
    `<svg width="${handleR * 2}" height="${handleR * 2}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${handleR}" cy="${handleR}" r="${handleR - 1}" fill="white" stroke="#e8e2d8" stroke-width="2"/>
  <path d="M${handleR - 9} ${handleR} l6-6 M${handleR - 9} ${handleR} l6 6" stroke="#2c2c2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  <path d="M${handleR + 9} ${handleR} l-6-6 M${handleR + 9} ${handleR} l-6 6" stroke="#2c2c2a" stroke-width="2.2" fill="none" stroke-linecap="round"/>
</svg>`
  );

  return { leftHalf, rightHalf, divider, handleSvg, handleR };
}

async function composeLocale(localeKey, photo) {
  const copy = LOCALES[localeKey];
  const { leftHalf, rightHalf, divider, handleSvg, handleR } = photo;
  const labelW = 120;

  const labelBefore = Buffer.from(
    `<svg width="${labelW}" height="40" xmlns="http://www.w3.org/2000/svg">
  <rect width="${labelW}" height="40" rx="8" fill="rgba(44,44,42,0.55)"/>
  <text x="${labelW / 2}" y="26" text-anchor="middle" font-family="${copy.font}" font-size="18" font-weight="600" fill="white">${copy.before}</text>
</svg>`
  );
  const labelAfter = Buffer.from(
    `<svg width="${labelW}" height="40" xmlns="http://www.w3.org/2000/svg">
  <rect width="${labelW}" height="40" rx="8" fill="rgba(44,44,42,0.55)"/>
  <text x="${labelW / 2}" y="26" text-anchor="middle" font-family="${copy.font}" font-size="18" font-weight="600" fill="white">${copy.after}</text>
</svg>`
  );

  const splitPhoto = await sharp({
    create: { width: photoW, height: photoH, channels: 3, background: cream },
  })
    .composite([
      { input: leftHalf, left: 0, top: 0 },
      { input: rightHalf, left: halfW, top: 0 },
      { input: divider, left: halfW - 1, top: 0 },
      { input: handleSvg, left: halfW - handleR, top: Math.round(photoH / 2 - handleR) },
      { input: labelBefore, left: 16, top: 16 },
      { input: labelAfter, left: photoW - labelW - 16, top: 16 },
    ])
    .png()
    .toBuffer();

  const radius = 20;
  const roundedMask = Buffer.from(
    `<svg width="${photoW}" height="${photoH}"><rect width="${photoW}" height="${photoH}" rx="${radius}" fill="white"/></svg>`
  );
  const photoRounded = await sharp(splitPhoto)
    .composite([{ input: roundedMask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const titleSize = localeKey === "en" ? 56 : 64;
  const headerSvg = Buffer.from(
    `<svg width="${W}" height="${headerH}" xmlns="http://www.w3.org/2000/svg">
  <text x="${PAD}" y="96" font-family="${copy.font}" font-size="${titleSize}" font-weight="700" fill="#2c2c2a">${copy.title}</text>
  <text x="${PAD}" y="144" font-family="${copy.font}" font-size="24" font-weight="400" fill="#6b6560">${copy.subtitle}</text>
  <rect x="${PAD}" y="172" width="${copy.badgeW}" height="40" rx="20" fill="#ebe4d8" stroke="#d9d0c2"/>
  <text x="${PAD + copy.badgeW / 2}" y="198" text-anchor="middle" font-family="${copy.font}" font-size="18" font-weight="500" fill="#3d6b4f">${copy.badge}</text>
</svg>`
  );

  const qrCard = 168;
  const qrPad = 16;
  const qrInner = qrCard - qrPad * 2;
  const qrPng = await QRCode.toBuffer(copy.site, {
    type: "png",
    width: qrInner * 2,
    margin: 1,
    color: { dark: "#2c2c2a", light: "#ffffff" },
    errorCorrectionLevel: "M",
  });
  const qrImg = await sharp(qrPng).resize(qrInner, qrInner).png().toBuffer();

  const qrFrame = Buffer.from(
    `<svg width="${qrCard}" height="${qrCard}" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="${qrCard - 3}" height="${qrCard - 3}" rx="18" fill="#f7f3ec" stroke="#5c554c" stroke-width="3"/>
  <rect x="11" y="11" width="${qrCard - 22}" height="${qrCard - 22}" rx="12" fill="#ffffff" stroke="#cfc6b8" stroke-width="1.5"/>
</svg>`
  );

  const qrCardFull = await sharp(qrFrame)
    .composite([{ input: qrImg, left: qrPad, top: qrPad }])
    .png()
    .toBuffer();

  const footerTextSvg = Buffer.from(
    `<svg width="620" height="${qrCard}" xmlns="http://www.w3.org/2000/svg">
  <text x="0" y="${Math.round(qrCard * 0.42)}" font-family="${copy.font}" font-size="34" font-weight="700" fill="#2c2c2a">${copy.cta}</text>
  <text x="0" y="${Math.round(qrCard * 0.68)}" font-family="system-ui,sans-serif" font-size="22" font-weight="500" fill="#6b6560">desk.zeabur.app</text>
</svg>`
  );

  const footerY = H - footerH + Math.round((footerH - qrCard) / 2);

  await sharp({
    create: { width: W, height: H, channels: 3, background: cream },
  })
    .composite([
      { input: headerSvg, left: 0, top: 0 },
      { input: photoRounded, left: PAD, top: photoTop },
      { input: qrCardFull, left: PAD, top: footerY },
      { input: footerTextSvg, left: PAD + qrCard + 28, top: footerY },
    ])
    .png()
    .toFile(copy.out);

  await sharp(copy.out).toFile(copy.outBase);
  console.log("Wrote", copy.out);
  console.log(`${W}x${H} | ${localeKey} | QR → ${copy.site}`);
}

const localeArg = process.argv.indexOf("--locale");
const localeRaw = localeArg >= 0 ? process.argv[localeArg + 1] : "zh";
const keys =
  localeRaw === "all" ? Object.keys(LOCALES) : [localeRaw in LOCALES ? localeRaw : "zh"];

const photo = await buildPhotoBase();
for (const key of keys) {
  await composeLocale(key, photo);
}
