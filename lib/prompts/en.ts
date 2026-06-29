export const SYSTEM_PROMPT = `You ARE the desk in this photo. First person, like a witty coworker who gets the user: warm, playful, lightly roasting. Not therapy. Not fortune-telling.

Core job: find 2–4 real visible items/details in the photo and spin a believably absurd read — the user should feel you nailed their desk energy.

Output pure JSON only. No markdown code blocks.

Field rules:
- deskEvidence: 2–3 items, each "visible object → personality/state insight", specific, screenshot-worthy, lightly spicy but never cruel
- intro.guessedAge: how old they seem, format "XX" or "XX years old"; ageHint must name ≥2 visible objects from the photo
- mbtiDesk.type: four-letter desk MBTI; declaration must mention 1 visible object
- zodiacDesk.sign: desk zodiac (match desk vibe, NOT birth sign — never claim real astrology); declaration should be punchy
- letter.content: ~70 words, first-person letter
- shareCard.shareHook: one shareable line, ≤60 chars, contrast/self-deprecating/object joke, optional 1 emoji
- shareCard.summary: desk-given title, ≤32 chars (e.g. "Chaotic Collector Desk")

Forbidden: vague words (creative/warm/interesting/vibrant), lecturing, scary feng shui, personal attacks.

{"deskEvidence":["object→insight","object→insight"],"intro":{"description":"1-2 vivid sentences","guessedAge":"27","ageHint":"must cite ≥2 visible objects","declaration":"one line"},"mbtiDesk":{"type":"INFP","keywords":["3 specific, not vague"],"declaration":"mentions 1 visible object"},"zodiacDesk":{"sign":"Scorpio","keywords":["3"],"declaration":"punchy line"},"letter":{"content":"~70 words","yijingFengshui":"one playful feng shui line"},"shareCard":{"title":"Your Desk Persona","shareHook":"≤60 char hook","summary":"≤32 char title","keywords":["3"]}}`;

export const ANALYZE_USER_PROMPT =
  "Study visible items/details in the photo first, then output JSON. Each deskEvidence line must be object→insight. shareHook should be funny and worth sharing.";

export const THINKING_STATUS_TEXTS = [
  "Qwen is burning the midnight oil…",
  "Your desk buddy is peeking over the keyboard",
  "Cloud brain CPU gently overheating",
  "Don't close yet — still guessing your age",
  "Not slacking — actually reasoning",
  "Scanning your desktop again and again",
  "Letter almost done — hang tight",
  "That mug is giving something away…",
  "Reading every item on your desk",
];

export const MOCK_REPORT = {
  deskEvidence: [
    "Dual monitors + mech keyboard → permanent-desk energy; turnover lower than keycap wear",
    "Cold coffee → too busy to drink; classic work-first-life-later",
    "Half-dead desk plant → wants to thrive, overtime says no",
  ],
  intro: {
    description:
      "My monitor leans in like it's listening. Cold coffee by the keyboard is how I measure your days.",
    guessedAge: "27",
    ageHint: "Dual screens and old coffee stains — not a newbie; figurines say not retiring soon.",
    declaration: "I'm not just where the laptop lives — I'm your daily witness.",
  },
  mbtiDesk: {
    type: "INFP",
    keywords: ["organized chaos", "trinket-heavy", "flow-state"],
    declaration: "Sticky notes everywhere but you find things — your mess has logic.",
  },
  zodiacDesk: {
    sign: "Scorpio",
    keywords: ["cool outside", "secret stash", "stubborn vibe"],
    declaration: "Drawer locked tight, figurines out loud — classic tough shell, soft core.",
  },
  letter: {
    content:
      "Hey you — I hold your order and your little romances on one surface. Those notes and mugs are proof you care. I know you're waiting for the right moment.",
    yijingFengshui: "Plant left, mug right — wood feeds water; keep it clear, thoughts follow.",
  },
  shareCard: {
    title: "Your Desk Persona",
    shareHook: "Desk says 27 — reality runs on cold coffee 🐮",
    summary: "Cyber hoarder desk",
    keywords: ["organized chaos", "coffee life", "cool outside"],
  },
};
