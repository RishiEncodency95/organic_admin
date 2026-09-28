/**
 * Third-party domain snapshots that are pasted in by hand — we have no live
 * API connection to these tools yet, so the capture date travels with every
 * number. Nothing here is generated.
 */

export const SEMRUSH_SNAPSHOT = {
  provider: "Semrush",
  report: "Domain Overview",
  domain: "bharatorganicexpo.com",
  capturedAt: "2026-09-25",
  authorityScore: 2,
  authorityNote: "Lacks organic traffic",
  organicTraffic: 0,
  paidTraffic: 0,
  referringDomains: 125,
  backlinks: 254,
  organicKeywords: 2,
  organicKeywordsChange: "+100%",
  paidKeywords: 0,
} as const;

export const SEMRUSH_AI_VISIBILITY = {
  mentions: 0,
  citedPages: 0,
  engines: [
    { key: "chatgpt", label: "ChatGPT", mentions: 0, citedPages: 0 },
    { key: "ai-overview", label: "AI Overview", mentions: 0, citedPages: 0 },
    { key: "ai-mode", label: "AI Mode", mentions: 0, citedPages: 0 },
    { key: "gemini", label: "Gemini", mentions: 0, citedPages: 0 },
  ],
} as const;
