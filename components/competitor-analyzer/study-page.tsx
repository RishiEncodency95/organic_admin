"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft, BellRing, Check, FileDown, CircleAlert, Info, Languages, Link2, Loader2, Pencil, RefreshCw, Square, Swords, X,
} from "lucide-react";
import { ApiError } from "@/components/infrastructure/lib/errors";
import { cn } from "@/components/infrastructure/lib/cn";
import { WButton } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/kit";
import { EmptyState, QueryErrorState, SkeletonBlock } from "@/components/competitor-analyzer/source/features/admin/website/components/ui/states";
import { formatRelative } from "@/components/competitor-analyzer/source/features/admin/website/data/selectors";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/competitor-analyzer/dialog";
import type { StudyDetail } from "@/components/competitor-analyzer/api";
import { useStudy, useStudyMutations } from "@/components/competitor-analyzer/hooks";
import { ReportBody } from "@/components/competitor-analyzer/report-body";
import { SITE_COLORS, SiteLabel, SiteNamesProvider } from "@/components/competitor-analyzer/ui";
import { WatchPanel } from "@/components/competitor-analyzer/watch-sections";
import { SharePanel } from "@/components/competitor-analyzer/share-section";

import { Manage, useCanManage } from "./permissions";
import { PROFILE_OPTIONS,type ProfileId,type CrawlBudget } from "./industry-api";

const errorText = (err: unknown, fallback: string) => (ApiError.isApiError(err) ? err.message : fallback);

function EditSites({ study, onClose }: { study: StudyDetail; onClose: () => void }) {
  const { update } = useStudyMutations();
  const [name, setName] = useState(study.name);
  const [profile,setProfile]=useState<ProfileId>(study.profile??"general-v1");
  const [crawlBudget,setCrawlBudget]=useState<CrawlBudget>(study.crawlBudget??{maxPagesPerSite:10,maxPagesPerRun:50,concurrency:2,maxHttpRequests:150});
  const [own, setOwn] = useState(study.sites[0]?.url ?? "");
  const [competitors, setCompetitors] = useState(study.sites.slice(1).map((s) => s.url));
  const save = () =>
    update.mutate(
      { id: study.id, body: { name, own, profile, crawlBudget, competitors: competitors.map((c) => c.trim()).filter(Boolean) } },
      { onSuccess: () => { toast.success("Saved. Re-check to compare the new list."); onClose(); }, onError: (e) => toast.error(errorText(e, "Could not save")) },
    );
  const input = "h-8 min-w-0 flex-1 normal-case rounded-md border border-[#DAE1EC] px-2.5 text-[12px] outline-none focus:border-[#2563EB]";
  return (
    <div className="rounded-xl border border-[#DCE6FB] bg-[#F7F9FF] p-3">
      <div className="grid gap-2 md:grid-cols-2">
        <label className="text-[11px] font-semibold text-[#6B7A94]">Name<input className={cn(input, "mt-1 w-full")} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className="text-[11px] font-semibold text-[#6B7A94]">Your website<input className={cn(input, "mt-1 w-full")} value={own} onChange={(e) => setOwn(e.target.value)} /></label>
      </div>
<label className="mt-2 block text-xs text-slate-600">Industry intelligence profile<select aria-label="Study intelligence profile" value={profile} onChange={e=>setProfile(e.target.value as ProfileId)} className="mt-1 h-9 w-full rounded border bg-white px-2">{PROFILE_OPTIONS.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      <fieldset className="mt-3 grid gap-2 sm:grid-cols-2"><legend className="text-xs font-semibold">Crawl budget for this study</legend>{([{key:'maxPagesPerSite',label:'Pages per site',min:1,max:10},{key:'maxPagesPerRun',label:'Pages per run',min:9,max:50},{key:'concurrency',label:'Concurrent sites',min:1,max:2},{key:'maxHttpRequests',label:'HTTP requests',min:20,max:150}] as const).map(field=><label key={field.key} className="text-xs text-slate-600">{field.label}<input type="number" min={field.min} max={field.max} value={crawlBudget[field.key]} onChange={e=>setCrawlBudget(current=>({...current,[field.key]:Math.max(field.min,Math.min(field.max,Number(e.target.value)||field.min))}))} className="mt-1 h-8 w-full rounded border bg-white px-2" /></label>)}</fieldset>
      <p className="mt-2 text-[11px] font-semibold text-[#6B7A94]">Competitors (max 8)</p>
      <div className="mt-1 grid gap-1.5 md:grid-cols-2">
        {competitors.map((c, i) => (
          <div key={i} className="flex gap-1.5">
            <input className={input} value={c} onChange={(e) => setCompetitors((l) => l.map((x, j) => (j === i ? e.target.value : x)))} />
            <button type="button" className="grid size-8 place-items-center rounded-md text-[#94A3B8] hover:text-[#C0261F]" aria-label="Remove" onClick={() => setCompetitors((l) => l.filter((_, j) => j !== i))}><X className="size-4" /></button>
          </div>
        ))}
        {competitors.length < 8 ? <button type="button" className="text-left text-[12px] font-medium text-[#2563EB]" onClick={() => setCompetitors((l) => [...l, ""])}>+ Add competitor</button> : null}
      </div>
      <div className="mt-3 flex gap-2">
        <WButton tone="primary" onClick={save} disabled={update.isPending}>Save</WButton>
        <WButton onClick={onClose}>Cancel</WButton>
      </div>
    </div>
  );
}

const STAGES = [
  { key: "queued", label: "Waiting for an analysis worker" },
  { key: "reading", label: "Reading key pages, sitemaps, Google speed tests and brand checks of every site" },
  { key: "analysing", label: "AI is comparing the sites, profiling each one and writing your plan" },
];

function Running({ stage, startedAt, count, onStop, stopping }: { stage: string | null; startedAt: string; count: number; onStop: () => void; stopping: boolean }) {
  const current = STAGES.findIndex((s) => s.key === (stage === 'retrying' ? 'queued' : stage));
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#0F1A38] via-[#1E2F6B] to-[#4C1D95] p-5 text-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[14px] font-semibold"><Loader2 className="size-5 animate-spin" /> Checking {count} websites… started {formatRelative(startedAt)}</p>
        <Manage>        <button
          type="button"
          onClick={onStop}
          disabled={stopping}
          title={stage === "analysing" ? "The AI is already answering: stopping now throws its answer away, but what it cost still counts." : "Stopped now, no AI is used."}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-3 py-1.5 text-[12px] font-medium hover:bg-white/20 disabled:opacity-60"
        >
          {stopping ? <Loader2 className="size-3.5 animate-spin" /> : <Square className="size-3.5" />} {stopping ? "Stopping…" : "Stop"}
        </button></Manage>
      </div>
      <ol className="mt-4 space-y-2.5">
        {STAGES.map((s, i) => (
          <li key={s.key} className={cn("flex items-center gap-2.5 text-[12.5px]", i < current ? "text-[#86EFAC]" : i === current ? "font-semibold text-white" : "text-white/50")}>
            {i < current ? <Check className="size-4" /> : i === current ? <Loader2 className="size-4 animate-spin" /> : <span className="size-4 rounded-full border border-white/40" />}
            {s.label}
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[11px] text-white/60">Usually 1–3 minutes. You can leave this page; the result is saved.</p>
    </div>
  );
}

export function CompetitorStudyPage({ id }: { id: string }) {
  const canManage = useCanManage();
  const study = useStudy(id);
  const { run, stop, download, actionStatus, actionTask } = useStudyMutations();
  const [editing, setEditing] = useState(false);
  const [watching, setWatching] = useState(false);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  // Ticks every 30 s so the re-check button counts down to the end of the 10-minute gap.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const data = study.data;
  const colorOf = useMemo(() => {
    const map = new Map((data?.sites ?? []).map((s, i) => [s.domain, SITE_COLORS[i % SITE_COLORS.length]!]));
    return (d: string) => map.get(d) ?? "#94A3B8";
  }, [data?.sites]);

  if (study.isLoading) return <div className="p-4"><SkeletonBlock lines={10} /></div>;
  if (study.error || !data) return <div className="p-4"><QueryErrorState error={study.error} onRetry={() => void study.refetch()} /></div>;

  const report = data.report;
  const latest = data.latestRun;
  const running = latest?.status === "running";
  // Same 10-minute gap the server enforces between paid checks.
  const waitMs = latest?.status === "completed" ? new Date(latest.startedAt).getTime() + 10 * 60 * 1000 - now : 0;
  const waitMin = waitMs > 0 ? Math.ceil(waitMs / 60_000) : 0;
  const own = data.sites[0]!;
  const ownLabel = own.name || own.domain;

  const pdfLang = download.variables?.lang ?? "en";
  const savePdf = (lang: "en" | "hi") => {
    if (lang === "hi") toast.info("Preparing the Hindi report. The first time takes about a minute.");
    download.mutate(
      { id, lang },
      {
        onSuccess: ({ blob, fileName }) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName;
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 10_000);
          toast.success(lang === "hi" ? "Hindi PDF report downloaded" : "PDF report downloaded");
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "The report could not be downloaded"),
      },
    );
  };

  const recheck = () =>
    run.mutate(id, {
      onSuccess: (res) => toast.success(res.reused ? "A check is already running." : "Check started. This takes 1–3 minutes."),
      onError: (e) => toast.error(errorText(e, "Could not start the check")),
    });

  return (
    <SiteNamesProvider sites={data.sites}>
    <div className="w-full min-w-0 space-y-1 capitalize">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link href="/competitor-analyzer" className="inline-flex items-center gap-1 text-[12px] text-[#6B7A94] hover:text-[#2563EB]"><ArrowLeft className="size-3.5" /> All analyses</Link>
          <h1 className="mt-1 flex min-w-0 items-center gap-2 text-[18px] font-semibold tracking-[-0.01em] text-[#111C3A]">
            <Swords className="size-5 shrink-0 text-[#7C3AED]" />
            <span className="truncate normal-case" title={data.name}>{data.name.startsWith(`${own.domain} vs`) || data.name.length > 48 ? `${ownLabel} vs ${data.sites.length - 1} competitors` : data.name}</span>
          </h1>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1">
          {report?.model?.quality && report.model.quality.status !== "verified" ? (
            <WButton icon={CircleAlert} onClick={() => setEvidenceOpen(true)}>
              Crawl evidence {report.model.quality.score}%
            </WButton>
          ) : null}
          <WButton
            icon={download.isPending && pdfLang === "en" ? Loader2 : FileDown}
            disabled={!data.report || download.isPending}
            disabledReason="Run the analysis once to get a report"
            onClick={() => savePdf("en")}
          >
            {download.isPending && pdfLang === "en" ? "Preparing PDF…" : "Download PDF report"}
          </WButton>
          <WButton
            icon={download.isPending && pdfLang === "hi" ? Loader2 : Languages}
            disabled={!data.report || download.isPending}
            disabledReason="Run the analysis once to get a report"
            title="The same report in Hindi. The first download of each check is translated once (about a minute); later downloads are instant."
            onClick={() => savePdf("hi")}
          >
            {download.isPending && pdfLang === "hi" ? "हिंदी PDF बन रही है…" : "हिंदी PDF"}
          </WButton>
          <Manage><WButton icon={Link2} onClick={() => setSharing((v) => !v)} disabled={!data.report} disabledReason="Run the analysis once before sharing it" title="Make a link your client can open without login">Share link</WButton>
          <WButton icon={BellRing} onClick={() => setWatching((v) => !v)}>{data.settings?.schedule && data.settings.schedule !== "off" ? `Auto-check ${data.settings.schedule === "weekly" ? "weekly" : "monthly"}` : "Watch & share"}</WButton>
          <WButton icon={Pencil} onClick={() => setEditing((v) => !v)} disabled={running}>Edit sites</WButton>
          <WButton tone="primary" icon={running || run.isPending ? Loader2 : RefreshCw} onClick={recheck} disabled={running || run.isPending || waitMin > 0} title={waitMin > 0 ? "Checks can run once every 10 minutes, so the same analysis is not paid for twice." : undefined}>{waitMin > 0 ? `Re-check in ${waitMin} min` : report ? "Re-check now" : "Run analysis"}</WButton></Manage>
        </div>
      </div>

      {report?.model?.quality && report.model.quality.status !== "verified" ? (
        <Dialog open={evidenceOpen} onOpenChange={setEvidenceOpen}>
          <DialogContent className="max-w-lg gap-0 rounded-lg border-[#E6EBF4] bg-white p-0 normal-case">
            <DialogHeader className="border-b border-[#EEF2F8] px-5 py-4 pr-12 text-left">
              <DialogTitle className="flex items-center gap-2 text-[15px] font-semibold text-[#111C3A]">
                <CircleAlert className={cn("size-4", report.model.quality.status === "needs_review" ? "text-[#C0261F]" : "text-[#D97706]")} />
                {report.model.quality.status === "needs_review" ? "Evidence needs review" : "Partial evidence"}
              </DialogTitle>
              <DialogDescription className="text-[12px] text-[#6B7A94]">
                Crawl evidence score {report.model.quality.score}%. This is a crawl-quality indicator, not AI completion or business accuracy. These notes explain which website evidence could not be fully verified.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[55vh] space-y-2 overflow-y-auto px-5 py-4">
              {report.model.quality.issues.map((issue, index) => (
                <div key={`${issue.code}-${issue.domain ?? "report"}-${index}`} className="rounded-md border border-[#E6EBF4] bg-[#F8FAFC] p-3 text-[12px] text-[#334155]">
                  <p className="font-semibold text-[#111C3A] [overflow-wrap:anywhere]">{issue.domain ?? "Overall analysis"}</p>
                  <p className="mt-1 leading-relaxed">{issue.message}</p>
                </div>
              ))}
              <p className="pt-1 text-[11px] font-medium text-[#6B7A94]">No evidence means not verified, never absent.</p>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}

      {/* All compared websites on one line, full width; a very long list scrolls sideways instead of wrapping. */}
      <div className="flex flex-nowrap items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
        {data.sites.map((s) => (
          <span key={s.domain} className={cn("inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]", s.role === "own" ? "border-[#2563EB] bg-[#EFF4FC]" : "border-[#E6EBF4] bg-white")}>
            <SiteLabel domain={s.domain} color={colorOf(s.domain)} own={s.role === "own"} />
          </span>
        ))}
      </div>

      {editing ? <EditSites study={data} onClose={() => setEditing(false)} /> : null}
      {watching ? <WatchPanel study={data} onClose={() => setWatching(false)} /> : null}
      {sharing ? <SharePanel study={data} onClose={() => setSharing(false)} /> : null}
      {running && latest ? (
        <Running
          stage={latest.stage}
          startedAt={latest.startedAt}
          count={data.sites.length}
          stopping={stop.isPending}
          onStop={() =>
            canManage && stop.mutate(
              { id, runId: latest.id },
              { onSuccess: (r) => toast.success(r.status === "cancelled" ? "Check stopped. You can run it again now." : "The check had already finished."), onError: (e) => toast.error(errorText(e, "Could not stop the check")) },
            )
          }
        />
      ) : null}
      {latest?.status === "failed" ? (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-[#F0C9C6] bg-[#FDF4F3] p-3 text-[12px] text-[#C0261F]"><CircleAlert className="mt-0.5 size-4 shrink-0" />{latest.errorMessage ?? "The last check failed."}{report ? " Showing the previous result." : ""}</p>
      ) : null}
      {latest?.status === "cancelled" ? (
        <p className="flex items-start gap-2 rounded-lg border border-[#E6EBF4] bg-white p-3 text-[12px] text-[#4B5872]"><Info className="mt-0.5 size-4 shrink-0 text-[#6B7A94]" />The last check was stopped.{report ? " Showing the previous result." : ""} Run it again when you are ready.</p>
      ) : null}
      {!report && !running ? <EmptyState icon={Swords} title="No result yet" body="Run the analysis to compare these websites." /> : null}

      {report ? (
        <ReportBody
          data={data}
          colorOf={colorOf}
          tracking={canManage ? {
            states: data.actions ?? {},
            busy: busyAction,
            canTask: Boolean(data.linkedClient),
            onStatus: (action, status) => {
              setBusyAction(action);
              actionStatus.mutate({ id, body: { action, status } }, { onSettled: () => setBusyAction(null), onError: (e) => toast.error(errorText(e, "Could not save")) });
            },
            onTask: (action, reason, priority) => {
              setBusyAction(action);
              actionTask.mutate(
                { id, body: { action, reason, priority } },
                { onSuccess: (r) => toast.success(r.created ? "Action task created" : "A task already exists for this action"), onSettled: () => setBusyAction(null), onError: (e) => toast.error(errorText(e, "Could not create the task"), { duration: 8000 }) },
              );
            },
          } : undefined}
        />
      ) : null}
    </div>
    </SiteNamesProvider>
  );
}
