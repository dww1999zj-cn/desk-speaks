import "server-only";

const DEFAULT_FETCH_TIMEOUT_MS = 90_000;
const DEFAULT_RETRIES = 5;

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
    err.name === "TimeoutError" ||
    code === "ENOTFOUND" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "UND_ERR_CONNECT_TIMEOUT" ||
    code === "UND_ERR_SOCKET" ||
    err.message.includes("fetch failed") ||
    err.message.includes("aborted due to timeout")
  );
}

export type FetchRetryOptions = {
  retries?: number;
  /** Override AbortSignal.timeout (ms). Default 90s. */
  timeoutMs?: number;
};

/** Retry transient network errors when calling DashScope. Uses global fetch (no undici). */
export async function fetchWithRetry(
  url: string,
  init: RequestInit,
  retriesOrOptions: number | FetchRetryOptions = DEFAULT_RETRIES
): Promise<Response> {
  const options: FetchRetryOptions =
    typeof retriesOrOptions === "number"
      ? { retries: retriesOrOptions }
      : retriesOrOptions;
  const retries = options.retries ?? DEFAULT_RETRIES;
  const timeoutMs = options.timeoutMs ?? DEFAULT_FETCH_TIMEOUT_MS;

  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...init,
        signal: init.signal ?? AbortSignal.timeout(timeoutMs),
      });
      return res;
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
