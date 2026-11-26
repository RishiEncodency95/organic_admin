"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";
import { competitorApi, type AutoDiscoverResult } from "@/lib/competitorAnalyzerApi";
import { Badge, btnGhost, btnPrimary, Card, ErrorBox, errorText, inputCls } from "./ui";
import DisplayText from "./DisplayText";

/*
 * One-click: type a website (default Moksha Voyage) → the backend reads it, works out its services and cities,
 * searches the web with AI, verifies candidates and suggests three by default (four maximum).
 */

export default function AutoFindCard({ aiReady, maxCompetitors = 4 }: { aiReady: boolean; maxCompetitors?: number }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<AutoDiscoverResult | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [targetCount, setTargetCount] = useState(3);

  const find = async () => {
    setBusy("find");
    setError("");
    setResult(null);
    try {
      const r = await competitorApi.autoDiscover({ ...(url.trim() ? { url: url.trim() } : {}), ...(location.trim() ? { location: location.trim() } : {}), max: Math.min(targetCount, maxCompetitors) });
      if (!r?.site || !r.detected) throw new Error("Unexpected response from the server");
      setResult(r);
      setPicked(r.picks.slice(0, targetCount).map((p) => p.url));
    } catch (e) {
      setError(errorText(e, "Could not find competitors"));
    } finally {
      setBusy("");
    }
  };

  const createAndRun = async () => {
    if (!result) return;
    setBusy("create");
    setError("");
    try {
      const study = await competitorApi.createStudy({
        name: `${result.site.name ?? result.site.domain} vs competitors — ${result.detected.location}`.slice(0, 140),
        ownUrl: result.site.url,
        competitors: picked.slice(0, maxCompetitors),
        serviceFocus: result.detected.services.map((s) => s.category).slice(0, 12),
        geography: { scope: "region", places: result.detected.places.slice(0, 5), country: "India" },
        goal: "Find website gaps versus the closest competitors",
        maxPagesPerSite: 10,
        settings: { ai: true, pagespeed: true },
      });
      await competitorApi.startRun(study._id, `auto-${study._id}`);
      router.push(`/competitor-analyzer/${study._id}`);
    } catch (e) {
      setError(errorText(e, "Could not create the study"));
      setBusy("");
    }
  };

  const toggle = (u: string) => setPicked((p) => (p.includes(u) ? p.filter((x) => x !== u) : p.length >= maxCompetitors ? p : [...p, u]));

  return (
    <Card title={<span className="flex items-center gap-2"><span className="rounded-lg bg-[#edf3e8] p-2 text-[#4c7147]"><Sparkles size={16} /></span> Find your closest competitors</span>} subtitle="Start with your website and market. We read the services, find relevant businesses and check their public pages. Usually takes 1–2 minutes.">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-48 flex-1 text-xs font-medium text-slate-600">Your website<input className={`${inputCls} mt-1`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="mokshavoyage.in" /></label>
        <label className="min-w-40 flex-1 text-xs font-medium text-slate-600">Market / region<input className={`${inputCls} mt-1`} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Auto-detect from website" /></label>
        <label className="text-xs font-medium text-slate-600">Compare with<select aria-label="Number of competitors" className={`${inputCls} mt-1 min-w-32`} value={targetCount} onChange={(e) => setTargetCount(Number(e.target.value))}>{Array.from({ length: maxCompetitors }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} competitor{n > 1 ? "s" : ""}{n === 3 ? " · default" : ""}</option>)}</select></label>
        <button type="button" className={btnPrimary} disabled={!aiReady || !!busy} onClick={find}><Wand2 size={14} /> {busy === "find" ? "Reading site and searching…" : "Find competitors"}</button>
      </div>
      {!aiReady && <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">AI web search is not ready on the backend (see Provider Health).</p>}
      <div className="mt-2"><ErrorBox message={error} /></div>
      {result && (
        <div className="mt-3 space-y-1">
          <div className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
            <p><b><DisplayText text={result.site.name ?? result.site.domain} /></b> — read {result.site.pagesRead} pages.</p>
            <p className="mt-1"><b>Services found on the site:</b> {result.detected.services.map((s) => s.label).join(", ") || "none detected"}</p>
            <p><b>Places mentioned:</b> {result.detected.places.join(", ") || "none"} · searching in <b>{result.detected.location}</b></p>
            <p><b>Searches used:</b> {result.queries.join(" · ")}</p>
          </div>
          {!result.all.length ? <p className="text-sm text-slate-500">No candidates found. Try a different city, or add competitors manually.</p> : (
            <div className="space-y-1.5">
              <p className="text-xs text-slate-500">Tick up to {maxCompetitors} (best matches are pre-selected). {picked.length}/{maxCompetitors} selected — all are analysed together in one study.</p>
              {result.all.map((c) => (
                <label key={c._id} className={`flex cursor-pointer items-start gap-2 rounded border p-2 text-sm ${picked.includes(c.url) ? "border-teal-300 bg-teal-50/40" : "border-slate-200"}`}>
                  <input type="checkbox" className="mt-1" checked={picked.includes(c.url)} onChange={() => toggle(c.url)} />
                  <span className="flex-1">
                    <b><DisplayText text={c.businessName || c.verification.siteName || c.domain} /></b> <span className="normal-case text-xs text-slate-500">{c.domain}</span>{" "}
                    <Badge value={c.verification.state} label={`site ${c.verification.state.replace(/_/g, " ")}`} /> <Badge value={c.classification} />
                    <span className="block text-xs text-slate-600">Shared services: {c.sharedServices.join(", ") || "none observed"}{c.claimedGeography.length ? ` · claims to serve ${c.claimedGeography.slice(0, 4).join(", ")}` : ""}</span>
                    {c.relevance && <span className="block text-[11px] text-slate-400">{c.relevance}</span>}
                  </span>
                </label>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btnPrimary} disabled={!picked.length || !!busy} onClick={createAndRun}>{busy === "create" ? "Creating…" : `Create study & run (${picked.length})`}</button>
            <button type="button" className={btnGhost} onClick={() => setResult(null)}>Clear</button>
          </div>
          <p className="text-[11px] text-slate-400">{result.note}</p>
        </div>
      )}
    </Card>
  );
}
