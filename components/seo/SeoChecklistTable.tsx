"use client";

import { Fragment, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ListChecks } from "lucide-react";
import type { ChecklistEntry } from "@/lib/seoCheckupData";

type Filter = "all" | "failed" | "warning" | "passed" | "not_measured";

const PRIORITY = {
  ERROR: { label: "HIGH", cls: "border-red-200 bg-red-50 text-red-700" },
  WARNING: { label: "MEDIUM", cls: "border-amber-200 bg-amber-50 text-amber-800" },
  NOTICE: { label: "LOW", cls: "border-sky-200 bg-sky-50 text-sky-700" },
} as const;

const STATUS = {
  failed: { label: "FAIL", cls: "bg-red-100 text-red-700 border-red-200", row: "border-l-4 border-l-red-500 bg-red-50/40" },
  warning: { label: "WARNING", cls: "bg-amber-100 text-amber-800 border-amber-200", row: "border-l-4 border-l-amber-500 bg-amber-50/40" },
  passed: { label: "PASSED", cls: "bg-emerald-100 text-emerald-700 border-emerald-200", row: "border-l-4 border-l-emerald-500" },
  not_measured: { label: "NOT MEASURED", cls: "bg-slate-100 text-slate-600 border-slate-200", row: "border-l-4 border-l-slate-300 bg-slate-50/60" },
} as const;

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: "all", label: "All" },
  { key: "failed", label: "Failed" },
  { key: "warning", label: "Warnings" },
  { key: "passed", label: "Passed" },
  { key: "not_measured", label: "Not measured" },
];

/** Every one of the 101 site audit checks for the selected route, in order, with its result. */
function pageLabel(route: string): string {
  const path = route.replace(/\/+$/, "") || "/";
  if (path === "/") return "Home Page";
  return (path.split("/").filter(Boolean).pop() ?? path)
    .split(/[-_]/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export default function SeoChecklistTable({ checklist, route, url }: { checklist: ChecklistEntry[]; route: string; url?: string }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<Set<number>>(new Set());

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: checklist.length, failed: 0, warning: 0, passed: 0, not_measured: 0 };
    for (const item of checklist) c[item.status] += 1;
    return c;
  }, [checklist]);

  const shown = filter === "all" ? checklist : checklist.filter((c) => c.status === filter);
  const toggle = (id: number) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div id="report-checklist" className="report-section space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-xs scroll-mt-32">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          <ListChecks className="h-4.5 w-4.5 text-blue-600" />
          Site Audit Checklist ({checklist.length} checks)
        </h3>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-bold transition ${
                filter === f.key ? "border-[#0b2a6b] bg-[#0b2a6b] text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {f.label} {counts[f.key]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700">Results for this page</span>
        <span className="text-sm font-black text-[#0b2a6b]">{pageLabel(route)}</span>
        <span className="font-mono text-xs font-semibold text-slate-700">{url ?? route}</span>
        <span className="text-[11px] font-medium text-slate-600">
          Change the page with &quot;Select Page Route&quot; at the top. Rows marked &quot;Site-wide&quot; are the same for every page.
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="w-8 px-2 py-2.5" />
              <th className="px-2 py-2.5">#</th>
              <th className="px-2 py-2.5">Priority</th>
              <th className="px-2 py-2.5">Status</th>
              <th className="px-2 py-2.5">Check</th>
              <th className="px-2 py-2.5">Result for this route</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => {
              const isOpen = open.has(c.id);
              const hasMore = true;
              return (
                <Fragment key={c.id}>
                  <tr
                    className={`border-b border-slate-100 ${STATUS[c.status].row} ${hasMore ? "cursor-pointer hover:brightness-95" : ""}`}
                    onClick={() => hasMore && toggle(c.id)}
                  >
                    <td className="px-2 py-1.5 text-slate-400">{hasMore ? isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" /> : null}</td>
                    <td className="px-2 py-1.5 font-mono text-[11px] text-slate-500">{c.id}</td>
                    <td className="px-2 py-1.5">
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${PRIORITY[c.type].cls}`}>{PRIORITY[c.type].label}</span>
                    </td>
                    <td className="px-2 py-1.5">
                      <span className={`whitespace-nowrap rounded border px-2 py-0.5 text-[10px] font-extrabold ${STATUS[c.status].cls}`}>{STATUS[c.status].label}</span>
                    </td>
                    <td className="px-2 py-1.5 font-semibold text-slate-900">
                      {c.name}
                      <span className="ml-2 rounded bg-blue-50 px-1.5 py-px text-[9px] font-bold uppercase text-blue-700">{c.section}</span>
                      {c.scope === "site" ? <span className="ml-1 rounded bg-slate-100 px-1.5 py-px text-[9px] font-bold uppercase text-slate-500">Site-wide</span> : null}
                    </td>
                    <td className="px-2 py-1.5 text-slate-700">
                      {c.summary}
                      {(c.affectedTotal ?? 0) > 0 ? (
                        <span className="ml-2 whitespace-nowrap rounded bg-red-100 px-1.5 py-px text-[10px] font-extrabold text-red-700">
                          Whole site: {c.affectedTotal} page{c.affectedTotal === 1 ? "" : "s"}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                  {isOpen ? (
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <td colSpan={6} className="px-4 py-3 text-[11.5px] text-slate-700">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10.5px] font-extrabold text-blue-700" title="The group of the audit report this check belongs to. Its card is further down this page.">Report section: {c.section}</span>
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10.5px] font-extrabold ${
                              c.owner === "developer" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-teal-200 bg-teal-50 text-teal-700"
                            }`}
                          >
                            Fixed by: {c.owner === "developer" ? "Developer" : "SEO team"}
                          </span>
                          <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-bold text-slate-600">
                            {c.scope === "site" ? "Same for the whole site" : "Result is for this page"}
                          </span>
                        </div>
                        <div className="mb-2 rounded-lg border border-violet-200 bg-violet-50 p-2.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-violet-700">Where to fix it: </span>
                          <span className="font-semibold text-slate-800">{c.where}</span>
                        </div>
                        <div className="grid gap-2 md:grid-cols-3">
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                            <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">What it means</div>
                            <p>{c.what}</p>
                          </div>
                          <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                            <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Why it matters</div>
                            <p>{c.why}</p>
                          </div>
                          <div className={`rounded-lg border p-2.5 ${c.status === "failed" || c.status === "warning" ? "border-amber-300 bg-amber-50" : "border-slate-200 bg-white"}`}>
                            <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                              {c.status === "failed" || c.status === "warning" ? "How to fix it" : "How to fix it, if this ever fails"}
                            </div>
                            <p>{c.fix}</p>
                          </div>
                        </div>
                        {(c.affectedTotal ?? 0) > 0 ? (
                          <div className="mt-2 rounded-lg border border-red-200 bg-red-50/60 p-2.5">
                            <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                              Whole website: pages where this problem is ({c.affectedTotal}
                              {c.affectedTotal > c.affectedPages.length ? `, first ${c.affectedPages.length} shown` : ""})
                            </div>
                            <ul className="grid gap-x-4 gap-y-0.5 md:grid-cols-2">
                              {c.affectedPages.map((u) => (
                                <li key={u} className="flex min-w-0 items-center gap-1.5">
                                  <a href={u} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-blue-700 underline-offset-2 hover:underline" title={u}>
                                    {u.replace(/^https?:\/\//, "")}
                                  </a>
                                  {url && u.replace(/\/+$/, "") === url.replace(/\/+$/, "") ? (
                                    <span className="shrink-0 rounded bg-blue-600 px-1.5 py-px text-[9px] font-extrabold uppercase text-white">this page</span>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : c.scope === "page" && c.status === "passed" && c.affectedTotal === 0 ? (
                          <p className="mt-2 text-[11px] font-medium text-emerald-700">No page on the whole website has this problem.</p>
                        ) : null}
                        {(c.evidence ?? []).length > 0 ? (
                          <div className="mt-2 space-y-1">
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{c.scope === "site" ? "Measured for the whole site" : "Found on this route"}</div>
                            {(c.evidence ?? []).map((line, i) => (
                              <p key={i} className="break-all rounded bg-white px-2 py-1 font-mono text-[11px]">
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] font-medium text-slate-500">
        Click any row to see its section, who fixes it, why it matters and how to fix it. Every result is measured live in the latest audit. &quot;Not measured&quot; means this audit cannot check that item (and says why), or the stored audit
        predates it. Run &quot;Re-Audit Page&quot; to refresh.
      </p>
    </div>
  );
}
