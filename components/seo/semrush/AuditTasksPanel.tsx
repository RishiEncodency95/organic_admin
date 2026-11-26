"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Code2, Loader2, Search } from "lucide-react";
import type { AuditTask, AuditTaskList, FixedItem, TaskStatus } from "@/lib/auditTasksApi";
import { fmtDateTime } from "./semrushUi";

interface Props {
  data: AuditTaskList | null;
  loading: boolean;
  error: string | null;
  onSetStatus: (checkId: number, status: TaskStatus, note?: string) => void;
}

const PRIORITY = {
  high: { label: "HIGH", cls: "border-red-300 bg-red-100 text-red-800", bar: "border-l-4 border-l-red-500 bg-red-50/50" },
  medium: { label: "MEDIUM", cls: "border-amber-300 bg-amber-100 text-amber-900", bar: "border-l-4 border-l-amber-500 bg-amber-50/50" },
  low: { label: "LOW", cls: "border-sky-300 bg-sky-100 text-sky-800", bar: "border-l-4 border-l-sky-500 bg-sky-50/50" },
} as const;

const STATUS: Array<{ value: TaskStatus; label: string }> = [
  { value: "open", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const shortUrl = (u: string) => u.replace(/^https?:\/\//, "");

function Block({ title, children, tone = "slate" }: { title: string; children: React.ReactNode; tone?: "slate" | "amber" | "violet" }) {
  const cls = tone === "amber" ? "border-amber-300 bg-amber-50" : tone === "violet" ? "border-violet-200 bg-violet-50" : "border-slate-200 bg-white";
  return (
    <div className={`rounded-lg border p-2 ${cls}`}>
      <div className="mb-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{title}</div>
      <div className="text-[11.5px] leading-snug text-slate-800">{children}</div>
    </div>
  );
}

function TaskCard({ task, onSetStatus }: { task: AuditTask; onSetStatus: Props["onSetStatus"] }) {
  const [open, setOpen] = useState(false);
  const [allPages, setAllPages] = useState(false);
  const [note, setNote] = useState(task.note ?? "");
  const p = PRIORITY[task.priority];
  const done = task.status === "done";
  const pages = allPages ? task.affectedPages : task.affectedPages.slice(0, 8);

  return (
    <div className={`rounded-lg border border-slate-200 shadow-xs ${done ? "border-l-4 border-l-emerald-500 bg-emerald-50/60 opacity-70" : p.bar}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full cursor-pointer items-start gap-2 p-3 text-left">
        <span className="mt-0.5 text-slate-400">{open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-extrabold ${p.cls}`}>{p.label}</span>
            <span className={`text-[13px] font-extrabold ${done ? "text-slate-500 line-through" : "text-slate-900"}`}>{task.title}</span>
            <span className="rounded bg-blue-50 px-1.5 py-px text-[9px] font-bold uppercase text-blue-700">{task.section}</span>
            {task.scope === "site" ? (
              <span className="rounded bg-slate-200 px-1.5 py-px text-[9px] font-bold uppercase text-slate-700">Whole site</span>
            ) : (
              <span className="rounded bg-red-100 px-1.5 py-px text-[9px] font-extrabold text-red-700">
                {task.affectedTotal} of {task.pagesChecked || "?"} pages
              </span>
            )}
            {task.sitewide ? <span className="rounded bg-indigo-100 px-1.5 py-px text-[9px] font-bold uppercase text-indigo-700">Fix once in layout</span> : null}
            {task.inUploadedReport ? <span className="rounded bg-emerald-100 px-1.5 py-px text-[9px] font-bold uppercase text-emerald-700">Also in uploaded report</span> : null}
            {task.source === "uploaded_only" ? <span className="rounded bg-slate-200 px-1.5 py-px text-[9px] font-bold uppercase text-slate-600">Not checked by our audit</span> : null}
          </span>
          <span className="mt-1 block text-xs font-medium text-slate-700">{task.what}</span>
        </span>
      </button>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 px-3 py-1.5">
        <span className="text-[11px] font-semibold text-slate-500">{task.where}</span>
        <select
          value={task.status}
          onChange={(e) => onSetStatus(task.checkId, e.target.value as TaskStatus, note)}
          className={`h-7 cursor-pointer rounded-lg border px-2 text-xs font-bold outline-none focus:border-emerald-600 ${
            done ? "border-emerald-300 bg-emerald-50 text-emerald-700" : task.status === "in_progress" ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-300 bg-white text-slate-700"
          }`}
          aria-label="Status"
        >
          {STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {open ? (
        <div className="space-y-2 border-t border-slate-200/70 bg-white/70 p-3">
          <div className="grid gap-2 md:grid-cols-2">
            <Block title="Why it matters">{task.why}</Block>
            <Block title="How to fix it" tone="amber">
              {task.fix}
            </Block>
          </div>
          <Block title="Where to fix it" tone="violet">
            {task.where}
            {task.ownerReason ? <span className="mt-1 block font-semibold text-indigo-700">Developer task: {task.ownerReason}</span> : null}
          </Block>
          {task.evidence.length > 0 ? (
            <Block title="What the audit found">
              {task.evidence.map((line, i) => (
                <span key={i} className="mb-0.5 block break-all rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px]">
                  {line}
                </span>
              ))}
            </Block>
          ) : null}
          {task.affectedPages.length > 0 ? (
            <div className="rounded-lg border border-red-200 bg-red-50/60 p-2">
              <div className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-red-700">
                Pages with this problem ({task.affectedTotal}) — click to open
              </div>
              <ul className="grid gap-x-4 gap-y-0.5 md:grid-cols-2">
                {pages.map((u) => (
                  <li key={u} className="min-w-0 truncate">
                    <a href={u} target="_blank" rel="noreferrer" className="font-mono text-[11px] text-blue-700 underline-offset-2 hover:underline" title={u}>
                      {shortUrl(u)}
                    </a>
                  </li>
                ))}
              </ul>
              {task.affectedPages.length > 8 ? (
                <button type="button" onClick={() => setAllPages((v) => !v)} className="mt-1 cursor-pointer text-[11px] font-bold text-[#0b2a6b] hover:underline">
                  {allPages ? "Show fewer" : `Show all ${task.affectedPages.length}`}
                </button>
              ) : null}
            </div>
          ) : null}
          <label className="block">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Note (saved when you click away)</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => note !== (task.note ?? "") && onSetStatus(task.checkId, task.status, note)}
              placeholder="e.g. waiting for the host, fixed in the footer"
              className="mt-0.5 h-8 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs outline-none focus:border-emerald-600"
            />
          </label>
          {task.updatedAt ? <p className="text-[10.5px] font-medium text-slate-400">Last updated {fmtDateTime(task.updatedAt)}</p> : null}
        </div>
      ) : null}
    </div>
  );
}

function Column({ owner, tasks, onSetStatus, hideDone }: { owner: "developer" | "seo"; tasks: AuditTask[]; onSetStatus: Props["onSetStatus"]; hideDone: boolean }) {
  const isDev = owner === "developer";
  const open = tasks.filter((t) => t.status !== "done").length;
  const shown = (hideDone ? tasks.filter((t) => t.status !== "done") : tasks).slice().sort((a, b) => Number(a.status === "done") - Number(b.status === "done"));
  return (
    <section className="space-y-2">
      <div className={`flex items-center justify-between rounded-lg border px-4 py-2 ${isDev ? "border-indigo-400 bg-gradient-to-r from-indigo-200 to-indigo-50" : "border-teal-400 bg-gradient-to-r from-teal-200 to-teal-50"}`}>
        <div className="flex items-center gap-2.5">
          {isDev ? <Code2 className="h-5 w-5 text-indigo-700" /> : <Search className="h-5 w-5 text-teal-700" />}
          <div>
            <h3 className={`text-sm font-extrabold ${isDev ? "text-indigo-900" : "text-teal-900"}`}>{isDev ? "Developer tasks" : "SEO tasks"}</h3>
            <p className={`text-[11px] font-medium ${isDev ? "text-indigo-700" : "text-teal-700"}`}>
              {isDev ? "Code, templates, server, DNS and sitemap changes" : "Titles, headings, content and internal links, done from the admin"}
            </p>
          </div>
        </div>
        <div className={`text-right text-xs font-extrabold ${isDev ? "text-indigo-900" : "text-teal-900"}`}>
          {open} to do
          <div className="text-[11px] font-medium opacity-80">{tasks.length - open} done</div>
        </div>
      </div>
      {shown.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-5 text-center text-xs font-bold text-slate-500">{tasks.length === 0 ? "No tasks here." : "Everything here is done."}</p>
      ) : (
        shown.map((t) => <TaskCard key={t.checkId} task={t} onSetStatus={onSetStatus} />)
      )}
    </section>
  );
}

function FixedList({ items }: { items: FixedItem[] }) {
  if (items.length === 0) return null;
  return (
    <details className="rounded-lg border border-emerald-300 bg-emerald-50/50">
      <summary className="cursor-pointer rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-900">
        <CheckCircle2 className="mr-1 inline h-4 w-4" /> Verified fixed ({items.length})
      </summary>
      <ul className="divide-y divide-emerald-100 px-3 py-1 text-xs">
        {items.map((i) => (
          <li key={i.checkId} className="flex flex-wrap items-center justify-between gap-2 py-1.5">
            <span className="font-semibold text-slate-800">
              {i.title} <span className="rounded bg-blue-50 px-1.5 py-px text-[9px] font-bold uppercase text-blue-700">{i.section}</span>
            </span>
            <span className="text-[11px] font-medium text-emerald-800">{i.reason}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export default function AuditTasksPanel({ data, loading, error, onSetStatus }: Props) {
  const [hideDone, setHideDone] = useState(false);
  const [section, setSection] = useState<string>("All");

  const sections = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of data?.tasks ?? []) counts.set(t.section, (counts.get(t.section) ?? 0) + 1);
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-8 text-xs font-bold text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading tasks…
      </div>
    );
  }
  if (!data) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-xs font-bold text-slate-600">
        {error ?? "No audit has been run yet. Open tab 1 (Page SEO Audit) and run an audit: the task list is built from it."}
      </div>
    );
  }

  const tasks = section === "All" ? data.tasks : data.tasks.filter((t) => t.section === section);
  const developer = tasks.filter((t) => t.owner === "developer");
  const seo = tasks.filter((t) => t.owner === "seo");
  const finished = data.tasks.filter((t) => t.status === "done").length;
  const high = data.tasks.filter((t) => t.priority === "high" && t.status !== "done").length;

  return (
    <div className="space-y-3">
      <div className="space-y-1.5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 shadow-xs">
        <p className="text-xs font-medium text-slate-700">
          <b className="text-slate-900">{data.tasks.length} tasks</b> from the audit of {fmtDateTime(data.generatedFrom.auditRunAt)} ({data.generatedFrom.pagesCrawled} pages crawled) ·{" "}
          <b className="text-red-700">{high} high priority open</b> · {finished} marked done · {data.fixed.length} verified fixed.
        </p>
        <p className="text-[11px] font-medium text-slate-600">
          Tasks come from this site&apos;s own audit, so they close by themselves: after you fix something, run &quot;Re-Audit Page&quot; in tab 1 and it moves to &quot;Verified
          fixed&quot;.
          {data.generatedFrom.uploadedReport ? ` Tasks also found by the uploaded report (${data.generatedFrom.uploadedReport}) are marked.` : ""}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {[["All", data.tasks.length] as [string, number], ...sections].map(([name, count]) => (
            <button
              key={name}
              type="button"
              onClick={() => setSection(name)}
              className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-bold transition ${
                section === name ? "border-[#0b2a6b] bg-[#0b2a6b] text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {name} {count}
            </button>
          ))}
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} className="h-4 w-4 cursor-pointer accent-[#0b2a6b]" />
          Hide done
        </label>
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700">
          <AlertTriangle className="h-4 w-4" /> {error}
        </div>
      ) : null}

      {data.tasks.length === 0 ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-8 text-center text-xs font-bold text-emerald-700">The latest audit found nothing to fix.</div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <Column owner="developer" tasks={developer} onSetStatus={onSetStatus} hideDone={hideDone} />
          <Column owner="seo" tasks={seo} onSetStatus={onSetStatus} hideDone={hideDone} />
        </div>
      )}

      <FixedList items={data.fixed} />
    </div>
  );
}
