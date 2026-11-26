"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Undo2,
  Loader2,
  CheckCircle2,
  Clock,
  User,
  Bot,
  Filter,
  Search,
  RefreshCw,
  ImageIcon,
  AlertCircle,
  X,
  Maximize2,
} from "lucide-react";
import { seoAuditApi, type FixLogEntry } from "@/lib/seoAuditApi";
import PaginationBar from "@/components/seo/PaginationBar";

interface ResolvedIssuesHistoryProps {
  /** Changes whenever fixes happen elsewhere on the page, so the history reloads */
  refreshKey: number;
  /** Called after a fix was undone so the issue returns to the active list */
  onUndone: () => void;
}

const STATUS_BADGES: Record<FixLogEntry["status"], { label: string; style: string }> = {
  SUCCESS: { label: "SUCCESS", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  FAILED: { label: "FAILED", style: "bg-rose-50 text-rose-700 border-rose-200" },
  REVERTED: { label: "REVERTED", style: "bg-slate-100 text-slate-600 border-slate-200" },
};

const ISSUE_TYPE_STYLES: Record<string, { label: string; style: string }> = {
  title: { label: "Meta Title", style: "bg-blue-50 text-blue-700 border-blue-200" },
  description: { label: "Meta Description", style: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  image_alt: { label: "Image Alt", style: "bg-purple-50 text-purple-700 border-purple-200" },
  "image alt": { label: "Image Alt", style: "bg-purple-50 text-purple-700 border-purple-200" },
  h1: { label: "H1 Heading", style: "bg-teal-50 text-teal-700 border-teal-200" },
  redirect: { label: "301 Redirect", style: "bg-amber-50 text-amber-700 border-amber-200" },
  canonical: { label: "Canonical URL", style: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  schema: { label: "Schema JSON-LD", style: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  robots: { label: "Robots Tag", style: "bg-slate-100 text-slate-700 border-slate-200" },
  copy_block: { label: "Page text", style: "bg-lime-50 text-lime-800 border-lime-200" },
  og: { label: "Share cards", style: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
};

function parseFixValue(v: unknown): {
  text: string;
  imageSrc?: string;
  alt?: string | null;
  isEmpty?: boolean;
} {
  if (v === null || v === undefined || v === "") {
    return { text: "(empty)", isEmpty: true };
  }
  if (typeof v === "object") {
    const obj = v as Record<string, unknown>;
    if ("imageSrc" in obj) {
      const altText = typeof obj.alt === "string" ? obj.alt.trim() : null;
      return {
        text: altText && altText.length > 0 ? altText : "(no alt text)",
        imageSrc: typeof obj.imageSrc === "string" ? obj.imageSrc : undefined,
        alt: altText,
        isEmpty: !altText,
      };
    }
    if ("metaTitle" in obj) {
      return { text: String(obj.metaTitle) };
    }
    if ("metaDescription" in obj) {
      return { text: String(obj.metaDescription) };
    }
    if ("fromUrl" in obj && "toUrl" in obj) {
      return { text: `${obj.fromUrl} ➔ ${obj.toUrl} (${obj.statusCode || 301})` };
    }
    // share cards (Open Graph / X): only the fields that were changed
    if (["ogTitle", "ogDescription", "ogImage", "ogImageAlt", "twitterCard", "twitterTitle", "twitterDescription", "twitterImage"].some((k) => k in obj)) {
      const label: Record<string, string> = { ogTitle: "Share title", ogDescription: "Share description", ogImage: "Share picture", ogImageAlt: "Picture description", twitterCard: "X card", twitterTitle: "X title", twitterDescription: "X description", twitterImage: "X picture" };
      const parts = Object.entries(obj)
        .filter(([k]) => label[k])
        .map(([k, v]) => `${label[k]}: ${typeof v === "string" && v.trim() ? v : "(empty)"}`);
      return { text: parts.join(" · ") || "(empty)", isEmpty: parts.length === 0 };
    }
    if ("canonicalUrl" in obj) {
      return { text: String(obj.canonicalUrl) };
    }
    return { text: JSON.stringify(obj) };
  }
  if (typeof v === "string") {
    const trimmed = v.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseFixValue(parsed);
      } catch {
        return { text: v };
      }
    }
    return { text: v };
  }
  return { text: String(v) };
}

/** Generates fallback URL candidates so images load reliably across dev and production */
function getImageCandidates(imageSrc: string, route?: string): string[] {
  if (!imageSrc) return [];
  if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
    return [imageSrc];
  }

  const list: string[] = [];
  const cleanPath = imageSrc.startsWith("/") ? imageSrc : `/${imageSrc}`;

  // 1. Production site (has all static media and optimized sizes)
  list.push(`https://mokshavoyage.in${cleanPath}`);

  // 2. Relative to current host
  list.push(cleanPath);

  // 3. Localhost frontend
  list.push(`http://localhost:3000${cleanPath}`);

  // 4. Canonical path resolution
  const filename = cleanPath.split("/").pop() || "";
  const baseName = filename
    .replace(/\.[a-f0-9_]{6,20}(?=\.)/gi, "")
    .replace(/\.w\d+/gi, "");

  if (cleanPath.includes("/images/")) {
    const canonicalPublic = cleanPath.replace(/\.w\d+/gi, "");
    list.push(canonicalPublic);
    list.push(`https://mokshavoyage.in${canonicalPublic}`);
  }

  if (baseName.includes("logo-original")) {
    list.push("/images/logo-original.webp");
    list.push("https://mokshavoyage.in/images/logo-original.webp");
  }

  if (baseName.includes("hero")) {
    const routePrefix = route && route !== "/" ? route.replace(/^\//, "") : "about-us";
    list.push(`/images/${routePrefix}/hero.webp`);
    list.push(`https://mokshavoyage.in/images/${routePrefix}/hero.webp`);
    list.push("/images/about-us/hero.webp");
  }

  if (baseName.includes("transport")) {
    list.push("/images/services/essential/transportation.webp");
    list.push("https://mokshavoyage.in/images/services/essential/transportation.webp");
    list.push("/images/home/services/panels/transport.webp");
  }

  if (baseName.includes("cat-advance-planning")) {
    list.push("/images/resources/cat-advance-planning.png");
    list.push("https://mokshavoyage.in/images/resources/cat-advance-planning.png");
  }

  return Array.from(new Set(list));
}

/** Dedicated Image Thumbnail with auto-fallback and zoom preview */
function ResolvedImageThumb({
  src,
  route,
  alt,
  onOpenZoom,
}: {
  src: string;
  route?: string;
  alt: string;
  onOpenZoom: (src: string, alt: string, filename: string) => void;
}) {
  const candidates = useMemo(() => getImageCandidates(src, route), [src, route]);
  const [candidateIdx, setCandidateIdx] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);

  const currentSrc = candidates[candidateIdx] || src;
  const filename = src.split("/").pop() || "image.webp";

  const handleError = () => {
    if (candidateIdx + 1 < candidates.length) {
      setCandidateIdx((i) => i + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  return (
    <div
      onClick={() => onOpenZoom(currentSrc, alt, filename)}
      title="Click to zoom and inspect image"
      className="group relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs hover:border-[#0b2a6b] hover:shadow-xs transition cursor-pointer flex items-center justify-center"
    >
      {hasFailedAll ? (
        <div className="flex flex-col items-center justify-center text-slate-400 gap-1 text-[9px] font-bold text-center p-1">
          <ImageIcon className="h-4 w-4 text-slate-400" />
          <span className="line-clamp-1 font-mono text-[8.5px]">{filename}</span>
        </div>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentSrc}
            alt={alt}
            onError={handleError}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition duration-200 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-white/95 text-[9.5px] font-extrabold text-[#0b2a6b] px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Maximize2 className="h-2.5 w-2.5" /> Zoom
            </span>
          </div>
        </>
      )}
    </div>
  );
}

const TYPE_FILTERS: Array<{ id: string; label: string; on: string }> = [
  { id: "all", label: "All", on: "bg-slate-800 text-white border-slate-800" },
  { id: "image", label: "Images", on: "bg-purple-600 text-white border-purple-600" },
  { id: "title", label: "Titles", on: "bg-blue-600 text-white border-blue-600" },
  { id: "description", label: "Descriptions", on: "bg-indigo-600 text-white border-indigo-600" },
  { id: "redirect", label: "Redirects", on: "bg-amber-500 text-white border-amber-500" },
  { id: "h1", label: "Headings", on: "bg-teal-600 text-white border-teal-600" },
  { id: "copy", label: "Page text", on: "bg-lime-600 text-white border-lime-600" },
];

const matchesType = (log: FixLogEntry, id: string): boolean => {
  if (id === "all") return true;
  return log.issueType.toLowerCase().replace(/[\s_]+/g, "").includes(id.toLowerCase().replace(/[\s_]+/g, ""));
};

type StatusFilter = "all" | FixLogEntry["status"];

export default function ResolvedIssuesHistory({ refreshKey, onUndone }: ResolvedIssuesHistoryProps) {
  const [logs, setLogs] = useState<FixLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [rowError, setRowError] = useState<Record<string, { message: string; stale: boolean }>>({});
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Image Zoom Lightbox State
  const [zoomModal, setZoomModal] = useState<{
    open: boolean;
    src: string;
    alt: string;
    filename: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // the history is kept whole in the page (100 per request), so search, filters and page numbers cover every change
      const all: FixLogEntry[] = [];
      let totalCount = 0;
      for (let p = 1; p <= 30; p++) {
        const res = await seoAuditApi.getFixLogs({ page: p, limit: 100 });
        all.push(...(res.data?.logs ?? []));
        totalCount = res.data?.pagination?.total ?? all.length;
        if (all.length >= totalCount || !(res.data?.logs ?? []).length) break;
      }
      setLogs(all);
      setTotal(totalCount);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the fix history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // load() shows the loading state while the request runs
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load, refreshKey]);

  const undo = async (log: FixLogEntry, force = false) => {
    setBusy(log._id);
    setRowError((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== log._id)));
    try {
      await seoAuditApi.rollbackFix(log._id, force);
      await load();
      onUndone();
    } catch (err) {
      const e = err as { message?: string; status?: number };
      setRowError((p) => ({
        ...p,
        [log._id]: {
          message: e?.message || "Undo failed.",
          stale: e?.status === 409 && /changed after/i.test(e?.message || ""),
        },
      }));
    } finally {
      setBusy(null);
    }
  };

  const counts = useMemo(
    () => ({
      all: logs.length,
      SUCCESS: logs.filter((l) => l.status === "SUCCESS").length,
      REVERTED: logs.filter((l) => l.status === "REVERTED").length,
      FAILED: logs.filter((l) => l.status === "FAILED").length,
    }),
    [logs],
  );

  const filteredLogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return logs.filter((log) => {
      if (statusFilter !== "all" && log.status !== statusFilter) return false;
      if (!matchesType(log, filterType)) return false;
      if (query) {
        const hay = `${log.route || ""} ${JSON.stringify(log.previousValue)} ${JSON.stringify(log.newValue)} ${log.fixedByUser || ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }
      return true;
    });
  }, [logs, filterType, statusFilter, searchQuery]);

  const pages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const current = Math.min(page, pages);
  const visible = filteredLogs.slice((current - 1) * pageSize, current * pageSize);

  const statCards: Array<{ id: StatusFilter; label: string; hint: string; n: number; icon: typeof CheckCircle2; tile: string; on: string; bubble: string }> = [
    { id: "all", label: "All changes", hint: "Everything done here", n: counts.all, icon: Clock, tile: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100/70", on: "bg-indigo-100 border-indigo-400 ring-2 ring-indigo-300", bubble: "bg-indigo-100 text-indigo-600" },
    { id: "SUCCESS", label: "Live now", hint: "Saved and working", n: counts.SUCCESS, icon: CheckCircle2, tile: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100/70", on: "bg-emerald-100 border-emerald-400 ring-2 ring-emerald-300", bubble: "bg-emerald-100 text-emerald-600" },
    { id: "REVERTED", label: "Undone", hint: "Put back as before", n: counts.REVERTED, icon: Undo2, tile: "bg-slate-50 border-slate-200 hover:bg-slate-100", on: "bg-slate-100 border-slate-400 ring-2 ring-slate-300", bubble: "bg-slate-200 text-slate-600" },
    { id: "FAILED", label: "Failed", hint: "Could not be saved", n: counts.FAILED, icon: AlertCircle, tile: "bg-rose-50 border-rose-200 hover:bg-rose-100/70", on: "bg-rose-100 border-rose-400 ring-2 ring-rose-300", bubble: "bg-rose-100 text-rose-600" },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-[0.9375rem] text-slate-800 [font-weight:500]">
            Fix history
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[0.6875rem] font-normal text-indigo-700">{total} changes</span>
          </h3>
          <p className="text-[0.75rem] text-slate-500">Every change made from this page, newest first. Press Undo to put the old value back.</p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[0.75rem] text-slate-700 transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-3 w-3 text-indigo-600 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Status cards: they also work as filters */}
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4" role="group" aria-label="Show changes by result">
        {statCards.map((c) => {
          const Icon = c.icon;
          const on = statusFilter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setStatusFilter(c.id);
                setPage(1);
              }}
              className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition duration-150 hover:-translate-y-0.5 hover:shadow-sm ${on ? c.on : c.tile}`}
            >
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105 ${c.bubble}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[0.8125rem] leading-tight text-slate-800 [font-weight:500]">{c.label}</span>
                <span className="block truncate text-[0.6875rem] text-slate-500">{c.hint}</span>
              </span>
              <span className="text-[1rem] text-slate-700 [font-weight:500]">{c.n}</span>
            </button>
          );
        })}
      </div>

      {/* Search and kind of change */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search a page, text or author"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="h-7 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-[0.75rem] text-slate-800 outline-none focus:border-indigo-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Filter className="h-3 w-3 text-slate-400" />
          {TYPE_FILTERS.map((item) => {
            const n = logs.filter((l) => matchesType(l, item.id)).length;
            const on = filterType === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  setFilterType(item.id);
                  setPage(1);
                }}
                className={`cursor-pointer whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[0.6875rem] transition ${on ? item.on : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}
              >
                {item.label} <span className={on ? "opacity-80" : "text-slate-400"}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* One compact card per change */}
      <div className="space-y-1.5">
        {loading && logs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 px-4 py-10 text-center text-[0.8125rem] text-slate-500">
            <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin text-indigo-600" />
            Loading fix history…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-[0.8125rem] text-red-600">{error}</div>
        ) : filteredLogs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-[0.8125rem] text-slate-500">
            <AlertCircle className="mx-auto mb-2 h-5 w-5 text-slate-300" />
            No change matches this filter or search.
          </div>
        ) : (
          visible.map((log) => {
            const statusMeta = STATUS_BADGES[log.status] ?? STATUS_BADGES.SUCCESS;
            const typeMeta =
              ISSUE_TYPE_STYLES[log.issueType.toLowerCase()] ?? {
                label: log.issueType.replace(/_/g, " "),
                style: "bg-slate-100 text-slate-700 border-slate-200",
              };
            const prev = parseFixValue(log.previousValue);
            const next = parseFixValue(log.newValue);
            const isImage = log.issueType.toLowerCase().includes("image");
            const imageSrc = next.imageSrc || prev.imageSrc;
            const filename = imageSrc ? imageSrc.split("/").pop() || "image.webp" : null;
            const cardTone = log.status === "REVERTED" ? "border-slate-200 opacity-75" : log.status === "FAILED" ? "border-rose-200" : "border-slate-200";

            return (
              <article key={log._id} className={`overflow-hidden rounded-xl border bg-white ${cardTone}`}>
                <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-slate-50/80 px-2.5 py-1.5">
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className={`inline-block rounded-full border px-2 py-px text-[0.625rem] font-normal tracking-wide ${statusMeta.style}`}>{statusMeta.label}</span>
                    <span className={`inline-block rounded-full border px-2 py-px text-[0.625rem] font-normal ${typeMeta.style}`}>{typeMeta.label}</span>
                    <span className="max-w-[300px] truncate rounded-md bg-indigo-50 px-1.5 py-px font-mono text-[0.6875rem] text-indigo-700" title={log.route || "/"}>
                      {log.route || "/"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-slate-500">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      {log.fixedBy === "AUTO_PILOT_AI" ? (
                        <>
                          <Bot className="h-3 w-3 text-emerald-600" /> Auto-Pilot AI
                        </>
                      ) : (
                        <>
                          <User className="h-3 w-3 text-indigo-500" /> {log.fixedByUser || "Admin User"}
                        </>
                      )}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {new Date(log.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {log.status === "SUCCESS" && (
                      <button
                        type="button"
                        disabled={busy === log._id}
                        onClick={() => undo(log)}
                        title="Undo this change and restore the previous value"
                        className="inline-flex h-6 cursor-pointer items-center gap-1 rounded-md border border-slate-300 bg-white px-2 text-[0.6875rem] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        {busy === log._id ? <Loader2 className="h-3 w-3 animate-spin text-slate-500" /> : <Undo2 className="h-3 w-3 text-slate-500" />}
                        Undo
                      </button>
                    )}
                    {log.status === "REVERTED" && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[0.625rem] text-slate-500">Undone</span>}
                    {log.status === "FAILED" && (
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[0.625rem] text-rose-700" title={log.errorReason}>
                        Failed
                      </span>
                    )}
                  </div>
                </header>

                <div className={`grid items-stretch gap-1.5 p-1.5 ${isImage && imageSrc ? "md:grid-cols-[auto_1fr_1fr]" : "md:grid-cols-2"}`}>
                  {isImage && imageSrc && (
                    <div title={filename ?? undefined}>
                      <ResolvedImageThumb src={imageSrc} route={log.route} alt={next.text || prev.text} onOpenZoom={(src, alt, fname) => setZoomModal({ open: true, src, alt, filename: fname })} />
                    </div>
                  )}
                  <div title={prev.text} className="line-clamp-2 min-w-0 rounded-lg border border-slate-200 bg-slate-50/80 px-2 py-1 text-[0.75rem]">
                    <span className="mr-1.5 text-[0.625rem] uppercase tracking-wide text-slate-400">Before</span>
                    <span className={`break-words leading-snug ${prev.isEmpty ? "italic text-slate-400" : "text-slate-600"}`}>{prev.text}</span>
                  </div>
                  <div title={next.text} className="line-clamp-2 min-w-0 rounded-lg border border-emerald-200 bg-emerald-50/60 px-2 py-1 text-[0.75rem]">
                    <span className="mr-1.5 text-[0.625rem] uppercase tracking-wide text-emerald-700">After</span>
                    <span className="break-words leading-snug text-emerald-950">{next.text}</span>
                  </div>
                </div>

                {rowError[log._id] && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-rose-100 bg-rose-50/60 px-3 py-1.5 text-[0.6875rem] text-rose-700">
                    <span>{rowError[log._id].message}</span>
                    {rowError[log._id].stale && (
                      <button type="button" onClick={() => undo(log, true)} className="cursor-pointer rounded border border-rose-300 bg-white px-2 py-0.5 text-rose-700 hover:bg-rose-100">
                        Undo anyway
                      </button>
                    )}
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {filteredLogs.length > 0 && (
        <PaginationBar
          page={current}
          pageSize={pageSize}
          total={filteredLogs.length}
          noun="changes"
          onPage={setPage}
          onPageSize={(n) => {
            setPageSize(n);
            setPage(1);
          }}
        />
      )}

      {/* 🔍 Image Zoom Lightbox Modal */}
      {zoomModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl text-slate-100 animate-in zoom-in-95 duration-150 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/60">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span className="font-mono">{zoomModal.filename}</span>
              </div>
              <button
                type="button"
                onClick={() => setZoomModal(null)}
                className="text-slate-400 hover:text-white cursor-pointer transition p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 flex flex-col items-center justify-center bg-slate-950/40">
              <div className="max-h-80 max-w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 p-2 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={zoomModal.src}
                  alt={zoomModal.alt}
                  className="max-h-72 max-w-full object-contain rounded-lg"
                />
              </div>

              <div className="w-full mt-4 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Alt Text Applied:
                </span>
                <p className="text-emerald-300 font-bold">{zoomModal.alt}</p>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                type="button"
                onClick={() => setZoomModal(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
