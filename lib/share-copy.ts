/** 鉴定卡 / 分享图统一文案 */
import { SITE_FOOTER } from "./site-copy";

export const SHARE_CARD_COPY = {
  previewHint: "工位鉴定卡 · 保存即可分享",
  certBadge: "🐮 工位牛马认证",
  title: "你的工位人格",
  qrTitle: "扫码来测，更懂你的工位",
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
