import QRCode from "qrcode";
import type { DeskReport } from "./types";
import { formatShareSiteLabel, SHARE_CARD_COPY } from "./share-copy";
import { formatMbtiType } from "./report";

const W = 1080;
const H = 1920;

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
}

export function getSiteUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://desk.zeabur.app";
}

export async function generateShareImage(
  report: DeskReport,
  deskThumb?: string | null
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布");

  const font =
    '"PingFang SC","Microsoft YaHei",system-ui,sans-serif';
  ctx.textBaseline = "top";

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#FFF8F5");
  bg.addColorStop(0.45, "#FFE8F0");
  bg.addColorStop(1, "#F3EEFF");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  roundRect(ctx, 64, 64, W - 128, H - 128, 48);
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.font = `600 36px ${font}`;
  ctx.fillStyle = COLORS.primary;
  ctx.fillText(SHARE_CARD_COPY.certBadge, 120, 120);

  ctx.font = `bold 72px ${font}`;
  ctx.fillStyle = COLORS.text;
  ctx.fillText(SHARE_CARD_COPY.title, 120, 200);

  if (deskThumb) {
    try {
      const img = await loadImage(deskThumb);
      const thumbSize = 200;
      const tx = W - 120 - thumbSize;
      const ty = 120;
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

  roundRect(ctx, 120, 320, W - 240, 160, 32);
  ctx.fillStyle = "rgba(139,124,246,0.08)";
  ctx.fill();

  ctx.font = `bold 96px ${font}`;
  ctx.fillStyle = COLORS.primary;
  ctx.fillText(report.intro.guessedAge, 160, 360);

  drawCertificationStamp(ctx, 780, 380, 100, font);

  const mbtiLabel = formatMbtiType(report.mbtiDesk.type);
  const pillY = 520;
  const pills = [
    { label: mbtiLabel, bg: COLORS.primary },
    { label: report.zodiacDesk.sign, bg: COLORS.secondary },
  ];
  let pillX = 120;
  ctx.font = `600 36px ${font}`;
  for (const pill of pills) {
    const tw = ctx.measureText(pill.label).width + 64;
    roundRect(ctx, pillX, pillY, tw, 72, 36);
    ctx.fillStyle = pill.bg;
    ctx.fill();
    ctx.fillStyle = pill.label === mbtiLabel ? COLORS.white : COLORS.text;
    ctx.fillText(pill.label, pillX + 32, pillY + 18);
    pillX += tw + 24;
  }

  ctx.font = `600 40px ${font}`;
  ctx.fillStyle = COLORS.text;
  const summaryEnd = wrapText(
    ctx,
    report.shareCard.summary,
    120,
    620,
    W - 240,
    56
  );

  const keywords = report.shareCard.keywords.slice(0, 3);
  let kwX = 120;
  const kwY = summaryEnd + 40;
  ctx.font = `500 32px ${font}`;
  for (const kw of keywords) {
    const kwW = ctx.measureText(kw).width + 56;
    roundRect(ctx, kwX, kwY, kwW, 60, 30);
    ctx.fillStyle = "rgba(255,181,194,0.45)";
    ctx.fill();
    ctx.fillStyle = COLORS.primary;
    ctx.fillText(kw, kwX + 28, kwY + 14);
    kwX += kwW + 16;
  }

  ctx.font = `500 34px ${font}`;
  ctx.fillStyle = COLORS.muted;
  wrapText(
    ctx,
    `「${report.intro.declaration}」`,
    120,
    kwY + 100,
    W - 240,
    48
  );

  const siteUrl = getSiteUrl();
  const qrSize = 200;
  const qrX = W - 120 - qrSize;
  const qrY = H - 120 - qrSize - 80;
  const qrDataUrl = await QRCode.toDataURL(siteUrl, {
    width: qrSize,
    margin: 1,
    color: { dark: COLORS.text, light: "#FFFFFF" },
  });
  const qrImg = await loadImage(qrDataUrl);
  roundRect(ctx, qrX - 12, qrY - 12, qrSize + 24, qrSize + 24, 16);
  ctx.fillStyle = COLORS.white;
  ctx.fill();
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  const qrCenterY = qrY + qrSize / 2;
  const siteLabel = formatShareSiteLabel(siteUrl);
  const textX = 120;

  if (siteLabel) {
    const titleSize = 32;
    const labelSize = 28;
    const gap = 14;
    const blockHeight = titleSize + gap + labelSize;
    const blockTop = qrCenterY - blockHeight / 2;

    ctx.font = `600 ${titleSize}px ${font}`;
    ctx.fillStyle = COLORS.text;
    ctx.textBaseline = "top";
    ctx.fillText(SHARE_CARD_COPY.qrTitle, textX, blockTop);

    ctx.font = `500 ${labelSize}px ${font}`;
    ctx.fillStyle = COLORS.muted;
    ctx.fillText(siteLabel, textX, blockTop + titleSize + gap);
  } else {
    ctx.font = `600 32px ${font}`;
    ctx.fillStyle = COLORS.text;
    ctx.textBaseline = "middle";
    ctx.fillText(SHARE_CARD_COPY.qrTitle, textX, qrCenterY);
  }

  ctx.textBaseline = "alphabetic";

  ctx.font = `500 26px ${font}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText(SHARE_CARD_COPY.imageFooter, 120, H - 170);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("生成图片失败"))),
      "image/png",
      0.92
    );
  });
}

export async function saveShareImage(blob: Blob, filename = "工位人格.png") {
  const file = new File([blob], filename, { type: "image/png" });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "你的工位人格",
        text: "工位猜我几岁？来测测你的工位人格",
      });
      return;
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
