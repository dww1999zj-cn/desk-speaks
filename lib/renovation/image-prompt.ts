import type { AppLocale } from "@/lib/i18n/locale";
import type { RenovationPlan } from "./types";
import type { DeskStyleId } from "./desk-styles";
import { enhanceDecorPromptForImage } from "./desk-accents";
import {
  getDeskStyleImagePrompt,
  getDeskStyleNegativeExtra,
  getDeskStyleOrganizePrompt,
} from "./desk-styles";

/** Lead with structure lock — model reads this first. */
function buildStructureLock(plan: RenovationPlan, locale: AppLocale): string {
  const bare = plan.bareDesk?.trim();
  if (locale === "en") {
    if (bare) {
      return (
        `STRUCTURE LOCK — must match image 1 exactly, pixel-level: ${bare}. ` +
        "Do NOT change desk shape, desk color, desk material, cabinet, walls, or monitor positions."
      );
    }
    return (
      "STRUCTURE LOCK — desk shape, desk surface color/material, filing cabinet, " +
      "partition walls, and monitors must match image 1 exactly. No repainting, no replacement."
    );
  }
  if (bare) {
    return (
      `【固定不变·与图1完全一致】${bare}。` +
      "禁止改变桌子形状、桌面颜色材质、文件柜、隔断墙、显示器位置，禁止换桌换柜改色改形。"
    );
  }
  return (
    "【固定不变·与图1完全一致】桌子形状、桌面颜色材质、文件柜、隔断墙、显示器位置。" +
    "禁止换桌换柜、禁止改色改形、禁止重绘家具。"
  );
}

/** Pass-2 lock — preserve organized layout from pass 1. */
function buildOrganizedLayoutLock(locale: AppLocale): string {
  if (locale === "en") {
    return (
      "STRUCTURE LOCK — keep image 1's tidy storage layout, monitor/keyboard positions, " +
      "desk surface material/color, and background unchanged. No desk/cabinet swap."
    );
  }
  return (
    "【固定不变·与图1完全一致】保持图1已有整洁收纳布局、显示器键盘位置、桌面材质颜色、背景不变，禁止改桌换柜。"
  );
}

/**
 * Image edit baseline — movable items only, work-first desk.
 * Model: wan2.5-i2i-preview, prompt_extend: false (avoid LLM rewriting locks away)
 */
export const GLOWUP_BASELINE_ZH =
  "基于图1同机位同场景，仅整理桌面可移动小物件：杂物收入收纳盒/托盘/笔筒，线缆隐藏。" +
  "【可工作桌面】键盘鼠标前方必须留白可操作；" +
  "全桌氛围点缀仅1件，切忌满桌摆件（小绿植、台灯、大号桌垫、小相框、单支花瓶、金属几何摆件、沙漏、香薰机等择一）；" +
  "禁止手办玩偶成排、禁止满桌装饰堆砌。真实可办公照片。";

export const GLOWUP_BASELINE_EN =
  "Same camera, same scene as image 1. Edit ONLY movable desktop items: " +
  "clutter into boxes/trays/pen holders, hidden cables. " +
  "WORKABLE DESK: keep keyboard/mouse area clear; " +
  "exactly ONE accent on the whole desk — never crowded ornaments " +
  "(pick ONE: plant, lamp, large desk mat, mini frame, single-stem vase, geometric accent, sand timer, diffuser); " +
  "NO figurine rows, NO crowded decor. Photorealistic office photo.";

/** Pass 1 — organize only, no decor (mirrors marketing v4). */
export function buildOrganizePassPrompt(
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId
): string {
  const lock = buildStructureLock(plan, locale);

  if (locale === "en") {
    let prompt =
      lock +
      " Same camera as image 1. STEP 1 — ORGANIZE ONLY: put ALL loose clutter into storage boxes/trays/pen holders/cable box. " +
      "100% of loose items must go into organizers; desk surface clear except storage containers; cables hidden. " +
      "Keyboard/mouse zone must stay workable. DO NOT add any decor, plants, lamps, mats, or ornaments. " +
      "Transformation must be visibly tidier than before. Photorealistic office photo.";
    prompt += " " + getDeskStyleOrganizePrompt(deskStyle, locale);
    const editHint = plan.organizePrompt?.trim() || plan.imagePrompt?.trim();
    if (editHint) prompt += ` Organize: ${editHint}.`;
    if (plan.clutterItems?.length) {
      const items = plan.clutterItems.slice(0, 6).join(", ");
      prompt += ` Clear these loose items: ${items}.`;
    }
    return prompt;
  }

  let prompt =
    lock +
    " 基于图1同机位，第一步只做收纳整理，禁止添加任何装饰摆件。" +
    "键盘鼠标前方必须留白可办公。" +
    "把所有散落杂物100%收进收纳盒/托盘/笔筒/理线盒，桌面除收纳容器外零散落物，数据线隐藏，改造对比要明显。真实照片。";
  prompt += getDeskStyleOrganizePrompt(deskStyle, locale);
  const editHint = plan.organizePrompt?.trim() || plan.imagePrompt?.trim();
  if (editHint) prompt += ` 收纳：${editHint}。`;
  if (plan.clutterItems?.length) {
    const items = plan.clutterItems.slice(0, 6).join("、");
    prompt += ` 收走这些散落物：${items}。`;
  }
  return prompt;
}

/** Pass 2 — preserve tidy layout, add single accent (mirrors marketing v7/v10c). */
export function buildDecorPassPrompt(
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId
): string {
  const lock = buildOrganizedLayoutLock(locale);
  const decorHint = plan.decorPrompt?.trim();
  if (!decorHint) return "";

  const enhanced = enhanceDecorPromptForImage(decorHint, locale);

  if (locale === "en") {
    let prompt =
      lock +
      " On top of image 1's already tidy desk, add ONE subtle accent only. " +
      "Keyboard/mouse zone must stay workable. NEVER fill desk with ornaments. " +
      getDeskStyleImagePrompt(deskStyle, locale) +
      ` Single accent only: ${enhanced}. Photorealistic office photo.`;
    return prompt;
  }

  return (
    lock +
    " 在图1已整理好的工位基础上微调。键盘区必须留白可办公。全桌新增氛围点缀合计仅1件，切忌满桌摆件。真实照片。" +
    getDeskStyleImagePrompt(deskStyle, locale) +
    ` 氛围点缀（仅1件）：${enhanced}。`
  );
}

export function buildI2iPrompt(
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId
): string {
  const lock = buildStructureLock(plan, locale);
  let prompt = lock + " " + (locale === "en" ? GLOWUP_BASELINE_EN : GLOWUP_BASELINE_ZH);

  prompt += " " + getDeskStyleImagePrompt(deskStyle, locale);

  const editHint = plan.organizePrompt?.trim() || plan.imagePrompt?.trim();
  if (editHint) {
    prompt += locale === "en" ? ` Organize: ${editHint}.` : ` 收纳：${editHint}。`;
  }

  const decorHint = plan.decorPrompt?.trim();
  if (decorHint) {
    const enhanced = enhanceDecorPromptForImage(decorHint, locale);
    prompt +=
      locale === "en"
        ? ` Single accent only: ${enhanced}.`
        : ` 氛围点缀（仅1件）：${enhanced}。`;
  }

  if (plan.clutterItems?.length) {
    const items = plan.clutterItems.slice(0, 6).join(locale === "en" ? ", " : "、");
    prompt +=
      locale === "en"
        ? ` Clear these loose items: ${items}.`
        : ` 收走这些散落物：${items}。`;
  }

  return prompt;
}

const IMAGEEDIT_PROMPT_MAX = 480;

function truncateHint(text: string, max: number): string {
  const cleaned = text.trim().replace(/。+/g, "。").replace(/^仅1件：?/, "");
  if (cleaned.length <= max) return cleaned;
  return cleaned.slice(0, max).replace(/[，,、；;：:\s]+$/, "");
}

/** wanx2.1-imageedit prompt max ~800 chars — keep well under to avoid backend errors. */
export function capImageEditPrompt(prompt: string): string {
  const trimmed = prompt.trim().replace(/\s+/g, " ");
  if (trimmed.length <= IMAGEEDIT_PROMPT_MAX) return trimmed;
  return trimmed.slice(0, IMAGEEDIT_PROMPT_MAX).replace(/[，,、；;：:\s]+$/, "。");
}
export function buildDescriptionEditOrganizePrompt(
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId
): string {
  const editHint = plan.organizePrompt?.trim() || plan.imagePrompt?.trim();
  const clutter = plan.clutterItems?.slice(0, 5);

  if (locale === "en") {
    let prompt =
      "Change the desk: put ALL loose clutter into white/cream storage boxes, trays, and pen holders; " +
      "hide cables in a cable box; remove every loose item from the surface except organizers. " +
      "The desk must look visibly much tidier than before. Do NOT add decor yet. " +
      "Do NOT change desk shape, desk color, cabinet, walls, or monitor positions. Photorealistic office photo.";
  if (editHint) prompt += ` ${truncateHint(editHint, 40)}.`;
  if (clutter?.length) prompt += ` Clear: ${truncateHint(clutter.join(", "), 40)}.`;
  return capImageEditPrompt(prompt);
  }

  let prompt =
    "整理改造桌面：把所有散落杂物收入奶油白/白色收纳盒、笔筒、理线盒，隐藏数据线，" +
    "收走桌面一切散落物，只留收纳容器，桌面明显比原图整洁很多，改造对比强烈。" +
    "不要添加装饰。不要改变桌子、文件柜、隔断墙、显示器位置。真实办公照片。";
  if (editHint) prompt += ` ${truncateHint(editHint, 40)}。`;
  if (clutter?.length) prompt += ` 收走：${truncateHint(clutter.join("、"), 40)}。`;
  return capImageEditPrompt(prompt);
}

export function buildDescriptionEditDecorPrompt(
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId
): string {
  const decorHint = plan.decorPrompt?.trim();
  if (!decorHint) return "";

  const enhanced = truncateHint(decorHint, 28);

  if (locale === "en") {
    return capImageEditPrompt(
      "Add ONE accent to the tidy desk: " +
        `${enhanced}. Keep storage and monitors unchanged. Photorealistic.`
    );
  }

  return capImageEditPrompt(
    "在已整洁工位添加1件点缀：" + `${enhanced}。保持收纳与显示器不变。真实照片。`
  );
}

/** Single-pass imageedit — compact action-first (API limit ~800 chars). */
export function buildDescriptionEditSinglePassPrompt(
  plan: RenovationPlan,
  locale: AppLocale,
  _deskStyle: DeskStyleId
): string {
  const editHint = truncateHint(
    plan.organizePrompt?.trim() || plan.imagePrompt?.trim() || "",
    40
  );
  const decorHint = truncateHint(plan.decorPrompt?.trim() || "", 28);

  if (locale === "en") {
    let prompt =
      "Transform desk: put all clutter into white organizers, hide cables, visibly tidier. ";
    if (editHint) prompt += `${editHint}. `;
    if (decorHint) prompt += `Add one accent: ${decorHint}. `;
    prompt += "Keep desk, cabinet, monitors unchanged. Photorealistic.";
    return capImageEditPrompt(prompt);
  }

  let prompt =
    "整理工位：杂物收入奶油白收纳盒和笔筒，数据线隐藏，桌面零散落物，改造对比强烈。";
  if (editHint) prompt += editHint.endsWith("。") ? editHint : `${editHint}。`;
  if (decorHint) prompt += `添加1件点缀：${decorHint}。`;
  prompt += "不改桌子、文件柜、显示器。真实照片。";
  return capImageEditPrompt(prompt);
}

export function buildDescriptionEditPrompt(
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId
): string {
  return buildDescriptionEditSinglePassPrompt(plan, locale, deskStyle);
}

export function buildSingleEditPrompt(
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId
): string {
  const model = process.env.WANX_EDIT_MODEL ?? "wan2.6-image";
  if (model.includes("i2i") || /^wan2\.(6|7)-image/.test(model)) {
    return buildI2iPrompt(plan, locale, deskStyle);
  }
  return buildDescriptionEditPrompt(plan, locale, deskStyle);
}

const NEGATIVE_BASE_ZH =
  "换桌子, 改桌形, 桌面换色, 桌子变形, 不同桌子, 新桌子, 改文件柜, 柜子换色, " +
  "家具改色, 重绘桌面, 杂乱桌面, 丑乱旧物件, 模糊, 水印, " +
  "桌面摆满, 摆件堆砌, 手办, 玩偶, 满桌装饰, 过多绿植, 装饰过多, 不可工作";

const NEGATIVE_BASE_EN =
  "different desk, changed desk shape, repainted desk, new desk, altered furniture, " +
  "changed cabinet color, messy cluttered desktop, blurry, watermark, " +
  "desk full of ornaments, figurines, knick-knacks, crowded decorations, too many plants, unusable desk";

const NEGATIVE_ORGANIZE_EXTRA_ZH =
  ", 绿植, 台灯, 桌垫, 相框, 花瓶, 摆件, 装饰, 氛围点缀, 沙漏, 香薰";

const NEGATIVE_ORGANIZE_EXTRA_EN =
  ", plant, lamp, desk mat, frame, vase, ornament, decor accent, sand timer, diffuser";

export function buildNegativePrompt(locale: AppLocale, deskStyle: DeskStyleId): string {
  const base = locale === "en" ? NEGATIVE_BASE_EN : NEGATIVE_BASE_ZH;
  return base + getDeskStyleNegativeExtra(deskStyle, locale);
}

/** Stronger negative for pass 1 — block decor from appearing early. */
export function buildOrganizePassNegativePrompt(
  locale: AppLocale,
  deskStyle: DeskStyleId
): string {
  const base = buildNegativePrompt(locale, deskStyle);
  const extra = locale === "en" ? NEGATIVE_ORGANIZE_EXTRA_EN : NEGATIVE_ORGANIZE_EXTRA_ZH;
  return base + extra;
}
