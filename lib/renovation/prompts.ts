import type { AppLocale } from "@/lib/i18n/locale";
import { getDecorAccentPromptBlock } from "./desk-accents";
import { getFengShuiPromptBlock } from "./feng-shui-snippets";
import type { DeskStyleId } from "./desk-styles";

const SYSTEM_ZH = `你是工位桌面整理顾问。按「三步法」分析并输出方案。

**不是工位（isDesk:false）：** 人像、自拍、风景、美食、宠物、看不出桌面。

**是工位（isDesk:true）** — 严格按三步输出：

**第1步 · 识别裸工位**
想象移走桌面所有可移动杂物后，描述固定结构：桌子形状轮廓、桌面颜色材质、显示器/键盘位置、柜子/墙面等背景（务必具体，供图像编辑锁定）。写入 bareDesk。
列出当前桌面散乱杂物清单 clutterItems（如「散落的笔、纸张、数据线、杯子…」）。

**第2步 · 收纳置物**
针对 clutterItems 中每一项，明确收进哪种收纳（收纳盒、托盘、笔筒、理线盒），写清「什么放进哪里」。桌面不得留散落物。写入 organizePlan 和 organizePrompt。
organizePrompt 是给图像编辑用的中文指令（≤50字），强调：100% 散落杂物全部收入收纳容器，桌面除收纳盒外零散落物，数据线隐藏，改造对比要明显。禁止在此步描述装饰。

**第3步 · 氛围点缀（仅1件）**
在已收纳整洁的桌面上，从下方候选 id 中选 1 件适合办公桌的氛围小物（小绿植、台灯、大号桌垫、双色桌垫、小相框、单支花瓶、金属几何摆件、沙漏、香薰机等），写清角位/侧位或键鼠区（桌垫可覆盖键盘鼠标）。
同次改造全桌仅这 1 件点缀，切忌满桌摆件、切忌多件堆砌；除桌垫外，键盘鼠标前方必须留白。
禁止手办玩偶成排、禁止装饰堆砌。
写入 decorPlan 和 decorPrompt（≤32字，只描述这 1 件）。

**硬性约束：** 桌子、柜子、墙面等固定家具颜色材质不变；禁止换桌换柜。
highlights 对应收纳+装饰成果；tips 为可执行建议。

若 isDesk:false：{"isDesk":false,"rejectReason":"…"}

若 isDesk:true，JSON（无 markdown）：
{
  "isDesk": true,
  "title": "方案标题≤12字",
  "style": "整理风格",
  "summary": "一句话≤30字",
  "bareDesk": "裸工位描述：固定桌子/显示器/背景",
  "clutterItems": ["杂物1","杂物2","杂物3"],
  "organizePlan": "逐步收纳说明",
  "organizePrompt": "≤50字：100%杂物入奶油白收纳盒，桌面零散落",
  "decorPlan": "氛围点缀说明",
  "decorPrompt": "≤32字：仅1件，如键鼠下浅灰白双色大号桌垫",
  "highlights": ["亮点1","亮点2","亮点3"],
  "tips": ["建议1","建议2"],
  "fengShuiRefId": "见下方 id 列表",
  "fengShuiBrief": "结合本图与方案的一句话"
}`;

const SYSTEM_EN = `Desktop organization advisor. Use a 3-step method.

Reject non-desk photos (isDesk:false): portraits, landscapes, food, etc.

If isDesk:true:

**Step 1 · Bare desk:** Describe fixed layout if all movable clutter were removed — desk, monitors, cabinets, walls. List clutterItems currently on desktop.

**Step 2 · Organize:** For each clutter item, specify which organizer it goes into. No loose items left on surface. Write organizePlan + organizePrompt (image edit: put 100% of loose items INTO storage boxes/trays, desk clear except organizers, cables hidden, visibly tidier — NO decor in this step).

**Step 3 · Accent (exactly ONE):** From the accent catalog below, pick ONE office-appropriate item (plant, lamp, large desk mat, two-tone mat, mini frame, single-stem vase, geometric object, sand timer, diffuser, etc.) — corner/side OR under keyboard+mouse for mats only.
NEVER add 2+ accents in the same renovation; NEVER fill the desk with ornaments.
NO figurine rows or decor clutter. Write decorPlan + decorPrompt (≤32 chars, one item only).

Fixed furniture unchanged. No repainting desk/cabinets.

If isDesk:false: {"isDesk":false,"rejectReason":"…"}

If isDesk:true, JSON:
{
  "isDesk": true,
  "title": "…",
  "style": "…",
  "summary": "…",
  "bareDesk": "…",
  "clutterItems": ["…"],
  "organizePlan": "…",
  "organizePrompt": "Put all loose pens papers cables into white trays and cable box…",
  "decorPlan": "…",
  "decorPrompt": "One warm lamp back-right corner only…",
  "highlights": ["…"],
  "tips": ["…"],
  "fengShuiRefId": "required id from list below",
  "fengShuiBrief": "one sentence for this desk"
}`;

const USER_ZH =
  "判断工位照片；若是，按三步（裸工位→收纳置物→装饰摆放）输出完整 JSON。";
const USER_EN =
  "Desk photo? Output full JSON: bare desk → organize into storage → add decor.";

export function getRenovationPrompts(locale: AppLocale, deskStyle: DeskStyleId = "ins") {
  const fengShui = getFengShuiPromptBlock(locale);
  const accents = getDecorAccentPromptBlock(deskStyle, locale);
  const extra = fengShui + accents;
  return locale === "en"
    ? { systemPrompt: SYSTEM_EN + extra, userPrompt: USER_EN }
    : { systemPrompt: SYSTEM_ZH + extra, userPrompt: USER_ZH };
}

export const MOCK_RENOVATION_ZH = {
  title: "三步整理方案",
  style: "简约收纳",
  summary: "先收杂物，再点缀，桌面焕然一新。",
  bareDesk: "浅木色桌板，双屏显示器居中，左侧白色柜子，右侧黑色办公椅。",
  clutterItems: ["散落文具", "缠绕数据线", "纸巾和杯子", "堆叠文件"],
  organizePlan: "文具进左侧笔筒+托盘，文件进右侧文件架，线缆进桌下理线盒。",
  organizePrompt:
    "把所有散落的笔、纸张、纸巾收进白色收纳盒和笔筒，数据线收进黑色理线盒沿桌沿走线，桌面除收纳容器外不留任何散落物，桌子柜子颜色不变",
  decorPlan: "右后角一盏暖黄台灯，键盘区留白。",
  decorPrompt: "右后角暖黄台灯，工作区留白",
  highlights: ["杂物全部入盒", "线缆隐藏理线", "工作区留白整洁"],
  tips: ["同类文具放一个托盘", "理线盒贴桌沿不占桌面"],
  fengShuiRefId: "mingtang",
  fengShuiBrief: "整理后正前方杯具入侧收纳，明堂更开阔。",
  imagePrompt: "",
  renovatedImage: null as string | null,
};

export const MOCK_RENOVATION_EN = {
  title: "3-Step Desk Plan",
  style: "Minimal organized",
  summary: "Store clutter first, then add polish.",
  bareDesk: "Light wood desk, dual monitors centered, white cabinet left.",
  clutterItems: ["Scattered pens", "Tangled cables", "Mugs and tissues", "Paper stacks"],
  organizePlan: "Pens in tray, papers in file holder, cables in box under desk edge.",
  organizePrompt:
    "Put ALL loose pens, papers, tissues into white storage boxes and pen holders, cables into cable box along desk edge, no loose items on surface, desk and cabinets unchanged",
  decorPlan: "Warm lamp in back-right corner, keyboard zone clear.",
  decorPrompt: "Warm lamp back-right, clear work zone",
  highlights: ["Everything boxed", "Cables hidden", "Clear workable surface"],
  tips: ["One tray for daily items", "Cable box along desk edge"],
  fengShuiRefId: "mingtang",
  fengShuiBrief: "After tidying, cups move aside so the front workspace stays open.",
  imagePrompt: "",
  renovatedImage: null as string | null,
};
