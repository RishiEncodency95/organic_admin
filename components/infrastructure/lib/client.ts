import { api, getAccessToken } from "@/lib/api";
import { adminPageHeaders } from "@/lib/adminPage";
import { env } from "./env";
import { ApiError, type ApiErrorCode } from "./errors";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
export interface RequestSpec {
  method: HttpMethod;
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
}

const STATUS_TO_CODE: Record<number, ApiErrorCode> = {
  400: "BAD_REQUEST", 401: "UNAUTHORIZED", 403: "FORBIDDEN", 404: "NOT_FOUND", 409: "CONFLICT", 422: "VALIDATION_FAILED", 429: "RATE_LIMITED", 503: "SERVICE_UNAVAILABLE",
};

function search(query: RequestSpec["query"]): string {
  if (!query) return "";
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  const s = p.toString();
  return s ? `?${s}` : "";
}

/**
 * Infrastructure API transport. Deliberately NOT lib/api's `api` helper: that one substitutes sample data when a call
 * fails, and an infrastructure screen must show an error rather than invented servers or costs.
 * Authentication is the admin's bearer token; on a 401 it asks the shared client to refresh the session once and retries.
 */
async function send(url: string, init: RequestInit, signal?: AbortSignal, retried = false): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  for (const [k, v] of Object.entries(adminPageHeaders())) if (!headers.has(k)) headers.set(k, v);
  let res: Response;
  try {
    res = await fetch(url, { ...init, headers, signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError({ code: "NETWORK_ERROR", message: "Unable to reach the server. Check that the backend is running.", status: 0 });
  }
  if (res.status === 401 && !retried) {
    // lib/api refreshes the access token (and the Redux session) on a 401 of its own call; then we retry once.
    await api.get("/auth/me").catch(() => undefined);
    return send(url, init, signal, true);
  }
  return res;
}

export async function failure(res: Response): Promise<ApiError> {
  const body = (await res.json().catch(() => ({}))) as { message?: string; code?: string; errors?: string[]; [k: string]: unknown };
  const { message, code, statusCode: _s, success: _ok, timestamp: _t, errors: _e, ...rest } = body as Record<string, unknown>;
  void _s; void _ok; void _t; void _e;
  const details: Record<string, unknown> = { ...rest };
  if (typeof code === "string") details.serverCode = code;
  return new ApiError({
    code: STATUS_TO_CODE[res.status] ?? "UNKNOWN",
    message: typeof message === "string" && message ? message : "The request could not be completed.",
    status: res.status,
    details,
  });
}

export const apiClient = {
  async request<T>(spec: RequestSpec): Promise<T> {
    const url = `${env.apiBaseUrl}${spec.path}${search(spec.query)}`;
    const res = await send(url, { method: spec.method, headers: { ...(spec.body !== undefined ? { "Content-Type": "application/json" } : {}), ...spec.headers }, body: spec.body !== undefined ? JSON.stringify(spec.body) : undefined }, spec.signal);
    if (!res.ok) throw await failure(res);
    if (res.status === 204) return undefined as T;
    const raw = await res.text();
    if (!raw.trim()) return null as T;
    const payload = JSON.parse(raw) as { data?: T; success?: boolean } | T;
    return payload && typeof payload === "object" && "data" in (payload as object) && "success" in (payload as object) ? ((payload as { data: T }).data) : (payload as T);
  },
  /** Authenticated download (CSV / PDF): a plain link cannot carry the bearer token. */
  async download(path: string): Promise<Blob> {
    const res = await send(`${env.apiBaseUrl}${path}`, { method: "GET" });
    if (!res.ok) throw await failure(res);
    return res.blob();
  },
};
