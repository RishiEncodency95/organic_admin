"use client";

import { useState, useSyncExternalStore } from "react";
import { Link2, RefreshCw, Unplug } from "lucide-react";
import { competitorApi } from "@/lib/competitorAnalyzerApi";
import { Badge, btnDanger, btnGhost, btnPrimary, Card, ErrorBox, errorText, fmtDate, useLoader } from "./ui";

/*
 * Google Search Console for OUR OWN property (read-only OAuth). The browser is sent to Google's consent page;
 * Google returns to the backend callback, which redirects back here with ?google=connected|error.
 */

const noop = () => () => undefined;
const useReturnMessage = () =>
  useSyncExternalStore(
    noop,
    () => {
      const q = new URLSearchParams(window.location.search);
      const g = q.get("google");
      return g === "connected" ? "ok:Google Search Console connected. Choose your property below." : g === "error" ? `err:${q.get("reason") ?? "Google sign-in failed"}` : "";
    },
    () => "",
  );

export default function GoogleCard() {
  const { data: status, error: loadError, reload } = useLoader(() => competitorApi.googleStatus(), []);
  const [properties, setProperties] = useState<{ siteUrl: string; permissionLevel: string }[] | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const ret = useReturnMessage();

  const act = async (label: string, fn: () => Promise<void>) => {
    setBusy(label);
    setError("");
    setInfo("");
    try {
      await fn();
      reload();
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy("");
    }
  };

  return (
    <Card title="Google Search Console (own site)" subtitle="Measured clicks, impressions, CTR and average position for the Moksha Voyage property only. Competitor Search Console data is never available.">
      {ret.startsWith("ok:") && <p className="mb-2 rounded bg-emerald-50 px-2 py-1 text-sm text-emerald-700">{ret.slice(3)}</p>}
      {ret.startsWith("err:") && <ErrorBox message={ret.slice(4)} />}
      <ErrorBox message={error || loadError} />
      {info && <p className="mb-2 rounded bg-teal-50 px-2 py-1 text-sm text-teal-800">{info}</p>}
      {!status ? <p className="text-sm text-slate-500">Loading…</p> : (
        <div className="space-y-1 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge value={status.status === "connected" ? "ready" : status.status} label={status.status.replace(/_/g, " ")} />
            {status.email && <span className="text-slate-600">as <span className="normal-case">{status.email}</span></span>}
            {status.property && <span className="text-slate-600">· property <b className="normal-case">{status.property}</b></span>}
          </div>
          {status.lastError && <p className="text-xs text-rose-700">{status.lastError}</p>}
          {!status.configured && <p className="text-xs text-slate-500">Set GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET and GOOGLE_OAUTH_REDIRECT_URI on the backend.</p>}
          {status.configured && <p className="text-[11px] text-slate-400">Redirect URI that must be listed in Google Cloud → OAuth client: <code>{status.redirectUri}</code></p>}
          <div className="flex flex-wrap gap-2">
            {status.configured && status.status !== "connected" && (
              <button type="button" className={btnPrimary} disabled={!!busy} onClick={() => act("connect", async () => { const { url } = await competitorApi.googleConnect(); window.location.assign(url); })}><Link2 size={14} /> Connect Google</button>
            )}
            {status.status === "connected" && (
              <>
                <button type="button" className={btnGhost} disabled={!!busy} onClick={() => act("props", async () => setProperties(await competitorApi.gscProperties()))}>{busy === "props" ? "Loading…" : "Choose property"}</button>
                <button type="button" className={btnPrimary} disabled={!!busy || !status.property} onClick={() => act("sync", async () => { const r = await competitorApi.gscSync(); setInfo(`Synced ${r.keywords} queries for ${r.period.start} → ${r.period.end}: ${r.totals.clicks} clicks, ${r.totals.impressions} impressions.`); })}><RefreshCw size={14} /> {busy === "sync" ? "Syncing…" : "Sync last 28 days"}</button>
                <button type="button" className={btnDanger} disabled={!!busy} onClick={() => { if (window.confirm("Disconnect Google Search Console?")) void act("disc", async () => { await competitorApi.googleDisconnect(); }); }}><Unplug size={14} /> Disconnect</button>
              </>
            )}
          </div>
          {properties && (
            <div className="rounded border border-slate-200 p-2">
              {!properties.length ? <p className="text-xs text-slate-500">This Google account has no Search Console properties.</p> : properties.map((p) => (
                <label key={p.siteUrl} className="flex items-center gap-2 py-1 text-sm">
                  <input type="radio" name="gsc-prop" checked={status.property === p.siteUrl} onChange={() => act("set", async () => { await competitorApi.gscSetProperty(p.siteUrl); setProperties(null); })} />
                  <span className="normal-case">{p.siteUrl}</span> <span className="text-xs text-slate-400">({p.permissionLevel})</span>
                </label>
              ))}
            </div>
          )}
          {status.lastSync && (
            <p className="text-xs text-slate-600">Last sync {fmtDate(status.lastSyncAt)} · {status.lastSync.period.start} → {status.lastSync.period.end} · {status.lastSync.totals.clicks} clicks · {status.lastSync.totals.impressions} impressions · avg position {status.lastSync.totals.position ?? "—"}</p>
          )}
        </div>
      )}
    </Card>
  );
}
