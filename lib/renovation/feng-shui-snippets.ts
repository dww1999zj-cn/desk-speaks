import type { AppLocale } from "@/lib/i18n/locale";
import type { FengShuiNote } from "./types";

/** Curated ids — Qwen may only pick from this list; UI renders fixed citations. */
export const FENG_SHUI_SNIPPET_IDS = [
  "mingtang",
  "back_support",
  "left_azure",
  "tidy_qi",
  "no_sharp",
  "calm_water",
  "plant_spot",
  "cable_clear",
  "light_bright",
  "screen_balance",
  "file_order",
  "chair_path",
  "drawer_shut",
  "book_align",
  "trash_hide",
  "one_pen_cup",
  "mat_center",
  "window_side",
  "noise_calm",
  "walk_clear",
] as const;

export type FengShuiSnippetId = (typeof FENG_SHUI_SNIPPET_IDS)[number];

interface FengShuiSnippet {
  id: FengShuiSnippetId;
  topic: { zh: string; en: string };
  source: { zh: string; en: string };
  quote: { zh: string; en: string };
  briefTemplates: { zh: string[]; en: string[] };
  keywords: string[];
}

const SNIPPETS: FengShuiSnippet[] = [
  {
    id: "mingtang",
    topic: { zh: "明堂宜开阔", en: "Clear front space" },
    source: { zh: "《阳宅三要》", en: "Yang Zhai San Yao" },
    quote: { zh: "宅前宜开阔明亮，不宜逼仄堆积。", en: "The space before one's seat should be open and uncluttered." },
    briefTemplates: {
      zh: ["整理后正前区留白，视线更开阔。", "键盘前方空出来，明堂自然就亮。"],
      en: ["Clear space in front keeps the view open.", "A open zone before the keyboard reads calmer."],
    },
    keywords: ["前", "正", "开阔", "front", "clear"],
  },
  {
    id: "back_support",
    topic: { zh: "坐有靠", en: "Support behind" },
    source: { zh: "《葬书》意 · 堪舆", en: "Classical placement" },
    quote: { zh: "坐宜有靠，后方稳实则心定。", en: "A seat with solid support behind brings steadiness." },
    briefTemplates: {
      zh: ["椅后有墙或柜，心理上更稳。", "背靠实墙/柜体，坐位更定。"],
      en: ["Wall or cabinet behind the chair feels steadier.", "Solid support behind the seat helps focus."],
    },
    keywords: ["靠", "背", "墙", "椅", "back", "wall"],
  },
  {
    id: "left_azure",
    topic: { zh: "左青龙略高", en: "Left slightly raised" },
    source: { zh: "青龙白虎之说", en: "Azure Dragon / White Tiger" },
    quote: { zh: "左青龙宜稍高，右白虎宜稍低，气机较顺。", en: "The left may sit slightly higher; the right slightly lower." },
    briefTemplates: {
      zh: ["左侧收纳稍高一层，右侧保持低平。", "左高右低，动线看起来更顺。"],
      en: ["Slightly taller storage on the left balances the desk.", "Left a touch higher, right lower — flow feels natural."],
    },
    keywords: ["左", "右", "高", "left", "right"],
  },
  {
    id: "tidy_qi",
    topic: { zh: "有序则气聚", en: "Order gathers focus" },
    source: { zh: "《易经》· 系辞", en: "I Ching" },
    quote: { zh: "物各有序，则不乱不散。", en: "When things each have their place, chaos does not spread." },
    briefTemplates: {
      zh: ["同类物进同一收纳，气就不散了。", "一物一位，桌面自然聚神。"],
      en: ["Same items together — focus stays put.", "Everything in its place keeps the desk calm."],
    },
    keywords: ["杂", "乱", "散", "堆", "mess", "clutter"],
  },
  {
    id: "no_sharp",
    topic: { zh: "忌尖角冲射", en: "Avoid sharp angles" },
    source: { zh: "《阳宅十书》意", en: "Classical form lore" },
    quote: { zh: "尖角直冲坐位，易生不安；宜转侧或收纳。", en: "Sharp corners at the seat feel unsettling; turn or store them." },
    briefTemplates: {
      zh: ["尖角物件转个向，别直冲键盘位。", "把尖角收纳转侧，坐位更安心。"],
      en: ["Turn sharp items away from the keyboard zone.", "Angle corners aside so they don't point at you."],
    },
    keywords: ["尖", "角", "sharp", "corner"],
  },
  {
    id: "calm_water",
    topic: { zh: "杯具宜侧放", en: "Cups to the side" },
    source: { zh: "《饮食须知》意 · 办公引申", en: "Desk placement lore" },
    quote: { zh: "水杯茶壶不宜堆于正前主位，宜移侧方。", en: "Cups should not pile up in the main work zone." },
    briefTemplates: {
      zh: ["杯子移到侧后方，正位留给工作。", "杯具不占主位，动线更清爽。"],
      en: ["Mug moved aside — main zone stays for work.", "Keep cups off the primary desk lane."],
    },
    keywords: ["杯", "壶", "水", "mug", "cup"],
  },
  {
    id: "plant_spot",
    topic: { zh: "绿植宜角位", en: "Plants in corners" },
    source: { zh: "《阳宅集成》", en: "Yang Zhai tradition" },
    quote: { zh: "生机之物宜放角位点缀，不宜占主位。", en: "Greenery fits corners as accent, not the main area." },
    briefTemplates: {
      zh: ["小绿植放角位，不占键盘区。", "角上一盆即可，主位留给屏幕。"],
      en: ["A small plant in the corner — not on the work lane.", "Corner greenery adds life without blocking work."],
    },
    keywords: ["绿", "植", "plant"],
  },
  {
    id: "cable_clear",
    topic: { zh: "线清则气顺", en: "Tidy cables" },
    source: { zh: "现代工位 · 视觉秩序", en: "Modern desk reading" },
    quote: { zh: "缠线外露则气杂，理线即理顺。", en: "Visible tangles scatter focus; bundling restores clarity." },
    briefTemplates: {
      zh: ["线缆入盒贴边，桌面立刻清爽。", "理线后视觉噪音少一半。"],
      en: ["Cables boxed along the edge — instant calm.", "Bundled wires reduce visual noise."],
    },
    keywords: ["线", "缆", "cable", "wire"],
  },
  {
    id: "light_bright",
    topic: { zh: "采光宜足", en: "Enough light" },
    source: { zh: "《黄帝宅经》意", en: "Classical dwelling text" },
    quote: { zh: "居宜明，不明则气浊。", en: "Spaces should be bright; dimness dulls the mood." },
    briefTemplates: {
      zh: ["补光放侧后，屏幕区不眩也不暗。", "亮而不乱，台灯角位补足即可。"],
      en: ["Side lamp fills light without glare on screen.", "Bright but tidy — one lamp in the corner helps."],
    },
    keywords: ["灯", "光", "lamp", "light"],
  },
  {
    id: "screen_balance",
    topic: { zh: "屏位宜正", en: "Screen centered" },
    source: { zh: "办公 ergonomics · 传统居中观", en: "Desk centering lore" },
    quote: { zh: "主位宜正，偏侧则神散。", en: "The main view should face you squarely." },
    briefTemplates: {
      zh: ["显示器居中，杂物不挤占主视区。", "主屏正对自己，两侧只留收纳。"],
      en: ["Monitor centered — clutter stays off the main view.", "Keep the primary screen square to your seat."],
    },
    keywords: ["屏", "显示器", "monitor", "screen"],
  },
  {
    id: "file_order",
    topic: { zh: "文书宜归类", en: "Papers filed" },
    source: { zh: "《朱子家训》意", en: "Zhuzi family precepts" },
    quote: { zh: "文书各归其处，则心不乱。", en: "Papers each in their place keep the mind clear." },
    briefTemplates: {
      zh: ["文件竖放入架，桌面不堆叠。", "纸张进文件架，找得也快。"],
      en: ["Papers vertical in a holder — no stacks.", "File tray keeps loose sheets off the surface."],
    },
    keywords: ["文件", "纸", "paper", "file"],
  },
  {
    id: "chair_path",
    topic: { zh: "椅后宜通", en: "Clear path behind" },
    source: { zh: "《阳宅三要》· 通道", en: "Yang Zhai San Yao" },
    quote: { zh: "座后宜空通，阻塞则气滞。", en: "Space behind the seat should stay open." },
    briefTemplates: {
      zh: ["椅后留通行/取物空间，不堆杂物。", "后方通道畅通，坐起来不憋。"],
      en: ["Keep space behind the chair — don't store there.", "Clear path behind the seat feels less cramped."],
    },
    keywords: ["椅", "后", "通道", "chair", "behind"],
  },
  {
    id: "drawer_shut",
    topic: { zh: "抽屉宜闭", en: "Drawers closed" },
    source: { zh: "《菜根谭》· 整齐", en: "Caigen Tan" },
    quote: { zh: "藏而不露，则气内收。", en: "What is stored away stays contained." },
    briefTemplates: {
      zh: ["零碎入抽屉/盒，不外露则不乱。", "能收则收，眼不见则心不烦。"],
      en: ["Small bits in drawers — out of sight, out of mind.", "Closed storage keeps the surface calm."],
    },
    keywords: ["抽屉", "收纳", "drawer", "box"],
  },
  {
    id: "book_align",
    topic: { zh: "书籍宜齐", en: "Books aligned" },
    source: { zh: "《曾国藩家书》意", en: "Zeng Guofan letters" },
    quote: { zh: "书齐则思齐，散乱则心散。", en: "Aligned books align the mind." },
    briefTemplates: {
      zh: ["书籍立靠书立，别散在桌面。", "几本常用书齐排，其余收架。"],
      en: ["Books stand with a bookend — not scattered.", "Keep daily reads aligned on one side."],
    },
    keywords: ["书", "book"],
  },
  {
    id: "trash_hide",
    topic: { zh: "废纸宜藏", en: "Hide waste paper" },
    source: { zh: "办公整洁 · 旧说", en: "Office tidiness lore" },
    quote: { zh: "弃物外露则气杂，宜近藏而不占主位。", en: "Visible waste scatters focus; keep it tucked away." },
    briefTemplates: {
      zh: ["纸巾废纸进小桶，别堆键盘边。", "废纸即时入篓，主位保持干净。"],
      en: ["Tissues and scrap paper in a bin — not by keyboard.", "Waste tucked away keeps the main zone clean."],
    },
    keywords: ["纸", "纸巾", "tissue", "trash"],
  },
  {
    id: "one_pen_cup",
    topic: { zh: "笔筒宜一", en: "One pen cup" },
    source: { zh: "文房整理 · 传统", en: "Scholar's desk lore" },
    quote: { zh: "器多则杂，一器常用则专。", en: "Many holders clutter; one well-used cup suffices." },
    briefTemplates: {
      zh: ["笔筒只留一个，多出来的收进抽屉。", "常用笔入同一笔筒，桌面更整。"],
      en: ["One pen cup on desk — extras in a drawer.", "Single holder for daily pens keeps it simple."],
    },
    keywords: ["笔", "pen"],
  },
  {
    id: "mat_center",
    topic: { zh: "垫物宜辅", en: "Mat supports work" },
    source: { zh: "现代工位 · 辅位之说", en: "Modern desk lore" },
    quote: { zh: "辅物在手下，主位仍在屏键之间。", en: "Accessories support the hands; focus stays screen and keys." },
    briefTemplates: {
      zh: ["桌垫在键盘下辅位，不抢主工作区。", "薄垫在手下，屏幕前方仍留白。"],
      en: ["Thin mat under keyboard — work zone stays primary.", "Mat supports typing without taking the main lane."],
    },
    keywords: ["垫", "mat"],
  },
  {
    id: "window_side",
    topic: { zh: "窗光宜侧", en: "Side window light" },
    source: { zh: "《阳宅撮要》意", en: "Yang Zhai digest" },
    quote: { zh: "光从侧来，不直射则明而不烈。", en: "Side light is bright without harsh glare." },
    briefTemplates: {
      zh: ["避免屏幕正对强光，侧向布置更舒服。", "窗光在侧，显示器前不加反光物。"],
      en: ["Avoid harsh glare on screen — side light is gentler.", "Keep shiny clutter off the screen path."],
    },
    keywords: ["窗", "光", "window", "glare"],
  },
  {
    id: "noise_calm",
    topic: { zh: "声静则神清", en: "Quiet helps focus" },
    source: { zh: "《老子》· 静胜躁", en: "Dao De Jing" },
    quote: { zh: "静为躁君，桌面宜简以助静。", en: "Stillness masters restlessness; a simple desk helps." },
    briefTemplates: {
      zh: ["少摆件少噪音源，桌面越简越静。", "视觉安静了，心也容易静下来。"],
      en: ["Fewer objects — less visual noise.", "A simpler desk supports a quieter mind."],
    },
    keywords: ["静", "简", "quiet", "minimal"],
  },
  {
    id: "walk_clear",
    topic: { zh: "动线宜畅", en: "Clear walkways" },
    source: { zh: "《周礼》· 室庐有序", en: "Classical order" },
    quote: { zh: "行所无碍，则往来顺畅。", en: "Unblocked paths keep movement smooth." },
    briefTemplates: {
      zh: ["桌缘不堆物，起身拿东西更顺。", "留出走位空间，工位不憋脚。"],
      en: ["Clear desk edges — easier to stand and reach.", "Keep walkways open around the chair."],
    },
    keywords: ["动线", "走", "path", "walk"],
  },
];

const SNIPPET_MAP = new Map(SNIPPETS.map((s) => [s.id, s]));

export function isFengShuiSnippetId(value: unknown): value is FengShuiSnippetId {
  return (
    typeof value === "string" &&
    FENG_SHUI_SNIPPET_IDS.includes(value as FengShuiSnippetId)
  );
}

function scoreSnippet(snippet: FengShuiSnippet, text: string): number {
  let score = 0;
  for (const kw of snippet.keywords) {
    if (text.includes(kw)) score += 2;
  }
  return score;
}

/** Rank snippets by relevance to plan text; returns top matches. */
export function rankFengShuiCandidates(plan: {
  clutterItems?: string[];
  organizePlan?: string;
  decorPlan?: string;
  bareDesk?: string;
}): FengShuiSnippetId[] {
  const text = [
    ...(plan.clutterItems ?? []),
    plan.organizePlan ?? "",
    plan.decorPlan ?? "",
    plan.bareDesk ?? "",
  ].join(" ");

  const ranked = SNIPPETS.map((s) => ({ id: s.id, score: scoreSnippet(s, text) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.id);

  if (ranked.length >= 3) return ranked.slice(0, 5);
  if (ranked.length > 0) {
    const rest = FENG_SHUI_SNIPPET_IDS.filter((id) => !ranked.includes(id));
    return [...ranked, ...shuffle(rest).slice(0, 4 - ranked.length)];
  }
  return shuffle([...FENG_SHUI_SNIPPET_IDS]);
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Pick snippet id — mix model choice + relevance + randomness so results vary.
 */
export function pickFengShuiRefId(
  plan: {
    clutterItems?: string[];
    organizePlan?: string;
    decorPlan?: string;
    bareDesk?: string;
  },
  modelRefId?: unknown
): FengShuiSnippetId {
  const candidates = rankFengShuiCandidates(plan);

  if (isFengShuiSnippetId(modelRefId) && Math.random() < 0.35) {
    return modelRefId;
  }

  const topPool = candidates.slice(0, Math.min(4, candidates.length));
  return pickRandom(topPool);
}

/** @deprecated use pickFengShuiRefId */
export function inferFengShuiRefId(plan: {
  clutterItems?: string[];
  organizePlan?: string;
  decorPlan?: string;
}): FengShuiSnippetId {
  return pickFengShuiRefId(plan);
}

export function getFengShuiBriefFallback(
  refId: FengShuiSnippetId,
  locale: AppLocale
): string {
  const snippet = SNIPPET_MAP.get(refId);
  if (!snippet) return "";
  const templates = locale === "en" ? snippet.briefTemplates.en : snippet.briefTemplates.zh;
  return pickRandom(templates);
}

export function getFengShuiPromptBlock(locale: AppLocale): string {
  const lines = SNIPPETS.map((s) => {
    const label = locale === "en" ? s.topic.en : s.topic.zh;
    return `- ${s.id}: ${label}`;
  }).join("\n");

  if (locale === "en") {
    return (
      `\n**Required · placement note (pick exactly ONE id, vary across desks):**\n` +
      `Output fengShuiRefId + fengShuiBrief — tie to this photo; do NOT always pick mingtang or tidy_qi. ` +
      `Do NOT promise luck.\n${lines}`
    );
  }
  return (
    `\n**必选 · 工位风水（选 1 个 id，不同工位要有变化，勿总选 mingtang/tidy_qi）：**\n` +
    `输出 fengShuiRefId + fengShuiBrief（结合本图与方案，一句话，勿夸大改运）。\n${lines}`
  );
}

export function resolveFengShuiNote(
  refId: unknown,
  brief: unknown,
  locale: AppLocale
): FengShuiNote | null {
  if (!isFengShuiSnippetId(refId)) return null;
  const snippet = SNIPPET_MAP.get(refId);
  if (!snippet) return null;

  const modelBrief =
    typeof brief === "string" ? brief.trim().slice(0, 100) : "";
  const briefText =
    modelBrief.length >= 8
      ? modelBrief
      : getFengShuiBriefFallback(refId, locale);

  return {
    topic: locale === "en" ? snippet.topic.en : snippet.topic.zh,
    source: locale === "en" ? snippet.source.en : snippet.source.zh,
    quote: locale === "en" ? snippet.quote.en : snippet.quote.zh,
    brief: briefText,
  };
}
