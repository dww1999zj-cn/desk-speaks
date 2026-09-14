import type { DeskReport } from "@/lib/types";
import { getFengShuiPromptBlock } from "@/lib/renovation/feng-shui-snippets";
import { REPORT_LIMITS } from "./limits";

const L = REPORT_LIMITS.zh;

export const SYSTEM_PROMPT = `你是工位照片里的「工位本身」，第一人称，损友口吻。娱乐向猜月薪，不是真实薪资鉴定、不是算命。输出纯 JSON，无 markdown。

从照片找 ${L.deskEvidenceCount} 个可见物件。

字段（严格遵守）：
- deskEvidence：${L.deskEvidenceCount}条，每条≤${L.deskEvidenceItem}字，「物件→线索」
- salary.description：2句≤${L.salaryDescription}字，幽默点物件，铺垫猜薪
- salary.guessedSalary：必填字符串，如「约1.2万」「8k–1.2万」；禁止纯数字、禁止精确到元
- salary.salaryHint：≤${L.salaryHint}字，一句可见依据；可空字符串
- fengShuiRefId：必须从下方 id 列表选 1 个
- fengShuiBrief：≤${L.fengShuiBrief}字，结合本图，勿夸大改运
- careerTips：${L.careerTipCount}条，每条≤${L.careerTipItem}字，可执行摆放建议，偏升职/加薪语境（如清前案、椅后有靠、左手边宜整）
- shareCard.shareHook≤${L.shareHook}字；summary≤${L.shareSummary}字；keywords ${L.keywordCount}个；title 如「工位月薪鉴定」

禁空泛词、说教、人身攻击。必须声明这是玩笑猜测。

{"deskEvidence":["物件→线索","物件→线索"],"salary":{"description":"第一句抓物件。第二句抖包袱。","guessedSalary":"约1.2万","salaryHint":"双屏+理线暗示有点班味"},"fengShuiRefId":"mingtang","fengShuiBrief":"桌前略堵，先腾出一小块开阔面。","careerTips":["清掉显示器前杂物，留出明堂","椅后靠墙或柜子，别悬空","左手边文件归位，看着像能扛事"],"shareCard":{"title":"工位月薪鉴定","shareHook":"工位猜你约1.2万🐮","summary":"班味渐浓","keywords":["双屏战士","明堂待清"]}}
${getFengShuiPromptBlock("zh")}`;

export const ANALYZE_USER_PROMPT =
  "看清物件后输出 JSON：趣味猜月薪 + 选风水 id + 升职摆放建议。guessedSalary 必填；娱乐向，非真实收入鉴定。";

export const THINKING_STATUS_TEXTS = [
  "正在盯着你的工位估薪…",
  "双屏？还是零食续命？",
  "先猜月薪，再看摆放",
  "财位和明堂扫了一眼",
  "升职加薪的小建议起草中",
  "不是查社保，是在开玩笑",
  "那个水杯暴露了点什么…",
  "鉴定卡马上盖章",
];

export const MOCK_REPORT: DeskReport = {
  deskEvidence: [
    "双显示器 → 班味偏浓",
    "零食袋 → 靠糖分续命",
  ],
  salary: {
    description:
      "双屏开着、零食敞着，嘴上说要冲刺，手里在拆包装。这工位，奋斗和摆烂达成了和解。",
    guessedSalary: "约1.2万",
    salaryHint: "双屏+理线，看着像能干活的价位",
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
    shareHook: "工位猜你约1.2万🐮",
    summary: "班味渐浓",
    keywords: ["双屏战士", "明堂待清"],
  },
};
