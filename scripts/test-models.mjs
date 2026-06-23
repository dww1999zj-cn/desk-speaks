import fs from "fs";

const envContent = fs.readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "");
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  process.env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
}

const API =
  "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const apiKey = process.env.DASHSCOPE_API_KEY;
const promptsSrc = fs.readFileSync("lib/prompts.ts", "utf8");
const systemPrompt = promptsSrc.match(
  /export const SYSTEM_PROMPT = `([\s\S]*?)`;/
)?.[1];

if (!systemPrompt || !apiKey) {
  console.error("Missing SYSTEM_PROMPT or DASHSCOPE_API_KEY");
  process.exit(1);
}

async function fetchImage() {
  const res = await fetch(
    "https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=640&q=60"
  );
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.toString("base64");
}

async function callModel(model, base64) {
  const t0 = Date.now();
  const res = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
            {
              type: "text",
              text: "观察工位照片，以工位第一人称生成 JSON。guessedAge 是猜主人年龄（XX岁），不是工位年龄。",
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.75,
    }),
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const text = await res.text();
  if (!res.ok) {
    return { model, ok: false, elapsed, error: text.slice(0, 200) };
  }
  const data = JSON.parse(text);
  const content = data.choices?.[0]?.message?.content || "";
  const finishReason = data.choices?.[0]?.finish_reason;
  let parsed = null;
  const tryParse = (raw) => {
    const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
    const fixed = cleaned.replace(/,\s*([}\]])/g, "$1");
    for (const s of [cleaned, fixed]) {
      try {
        return JSON.parse(s);
      } catch {
        const match = s.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            return JSON.parse(match[0].replace(/,\s*([}\]])/g, "$1"));
          } catch {
            /* ignore */
          }
        }
      }
    }
    return null;
  };
  parsed = tryParse(content);
  return {
    model,
    ok: !!parsed,
    elapsed,
    finishReason,
    contentLength: content.length,
    guessedAge: parsed?.intro?.guessedAge,
    mbti: parsed?.mbtiDesk?.type,
    error: parsed ? null : content.slice(0, 120),
  };
}

async function testApiRoute(base64) {
  const t0 = Date.now();
  const res = await fetch("http://localhost:3001/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: `data:image/jpeg;base64,${base64}` }),
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const data = await res.json();
  return {
    label: "/api/analyze (primary -> plus fallback)",
    ok: res.ok && !!data.report,
    elapsed,
    guessedAge: data.report?.intro?.guessedAge,
    mbti: data.report?.mbtiDesk?.type,
    error: data.error,
  };
}

console.log("QWEN_VL_MODEL =", process.env.QWEN_VL_MODEL);
console.log("---");
const base64 = await fetchImage();
console.log("Test image: ~44KB desk photo\n");

const modelsToTest = [
  process.env.QWEN_VL_MODEL ?? "qwen3-vl-flash",
  "qwen-vl-plus",
].filter((m, i, arr) => arr.indexOf(m) === i);

for (const model of modelsToTest) {
  const r = await callModel(model, base64);
  console.log(`[${model}]`);
  console.log(`  status: ${r.ok ? "OK" : "FAIL"} | time: ${r.elapsed}s`);
  if (r.ok) console.log(`  age: ${r.guessedAge} | mbti: ${r.mbti}`);
  else
    console.log(
      `  error: ${r.error} | finish: ${r.finishReason} | len: ${r.contentLength}`
    );
  console.log("");
}

const api = await testApiRoute(base64);
console.log(`[${api.label}]`);
console.log(`  status: ${api.ok ? "OK" : "FAIL"} | time: ${api.elapsed}s`);
if (api.ok) console.log(`  age: ${api.guessedAge} | mbti: ${api.mbti}`);
else console.log(`  error: ${api.error}`);
