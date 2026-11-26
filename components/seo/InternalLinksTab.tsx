"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Info, Loader2, RefreshCw, Search, TriangleAlert, Undo2, X } from "lucide-react";
import { seoAuditApi, type InternalLinkSuggestion } from "@/lib/seoAuditApi";

type Filter = "suggested" | "applied" | "dismissed";

const TABS: Array<{ id: Filter; label: string }> = [
  { id: "suggested", label: "To do" },
  { id: "applied", label: "Added on website" },
  { id: "dismissed", label: "Dismissed" },
];

/** Plain-words label for the real match percentage */
const bandOf = (pct: number) => (pct >= 85 ? "Very close" : pct >= 75 ? "Close" : "Related");

/** "Pind Daan Service | Moksha Voyage" → "Pind Daan Service" */
const cleanTitle = (t: string | undefined, fallback: string) => (t || "").replace(/\s*[|–—-]\s*Moksha Voyage\s*$/i, "").trim() || fallback;

/** The sentence with the link words marked */
function Sentence({ text, anchor }: { text: string; anchor: string }) {
  const at = text.toLowerCase().indexOf(anchor.toLowerCase());
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="rounded bg-amber-200 px-0.5 font-semibold text-slate-900 underline decoration-indigo-600 underline-offset-2">{text.slice(at, at + anchor.length)}</mark>
      {text.slice(at + anchor.length)}
    </>
  );
}

export default function InternalLinksTab() {
  const [filter, setFilter] = useState<Filter>("suggested");
  const [onlyPossible, setOnlyPossible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHow, setShowHow] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [rows, setRows] = useState<InternalLinkSuggestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    seoAuditApi
      .getInternalLinks(filter)
      .then((r) => {
        if (cancelled) return;
        setRows(r);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the suggestions.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter, version]);

  const generate = async () => {
    setGenerating(true);
    setInfo(null);
    setError(null);
    try {
      const r = await seoAuditApi.generateInternalLinks();
      setInfo(r.message || `Compared the text of ${r.pagesAnalysed} pages as they are on your website.`);
      setLoading(true);
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not refresh the suggestions.");
    } finally {
      setGenerating(false);
    }
  };

  const move = async (links: InternalLinkSuggestion[], status: "applied" | "dismissed" | "suggested") => {
    setBusy(links[0]?._id ?? null);
    setError(null);
    try {
      for (const l of links) await seoAuditApi.setInternalLinkStatus(l._id, status);
      const ids = new Set(links.map((l) => l._id));
      setRows((p) => (p ? p.filter((r) => !ids.has(r._id)) : p));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the link.");
    } finally {
      setBusy(null);
    }
  };

  const possible = (r: InternalLinkSuggestion) => r.anchorPlaced === true;
  const hiddenCount = useMemo(() => (filter === "suggested" ? (rows || []).filter((r) => !possible(r)).length : 0), [rows, filter]);

  const groups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const map = new Map<string, InternalLinkSuggestion[]>();
    for (const r of rows || []) {
      if (filter === "suggested" && onlyPossible && !possible(r)) continue;
      if (q && ![r.fromPath, r.toPath, r.fromTitle, r.toTitle, r.anchorText].some((v) => v?.toLowerCase().includes(q))) continue;
      map.set(r.fromPath, [...(map.get(r.fromPath) || []), r]);
    }
    return Array.from(map.entries())
      .map(([fromPath, links]) => ({ fromPath, title: cleanTitle(links[0].fromTitle, fromPath), links: links.sort((a, b) => b.similarity - a.similarity) }))
      .sort((a, b) => b.links.length - a.links.length || a.fromPath.localeCompare(b.fromPath));
  }, [rows, filter, onlyPossible, searchQuery]);

  const total = groups.reduce((n, g) => n + g.links.length, 0);

  return (
    <div className="space-y-4">
      {/* What this is */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-900">Internal links</h3>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">
          A link from one page to another page about the same thing helps visitors find what they need and helps Google understand your site. We read the
          full text of every page as it is on your website and suggest a link between pages that talk about the same thing. This is a suggestion, not an
          error: nothing is wrong with your site.
        </p>
        <button type="button" onClick={() => setShowHow((v) => !v)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900">
          <Info className="h-3.5 w-3.5" /> How is the % worked out?
        </button>
        {showHow && (
          <div className="mt-2 max-w-3xl rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
            An AI model reads the whole text of both pages and measures how close their <strong>meaning</strong> is. 100% would be the same meaning. It is the real
            result, not a count of shared words, and it is not stretched or adjusted. Pages of one website usually score fairly high with each other, so use it to
            compare suggestions: <strong>85%+ very close, 75%+ close</strong>, below that related.
            <br />
            <strong>Where the link goes:</strong> a link is only added where the page already says the words in a sentence of its text. If it never says them, the
            suggestion is hidden by default, because there is no place for the link yet.
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex overflow-hidden rounded-lg border border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  if (t.id !== filter) {
                    setFilter(t.id);
                    setLoading(true);
                    setRows(null);
                  }
                }}
                className={`px-3 py-1.5 text-xs font-semibold ${filter === t.id ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search a page or title"
              className="w-60 rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:border-indigo-400"
            />
          </div>
          {filter === "suggested" && hiddenCount > 0 && (
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
              <input type="checkbox" checked={!onlyPossible} onChange={(e) => setOnlyPossible(!e.target.checked)} />
              Also show {hiddenCount} with no place for the link yet
            </label>
          )}
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {generating ? "Reading your pages…" : "Refresh suggestions"}
        </button>
      </div>

      {info && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">{info}</div>}
      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</div>}

      {loading ? (
        <div className="flex items-center gap-2 p-6 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : total === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          {filter === "suggested"
            ? (rows?.length ?? 0) > 0
              ? "No link can be added right now: none of the suggested pages is mentioned in a sentence of the page that would get the link. Tick the box above to see them."
              : "No suggestions yet. Run an audit, then press “Refresh suggestions”."
            : filter === "applied"
              ? "No link has been added yet."
              : "Nothing dismissed."}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">
            {total} link{total === 1 ? "" : "s"} on {groups.length} page{groups.length === 1 ? "" : "s"}
          </p>
          {groups.map((g) => {
            const open = !collapsed[g.fromPath];
            const addable = g.links.filter(possible);
            return (
              <section key={g.fromPath} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                <header className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 px-4 py-2.5">
                  <button type="button" onClick={() => setCollapsed((c) => ({ ...c, [g.fromPath]: open }))} className="flex min-w-0 items-center gap-2 text-left">
                    {open ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">Add links on this page</span>
                      <span className="block truncate text-sm font-bold text-slate-900">
                        {g.title} <span className="font-mono text-xs font-normal text-slate-500">{g.fromPath}</span>
                      </span>
                    </span>
                  </button>
                  {filter === "suggested" && addable.length > 1 && (
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => move(addable, "applied")}
                      className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      Add all {addable.length}
                    </button>
                  )}
                </header>

                {open && (
                  <ul className="divide-y divide-slate-100">
                    {g.links.map((r) => {
                      const pct = Math.round(r.similarity * 100);
                      return (
                        <li key={r._id} className="grid gap-3 px-4 py-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-start">
                          {/* where it points */}
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Link to</div>
                            <div className="truncate text-sm font-semibold text-slate-900">{cleanTitle(r.toTitle, r.toPath)}</div>
                            <div className="truncate font-mono text-xs text-slate-500">{r.toPath}</div>
                            <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs">
                              <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-bold text-indigo-700">{pct}%</span>
                              <span className="text-slate-500">{bandOf(pct)} in meaning</span>
                            </div>
                          </div>

                          {/* where it goes */}
                          <div className="min-w-0 text-xs leading-relaxed">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Where the link will be</div>
                            {possible(r) && r.anchorContext ? (
                              <p className="mt-0.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700">
                                &ldquo;<Sentence text={r.anchorContext} anchor={r.anchorText} />&rdquo;
                              </p>
                            ) : filter !== "suggested" ? (
                              <p className="mt-0.5 text-slate-600">
                                Link words: <strong>&ldquo;{r.anchorText}&rdquo;</strong>
                              </p>
                            ) : (
                              <p className="mt-0.5 flex gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-amber-900">
                                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                <span>
                                  No place yet: this page never says &ldquo;{r.toTitle?.split(/\s[|–—-]\s/)[0] || r.anchorText}&rdquo; in a sentence. Write a sentence about it on this
                                  page first, then refresh.
                                </span>
                              </p>
                            )}
                          </div>

                          {/* actions */}
                          <div className="flex items-center gap-1.5 md:justify-end">
                            {filter === "suggested" && (
                              <>
                                <button
                                  type="button"
                                  disabled={busy !== null || !possible(r)}
                                  title={possible(r) ? "Add this link to the website" : "There is no sentence for this link yet"}
                                  onClick={() => move([r], "applied")}
                                  className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                                >
                                  {busy === r._id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Add link
                                </button>
                                <button
                                  type="button"
                                  disabled={busy !== null}
                                  onClick={() => move([r], "dismissed")}
                                  className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                                >
                                  <X className="h-3 w-3" /> Skip
                                </button>
                              </>
                            )}
                            {filter === "applied" && (
                              <button
                                type="button"
                                disabled={busy !== null}
                                onClick={() => move([r], "suggested")}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                              >
                                <Undo2 className="h-3 w-3" /> Remove link
                              </button>
                            )}
                            {filter === "dismissed" && (
                              <button
                                type="button"
                                disabled={busy !== null}
                                onClick={() => move([r], "suggested")}
                                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                              >
                                <Undo2 className="h-3 w-3" /> Bring back
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
