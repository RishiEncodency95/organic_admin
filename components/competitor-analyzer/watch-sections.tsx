"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BellRing, CalendarClock, Mail, Search, Send } from "lucide-react";
import { ApiError } from "@/components/infrastructure/lib/errors";
import { cn } from "@/components/infrastructure/lib/cn";
import { Chip, WButton } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/kit";
import { formatDateTime } from "@/components/competitor-analyzer/source/features/admin/website/data/selectors";
import type { OwnSearch, Schedule, StudyDetail } from "@/components/competitor-analyzer/api";
import { useStudyMutations } from "@/components/competitor-analyzer/hooks";

const errorText = (err: unknown, fallback: string) => (ApiError.isApiError(err) ? err.message : err instanceof Error ? err.message : fallback);
const fmt = (n: number) => n.toLocaleString("en-IN");

/** Automatic re-checks, change alerts and the monthly PDF e-mail, plus "e-mail the report now". */
export function WatchPanel({ study, onClose }: { study: StudyDetail; onClose: () => void }) {
  const { settings: save, emailReport } = useStudyMutations();
  const current = study.settings ?? { schedule: "off" as Schedule, alerts: false, reportEmails: [], reportMonthly: false };
  const [schedule, setSchedule] = useState<Schedule>(current.schedule);
  const [alerts, setAlerts] = useState(current.alerts);
  const [monthly, setMonthly] = useState(current.reportMonthly);
  const [emails, setEmails] = useState(current.reportEmails.join(", "));
  const list = emails.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean);

  const submit = () =>
    save.mutate(
      { id: study.id, body: { schedule, alerts, reportMonthly: monthly, reportEmails: list } },
      { onSuccess: () => toast.success("Saved. The analysis will keep watch for you."), onError: (e) => toast.error(errorText(e, "Could not save")) },
    );
  const sendNow = () =>
    emailReport.mutate(
      { id: study.id, to: list },
      { onSuccess: (r) => toast.success(`Report e-mailed to ${r.to.join(", ")}`), onError: (e) => toast.error(errorText(e, "The report could not be e-mailed"), { duration: 8000 }) },
    );

  const option = (value: Schedule, label: string, hint: string) => (
    <button type="button" onClick={() => setSchedule(value)} className={cn("flex-1 rounded-lg border p-2.5 text-left", schedule === value ? "border-[#2563EB] bg-[#EFF4FC]" : "border-[#E6EBF4] bg-white hover:bg-[#F8FAFD]")}>
      <p className="text-[12.5px] font-semibold text-[#111C3A]">{label}</p>
      <p className="text-[11px] text-[#6B7A94]">{hint}</p>
    </button>
  );

  return (
    <section className="rounded-xl border border-[#DCE6FB] bg-[#F7F9FF] p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-[13px] font-semibold text-[#111C3A]"><BellRing className="size-4 text-[#2563EB]" /> Keep watch & share</h2>
          <p className="text-[11.5px] text-[#6B7A94]">Re-check automatically, get told when a competitor changes something, and e-mail the PDF report.</p>
        </div>
        <WButton size="sm" onClick={onClose}>Close</WButton>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7A94]">Automatic re-check</p>
      <div className="mt-1.5 flex flex-col gap-1 sm:flex-row">
        {option("off", "Off", "Only when you click Re-check")}
        {option("weekly", "Every week", "Recommended · about $0.10 per check")}
        {option("monthly", "Every month", "About $0.10 per check")}
      </div>
      {study.nextCheckAt && current.schedule !== "off" ? <p className="mt-1.5 flex items-center gap-1 text-[11px] text-[#4B5872]"><CalendarClock className="size-3.5" /> Next automatic check {formatDateTime(study.nextCheckAt)}</p> : null}

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[#E6EBF4] bg-white p-2.5">
          <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} className="mt-0.5" />
          <span><span className="block text-[12.5px] font-semibold text-[#111C3A]">E-mail me what changed</span><span className="block text-[11px] text-[#6B7A94]">After each automatic check that finds changes. The team always gets an in-app notification.</span></span>
        </label>
        <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[#E6EBF4] bg-white p-2.5">
          <input type="checkbox" checked={monthly} onChange={(e) => setMonthly(e.target.checked)} className="mt-0.5" />
          <span><span className="block text-[12.5px] font-semibold text-[#111C3A]">Send the PDF report every month</span><span className="block text-[11px] text-[#6B7A94]">On the 1st, 09:00 India time{study.nextReportAt && current.reportMonthly ? ` · next ${formatDateTime(study.nextReportAt)}` : ""}.</span></span>
        </label>
      </div>

      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-[#6B7A94]">E-mail addresses (up to 5)</p>
      <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-[#94A3B8]" />
          <input value={emails} onChange={(e) => setEmails(e.target.value)} placeholder="you@company.com, client@brand.com" className="h-9 w-full rounded-md border border-[#DAE1EC] bg-white pl-8 pr-3 text-[12.5px] normal-case outline-none focus:border-[#2563EB]" />
        </div>
        <WButton tone="primary" onClick={submit} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</WButton>
        <WButton icon={Send} onClick={sendNow} disabled={!list.length || emailReport.isPending || !study.report}>{emailReport.isPending ? "Sending…" : "E-mail report now"}</WButton>
      </div>
      <p className="mt-1.5 text-[10.5px] text-[#94A3B8]">E-mails go out through your company’s e-mail settings. The PDF is attached; nothing is shared publicly.</p>
    </section>
  );
}

/** Your own Google Search Console numbers next to the comparison. */
export function SearchPanel({ search }: { search: OwnSearch }) {
  const [all, setAll] = useState(false);
  const rows = all ? search.queries : search.queries.slice(0, 12);
  const tiles = [
    ["Clicks", fmt(search.totals.clicks)],
    ["Impressions", fmt(search.totals.impressions)],
    ["Click rate", `${search.totals.ctr}%`],
    ["Avg position", String(search.totals.position)],
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
        {tiles.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#E6EBF4] bg-[#F8FAFD] p-2.5">
            <p className="text-[10.5px] font-semibold uppercase text-[#6B7A94]">{label}</p>
            <p className="text-[18px] font-bold text-[#111C3A]">{value}</p>
          </div>
        ))}
      </div>
      <table className="mt-3 w-full text-[11.5px]">
        <thead>
          <tr className="border-b border-[#EEF2F8] text-left text-[10px] uppercase text-[#6B7A94]">
            <th className="py-1.5">What people searched</th>
            <th className="py-1.5 text-right">Impressions</th>
            <th className="py-1.5 text-right">Clicks</th>
            <th className="py-1.5 text-right">Position</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F2F5FA]">
          {rows.map((q) => (
            <tr key={q.query}>
              <td className="py-1.5 normal-case text-[#28354C]">{q.query}</td>
              <td className="py-1.5 text-right tabular-nums">{fmt(q.impressions)}</td>
              <td className="py-1.5 text-right tabular-nums">{fmt(q.clicks)}</td>
              <td className="py-1.5 text-right tabular-nums"><Chip tone={q.position <= 3 ? "good" : q.position <= 10 ? "info" : "warn"}>{q.position}</Chip></td>
            </tr>
          ))}
        </tbody>
      </table>
      {search.queries.length > 12 ? <button type="button" onClick={() => setAll((v) => !v)} className="mt-2 text-[11.5px] font-medium text-[#2563EB] hover:underline">{all ? "Show top 12" : `Show all ${search.queries.length}`}</button> : null}
      <p className="mt-2 flex items-center gap-1 text-[10.5px] text-[#94A3B8]"><Search className="size-3" /> Google Search Console · {search.property} · {search.range.start} to {search.range.end}</p>
    </div>
  );
}

/** Impressions of your Google searches that mention a topic's main words. */
export function topicImpressions(topic: string, search: OwnSearch | null | undefined) {
  if (!search) return null;
  const words = topic.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !["with", "from", "your", "their", "about", "services"].includes(w));
  if (!words.length) return 0;
  return search.queries.filter((q) => words.some((w) => q.query.toLowerCase().includes(w))).reduce((sum, q) => sum + q.impressions, 0);
}
