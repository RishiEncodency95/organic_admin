"use client";

import { useEffect, useState } from "react";
import { EyeOff, Loader2, Wand2 } from "lucide-react";
import { seoAuditApi, type NotFoundEntry } from "@/lib/seoAuditApi";
import { api } from "@/lib/api";

export default function NotFoundLogTab() {
  const [rows, setRows] = useState<NotFoundEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    seoAuditApi
      .getNotFoundLog()
      .then((r) => {
        if (cancelled) return;
        setRows(r);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the 404 log.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const autoRedirect = async () => {
    setRunning(true);
    setInfo(null);
    setError(null);
    try {
      const r = await seoAuditApi.autoRedirectNotFound();
      setInfo(`${r.created} redirect(s) created from ${r.examined} open entries. ${r.unmatched.length} had no confident match and stay open.`);
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create redirects.");
    } finally {
      setRunning(false);
    }
  };

  const ignore = async (id: string) => {
    setBusy(id);
    try {
      await api.post(`/seo-audit/404-log/${id}/ignore`, {});
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update the entry.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <p className="max-w-2xl text-[11px] font-medium text-slate-500">
          Missing pages reported by the website (and confirmed to answer 404 on the live site), with where visitors came from. A redirect is only created when you press the button: it points to the live page whose address is most similar.
        </p>
        <button type="button" onClick={autoRedirect} disabled={running} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0b2a6b] px-3.5 text-xs font-black text-white disabled:opacity-60 cursor-pointer">
          {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />} Create redirects for confident matches
        </button>
      </div>
      {info && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">{info}</div>}
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">{error}</div>}
      {loading && !rows ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-6 text-xs font-bold text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : !rows || rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-xs font-bold text-slate-500">No missing pages have been reported yet.</div>
      ) : (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs">
          {rows.map((r) => (
            <li key={r._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs">
              <div className="min-w-0 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{r.path}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">{r.hits} hit{r.hits === 1 ? "" : "s"}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${r.status === "redirected" ? "bg-emerald-100 text-emerald-700" : r.status === "ignored" ? "bg-slate-200 text-slate-500" : "bg-amber-100 text-amber-800"}`}>{r.status}</span>
                </div>
                {r.referrers.length > 0 && <div className="truncate text-[11px] text-slate-500">From: {r.referrers.slice(0, 3).map((x) => `${x.referrer} (${x.count})`).join(", ")}</div>}
                {r.status === "redirected" && r.resolvedTo && <div className="text-[11px] text-emerald-700">Redirects to {r.resolvedTo}</div>}
                {r.status === "open" && (r.suggestion ? <div className="text-[11px] text-indigo-700">Best match: {r.suggestion.path} ({Math.round(r.suggestion.confidence * 100)}%)</div> : <div className="text-[11px] text-slate-400">No similar live page found.</div>)}
              </div>
              {r.status === "open" && (
                <button type="button" disabled={busy === r._id} onClick={() => ignore(r._id)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-2.5 font-bold text-slate-700 disabled:opacity-60 cursor-pointer"><EyeOff className="h-3.5 w-3.5" /> Ignore</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
