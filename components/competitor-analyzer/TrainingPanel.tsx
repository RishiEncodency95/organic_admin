"use client";

import { useState } from "react";
import { History, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { competitorApi, type AnalyzerSettings, type Feedback, type SettingsResponse } from "@/lib/competitorAnalyzerApi";
import { Badge, btnDanger, btnGhost, btnPrimary, Card, Empty, ErrorBox, errorText, fmtDate, inputCls, lines, areaCls, useLoader } from "./ui";

/*
 * Training & Settings: everything the analyzer uses that the team should be able to change without a code deploy.
 * Fixed safety rules (citations, no invented metrics, SSRF, budgets) are NOT editable here by design.
 */

const CATEGORY_LABELS: Record<string, string> = { clarity: "Service & message clarity", contact: "Contact / enquiry journey", trust: "Trust & transparency", services: "Service & package information", content: "Content & helpfulness", technical: "Technical SEO", performance: "Mobile performance" };

export default function TrainingPanel({ canEdit }: { canEdit: boolean }) {
  const [draft, setDraft] = useState<AnalyzerSettings | null>(null);
  const [overridesText, setOverridesText] = useState("{}");
  const [note, setNote] = useState("");
  const [newGuidance, setNewGuidance] = useState("");
  const [actionError, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: bundle, error: loadError, reload: load } = useLoader(
    async () => {
      const s = await competitorApi.settings();
      // Feedback / versions need the settings permission; a view-only user still sees the settings.
      const [feedback, versions] = canEdit ? await Promise.all([competitorApi.feedback().catch(() => [] as Feedback[]), competitorApi.settingsVersions().catch(() => [])]) : [[], []];
      return { s, feedback, versions };
    },
    [canEdit],
    (b) => {
      setDraft(structuredClone(b.s.settings));
      setOverridesText(JSON.stringify(b.s.settings.checkOverrides, null, 2));
    },
  );
  const data: SettingsResponse | null = bundle?.s ?? null;
  const feedback = bundle?.feedback ?? [];
  const versions = bundle?.versions ?? [];
  const error = actionError || loadError;

  if (!draft || !data) return <div className="space-y-2"><ErrorBox message={error} /><p className="text-sm text-slate-500">Loading…</p></div>;
  const set = <K extends keyof AnalyzerSettings>(k: K, v: AnalyzerSettings[K]) => setDraft({ ...draft, [k]: v });

  const save = async () => {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      let checkOverrides: AnalyzerSettings["checkOverrides"];
      try {
        checkOverrides = JSON.parse(overridesText || "{}");
      } catch {
        throw new Error("Check overrides must be valid JSON");
      }
      const res = await competitorApi.saveSettings(data.version, { ...draft, checkOverrides }, note);
      setSaved(`Saved as version ${res.version}. New runs will use it; old reports keep the version they used.`);
      setNote("");
      load();
    } catch (e) {
      setError(errorText(e, "Could not save settings"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-1">
      <Card
        title="Training & settings"
        subtitle={<>Live version: <b>{data.version || "defaults (never saved)"}</b> · source: {data.source}. Changes are versioned; every run records the version it used.</>}
        actions={canEdit ? <><input className={`${inputCls} w-56`} placeholder="Change note (optional)" value={note} onChange={(e) => setNote(e.target.value)} /><button type="button" className={btnPrimary} disabled={busy} onClick={save}><Save size={14} /> {busy ? "Saving…" : "Save new version"}</button><button type="button" className={btnGhost} onClick={() => { setDraft(structuredClone(data.defaults)); setOverridesText("{}"); }}>Load defaults</button></> : <Badge value="view only" />}
      >
        <ErrorBox message={error} />
        {saved && <p className="rounded bg-emerald-50 px-2 py-1 text-sm text-emerald-700">{saved}</p>}
        <p className="mt-2 text-xs text-slate-500">Not editable here (always enforced): citations must be verbatim quotes from read pages, no invented rankings/volumes/traffic, unknown ≠ zero, robots and SSRF protection, AI budget limits.</p>
      </Card>

      <div className="grid gap-1 xl:grid-cols-2">
        <Card title="Business profile & AI context" subtitle="The business description the AI is given. Safety rules are added automatically after this text.">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Business name<input className={inputCls} value={draft.business.name} onChange={(e) => set("business", { ...draft.business, name: e.target.value })} /></label>
            <label className="text-xs font-medium text-slate-600">Description<textarea className={areaCls} rows={2} value={draft.business.description} onChange={(e) => set("business", { ...draft.business, description: e.target.value })} /></label>
            <label className="text-xs font-medium text-slate-600">Comparison prompt context<textarea className={areaCls} rows={4} value={draft.prompts.comparisonContext} onChange={(e) => set("prompts", { ...draft.prompts, comparisonContext: e.target.value })} /></label>
            <label className="text-xs font-medium text-slate-600">Discovery prompt context<textarea className={areaCls} rows={3} value={draft.prompts.discoveryContext} onChange={(e) => set("prompts", { ...draft.prompts, discoveryContext: e.target.value })} /></label>
            <label className="text-xs font-medium text-slate-600">Keyword prompt context<textarea className={areaCls} rows={2} value={draft.prompts.keywordContext} onChange={(e) => set("prompts", { ...draft.prompts, keywordContext: e.target.value })} /></label>
          </div>
        </Card>

        <Card title="Standing guidance" subtitle="Rules the AI follows on every run (e.g. tone, what never to suggest). One per line.">
          <textarea className={areaCls} rows={6} value={draft.guidance.join("\n")} onChange={(e) => set("guidance", lines(e.target.value))} placeholder={"Never suggest publishing family photos or stories\nPrefer simple Hindi-English wording for page briefs"} />
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.learning.useFeedback} onChange={(e) => set("learning", { ...draft.learning, useFeedback: e.target.checked })} /> Learn from team decisions (rejected/approved actions, candidate classifications)</label>
            <label className="text-xs font-medium text-slate-600">Max lessons per prompt<input className={inputCls} type="number" min={0} max={50} value={draft.learning.maxLessons} onChange={(e) => set("learning", { ...draft.learning, maxLessons: Number(e.target.value) })} /></label>
          </div>
        </Card>

        <Card title="Score weights" subtitle="Proposed, uncalibrated. Categories without enough evidence are not scored regardless of weight.">
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(draft.categoryWeights).map(([k, v]) => (
              <label key={k} className="text-xs font-medium text-slate-600">{CATEGORY_LABELS[k] ?? k}<input className={inputCls} type="number" min={0} max={100} value={v} onChange={(e) => set("categoryWeights", { ...draft.categoryWeights, [k]: Number(e.target.value) })} /></label>
            ))}
          </div>
          <label className="mt-3 block text-xs font-medium text-slate-600">
            Per-check overrides (JSON) — e.g. {`{"TRU-006": {"enabled": false}, "CON-003": {"weight": 3, "severity": "high"}}`}
            <textarea className={`${areaCls} font-mono text-xs`} rows={4} value={overridesText} onChange={(e) => setOverridesText(e.target.value)} />
          </label>
        </Card>

        <Card title="Places & keyword seeds" subtitle="Cities/regions recognised on websites, and default keyword seeds. One per line.">
          <div className="grid gap-2 md:grid-cols-2">
            <label className="text-xs font-medium text-slate-600">Places ({draft.places.length})<textarea className={areaCls} rows={8} value={draft.places.join("\n")} onChange={(e) => set("places", lines(e.target.value))} /></label>
            <label className="text-xs font-medium text-slate-600">Keyword seeds ({draft.keywordSeeds.length})<textarea className={areaCls} rows={8} value={draft.keywordSeeds.join("\n")} onChange={(e) => set("keywordSeeds", lines(e.target.value))} /></label>
          </div>
        </Card>
      </div>

      <Card title="Service categories" subtitle="How services are recognised in website text (English, Hindi, Hinglish). Patterns are case-insensitive regular expressions, one per line." actions={<button type="button" className={btnGhost} onClick={() => set("serviceCategories", [...draft.serviceCategories, { id: `custom_${draft.serviceCategories.length + 1}`, label: "New service", enabled: true, patterns: ["\\bnew service\\b"] }])}><Plus size={14} /> Add category</button>}>
        <div className="grid gap-1 lg:grid-cols-2">
          {draft.serviceCategories.map((c, i) => {
            const upd = (patch: Partial<typeof c>) => set("serviceCategories", draft.serviceCategories.map((x, j) => (j === i ? { ...x, ...patch } : x)));
            return (
              <div key={i} className={`rounded-md border p-3 ${c.enabled ? "border-slate-200" : "border-dashed border-slate-300 opacity-60"}`}>
                <div className="flex gap-2">
                  <input className={inputCls} value={c.label} onChange={(e) => upd({ label: e.target.value })} />
                  <input className={`${inputCls} w-40 font-mono text-xs`} value={c.id} onChange={(e) => upd({ id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })} />
                  <label className="flex items-center gap-1 text-xs"><input type="checkbox" checked={c.enabled} onChange={(e) => upd({ enabled: e.target.checked })} />on</label>
                  <button type="button" className={btnDanger} onClick={() => set("serviceCategories", draft.serviceCategories.filter((_, j) => j !== i))}><Trash2 size={12} /></button>
                </div>
                <textarea className={`${areaCls} mt-2 font-mono text-xs`} rows={3} value={c.patterns.join("\n")} onChange={(e) => upd({ patterns: lines(e.target.value) })} />
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Page priorities" subtitle="Which pages the crawler reads first (higher priority first; URL path or link text patterns).">
        <div className="grid gap-1 lg:grid-cols-2">
          {draft.pageKinds.map((k, i) => (
            <div key={i} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-center gap-2"><span className="w-28 text-sm font-medium text-slate-700">{k.kind}</span><input className={`${inputCls} w-24`} type="number" min={1} max={99} value={k.priority} onChange={(e) => set("pageKinds", draft.pageKinds.map((x, j) => (j === i ? { ...x, priority: Number(e.target.value) } : x)))} /></div>
              <textarea className={`${areaCls} mt-2 font-mono text-xs`} rows={2} value={k.patterns.join("\n")} onChange={(e) => set("pageKinds", draft.pageKinds.map((x, j) => (j === i ? { ...x, patterns: lines(e.target.value) } : x)))} />
            </div>
          ))}
        </div>
      </Card>

      {canEdit && (
        <div className="grid gap-1 xl:grid-cols-2">
          <Card title="Learned lessons" subtitle={`From team decisions. Currently used: ${data.lessons.comparison.length} in comparisons, ${data.lessons.discovery.length} in discovery. Switch off any lesson that is wrong.`}>
            <div className="mb-3 flex gap-2"><input className={inputCls} value={newGuidance} onChange={(e) => setNewGuidance(e.target.value)} placeholder="Add a lesson, e.g. 'Repatriation specialists are not direct competitors for Delhi cremation studies'" /><button type="button" className={btnPrimary} disabled={newGuidance.trim().length < 5} onClick={async () => { try { await competitorApi.addGuidance(newGuidance.trim()); setNewGuidance(""); load(); } catch (e) { setError(errorText(e)); } }}>Add</button></div>
            {!feedback.length ? <Empty>No lessons yet. Rejecting a recommendation with a reason, or reclassifying a candidate, creates one.</Empty> : (
              <ul className="space-y-1.5">{feedback.map((f) => (
                <li key={f._id} className={`flex items-start justify-between gap-2 rounded border border-slate-100 p-2 text-xs ${f.active ? "" : "opacity-50"}`}>
                  <span><Badge value={f.kind} /> {f.lesson}<span className="block text-[11px] text-slate-400">{fmtDate(f.createdAt)}</span></span>
                  <button type="button" className={btnGhost} onClick={async () => { await competitorApi.setFeedbackActive(f._id, !f.active); load(); }}>{f.active ? "Switch off" : "Switch on"}</button>
                </li>
              ))}</ul>
            )}
          </Card>
          <Card title={<span className="flex items-center gap-1"><History size={15} /> Version history</span>} subtitle="Rollback creates a new version with the old content.">
            {!versions.length ? <Empty>No saved versions yet (defaults in use).</Empty> : (
              <ul className="space-y-1 text-sm">{versions.map((v) => (
                <li key={v.version} className="flex items-center justify-between border-b border-slate-100 py-1">
                  <span>v{v.version} · {fmtDate(v.createdAt)} {v.note && <span className="text-xs text-slate-500">— {v.note}</span>}</span>
                  {v.version !== data.version && <button type="button" className={btnGhost} onClick={async () => { try { await competitorApi.rollbackSettings(v.version, data.version); load(); } catch (e) { setError(errorText(e)); } }}><RotateCcw size={12} /> Restore</button>}
                </li>
              ))}</ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
