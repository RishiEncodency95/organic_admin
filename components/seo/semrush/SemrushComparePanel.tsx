"use client";

import { Fragment, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, FileUp, Loader2, UploadCloud } from "lucide-react";
import type { ComparedCheck, SemrushComparison } from "@/lib/semrushApi";
import SemrushPageReport from "./SemrushPageReport";
import {
  OURS_TONE,
  VERDICT_BAR,
  OwnerChip,
  TypeBadge,
  UrlOursChip,
  VerdictChip,
  fmtDateTime,
  oursText,
  shortUrl,
} from "./semrushUi";

type Upload = (files: { issuesCsv: string; issuesFileName: string; pagesCsv?: string; pagesFileName?: string }) => Promise<string | null>;

interface Props {
  comparison: SemrushComparison | null;
  loading: boolean;
  loadError: string | null;
  uploading: boolean;
  onUpload: Upload;
}

type Slot = { name: string; text: string } | null;

/** First header cell tells the two report files apart. */
function kindOf(text: string): "issues" | "pages" | null {
  const first = (text.split(/\r?\n/, 1)[0] ?? "").replace(/^﻿/, "").toLowerCase();
  if (first.startsWith("issue id")) return "issues";
  if (first.startsWith("page url")) return "pages";
  return null;
}

function UploadCard({ uploading, onUpload, replacing }: { uploading: boolean; onUpload: Upload; replacing: boolean }) {
  const [issues, setIssues] = useState<Slot>(null);
  const [pages, setPages] = useState<Slot>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // One box: choose the report file(s) and each is recognised by its first column.
  const choose = async (list: FileList | null) => {
    setMessage(null);
    setProblem(null);
    if (!list || list.length === 0) return;
    let nextIssues: Slot = null;
    let nextPages: Slot = null;
    const unknown: string[] = [];
    for (const file of Array.from(list)) {
      const text = await file.text();
      const kind = kindOf(text);
      if (kind === "issues") nextIssues = { name: file.name, text };
      else if (kind === "pages") nextPages = { name: file.name, text };
      else unknown.push(file.name);
    }
    if (unknown.length > 0) setProblem(`Not a site audit CSV: ${unknown.join(", ")}`);
    else if (!nextIssues) setProblem("The issues file is needed (the CSV with Issue Id, Issue Type, Failed checks). Choose it too.");
    setIssues(nextIssues);
    setPages(nextPages);
  };

  const submit = async () => {
    if (!issues) return;
    setMessage(null);
    const error = await onUpload({
      issuesCsv: issues.text,
      issuesFileName: issues.name,
      pagesCsv: pages?.text,
      pagesFileName: pages?.name,
    });
    if (error) {
      setMessage({ ok: false, text: error });
    } else {
      setMessage({ ok: true, text: "Uploaded. The comparison below is updated." });
      setIssues(null);
      setPages(null);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-3 shadow-xs">
      <div>
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-[#0b2a6b]">
          <UploadCloud className="h-4 w-4 text-emerald-600" /> {replacing ? "Upload a newer report" : "Upload your report"}
        </h2>
        <p className="mt-1 text-[11.5px] font-medium text-slate-500">
          Choose the site audit CSV you downloaded. It is compared with the audit report of this site (tab 1) and shows what is right and what is
          wrong. Choose the issues file; the mega export file can be chosen with it to see the pages behind each issue. A new upload replaces the previous one.
        </p>
      </div>
      <label
        className={`flex cursor-pointer flex-col gap-1.5 rounded-xl border-2 border-dashed p-3 transition hover:border-[#0b2a6b] hover:bg-slate-50 ${
          problem ? "border-rose-300 bg-rose-50/40" : issues ? "border-emerald-300 bg-emerald-50/40" : "border-slate-300 bg-white"
        }`}
      >
        <span className="flex items-center gap-2 text-xs font-extrabold text-[#0b2a6b]">
          <FileUp className="h-4 w-4" /> Audit report (.csv)
        </span>
        <span className={`text-xs font-bold ${problem ? "text-rose-700" : issues ? "text-emerald-700" : "text-slate-400"}`}>
          {problem ?? (issues ? `${issues.name}${pages ? `  +  ${pages.name}` : ""}` : "Click to choose the file(s). You can select both files together.")}
        </span>
        <input type="file" multiple accept=".csv,text/csv" className="sr-only" onChange={(e) => void choose(e.target.files)} />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={!issues || uploading}
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[#0b2a6b] px-4 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#0a2358] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? "Comparing…" : "Upload & compare"}
        </button>
        {message ? <span className={`text-xs font-bold ${message.ok ? "text-emerald-700" : "text-rose-700"}`}>{message.text}</span> : null}
      </div>
    </div>
  );
}

const TILE: Record<string, string> = {
  slate: "border-slate-300 bg-gradient-to-br from-slate-100 to-white text-slate-900",
  emerald: "border-emerald-300 bg-gradient-to-br from-emerald-100 to-white text-emerald-700",
  amber: "border-amber-300 bg-gradient-to-br from-amber-100 to-white text-amber-700",
  rose: "border-rose-300 bg-gradient-to-br from-rose-100 to-white text-rose-700",
  violet: "border-violet-300 bg-gradient-to-br from-violet-100 to-white text-violet-700",
};

function Tile({ label, value, sub, tone }: { label: string; value: number | string; sub?: string; tone: keyof typeof TILE }) {
  return (
    <div className={`rounded-lg border px-3 py-1.5 shadow-xs ${TILE[tone]}`}>
      <div className="text-[10px] font-extrabold uppercase tracking-wider opacity-80">{label}</div>
      <div className="text-xl font-black leading-tight">{value}</div>
      {sub ? <div className="text-[10.5px] font-semibold leading-tight opacity-80">{sub}</div> : null}
    </div>
  );
}

function Detail({ check }: { check: ComparedCheck }) {
  const box = "rounded-lg border border-slate-200 bg-white p-2";
  const title = "mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500";
  return (
    <div className="space-y-2 bg-slate-100/80 px-4 py-2 text-xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10.5px] font-extrabold text-blue-700">Report section: {check.section}</span>
        <OwnerChip owner={check.owner} />
        <VerdictChip verdict={check.verdict} />
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <div className={box}>
          <div className={title}>What it means</div>
          <p>{check.plain}</p>
        </div>
        <div className={box}>
          <div className={title}>Why it matters</div>
          <p>{check.why}</p>
        </div>
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-2">
          <div className={title}>How to fix it</div>
          <p>{check.fix}</p>
        </div>
      </div>
      <div className="rounded-lg border border-violet-200 bg-violet-50 p-2">
        <span className={title}>Where to fix it: </span>
        <span className="font-semibold text-slate-800">{check.where}</span>
        {check.ownerReason ? <span className="mt-1 block font-semibold text-indigo-700">Developer task: {check.ownerReason}</span> : null}
      </div>
      {check.ours.note ? <p className="font-medium text-slate-500">About our audit&apos;s rule: {check.ours.note}</p> : null}
      {check.semrush.urls.length > 0 ? (
        <div>
          <div className={title}>
            Pages the uploaded report flagged ({check.semrush.urls.length}
            {check.semrush.urlsTruncated ? "+" : ""}) and whether our audit sees the same page
          </div>
          <ul className="mt-1 max-h-64 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 bg-white">
            {check.semrush.urls.map((u) => (
              <li key={u.url} className="px-3 py-1.5">
                <div className="flex items-center justify-between gap-3">
                  <a href={u.url} target="_blank" rel="noreferrer" className="min-w-0 truncate font-mono text-[11px] text-blue-700 underline-offset-2 hover:underline" title={u.url}>
                    {shortUrl(u.url)}
                  </a>
                  <span className="flex shrink-0 items-center gap-2">
                    {u.count > 1 ? <span className="text-[10.5px] font-bold text-slate-500">×{u.count}</span> : null}
                    <UrlOursChip ours={u.ours} />
                  </span>
                </div>
                {u.evidence.length > 0 ? <p className="mt-0.5 break-all rounded bg-slate-100 px-2 py-0.5 font-mono text-[10.5px] text-slate-700">Our crawl saw: {u.evidence.join(" · ")}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {check.ours.urls.length > 0 ? (
        <div>
          <div className={title}>Pages our audit flagged ({check.ours.urls.length})</div>
          <ul className="mt-1 max-h-48 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200 bg-white">
            {check.ours.urls.map((u) => (
              <li key={u} className="truncate px-3 py-1">
                <a href={u} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-blue-700 underline-offset-2 hover:underline" title={u}>
                  {shortUrl(u)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ChecksTable({ title, note, checks, empty }: { title: string; note: string; checks: ComparedCheck[]; empty: string }) {
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (id: number) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-300 bg-white shadow-xs">
      <div className="bg-[#0b2a6b] px-4 py-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
          {title} ({checks.length})
        </h3>
        <p className="text-[11px] font-medium text-blue-100">{note}</p>
      </div>
      {checks.length === 0 ? (
        <p className="px-5 py-6 text-xs font-bold text-slate-500">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-600">
                <th className="w-8 px-3 py-2" />
                <th className="px-2 py-2">Check</th>
                <th className="px-2 py-2">Uploaded report</th>
                <th className="px-2 py-2">Our audit</th>
                <th className="px-2 py-2">Result</th>
                <th className="px-2 py-2">Who fixes it</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => {
                const isOpen = open.has(c.id);
                return (
                  <Fragment key={c.id}>
                    <tr className={`cursor-pointer border-b border-slate-200 hover:brightness-95 ${VERDICT_BAR[c.verdict]}`} onClick={() => toggle(c.id)}>
                      <td className="px-3 py-1.5 text-slate-400">{isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                      <td className="px-2 py-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <TypeBadge type={c.type} />
                        </div>
                      </td>
                      <td className="px-2 py-1.5 font-bold text-slate-800">
                        {c.semrush.failed > 0 ? (
                          <>
                            {c.semrush.failed} failed
                            {c.semrush.urls.length > 0 ? (
                              <span className="block text-[11px] font-medium text-slate-500">
                                on {c.semrush.urls.length} {c.semrush.urls.length === 1 ? "page" : "pages"}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <span className="font-medium text-slate-500">Passed</span>
                        )}
                      </td>
                      <td className={`px-2 py-1.5 font-bold ${OURS_TONE[c.ours.status]}`}>{oursText(c.ours.status, c.ours.found, c.ours.total)}</td>
                      <td className="px-2 py-1.5">
                        <VerdictChip verdict={c.verdict} />
                      </td>
                      <td className="px-2 py-1.5">
                        <OwnerChip owner={c.owner} />
                      </td>
                    </tr>
                    {isOpen ? (
                      <tr className="border-b border-slate-100">
                        <td colSpan={6} className="p-0">
                          <Detail check={c} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function SemrushComparePanel({ comparison, loading, loadError, uploading, onUpload }: Props) {
  const semrushFound = comparison?.checks.filter((c) => c.semrush.failed > 0) ?? [];
  const oursOnly = comparison?.checks.filter((c) => c.verdict === "ours_only") ?? [];
  const passed = comparison?.checks.filter((c) => c.semrush.failed === 0 && c.verdict !== "ours_only") ?? [];
  const notChecked = passed.filter((c) => c.ours.status === "not_checked");

  return (
    <div className="space-y-3">
      <UploadCard uploading={uploading} onUpload={onUpload} replacing={Boolean(comparison)} />

      {loadError ? (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700">
          <AlertTriangle className="h-4 w-4" /> {loadError}
        </div>
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-8 text-xs font-bold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the report…
        </div>
      ) : !comparison ? (
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-xs font-bold text-slate-500">
          No report uploaded yet. Choose the two files above and the comparison will appear here.
        </div>
      ) : (
        <>
          {/* Where the two reports come from */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-medium text-indigo-900 shadow-xs">
            <span>
              <b className="text-slate-900">Uploaded report</b> · {comparison.issuesFileName ?? "issues file"}
              {comparison.pagesFileName ? ` + ${comparison.pagesFileName}` : " (no page list)"} · uploaded {fmtDateTime(comparison.uploadedAt)} ·{" "}
              {comparison.semrush.checks} checks
              {comparison.semrush.pages !== null ? `, ${comparison.semrush.pages} pages` : ""}
            </span>
            <span>
              <b className="text-slate-900">Our audit</b> ·{" "}
              {comparison.ours.available
                ? `last run ${fmtDateTime(comparison.ours.runAt)} · ${comparison.ours.pagesCrawled} pages crawled · has an equivalent for ${comparison.ours.checksCovered} of the report's ${comparison.semrush.checks} checks`
                : "never run"}
            </span>
          </div>

          {!comparison.ours.available ? (
            <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Our audit has not been run yet, so nothing can be compared. Open &quot;1. Page SEO Audit&quot;, run an audit, and come back.
            </div>
          ) : comparison.ours.semrushPagesNotCrawled ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600">
              <AlertTriangle className="h-4 w-4 shrink-0 text-slate-400" /> The uploaded report covers {comparison.ours.semrushPagesNotCrawled} page(s) that our audit did not
              (our audit only crawls the pages listed in the sitemap). Those pages show &quot;Ours: not crawled&quot;.
            </div>
          ) : null}

          {/* One-page summary */}
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-6">
            <Tile
              label="Both reports agree"
              value={`${comparison.counts.both + comparison.counts.clean} of ${comparison.checks.length}`}
              sub="Same answer on each check"
              tone="slate"
            />
            <Tile
              label="Report found"
              value={comparison.semrush.failing}
              sub={`${comparison.semrush.errors} errors · ${comparison.semrush.warnings} warnings · ${comparison.semrush.notices} notices`}
              tone="slate"
            />
            <Tile label="Found by both" value={comparison.counts.both} sub="Both reports agree" tone="emerald" />
            <Tile label="Only uploaded report" value={comparison.counts.semrush_only} sub="Our audit checks it, found nothing" tone="amber" />
            <Tile label="Our audit has no such check" value={comparison.counts.not_checked} sub="The report found it, we cannot see it" tone="rose" />
            <Tile label="Only our audit" value={comparison.counts.ours_only} sub="The uploaded report passed it" tone="violet" />
          </div>

          <SemrushPageReport comparison={comparison} />

          <details className="group">
            <summary className="cursor-pointer rounded-lg border border-blue-300 bg-blue-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0b2a6b] shadow-xs">
              Issue-by-issue table: uploaded report vs our audit ({semrushFound.length})
            </summary>
            <div className="mt-2">
          <ChecksTable
            title="All problems, issue by issue (uploaded report vs our audit)"
            note="The same problems as above, grouped by issue. Click a row to see the pages behind it and whether our audit sees the same page."
            checks={semrushFound}
            empty="The uploaded report found no problems."
          />
            </div>
          </details>

          <ChecksTable
            title="Only our audit found"
            note="Our audit reports these but the matching check in the uploaded report passed."
            checks={oursOnly}
            empty="Nothing: every problem our audit reports, the uploaded report finds too."
          />

          <details className="rounded-lg border border-emerald-300 bg-emerald-50/50 shadow-xs">
            <summary className="cursor-pointer rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
              Passed in the uploaded report ({passed.length}) — our audit has no check for {notChecked.length} of them
            </summary>
            <ul className="grid gap-x-6 gap-y-1 border-t border-slate-200 px-5 py-3 text-xs md:grid-cols-2">
              {passed.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-0.5">
                  <span className="truncate font-medium text-slate-700" title={c.name}>
                    {c.name}
                  </span>
                  <span className={`shrink-0 text-[11px] font-bold ${c.ours.status === "clean" ? "text-emerald-700" : "text-slate-400"}`}>
                    {c.ours.status === "clean" ? "OK in both" : c.ours.status === "not_checked" ? "not in our audit" : "OK in uploaded report"}
                  </span>
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}
