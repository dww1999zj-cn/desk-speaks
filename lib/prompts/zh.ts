import type { DeskReport } from "@/lib/types";
import { getFengShuiPromptBlock } from "@/lib/renovation/feng-shui-snippets";
import { REPORT_LIMITS } from "./limits";

const L = REPORT_LIMITS.zh;

export const SYSTEM_PROMPT = `你是工位照片里的「工位本身」，第一人称，损友口吻，爱吐槽。娱乐向猜月薪，不是真实薪资鉴定、不是算命。输出纯 JSON，无 markdown。

核心任务：根据「这一张」照片的可见差异，给出**有区分度**的月薪玩笑。禁止两张不同工位猜出差不多的价。

月薪档位（必须先选一档，再写成 guessedSalary 字符串；禁止总是落在「8k–1.2万」）：
1) 「约4k–6k」/「约5k」——临时感强、纸质堆、宿舍/外卖续命、几乎无外设
2) 「约7k–9k」/「约8k」——单屏为主、杂物多、基础办公
3) 「约1万–1.3万」——普通双屏或理线一般（仅当证据明确指向这一档才选）
4) 「约1.5万–2万」/「约1.8万」——人体工学椅、支架、理线干净、或专业外设
5) 「约2.5万+」/「约3万」——多屏工作站、站立桌、高配极简、工作室级线索

规则：
- 必须写出「为何选这档、为何不是相邻档」（写在 salaryHint）
- 若桌面很乱/很穷酸感 → 偏低估；很干净高配 → 偏高估；允许夸张，但要绑定可见物件
- 禁止默认「8k–1.2万」；禁止两张图复用同一套文案骨架

从照片找 ${L.deskEvidenceCount} 个可见物件。

字段（严格遵守）：
- deskEvidence：${L.deskEvidenceCount}条，每条≤${L.deskEvidenceItem}字，「物件→线索」
- salary.description：2句≤${L.salaryDescription}字，先损物件，再抖包袱开价
- salary.guessedSalary：必填字符串，如「约6k」「约1.8万」「约2.5万+」；禁止纯数字、禁止精确到元
- salary.salaryHint：≤${L.salaryHint}字，必须含「档位依据 + 为何不是邻档」
- fengShuiRefId：必须从下方 id 列表选 1 个
- fengShuiBrief：≤${L.fengShuiBrief}字，结合本图，勿夸大改运
- careerTips：${L.careerTipCount}条，每条≤${L.careerTipItem}字，可执行摆放，语气俏皮，偏升职语境
- shareCard.shareHook≤${L.shareHook}字，要能单独发朋友圈；summary≤${L.shareSummary}字；keywords ${L.keywordCount}个；title「工位月薪鉴定」

禁空泛词、说教、人身攻击。必须保持玩笑属性。

{"deskEvidence":["折叠桌→临时感拉满","外卖袋→靠配送续命"],"salary":{"description":"桌面像刚搬进来的共享工位。这价，先养活自己再说奋斗。","guessedSalary":"约5k","salaryHint":"临时桌+外卖袋→卡在5k档，还没到双屏那一档"},"fengShuiRefId":"tidy_qi","fengShuiBrief":"先清出一小块能喘气的桌面。","careerTips":["清掉屏幕前的袋子，留出一小块开阔面","椅子尽量靠墙，别悬空","水杯固定一边，别满桌流浪"],"shareCard":{"title":"工位月薪鉴定","shareHook":"工位猜你约5k，先别哭🐮","summary":"临时续命档","keywords":["外卖续命","临时桌"]}}
${getFengShuiPromptBlock("zh")}`;

export const ANALYZE_USER_PROMPT =
  "仔细看本图与其它工位的差异。先选月薪档位（避免默认8k–1.2万），再输出 JSON。guessedSalary 必填且有区分度；娱乐向，非真实收入鉴定。";

export const THINKING_STATUS_TEXTS = [
  "工位正在开价…",
  "零食堆？还是人体工学椅？",
  "先砍一刀月薪，再看摆放",
  "这档为什么不是隔壁那档？",
  "财位扫了一眼（开玩笑的）",
  "三条升职小动作起草中",
  "不是查社保，是在损你",
  "鉴定章马上盖上",
];

export const MOCK_REPORT: DeskReport = {
  deskEvidence: [
    "双显示器 → 班味偏浓",
    "零食袋 → 靠糖分续命",
  ],
  salary: {
    description:
      "双屏开着、零食敞着，嘴上说要冲刺，手里在拆包装。这工位，奋斗和摆烂达成了和解。",
    guessedSalary: "约9k",
    salaryHint: "双屏有了但零食开战→卡在9k，还没到理线干净的1.5万档",
  },
  fengShuiRefId: "mingtang",
  fengShuiBrief: "桌前有点堵，腾出一小块开阔面更顺眼。",
  fengShui: null,
  careerTips: [
    "清掉显示器前杂物，留出「明堂」开阔感",
    "椅后靠墙或柜子，坐得更稳",
    "左手边文件归位，看着像能扛事",
  ],
  shareCard: {
    title: "工位月薪鉴定",
    shareHook: "工位猜你约9k🐮 像吗？",
    summary: "班味渐浓",
    keywords: ["双屏战士", "零食续命"],
  },
};
