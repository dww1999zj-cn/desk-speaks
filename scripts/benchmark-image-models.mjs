#!/usr/bin/env node
/**
 * Compare DashScope image edit models for desk organize effect.
 *
 * Usage:
 *   node --env-file=.env.local scripts/benchmark-image-models.mjs test-fixtures/desk-test.png
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve, basename } from "path";

const imagePath = process.argv[2];
if (!imagePath) {
  console.error("Usage: node --env-file=.env.local scripts/benchmark-image-models.mjs <image>");
  process.exit(1);
}

const abs = resolve(imagePath);
if (!existsSync(abs)) {
  console.error("File not found:", abs);
  process.exit(1);
}

const apiKey = process.env.DASHSCOPE_API_KEY;
if (!apiKey) {
  console.error("Missing DASHSCOPE_API_KEY");
  process.exit(1);
}

const CREATE_URL =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis";
const TASK_BASE = "https://dashscope.aliyuncs.com/api/v1/tasks";

const base64 = `data:image/png;base64,${readFileSync(abs).toString("base64")}`;

const PROMPT = [
  "基于图1，生成让人耳目一新的工位桌面改造——同一场景，桌面物件大幅美化。",
  "绝对不能改：桌板颜色材质、白色文件柜、隔断墙。",
  "可大胆改造：杂物收入统一色系收纳盒，加暖光台灯、北欧绿植、桌垫、木质托盘摆件，",
  "换简约设计水杯笔筒，线缆隐藏，白+木+绿配色，真实照片，改造前后对比强烈。",
].join("");

const CASES = [
  {
    id: "wanx21-edit-042",
    body: {
      model: "wanx2.1-imageedit",
      input: {
        function: "description_edit",
        prompt: PROMPT,
        base_image_url: base64,
      },
      parameters: { n: 1, strength: 0.42, watermark: false },
    },
  },
  {
    id: "wanx21-edit-052",
    body: {
      model: "wanx2.1-imageedit",
      input: {
        function: "description_edit",
        prompt: PROMPT,
        base_image_url: base64,
      },
      parameters: { n: 1, strength: 0.52, watermark: false },
    },
  },
  {
    id: "wan25-i2i",
    body: {
      model: "wan2.5-i2i-preview",
      input: {
        prompt: PROMPT,
        images: [base64],
      },
      parameters: { n: 1, prompt_extend: true, watermark: false },
    },
  },
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function pollTask(taskId) {
  for (let i = 0; i < 45; i++) {
    await sleep(2000);
    const res = await fetch(`${TASK_BASE}/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    const status = data.output?.task_status;
    if (status === "SUCCEEDED") return data.output?.results?.[0]?.url ?? null;
    if (status === "FAILED" || status === "CANCELED") {
      console.error("Task failed:", data);
      return null;
    }
  }
  return null;
}

async function runCase(testCase) {
  console.log(`\n=== ${testCase.id} ===`);
  const createRes = await fetch(CREATE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify(testCase.body),
  });
  const text = await createRes.text();
  if (!createRes.ok) {
    console.error("Create failed:", text);
    return { id: testCase.id, ok: false, error: text };
  }
  const data = JSON.parse(text);
  const taskId = data.output?.task_id;
  console.log("task:", taskId);
  const url = await pollTask(taskId);
  return { id: testCase.id, ok: Boolean(url), url };
}

const outDir = resolve("test-fixtures/benchmark");
mkdirSync(outDir, { recursive: true });

const results = [];
for (const c of CASES) {
  const r = await runCase(c);
  results.push(r);
  if (r.url) {
    const imgRes = await fetch(r.url);
    const outPath = resolve(outDir, `${r.id}.png`);
    writeFileSync(outPath, Buffer.from(await imgRes.arrayBuffer()));
    console.log("saved:", outPath);
  }
}

writeFileSync(resolve(outDir, "results.json"), JSON.stringify(results, null, 2));
console.log("\nDone:", results);
