import { getApiBaseUrl } from "@/lib/api";

/**
 * Where the Infrastructure API lives: `<admin API base>/v1` (exactly one /v1), e.g. http://localhost:4001/api/v1. A getter, because the
 * base depends on the browser's hostname and is only meaningful on the client.
 */
export const env = {
  get apiBaseUrl(): string {
    // NEXT_PUBLIC_API_URL may or may not already end in /v1 (".../api" or ".../api/v1"): normalise to exactly one.
    return `${getApiBaseUrl().replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`;
  },
} as const;
