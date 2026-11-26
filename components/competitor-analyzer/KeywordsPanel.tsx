"use client";

import { useMemo, useState } from "react";
import { competitorApi, type Keyword } from "@/lib/competitorAnalyzerApi";
import { Badge, btnPrimary, Card, Empty, ErrorBox, errorText, inputCls, lines, areaCls, useLoader } from "./ui";

export default function KeywordsPanel({ aiReady }: { aiReady: boolean }) {
  const { data, error: loadError, reload: load } = useLoader(() => competitorApi.keywords(), []);
  const [seeds, setSeeds] = useState("");
  const [location, setLocation] = useState("Delhi NCR");
  const [useAi, setUseAi] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [intent, setIntent] = useState("");
  const clusters = useMemo(() => {
    const m = new Map<string, Keyword[]>();
    for (const k of data?.items ?? []) if (!intent || k.intent === intent) m.set(k.cluster, [...(m.get(k.cluster) ?? []), k]);
    return [...m.entries()];
  }, [data, intent]);

  return (
    <div className="space-y-1">
      <Card title="Keyword research" subtitle="Ideas from your seeds (blank = trained seeds), crawled headings and optional AI. These are IDEAS — search volume, difficulty, CPC and positions are not available unless a real data source is connected.">
        <div className="grid gap-2 md:grid-cols-3">
          <label className="text-xs font-medium text-slate-600 md:col-span-2">Seeds (one per line)<textarea className={areaCls} rows={3} value={seeds} onChange={(e) => setSeeds(e.target.value)} placeholder="cremation services ghaziabad" /></label>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Location<input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} /></label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" disabled={!aiReady} checked={useAi} onChange={(e) => setUseAi(e.target.checked)} /> Add AI ideas {aiReady ? "" : "(AI not configured)"}</label>
            <button type="button" className={btnPrimary} disabled={busy} onClick={async () => { setBusy(true); setError(""); try { const r = await competitorApi.generateKeywords({ seeds: lines(seeds), location, useAi }); setInfo(`${r.processed} keyword(s) processed. AI: ${r.ai.status}${r.ai.error ? ` (${r.ai.error})` : ""}.`); load(); } catch (e) { setError(errorText(e)); } finally { setBusy(false); } }}>{busy ? "Working…" : "Generate / refresh"}</button>
          </div>
        </div>
        <ErrorBox message={error || loadError} />
        {info && <p className="mt-2 text-xs text-teal-700">{info}</p>}
      </Card>
      <Card title="Content gaps" subtitle="Keywords where a competitor page matches but no read Moksha page does (based on the latest saved crawl).">
        {!data?.contentGaps.length ? <Empty>No gaps found yet. Run a comparison study first, then refresh keywords.</Empty> : (
          <ul className="space-y-1 text-sm">{data.contentGaps.slice(0, 40).map((g) => <li key={g.keyword}><b>{g.keyword}</b> <span className="text-xs text-slate-500">({g.cluster}) — {g.competitorPages.map((p) => p.domain).join(", ")}</span></li>)}</ul>
        )}
      </Card>
      <Card title="Clusters" actions={<select className="h-8 rounded-md border border-slate-200 px-2 text-sm" value={intent} onChange={(e) => setIntent(e.target.value)}><option value="">All intents</option>{["informational", "transactional", "commercial", "urgent", "local", "navigational"].map((i) => <option key={i}>{i}</option>)}</select>}>
        {!clusters.length ? <Empty>No keywords yet.</Empty> : (
          <div className="grid gap-1 md:grid-cols-2">
            {clusters.map(([cluster, kws]) => (
              <div key={cluster} className="rounded-md border border-slate-200 p-3">
                <h4 className="mb-2 text-sm font-semibold text-slate-700">{cluster.replace(/_/g, " ")} <span className="text-xs font-normal text-slate-400">({kws.length})</span></h4>
                <ul className="space-y-1.5">
                  {kws.slice(0, 25).map((k) => (
                    <li key={k._id} className="text-xs text-slate-700">
                      {k.keyword} <Badge value={k.intent} /> <Badge value={k.language} />{k.city && <Badge value="city" label={k.city} />}
                      <span className="block text-[11px] text-slate-400">Moksha page: {k.ownPages[0]?.url ?? "none matched"} · volume: not available · sources: {k.sources.join(", ")}</span>
                      {k.gsc && <span className="block text-[11px] text-emerald-700">Search Console ({k.gsc.period.start}→{k.gsc.period.end}): {k.gsc.clicks} clicks · {k.gsc.impressions} impressions · avg position {k.gsc.position}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
