const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";
const REQUEST_TIMEOUT_MS = 10_000;
const GET_CACHE_TTL_MS = 2_000;
const getInFlight = new Map<string, Promise<unknown>>();
const getCache = new Map<string, { expiresAt: number; value: unknown }>();

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}
let accessToken: string | null = null;
let refreshToken: string | null = null;
let onTokensRefreshed: ((tokens: { accessToken: string; refreshToken: string }) => void) | null = null;
let onRefreshFailed: (() => void) | null = null;
const AUTH_STORAGE_KEY = "ms_admin_auth";

function syncTokensFromStorage(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    const stored = JSON.parse(raw) as { accessToken?: string; refreshToken?: string };
    if (!accessToken && stored.accessToken) accessToken = stored.accessToken;
    if (!refreshToken && stored.refreshToken) refreshToken = stored.refreshToken;
  } catch {
    // A malformed persisted session is handled by StoreProvider/logout; requests simply proceed
    // without a token and receive the normal 401 response.
  }
}

export function setTokens(tokens: { accessToken: string | null; refreshToken: string | null }): void {
  accessToken = tokens.accessToken;
  refreshToken = tokens.refreshToken;
}

export function setTokenRefreshHandlers(handlers: {
  onRefreshed: (tokens: { accessToken: string; refreshToken: string }) => void;
  onFailed: () => void;
}): void {
  onTokensRefreshed = handlers.onRefreshed;
  onRefreshFailed = handlers.onFailed;
}
let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  syncTokensFromStorage();
  if (!refreshToken) return false;
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      const body: ApiEnvelope<{ accessToken: string; refreshToken: string }> = await res.json();
      if (!res.ok || !body.success) return false;

      setTokens(body.data);
      onTokensRefreshed?.(body.data);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

async function request<T>(path: string, options?: ApiRequestOptions, isRetry = false): Promise<T> {
  syncTokensFromStorage();
  const isFormData = options?.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options?.headers as Record<string, string> | undefined),
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (typeof window !== "undefined" && (path.startsWith("/system-services/admin") || path === "/system-services/access/status")) {
    const grant = window.sessionStorage.getItem("moksha_system_services_grant");
    if (grant) headers["X-System-Services-Grant"] = grant;
  }

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), options?.timeoutMs ?? REQUEST_TIMEOUT_MS);
  const { timeoutMs: _timeoutMs, ...fetchOptions } = options ?? {};
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: options?.signal ?? timeoutController.signal,
    });
  } catch (error) {
    if (timeoutController.signal.aborted) {
      throw new ApiRequestError(408, "The server took too long to respond. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 401 && !isRetry && path !== "/auth/refresh-token") {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, true);
    onRefreshFailed?.();
  }

  const body: ApiEnvelope<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new ApiRequestError(res.status, body.message || "Something went wrong. Please try again.");
  }

  return body.data;
}

/** For endpoints that return raw HTML (not the {success,message,data} envelope) — e.g. the
 * receipt view, which needs the Authorization header a plain <a href> navigation can't send. */
async function requestHtml(path: string): Promise<string> {
  syncTokensFromStorage();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!res.ok) throw new ApiRequestError(res.status, "Could not load this document.");
  return res.text();
}

async function requestBlob(path: string): Promise<Blob> {
  syncTokensFromStorage();
  const headers: Record<string, string> = {};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  let res = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      const retryHeaders: Record<string, string> = {};
      if (accessToken) retryHeaders.Authorization = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE_URL}${path}`, { headers: retryHeaders });
    }
  }
  if (!res.ok) throw new ApiRequestError(res.status, "Could not download this document.");
  return res.blob();
}

export const api = {
  get: <T>(path: string): Promise<T> => {
    const cached = getCache.get(path);
    if (cached && cached.expiresAt > Date.now()) return Promise.resolve(cached.value as T);
    if (cached) getCache.delete(path);

    const pending = getInFlight.get(path);
    if (pending) return pending as Promise<T>;

    const next = request<T>(path)
      .then((value) => {
        getCache.set(path, { value, expiresAt: Date.now() + GET_CACHE_TTL_MS });
        return value;
      })
      .finally(() => getInFlight.delete(path));
    getInFlight.set(path, next);
    return next;
  },
  post: <T>(path: string, payload?: unknown, options?: Pick<ApiRequestOptions, "timeoutMs">) =>
    request<T>(path, {
      method: "POST",
      body: payload !== undefined ? JSON.stringify(payload) : undefined,
      ...options,
    }),
  put: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: "PUT", body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  patch: <T>(path: string, payload?: unknown) =>
    request<T>(path, { method: "PATCH", body: payload !== undefined ? JSON.stringify(payload) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) => request<T>(path, { method: "POST", body: formData }),
  getHtml: requestHtml,
  getBlob: requestBlob,
};
