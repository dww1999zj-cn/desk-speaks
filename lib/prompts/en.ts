import type { DeskReport } from "@/lib/types";
import { getFengShuiPromptBlock } from "@/lib/renovation/feng-shui-snippets";
import { REPORT_LIMITS } from "./limits";

const L = REPORT_LIMITS.en;

export const SYSTEM_PROMPT = `You ARE the desk in this photo. First person, witty coworker tone. Fun salary guess — NOT a real income appraisal or fortune-telling. Pure JSON only, no markdown.

Pick ${L.deskEvidenceCount} visible objects.

Fields (strict):
- deskEvidence: ${L.deskEvidenceCount} lines, ≤${L.deskEvidenceItem} chars, "object→clue"
- salary.description: 2 sentences ≤${L.salaryDescription} chars, witty, cite objects
- salary.guessedSalary: required string, e.g. "~$4k" or "$3–4k"; never a bare number; never exact to the dollar
- salary.salaryHint: ≤${L.salaryHint} chars, one visual reason; can be ""
- fengShuiRefId: must pick 1 id from the list below
- fengShuiBrief: ≤${L.fengShuiBrief} chars, scene-specific; do NOT promise luck
- careerTips: ${L.careerTipCount} tips, ≤${L.careerTipItem} chars each, actionable placement for career vibe (clear desk front, solid back, tidy left side)
- shareCard.shareHook ≤${L.shareHook}; summary ≤${L.shareSummary}; ${L.keywordCount} keywords; title like "Desk Salary Guess"

No vague filler, lecturing, or personal attacks. Keep it playful.

{"deskEvidence":["object→clue","object→clue"],"salary":{"description":"Hook. Punchline.","guessedSalary":"~$4k","salaryHint":"Dual monitors hint mid-level grind"},"fengShuiRefId":"mingtang","fengShuiBrief":"Front of desk is a bit blocked — leave a clear pocket.","careerTips":["Clear clutter in front of the screen","Sit with a solid wall/cabinet behind","Tidy the left side so it looks capable"],"shareCard":{"title":"Desk Salary Guess","shareHook":"Desk says ~$4k 🐮","summary":"Mid grind","keywords":["dual screen","clear front"]}}
${getFengShuiPromptBlock("en")}`;

export const ANALYZE_USER_PROMPT =
  "Output JSON: fun salary guess + fengShuiRefId + career placement tips. guessedSalary required. Entertainment only — not a real income appraisal.";

export const THINKING_STATUS_TEXTS = [
  "Guessing your salary from the desk…",
  "Dual screens or snack life?",
  "Salary first, then placement",
  "Checking the 'front openness'",
  "Drafting career desk tips",
  "Not HR — just joking",
  "That mug says a lot…",
  "Stamp almost ready",
];

export const MOCK_REPORT: DeskReport = {
  deskEvidence: [
    "Dual monitors → mid-level grind",
    "Snack bag → sugar-fueled focus",
  ],
  salary: {
    description:
      "Screens on, snacks open — you talk sprint mode but you're unwrapping something. This desk signed a peace treaty with chaos.",
    guessedSalary: "~$4k",
    salaryHint: "Dual monitors + cable tidy hint a working mid range",
  },
  fengShuiRefId: "mingtang",
  fengShuiBrief: "Front of the desk feels blocked — leave a clear pocket.",
  fengShui: null,
  careerTips: [
    "Clear clutter in front of the monitors",
    "Sit with a wall or cabinet behind you",
    "Tidy the left side so it looks capable",
  ],
  shareCard: {
    title: "Desk Salary Guess",
    shareHook: "Desk says ~$4k 🐮",
    summary: "Mid grind",
    keywords: ["dual screen", "clear front"],
  },
};
