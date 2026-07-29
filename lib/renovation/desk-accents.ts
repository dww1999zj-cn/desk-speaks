import type { AppLocale } from "@/lib/i18n/locale";
import type { DeskStyleId } from "./desk-styles";

/** One accent per renovation — curated office-appropriate items by style. */
export const DESK_ACCENT_IDS = [
  "corner_plant",
  "desk_lamp",
  "thin_mat",
  "dual_tone_mat",
  "mini_frame",
  "single_stem_vase",
  "brass_geometric",
  "warm_lamp",
  "ceramic_cup_corner",
  "wood_tray_single",
  "small_diffuser",
  "desk_clock",
  "metal_bookend",
  "slim_lamp",
  "sand_timer",
] as const;

export type DeskAccentId = (typeof DESK_ACCENT_IDS)[number];

interface DeskAccent {
  id: DeskAccentId;
  label: { zh: string; en: string };
  /** Example decorPrompt fragment */
  example: { zh: string; en: string };
  styles: DeskStyleId[];
}

const ACCENTS: DeskAccent[] = [
  {
    id: "corner_plant",
    label: { zh: "角落小绿植", en: "Small corner plant" },
    example: { zh: "左后角一盆小绿植", en: "Small plant back-left corner" },
    styles: ["ins", "japanese"],
  },
  {
    id: "desk_lamp",
    label: { zh: "简约台灯", en: "Minimal desk lamp" },
    example: { zh: "右后角一盏白台灯", en: "White desk lamp back-right" },
    styles: ["ins"],
  },
  {
    id: "warm_lamp",
    label: { zh: "暖黄台灯", en: "Warm desk lamp" },
    example: { zh: "右后角暖黄台灯", en: "Warm lamp back-right corner" },
    styles: ["japanese"],
  },
  {
    id: "slim_lamp",
    label: { zh: "条形补光灯", en: "Slim task lamp" },
    example: { zh: "侧后方条形补光灯", en: "Slim task lamp behind side" },
    styles: ["minimal"],
  },
  {
    id: "thin_mat",
    label: { zh: "大号桌垫", en: "Large desk mat" },
    example: {
      zh: "键盘鼠标下浅米色大号桌垫",
      en: "Large cream mat under keyboard and mouse",
    },
    styles: ["ins", "minimal"],
  },
  {
    id: "dual_tone_mat",
    label: { zh: "双色大号桌垫", en: "Two-tone desk mat" },
    example: {
      zh: "键盘鼠标下浅灰白双色大号桌垫",
      en: "Large cream-gray two-tone mat under keyboard and mouse",
    },
    styles: ["ins", "minimal"],
  },
  {
    id: "mini_frame",
    label: { zh: "小相框", en: "Mini photo frame" },
    example: { zh: "左后角一个小相框", en: "One mini frame back-left" },
    styles: ["ins"],
  },
  {
    id: "single_stem_vase",
    label: { zh: "单支花瓶", en: "Single-stem vase" },
    example: { zh: "角落透明花瓶插一支", en: "Single stem in corner vase" },
    styles: ["ins", "japanese"],
  },
  {
    id: "brass_geometric",
    label: { zh: "金属几何摆件", en: "Brass geometric object" },
    example: { zh: "右后角金属几何小摆件", en: "Small brass geometric accent back-right" },
    styles: ["ins"],
  },
  {
    id: "ceramic_cup_corner",
    label: { zh: "角落马克杯", en: "Ceramic mug in corner" },
    example: { zh: "右后角一只陶瓷杯", en: "One ceramic mug back-right" },
    styles: ["japanese"],
  },
  {
    id: "wood_tray_single",
    label: { zh: "原木托盘单品", en: "Wood tray with one item" },
    example: { zh: "左后角原木托盘放一支笔", en: "Wood tray with one pen back-left" },
    styles: ["japanese"],
  },
  {
    id: "small_diffuser",
    label: { zh: "小型香薰机", en: "Small diffuser" },
    example: { zh: "右后角小型香薰机", en: "Small diffuser back-right" },
    styles: ["japanese", "ins"],
  },
  {
    id: "desk_clock",
    label: { zh: "小座钟", en: "Small desk clock" },
    example: { zh: "左后角小座钟", en: "Small desk clock back-left" },
    styles: ["minimal"],
  },
  {
    id: "metal_bookend",
    label: { zh: "金属书立", en: "Metal bookend" },
    example: { zh: "侧后一本杂志靠金属书立", en: "One magazine with metal bookend" },
    styles: ["minimal"],
  },
  {
    id: "sand_timer",
    label: { zh: "沙漏摆件", en: "Sand timer" },
    example: { zh: "右后角一个小沙漏", en: "Small sand timer back-right" },
    styles: ["ins", "japanese"],
  },
];

const ACCENTS_BY_STYLE = new Map<DeskStyleId, DeskAccent[]>(
  (["ins", "japanese", "minimal"] as DeskStyleId[]).map((style) => [
    style,
    ACCENTS.filter((a) => a.styles.includes(style)),
  ])
);

const MAT_PATTERN = /桌垫|mat|keyboard\s*mat|mouse\s*pad|dual.?tone|双色/i;

export function isDeskMatDecor(decorPrompt: string): boolean {
  return MAT_PATTERN.test(decorPrompt);
}

/** Expand short decorPrompt into image-edit hints (v10c-style mat coverage). */
export function enhanceDecorPromptForImage(
  decorPrompt: string,
  locale: AppLocale
): string {
  if (!isDeskMatDecor(decorPrompt)) return decorPrompt;

  if (locale === "en") {
    if (/dual.?tone|two.?tone|cream.?gray/i.test(decorPrompt)) {
      return (
        `${decorPrompt}. Add a large minimal cream-gray two-tone desk mat with thin border under keyboard and mouse, ` +
        "covering both, keyboard and mouse on the mat. Keep existing tidy storage layout."
      );
    }
    return (
      `${decorPrompt}. Add a large minimal desk mat under keyboard and mouse covering both, ` +
      "keyboard and mouse on the mat. Keep existing tidy storage layout."
    );
  }

  if (/双色|浅灰白|灰白/.test(decorPrompt)) {
    return (
      `${decorPrompt}。键盘鼠标下方增加浅灰白双色极简大号桌垫（细边线、覆盖键鼠区），` +
      "键鼠置于垫上，保留已有整洁收纳布局。"
    );
  }
  return (
    `${decorPrompt}。键盘鼠标下方增加大号简约桌垫（覆盖键鼠区），` +
    "键鼠置于垫上，保留已有整洁收纳布局。"
  );
}

export function getDecorAccentPromptBlock(
  styleId: DeskStyleId,
  locale: AppLocale
): string {
  const items = ACCENTS_BY_STYLE.get(styleId) ?? [];
  const lines = items
    .map((a) => {
      const label = locale === "en" ? a.label.en : a.label.zh;
      const ex = locale === "en" ? a.example.en : a.example.zh;
      return `- ${a.id}: ${label}（例：${ex}）`;
    })
    .join("\n");

  if (locale === "en") {
    return (
      `\n**Step 3 · accent catalog (pick exactly ONE for this desk):**\n` +
      `Choose ONE id below that fits the photo and ${styleId} style — vary across desks, do NOT always pick a plant. ` +
      `Large desk mats (thin_mat / dual_tone_mat) count as the ONE accent and may cover keyboard+mouse area. ` +
      `Output decorPlan + decorPrompt describing ONLY that one item and its placement. ` +
      `NEVER add 2+ accents in the same renovation; NEVER fill the desk with ornaments.\n${lines}`
    );
  }
  return (
    `\n**第3步 · 氛围点缀候选（本次仅选 1 个 id）：**\n` +
    `从下列 id 中选最贴合本图与风格的一项（不同工位应有变化，勿每次都选绿植）；` +
    `大号桌垫（thin_mat / dual_tone_mat）可作为唯一点缀，覆盖键盘鼠标区域。` +
    `输出 decorPlan + decorPrompt，只描述这一件及其摆放位置。` +
    `同次改造切忌满桌摆件、切忌多件堆砌。\n${lines}`
  );
}

export const DECOR_SINGLE_ITEM_RULE_ZH =
  "全桌新增氛围点缀仅1件，切忌满桌摆件";

export const DECOR_SINGLE_ITEM_RULE_EN =
  "Exactly ONE new accent on the whole desk — never crowded ornaments";
