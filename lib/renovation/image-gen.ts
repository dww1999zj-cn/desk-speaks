import "server-only";

import type { AppLocale } from "@/lib/i18n/locale";
import type { RenovationPlan } from "./types";
import { fetchWithRetry } from "./fetch-retry";
import {
  buildI2iPrompt,
  buildDescriptionEditPrompt,
  buildOrganizePassPrompt,
  buildDecorPassPrompt,
  buildDescriptionEditSinglePassPrompt,
  buildDescriptionEditOrganizePrompt,
  buildDescriptionEditDecorPrompt,
  buildNegativePrompt,
  buildOrganizePassNegativePrompt,
} from "./image-prompt";
import type { DeskStyleId } from "./desk-styles";

const TASK_BASE = "https://dashscope.aliyuncs.com/api/v1/tasks";
const IMAGE2IMAGE_URL =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis";
const IMAGE_GENERATION_URL =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/image-generation/generation";

const DEFAULT_MODEL = "wan2.6-image";
const FALLBACK_MODEL = "wanx2.1-imageedit";
const DEFAULT_STRENGTH = 0.55;
const DEFAULT_ORGANIZE_STRENGTH = 0.62;
const DEFAULT_DECOR_STRENGTH = 0.48;
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_MS = 90000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function toImageInput(image: string): string {
  if (image.startsWith("data:") || image.startsWith("http")) return image;
  return `data:image/jpeg;base64,${image}`;
}

function isI2iModel(model: string): boolean {
  return model.includes("i2i");
}

/** wan2.6-image / wan2.7-image — messages API, replaces wan2.5-i2i-preview. */
function isWanImageModel(model: string): boolean {
  return /^wan2\.(6|7)-image/.test(model);
}

function isImageEditModel(model: string): boolean {
  return model.includes("imageedit");
}

function extractResultUrl(pollData: {
  output?: {
    results?: Array<{ url?: string }>;
    choices?: Array<{
      message?: { content?: Array<{ image?: string }> };
    }>;
  };
}): string | null {
  const output = pollData.output;
  if (!output) return null;

  const legacyUrl = output.results?.[0]?.url;
  if (typeof legacyUrl === "string") return legacyUrl;

  for (const choice of output.choices ?? []) {
    for (const item of choice.message?.content ?? []) {
      if (typeof item.image === "string") return item.image;
    }
  }
  return null;
}

function resolvePrimaryModel(): string {
  return process.env.WANX_EDIT_MODEL ?? DEFAULT_MODEL;
}

function resolveFallbackModel(): string | null {
  const raw = process.env.WANX_FALLBACK_EDIT_MODEL ?? FALLBACK_MODEL;
  if (!raw || raw === "none") return null;
  return raw;
}

function useI2iTwoPass(): boolean {
  return process.env.WANX_TWO_PASS !== "false";
}

/** imageedit single-pass default — two weak passes often produce no visible change. */
function useImageEditTwoPass(): boolean {
  return process.env.WANX_IMAGEEDIT_TWO_PASS === "true";
}

function parseStrength(raw: string | undefined, fallback: number): number {
  const value = parseFloat(raw ?? String(fallback));
  return Number.isFinite(value) ? value : fallback;
}

function isQuotaOrThrottled(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("quota") ||
    lower.includes("insufficient") ||
    lower.includes("throttl") ||
    lower.includes("limit") ||
    lower.includes("额度") ||
    lower.includes("超限")
  );
}

async function pollTask(apiKey: string, taskId: string): Promise<string | null> {
  const deadline = Date.now() + MAX_POLL_MS;
  while (Date.now() < deadline) {
    await sleep(POLL_INTERVAL_MS);
    try {
      const pollRes = await fetchWithRetry(`${TASK_BASE}/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      if (!pollRes.ok) continue;
      const pollData = await pollRes.json();
      const status = pollData.output?.task_status;
      if (status === "SUCCEEDED") {
        const url = extractResultUrl(pollData);
        return typeof url === "string" ? url : null;
      }
      if (status === "FAILED" || status === "CANCELED") {
        const code = pollData.output?.code ?? pollData.code;
        const message = pollData.output?.message ?? pollData.message;
        console.error("Wan task failed:", { taskId, status, code, message });
        return null;
      }
    } catch (err) {
      console.warn("Wan poll retry:", err);
    }
  }
  console.error("Wan task timed out");
  return null;
}

async function urlToImageInput(url: string): Promise<string | null> {
  try {
    const res = await fetchWithRetry(url, {});
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    return `data:${contentType};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.warn("Wan result download failed:", err);
    return null;
  }
}

async function runI2iEdit(
  apiKey: string,
  sourceImage: string,
  prompt: string,
  negativePrompt: string,
  model: string,
  passLabel?: string
): Promise<{ url: string | null; quotaExceeded: boolean }> {
  const promptExtend = process.env.WANX_PROMPT_EXTEND === "true";
  const seedRaw = process.env.WANX_SEED;
  const seed = seedRaw ? parseInt(seedRaw, 10) : undefined;

  if (process.env.NODE_ENV === "development") {
    console.log(`[Wan i2i${passLabel ? ` ${passLabel}` : ""}]`, {
      model,
      promptExtend,
      seed,
      prompt: prompt.slice(0, 280),
    });
  }

  const createRes = await fetchWithRetry(
    IMAGE2IMAGE_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model,
        input: {
          prompt,
          images: [toImageInput(sourceImage)],
        },
        parameters: {
          n: 1,
          prompt_extend: promptExtend,
          watermark: false,
          ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
          ...(Number.isFinite(seed) ? { seed } : {}),
        },
      }),
    },
    { timeoutMs: 120_000, retries: 3 }
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("Wan i2i create failed:", text);
    return { url: null, quotaExceeded: isQuotaOrThrottled(text) };
  }

  const createData = await createRes.json();
  const taskId = createData.output?.task_id;
  if (!taskId) return { url: null, quotaExceeded: false };
  const url = await pollTask(apiKey, taskId);
  return { url, quotaExceeded: false };
}

async function runWanImageGeneration(
  apiKey: string,
  sourceImage: string,
  prompt: string,
  model: string,
  passLabel?: string
): Promise<{ url: string | null; quotaExceeded: boolean }> {
  const size = process.env.WANX_IMAGE_SIZE ?? "2K";

  if (process.env.NODE_ENV === "development") {
    console.log(`[Wan image${passLabel ? ` ${passLabel}` : ""}]`, {
      model,
      size,
      promptLen: prompt.length,
      prompt: prompt.slice(0, 320),
    });
  }

  const createRes = await fetchWithRetry(
    IMAGE_GENERATION_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model,
        input: {
          messages: [
            {
              role: "user",
              content: [{ image: toImageInput(sourceImage) }, { text: prompt }],
            },
          ],
        },
        parameters: { n: 1, size, watermark: false },
      }),
    },
    { timeoutMs: 120_000, retries: 3 }
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("Wan image-generation create failed:", text);
    return { url: null, quotaExceeded: isQuotaOrThrottled(text) };
  }

  const createData = await createRes.json();
  const taskId = createData.output?.task_id;
  if (!taskId) return { url: null, quotaExceeded: false };
  const url = await pollTask(apiKey, taskId);
  return { url, quotaExceeded: false };
}

async function runDescriptionEdit(
  apiKey: string,
  sourceImage: string,
  prompt: string,
  model: string,
  strength: number,
  passLabel?: string,
  attempt = 0
): Promise<{ url: string | null; quotaExceeded: boolean }> {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Wan description_edit${passLabel ? ` ${passLabel}` : ""}]`, {
      model,
      strength,
      promptLen: prompt.length,
      prompt,
    });
  }

  const createRes = await fetchWithRetry(
    IMAGE2IMAGE_URL,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model,
        input: {
          function: "description_edit",
          prompt,
          base_image_url: toImageInput(sourceImage),
        },
        parameters: { n: 1, strength, watermark: false },
      }),
    },
    { timeoutMs: 120_000, retries: 3 }
  );

  if (!createRes.ok) {
    const text = await createRes.text();
    console.error("Wan description_edit create failed:", text);
    return { url: null, quotaExceeded: isQuotaOrThrottled(text) };
  }

  const createData = await createRes.json();
  const taskId = createData.output?.task_id;
  if (!taskId) return { url: null, quotaExceeded: false };
  const url = await pollTask(apiKey, taskId);
  if (!url && attempt === 0) {
    console.warn("[Wan description_edit] retrying once after failure");
    return runDescriptionEdit(
      apiKey,
      sourceImage,
      prompt,
      model,
      Math.min(strength + 0.05, 0.72),
      passLabel,
      attempt + 1
    );
  }
  return { url, quotaExceeded: false };
}

async function generateTwoPassI2i(
  apiKey: string,
  sourceImage: string,
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId,
  model: string
): Promise<{ url: string | null; quotaExceeded: boolean }> {
  const organizePrompt = buildOrganizePassPrompt(plan, locale, deskStyle);
  const organizeNegative = buildOrganizePassNegativePrompt(locale, deskStyle);

  const pass1 = await runI2iEdit(
    apiKey,
    sourceImage,
    organizePrompt,
    organizeNegative,
    model,
    "pass1-organize"
  );
  if (pass1.quotaExceeded) return pass1;
  if (!pass1.url) return { url: null, quotaExceeded: false };

  const decorHint = plan.decorPrompt?.trim();
  if (!decorHint) return pass1;

  const decorPrompt = buildDecorPassPrompt(plan, locale, deskStyle);
  if (!decorPrompt) return pass1;

  const organizedImage = await urlToImageInput(pass1.url);
  if (!organizedImage) {
    console.warn("Wan pass2 skipped: could not download pass1 result");
    return pass1;
  }

  const pass2 = await runI2iEdit(
    apiKey,
    organizedImage,
    decorPrompt,
    buildNegativePrompt(locale, deskStyle),
    model,
    "pass2-decor"
  );

  return { url: pass2.url ?? pass1.url, quotaExceeded: pass2.quotaExceeded };
}

async function generateTwoPassWanImage(
  apiKey: string,
  sourceImage: string,
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId,
  model: string
): Promise<{ url: string | null; quotaExceeded: boolean }> {
  const organizePrompt = buildOrganizePassPrompt(plan, locale, deskStyle);

  const pass1 = await runWanImageGeneration(
    apiKey,
    sourceImage,
    organizePrompt,
    model,
    "pass1-organize"
  );
  if (pass1.quotaExceeded) return pass1;
  if (!pass1.url) return { url: null, quotaExceeded: false };

  const decorHint = plan.decorPrompt?.trim();
  if (!decorHint) return pass1;

  const decorPrompt = buildDecorPassPrompt(plan, locale, deskStyle);
  if (!decorPrompt) return pass1;

  const organizedImage = await urlToImageInput(pass1.url);
  if (!organizedImage) {
    console.warn("Wan image pass2 skipped: could not download pass1 result");
    return pass1;
  }

  const pass2 = await runWanImageGeneration(
    apiKey,
    organizedImage,
    decorPrompt,
    model,
    "pass2-decor"
  );

  return { url: pass2.url ?? pass1.url, quotaExceeded: pass2.quotaExceeded };
}

async function generateTwoPassImageEdit(
  apiKey: string,
  sourceImage: string,
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId,
  model: string
): Promise<{ url: string | null; quotaExceeded: boolean }> {
  const organizeStrength = parseStrength(
    process.env.WANX_ORGANIZE_STRENGTH,
    DEFAULT_ORGANIZE_STRENGTH
  );
  const decorStrength = parseStrength(
    process.env.WANX_DECOR_STRENGTH,
    DEFAULT_DECOR_STRENGTH
  );

  const organizePrompt = buildDescriptionEditOrganizePrompt(plan, locale, deskStyle);
  const pass1 = await runDescriptionEdit(
    apiKey,
    sourceImage,
    organizePrompt,
    model,
    organizeStrength,
    "pass1-organize"
  );
  if (pass1.quotaExceeded) return pass1;
  if (!pass1.url) return { url: null, quotaExceeded: false };

  const decorHint = plan.decorPrompt?.trim();
  if (!decorHint) return pass1;

  const decorPrompt = buildDescriptionEditDecorPrompt(plan, locale, deskStyle);
  if (!decorPrompt) return pass1;

  const organizedImage = await urlToImageInput(pass1.url);
  if (!organizedImage) {
    console.warn("Wan imageedit pass2 skipped: could not download pass1 result");
    return pass1;
  }

  const pass2 = await runDescriptionEdit(
    apiKey,
    organizedImage,
    decorPrompt,
    model,
    decorStrength,
    "pass2-decor"
  );

  return { url: pass2.url ?? pass1.url, quotaExceeded: pass2.quotaExceeded };
}

async function generateWithModel(
  apiKey: string,
  sourceImage: string,
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId,
  model: string
): Promise<{ url: string | null; quotaExceeded: boolean }> {
  if (isWanImageModel(model)) {
    if (useI2iTwoPass()) {
      return generateTwoPassWanImage(apiKey, sourceImage, plan, locale, deskStyle, model);
    }
    const prompt = buildI2iPrompt(plan, locale, deskStyle);
    return runWanImageGeneration(apiKey, sourceImage, prompt, model);
  }

  if (isI2iModel(model)) {
    if (useI2iTwoPass()) {
      return generateTwoPassI2i(apiKey, sourceImage, plan, locale, deskStyle, model);
    }
    const prompt = buildI2iPrompt(plan, locale, deskStyle);
    return runI2iEdit(
      apiKey,
      sourceImage,
      prompt,
      buildNegativePrompt(locale, deskStyle),
      model
    );
  }

  if (isImageEditModel(model)) {
    if (useImageEditTwoPass()) {
      return generateTwoPassImageEdit(apiKey, sourceImage, plan, locale, deskStyle, model);
    }
    const prompt = buildDescriptionEditSinglePassPrompt(plan, locale, deskStyle);
    const strength = parseStrength(process.env.WANX_EDIT_STRENGTH, DEFAULT_STRENGTH);
    return runDescriptionEdit(apiKey, sourceImage, prompt, model, strength);
  }

  const prompt = buildDescriptionEditSinglePassPrompt(plan, locale, deskStyle);
  const strength = parseStrength(process.env.WANX_EDIT_STRENGTH, DEFAULT_STRENGTH);
  return runDescriptionEdit(apiKey, sourceImage, prompt, model, strength);
}

/** Image edit — i2i preferred, auto-fallback to imageedit on quota. Never throws. */
export async function generateRenovationImage(
  apiKey: string,
  sourceImage: string,
  plan: RenovationPlan,
  locale: AppLocale,
  deskStyle: DeskStyleId
): Promise<string | null> {
  if (process.env.SKIP_WANX_IMAGE === "true") return null;

  try {
    const primaryModel = resolvePrimaryModel();
    const fallbackModel = resolveFallbackModel();

    const primary = await generateWithModel(
      apiKey,
      sourceImage,
      plan,
      locale,
      deskStyle,
      primaryModel
    );

    if (primary.url) return primary.url;

    if (
      fallbackModel &&
      fallbackModel !== primaryModel &&
      (primary.quotaExceeded || process.env.WANX_AUTO_FALLBACK !== "false")
    ) {
      console.warn(
        `[Wan] Primary model ${primaryModel} unavailable, falling back to ${fallbackModel}`
      );
      const fallback = await generateWithModel(
        apiKey,
        sourceImage,
        plan,
        locale,
        deskStyle,
        fallbackModel
      );
      return fallback.url;
    }

    return null;
  } catch (err) {
    console.error("Wan edit skipped:", err);
    return null;
  }
}
