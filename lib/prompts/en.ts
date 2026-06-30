import type { DeskReport } from "@/lib/types";
import { REPORT_LIMITS } from "./limits";

const L = REPORT_LIMITS.en;

export const SYSTEM_PROMPT = `You ARE the desk in this photo. First person, witty coworker tone. Not therapy or fortune-telling. Pure JSON only, no markdown.

Pick ${L.deskEvidenceCount} visible objects. Shorter is better.

Fields (strict):
- deskEvidence: ${L.deskEvidenceCount} lines, ≤${L.deskEvidenceItem} chars each, "object→insight"
- intro.description: only intro copy, **2 sentences** ≤${L.introDescription} chars, witty coworker humor (irony, self-roast, punchline OK), cite 1–2 visible objects — this is the user's first impression
- intro.guessedAge: **required** separate field, e.g. "29", never omit or leave empty
- intro.ageHint, intro.declaration: must be empty string ""
- mbtiDesk / zodiacDesk: type/sign + ${L.keywordCount} keywords + declaration ≤${L.declaration} chars
- letter.content ≤${L.letterContent} chars; yijingFengshui ≤${L.letterFengshui} chars
- shareCard.shareHook ≤${L.shareHook} chars; summary ≤${L.shareSummary} chars

No vague filler, lecturing, or personal attacks.

{"deskEvidence":["object→insight","object→insight"],"intro":{"description":"First sentence hooks an object. Second lands the joke.","guessedAge":"29","ageHint":"","declaration":""},"mbtiDesk":{"type":"INFP","keywords":["…","…"],"declaration":"…"},"zodiacDesk":{"sign":"Scorpio","keywords":["…","…"],"declaration":"…"},"letter":{"content":"…","yijingFengshui":"…"},"shareCard":{"title":"Your Desk Persona","shareHook":"…","summary":"…","keywords":["…","…"]}}`;

export const ANALYZE_USER_PROMPT =
  'Output JSON after studying objects. intro.description: 2 witty sentences; intro.guessedAge required; ageHint/declaration ""';

export const THINKING_STATUS_TEXTS = [
  "Qwen is on it…",
  "Peeking at your keyboard",
  "Brain warming up",
  "Still guessing your age",
  "Actually reasoning",
  "Scanning your desk",
  "Letter almost done",
  "That mug says a lot…",
  "Reading every item",
];

export const MOCK_REPORT: DeskReport = {
  deskEvidence: [
    "Printer → action-oriented",
    "Snack bag → desk needs sweetness",
  ],
  intro: {
    description:
      "Snacks out, files stacked — you talk sprint mode but you're unwrapping something. This desk signed a peace treaty with chaos.",
    guessedAge: "29",
    ageHint: "",
    declaration: "",
  },
  mbtiDesk: {
    type: "INFP",
    keywords: ["organized chaos", "flow-state"],
    declaration: "Notes everywhere but you find things.",
  },
  zodiacDesk: {
    sign: "Scorpio",
    keywords: ["cool outside", "secret stash"],
    declaration: "Locked drawer, loud figurines.",
  },
  letter: {
    content: "Your mugs and notes prove you care. I know you're waiting for the right moment.",
    yijingFengshui: "Plant left, mug right — keep clear.",
  },
  shareCard: {
    title: "Your Desk Persona",
    shareHook: "Desk says 29, runs on snacks 🐮",
    summary: "Casual striver",
    keywords: ["organized chaos", "snack life"],
  },
};
