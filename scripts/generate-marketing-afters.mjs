#!/usr/bin/env node
/**
 * Generate homepage "after" variants via Wan i2i.
 *
 * Usage:
 *   node scripts/generate-marketing-afters.mjs              # v1–v4 from before
 *   node scripts/generate-marketing-afters.mjs --from v4    # v5–v8 polish v4 + decor
 *   node scripts/generate-marketing-afters.mjs --from v7    # v10+ desk mat on v7
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const BEFORE = resolve(ROOT, "public/marketing/desk-showcase-before.png");
const V4 = resolve(ROOT, "public/marketing/desk-showcase-after-v4.png");
const V7 = resolve(ROOT, "public/marketing/desk-showcase-after-v7.png");
const OUT_DIR = resolve(ROOT, "public/marketing");

const LOCK =
  "【固定不变·与图1完全一致】保持原图桌子形状、桌面颜色材质、文件柜、隔断墙、显示器位置不变，禁止换桌换柜改色改形。";

const BASE =
  "基于图1同机位，仅整理可移动小物件。键盘鼠标前方必须留白可办公。全桌氛围点缀仅1件，切忌满桌摆件。真实可办公照片。";

const V4_LOCK =
  "【固定不变·与图1完全一致】保持图1已有的整洁收纳布局、奶油白文件盒、显示器键盘位置、桌面材质颜色、Cubicle背景不变，禁止改桌换柜。";

const V4_BASE =
  "在图1已整理好的工位基础上微调。键盘区必须留白可办公。全桌新增或替换的氛围点缀合计仅1件，切忌满桌摆件。明亮INS风，真实照片。";

const VARIANTS = {
  v1: {
    file: "desk-showcase-after-v1.png",
    prompt:
      LOCK +
      BASE +
      "把所有散落的笔、纸张、纸巾、杯子、数据线全部收进白色收纳盒和笔筒，数据线收进黑色理线盒贴桌沿，桌面除收纳容器外零散落物，左后角一盆小绿植。",
  },
  v2: {
    file: "desk-showcase-after-v2.png",
    prompt:
      LOCK +
      BASE +
      "桌面所有杂物100%收入白色托盘和文件架，线缆完全隐藏，正前方工作区大面积留白，右后角一盏暖白台灯，桌面明显比原图整洁很多。",
  },
  v3: {
    file: "desk-showcase-after-v3.png",
    prompt:
      LOCK +
      BASE +
      "强力收纳：文件叠放整齐入右侧文件架，文具入左侧笔筒，杯子移侧方，桌面的散落物全部清空，仅留灰色薄桌垫和左后角小座钟，对比原图变化非常明显。",
  },
  v4: {
    file: "desk-showcase-after-v4.png",
    prompt:
      LOCK +
      BASE +
      "INS风整理：明亮自然光感，杂物全部入奶油白收纳盒，桌面光洁无散落，右后角透明花瓶单支绿植，改造前后对比强烈。",
  },
};

/** v4 基础上加 1 件角位小摆件（替换原花瓶绿植） */
const V4_PLUS_VARIANTS = {
  v5: {
    file: "desk-showcase-after-v5.png",
    prompt:
      V4_LOCK +
      V4_BASE +
      "保留左侧奶油白收纳盒与整洁桌面，去掉原花瓶绿植，右后角增加一盏简约暖白台灯，灯光柔和，工位更有氛围。",
  },
  v6: {
    file: "desk-showcase-after-v6.png",
    prompt:
      V4_LOCK +
      V4_BASE +
      "保留现有收纳与留白，右后角放一个小沙漏摆件（替换原绿植），精致点缀，不占工作区。",
  },
  v7: {
    file: "desk-showcase-after-v7.png",
    prompt:
      V4_LOCK +
      V4_BASE +
      "保留整洁布局，左后角文件盒旁增加一个迷你金属几何摆件（黄铜色小雕塑），仅1件，键盘前方仍留白。",
  },
  v8: {
    file: "desk-showcase-after-v8.png",
    prompt:
      V4_LOCK +
      V4_BASE +
      "保留收纳盒与干净桌面，右后角放一个小型白色香薰机（替换原绿植）， subtle 蒸汽，角位点缀。",
  },
  v9: {
    file: "desk-showcase-after-v9.png",
    prompt:
      V4_LOCK +
      V4_BASE +
      "保留INS整洁风，左后角增加一个原木小相框（仅1件），内为空白或浅灰，不遮挡屏幕，工作区留白。",
  },
};

const V7_LOCK =
  "【固定不变·与图1完全一致】保持图1已有奶油白收纳盒、左后金属几何摆件、右后富贵竹、双屏显示器位置、Cubicle背景、桌面材质不变，禁止改桌换柜。";

/** v7 基础上为键盘鼠标加大号桌垫 */
const V7_PLUS_VARIANTS = {
  v10: {
    file: "desk-showcase-after-v10.png",
    prompt:
      V7_LOCK +
      "在图1基础上，键盘和鼠标下方增加一张大号简约桌垫（浅米色皮革质感、大圆角、覆盖键盘+鼠标区域），键盘鼠标放在垫子上，保留几何摆件与富贵竹，明亮INS风，真实可办公照片。",
  },
  v10b: {
    file: "desk-showcase-after-v10b.png",
    prompt:
      V7_LOCK +
      "在图1基础上，键盘鼠标下方铺一张暖灰褐色毛毡质感大号桌垫（简约无图案、圆角），键盘鼠标置于垫上，保留现有摆件与绿植，质感高级，真实照片。",
  },
  v10c: {
    file: "desk-showcase-after-v10c.png",
    prompt:
      V7_LOCK +
      "在图1基础上，键盘鼠标下方增加浅灰白双色极简大号桌垫（细边线、现代办公风、覆盖键鼠区），保留几何摆件与竹子，桌面更精致，真实照片。",
  },
};

const SOURCE_MODES = {
  before: { path: BEFORE, variants: VARIANTS, label: "from-before" },
  v4: { path: V4, variants: V4_PLUS_VARIANTS, label: "v4-plus" },
  "v4-plus": { path: V4, variants: V4_PLUS_VARIANTS, label: "v4-plus" },
  v7: { path: V7, variants: V7_PLUS_VARIANTS, label: "v7-plus (desk mat)" },
};

function loadEnv() {
  const envPath = resolve(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

async function wanEdit(apiKey, base64, prompt) {
  const CREATE_URL =
    "https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis";
  const TASK_BASE = "https://dashscope.aliyuncs.com/api/v1/tasks";

  const createRes = await fetch(CREATE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-DashScope-Async": "enable",
    },
    body: JSON.stringify({
      model: process.env.WANX_EDIT_MODEL ?? "wan2.5-i2i-preview",
      input: { prompt, images: [base64] },
      parameters: { n: 1, prompt_extend: false, watermark: false },
    }),
  });

  if (!createRes.ok) throw new Error(await createRes.text());
  const taskId = (await createRes.json()).output?.task_id;
  if (!taskId) throw new Error("No task_id");

  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 2500));
    const poll = await fetch(`${TASK_BASE}/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await poll.json();
    const status = data.output?.task_status;
    process.stdout.write(`  poll ${i + 1}: ${status}\n`);
    if (status === "SUCCEEDED") {
      const url = data.output?.results?.[0]?.url;
      if (!url) throw new Error("No result url");
      const imgRes = await fetch(url);
      if (!imgRes.ok) throw new Error("Download failed");
      return Buffer.from(await imgRes.arrayBuffer());
    }
    if (status === "FAILED" || status === "CANCELED") {
      throw new Error(JSON.stringify(data));
    }
  }
  throw new Error("Timed out");
}

loadEnv();
const apiKey = process.env.DASHSCOPE_API_KEY;
if (!apiKey) {
  console.error("Missing DASHSCOPE_API_KEY in .env.local");
  process.exit(1);
}

const fromArg = process.argv.indexOf("--from");
const fromMode = fromArg >= 0 ? process.argv[fromArg + 1] : "before";
const config = SOURCE_MODES[fromMode] ?? SOURCE_MODES.before;
const sourcePath = config.path;
const variantMap = config.variants;

if (!existsSync(sourcePath)) {
  console.error("Missing source image:", sourcePath);
  process.exit(1);
}

const onlyArg = process.argv.indexOf("--only");
const only = onlyArg >= 0 ? process.argv[onlyArg + 1] : null;
const keys = only ? [only] : Object.keys(variantMap);

mkdirSync(OUT_DIR, { recursive: true });
const buf = readFileSync(sourcePath);
const base64 = `data:image/png;base64,${buf.toString("base64")}`;

console.log("Source:", sourcePath);
console.log("Mode:", config.label);
console.log("Generating:", keys.join(", "));

for (const key of keys) {
  const v = variantMap[key];
  if (!v) {
    console.error("Unknown variant:", key);
    continue;
  }
  console.log(`\n=== ${key} → ${v.file} ===`);
  try {
    const out = await wanEdit(apiKey, base64, v.prompt);
    const dest = resolve(OUT_DIR, v.file);
    writeFileSync(dest, out);
    console.log("Saved:", dest);
  } catch (err) {
    console.error(`${key} failed:`, err.message ?? err);
  }
}

console.log("\nDone. Preview in browser, then set MARKETING_DESK_AFTER in lib/marketing-assets.ts");
