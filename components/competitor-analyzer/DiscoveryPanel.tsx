"use client";

import { useState } from "react";
import { RefreshCw, Search, Star, Trash2 } from "lucide-react";
import { competitorApi, type Candidate } from "@/lib/competitorAnalyzerApi";
import { Badge, btnDanger, btnGhost, btnPrimary, Card, Empty, ErrorBox, errorText, fmtDate, inputCls, lines, areaCls, useLoader } from "./ui";

const CLASSES = ["direct", "indirect", "service_specialist", "aggregator", "publisher", "unrelated", "needs_review"];

export default function DiscoveryPanel({ aiReady }: { aiReady: boolean }) {
  const { data: loaded, error: loadError, reload: load } = useLoader(() => competitorApi.candidates(), []);
  const items: Candidate[] | null = loaded ?? (loadError ? [] : null);
  const [actionError, setError] = useState("");
  const error = actionError || loadError;
  const [info, setInfo] = useState("");
  const [keywords, setKeywords] = useState("funeral services in Delhi\ncremation services Ghaziabad");
  const [location, setLocation] = useState("Delhi NCR, India");
  const [language, setLanguage] = useState("any");
  const [manualUrl, setManualUrl] = useState("");
  const [busy, setBusy] = useState("");
  const [filter, setFilter] = useState<"all" | "watchlist" | "approved" | "review">("all");

  const run = async (label: string, fn: () => Promise<unknown>) => {
    setBusy(label);
    setError("");
    setInfo("");
    try {
      await fn();
      load();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  };

  const shown = (items ?? []).filter((c) => (filter === "watchlist" ? c.watchlisted : filter === "approved" ? c.status === "approved" : filter === "review" ? c.classification === "needs_review" || c.verification.state !== "verified" : c.status !== "rejected"));

  return (
    <div className="space-y-1">
      <div className="grid gap-1 lg:grid-cols-2">
        <Card title="AI web research" subtitle="OpenAI web search suggests candidates; our crawler then verifies each domain. Result order is not a Google ranking.">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Keywords (one per line)<textarea className={areaCls} rows={3} value={keywords} onChange={(e) => setKeywords(e.target.value)} /></label>
            <div className="grid grid-cols-2 gap-2">
              <label className="text-xs font-medium text-slate-600">Location<input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} /></label>
              <label className="text-xs font-medium text-slate-600">Language<select className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value)}><option value="any">Any</option><option value="en">English</option><option value="hi">Hindi</option><option value="hinglish">Hinglish</option></select></label>
            </div>
            {!aiReady && <p className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">AI web research is not configured on the backend (see Provider Health). Add competitors manually instead.</p>}
            <button type="button" className={btnPrimary} disabled={!aiReady || !!busy || !lines(keywords).length} onClick={() => run("discover", async () => { const r = await competitorApi.discover({ keywords: lines(keywords), location, language }); setInfo(`${r.candidates.length} candidate(s) saved, ${r.rejected.length} rejected. ${r.note}`); })}>
              <Search size={14} /> {busy === "discover" ? "Researching…" : "Discover candidates"}
            </button>
          </div>
        </Card>
        <Card title="Add a competitor manually" subtitle="Works without any AI provider. The site is checked by our crawler (home page + robots.txt).">
          <div className="flex gap-2">
            <input className={inputCls} value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} placeholder="https://competitor.example" />
            <button type="button" className={btnPrimary} disabled={!manualUrl.trim() || !!busy} onClick={() => run("add", async () => { await competitorApi.addCandidate(manualUrl.trim()); setManualUrl(""); })}>{busy === "add" ? "Checking…" : "Add"}</button>
          </div>
        </Card>
      </div>
      <ErrorBox message={error} />
      {info && <div className="rounded-md border border-teal-200 bg-teal-50 px-3 py-2 text-sm text-teal-800">{info}</div>}
      <Card
        title="Candidate pool & watchlist"
        subtitle="Your classifications and rejections are remembered and used to guide future AI discovery."
        actions={
          <>
            <select className="h-8 rounded-md border border-slate-200 px-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">All (not rejected)</option><option value="watchlist">Watchlist</option><option value="approved">Approved</option><option value="review">Needs review</option>
            </select>
            <button type="button" className={btnGhost} onClick={() => void load()}><RefreshCw size={14} /></button>
          </>
        }
      >
        {items === null ? <p className="text-sm text-slate-500">Loading…</p> : shown.length === 0 ? <Empty>No candidates here yet.</Empty> : (
          <div className="space-y-2">
            {shown.map((c) => (
              <div key={c._id} className="rounded-md border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <a href={c.url} target="_blank" rel="noreferrer noopener" className="font-medium text-teal-800 hover:underline">{c.businessName || c.verification.siteName || c.domain}</a>
                    <span className="ml-2 text-xs text-slate-500">{c.domain}</span>
                    <div className="mt-1 flex flex-wrap gap-1"><Badge value={c.verification.state} label={`site: ${c.verification.state.replace(/_/g, " ")}`} /><Badge value={c.status} />{c.watchlisted && <Badge value="watchlist" />}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select className="h-8 rounded-md border border-slate-200 px-2 text-xs" value={c.classification} onChange={(e) => run("cls", () => competitorApi.updateCandidate(c._id, { classification: e.target.value }))}>
                      {CLASSES.map((x) => <option key={x} value={x}>{x.replace(/_/g, " ")}</option>)}
                    </select>
                    <button type="button" className={btnGhost} title="Watchlist" onClick={() => run("watch", () => competitorApi.updateCandidate(c._id, { watchlisted: !c.watchlisted }))}><Star size={14} className={c.watchlisted ? "fill-amber-400 text-amber-500" : ""} /></button>
                    <button type="button" className={btnGhost} onClick={() => run("approve", () => competitorApi.updateCandidate(c._id, { status: "approved" }))}>Approve</button>
                    <button type="button" className={btnGhost} onClick={() => { const notes = window.prompt("Why is this not a relevant competitor? (helps future discovery)") ?? ""; void run("reject", () => competitorApi.updateCandidate(c._id, { status: "rejected", notes })); }}>Reject</button>
                    <button type="button" className={btnGhost} onClick={() => run("verify", () => competitorApi.verifyCandidate(c._id))}>Re-verify</button>
                    <button type="button" className={btnDanger} onClick={() => run("del", () => competitorApi.deleteCandidate(c._id))}><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 text-xs text-slate-600 md:grid-cols-3">
                  <div><b>Services matched on site:</b> {c.verification.servicesMatched.join(", ") || "none observed"}</div>
                  <div><b>Claimed geography (AI):</b> {c.claimedGeography.join(", ") || "—"}</div>
                  <div><b>Checked:</b> {fmtDate(c.verification.checkedAt)}{c.verification.issues.length ? ` · ${c.verification.issues[0]}` : ""}</div>
                </div>
                {c.relevance && <p className="mt-1 text-xs text-slate-500">AI relevance note: {c.relevance}</p>}
                <p className="mt-1 text-[11px] text-slate-400">Found via: {c.discoveries.map((d) => `${d.source}${d.keyword ? ` “${d.keyword}”` : ""}${d.source === "openai_web_search" ? (d.citationsVerified ? " (citations verified)" : " (citations NOT verified)") : ""}`).slice(-3).join(" · ")}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
