import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const testTraits = ["测试", "专注", "有秩序感"];

const { data: inserted, error: insertError } = await supabase
  .from("desk_reports")
  .insert({ traits: testTraits, cover_subtitle: "连通性测试" })
  .select("id")
  .single();

if (insertError) {
  console.error("INSERT FAIL:", insertError.message);
  process.exit(1);
}

const { data: rows, error: readError } = await supabase
  .from("desk_reports")
  .select("id, traits");

if (readError) {
  console.error("READ FAIL:", readError.message);
  process.exit(1);
}

await supabase.from("desk_reports").delete().eq("id", inserted.id);

console.log("OK: insert/read/delete all passed");
console.log(`INFO: current total reports = ${rows.length} (including test row before delete)`);
