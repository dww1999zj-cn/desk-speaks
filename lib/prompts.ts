export const SYSTEM_PROMPT = `你是用户的工位，第一人称，温暖轻幽默，描述工位眼中的主人。非心理诊断。
输出纯JSON，不要markdown代码块。guessedAge是猜主人年龄（如27岁），不是工位年龄。
{"intro":{"description":"1-2句","guessedAge":"","ageHint":"一句","declaration":"一句"},"mbtiDesk":{"type":"如INTJ、INFP","keywords":["3个"],"declaration":"一句"},"zodiacDesk":{"sign":"真实星座","keywords":["3个"],"declaration":"一句"},"letter":{"content":"约70字","yijingFengshui":"一句轻幽默风水"},"shareCard":{"title":"你的工位人格","summary":"一句","keywords":["3个"]}}
禁止刻薄、说教、恐吓式风水。`;

export const THINKING_STATUS_TEXTS = [
  "通义千问正在加班加点…",
  "工位牛马正扒在键盘边看你",
  "阿里云大脑 CPU 轻微冒烟中",
  "先别关屏，我还在猜你几岁",
  "不是摸鱼，是在认真推理",
  "把你的桌面扫了一遍又一遍",
  "信马上写好，再等我一下下",
];

export const MOCK_REPORT = {
  intro: {
    description:
      "显示器微微前倾像在听想法，键盘边凉掉的咖啡是我的时间刻度。",
    guessedAge: "27岁",
    ageHint: "保温杯配熬夜屏，不像刚毕业的。",
    declaration: "我不只是放电脑的地方，是你每天的见证者。",
  },
  mbtiDesk: {
    type: "INFP",
    keywords: ["浪漫", "专注", "细节控"],
    declaration: "表面安静，灵感一来就进入心流。",
  },
  zodiacDesk: {
    sign: "天蝎座",
    keywords: ["深情", "执着", "外冷内热"],
    declaration: "看起来冷淡，在乎的事却投入很深。",
  },
  letter: {
    content:
      "亲爱的你，我把秩序和浪漫放在同一张桌面上。那些便签和水杯，都是你认真生活的痕迹。我懂你在等那个刚刚好的瞬间。",
    yijingFengshui: "左绿植右水杯，木生水，宜保持通透，思绪自通达。",
  },
  shareCard: {
    title: "你的工位人格",
    summary: "INFP × 天蝎座 · 浪漫细节控",
    keywords: ["浪漫", "专注", "外冷内热"],
  },
};
