import type { AppLocale } from "@/lib/i18n/locale";

export const DESK_STYLE_IDS = ["ins", "japanese", "minimal"] as const;
export type DeskStyleId = (typeof DESK_STYLE_IDS)[number];

export const DEFAULT_DESK_STYLE: DeskStyleId = "ins";

export function isDeskStyleId(value: unknown): value is DeskStyleId {
  return typeof value === "string" && DESK_STYLE_IDS.includes(value as DeskStyleId);
}

export function resolveDeskStyle(value: unknown): DeskStyleId {
  // Legacy sessionStorage from old "cyberpunk" option
  if (value === "cyberpunk") return "minimal";
  return isDeskStyleId(value) ? value : DEFAULT_DESK_STYLE;
}

const STYLE_LABELS: Record<DeskStyleId, { zh: string; en: string }> = {
  ins: { zh: "INS风", en: "INS Style" },
  japanese: { zh: "日系治愈", en: "Japanese Cozy" },
  minimal: { zh: "极简商务", en: "Minimal Office" },
};

const ORGANIZE_STYLE_ZH: Record<DeskStyleId, string> = {
  ins:
    " INS风整理：明亮自然光感，杂物全部入奶油白/纯白收纳盒与文件架，桌面光洁无散落，数据线藏进理线盒，改造前后对比强烈。",
  japanese:
    " 日系整理：杂物入MUJI原木+米色编织篮收纳，桌面零散落物，线缆隐藏，治愈整洁。",
  minimal:
    " 极简整理：杂物入灰白黑收纳盒/文件架/理线盒，线缆整齐，桌面除收纳容器外无散落物。",
};

const ORGANIZE_STYLE_EN: Record<DeskStyleId, string> = {
  ins:
    " INS style organize: bright daylight, ALL clutter into cream/white boxes and file trays, cables hidden, visibly tidier than before.",
  japanese:
    " Japanese cozy organize: MUJI wood + beige basket storage, zero loose items, hidden cables.",
  minimal:
    " Minimal organize: gray/white/black boxes and cable box, no loose items except organizers.",
};

const IMAGE_STYLE_ZH: Record<DeskStyleId, string> = {
  ins:
    "【INS博主风·收纳为主】明亮自然光；收纳用纯白/奶油白托盘或笔筒；" +
    "新增1件氛围点缀（小绿植、台灯、浅灰白双色大号桌垫覆盖键鼠区、小相框、单支花瓶、金属几何摆件、沙漏、香薰机等择一）；切忌满桌摆件；禁止暖黄暗光、禁止大摆件堆砌。",
  japanese:
    "【日系治愈·收纳为主】收纳用MUJI原木+米色编织篮；" +
    "角位/侧位新增1件氛围点缀（暖黄台灯、小绿植、单支花瓶、陶瓷杯、原木托盘单品、沙漏、香薰机等择一）；切忌满桌摆件；禁止干花堆砌、禁止占键盘区。",
  minimal:
    "【极简商务·收纳为主】真实公司工位；灰白黑收纳盒/文件架/理线盒/笔筒，线缆整齐；" +
    "可无点缀或角位仅1件实用氛围物（条形补光灯、薄桌垫、小座钟、金属书立等择一）；切忌满桌摆件；禁止RGB/霓虹。",
};

const IMAGE_STYLE_EN: Record<DeskStyleId, string> = {
  ins:
    "INS style, storage-first: bright daylight, white/cream organizers; " +
    "ONE accent only (plant, lamp, large two-tone desk mat under keyboard+mouse, mini frame, single-stem vase, geometric object, sand timer, diffuser — pick one); NEVER crowded ornaments.",
  japanese:
    "Japanese cozy, storage-first: MUJI wood + beige basket organizers; " +
    "ONE corner/side accent only (warm lamp, small plant, single-stem vase, ceramic mug, wood tray with one item, sand timer, diffuser — pick one); NEVER ornament clutter.",
  minimal:
    "Minimal office, storage-first: gray/white file trays, cable box, pen cup; " +
    "zero or ONE practical accent in a corner (slim lamp, thin mat, desk clock, metal bookend — pick one); NEVER crowded decor, NO RGB/neon.",
};

const NEGATIVE_EXTRA_EN: Record<DeskStyleId, string> = {
  ins: ", warm amber lighting, dim cozy room, MUJI beige, linen texture overload, large plants, ornament shelf, multiple figurines",
  japanese: ", bright flash photography, marble tray, brass metal accent, high contrast blogger look, dried flowers row, many ceramics, multiple ornaments",
  minimal: ", RGB light strips, neon glow, gaming desk, cyberpunk, colorful LED, decorative figurines, plant collection, ornament row",
};

const NEGATIVE_EXTRA_ZH: Record<DeskStyleId, string> = {
  ins: ", 暖黄暗光, 亚麻米色, 大叶绿植, 满桌摆件, 多件装饰堆砌",
  japanese: ", 明亮冷白, 大理石托盘, 干花排满, 陶杯摆件排满, 多肉堆砌, 满桌装饰",
  minimal: ", RGB灯带, 霓虹灯, 手办, 玩偶, 绿植堆砌, 满桌摆件",
};

export function getDeskStyleLabel(id: DeskStyleId, locale: AppLocale): string {
  return locale === "en" ? STYLE_LABELS[id].en : STYLE_LABELS[id].zh;
}

export function getDeskStyleImagePrompt(id: DeskStyleId, locale: AppLocale): string {
  return locale === "en" ? IMAGE_STYLE_EN[id] : IMAGE_STYLE_ZH[id];
}

export function getDeskStyleOrganizePrompt(id: DeskStyleId, locale: AppLocale): string {
  return locale === "en" ? ORGANIZE_STYLE_EN[id] : ORGANIZE_STYLE_ZH[id];
}

export function getDeskStyleNegativeExtra(id: DeskStyleId, locale: AppLocale): string {
  return locale === "en" ? NEGATIVE_EXTRA_EN[id] : NEGATIVE_EXTRA_ZH[id];
}

export function getDeskStyleQwenHint(id: DeskStyleId, locale: AppLocale): string {
  if (locale === "en") {
    const hints: Record<DeskStyleId, string> = {
      ins:
        "User selected INS style: bright daylight, white organizers — pick ONE varied corner accent from catalog (not always a plant); storage-first, NEVER fill desk with ornaments.",
      japanese:
        "User selected Japanese cozy: MUJI organizers — pick ONE varied corner accent from catalog (lamp, plant, vase, etc.); NEVER ornament clutter.",
      minimal:
        "User selected Minimal Office: gray/white organizers, cable management — zero or ONE practical corner accent; NEVER crowded decor, NO RGB.",
    };
    return hints[id];
  }
  const hints: Record<DeskStyleId, string> = {
    ins:
      "用户选择 INS 风：明亮自然光、白色收纳为主；从候选中选1件角位氛围点缀（勿总选绿植），切忌满桌摆件。",
    japanese:
      "用户选择日系治愈：MUJI收纳为主；从候选中选1件角位氛围点缀（台灯/绿植/花瓶/沙漏等），切忌满桌摆件。",
    minimal:
      "用户选择极简商务：灰白收纳、理线整洁；可无点缀或仅1件实用角位小物，切忌满桌摆件、禁止RGB。",
  };
  return hints[id];
}
