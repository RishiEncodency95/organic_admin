"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  ImageOff,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { seoAuditApi, type LiveContentScanResponse } from "@/lib/seoAuditApi";
import { SITE_ORIGIN } from "@/lib/siteConfig";

interface RouteOption {
  id: string;
  label: string;
  path: string;
}

type Img = LiveContentScanResponse["data"]["images"][number];
type Filter = "all" | "ai_suspect" | "missing_alt" | "generic_alt" | "ok";

const STATUS: Record<string, { label: string; style: string }> = {
  ok: { label: "OK", style: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  missing_alt: { label: "Missing alt", style: "bg-red-100 text-red-800 border-red-200" },
  generic_alt: { label: "Generic alt", style: "bg-amber-100 text-amber-800 border-amber-200" },
  ai_suspect: { label: "Looks like stock / generated", style: "bg-purple-100 text-purple-800 border-purple-200" },
};

const resolveSrc = (src: string) => {
  try {
    return new URL(src, SITE_ORIGIN).toString();
  } catch {
    return src;
  }
};

/** Smart contextual alt text generator based on filename and page label */
function generateSmartAlt(src: string, pageLabel?: string): string {
  let name = "";
  try {
    name = decodeURIComponent(new URL(src, "https://x.invalid").pathname.split("/").pop() || "");
  } catch {
    name = src.split("/").pop() || "";
  }
  // Strip build fingerprints like .dce59291.w2560.webp
  name = name.replace(/\.[a-f0-9]{6,12}(?=\.)/gi, "").replace(/\.w\d+/gi, "");
  const words = name
    .replace(/\.[a-z0-9]{2,5}$/i, "")
    .split(/[-_.\s]+/)
    .filter((w) => /^[a-z0-9]{2,}$/i.test(w) && !/^(img|image|photo|pic|picture|bg|background|thumb|thumbnail|copy|final|new|untitled|webp|jpeg|jpg|png|small|large|medium|w\d+)$/i.test(w));

  const cleanWords = words.join(" ");
  const capitalized = cleanWords ? cleanWords.charAt(0).toUpperCase() + cleanWords.slice(1) : "Visual";
  const cleanPage = (pageLabel || "").split(/\s[|–—-]\s/)[0].replace(/^(Home Page|About Us|Our Services)/i, (m) => m).trim();

  if (/^(ambulance|van|car|truck|hearse)/i.test(cleanWords)) {
    return `${capitalized} for dignified funeral conveyance at Moksha Voyage`;
  }
  if (/^(freezer|mortuary|box|preservation)/i.test(cleanWords)) {
    return `${capitalized} for mortuary preservation care at Moksha Voyage`;
  }
  if (/^(lotus|diya|flame|lamp)/i.test(cleanWords)) {
    return `Sacred ${cleanWords.toLowerCase()} representing peace and Vedic rituals`;
  }
  if (/^(pandit|priest|puja|rituals|ceremony)/i.test(cleanWords)) {
    return `Vedic pandit performing funeral rituals with samagri`;
  }
  if (/^(crematorium|ghat|river|ganga|varanasi)/i.test(cleanWords)) {
    return `${capitalized} at sacred river ghats for antim sanskar`;
  }
  if (/^(doc|certificate|papers)/i.test(cleanWords)) {
    return `Documentation and legal paperwork assistance for funeral rites`;
  }
  if (/^(airport|flight|plane|london|repatriation)/i.test(cleanWords)) {
    return `International repatriation and airport cargo coordination`;
  }

  return cleanPage ? `${capitalized} on ${cleanPage} | Moksha Voyage` : `${capitalized} | Moksha Voyage`;
}

export default function AiImageInspectorTab({ routes, initialPath = "/" }: { routes: RouteOption[]; initialPath?: string }) {
  const [path, setPath] = useState(initialPath);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [route, setRoute] = useState<string | null>(null);
  const [images, setImages] = useState<Img[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [broken, setBroken] = useState<Set<string>>(new Set());
  const [fixing, setFixing] = useState<string | null>(null);
  const [alts, setAlts] = useState<Record<string, string>>({});
  const [fixError, setFixError] = useState<Record<string, string>>({});
  const [fixed, setFixed] = useState<Set<string>>(new Set());
  const [copiedSrc, setCopiedSrc] = useState<string | null>(null);
  const [bulkFixing, setBulkFixing] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  const selectedRouteLabel = useMemo(() => {
    const r = routes.find((ro) => ro.path === path);
    return r ? r.label : path;
  }, [routes, path]);

  const analyze = async (targetPath?: string) => {
    const routeToScan = targetPath || path;
    setScanning(true);
    setError(null);
    setFixed(new Set());
    setFixError({});
    try {
      const res = await seoAuditApi.analyzeLiveContent({ route: routeToScan });
      const imgList = res.data.images || [];
      setImages(imgList);
      setRoute(res.data.route);
      // Pre-fill alts state with existing alts
      const initialAlts: Record<string, string> = {};
      imgList.forEach((img) => {
        if (img.alt) initialAlts[img.src] = img.alt;
      });
      setAlts(initialAlts);
    } catch (err) {
      setImages(null);
      setError(err instanceof Error ? err.message : "The page could not be analysed.");
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    if (initialPath) {
      setPath(initialPath);
      void analyze(initialPath);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPath]);

  const counts = useMemo(() => {
    const c = { all: 0, ok: 0, missing_alt: 0, generic_alt: 0, ai_suspect: 0 } as Record<Filter, number>;
    for (const i of images || []) {
      c.all += 1;
      c[i.status as Filter] = (c[i.status as Filter] || 0) + 1;
    }
    return c;
  }, [images]);

  const shown = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return (images || []).filter((i) => {
      if (filter !== "all" && i.status !== filter) return false;
      if (!q) return true;
      const filename = i.src.split("/").pop() || "";
      const currentAlt = alts[i.src] || i.alt || "";
      return (
        filename.toLowerCase().includes(q) ||
        currentAlt.toLowerCase().includes(q) ||
        i.src.toLowerCase().includes(q) ||
        (i.reason && i.reason.toLowerCase().includes(q))
      );
    });
  }, [images, filter, searchFilter, alts]);

  const fixAlt = async (img: Img, overrideAlt?: string) => {
    const altText = (overrideAlt !== undefined ? overrideAlt : alts[img.src] || "").trim();
    if (!altText || !route) return;
    setFixing(img.src);
    setFixError((p) => ({ ...p, [img.src]: "" }));
    try {
      await seoAuditApi.autoFixPage({
        pageUrl: route,
        route,
        issueType: "image_alt",
        options: { imageSrc: img.src, altText },
      });
      setFixed((s) => new Set(s).add(img.src));
      setAlts((p) => ({ ...p, [img.src]: altText }));
      setImages((list) => (list ? list.map((i) => (i.src === img.src ? { ...i, alt: altText, hasAlt: true, savedAlt: true, status: /^(image|banner|photo|pic|picture|icon|logo|arrow|btn|button)$/i.test(altText) || /icon$/i.test(altText) || altText.length < 4 ? "generic_alt" : "ok" } : i)) : list));
    } catch (err) {
      setFixError((p) => ({ ...p, [img.src]: err instanceof Error ? err.message : "Could not save the alt text." }));
    } finally {
      setFixing(null);
    }
  };

  const suggestAltForImg = (img: Img) => {
    const suggested = generateSmartAlt(img.src, selectedRouteLabel);
    setAlts((p) => ({ ...p, [img.src]: suggested }));
  };

  const copyUrl = (src: string) => {
    navigator.clipboard.writeText(resolveSrc(src));
    setCopiedSrc(src);
    setTimeout(() => setCopiedSrc(null), 2000);
  };

  const autoFixAllMissing = async () => {
    if (!images || !route) return;
    const missing = images.filter((i) => (i.status === "missing_alt" || i.status === "generic_alt") && !fixed.has(i.src));
    if (missing.length === 0) return;

    setBulkFixing(true);
    let done = 0;
    for (const img of missing) {
      setBulkProgress(`Fixing image ${done + 1} of ${missing.length}…`);
      const generated = alts[img.src]?.trim() || generateSmartAlt(img.src, selectedRouteLabel);
      try {
        await seoAuditApi.autoFixPage({
          pageUrl: route,
          route,
          issueType: "image_alt",
          options: { imageSrc: img.src, altText: generated },
        });
        setFixed((s) => new Set(s).add(img.src));
        setAlts((p) => ({ ...p, [img.src]: generated }));
        setImages((list) => (list ? list.map((i) => (i.src === img.src ? { ...i, alt: generated, hasAlt: true, savedAlt: true, status: "ok" } : i)) : list));
      } catch {
        // continue with next
      }
      done += 1;
    }
    setBulkFixing(false);
    setBulkProgress(`Done! Successfully updated ${done} alt tags.`);
    setTimeout(() => setBulkProgress(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Page Selector & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <label className="text-xs font-black uppercase text-slate-500">Page to Inspect:</label>
          <select
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="h-10 w-full max-w-md rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-900 outline-none focus:border-indigo-600 cursor-pointer"
          >
            {routes.map((r) => (
              <option key={r.id} value={r.path}>
                {r.label} ({r.path})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void analyze()}
            disabled={scanning}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0b2a6b] px-4 text-xs font-black text-white hover:bg-[#0d338a] disabled:opacity-60 cursor-pointer shadow-xs transition"
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Inspect images
          </button>
        </div>

        {images && counts.missing_alt > 0 && (
          <button
            type="button"
            disabled={bulkFixing || scanning}
            onClick={autoFixAllMissing}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-60 cursor-pointer shadow-xs transition"
          >
            {bulkFixing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-amber-300 fill-amber-300" />}
            Auto-Fix All Missing Alts ({counts.missing_alt})
          </button>
        )}
      </div>

      {bulkProgress && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800">
          {bulkProgress}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      )}

      {images === null && !scanning && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-xs font-bold text-slate-500 space-y-2">
          <ImageIcon className="h-8 w-8 mx-auto text-slate-300" />
          <p>Pick a page from the dropdown above and press <strong>Inspect images</strong>.</p>
        </div>
      )}

      {images && images.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-xs font-bold text-slate-500">
          This page has no images.
        </div>
      )}

      {images && images.length > 0 && (
        <>
          {/* Filters and Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5">
              {(["all", "missing_alt", "generic_alt", "ai_suspect", "ok"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-extrabold cursor-pointer transition ${
                    filter === f ? "bg-[#0b2a6b] text-white shadow-2xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {f === "all" ? "All" : STATUS[f].label} ({counts[f] || 0})
                </button>
              ))}
            </div>

            <div className="relative min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search image name or alt…"
                className="h-8 w-full pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-400 focus:outline-none transition"
              />
            </div>
          </div>

          <p className="text-[11px] font-medium text-slate-500 px-1">
            Edit and update alt text on <strong>any</strong> image directly below. Saved changes are published immediately to the website overrides and reflected live.
          </p>

          {/* Image Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((img, i) => {
              const decorativeNoAlt = Boolean(img.isDecorative) && !img.hasAlt && img.status === "ok";
              const st = decorativeNoAlt ? { label: "Decorative", style: "bg-slate-100 text-slate-700 border-slate-200" } : STATUS[img.status] || STATUS.ok;
              const isFixed = fixed.has(img.src);
              const currentInputAlt = alts[img.src] !== undefined ? alts[img.src] : img.alt || "";
              const filename = img.src.split("/").pop() || img.src;

              return (
                <div
                  key={`${img.src}-${i}`}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Visual Preview */}
                    <div className="relative flex h-44 items-center justify-center bg-slate-100 border-b border-slate-200 overflow-hidden group">
                      {broken.has(img.src) ? (
                        <div className="flex flex-col items-center gap-1 text-slate-400">
                          <ImageOff className="h-6 w-6" />
                          <span className="text-[10px] font-bold">Could not load preview</span>
                        </div>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={resolveSrc(img.src)}
                          alt={currentInputAlt || img.alt || ""}
                          loading="lazy"
                          className="max-h-44 max-w-full object-contain transition duration-200 group-hover:scale-105"
                          onError={() => setBroken((s) => new Set(s).add(img.src))}
                        />
                      )}

                      {/* Top Overlay Badges */}
                      <div className="absolute top-2 left-2 flex items-center gap-1">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-black border shadow-2xs ${
                            isFixed ? "bg-emerald-100 text-emerald-800 border-emerald-300" : st.style
                          }`}
                        >
                          {isFixed ? "✓ Alt saved & live" : st.label}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-xs rounded-md px-1.5 py-0.5 border border-slate-200 shadow-2xs">
                        <a
                          href={resolveSrc(img.src)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-600 hover:text-indigo-600 transition"
                          title="Open full image in new tab"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => copyUrl(img.src)}
                          className="p-1 text-slate-600 hover:text-indigo-600 transition cursor-pointer"
                          title="Copy image URL"
                        >
                          {copiedSrc === img.src ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Metadata & Diagnostics */}
                    <div className="p-3.5 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-800 truncate" title={img.src}>
                          {filename}
                        </span>
                        {currentInputAlt && (
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                            {currentInputAlt.length}/125 chars
                          </span>
                        )}
                      </div>

                      {img.status !== "ok" && !isFixed && (
                        <div className="rounded-lg bg-amber-50/70 border border-amber-200 p-2 space-y-1 text-[11px]">
                          <div className="font-semibold text-amber-900">{img.reason}</div>
                          {img.recommendation && (
                            <div className="text-amber-800 opacity-90">{img.recommendation}</div>
                          )}
                        </div>
                      )}

                      {/* Current Alt Display */}
                      <div className="text-slate-600 text-[11px]">
                        <span className="font-bold text-slate-400">Current Live Alt: </span>
                        {img.alt ? (
                          <span className="font-medium text-slate-800">&ldquo;{img.alt}&rdquo;</span>
                        ) : (
                          <span className="text-red-600 font-semibold italic">(none - missing alt attribute)</span>
                        )}
                      </div>

                      {/* In-Place Alt Editor */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            Edit Alt Text:
                          </label>
                          <button
                            type="button"
                            onClick={() => suggestAltForImg(img)}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded cursor-pointer transition"
                            title="Generate a descriptive, SEO-optimized alt text using smart AI heuristics"
                          >
                            <Sparkles className="h-2.5 w-2.5 text-indigo-600" />
                            AI Suggest Alt
                          </button>
                        </div>

                        <form
                          className="space-y-2"
                          onSubmit={(e) => {
                            e.preventDefault();
                            void fixAlt(img);
                          }}
                        >
                          <textarea
                            value={currentInputAlt}
                            onChange={(e) => setAlts((p) => ({ ...p, [img.src]: e.target.value }))}
                            maxLength={125}
                            rows={2}
                            placeholder="Describe what this image shows specifically..."
                            className="w-full rounded-lg border border-slate-300 p-2 text-xs text-slate-900 outline-none focus:border-indigo-600 focus:bg-white bg-slate-50/50 resize-none transition"
                          />

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-slate-400 truncate">
                              Path: <span className="font-mono">{img.src.slice(0, 30)}…</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              {currentInputAlt !== (img.alt || "") && (
                                <button
                                  type="button"
                                  onClick={() => setAlts((p) => ({ ...p, [img.src]: img.alt || "" }))}
                                  className="h-8 px-2 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                                >
                                  Reset
                                </button>
                              )}
                              <button
                                type="submit"
                                disabled={fixing === img.src || !currentInputAlt.trim()}
                                className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white hover:bg-emerald-500 disabled:opacity-50 cursor-pointer shadow-2xs transition"
                              >
                                {fixing === img.src ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                                Save Alt
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>

                      {fixError[img.src] && (
                        <div className="rounded border border-red-200 bg-red-50 p-1.5 text-[11px] font-bold text-red-700">
                          {fixError[img.src]}
                        </div>
                      )}

                      {img.status === "ok" && !isFixed && !decorativeNoAlt && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 pt-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {img.savedAlt ? "Alt saved. The live page shows it after the next website build." : "High quality & compliant"}
                        </div>
                      )}
                      {decorativeNoAlt && !isFixed && (
                        <div className="pt-1 text-[11px] font-medium text-slate-500">Hidden from screen readers on purpose, so an empty alt is correct. You can still add one below.</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
