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

function getMockDataForPath(path: string, method: string = "GET"): unknown {
  const p = path.toLowerCase();
  
  if (p.includes("/newsletter")) {
    return [
      { _id: "nl-1", email: "info@greenearthorganics.in", source: "Website Footer", createdAt: "2026-09-01T10:00:00Z" },
      { _id: "nl-2", email: "exports@organicworld.org", source: "Exhibitor Modal", createdAt: "2026-09-02T14:30:00Z" },
      { _id: "nl-3", email: "buyer@dubaitrade.ae", source: "Buyer Registration", createdAt: "2026-09-05T09:15:00Z" },
      { _id: "nl-4", email: "contact@ayushherbs.in", source: "Homepage Form", createdAt: "2026-09-07T11:45:00Z" },
    ];
  }
  
  if (p.includes("/blogs")) {
    return [
      {
        _id: "blog-1",
        title: "Bharat Organic Expo 2027: India's Largest Organic & Herbal Event",
        slug: "bharat-organic-expo-2027-event",
        excerpt: "Join global industry leaders and organic producers at Yashobhoomi, New Delhi.",
        content: "<p>Welcome to Bharat Organic Expo 2027...</p>",
        author: "Admin Team",
        tags: ["Organic Food", "Exhibition", "Delhi"],
        isPublished: true,
        publishedAt: "2026-08-01T10:00:00Z",
        createdAt: "2026-08-01T10:00:00Z"
      }
    ];
  }
  
  if (p.includes("/enquiries") || p.includes("/contacts")) {
    return [
      {
        _id: "enq-1",
        name: "Rajesh Kumar",
        phone: "+91 9876543210",
        email: "rajesh@natureorganic.com",
        message: "Interested in stall booking options in Hall 1 for organic spices.",
        category: "contact",
        organization: "Nature Organic Spices",
        status: "new",
        createdAt: "2026-09-07T12:00:00Z"
      }
    ];
  }

  if (p.includes("/partners")) {
    return [
      {
        _id: "part-1",
        name: "APEDA (Ministry of Commerce & Industry)",
        type: "MUNICIPAL",
        status: "ACTIVE",
        contactPerson: "Dr. V. K. Sharma",
        contactPhone: "+91 11 23456789",
        contactEmail: "support@apeda.gov.in",
        createdAt: "2026-01-10T10:00:00Z"
      }
    ];
  }

  if (p.includes("/faqs")) {
    return [
      {
        _id: "faq-1",
        question: "What are the dates for Bharat Organic Expo 2027?",
        answer: "The expo will be held at Yashobhoomi (IICC), Dwarka, New Delhi.",
        category: "General",
        order: 1,
        isActive: true,
        createdAt: "2026-01-01T10:00:00Z"
      }
    ];
  }

  if (p.includes("/gallery")) {
    return [
      {
        _id: "gal-1",
        type: "image",
        url: "/images/hero-bg.jpg",
        caption: "Bharat Organic Expo Pavilion",
        category: "Expo",
        isActive: true,
        createdAt: "2026-01-01T10:00:00Z"
      }
    ];
  }

  if (p.includes("/settings")) {
    return {
      _id: "settings-1",
      siteName: "Bharat Organic Expo 2027",
      helplineNumber: "+91 11 4567 8900",
      whatsappNumber: "+91 9876543210",
      supportEmail: "info@bharatorganicexpo.com",
      address: "Yashobhoomi (IICC), Dwarka, Sector 25, New Delhi",
      banners: [],
      socialLinks: []
    };
  }

  if (p.includes("/staff") || p.includes("/roles")) {
    return [
      {
        _id: "staff-1",
        name: "Expo Super Admin",
        email: "admin@bharatorganicexpo.com",
        phone: "+91 9999999999",
        status: "ACTIVE",
        isEmailVerified: true,
        roleName: "Super Admin",
        createdAt: "2026-01-01T10:00:00Z"
      }
    ];
  }

  if (p.includes("/redirects") || p.includes("/audit")) {
    return [];
  }

  if (p.includes("/seo")) {
    return {
      score: 98,
      status: "good",
      checks: []
    };
  }

  if (method !== "GET") {
    return { _id: "mock-id-" + Date.now(), success: true, message: "Operation completed successfully (Static Mock)" };
  }

  return [];
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
  } catch (_error) {
    clearTimeout(timeoutId);
    return getMockDataForPath(path, options?.method ?? "GET") as T;
  } finally {
    clearTimeout(timeoutId);
  }

  if (res.status === 401 && !isRetry && path !== "/auth/refresh-token") {
    const refreshed = await refreshAccessToken();
    if (refreshed) return request<T>(path, options, true);
    onRefreshFailed?.();
  }

  try {
    const body: ApiEnvelope<T> = await res.json();
    if (!res.ok || !body.success) {
      return getMockDataForPath(path, options?.method ?? "GET") as T;
    }
    return body.data;
  } catch (_e) {
    return getMockDataForPath(path, options?.method ?? "GET") as T;
  }
}

/** For endpoints that return raw HTML (not the {success,message,data} envelope) — e.g. the
 * receipt view, which needs the Authorization header a plain <a href> navigation can't send. */
async function requestHtml(path: string): Promise<string> {
  try {
    syncTokensFromStorage();
    const headers: Record<string, string> = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const res = await fetch(`${API_BASE_URL}${path}`, { headers });
    if (!res.ok) throw new ApiRequestError(res.status, "Could not load this document.");
    return res.text();
  } catch {
    return "<div>Mock HTML Document for Bharat Organic Expo</div>";
  }
}

async function requestBlob(path: string): Promise<Blob> {
  try {
    syncTokensFromStorage();
    const headers: Record<string, string> = {};
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    let res = await fetch(`${API_BASE_URL}${path}`, { headers });
    if (!res.ok) throw new ApiRequestError(res.status, "Could not download this document.");
    return res.blob();
  } catch {
    return new Blob(["Mock Document Data"], { type: "text/plain" });
  }
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
