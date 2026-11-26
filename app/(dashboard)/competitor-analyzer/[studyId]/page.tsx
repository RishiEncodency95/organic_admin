"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Download, Globe2, Pencil, Play, Square } from "lucide-react";
import { competitorApi, type RunSummary } from "@/lib/competitorAnalyzerApi";
import { StudyForm } from "@/components/competitor-analyzer/StudiesPanel";
import ReportView from "@/components/competitor-analyzer/ReportView";
import ExportBar from "@/components/competitor-analyzer/ExportBar";
import { reportFiles } from "@/lib/competitorAnalyzerApi";
import { Badge, btnDanger, btnGhost, btnPrimary, Card, Empty, ErrorBox, errorText, fmtDate, useLoader } from "@/components/competitor-analyzer/ui";
import presentation from "@/components/competitor-analyzer/presentation.module.css";

const ACTIVE = ["queued", "running"];

export default function StudyPage() {
  const { studyId } = useParams<{ studyId: string }>();
  const [selectedRun, setSelectedRun] = useState("");
  const [editing, setEditing] = useState(false);
  const [actionError, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { data, error: loadError, reload } = useLoader(async () => {
    const [d, runs, actions] = await Promise.all([competitorApi.study(studyId), competitorApi.runs(studyId), competitorApi.actions(studyId)]);
    return { ...d, runs: runs.items, actions };
  }, [studyId]);
  const study = data?.study ?? null;
  const latest = data?.latestRun ?? null;
  const reportId = selectedRun || (study?.latestSuccessfulRunId ? String(study.latestSuccessfulRunId) : "");
  // The saved report of the selected (or latest successful) run — historical runs never change.
  const { data: reportData, error: reportError, reload: reloadReport } = useLoader<RunSummary | null>(() => (reportId ? competitorApi.run(studyId, reportId) : Promise.resolve(null)), [studyId, reportId]);
  const report = reportData && reportData._id === reportId ? reportData : null;
  const error = actionError || loadError;
  const active = !!latest && ACTIVE.includes(latest.status);

  // Poll while a run is active: every 4 s, slower after errors, paused while the tab is hidden.
  useEffect(() => {
    const refreshVisible = () => {
      if (document.visibilityState === "visible") reload();
    };
    document.addEventListener("visibilitychange", refreshVisible);
    const t = active ? setInterval(refreshVisible, loadError ? 16_000 : 4_000) : null;
    return () => {
      if (t) clearInterval(t);
      document.removeEventListener("visibilitychange", refreshVisible);
    };
  }, [active, loadError, reload]);

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      await competitorApi.startRun(studyId, `ui-${studyId}-${Date.now()}`);
      reload();
    } catch (e) {
      setError(errorText(e, "Could not start the run"));
    } finally {
      setBusy(false);
    }
  };
  const stop = async () => {
    if (!latest) return;
    try {
      await competitorApi.stopRun(studyId, latest._id);
      reload();
    } catch (e) {
      setError(errorText(e));
    }
  };
  const exportJson = async () => {
    if (!report) return;
    try {
      const exported = await competitorApi.exportRun(studyId, report._id);
      const blob = new Blob([JSON.stringify(exported, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `competitor-report-${report._id}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(errorText(e, "Export failed"));
    }
  };

  if (!study || !data) return <div className="p-4"><ErrorBox message={error} />{!error && <p className="text-sm text-slate-500">Loading…</p>}</div>;

  return (
    <div className={`${presentation.shell} mx-auto max-w-[1440px] space-y-1 p-1.5 md:p-2 lg:pr-14`}>
      <Link href="/competitor-analyzer" className="inline-flex items-center gap-1 px-1 py-2 text-[11px] font-medium text-[#496d56] hover:underline"><ArrowLeft size={13} /> Research workspace <span className="mx-1 text-slate-300">/</span> Comparison study</Link>
      <Card
        className="!border-[#204f3c] !bg-[#204f3c] [&_h3]:!text-white [&_h3]:!text-lg [&_p]:text-emerald-100/65"
        title={<span className="flex items-center gap-2"><Globe2 size={20} className="shrink-0 text-[#b6caa6]" />{study.name}</span>}
        subtitle={<span className="break-words"><span className="normal-case">{study.ownDomain}</span> · {Math.min(study.competitors.length, 4)} competitors in the next run · {[...study.serviceFocus.map((s) => s.replace(/[_-]/g, " ")), ...study.geography.places].join(", ") || "All sampled services"} · {study.maxPagesPerSite} pages per site</span>}
        actions={
          <>
            {active ? <button type="button" className={btnDanger} onClick={stop}><Square size={14} /> Stop</button> : <button type="button" className={btnPrimary} disabled={busy || study.status === "archived"} onClick={start}><Play size={14} /> {study.latestSuccessfulRunId ? "Re-check" : "Run analysis"}</button>}
            <button type="button" className={btnGhost} onClick={() => setEditing((x) => !x)}><Pencil size={14} /> Edit sites</button>
            {report?.report && <button type="button" className={btnGhost} onClick={exportJson}><Download size={14} /> Export (JSON)</button>}
          </>
        }
      >
        <ErrorBox message={error} />
        {latest && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2 text-xs text-slate-600">
            <span>Latest attempt: <Badge value={latest.status} /></span>
            {active && <span className="text-slate-600">{latest.stage} — {latest.progress?.message} ({latest.progress?.done ?? 0}/{latest.progress?.total ?? 0}){latest.cancelRequestedAt ? " · stopping…" : ""}</span>}
            {latest.error?.message && <span className="text-rose-700">{latest.error.code}: {latest.error.message}</span>}
            <span className="text-xs text-slate-500">{fmtDate(latest.createdAt)}</span>
          </div>
        )}
        {active && latest && <div className="mt-1 grid grid-cols-4 gap-1">{["waiting", "reading", "analysing", "saving"].map((stage, i) => {
          const current = Math.max(0, ["waiting", "reading", "analysing", "saving"].indexOf(latest.stage));
          return <div key={stage} className={`flex items-center gap-1.5 rounded-lg px-2 py-2 text-[10px] ${i <= current ? "bg-white/15 text-white" : "bg-black/10 text-white/40"}`}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${i < current ? "bg-[#bad2a5] text-[#204f3c]" : "border border-current"}`}>{i < current ? <Check size={10} /> : i + 1}</span>{["Queued", "Read websites", "Compare evidence", "Save report"][i]}</div>;
        })}</div>}
        {study.competitors.length > 4 && <p className="mt-2 text-xs">Next analysis uses the first 4 saved competitors. Use Edit sites to choose a different set.</p>}
        {editing && <div className="mt-4 border-t border-slate-100 pt-4"><StudyForm initial={study} onSaved={() => { setEditing(false); reload(); }} onCancel={() => setEditing(false)} /></div>}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-1 rounded-2xl border border-[#e1e7e3] bg-white p-3 text-xs">
        <div><span className="font-semibold text-[#3c5942]">Report history</span><p className="mt-0.5 text-[10px] text-slate-400">Open the evidence saved at a specific point in time.</p></div>
        <select aria-label="Report from run" className="h-9 max-w-full rounded-xl border border-slate-200 bg-[#f9fbf7] px-3 text-xs text-slate-600" value={selectedRun} onChange={(e) => setSelectedRun(e.target.value)}>
          <option value="">Latest successful</option>
          {data.runs.filter((r) => r.status === "completed").map((r) => <option key={r._id} value={r._id}>{fmtDate(r.finishedAt)}</option>)}
        </select>
      </div>

      {report?.report ? (
        <>
          <ExportBar studyId={studyId} runId={report._id} studyName={report.report.studyName ?? study.name} />
          <ReportView key={report._id} studyId={studyId} run={report} runs={data.runs} actions={report.report.actions ?? []} liveActions={data.actions} onActionsChanged={async () => reload()} screenshot={(domain) => () => reportFiles.screenshot(studyId, report._id, domain)} favicon={(domain) => () => reportFiles.favicon(studyId, report._id, domain)} />
        </>
      ) : (
        reportError ? <div><ErrorBox message={reportError} /><button type="button" className={btnGhost} onClick={reloadReport}>Retry loading report</button></div> : <Empty>{active ? "The analysis is running. The report appears here when it completes." : reportId ? "Loading report…" : "No completed report yet. Start a run to collect evidence."}</Empty>
      )}
    </div>
  );
}
