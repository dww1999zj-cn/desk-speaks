import QRCode from "qrcode";
import type { DeskReport } from "./types";
import { formatShareSiteLabel } from "./share-copy";
import { formatMbtiType } from "./report";

export interface ShareImageCopy {
  certBadge: string;
  title: string;
  ageGuessLabel: string;
  qrTitle: string;
  imageFooter: string;
  stampLine1: string;
  stampLine2: string;
  filename: string;
}

const W = 1080;
const CARD_MARGIN = 64;
const CARD_PAD = 56;
const CONTENT_X = CARD_MARGIN + CARD_PAD;
const CONTENT_W = W - CARD_MARGIN * 2 - CARD_PAD * 2;

const HEADER_BADGE_SIZE = 36;
const HEADER_BADGE_TITLE_GAP = 16;
const HEADER_TITLE_SIZE = 72;
const HEADER_TITLE_AGE_GAP = 48;
const AGE_BOX_HEIGHT = 160;
const AGE_BOX_BOTTOM_GAP = 32;
const PILL_HEIGHT = 72;
const PILL_SUMMARY_GAP = 32;
const KEYWORD_PILL_HEIGHT = 60;

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

function getShareHeadline(report: DeskReport): string {
  return report.shareCard.shareHook || report.shareCard.summary;
}

function getHeaderStartY(): number {
  return CARD_MARGIN + CARD_PAD;
}

const HEADER_TITLE_LINE_HEIGHT = 80;
const THUMB_SIZE = 200;
const THUMB_GAP = 24;

function getTitleMaxWidth(hasThumb: boolean): number {
  if (!hasThumb) return CONTENT_W;
  return W - CARD_MARGIN - CARD_PAD - THUMB_SIZE - THUMB_GAP - CONTENT_X;
}

function measureHeaderBottom(
  ctx: CanvasRenderingContext2D,
  copy: ShareImageCopy,
  font: string,
  hasThumb: boolean
): number {
  const maxW = getTitleMaxWidth(hasThumb);
  let y = getHeaderStartY();

  ctx.font = `600 ${HEADER_BADGE_SIZE}px ${font}`;
  y = measureWrapText(
    ctx,
    copy.certBadge,
    maxW,
    HEADER_BADGE_SIZE + 8,
    y
  );
  y += HEADER_BADGE_TITLE_GAP;

  ctx.font = `bold ${HEADER_TITLE_SIZE}px ${font}`;
  y = measureWrapText(
    ctx,
    copy.title,
    maxW,
    HEADER_TITLE_LINE_HEIGHT,
    y
  );

  return y + HEADER_TITLE_AGE_GAP;
}

function getAgeBoxY(
  ctx: CanvasRenderingContext2D,
  copy: ShareImageCopy,
  font: string,
  hasThumb: boolean
): number {
  return measureHeaderBottom(ctx, copy, font, hasThumb);
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
  font: string,
  stampLine1: string,
  stampLine2: string,
  locale: string
) {
  const date = new Date()
    .toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US", {
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
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.primary;

  const lineGap = 26;
  ctx.font = `bold 24px ${font}`;
  ctx.fillText(stampLine1, 0, -lineGap);
  ctx.font = `bold 30px ${font}`;
  ctx.fillText(stampLine2, 0, 0);
  ctx.font = `500 20px ${font}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(date, 0, lineGap);

  ctx.restore();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
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

export { isWeChatBrowser };

export function getSiteUrl(locale?: string): string {
  const base =
    typeof window !== "undefined"
      ? (process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin)
      : (process.env.NEXT_PUBLIC_SITE_URL ?? "https://desk.zeabur.app");
  const clean = base.replace(/\/$/, "");
  if (locale === "en") return `${clean}/en`;
  if (locale === "zh") return `${clean}/zh`;
  return clean;
}

interface ShareLayout {
  canvasHeight: number;
  qrY: number;
  qrSize: number;
  qrBoxSize: number;
  qrX: number;
  footerDividerY: number;
  ageBoxY: number;
  pillsY: number;
  summaryY: number;
  keywordsY: number;
  declarationY: number;
  footerTextY: number;
}

function getPillsY(ageBoxY: number): number {
  return ageBoxY + AGE_BOX_HEIGHT + AGE_BOX_BOTTOM_GAP;
}

function computeShareLayout(
  ctx: CanvasRenderingContext2D,
  report: DeskReport,
  copy: ShareImageCopy,
  font: string,
  hasThumb: boolean
): ShareLayout {
  const qrSize = 200;
  const qrPad = 12;
  const qrBoxSize = qrSize + qrPad * 2;

  const ageBoxY = getAgeBoxY(ctx, copy, font, hasThumb);
  const pillsY = getPillsY(ageBoxY);
  const summaryY = pillsY + PILL_HEIGHT + PILL_SUMMARY_GAP;

  ctx.font = `600 40px ${font}`;
  const summaryEnd = measureWrapText(
    ctx,
    getShareHeadline(report),
    CONTENT_W,
    56,
    summaryY
  );

  const keywordsY = summaryEnd + 24;
  const declarationY = keywordsY + KEYWORD_PILL_HEIGHT + 24;

  ctx.font = `500 34px ${font}`;
  const declarationEnd = measureWrapText(
    ctx,
    `「${report.deskEvidence[0] ?? report.intro.declaration}」`,
    CONTENT_W,
    48,
    declarationY
  );

  const footerDividerY = declarationEnd + 40;
  const qrY = footerDividerY + 32;
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
    pillsY,
    summaryY,
    keywordsY,
    declarationY,
    footerTextY,
  };
}

export async function generateShareImage(
  report: DeskReport,
  deskThumb: string | null | undefined,
  copy: ShareImageCopy,
  locale: string
): Promise<Blob> {
  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) throw new Error("无法创建画布");

  const font =
    '"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  const hasThumb = Boolean(deskThumb);
  measureCtx.font = `600 40px ${font}`;
  const layout = computeShareLayout(
    measureCtx,
    report,
    copy,
    font,
    hasThumb
  );

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

  let y = getHeaderStartY();
  const titleMaxW = getTitleMaxWidth(hasThumb);

  ctx.font = `600 ${HEADER_BADGE_SIZE}px ${font}`;
  ctx.fillStyle = COLORS.primary;
  y = wrapText(ctx, copy.certBadge, CONTENT_X, y, titleMaxW, HEADER_BADGE_SIZE + 8);
  y += HEADER_BADGE_TITLE_GAP;

  ctx.font = `bold ${HEADER_TITLE_SIZE}px ${font}`;
  ctx.fillStyle = COLORS.text;
  y = wrapText(
    ctx,
    copy.title,
    CONTENT_X,
    y,
    titleMaxW,
    HEADER_TITLE_LINE_HEIGHT
  );

  if (deskThumb) {
    try {
      const img = await loadImage(deskThumb);
      const tx = W - CARD_MARGIN - CARD_PAD - THUMB_SIZE;
      const ty = getHeaderStartY();
      roundRect(ctx, tx, ty, THUMB_SIZE, THUMB_SIZE, 24);
      ctx.save();
      ctx.clip();
      ctx.drawImage(img, tx, ty, THUMB_SIZE, THUMB_SIZE);
      ctx.restore();
      ctx.strokeStyle = COLORS.white;
      ctx.lineWidth = 6;
      roundRect(ctx, tx, ty, THUMB_SIZE, THUMB_SIZE, 24);
      ctx.stroke();
    } catch {
      /* skip thumb */
    }
  }

  y = layout.ageBoxY;
  roundRect(ctx, CONTENT_X, y, CONTENT_W, AGE_BOX_HEIGHT, 32);
  ctx.fillStyle = "rgba(139,124,246,0.08)";
  ctx.fill();

  ctx.font = `bold 96px ${font}`;
  ctx.fillStyle = COLORS.primary;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(report.intro.guessedAge, W / 2, y + AGE_BOX_HEIGHT / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  drawCertificationStamp(
    ctx,
    W - CARD_MARGIN - CARD_PAD - 100,
    layout.ageBoxY + AGE_BOX_HEIGHT / 2,
    100,
    font,
    copy.stampLine1,
    copy.stampLine2,
    locale
  );

  const mbtiLabel = formatMbtiType(report.mbtiDesk.type);
  const pills = [
    { label: mbtiLabel, bg: COLORS.primary, fg: COLORS.white },
    { label: report.zodiacDesk.sign, bg: COLORS.secondary, fg: COLORS.text },
  ];
  if (report.shareCard.summary) {
    pills.push({
      label: report.shareCard.summary,
      bg: COLORS.accent,
      fg: COLORS.text,
    });
  }
  let pillX = CONTENT_X;
  ctx.font = `600 36px ${font}`;
  for (const pill of pills) {
    const tw = ctx.measureText(pill.label).width + 64;
    roundRect(ctx, pillX, layout.pillsY, tw, PILL_HEIGHT, 36);
    ctx.fillStyle = pill.bg;
    ctx.fill();
    ctx.fillStyle = pill.fg;
    ctx.fillText(pill.label, pillX + 32, layout.pillsY + 18);
    pillX += tw + 24;
  }

  ctx.font = `600 40px ${font}`;
  ctx.fillStyle = COLORS.text;
  wrapText(
    ctx,
    getShareHeadline(report),
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
    roundRect(ctx, kwX, layout.keywordsY, kwW, KEYWORD_PILL_HEIGHT, 30);
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
    `「${report.deskEvidence[0] ?? report.intro.declaration}」`,
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

  const siteUrl = getSiteUrl(locale);
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
    ctx.fillText(copy.qrTitle, textX, blockTop);

    ctx.font = `500 ${labelSize}px ${font}`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(siteLabel, textX, blockTop + titleSize + gap);
  } else {
    ctx.font = `600 32px ${font}`;
    ctx.fillStyle = COLORS.text;
    const titleMetrics = ctx.measureText(copy.qrTitle);
    ctx.fillText(
      copy.qrTitle,
      textX,
      qrCenterY - titleMetrics.actualBoundingBoxAscent / 2
    );
  }

  ctx.font = `500 26px ${font}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(copy.imageFooter, CONTENT_X, layout.footerTextY);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("生成图片失败"))),
      "image/png",
      0.92
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("无法读取图片"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("无法读取图片"));
    reader.readAsDataURL(blob);
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
    // 微信内置浏览器无法长按保存 blob: URL，需用 base64
    onPreview(await blobToDataUrl(blob));
    return;
  }

  downloadBlob(blob, filename);
}
