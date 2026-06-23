const DESKTOP_MAX = 960;
const MOBILE_MAX = 640;
const THUMB_MAX = 320;
const DESKTOP_QUALITY = 0.72;
const MOBILE_QUALITY = 0.58;
const THUMB_QUALITY = 0.55;

export interface CompressedImages {
  full: string;
  thumb: string;
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function compressFromImageElement(
  img: HTMLImageElement,
  maxSize: number,
  quality: number
): string {
  let { width, height } = img;

  if (width > maxSize || height > maxSize) {
    const ratio = Math.min(maxSize / width, maxSize / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建 canvas");

  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function compressImageForUpload(
  file: File
): Promise<CompressedImages> {
  const mobile = isMobileDevice();
  const maxSize = mobile ? MOBILE_MAX : DESKTOP_MAX;
  const quality = mobile ? MOBILE_QUALITY : DESKTOP_QUALITY;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const full = compressFromImageElement(img, maxSize, quality);
          const thumb = compressFromImageElement(img, THUMB_MAX, THUMB_QUALITY);
          resolve({ full, thumb });
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("图片加载失败"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("文件读取失败"));
    reader.readAsDataURL(file);
  });
}

/** @deprecated 使用 compressImageForUpload */
export async function compressImage(file: File): Promise<string> {
  const { full } = await compressImageForUpload(file);
  return full;
}

export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(",")[1] ?? dataUrl;
}

export function estimateDataUrlSizeKB(dataUrl: string): number {
  const base64 = dataUrl.split(",")[1] ?? dataUrl;
  return Math.round((base64.length * 0.75) / 1024);
}
