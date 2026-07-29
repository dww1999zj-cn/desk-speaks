#!/usr/bin/env node
/**
 * Tune Wan image edit locally (two-pass workflow mirrors lib/renovation/image-gen.ts).
 *
 * Usage:
 *   node scripts/test-wan-edit.mjs path/to/desk.jpg
 *   node scripts/test-wan-edit.mjs path/to/desk.jpg --single-pass
 */
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const args = process.argv.slice(2);
const singlePass = args.includes("--single-pass");
const imagePath = args.find((a) => !a.startsWith("--"));

if (!imagePath) {
  console.error("Usage: node scripts/test-wan-edit.mjs <image-path> [--single-pass]");
  process.exit(1);
}

const abs = resolve(imagePath);
if (!existsSync(abs)) {
  console.error("File not found:", abs);
  process.exit(1);
}

function loadEnv() {
  const envPath = resolve(".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnv();
const apiKey = process.env.DASHSCOPE_API_KEY;
if (!apiKey) {
  console.error("Missing DASHSCOPE_API_KEY — run: node --env-file=.env.local scripts/test-wan-edit.mjs <image>");
  process.exit(1);
}

const buf = readFileSync(abs);
let currentImage = `data:image/jpeg;base64,${buf.toString("base64")}`;

// Keep in sync with lib/renovation/image-prompt.ts
const ORGANIZE_PROMPT =
  "【固定不变·与图1完全一致】保持原图桌子形状、桌面颜色材质、文件柜、隔断墙、显示器位置不变，禁止换桌换柜改色改形。" +
  " 基于图1同机位，第一步只做收纳整理，禁止添加任何装饰摆件。键盘鼠标前方必须留白可办公。" +
  " INS风整理：明亮自然光感，杂物全部入奶油白/纯白收纳盒与文件架，桌面光洁无散落，数据线藏进理线盒，改造前后对比强烈。" +
  " 把所有散落的笔、纸张、纸巾、杯子、数据线100%收进收纳盒和笔筒，桌面除收纳容器外零散落物。真实照片。";

const DECOR_PROMPT =
  "【固定不变·与图1完全一致】保持图1已有整洁收纳布局、显示器键盘位置、桌面材质颜色、背景不变，禁止改桌换柜。" +
  " 在图1已整理好的工位基础上微调。键盘区必须留白可办公。全桌新增氛围点缀合计仅1件，切忌满桌摆件。真实照片。" +
  " 键盘鼠标下方增加浅灰白双色极简大号桌垫（细边线、覆盖键鼠区），键鼠置于垫上，保留已有整洁收纳布局。";

const SINGLE_PASS_PROMPT =
  "【固定不变·与图1完全一致】保持原图桌子形状、桌面颜色材质、文件柜、隔断墙、显示器位置不变，禁止换桌换柜改色改形。" +
  " 基于图1同机位，仅整理可移动小物件：杂物收入收纳盒/托盘/笔筒，线缆隐藏。" +
  " 【可工作桌面】键盘鼠标前方必须留白；全桌氛围点缀仅1件；切忌满桌摆件。真实可办公照片。";

const CREATE_URL =
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis";
const TASK_BASE = "https://dashscope.aliyuncs.com/api/v1/tasks";

async function wanEdit(prompt, label) {
  console.log(`\n--- ${label} ---`);
  console.log("Prompt:", prompt.slice(0, 200) + "...");

  const createRes = await fetch(CREATE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({
      model: process.env.WANX_EDIT_MODEL ?? "wan2.5-i2i-preview",
      input: { prompt, images: [currentImage] },
      parameters: { n: 1, prompt_extend: false, watermark: false },
    }),
  });

  if (!createRes.ok) {
    throw new Error(await createRes.text());
  }

  const taskId = (await createRes.json()).output?.task_id;
  console.log("Task:", taskId);

  for (let i = 0; i < 45; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(`${TASK_BASE}/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await poll.json();
    const status = data.output?.task_status;
    console.log("Status:", status);
    if (status === "SUCCEEDED") {
      const url = data.output?.results?.[0]?.url;
      if (!url) throw new Error("No result url");
      const imgRes = await fetch(url);
      if (!imgRes.ok) throw new Error("Download failed");
      const outBuf = Buffer.from(await imgRes.arrayBuffer());
      currentImage = `data:image/jpeg;base64,${outBuf.toString("base64")}`;
      return url;
    }
    if (status === "FAILED" || status === "CANCELED") {
      throw new Error(JSON.stringify(data));
    }
  }
  throw new Error("Timed out");
}

try {
  if (singlePass) {
    const url = await wanEdit(SINGLE_PASS_PROMPT, "single-pass");
    console.log("\nResult URL (24h valid):\n", url);
  } else {
    await wanEdit(ORGANIZE_PROMPT, "pass1-organize");
    const url = await wanEdit(DECOR_PROMPT, "pass2-decor (v10c mat)");
    console.log("\nFinal URL (24h valid):\n", url);
  }
} catch (err) {
  console.error(err);
  process.exit(1);
}
