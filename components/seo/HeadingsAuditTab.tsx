"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Heading1, Loader2, RefreshCw, Search, Wand2, X } from "lucide-react";
import { seoAuditApi, type PageHeadings } from "@/lib/seoAuditApi";
import { errorMessage } from "@/lib/errorMessage";
import { SITE_ORIGIN } from "@/lib/siteConfig";
import PaginationBar from "@/components/seo/PaginationBar";

const LEVEL_TONE: Record<number, { chip: string; row: string }> = {
  1: { chip: "bg-rose-100 text-rose-700 border-rose-200", row: "bg-rose-50/50" },
  2: { chip: "bg-indigo-100 text-indigo-700 border-indigo-200", row: "bg-indigo-50/40" },
  3: { chip: "bg-sky-100 text-sky-700 border-sky-200", row: "bg-sky-50/40" },
  4: { chip: "bg-teal-100 text-teal-700 border-teal-200", row: "" },
  5: { chip: "bg-amber-100 text-amber-700 border-amber-200", row: "" },
  6: { chip: "bg-slate-100 text-slate-600 border-slate-200", row: "" },
};

type Filter = "all" | "problems" | "ok";
type Sort = "order" | "problems" | "headings";
type View = "page" | "level";

/** The outline of one page: every heading in the order the page has it, or grouped H1 → H6 */
function Outline({ page, view }: { page: PageHeadings; view: View }) {
  const rows = view === "page" ? page.headings : [...page.headings].sort((a, b) => a.level - b.level);
  if (!rows.length) return <p className="px-3 py-3 text-[0.75rem] text-slate-500">This page has no headings.</p>;
  return (
    <ol className="divide-y divide-slate-100">
      {rows.map((h, i) => {
        const tone = LEVEL_TONE[h.level] ?? LEVEL_TONE[6];
        return (
          <li key={i} className={`flex items-start gap-2.5 px-3 py-1.5 ${tone.row}`} style={view === "page" ? { paddingLeft: `${0.75 + (h.level - 1) * 1.25}rem` } : undefined}>
            <span className={`mt-px shrink-0 rounded border px-1.5 py-px font-mono text-[0.6875rem] ${tone.chip}`}>H{h.level}</span>
            <div className="min-w-0 flex-1">
              <p className="break-words text-[0.8125rem] leading-snug text-slate-800">{h.text || <em className="text-slate-400">(empty heading)</em>}</p>
              {h.issues.length > 0 && (
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {h.issues.map((x) => (
                    <span key={x} className="rounded-full border border-amber-200 bg-amber-50 px-2 py-px text-[0.6875rem] text-amber-800">{x}</span>
                  ))}
                </div>
              )}
            </div>
            <span className="shrink-0 text-[0.6875rem] text-slate-400">{h.text.length} chars</span>
          </li>
        );
      })}
    </ol>
  );
}

interface HeadingsAuditTabProps {
  onOpenIssues?: (route: string) => void;
}

/** Headings audit: how many H1–H6 every page has, what each one says, and whether the order is right */
export default function HeadingsAuditTab({ onOpenIssues }: HeadingsAuditTabProps = {}) {
  const [pages, setPages] = useState<PageHeadings[] | null>(null);
  const [auditedAt, setAuditedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("order");
  const [view, setView] = useState<View>("page");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Quick Fix H1 Modal State
  const [fixModal, setFixModal] = useState<{
    page: PageHeadings;
    h1Candidates: string[];
    selectedH1: string;
    customH1: string;
    isCustom: boolean;
    extraTag: "h2" | "h3";
  } | null>(null);
  const [fixing, setFixing] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const [fixSuccess, setFixSuccess] = useState<string | null>(null);

  const openFixModal = (p: PageHeadings) => {
    const h1s = p.headings.filter((h) => h.level === 1).map((h) => h.text).filter(Boolean);
    const defaultCandidate = h1s[0] || p.title.replace(/\s*[|–—-]\s*Moksha Voyage\s*$/i, "").trim() || "Main Page Heading";
    setFixModal({
      page: p,
      h1Candidates: Array.from(new Set(h1s)),
      selectedH1: defaultCandidate,
      customH1: defaultCandidate,
      isCustom: h1s.length === 0,
      extraTag: "h2",
    });
    setFixError(null);
    setFixSuccess(null);
  };

  const handleApplyFix = async () => {
    if (!fixModal) return;
    const h1Text = (fixModal.isCustom ? fixModal.customH1 : fixModal.selectedH1).trim();
    if (!h1Text) {
      setFixError("Please provide an H1 heading text.");
      return;
    }
    setFixing(true);
    setFixError(null);
    try {
      const pageUrl = `${SITE_ORIGIN}${fixModal.page.route === "/" ? "" : fixModal.page.route}`;
      await seoAuditApi.autoFixPage({
        pageUrl,
        route: fixModal.page.route,
        issueType: "h1",
        options: {
          h1Heading: h1Text,
          h1ExtraTag: fixModal.extraTag,
        },
      });

      setFixSuccess(`✓ Saved H1 heading in Admin CMS! Extra H1s will convert to <${fixModal.extraTag}>.`);

      // Optimistically update the page in state
      setPages((prev) => {
        if (!prev) return prev;
        return prev.map((p) => {
          if (p.route !== fixModal.page.route) return p;
          const extraLevel = fixModal.extraTag === "h3" ? 3 : 2;
          let seen = false;
          const updatedHeadings = p.headings.map((h) => {
            if (h.level === 1) {
              if (!seen) {
                seen = true;
                return { ...h, text: h1Text, issues: [] };
              }
              return { ...h, level: extraLevel, issues: [] };
            }
            return h;
          });
          if (!seen) {
            updatedHeadings.unshift({ level: 1, text: h1Text, issues: [] });
          }
          const newCounts = { ...p.counts, h1: 1 };
          newCounts[`h${extraLevel}` as keyof typeof newCounts] += (p.counts.h1 > 1 ? p.counts.h1 - 1 : 0);
          return {
            ...p,
            counts: newCounts,
            headings: updatedHeadings,
            problems: p.problems.filter((pr) => !/h1/i.test(pr)),
            ok: p.problems.filter((pr) => !/h1/i.test(pr)).length === 0,
            awaitingDeploy: true,
            h1Override: h1Text,
          };
        });
      });

      setTimeout(() => {
        setFixModal(null);
        setFixSuccess(null);
      }, 1500);
    } catch (err) {
      setFixError(err instanceof Error && err.message ? err.message : "Failed to save H1 heading.");
    } finally {
      setFixing(false);
    }
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await seoAuditApi.headings();
      setPages(r.pages);
      setAuditedAt(r.auditedAt);
      setError(null);
    } catch (e) {
      setError(errorMessage(e) || "Could not read the headings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // load() shows the loading state while the request runs
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const all = pages ?? [];
    return {
      total: all.length,
      ok: all.filter((p) => p.ok).length,
      noH1: all.filter((p) => p.counts.h1 === 0).length,
      manyH1: all.filter((p) => p.counts.h1 > 1).length,
      skips: all.filter((p) => p.problems.some((x) => /skip/i.test(x))).length,
    };
  }, [pages]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (pages ?? [])
      .filter((p) => (filter === "problems" ? !p.ok : filter === "ok" ? p.ok : true))
      .filter((p) => !needle || p.route.toLowerCase().includes(needle) || p.title.toLowerCase().includes(needle) || p.headings.some((h) => h.text.toLowerCase().includes(needle)))
      .sort((a, b) => (sort === "problems" ? b.problems.length - a.problems.length : sort === "headings" ? b.total - a.total : 0));
  }, [pages, q, filter, sort]);

  const pages_ = Math.max(1, Math.ceil(shown.length / pageSize));
  const current = Math.min(page, pages_);
  const visible = shown.slice((current - 1) * pageSize, current * pageSize);

  const cards = [
    { label: "Pages checked", hint: auditedAt ? `Audit of ${new Date(auditedAt).toLocaleDateString("en-IN")}` : "From the latest audit", n: stats.total, tile: "bg-sky-50 border-sky-200", bubble: "bg-sky-100 text-sky-600", icon: Heading1, f: "all" as Filter },
    { label: "Headings in order", hint: "One H1, no skipped level", n: stats.ok, tile: "bg-emerald-50 border-emerald-200", bubble: "bg-emerald-100 text-emerald-600", icon: CheckCircle2, f: "ok" as Filter },
    { label: "Need attention", hint: `${stats.noH1} without H1 · ${stats.manyH1} with several H1 · ${stats.skips} skip a level`, n: stats.total - stats.ok, tile: "bg-amber-50 border-amber-200", bubble: "bg-amber-100 text-amber-700", icon: AlertTriangle, f: "problems" as Filter },
  ];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-[0.9375rem] text-slate-800 [font-weight:500]">Headings audit</h2>
            <p className="max-w-3xl text-[0.75rem] text-slate-500">
              Every H1 to H6 of every page, in the order the page has them. A page needs one H1 first, then H2, then H3 and so on, without jumping a level.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[0.75rem] text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-3 w-3 text-rose-600 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-2.5 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => {
                setFilter(c.f);
                setPage(1);
              }}
              aria-pressed={filter === c.f}
              className={`group flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition duration-150 hover:-translate-y-0.5 hover:shadow-sm ${c.tile} ${filter === c.f ? "ring-2 ring-slate-400" : ""}`}
            >
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition group-hover:scale-105 ${c.bubble}`}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[1.125rem] leading-none text-slate-800 [font-weight:500]">{loading && !pages ? "—" : c.n}</span>
                <span className="mt-1 block text-[0.75rem] leading-tight text-slate-700">{c.label}</span>
                <span className="block truncate text-[0.6875rem] text-slate-500" title={c.hint}>{c.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2">
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search a page or a heading text"
            className="h-7 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 text-[0.75rem] text-slate-800 outline-none focus:border-rose-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[0.75rem]">
          <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white" role="group" aria-label="How to list the headings">
            {([
              { id: "page", label: "In page order" },
              { id: "level", label: "H1 → H6" },
            ] as const).map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={view === v.id}
                onClick={() => setView(v.id)}
                className={`cursor-pointer px-2.5 py-1 transition ${view === v.id ? "bg-slate-800 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as Sort);
              setPage(1);
            }}
            aria-label="Sort pages"
            className="h-7 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-[0.75rem] text-slate-700"
          >
            <option value="order">Sort: site order</option>
            <option value="problems">Sort: most problems</option>
            <option value="headings">Sort: most headings</option>
          </select>
        </div>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[0.75rem] text-rose-800">{error}</div>}

      {loading && !pages ? (
        <div className="flex items-center gap-2 p-6 text-[0.8125rem] text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading the headings…
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-[0.8125rem] text-slate-500">
          {pages?.length ? "No page matches this filter or search." : "No audit yet. Run an audit, then open this tool again."}
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((p) => {
            const isOpen = open[p.route] ?? false;
            return (
              <section key={p.route} className={`overflow-hidden rounded-xl border bg-white ${p.ok ? "border-slate-200" : "border-amber-200"}`}>
                <div
                  onClick={() => setOpen((o) => ({ ...o, [p.route]: !isOpen }))}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpen((o) => ({ ...o, [p.route]: !isOpen }));
                    }
                  }}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-2 text-left transition hover:bg-slate-50 outline-none"
                >
                  {isOpen ? <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />}
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[0.8125rem] text-slate-800">{p.route}</span>
                    <span className="block truncate text-[0.6875rem] text-slate-500">{p.title.replace(/\s*[|–—-]\s*Moksha Voyage\s*$/i, "")}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    {(["h1", "h2", "h3", "h4", "h5", "h6"] as const).map((k, i) => (
                      <span
                        key={k}
                        title={`${p.counts[k]} × ${k.toUpperCase()}`}
                        className={`rounded border px-1.5 py-px font-mono text-[0.6875rem] ${p.counts[k] ? LEVEL_TONE[i + 1].chip : "border-slate-100 bg-white text-slate-300"}`}
                      >
                        H{i + 1}·{p.counts[k]}
                      </span>
                    ))}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.ok ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-px text-[0.6875rem] text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" /> In order
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-px text-[0.6875rem] text-amber-800">
                        <AlertTriangle className="h-3 w-3" /> {p.problems.length} problem{p.problems.length === 1 ? "" : "s"}
                      </span>
                    )}
                    {p.awaitingDeploy && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-px text-[0.6875rem] font-medium text-sky-800">
                        ✓ Saved in CMS
                      </span>
                    )}
                    {!p.ok && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openFixModal(p);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[0.6875rem] font-medium text-indigo-700 shadow-2xs hover:bg-indigo-100 transition"
                      >
                        <Wand2 className="h-3 w-3 text-indigo-600" />
                        Fix Heading
                      </button>
                    )}
                  </div>
                </div>
                {isOpen && (
                  <div className="border-t border-slate-100">
                    {p.problems.length > 0 && (
                      <div className="border-b border-amber-100 bg-amber-50/70 p-3 space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 font-medium text-[0.75rem] text-amber-900">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                            <span>Heading problems to fix ({p.problems.length}):</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openFixModal(p)}
                              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-400 bg-indigo-600 px-3 py-1 text-[0.75rem] font-medium text-white shadow-2xs hover:bg-indigo-700 transition"
                            >
                              <Wand2 className="h-3.5 w-3.5" />
                              Fix H1 Heading
                            </button>
                            {onOpenIssues && (
                              <button
                                type="button"
                                onClick={() => onOpenIssues(p.route)}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-amber-300 bg-white px-2.5 py-1 text-[0.75rem] font-medium text-amber-900 hover:bg-amber-100 transition shadow-2xs"
                              >
                                Fix in Issues Tab →
                              </button>
                            )}
                            <a
                              href="/site-pages"
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[0.75rem] font-medium text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                            >
                              <ExternalLink className="h-3 w-3" /> Edit in CMS
                            </a>
                          </div>
                        </div>
                        <ul className="space-y-1 text-[0.75rem] text-amber-900 list-disc list-inside">
                          {p.problems.map((x) => (
                            <li key={x} className="leading-snug">{x}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Outline page={p} view={view} />
                  </div>
                )}
              </section>
            );
          })}
          <PaginationBar
            page={current}
            pageSize={pageSize}
            total={shown.length}
            noun="pages"
            onPage={setPage}
            onPageSize={(n) => {
              setPageSize(n);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Fix H1 Heading Modal */}
      {fixModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[1rem] font-semibold text-slate-900">Fix Headings for {fixModal.page.route}</h3>
                <p className="text-[0.75rem] text-slate-500">
                  Search engines need exactly one main &lt;h1&gt; heading. Pick which heading to keep as H1. Extra H1s will be converted to &lt;h2&gt;.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFixModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {fixSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[0.75rem] text-emerald-800 font-medium">
                {fixSuccess}
              </div>
            )}

            {fixError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-[0.75rem] text-rose-800">
                {fixError}
              </div>
            )}

            {!fixSuccess && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[0.75rem] font-medium text-slate-700 mb-1.5">
                    Select Main &lt;h1&gt; Heading:
                  </label>
                  <div className="space-y-1.5">
                    {fixModal.h1Candidates.map((cand, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-[0.75rem] cursor-pointer transition ${
                          !fixModal.isCustom && fixModal.selectedH1 === cand
                            ? "border-indigo-400 bg-indigo-50/70 text-indigo-950 font-medium ring-1 ring-indigo-300"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="h1Choice"
                          checked={!fixModal.isCustom && fixModal.selectedH1 === cand}
                          onChange={() => setFixModal((m) => m ? { ...m, selectedH1: cand, isCustom: false } : null)}
                          className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className="flex-1 min-w-0 break-words">
                          <span className="inline-block rounded bg-indigo-100 px-1 py-px font-mono text-[0.625rem] text-indigo-700 mr-1.5">H1</span>
                          &ldquo;{cand}&rdquo;
                        </div>
                      </label>
                    ))}

                    <label
                      className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-[0.75rem] cursor-pointer transition ${
                        fixModal.isCustom
                          ? "border-indigo-400 bg-indigo-50/70 text-indigo-950 font-medium ring-1 ring-indigo-300"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name="h1Choice"
                        checked={fixModal.isCustom}
                        onChange={() => setFixModal((m) => m ? { ...m, isCustom: true } : null)}
                        className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-slate-800">Custom H1 Heading</span>
                        {fixModal.isCustom && (
                          <input
                            type="text"
                            value={fixModal.customH1}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFixModal((m) => m ? { ...m, customH1: val } : null);
                            }}
                            placeholder="Enter descriptive H1 heading (at least 5 characters)"
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[0.75rem] text-slate-900 outline-none focus:border-indigo-500"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[0.75rem] font-medium text-slate-700 mb-1">
                    Demote Extra H1 Headings to:
                  </label>
                  <select
                    value={fixModal.extraTag}
                    onChange={(e) => setFixModal((m) => m ? { ...m, extraTag: e.target.value as "h2" | "h3" } : null)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[0.75rem] text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="h2">&lt;h2&gt; Heading 2 (Recommended for proper hierarchy)</option>
                    <option value="h3">&lt;h3&gt; Heading 3</option>
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                disabled={fixing}
                onClick={() => setFixModal(null)}
                className="cursor-pointer rounded-lg border border-slate-200 px-3 py-1.5 text-[0.75rem] font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              {!fixSuccess && (
                <button
                  type="button"
                  disabled={fixing}
                  onClick={handleApplyFix}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-600 bg-indigo-600 px-4 py-1.5 text-[0.75rem] font-medium text-white shadow-xs hover:bg-indigo-700 transition disabled:opacity-60"
                >
                  {fixing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
                  {fixing ? "Saving..." : "Apply Fix to CMS"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
