import QRCode from "qrcode";
import type { DeskReport } from "./types";
import { formatShareSiteLabel } from "./share-copy";

export interface ShareImageCopy {
  certBadge: string;
  title: string;
  salaryGuessLabel: string;
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
const HEADER_TITLE_SALARY_GAP = 48;
const SALARY_BOX_HEIGHT = 200;
const PHOTO_HEIGHT = 480;
const SALARY_BAND_HEIGHT = 220;
const SALARY_BOX_BOTTOM_GAP = 32;
const PILL_HEIGHT = 72;
const PILL_SUMMARY_GAP = 32;
const KEYWORD_PILL_HEIGHT = 60;

/** Match app theme: cream / plant / wood (not purple cert) */
const COLORS = {
  text: "#2C2C2A",
  muted: "#8A8780",
  plant: "#5B8C5A",
  wood: "#C4A882",
  cream: "#F7F6F3",
  surface: "#EEEDE8",
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

function measureHeaderBottom(
  ctx: CanvasRenderingContext2D,
  copy: ShareImageCopy,
  font: string
): number {
  const maxW = CONTENT_W;
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

  return y + HEADER_TITLE_SALARY_GAP;
}

function getSalaryBoxY(
  ctx: CanvasRenderingContext2D,
  copy: ShareImageCopy,
  font: string
): number {
  return measureHeaderBottom(ctx, copy, font);
}

function getHeroBlockHeight(hasThumb: boolean): number {
  return hasThumb ? PHOTO_HEIGHT + SALARY_BAND_HEIGHT : SALARY_BOX_HEIGHT;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const ir = img.width / img.height;
  const tr = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (ir > tr) {
    sw = img.height * tr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / tr;
    sy = (img.height - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
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
  ctx.strokeStyle = "rgba(91,140,90,0.75)";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, radius - 10, 0, Math.PI * 2);
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = "rgba(91,140,90,0.45)";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS.plant;

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
  salaryBoxY: number;
  pillsY: number;
  summaryY: number;
  keywordsY: number;
  declarationY: number;
  footerTextY: number;
}

function getPillsY(salaryBoxY: number, hasThumb: boolean): number {
  return salaryBoxY + getHeroBlockHeight(hasThumb) + SALARY_BOX_BOTTOM_GAP;
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

  const salaryBoxY = getSalaryBoxY(ctx, copy, font);
  const pillsY = getPillsY(salaryBoxY, hasThumb);
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
  const evidenceLine =
    report.fengShui?.brief ||
    report.salary.salaryHint ||
    report.deskEvidence[0] ||
    "";
  const declarationEnd = measureWrapText(
    ctx,
    evidenceLine ? `「${evidenceLine}」` : "",
    CONTENT_W,
    48,
    declarationY
  );

  const footerDividerY = declarationEnd + 40;
  const qrY = footerDividerY + 32;
  const footerTextY = qrY + qrBoxSize + 28;
  const canvasHeight = footerTextY + 48 + CARD_MARGIN;

  // QR on the left — matches SharePreviewCard
  const qrX = CONTENT_X;

  return {
    canvasHeight,
    qrY,
    qrSize,
    qrBoxSize,
    qrX,
    footerDividerY,
    salaryBoxY,
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
  bg.addColorStop(0, "#F7F6F3");
  bg.addColorStop(0.5, "#EEEDE8");
  bg.addColorStop(1, "#E8EDE6");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, layout.canvasHeight);

  const cardH = layout.canvasHeight - CARD_MARGIN * 2;
  roundRect(ctx, CARD_MARGIN, CARD_MARGIN, W - CARD_MARGIN * 2, cardH, 48);
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.fill();
  ctx.strokeStyle = "rgba(91,140,90,0.18)";
  ctx.lineWidth = 4;
  ctx.stroke();

  let y = getHeaderStartY();

  ctx.font = `600 ${HEADER_BADGE_SIZE}px ${font}`;
  ctx.fillStyle = COLORS.plant;
  y = wrapText(ctx, copy.certBadge, CONTENT_X, y, CONTENT_W, HEADER_BADGE_SIZE + 8);
  y += HEADER_BADGE_TITLE_GAP;

  ctx.font = `bold ${HEADER_TITLE_SIZE}px ${font}`;
  ctx.fillStyle = COLORS.text;
  y = wrapText(
    ctx,
    copy.title,
    CONTENT_X,
    y,
    CONTENT_W,
    HEADER_TITLE_LINE_HEIGHT
  );

  y = layout.salaryBoxY;

  if (deskThumb) {
    const heroH = PHOTO_HEIGHT + SALARY_BAND_HEIGHT;
    const salaryY = y + PHOTO_HEIGHT;

    roundRect(ctx, CONTENT_X, y, CONTENT_W, heroH, 36);
    ctx.save();
    ctx.clip();

    try {
      const img = await loadImage(deskThumb);
      drawImageCover(ctx, img, CONTENT_X, y, CONTENT_W, PHOTO_HEIGHT);
    } catch {
      ctx.fillStyle = "rgba(91,140,90,0.08)";
      ctx.fillRect(CONTENT_X, y, CONTENT_W, PHOTO_HEIGHT);
    }

    ctx.fillStyle = "rgba(232,237,230,0.96)";
    ctx.fillRect(CONTENT_X, salaryY, CONTENT_W, SALARY_BAND_HEIGHT);
    ctx.restore();

    ctx.strokeStyle = "rgba(91,140,90,0.16)";
    ctx.lineWidth = 3;
    roundRect(ctx, CONTENT_X, y, CONTENT_W, heroH, 36);
    ctx.stroke();

    // Soft seam between photo and salary
    ctx.strokeStyle = "rgba(91,140,90,0.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(CONTENT_X + 28, salaryY);
    ctx.lineTo(CONTENT_X + CONTENT_W - 28, salaryY);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = COLORS.muted;
    ctx.font = `500 28px ${font}`;
    ctx.fillText(copy.salaryGuessLabel, W / 2, salaryY + 36);
    ctx.font = `bold 84px ${font}`;
    ctx.fillStyle = COLORS.plant;
    ctx.fillText(report.salary.guessedSalary, W / 2, salaryY + 76);

    if (report.shareCard.summary) {
      ctx.font = `600 32px ${font}`;
      ctx.fillStyle = COLORS.text;
      ctx.fillText(report.shareCard.summary, W / 2, salaryY + 172);
    }
    ctx.textAlign = "left";

    // 骑缝章最后画：章心正好压在接缝上，半图半价
    drawCertificationStamp(
      ctx,
      CONTENT_X + CONTENT_W * 0.78,
      salaryY,
      96,
      font,
      copy.stampLine1,
      copy.stampLine2,
      locale
    );
  } else {
    roundRect(ctx, CONTENT_X, y, CONTENT_W, SALARY_BOX_HEIGHT, 32);
    ctx.fillStyle = "rgba(91,140,90,0.08)";
    ctx.fill();

    drawCertificationStamp(
      ctx,
      CONTENT_X + CONTENT_W - 48,
      layout.salaryBoxY + 32,
      100,
      font,
      copy.stampLine1,
      copy.stampLine2,
      locale
    );

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = COLORS.muted;
    ctx.font = `500 28px ${font}`;
    ctx.fillText(copy.salaryGuessLabel, W / 2, y + 36);
    ctx.font = `bold 88px ${font}`;
    ctx.fillStyle = COLORS.plant;
    ctx.fillText(report.salary.guessedSalary, W / 2, y + 84);
    ctx.textAlign = "left";
  }

  const pills: { label: string; bg: string; fg: string }[] = [];
  if (report.fengShui?.topic) {
    pills.push({
      label: report.fengShui.topic,
      bg: COLORS.plant,
      fg: COLORS.white,
    });
  }
  if (report.shareCard.summary && !hasThumb) {
    pills.push({
      label: report.shareCard.summary,
      bg: "rgba(196,168,130,0.45)",
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

  const keywords = (report.shareCard.keywords ?? []).slice(0, 2);
  let kwX = CONTENT_X;
  ctx.font = `500 32px ${font}`;
  for (const kw of keywords) {
    const kwW = ctx.measureText(kw).width + 56;
    roundRect(ctx, kwX, layout.keywordsY, kwW, KEYWORD_PILL_HEIGHT, 30);
    ctx.fillStyle = "rgba(196,168,130,0.35)";
    ctx.fill();
    ctx.fillStyle = COLORS.plant;
    ctx.fillText(kw, kwX + 28, layout.keywordsY + 14);
    kwX += kwW + 16;
  }

  const evidenceLine =
    report.fengShui?.brief ||
    report.salary.salaryHint ||
    report.deskEvidence[0] ||
    "";
  ctx.font = `500 34px ${font}`;
  ctx.fillStyle = COLORS.muted;
  wrapText(
    ctx,
    evidenceLine ? `「${evidenceLine}」` : "",
    CONTENT_X,
    layout.declarationY,
    CONTENT_W,
    48
  );

  ctx.strokeStyle = "rgba(44,44,42,0.08)";
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
  const textX = layout.qrX + layout.qrBoxSize + 28;

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
  filename = "工位月薪.png",
  onPreview?: (imageUrl: string) => void
) {
  if (shouldUseSavePreview() && onPreview) {
    // 微信内置浏览器无法长按保存 blob: URL，需用 base64
    onPreview(await blobToDataUrl(blob));
    return;
  }

  downloadBlob(blob, filename);
}
