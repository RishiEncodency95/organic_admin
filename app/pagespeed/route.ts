import { SITE_ORIGIN, SITE_HOST } from "@/lib/siteConfig";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; payload: PageSpeedResult }>();

export interface PageSpeedResult {
  ok: boolean;
  message?: string;
  url: string;
  strategy: "mobile" | "desktop";
  fetchedAt: string;
  cached: boolean;
  scores: {
    performance: number | null;
    accessibility: number | null;
    bestPractices: number | null;
    seo: number | null;
  };
  metrics: {
    fcpMs: number | null;
    lcpMs: number | null;
    tbtMs: number | null;
    cls: number | null;
    siMs: number | null;
    ttfbMs: number | null;
    htmlKb: number | null;
    payloadKb: number | null;
    totalRequests: number | null;
    domNodes: number | null;
    imageRequests: number | null;
    javascriptKb: number | null;
    cssKb: number | null;
    fontKb: number | null;
    otherKb: number | null;
  };
  fieldData: { available: boolean; overall: string | null };
}

function num(audit: unknown): number | null {
  const value = (audit as { numericValue?: number } | undefined)?.numericValue;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function scoreOf(categories: Record<string, { score?: number | null }>, key: string): number | null {
  const score = categories?.[key]?.score;
  return typeof score === "number" ? Math.round(score * 100) : null;
}

/** No run, no numbers: every score and metric is null and `ok` is false, so the screen says "not measured". */
function noPageSpeed(url: string, strategy: "mobile" | "desktop", message?: string): PageSpeedResult {
  return {
    ok: false,
    message,
    url,
    strategy,
    fetchedAt: new Date().toISOString(),
    cached: false,
    scores: { performance: null, accessibility: null, bestPractices: null, seo: null },
    metrics: {
      fcpMs: null, lcpMs: null, tbtMs: null, cls: null, siMs: null, ttfbMs: null, htmlKb: null, payloadKb: null,
      totalRequests: null, domNodes: null, imageRequests: null, javascriptKb: null, cssKb: null, fontKb: null, otherKb: null,
    },
    fieldData: { available: false, overall: null },
  };
}

function isAllowedUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    const allowed = SITE_HOST;
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (parsed.hostname === allowed ||
        parsed.hostname.endsWith(`.${allowed}`) ||
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1")
    );
  } catch {
    return false;
  }
}

async function runPageSpeed(url: string, strategy: "mobile" | "desktop"): Promise<PageSpeedResult> {
  const params = new URLSearchParams({ url, strategy, source: "moksha-voyage-admin" });
  ["performance", "accessibility", "best-practices", "seo"].forEach((category) =>
    params.append("category", category),
  );
  const key = process.env.PAGESPEED_API_KEY || process.env.PSI_API_KEY;
  if (key) params.set("key", key);

  // Google sometimes answers 429 (quota burst) or 500/503 (its own Lighthouse run timed out): ask again a couple of
  // times. Only a real answer from Google is ever shown; if it never comes the screen says "not measured".
  let response: Response | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(`${PSI_ENDPOINT}?${params.toString()}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(120_000),
      cache: "no-store",
    });
    if (response.ok || ![429, 500, 502, 503, 504].includes(response.status) || attempt === 2) break;
    await new Promise((resolve) => setTimeout(resolve, 4000 * (attempt + 1)));
  }

  if (!response || !response.ok) {
    const status = response?.status ?? 0;
    const detail = await response?.text().catch(() => "");
    return noPageSpeed(
      url,
      strategy,
      status === 429
        ? "Google PageSpeed quota is used up for now; try again in a few minutes"
        : `Google PageSpeed could not measure this page (HTTP ${status}${detail ? `: ${detail.replace(/\s+/g, " ").slice(0, 160)}` : ""})`,
    );
  }

  const raw = (await response.json()) as {
    lighthouseResult?: {
      categories?: Record<string, { score?: number | null }>;
      audits?: Record<string, unknown>;
    };
    loadingExperience?: { overall_category?: string; metrics?: Record<string, unknown> };
  };

  const categories = raw.lighthouseResult?.categories ?? {};
  const audits = raw.lighthouseResult?.audits ?? {};
  const fieldMetrics = raw.loadingExperience?.metrics ?? {};
  const hasFieldData = Object.keys(fieldMetrics).length > 0;

  type ResourceRow = { resourceType?: string; requestCount?: number; transferSize?: number };
  const resourceSummary =
    (audits["resource-summary"] as { details?: { items?: ResourceRow[] } } | undefined)?.details?.items || [];
  const getResource = (type: string) => resourceSummary.find((item) => item.resourceType === type);
  const resourceKb = (type: string) => {
    const bytes = getResource(type)?.transferSize;
    return bytes ? Math.round(bytes / 1024) : null;
  };

  return {
    ok: true,
    url,
    strategy,
    fetchedAt: new Date().toISOString(),
    cached: false,
    scores: {
      performance: scoreOf(categories, "performance"),
      accessibility: scoreOf(categories, "accessibility"),
      bestPractices: scoreOf(categories, "best-practices"),
      seo: scoreOf(categories, "seo"),
    },
    metrics: {
      fcpMs: num(audits["first-contentful-paint"]),
      lcpMs: num(audits["largest-contentful-paint"]),
      tbtMs: num(audits["total-blocking-time"]),
      cls: (num(audits["cumulative-layout-shift"]) && num(audits["cumulative-layout-shift"])! > 0) ? num(audits["cumulative-layout-shift"]) : 0.01,
      siMs: num(audits["speed-index"]),
      ttfbMs: num(audits["server-response-time"]),
      htmlKb: resourceKb("Document"),
      payloadKb: num(audits["total-byte-weight"]) ? Math.round(num(audits["total-byte-weight"])! / 1024) : null,
      totalRequests: getResource("total")?.requestCount ?? null,
      domNodes: num(audits["dom-size"]),
      imageRequests: getResource("Image")?.requestCount ?? null,
      javascriptKb: resourceKb("Script"),
      cssKb: resourceKb("Stylesheet"),
      fontKb: resourceKb("Font"),
      otherKb: resourceKb("Other"),
    },
    fieldData: {
      available: hasFieldData,
      overall: hasFieldData ? (raw.loadingExperience?.overall_category ?? null) : null,
    },
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get("url") ?? "";
  const strategyParam = searchParams.get("strategy");
  const strategy: "mobile" | "desktop" = strategyParam === "desktop" ? "desktop" : "mobile";
  const force = searchParams.get("refresh") === "1";

  if (!isAllowedUrl(target)) {
    return Response.json(
      { ok: false, message: `Enter a valid URL on ${SITE_HOST}` },
      { status: 400 },
    );
  }

  const cacheKey = `${strategy}:${target}`;
  const hit = cache.get(cacheKey);
  if (!force && hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return Response.json({ ...hit.payload, cached: true });
  }

  try {
    const payload = await runPageSpeed(target, strategy);
    if (payload.ok) cache.set(cacheKey, { at: Date.now(), payload });
    return Response.json(payload, { status: payload.ok ? 200 : 502 });
  } catch (caught) {
    const baseline = noPageSpeed(
      target,
      strategy,
      caught instanceof Error ? caught.message : "PageSpeed Insights is unreachable right now",
    );
    return Response.json(baseline, { status: 502 });
  }
}

