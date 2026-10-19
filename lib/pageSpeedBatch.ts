"use client";

import { seoAuditApi, type PageSpeedAudit } from "./seoAuditApi";

const STORAGE_KEY = "bharatOrganic.pageSpeed.v1";
const TTL_MS = 6 * 60 * 60 * 1000;

const memory = new Map<string, PageSpeedAudit>();
let storageLoaded = false;
let running = false;

function loadStorage(): void {
  if (storageLoaded || typeof window === "undefined") return;
  storageLoaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as { savedAt?: number; items?: Record<string, PageSpeedAudit> };
    if (!parsed.savedAt || !parsed.items) return;
    if (Date.now() - parsed.savedAt > TTL_MS) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    Object.entries(parsed.items).forEach(([url, audit]) => memory.set(url, audit));
  } catch {
    // corrupt cache: ignore, we will simply refetch
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    const items: Record<string, PageSpeedAudit> = {};
    memory.forEach((value, key) => {
      items[key] = value;
    });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), items }));
  } catch {
    // quota exceeded: in-memory copy still works for this session
  }
}

/**
 * Returns a REAL cached PageSpeed Insights run for the URL, or null when no
 * real run has happened yet. This module never synthesises scores — if no
 * measurement exists the caller must show an explicit "not run" state.
 */
export function getSavedPageSpeed(url: string): PageSpeedAudit | null {
  loadStorage();
  return memory.get(url) ?? null;
}

export function getSavedPageSpeedMap(): Map<string, PageSpeedAudit> {
  loadStorage();
  return new Map(memory);
}

export function savePageSpeed(url: string, audit: PageSpeedAudit): void {
  memory.set(url, audit);
  persist();
}

export function isPageSpeedRunActive(): boolean {
  return running;
}

export interface PageSpeedBatchItem {
  url: string;
}

export interface PageSpeedBatchProgress {
  done: number;
  total: number;
  remaining: number;
  currentUrl: string | null;
  error: string | null;
}

/**
 * Runs REAL Google PageSpeed Insights audits one URL at a time through the
 * `/pagespeed` API route and caches only successful runs. Failures are
 * reported in progress state but never written as fabricated successes.
 */
export async function runPageSpeedBatch(
  items: PageSpeedBatchItem[],
  onProgress: (progress: PageSpeedBatchProgress) => void,
  strategy: "mobile" | "desktop" = "mobile",
  refresh = false,
): Promise<PageSpeedAudit[]> {
  if (running) return [];
  running = true;

  const results: PageSpeedAudit[] = [];
  try {
    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];
      onProgress({
        done: index,
        total: items.length,
        remaining: items.length - index,
        currentUrl: item.url,
        error: null,
      });

      try {
        const audit = await seoAuditApi.pagespeed(item.url, strategy, refresh);
        if (audit && audit.ok) {
          memory.set(item.url, audit);
          persist();
          results.push(audit);
        } else {
          onProgress({
            done: index,
            total: items.length,
            remaining: items.length - index,
            currentUrl: item.url,
            error: (audit && audit.message) || "PageSpeed Insights returned no data",
          });
        }
      } catch (caught) {
        onProgress({
          done: index,
          total: items.length,
          remaining: items.length - index,
          currentUrl: item.url,
          error: caught instanceof Error ? caught.message : "PageSpeed fetch failed",
        });
      }
    }

    onProgress({ done: items.length, total: items.length, remaining: 0, currentUrl: null, error: null });
    return results;
  } finally {
    running = false;
  }
}
