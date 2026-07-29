export interface RenovationPlan {
  isDesk: boolean;
  rejectReason?: string;
  title?: string;
  style?: string;
  summary?: string;
  /** Step 1: bare desk / fixed layout description */
  bareDesk?: string;
  /** Existing clutter on desktop */
  clutterItems?: string[];
  /** Step 2: how to organize into storage */
  organizePlan?: string;
  organizePrompt?: string;
  /** Step 3: decor & placement */
  decorPlan?: string;
  decorPrompt?: string;
  highlights?: string[];
  tips?: string[];
  /** Optional placement note — id must match feng-shui-snippets.ts */
  fengShuiRefId?: string;
  /** One sentence scene-specific interpretation */
  fengShuiBrief?: string;
  /** Fallback single prompt */
  imagePrompt?: string;
}

export interface FengShuiNote {
  topic: string;
  source: string;
  quote: string;
  brief: string;
}

export interface RenovationSteps {
  bareDesk: string;
  organize: string;
  decor: string;
  clutterItems: string[];
}

export interface RenovationResult {
  title: string;
  style: string;
  summary: string;
  steps: RenovationSteps;
  highlights: string[];
  tips: string[];
  /** Optional traditional placement note — omitted when not applicable */
  fengShui?: FengShuiNote | null;
  imagePrompt: string;
  renovatedImage: string | null;
}
