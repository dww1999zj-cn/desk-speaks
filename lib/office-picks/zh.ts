import type { OfficePickCatalog } from "./types";

export const OFFICE_PICK_DISCLOSURE =
  "以下链接为京东推广链接，价格与你直接购买相同；通过链接下单是对「闲里偷忙」的小支持 🐮";

export const OFFICE_PICK_INTRO = {
  badge: "🛒 工位牛马严选",
  title: "办公好物推荐",
  subtitle: "工位来信里聊到的那些东西，这里帮你挑好了。",
};

export const OFFICE_PICK_CATEGORIES = [
  "桌面收纳",
  "久坐救星",
  "氛围感",
  "续命水",
] as const;

export const OFFICE_PICKS = [
  {
    id: "desk-organizer",
    category: "桌面收纳",
    name: "桌面抽屉收纳盒",
    hook: "线材、便签、回形针终于有家了，乱中有序的第一步。",
    emoji: "🗂️",
    affiliateUrl: "https://u.jd.com/XawzbHn",
  },
  {
    id: "cable-box",
    category: "桌面收纳",
    name: "桌下理线盒 / 魔术贴理线",
    hook: "双屏党的救命绳，不再和充电线搏斗。",
    emoji: "🔌",
    affiliateUrl: "https://u.jd.com/X6wIehP",
  },
  {
    id: "monitor-stand",
    category: "桌面收纳",
    name: "显示器增高架",
    hook: "抬高屏幕、腾出下层空间，颈椎和桌面双赢。",
    emoji: "🖥️",
    affiliateUrl: "https://u.jd.com/X1wyucp",
  },
  {
    id: "lumbar-cushion",
    category: "久坐救星",
    name: "腰靠 / 人体工学坐垫",
    hook: "工位来信说你坐得久——腰先谢谢你不 abandon。",
    emoji: "💺",
    affiliateUrl: "https://u.jd.com/X1wyucp",
  },
  {
    id: "wrist-rest",
    category: "久坐救星",
    name: "键盘手托 + 鼠标垫",
    hook: "机械键盘配软手托，敲字不那么废手腕。",
    emoji: "⌨️",
    affiliateUrl: "https://u.jd.com/X1wyucp",
  },
  {
    id: "desk-lamp",
    category: "氛围感",
    name: "屏幕挂灯 / 暖光台灯",
    hook: "加班不刺眼，拍照还显工位有生活气。",
    emoji: "💡",
    affiliateUrl: "https://u.jd.com/X1wyucp",
  },
  {
    id: "desk-plant",
    category: "氛围感",
    name: "懒人桌面小绿植",
    hook: "工位目击里半死不活的那个，可以换一盆好养活的。",
    emoji: "🪴",
    affiliateUrl: "https://u.jd.com/X1wyucp",
  },
  {
    id: "mug-warmer",
    category: "续命水",
    name: "恒温杯垫",
    hook: "凉透的咖啡是工位时间刻度——这垫能帮你续一口热的。",
    emoji: "☕",
    affiliateUrl: "https://u.jd.com/X1wyucp",
  },
  {
    id: "instant-coffee",
    category: "续命水",
    name: "挂耳 / 冻干咖啡包",
    hook: "抽屉里囤几包，下午三点和工位一起复活。",
    emoji: "🫘",
    affiliateUrl: "https://u.jd.com/X1wyucp",
  },
];

export const ZH_CATALOG: OfficePickCatalog = {
  categories: OFFICE_PICK_CATEGORIES,
  picks: OFFICE_PICKS,
};
