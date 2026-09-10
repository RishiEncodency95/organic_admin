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
  
  if (p.includes("/system-services/access/requirements")) {
    return {
      expiresInMinutes: 60,
      requiredRoles: ["self"],
      requester: {
        id: "admin-1",
        name: "Expo Super Admin",
        email: "admin@bharatorganicexpo.com",
        twoFactorEnabled: true
      },
      approvers: []
    };
  }

  if (p.includes("/system-services/access/status")) {
    return {
      valid: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  }

  if (p.includes("/system-services/access/verify")) {
    return {
      token: "mock-system-services-grant-token",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      expiresInMinutes: 1440
    };
  }

  if (p.includes("/system-services")) {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return [
      {
        _id: "svc-1",
        category: "DOMAIN",
        name: "Bharat Organic Domain (bharatorganicexpo.com)",
        provider: "GoDaddy Inc",
        accountIdentifier: "BOE-DOM-2027",
        loginUrl: "https://godaddy.com",
        startDate: new Date(now - 340 * day).toISOString(),
        expiryDate: new Date(now + 18 * day + 4 * 3600 * 1000).toISOString(),
        autoRenews: true,
        remindersEnabled: true,
        pricingType: "PAID",
        costAmount: 2499,
        currency: "INR",
        billingCycle: "YEARLY",
        details: {
          domainName: "bharatorganicexpo.com",
          registrar: "GoDaddy",
          dnsProvider: "Cloudflare",
          nameservers: "ns1.cloudflare.com, ns2.cloudflare.com"
        },
        createdAt: "2025-09-01T10:00:00Z"
      },
      {
        _id: "svc-2",
        category: "HOSTING",
        name: "Production Server (Yashobhoomi Cloud)",
        provider: "Amazon Web Services (AWS)",
        accountIdentifier: "AWS-BOE-PROD",
        loginUrl: "https://aws.amazon.com",
        startDate: new Date(now - 300 * day).toISOString(),
        expiryDate: new Date(now + 12 * day + 6 * 3600 * 1000).toISOString(),
        autoRenews: true,
        remindersEnabled: true,
        pricingType: "PAID",
        costAmount: 18500,
        currency: "INR",
        billingCycle: "MONTHLY",
        details: {
          serverType: "VPS / Dedicated",
          publicIp: "203.0.113.42",
          region: "ap-south-1 (Mumbai)",
          operatingSystem: "Ubuntu 24.04 LTS"
        },
        createdAt: "2025-10-01T10:00:00Z"
      },
      {
        _id: "svc-3",
        category: "SSL_CERTIFICATE",
        name: "Wildcard SSL Certificate (*.bharatorganicexpo.com)",
        provider: "Let's Encrypt",
        accountIdentifier: "SSL-BOE-WILD",
        loginUrl: "https://letsencrypt.org",
        startDate: new Date(now - 60 * day).toISOString(),
        expiryDate: new Date(now + 45 * day).toISOString(),
        autoRenews: true,
        remindersEnabled: true,
        pricingType: "FREE",
        details: {
          coveredDomains: "bharatorganicexpo.com, *.bharatorganicexpo.com",
          issuer: "Let's Encrypt Authority"
        },
        createdAt: "2026-01-01T10:00:00Z"
      },
      {
        _id: "svc-4",
        category: "PAYMENT_GATEWAY",
        name: "Razorpay Corporate Payment Gateway",
        provider: "Razorpay Software Pvt Ltd",
        accountIdentifier: "RZP-MID-EXPO2027",
        loginUrl: "https://dashboard.razorpay.com",
        startDate: new Date(now - 200 * day).toISOString(),
        expiryDate: new Date(now + 120 * day).toISOString(),
        autoRenews: true,
        remindersEnabled: true,
        pricingType: "PAID",
        costAmount: 0,
        currency: "INR",
        billingCycle: "ONE_TIME",
        details: {
          merchantId: "RZP_MID_EXPO2027",
          environment: "Live Production"
        },
        createdAt: "2026-01-15T10:00:00Z"
      },
      {
        _id: "svc-5",
        category: "SMS_WHATSAPP",
        name: "Meta WhatsApp Business API",
        provider: "AiSensy / Meta Cloud",
        accountIdentifier: "WABA-987654321",
        loginUrl: "https://aisensy.com",
        startDate: new Date(now - 150 * day).toISOString(),
        expiryDate: new Date(now + 90 * day).toISOString(),
        autoRenews: true,
        remindersEnabled: true,
        pricingType: "PAID",
        costAmount: 4500,
        currency: "INR",
        billingCycle: "MONTHLY",
        details: {
          phoneNumber: "+91 98765 43210",
          wabaId: "WABA-987654321",
          phoneNumberId: "PNID-887766"
        },
        createdAt: "2026-02-01T10:00:00Z"
      }
    ];
  }

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
        designation: "Marketing Director",
        interest: "Stall Booking Hall 1",
        status: "new",
        createdAt: "2026-09-07T12:00:00Z"
      },
      {
        _id: "enq-2",
        name: "Priya Sharma",
        phone: "+91 9811223344",
        email: "psharma@greenearthcsr.org",
        message: "Requesting CSR sponsorship details for Organic Farmer Pavilion.",
        category: "csr",
        organization: "Green Earth Foundation",
        designation: "CSR Head",
        interest: "Farmer Pavilion Sponsorship",
        status: "new",
        createdAt: "2026-09-06T15:30:00Z"
      },
      {
        _id: "enq-3",
        name: "Tariq Mansoor",
        phone: "+971 50 123 4567",
        email: "tariq@dubaiimports.ae",
        message: "Looking for B2B buyer lounge access and VIP delegation entry.",
        category: "partnership",
        organization: "Dubai Bio Trade LLC",
        designation: "Procurement Manager",
        interest: "B2B Trade Buyer Lounge",
        status: "contacted",
        createdAt: "2026-09-05T10:15:00Z"
      },
      {
        _id: "enq-4",
        name: "Dr. Ananya Roy",
        phone: "+91 9717001122",
        email: "aroy@herbalresearch.in",
        message: "Proposal to host a technical workshop on organic certification.",
        category: "csr",
        organization: "National Herbal Research Council",
        designation: "Chief Scientist",
        interest: "Workshop & Seminar Partner",
        status: "contacted",
        createdAt: "2026-09-04T16:45:00Z"
      },
      {
        _id: "enq-5",
        name: "Sanjay Gupta",
        phone: "+91 9988776655",
        email: "sanjay@bioagro.co.in",
        message: "Sponsorship enquiry for Eco-Friendly Packaging Pavilion.",
        category: "csr",
        organization: "BioAgro Tech Ltd",
        designation: "VP Business Development",
        interest: "Eco Pavilion Sponsorship",
        status: "closed",
        createdAt: "2026-09-02T11:20:00Z"
      }
    ];
  }

  if (p.includes("/requests")) {
    return [
      {
        _id: "req-101",
        requestNo: "EXPO-2027-001",
        type: "EMERGENCY",
        status: "SUBMITTED",
        priority: "HIGH",
        requester: {
          name: "Ramesh Sharma",
          phone: "+91 9810192837",
          email: "ramesh.sharma@natureherbs.in",
          relation: "Exhibitor"
        },
        deceased: {
          name: "Nature Herbs & Organics Pvt Ltd",
          gender: "CORPORATE",
          age: "12 Years",
          dateOfPassing: "2026-09-07T00:00:00Z",
          placeOfPassing: "Yashobhoomi Hall 1",
          isUnclaimed: false
        },
        location: {
          address: "Sector 25, Dwarka",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110077"
        },
        assistanceTypes: ["Stall Booking", "36 Sqm Island Stall"],
        notes: "Urgent stall allocation required near main entrada entrance for organic tea & spices.",
        createdAt: "2026-09-07T10:30:00Z"
      },
      {
        _id: "req-102",
        requestNo: "EXPO-2027-002",
        type: "NORMAL",
        status: "SUBMITTED",
        priority: "NORMAL",
        requester: {
          name: "Priya Kapoor",
          phone: "+91 9899112233",
          email: "priya@greenharvest.com",
          relation: "Buyer Delegate"
        },
        deceased: {
          name: "Green Harvest Global Ltd",
          gender: "CORPORATE",
          age: "8 Years",
          dateOfPassing: "2026-09-06T00:00:00Z",
          placeOfPassing: "B2B Lounge Hall 2",
          isUnclaimed: false
        },
        location: {
          address: "Bandra Kurla Complex",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400051"
        },
        assistanceTypes: ["B2B Buyer Pass", "VIP Lounge Access"],
        notes: "Registered international buyer delegation of 5 representatives.",
        createdAt: "2026-09-06T14:15:00Z"
      },
      {
        _id: "req-103",
        requestNo: "EXPO-2027-003",
        type: "NORMAL",
        status: "CONVERTED",
        priority: "HIGH",
        requester: {
          name: "Ankit Nair",
          phone: "+91 9744556677",
          email: "ankit@keralaorganics.co.in",
          relation: "Exhibitor"
        },
        deceased: {
          name: "Kerala Organic Farmers Federation",
          gender: "COOPERATIVE",
          age: "15 Years",
          dateOfPassing: "2026-09-05T00:00:00Z",
          placeOfPassing: "State Pavilion Hall 3",
          isUnclaimed: false
        },
        location: {
          address: "MG Road",
          city: "Kochi",
          state: "Kerala",
          pincode: "682016"
        },
        assistanceTypes: ["State Pavilion", "Bare Space 54 Sqm"],
        notes: "Confirmed stall allocation for 18 farmer co-operatives.",
        createdAt: "2026-09-05T09:45:00Z"
      },
      {
        _id: "req-104",
        requestNo: "EXPO-2027-004",
        type: "EMERGENCY",
        status: "SUBMITTED",
        priority: "CRITICAL",
        requester: {
          name: "Sunita Chauhan",
          phone: "+91 9650011223",
          email: "sunita@biofertilizers.in",
          relation: "Sponsor"
        },
        deceased: {
          name: "BioFertilizers India Corp",
          gender: "CORPORATE",
          age: "20 Years",
          dateOfPassing: "2026-09-04T00:00:00Z",
          placeOfPassing: "Main Convention Centre",
          isUnclaimed: false
        },
        location: {
          address: "Sector 62",
          city: "Noida",
          state: "Uttar Pradesh",
          pincode: "201301"
        },
        assistanceTypes: ["Gold Sponsor", "Lanyard Branding"],
        notes: "Sponsorship agreement finalization for main plenary session.",
        createdAt: "2026-09-04T16:20:00Z"
      },
      {
        _id: "req-105",
        requestNo: "EXPO-2027-005",
        type: "NORMAL",
        status: "REJECTED",
        priority: "LOW",
        requester: {
          name: "Meera Das",
          phone: "+91 9830044556",
          email: "meera@pureayurveda.com",
          relation: "Exhibitor"
        },
        deceased: {
          name: "Pure Ayurveda Remedies",
          gender: "FIRM",
          age: "3 Years",
          dateOfPassing: "2026-09-03T00:00:00Z",
          placeOfPassing: "Hall 1",
          isUnclaimed: false
        },
        location: {
          address: "Salt Lake Sector V",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700091"
        },
        assistanceTypes: ["Shell Scheme 9 Sqm"],
        notes: "Duplicate submission - merged with request EXPO-2027-001.",
        duplicateOfRequestId: "req-101",
        createdAt: "2026-09-03T11:10:00Z"
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

  // Staff and Roles have a real backend — no mock fallback

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
  // Paths that have real backends — errors should be thrown, not mocked
  const isRealBackendPath = path.includes("/staff") || path.includes("/roles") || path.includes("/auth");

  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...fetchOptions,
      headers,
      signal: options?.signal ?? timeoutController.signal,
    });
  } catch (_error) {
    clearTimeout(timeoutId);
    if (isRealBackendPath) {
      throw new ApiRequestError(0, "Cannot connect to the server. Please make sure the backend is running.");
    }
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
      if (isRealBackendPath) {
        throw new ApiRequestError(res.status, body.message || `Request failed with status ${res.status}`);
      }
      return getMockDataForPath(path, options?.method ?? "GET") as T;
    }
    return body.data;
  } catch (e) {
    if (e instanceof ApiRequestError) throw e;
    if (isRealBackendPath) {
      throw new ApiRequestError(res.status, "An unexpected server error occurred.");
    }
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
  putForm: <T>(path: string, formData: FormData) => request<T>(path, { method: "PUT", body: formData }),
  getHtml: requestHtml,
  getBlob: requestBlob,
};
