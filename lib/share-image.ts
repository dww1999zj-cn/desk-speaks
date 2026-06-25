import QRCode from "qrcode";
import type { DeskReport } from "./types";
import { formatShareSiteLabel, SHARE_CARD_COPY } from "./share-copy";
import { formatMbtiType } from "./report";

const W = 1080;
const CARD_MARGIN = 64;
const CARD_PAD = 56;
const CONTENT_X = CARD_MARGIN + CARD_PAD;
const CONTENT_W = W - CARD_MARGIN * 2 - CARD_PAD * 2;

const COLORS = {
  text: "#4A4458",
  muted: "#9B93A8",
  primary: "#8B7CF6",
  secondary: "#FFB5C2",
  accent: "#FFD166",
  white: "#FFFFFF",
};

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

function measureWrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
  startY: number
): number {
  const chars = [...text];
  let line = "";
  let cy = startY;

  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      line = chars[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) cy += lineHeight;
  return cy;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const chars = [...text];
  let line = "";
  let cy = y;

  for (let i = 0; i < chars.length; i++) {
    const test = line + chars[i];
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, cy);
      line = chars[i];
      cy += lineHeight;
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, cy);
    cy += lineHeight;
  }
  return cy;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCertificationStamp(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  font: string
) {
  const date = new Date()
    .toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(/\//g, ".");

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((12 * Math.PI) / 180);

  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(139,124,246,0.75)";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = "rgba(139,124,246,0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.primary;
  ctx.font = `bold 24px ${font}`;
  ctx.fillText("工位牛马", 0, -22);
  ctx.font = `bold 30px ${font}`;
  ctx.fillText("鉴定通过", 0, 14);
  ctx.font = `500 20px ${font}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(date, 0, 44);

  ctx.restore();
  ctx.textAlign = "left";
}

function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isWeChatBrowser(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent);
}

/** 手机端保存：展示大图供长按保存，避免走系统分享面板 */
export function shouldUseSavePreview(): boolean {
  return isIOS() || isWeChatBrowser();
}

export function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://desk.zeabur.app";
}

interface ShareLayout {
  canvasHeight: number;
  qrY: number;
  qrSize: number;
  qrBoxSize: number;
  qrX: number;
  footerDividerY: number;
  ageBoxY: number;
  summaryY: number;
  keywordsY: number;
  declarationY: number;
  footerTextY: number;
}

function computeShareLayout(
  ctx: CanvasRenderingContext2D,
  report: DeskReport,
  font: string
): ShareLayout {
  const qrSize = 200;
  const qrPad = 12;
  const qrBoxSize = qrSize + qrPad * 2;

  let y = CARD_MARGIN + CARD_PAD;

  y += 80; // badge + title row
  const ageBoxY = y;
  y += 160 + 32; // age box + mt-4

  y += 72 + 24; // pills + mt-3

  const summaryY = y + 16; // mt-4
  ctx.font = `600 40px ${font}`;
  const summaryEnd = measureWrapText(
    ctx,
    report.shareCard.summary,
    CONTENT_W,
    56,
    summaryY
  );

  const keywordsY = summaryEnd + 24; // mt-3
  y = keywordsY + 60 + 24; // keyword pills + mt-3

  const declarationY = y;
  ctx.font = `500 34px ${font}`;
  const declarationEnd = measureWrapText(
    ctx,
    `「${report.intro.declaration}」`,
    CONTENT_W,
    48,
    declarationY
  );

  const footerDividerY = declarationEnd + 40; // mt-5
  const qrY = footerDividerY + 32; // pt-4
  const footerTextY = qrY + qrBoxSize + 28;
  const canvasHeight = footerTextY + 48 + CARD_MARGIN;

  const qrX = W - CARD_MARGIN - CARD_PAD - qrBoxSize;

  return {
    canvasHeight,
    qrY,
    qrSize,
    qrBoxSize,
    qrX,
    footerDividerY,
    ageBoxY,
    summaryY,
    keywordsY,
    declarationY,
    footerTextY,
  };
}

export async function generateShareImage(
  report: DeskReport,
  deskThumb?: string | null
): Promise<Blob> {
  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) throw new Error("无法创建画布");

  const font =
    '"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  measureCtx.font = `600 40px ${font}`;
  const layout = computeShareLayout(measureCtx, report, font);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = layout.canvasHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布");

  ctx.textBaseline = "top";

  const bg = ctx.createLinearGradient(0, 0, W, layout.canvasHeight);
  bg.addColorStop(0, "#FFF8F5");
  bg.addColorStop(0.45, "#FFE8F0");
  bg.addColorStop(1, "#F3EEFF");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, layout.canvasHeight);

  const cardH = layout.canvasHeight - CARD_MARGIN * 2;
  roundRect(ctx, CARD_MARGIN, CARD_MARGIN, W - CARD_MARGIN * 2, cardH, 48);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 4;
  ctx.stroke();

  let y = CARD_MARGIN + CARD_PAD;

  ctx.font = `600 36px ${font}`;
  ctx.fillStyle = COLORS.primary;
  ctx.fillText(SHARE_CARD_COPY.certBadge, CONTENT_X, y);

  ctx.font = `bold 72px ${font}`;
  ctx.fillStyle = COLORS.text;
  ctx.fillText(SHARE_CARD_COPY.title, CONTENT_X, y + 56);

  if (deskThumb) {
    try {
      const img = await loadImage(deskThumb);
      const thumbSize = 200;
      const tx = W - CARD_MARGIN - CARD_PAD - thumbSize;
      const ty = y;
      roundRect(ctx, tx, ty, thumbSize, thumbSize, 24);
      ctx.save();
      ctx.clip();
      ctx.drawImage(img, tx, ty, thumbSize, thumbSize);
      ctx.restore();
      ctx.strokeStyle = COLORS.white;
      ctx.lineWidth = 6;
      roundRect(ctx, tx, ty, thumbSize, thumbSize, 24);
      ctx.stroke();
    } catch {
      /* skip thumb */
    }
  }

  y = layout.ageBoxY;
  roundRect(ctx, CONTENT_X, y, CONTENT_W, 160, 32);
  ctx.fillStyle = "rgba(139,124,246,0.08)";
  ctx.fill();

  ctx.font = `bold 96px ${font}`;
  ctx.fillStyle = COLORS.primary;
  ctx.textAlign = "center";
  ctx.fillText(report.intro.guessedAge, W / 2, y + 32);
  ctx.textAlign = "left";

  drawCertificationStamp(
    ctx,
    W - CARD_MARGIN - CARD_PAD - 60,
    y + 80,
    100,
    font
  );

  y += 160 + 32;

  const mbtiLabel = formatMbtiType(report.mbtiDesk.type);
  const pills = [
    { label: mbtiLabel, bg: COLORS.primary, fg: COLORS.white },
    { label: report.zodiacDesk.sign, bg: COLORS.secondary, fg: COLORS.text },
  ];
  let pillX = CONTENT_X;
  ctx.font = `600 36px ${font}`;
  for (const pill of pills) {
    const tw = ctx.measureText(pill.label).width + 64;
    roundRect(ctx, pillX, y, tw, 72, 36);
    ctx.fillStyle = pill.bg;
    ctx.fill();
    ctx.fillStyle = pill.fg;
    ctx.fillText(pill.label, pillX + 32, y + 18);
    pillX += tw + 24;
  }

  ctx.font = `600 40px ${font}`;
  ctx.fillStyle = COLORS.text;
  wrapText(
    ctx,
    report.shareCard.summary,
    CONTENT_X,
    layout.summaryY,
    CONTENT_W,
    56
  );

  const keywords = report.shareCard.keywords.slice(0, 3);
  let kwX = CONTENT_X;
  ctx.font = `500 32px ${font}`;
  for (const kw of keywords) {
    const kwW = ctx.measureText(kw).width + 56;
    roundRect(ctx, kwX, layout.keywordsY, kwW, 60, 30);
    ctx.fillStyle = "rgba(255,181,194,0.45)";
    ctx.fill();
    ctx.fillStyle = COLORS.primary;
    ctx.fillText(kw, kwX + 28, layout.keywordsY + 14);
    kwX += kwW + 16;
  }

  ctx.font = `500 34px ${font}`;
  ctx.fillStyle = COLORS.muted;
  wrapText(
    ctx,
    `「${report.intro.declaration}」`,
    CONTENT_X,
    layout.declarationY,
    CONTENT_W,
    48
  );

  ctx.strokeStyle = "rgba(255,255,255,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CONTENT_X, layout.footerDividerY);
  ctx.lineTo(CONTENT_X + CONTENT_W, layout.footerDividerY);
  ctx.stroke();

  const siteUrl = getSiteUrl();
  const qrDataUrl = await QRCode.toDataURL(siteUrl, {
    width: layout.qrSize,
    margin: 1,
    color: { dark: COLORS.text, light: "#FFFFFF" },
  });
  const qrImg = await loadImage(qrDataUrl);
  roundRect(
    ctx,
    layout.qrX,
    layout.qrY,
    layout.qrBoxSize,
    layout.qrBoxSize,
    16
  );
  ctx.fillStyle = COLORS.white;
  ctx.fill();
  ctx.drawImage(
    qrImg,
    layout.qrX + 12,
    layout.qrY + 12,
    layout.qrSize,
    layout.qrSize
  );

  const qrCenterY = layout.qrY + layout.qrBoxSize / 2;
  const siteLabel = formatShareSiteLabel(siteUrl);
  const textX = CONTENT_X;

  if (siteLabel) {
    const titleSize = 32;
    const labelSize = 28;
    const gap = 14;
    const blockHeight = titleSize + gap + labelSize;
    const blockTop = qrCenterY - blockHeight / 2;

    ctx.font = `600 ${titleSize}px ${font}`;
    ctx.fillStyle = COLORS.text;
    ctx.fillText(SHARE_CARD_COPY.qrTitle, textX, blockTop);

    ctx.font = `500 ${labelSize}px ${font}`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(siteLabel, textX, blockTop + titleSize + gap);
  } else {
    ctx.font = `600 32px ${font}`;
    ctx.fillStyle = COLORS.text;
    const titleMetrics = ctx.measureText(SHARE_CARD_COPY.qrTitle);
    ctx.fillText(
      SHARE_CARD_COPY.qrTitle,
      textX,
      qrCenterY - titleMetrics.actualBoundingBoxAscent / 2
    );
  }

  ctx.font = `500 26px ${font}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(SHARE_CARD_COPY.imageFooter, CONTENT_X, layout.footerTextY);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("生成图片失败"))),
      "image/png",
      0.92
    );
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function saveShareImage(
  blob: Blob,
  filename = "工位人格.png",
  onPreview?: (imageUrl: string) => void
) {
  if (shouldUseSavePreview() && onPreview) {
    onPreview(URL.createObjectURL(blob));
    return;
  }

  downloadBlob(blob, filename);
}
