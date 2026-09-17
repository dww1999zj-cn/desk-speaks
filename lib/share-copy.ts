/** 鉴定卡 / 分享图统一文案（备用；线上 UI 优先用 messages/share） */
import { SITE_FOOTER } from "./site-copy";

export const SHARE_CARD_COPY = {
  previewHint: "工位月薪鉴定卡 · 保存即可分享",
  certBadge: "🐮 工位月薪认证",
  title: "工位月薪鉴定",
  qrTitle: "扫码来猜你的工位月薪",
  saveButton: "保存鉴定卡 📸",
  savingButton: "正在生成鉴定卡…",
  savePreviewHint: "长按图片 · 保存到相册",
  saveWeChatHint: "保存失败？点右上角 ··· → 在浏览器打开后再保存",
  shareHint: "保存鉴定卡，即可分享",
  imageFooter: `${SITE_FOOTER} · 长按保存分享`,
} as const;

export function formatShareSiteLabel(siteUrl: string): string | null {
  const host = siteUrl.replace(/^https?:\/\//, "");
  if (/^localhost(:\d+)?$/i.test(host) || /^127\.0\.0\.1(:\d+)?$/i.test(host)) {
    return null;
  }
  return host;
}
