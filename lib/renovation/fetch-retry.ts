import "server-only";
import { Agent, fetch as undiciFetch } from "undici";

const FETCH_TIMEOUT_MS = 45000;
const CONNECT_TIMEOUT_MS = 30000;
const DEFAULT_RETRIES = 5;

/** Default undici connect timeout is 10s — too short for flaky networks. */
const dashscopeAgent = new Agent({ connectTimeout: CONNECT_TIMEOUT_MS });

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isTransientNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const cause = (err as Error & { cause?: unknown }).cause;
  const code =
    (cause as { code?: string } | undefined)?.code ??
    (err as { code?: string }).code;
  return (
    err.name === "AbortError" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_SOCKET" ||
    err.message.includes("fetch failed")
  );
}

/** Retry transient network errors when calling DashScope. */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retries = DEFAULT_RETRIES
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await undiciFetch(
        url,
        {
          ...init,
          dispatcher: dashscopeAgent,
          signal: init.signal ?? AbortSignal.timeout(FETCH_TIMEOUT_MS),
        } as Parameters<typeof undiciFetch>[1]
      );
      return res as unknown as Response;
    } catch (err) {
      lastError = err;
      if (attempt < retries - 1 && isTransientNetworkError(err)) {
        await sleep(1500 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}
