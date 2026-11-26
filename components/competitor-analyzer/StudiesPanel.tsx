"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import StudyCards from "./StudyCards";
import { Plus, RefreshCw } from "lucide-react";
import { competitorApi, type Study } from "@/lib/competitorAnalyzerApi";
import { btnGhost, btnPrimary, Card, Empty, ErrorBox, errorText, inputCls, lines, areaCls, useLoader } from "./ui";

const SERVICE_FOCUS = ["funeral-support", "cremation", "rituals", "body-transport", "asthi-visarjan", "repatriation", "preplanning"];

export function StudyForm({ initial, onSaved, onCancel, maxCompetitors = 4 }: { initial?: Study; onSaved: (s: Study) => void; onCancel?: () => void; maxCompetitors?: number }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [ownUrl, setOwnUrl] = useState(initial?.ownUrl ?? "");
  const [competitors, setCompetitors] = useState((initial?.competitors ?? []).map((c) => c.url).join("\n"));
  const [focus, setFocus] = useState<string[]>(initial?.serviceFocus ?? []);
  const [places, setPlaces] = useState((initial?.geography.places ?? []).join(", "));
  const [goal, setGoal] = useState(initial?.goal ?? "");
  const [pages, setPages] = useState(String(initial?.maxPagesPerSite ?? 10));
  const [useAi, setUseAi] = useState(initial?.settings.ai ?? true);
  const [pagespeed, setPagespeed] = useState(initial?.settings.pagespeed ?? true);
  const [schedule, setSchedule] = useState(initial?.settings.schedule ?? "off");
  const [alerts, setAlerts] = useState(initial?.settings.alerts ?? false);
  const [alertEmails, setAlertEmails] = useState((initial?.settings.alertEmails ?? []).join(", "));
  const [monthlyReport, setMonthlyReport] = useState(initial?.settings.monthlyReport ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const comps = lines(competitors);

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      const body = {
        name: name.trim(),
        ...(ownUrl.trim() ? { ownUrl: ownUrl.trim() } : {}),
        competitors: comps,
        serviceFocus: focus,
        geography: { scope: "region", places: places.split(",").map((p) => p.trim()).filter(Boolean), country: "India" },
        goal,
        maxPagesPerSite: Number(pages) || 10,
        settings: { ai: useAi, pagespeed, schedule, alerts, alertEmails: alertEmails.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 5), monthlyReport },
      };
      const saved = initial ? await competitorApi.updateStudy(initial._id, { ...body, expectedRevision: initial.revision }) : await competitorApi.createStudy(body);
      onSaved(saved);
    } catch (e) {
      setError(errorText(e, "Could not save the study"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1">
      <ErrorBox message={error} />
      <div className="grid gap-1 md:grid-cols-2">
        <label className="text-xs font-medium text-slate-600">Study name<input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Delhi NCR cremation support" /></label>
        <label className="text-xs font-medium text-slate-600">Own website (blank = Moksha Voyage default)<input className={inputCls} value={ownUrl} onChange={(e) => setOwnUrl(e.target.value)} placeholder="https://mokshavoyage.in" /></label>
        <label className="text-xs font-medium text-slate-600 md:col-span-2">
          Competitor websites — one per line, up to {maxCompetitors} ({comps.length} entered)
          <textarea className={areaCls} rows={4} value={competitors} onChange={(e) => setCompetitors(e.target.value)} placeholder="https://competitor-website.example" />
        </label>
        <div className="md:col-span-2">
          <p className="mb-1 text-xs font-medium text-slate-600">Service focus (keeps the comparison within the same scope)</p>
          <div className="flex flex-wrap gap-2">
            {SERVICE_FOCUS.map((f) => (
              <button type="button" key={f} onClick={() => setFocus((x) => (x.includes(f) ? x.filter((y) => y !== f) : [...x, f]))} className={`rounded-full border px-2.5 py-1 text-xs ${focus.includes(f) ? "border-teal-600 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-600"}`}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <label className="text-xs font-medium text-slate-600">Geography (comma separated)<input className={inputCls} value={places} onChange={(e) => setPlaces(e.target.value)} placeholder="Delhi NCR, Noida" /></label>
        <label className="text-xs font-medium text-slate-600">Pages read per site (bounded sample)<input className={inputCls} type="number" min={1} max={50} value={pages} onChange={(e) => setPages(e.target.value)} /></label>
        <label className="text-xs font-medium text-slate-600 md:col-span-2">Goal<input className={inputCls} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Improve service clarity and enquiry journey" /></label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={useAi} onChange={(e) => setUseAi(e.target.checked)} /> Use AI comparison (if configured; spends AI budget)</label>
        <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={pagespeed} onChange={(e) => setPagespeed(e.target.checked)} /> Measure Google PageSpeed (if enabled)</label>
        <label className="text-xs font-medium text-slate-600">Automatic re-check (09:00 India time)
          <select className={inputCls} value={schedule} onChange={(e) => setSchedule(e.target.value)}><option value="off">Off (manual only)</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select>
        </label>
        <div className="space-y-1">
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={alerts} disabled={schedule === "off"} onChange={(e) => setAlerts(e.target.checked)} /> Email me when a scheduled check finds real website changes</label>
          <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={monthlyReport} onChange={(e) => setMonthlyReport(e.target.checked)} /> Email the PDF report on the 1st of every month</label>
          <input className={inputCls} disabled={!(alerts && schedule !== "off") && !monthlyReport} value={alertEmails} onChange={(e) => setAlertEmails(e.target.value)} placeholder="Emails for alerts / monthly report (max 5)" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" className={btnPrimary} disabled={busy || name.trim().length < 2 || comps.length === 0 || comps.length > maxCompetitors} onClick={save}>{busy ? "Saving…" : initial ? "Save changes" : "Create study"}</button>
        {onCancel && <button type="button" className={btnGhost} onClick={onCancel}>Cancel</button>}
      </div>
    </div>
  );
}

export default function StudiesPanel({ maxCompetitors = 4 }: { maxCompetitors?: number }) {
  const [status, setStatus] = useState("active");
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [actionError, setActionError] = useState("");
  const [info, setInfo] = useState("");
  const admin = useAppSelector((state) => state.auth.admin);
  const canManage = !!admin?.permissions.some((p) => p === "*" || p === "perm_competitor_manage");
  const { data, error, reload: load } = useLoader(() => competitorApi.studies(status), [status]);
  const items: Study[] | null = data ? data.items : error ? [] : null;
  const changeArchive = async (s: Study, restore: boolean) => {
    setBusyId(s._id); setActionError(""); setInfo("");
    try {
      if (restore) await competitorApi.restoreStudy(s._id); else await competitorApi.archiveStudy(s._id);
      setInfo(restore ? "Study restored. Find it under Active." : "Study archived. You can restore it from Archived.");
      load();
    } catch (e) { setActionError(errorText(e)); } finally { setBusyId(""); }
  };

  return (
    <div className="space-y-1">
      {creating && (
        <Card title="New comparison study" subtitle="Your website plus 1–4 competitors. Nothing is analysed until you start a run.">
          <StudyForm maxCompetitors={maxCompetitors} onSaved={() => { setCreating(false); void load(); }} onCancel={() => setCreating(false)} />
        </Card>
      )}
      <Card
        title="Comparison studies"
        subtitle="Your research, in one place. Open a saved report, start a re-check or archive a study for later."
        actions={
          <>
            <select aria-label="Study status" className="h-9 rounded-xl border border-slate-200 bg-[#fafbf8] px-3 text-xs" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
            <button type="button" className={btnGhost} onClick={() => void load()}><RefreshCw size={14} /> Refresh</button>
            {!creating && canManage && <button type="button" className={btnPrimary} onClick={() => setCreating(true)}><Plus size={14} /> New study</button>}
          </>
        }
      >
        <ErrorBox message={error} />
        <ErrorBox message={actionError} />
        {info && <p role="status" className="mb-2 rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-xs text-emerald-700">{info}</p>}
        {items === null ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : items.length === 0 ? (
          <Empty>No studies yet. Create one with your website and the competitors you want to compare.</Empty>
        ) : (
          <StudyCards studies={items} busyId={busyId} canManage={canManage} onArchive={(s) => void changeArchive(s, false)} onRestore={(s) => void changeArchive(s, true)} />
        )}
      </Card>
    </div>
  );
}
