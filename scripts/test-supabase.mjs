import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
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

if (!url || !key) {
  console.error("FAIL: missing Supabase env vars");
  process.exit(1);
}

const res = await fetch(`${url}/rest/v1/desk_reports?select=id&limit=1`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});

if (!res.ok) {
  const text = await res.text();
  if (text.includes("desk_reports") || text.includes("relation") || text.includes("schema cache")) {
    console.log("OK: Supabase connected, but desk_reports table not found");
    console.log("ACTION: Run supabase/schema.sql in SQL Editor");
    process.exit(2);
  }
  console.error("FAIL:", res.status, text);
  process.exit(1);
}

console.log("OK: Supabase connected and desk_reports table exists");
