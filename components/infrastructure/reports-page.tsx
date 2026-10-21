"use client";

import { useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CalendarClock, Download, Eye, FileText, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { env } from "./lib/env";
import { apiClient } from "./lib/client";
import { companyScopeHeaders } from "./lib/company-scope";
import { formatDateTime } from "./format";
import { INFRA_KEY, errorMessage, useScope } from "./hooks";
import { Chip, ConfirmButton, EmptyState, Modal, Notice, Section, Skeleton, Spinner, Td, Th, btn, btnPrimary, field, useRoleFlags } from "./ui";

type Period = "daily" | "weekly" | "monthly" | "yearly" | "custom";
interface ReportRow {
  id: string;
  title: string;
  period: Period;
  from: string;
  to: string;
  status: "PENDING" | "RUNNING" | "READY" | "FAILED";
  ai: { requested: boolean; status: "ok" | "skipped" | "failed" | null; provider: string | null; model: string | null; error: string | null };
  includesBilling: boolean;
  risk: "low" | "medium" | "high" | null;
  findings: number | null;
  error: string | null;
  createdAt: string;
  completedAt: string | null;
}
interface Finding { id: string; severity: "critical" | "high" | "medium" | "low" | "info"; area: string; subject: string; title: string; evidence: string; recommendation: string }
interface ReportDetail extends ReportRow {
  narrative: null | {
    risk: "low" | "medium" | "high";
    summary: string;
    findings: Finding[];
    ai: null | { executiveSummary: string; highlights: string[]; priorities: Array<{ title: string; why: string; action: string; effort: string; findingIds: string[] }>; capacityOutlook: string; nextPeriodFocus: string[] };
  };
}

const PERIODS: Array<{ id: Period; label: string; hint: string }> = [
  { id: "daily", label: "Daily", hint: "Last 24 hours" },
  { id: "weekly", label: "Weekly", hint: "Last 7 days" },
  { id: "monthly", label: "Monthly", hint: "Last 30 days" },
  { id: "yearly", label: "Yearly", hint: "Last 365 days" },
  { id: "custom", label: "Custom", hint: "Pick dates" },
];
const SEV_TONE = { critical: "red", high: "orange", medium: "amber", low: "blue", info: "slate" } as const;
const RISK_TONE = { low: "green", medium: "amber", high: "red" } as const;

const api = {
  list: (c: string, s?: AbortSignal) => apiClient.request<ReportRow[]>({ method: "GET", path: "/infrastructure/reports", headers: companyScopeHeaders(c), signal: s }),
  get: (c: string, id: string, s?: AbortSignal) => apiClient.request<ReportDetail>({ method: "GET", path: `/infrastructure/reports/${id}`, headers: companyScopeHeaders(c), signal: s }),
  create: (c: string, body: Record<string, unknown>) => apiClient.request<ReportRow>({ method: "POST", path: "/infrastructure/reports", headers: companyScopeHeaders(c), body }),
  remove: (c: string, id: string) => apiClient.request<{ id: string }>({ method: "DELETE", path: `/infrastructure/reports/${id}`, headers: companyScopeHeaders(c) }),
};

async function downloadPdf(companyId: string, id: string) {
  const res = await fetch(`${env.apiBaseUrl}/infrastructure/reports/${id}/pdf`, { credentials: "include", headers: { "x-company-id": companyId } });
  if (!res.ok) throw new Error("The PDF could not be downloaded.");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `infrastructure-report-${id.slice(0, 8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const { companyId, ready } = useScope();
  const { canWrite } = useRoleFlags();
  const qc = useQueryClient();
  const [period, setPeriod] = useState<Period>("monthly");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [clientId, setClientId] = useState("");
  const [useAi, setUseAi] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);

  const list = useQuery({
    queryKey: [INFRA_KEY, companyId, "reports"],
    enabled: ready,
    queryFn: ({ signal }) => api.list(companyId, signal),
    placeholderData: keepPreviousData,
    // Poll only while a report is being built.
    refetchInterval: (q) => ((q.state.data ?? []).some((r) => r.status === "PENDING" || r.status === "RUNNING") ? 3000 : false),
  });
  const create = useMutation({
    mutationFn: () => api.create(companyId, { period, ...(period === "custom" ? { from, to } : {}), clientId: clientId || undefined, includeAi: useAi }),
    onSuccess: () => { toast.success("Report generation started."); void qc.invalidateQueries({ queryKey: [INFRA_KEY, companyId, "reports"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.remove(companyId, id),
    onSuccess: () => { toast.success("Report deleted."); void qc.invalidateQueries({ queryKey: [INFRA_KEY, companyId, "reports"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const busy = (list.data ?? []).some((r) => r.status === "PENDING" || r.status === "RUNNING");
  const customOk = period !== "custom" || (from && to && from <= to);

  return (
    <div className="space-y-1">
      <Section title="Generate report" description="A complete infrastructure report for your DevOps team: servers, domains, SSL, billing and alerts, with findings and recommendations." flush>
        <div className="space-y-3 px-4 py-4">
          <div className="flex flex-wrap items-start justify-between gap-1">
            {/* Left: periods */}
            <div>
              <p className="mb-1 text-xs font-medium capitalize text-slate-600">Period</p>
              <div role="group" aria-label="Report period" className="flex flex-wrap gap-1">
                {PERIODS.map((p) => (
                  <button key={p.id} type="button" aria-pressed={period === p.id} onClick={() => setPeriod(p.id)} className={`border px-3 py-2 text-left transition ${period === p.id ? "border-[#2563EB] bg-[#EFF5FE] text-[#1D4ED8]" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"}`}>
                    <span className="flex items-center gap-1 text-xs font-medium capitalize"><CalendarClock className="size-3.5" />{p.label}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-slate-500">{p.hint}</span>
                  </button>
                ))}
              </div>
              {period === "custom" && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <label className="text-xs font-medium capitalize text-slate-700">From<input type="date" className={`${field} mt-1 w-40`} value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></label>
                  <label className="text-xs font-medium capitalize text-slate-700">To<input type="date" className={`${field} mt-1 w-40`} value={to} min={from || undefined} max={new Date().toISOString().slice(0, 10)} onChange={(e) => setTo(e.target.value)} /></label>
                </div>
              )}
            </div>
            {/* Right: AI + button on one line */}
            <div className="flex flex-wrap items-end justify-end gap-1">
              <label className="mb-2 inline-flex items-center gap-1 text-xs font-medium capitalize text-slate-700">
                <input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} />
                <Sparkles className="size-3.5 text-[#2563EB]" aria-hidden />AI analysis
              </label>
              <button type="button" className={btnPrimary} disabled={!canWrite || create.isPending || busy || !customOk || !ready} onClick={() => create.mutate()}>
                {create.isPending || busy ? <Spinner /> : <FileText className="size-3.5" />}{busy ? "Generating…" : "Generate report"}
              </button>
            </div>
          </div>
          {!canWrite && <p className="text-[11px] font-normal capitalize text-slate-500">Only managers, admins and owners can generate reports.</p>}
          <p className="border-l-2 border-blue-300 bg-blue-50/50 px-3 py-2 text-[11px] font-normal leading-relaxed text-slate-600">
            {useAi ? "The AI writes the summary and prioritises actions from the stored facts only; it cannot add numbers. If the AI is unavailable the report is still produced from the rule-based findings." : "AI analysis is off: the summary is built from fixed rules."}
          </p>
        </div>
      </Section>

      <Section title="Reports" description="Newest first. A report is a snapshot of the period it covers." flush>
        {list.isLoading ? (
          <div className="p-4"><Skeleton className="h-24" /></div>
        ) : list.isError ? (
          <div className="p-4"><Notice tone="red" title="Reports could not be loaded">{errorMessage(list.error)}</Notice></div>
        ) : (list.data?.length ?? 0) === 0 ? (
          <EmptyState icon={FileText} title="No reports yet" description="Generate a daily, weekly, monthly, yearly or custom report above." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-xs capitalize">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/60 text-left">
                  <Th>Report</Th><Th>Period</Th><Th>Status</Th><Th>Risk</Th><Th>Findings</Th><Th>AI</Th><Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {list.data!.map((r) => (
                  <tr key={r.id} className="border-l-2 border-transparent transition hover:border-blue-400 hover:bg-blue-50/40">
                    <Td>
                      <span className="flex items-center gap-1">
                        <FileText className="size-3.5 shrink-0 text-blue-500" />
                        <span className="truncate font-medium text-slate-800">{r.title}</span>
                      </span>
                      <span className="mt-0.5 block text-[11px] font-normal text-slate-400">{formatDateTime(r.createdAt)}</span>
                    </Td>
                    <Td><span className="whitespace-nowrap font-normal text-slate-600">{r.from.slice(0, 10)} → {r.to.slice(0, 10)}</span>{r.includesBilling ? <span className="block text-[11px] font-normal text-slate-400">includes billing</span> : null}</Td>
                    <Td>{r.status === "READY" ? <Chip tone="green">Ready</Chip> : r.status === "FAILED" ? <span title={r.error ?? undefined}><Chip tone="red">Failed</Chip></span> : <Chip tone="blue">Generating…</Chip>}</Td>
                    <Td>{r.risk ? <Chip tone={RISK_TONE[r.risk]}>{r.risk}</Chip> : <span className="text-slate-300">—</span>}</Td>
                    <Td><span className="tabular-nums text-slate-700">{r.findings ?? 0}</span></Td>
                    <Td>
                      {r.ai.status === "ok" ? <span title={`${r.ai.provider} · ${r.ai.model}`}><Chip tone="green">Included</Chip></span>
                        : r.ai.status === "failed" ? <span title={r.ai.error ?? undefined}><Chip tone="amber">Unavailable</Chip></span>
                          : r.ai.status === "skipped" ? <span title={r.ai.error ?? undefined}><Chip>{r.ai.requested ? "Skipped" : "Off"}</Chip></span> : <span className="text-slate-300">—</span>}
                    </Td>
                    <Td>
                      <span className="flex items-center justify-end gap-1">
                        <button type="button" className={btn} disabled={r.status !== "READY"} onClick={() => setPreview(r.id)}><Eye className="size-3.5" />View</button>
                        <button type="button" className={btnPrimary} disabled={r.status !== "READY"} onClick={() => void downloadPdf(companyId, r.id).catch((e) => toast.error(errorMessage(e)))}><Download className="size-3.5" />PDF</button>
                        {canWrite && <ConfirmButton label={<Trash2 className="size-3.5" />} confirmLabel="Delete" onConfirm={() => remove.mutate(r.id)} />}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {preview && <PreviewDialog id={preview} companyId={companyId} onClose={() => setPreview(null)} />}
    </div>
  );
}

function PreviewDialog({ id, companyId, onClose }: { id: string; companyId: string; onClose: () => void }) {
  const q = useQuery({ queryKey: [INFRA_KEY, companyId, "report", id], queryFn: ({ signal }) => api.get(companyId, id, signal), staleTime: 60_000 });
  const n = q.data?.narrative;
  return (
    <Modal open onOpenChange={(o) => !o && onClose()} wide title={q.data?.title ?? "Report"} description={q.data ? `${q.data.from.slice(0, 10)} to ${q.data.to.slice(0, 10)}` : undefined}>
      {q.isLoading ? <Skeleton className="h-40" /> : q.isError || !n ? <Notice tone="red" title="The report could not be opened">{errorMessage(q.error)}</Notice> : (
        <div className="space-y-3 text-xs normal-case">
          <div className={`flex flex-wrap items-center justify-between gap-1 border px-4 py-3 ${n.risk === "high" ? "border-rose-200 bg-rose-50/60" : n.risk === "medium" ? "border-amber-200 bg-amber-50/60" : "border-emerald-200 bg-emerald-50/60"}`}>
            <span className="flex items-center gap-1">
              <ShieldCheck className={`size-4 ${n.risk === "high" ? "text-rose-600" : n.risk === "medium" ? "text-amber-600" : "text-emerald-600"}`} />
              <span className="text-xs font-medium capitalize text-slate-600">Overall risk</span>
              <Chip tone={RISK_TONE[n.risk]}>{n.risk}</Chip>
            </span>
            <span className="flex items-center gap-1">
              {q.data!.ai.status === "ok" ? <><Sparkles className="size-3.5 text-emerald-600" /><Chip tone="green">AI included</Chip></> : <Chip tone="amber">No AI narrative</Chip>}
              <span className="text-[11px] font-normal text-slate-500">{n.findings.length} findings</span>
            </span>
          </div>
          {q.data!.ai.status !== "ok" && q.data!.ai.error && <Notice tone="amber" title="AI analysis is not included">{q.data!.ai.error}</Notice>}
          <div className="border border-slate-200 bg-white px-4 py-3">
            <p className="mb-1 flex items-center gap-1 text-[11px] font-medium capitalize tracking-wide text-slate-500"><FileText className="size-3.5" />Executive summary</p>
            <p className="whitespace-pre-line text-xs font-normal leading-relaxed text-slate-700">{n.ai?.executiveSummary ?? n.summary}</p>
          </div>
          {n.ai && n.ai.highlights.length > 0 && (
            <div className="border border-slate-200 bg-white px-4 py-3">
              <p className="mb-1 text-[11px] font-medium capitalize tracking-wide text-slate-500">Highlights</p>
              <ul className="space-y-1">{n.ai.highlights.map((h, i) => <li key={i} className="flex items-start gap-1 text-xs font-normal text-slate-700"><span className="mt-1.5 size-1 shrink-0 bg-blue-500" />{h}</li>)}</ul>
            </div>
          )}
          {n.ai && n.ai.priorities.length > 0 && (
            <div className="border border-slate-200 bg-white px-4 py-3">
              <p className="mb-1 text-[11px] font-medium capitalize tracking-wide text-slate-500">Priority actions</p>
              <ol className="space-y-1">
                {n.ai.priorities.map((p, i) => (
                  <li key={i} className="flex items-start gap-1 border-l-2 border-blue-300 bg-blue-50/40 px-2 py-1.5">
                    <span className="flex size-5 shrink-0 items-center justify-center bg-blue-600 text-[10px] font-medium text-white">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block text-xs font-medium normal-case text-slate-800">{p.title}</span>
                      <span className="mt-0.5 block text-[11px] font-normal leading-relaxed text-slate-600">{p.action}</span>
                      <span className="mt-0.5 block text-[10.5px] font-normal capitalize text-slate-400">Effort: {p.effort}{p.why ? ` · ${p.why}` : ""}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="border border-slate-200 bg-white px-4 py-3">
            <p className="mb-1 text-[11px] font-medium capitalize tracking-wide text-slate-500">Findings ({n.findings.length})</p>
            {n.findings.length === 0 ? <p className="text-xs font-normal text-slate-500">No findings were raised.</p> : (
              <ul className="max-h-72 space-y-1 overflow-y-auto">
                {n.findings.map((f) => (
                  <li key={f.id} className="border border-slate-200 border-l-2 border-l-slate-300 px-2.5 py-2">
                    <div className="flex flex-wrap items-center gap-1"><Chip tone={SEV_TONE[f.severity]}>{f.severity}</Chip><span className="text-xs font-medium normal-case text-slate-800">{f.title}</span><span className="text-[11px] font-normal text-slate-400">· {f.subject}</span></div>
                    <p className="mt-1 text-[11px] font-normal leading-relaxed text-slate-600">{f.evidence}</p>
                    <p className="mt-0.5 text-[11px] font-normal leading-relaxed text-slate-700">{f.recommendation}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {n.ai && n.ai.nextPeriodFocus.length > 0 && (
            <div className="border border-slate-200 bg-white px-4 py-3">
              <p className="mb-1 flex items-center gap-1 text-[11px] font-medium capitalize tracking-wide text-slate-500">Next period focus<ArrowRight className="size-3" /></p>
              <ul className="space-y-1">{n.ai.nextPeriodFocus.map((f, i) => <li key={i} className="flex items-start gap-1 text-xs font-normal text-slate-700"><span className="mt-1.5 size-1 shrink-0 bg-emerald-500" />{f}</li>)}</ul>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className={btn} onClick={onClose}>Close</button>
            <button type="button" className={btnPrimary} onClick={() => void downloadPdf(companyId, id).catch((e) => toast.error(errorMessage(e)))}><Download className="size-3.5" />Download PDF</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
