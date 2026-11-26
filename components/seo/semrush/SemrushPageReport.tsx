"use client";

import { useMemo, useState } from "react";
import { Globe, Search } from "lucide-react";
import type { ComparedCheck, SemrushComparison, UrlOurs } from "@/lib/semrushApi";
import { OwnerChip, TYPE_BAR, TypeBadge, UrlOursChip } from "./semrushUi";

/** "https://site.com/services/pind-daan" -> { name: "Pind Daan", path: "/services/pind-daan" } */
function describePage(url: string): { name: string; path: string } {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (u.hostname.startsWith("admin.")) return { name: `Admin site: ${path}`, path: `${u.hostname}${path}` };
    if (u.hostname.startsWith("www.")) return { name: "Home Page (www address)", path: `${u.hostname}${path}` };
    if (u.protocol === "http:") return { name: `${path === "/" ? "Home Page" : path} (http address, no https)`, path: `http://${u.hostname}${path}` };
    if (path === "/") return { name: "Home Page", path: "/" };
    const last = path.split("/").filter(Boolean).pop() ?? path;
    const name = last
      .replace(/\.[a-z]+$/i, "")
      .split(/[-_]/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
    return { name, path };
  } catch {
    return { name: url, path: url };
  }
}

interface PageProblem {
  check: ComparedCheck;
  count: number;
  ours: UrlOurs;
  evidence: string[];
}

const WHOLE_SITE_LIMIT = 100;

export default function SemrushPageReport({ comparison }: { comparison: SemrushComparison }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const { pages, wholeSite, hasPageList } = useMemo(() => {
    const failing = comparison.checks.filter((c) => c.semrush.failed > 0);
    const hasList = comparison.semrush.pages !== null;
    // On most pages = it sits in the shared header/footer/template: shown once, not on every page.
    const whole = failing.filter((c) => c.semrush.sitewide || c.semrush.urls.length === 0);
    const perPage = new Map<string, PageProblem[]>();
    for (const check of failing) {
      if (check.semrush.sitewide || check.semrush.urls.length === 0) continue;
      for (const u of check.semrush.urls) {
        perPage.set(u.url, [...(perPage.get(u.url) ?? []), { check, count: u.count, ours: u.ours, evidence: u.evidence }]);
      }
    }
    const rank = { ERROR: 0, WARNING: 1, NOTICE: 2 } as const;
    const rows = Array.from(perPage.entries())
      .map(([url, problems]) => ({
        url,
        ...describePage(url),
        problems: problems.sort((a, b) => rank[a.check.type] - rank[b.check.type]),
      }))
      .sort(
        (a, b) =>
          b.problems.filter((p) => p.check.type === "ERROR").length - a.problems.filter((p) => p.check.type === "ERROR").length ||
          b.problems.length - a.problems.length ||
          a.url.localeCompare(b.url),
      );
    return { pages: rows, wholeSite: whole, hasPageList: hasList };
  }, [comparison]);

  const shown = pages.filter((p) => !query.trim() || `${p.name} ${p.path}`.toLowerCase().includes(query.trim().toLowerCase()));
  const toggle = (url: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });

  return (
    <div className="space-y-5">
      {/* Problems that are the same on (almost) every page */}
      {wholeSite.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-indigo-300 bg-white shadow-xs">
          <div className="flex items-start gap-2.5 border-b border-indigo-300 bg-indigo-100 px-4 py-1.5">
            <Globe className="mt-0.5 h-4 w-4 shrink-0 text-indigo-700" />
            <div>
              <h3 className="text-sm font-extrabold text-indigo-900">Problems on the whole site ({wholeSite.length})</h3>
              <p className="text-[11.5px] font-medium text-indigo-800">
                {hasPageList
                  ? "These show up on almost every page, so the cause is one shared place (header, footer or page template). Fix it once and it is fixed everywhere. They are not repeated in the page cards below."
                  : "Upload the mega export file as well to see which pages each problem is on."}
              </p>
            </div>
          </div>
          <ul className="divide-y divide-slate-100">
            {wholeSite.slice(0, WHOLE_SITE_LIMIT).map((c) => (
              <li key={c.id} className={`space-y-0.5 px-4 py-1.5 text-xs ${TYPE_BAR[c.type]}`}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <TypeBadge type={c.type} />
                  <span className="text-[12.5px] font-semibold text-slate-900">{c.name}</span>
                  <OwnerChip owner={c.owner} />
                  <span className="text-[11px] font-normal text-slate-500">
                    {c.semrush.urls.length > 0 ? `on ${c.semrush.urls.length} of ${comparison.semrush.pages} pages` : `${c.semrush.failed} found`}
                  </span>
                </div>
                <p className="font-normal text-slate-800">{c.plain}</p>
                <p className="text-[11.5px] font-normal text-slate-600">
                  <span className="font-medium">Why:</span> {c.why} <span className="font-medium">Do:</span> {c.fix}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* One card per page */}
      {hasPageList ? (
        <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b2a6b] px-4 py-2">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Page by page: what is wrong where ({pages.length} pages)</h3>
              <p className="text-[11px] font-medium text-blue-100">Only problems that belong to that page. Click a page to open it.</p>
            </div>
            <label className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a page, e.g. about"
                className="h-9 w-56 rounded-lg border border-slate-300 bg-white pl-8 pr-3 text-xs font-bold outline-none focus:border-emerald-600"
              />
            </label>
          </div>
          {shown.length === 0 ? (
            <p className="px-5 py-6 text-xs font-bold text-slate-500">{pages.length === 0 ? "No page has its own problem. Everything is in the whole-site list above." : "No page matches."}</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {shown.map((p) => {
                const isOpen = open.has(p.url);
                const errors = p.problems.filter((x) => x.check.type === "ERROR").length;
                const warnings = p.problems.filter((x) => x.check.type === "WARNING").length;
                const notices = p.problems.filter((x) => x.check.type === "NOTICE").length;
                const worst = errors > 0 ? "ERROR" : warnings > 0 ? "WARNING" : "NOTICE";
                return (
                  <li key={p.url} className={TYPE_BAR[worst]}>
                    <button
                      type="button"
                      onClick={() => toggle(p.url)}
                      className="flex w-full cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-1.5 text-left hover:bg-white/60"
                    >
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-extrabold text-slate-900">{p.name}</span>
                        <span className="block truncate font-mono text-[11px] text-slate-500">{p.path}</span>
                      </span>
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold">
                        {errors > 0 ? <span className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-red-700">{errors} error{errors > 1 ? "s" : ""}</span> : null}
                        {warnings > 0 ? <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">{warnings} warning{warnings > 1 ? "s" : ""}</span> : null}
                        {notices > 0 ? <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-sky-700">{notices} notice{notices > 1 ? "s" : ""}</span> : null}
                      </span>
                    </button>
                    {isOpen ? (
                      <ul className="space-y-1 bg-white/70 px-4 pb-2 pt-1">
                        {p.problems.map(({ check, count, ours, evidence }) => (
                          <li key={check.id} className={`rounded-md border border-slate-200 px-3 py-1.5 text-xs ${TYPE_BAR[check.type]}`}>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <TypeBadge type={check.type} />
                              <span className="text-[12.5px] font-extrabold text-slate-900">{check.name}</span>
                              {count > 1 ? <span className="text-[11px] font-bold text-slate-500">×{count}</span> : null}
                              <OwnerChip owner={check.owner} />
                              <UrlOursChip ours={ours} />
                            </div>
                            <p className="mt-1 font-semibold text-slate-800">{check.plain}</p>
                            {evidence.length > 0 ? (
                              <p className="mt-0.5 rounded bg-white/80 px-2 py-0.5 font-mono text-[11px] text-slate-700">Our live crawl saw: {evidence.join(" · ")}</p>
                            ) : null}
                            <p className="mt-0.5 text-[11.5px] font-medium text-slate-600">
                              <b>Why:</b> {check.why} <b>Do:</b> {check.fix}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
