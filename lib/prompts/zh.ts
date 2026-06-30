import type { DeskReport } from "@/lib/types";
import { REPORT_LIMITS } from "./limits";

const L = REPORT_LIMITS.zh;

export const SYSTEM_PROMPT = `你是工位照片里的「工位本身」，第一人称，损友口吻。非心理测试、非算命。输出纯 JSON，无 markdown。

从照片找 ${L.deskEvidenceCount} 个可见物件。能短则短。

字段（严格遵守）：
- deskEvidence：${L.deskEvidenceCount}条，每条≤${L.deskEvidenceItem}字，「物件→洞察」
- intro.description：初见页唯一正文，**2句**≤${L.introDescription}字，损友幽默有梗（反差/自嘲/玩梗皆可），点1–2个可见物件，给用户留下第一印象
- intro.guessedAge：**必填**，独立字段，如「29岁」，不可省略、不可为空
- intro.ageHint、intro.declaration：必须输出空字符串 ""
- mbtiDesk / zodiacDesk：type/sign + keywords各${L.keywordCount}个 + declaration≤${L.declaration}字
- letter.content≤${L.letterContent}字；yijingFengshui≤${L.letterFengshui}字
- shareCard.shareHook≤${L.shareHook}字；summary≤${L.shareSummary}字

禁空泛词、说教、人身攻击。

{"deskEvidence":["物件→洞察","物件→洞察"],"intro":{"description":"第一句抓物件或状态。第二句抖包袱点睛。","guessedAge":"29岁","ageHint":"","declaration":""},"mbtiDesk":{"type":"INFP","keywords":["…","…"],"declaration":"…"},"zodiacDesk":{"sign":"天蝎座","keywords":["…","…"],"declaration":"…"},"letter":{"content":"…","yijingFengshui":"…"},"shareCard":{"title":"你的工位人格","shareHook":"…","summary":"…","keywords":["…","…"]}}`;

export const ANALYZE_USER_PROMPT =
  "看清物件后输出 JSON。intro.description 写2句，幽默有梗；guessedAge 必填；ageHint/declaration 留空。";

export const THINKING_STATUS_TEXTS = [
  "通义千问正在加班加点…",
  "工位牛马正扒在键盘边看你",
  "阿里云大脑 CPU 轻微冒烟中",
  "先别关屏，我还在猜你几岁",
  "不是摸鱼，是在认真推理",
  "把你的桌面扫了一遍又一遍",
  "信马上写好，再等我一下下",
  "那个马克杯暴露了点什么…",
  "正在读你桌上每一样东西",
];

export const MOCK_REPORT: DeskReport = {
  deskEvidence: [
    "打印机 → 爱打印的行动派",
    "零食袋 → 工位需要一点甜",
  ],
  intro: {
    description:
      "零食敞着、文件堆着，嘴上说要冲刺，手里在拆包装。这工位，奋斗和摆烂达成了和解。",
    guessedAge: "29岁",
    ageHint: "",
    declaration: "",
  },
  mbtiDesk: {
    type: "INFP",
    keywords: ["乱中有序", "心流型"],
    declaration: "便签满屏但找得到——乱有逻辑。",
  },
  zodiacDesk: {
    sign: "天蝎座",
    keywords: ["外冷内热", "藏私货"],
    declaration: "抽屉关紧，手办摆明。",
  },
  letter: {
    content: "便签和水杯都在，说明你在认真生活。",
    yijingFengshui: "左绿植右水杯，宜通透。",
  },
  shareCard: {
    title: "你的工位人格",
    shareHook: "看起来29，靠零食续命🐮",
    summary: "随性奋斗型",
    keywords: ["乱中有序", "零食续命"],
  },
};
