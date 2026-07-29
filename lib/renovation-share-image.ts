import QRCode from "qrcode";
import type { RenovationResult } from "@/lib/renovation/types";
import { formatShareSiteLabel } from "@/lib/share-copy";
import { getSiteUrl, saveShareImage } from "@/lib/share-image";

export interface RenovationShareCopy {
  badge: string;
  beforeLabel: string;
  afterLabel: string;
  qrTitle: string;
  imageFooter: string;
  filename: string;
}

export { saveShareImage };

const W = 1080;
const PAD = 48;
const INNER = W - PAD * 2;

const COLORS = {
  bgTop: "#F7F6F3",
  bgBottom: "#EEEDE8",
  text: "#2C2C2A",
  muted: "#8A8780",
  plant: "#5B8C5A",
  wood: "#C4A882",
  white: "#FFFFFF",
  card: "#FFFFFF",
  divider: "#E5E3DC",
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const scale = Math.max(w / img.width, h / img.height);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 2
): number {
  const chars = [...text];
  let line = "";
  let cy = y;
  let lines = 0;

  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      lines++;
      if (lines >= maxLines) {
        ctx.fillText(`${line.trim()}…`, x, cy);
        return cy + lineHeight;
      }
      ctx.fillText(line, x, cy);
      line = chars[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line && lines < maxLines) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}

function drawLabelPill(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  variant: "before" | "after",
  font: string
) {
  ctx.font = `600 26px ${font}`;
  const padX = 18;
  const padY = 10;
  const tw = ctx.measureText(text).width;
  const pw = tw + padX * 2;
  const ph = 26 + padY * 2;

  roundRect(ctx, x, y, pw, ph, ph / 2);
  ctx.fillStyle = variant === "after" ? COLORS.plant : "rgba(44,44,42,0.72)";
  ctx.fill();

  ctx.fillStyle = COLORS.white;
  ctx.fillText(text, x + padX, y + padY + 22);
}

function drawComparePhoto(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  label: string,
  x: number,
  y: number,
  w: number,
  h: number,
  variant: "before" | "after",
  font: string
): number {
  ctx.save();
  ctx.shadowColor = "rgba(44,44,42,0.08)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  roundRect(ctx, x, y, w, h, 24);
  ctx.fillStyle = COLORS.card;
  ctx.fill();
  ctx.restore();

  const inset = 6;
  roundRect(ctx, x + inset, y + inset, w - inset * 2, h - inset * 2, 20);
  ctx.save();
  ctx.clip();
  drawCoverImage(ctx, img, x + inset, y + inset, w - inset * 2, h - inset * 2);
  if (variant === "before") {
    ctx.fillStyle = "rgba(44,44,42,0.06)";
    ctx.fillRect(x + inset, y + inset, w - inset * 2, h - inset * 2);
  }
  ctx.restore();

  drawLabelPill(ctx, label, x + 20, y + 20, variant, font);
  return y + h;
}

function drawConnector(ctx: CanvasRenderingContext2D, cx: number, y: number) {
  ctx.strokeStyle = COLORS.divider;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, y);
  ctx.lineTo(cx, y + 28);
  ctx.stroke();

  ctx.fillStyle = COLORS.plant;
  ctx.beginPath();
  ctx.moveTo(cx, y + 38);
  ctx.lineTo(cx - 10, y + 22);
  ctx.lineTo(cx + 10, y + 22);
  ctx.closePath();
  ctx.fill();
}

export async function generateRenovationShareImage(
  renovation: RenovationResult,
  beforeSrc: string,
  afterSrc: string,
  copy: RenovationShareCopy,
  locale?: string
): Promise<Blob> {
  const font =
    "PingFang SC, Microsoft YaHei, system-ui, -apple-system, sans-serif";

  const [beforeImg, afterImg] = await Promise.all([
    loadImage(beforeSrc),
    loadImage(afterSrc),
  ]);

  const photoW = INNER;
  const photoH = Math.round(photoW * 9 / 16);
  const connectorH = 56;
  const qrSize = 152;
  const footerH = 200;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  const measureCtx = canvas.getContext("2d");
  if (!measureCtx) throw new Error("Canvas not supported");

  measureCtx.font = `bold 52px ${font}`;
  let headerBottom = PAD + 32 + 52 + 48;
  headerBottom = wrapText(
    measureCtx,
    renovation.title,
    PAD,
    headerBottom,
    INNER,
    58,
    2
  );
  headerBottom += 44;

  const photosBottom =
    headerBottom + photoH + connectorH + photoH + 40;

  measureCtx.font = `500 32px ${font}`;
  let summaryBottom = wrapText(
    measureCtx,
    renovation.summary,
    PAD,
    photosBottom,
    INNER,
    44,
    2
  );
  if (renovation.highlights[0]) {
    summaryBottom += 8;
    measureCtx.font = `500 28px ${font}`;
    summaryBottom = wrapText(
      measureCtx,
      renovation.highlights[0],
      PAD,
      summaryBottom,
      INNER,
      38,
      1
    );
  }

  const totalH = summaryBottom + 48 + footerH + PAD;
  canvas.height = totalH;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const gradient = ctx.createLinearGradient(0, 0, 0, totalH);
  gradient.addColorStop(0, COLORS.bgTop);
  gradient.addColorStop(1, COLORS.bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, totalH);

  let y = PAD + 28;

  ctx.font = `600 30px ${font}`;
  ctx.fillStyle = COLORS.plant;
  ctx.fillText(copy.badge, PAD, y);
  y += 48;

  ctx.font = `bold 52px ${font}`;
  ctx.fillStyle = COLORS.text;
  y = wrapText(ctx, renovation.title, PAD, y, INNER, 58, 2);

  ctx.font = `500 32px ${font}`;
  ctx.fillStyle = COLORS.wood;
  ctx.fillText(renovation.style, PAD, y + 6);
  y += 44;

  y = drawComparePhoto(
    ctx,
    beforeImg,
    copy.beforeLabel,
    PAD,
    y,
    photoW,
    photoH,
    "before",
    font
  );

  drawConnector(ctx, W / 2, y + 8);
  y += connectorH;

  y = drawComparePhoto(
    ctx,
    afterImg,
    copy.afterLabel,
    PAD,
    y,
    photoW,
    photoH,
    "after",
    font
  );

  y += 40;

  ctx.font = `500 32px ${font}`;
  ctx.fillStyle = COLORS.text;
  y = wrapText(ctx, renovation.summary, PAD, y, INNER, 44, 2);

  if (renovation.highlights[0]) {
    y += 10;
    ctx.font = `500 28px ${font}`;
    ctx.fillStyle = COLORS.muted;
    y = wrapText(ctx, renovation.highlights[0], PAD, y, INNER, 38, 1);
  }

  const qrY = y + 48;
  const siteUrl = getSiteUrl(locale);
  const siteLabel = formatShareSiteLabel(siteUrl);
  const qrDataUrl = await QRCode.toDataURL(siteUrl, {
    width: qrSize,
    margin: 1,
    color: { dark: COLORS.text, light: COLORS.white },
  });
  const qrImg = await loadImage(qrDataUrl);

  ctx.save();
  ctx.shadowColor = "rgba(44,44,42,0.06)";
  ctx.shadowBlur = 16;
  ctx.shadowOffsetY = 4;
  roundRect(ctx, PAD, qrY, qrSize, qrSize, 18);
  ctx.fillStyle = COLORS.white;
  ctx.fill();
  ctx.restore();
  ctx.drawImage(qrImg, PAD + 10, qrY + 10, qrSize - 20, qrSize - 20);

  const textX = PAD + qrSize + 24;
  ctx.font = `600 32px ${font}`;
  ctx.fillStyle = COLORS.text;
  ctx.fillText(copy.qrTitle, textX, qrY + 44);
  if (siteLabel) {
    ctx.font = `500 26px ${font}`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(siteLabel, textX, qrY + 88);
  }

  ctx.font = `500 24px ${font}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(copy.imageFooter, PAD, totalH - PAD - 16);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("生成图片失败"))),
      "image/png",
      0.92
    );
  });
}
