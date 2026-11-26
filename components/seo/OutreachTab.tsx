"use client";

import { useEffect, useState } from "react";
import { Loader2, Mail, Search, Send } from "lucide-react";
import { seoAuditApi, type OutreachDraftEntry } from "@/lib/seoAuditApi";

type Status = { mentionSourceConfigured: boolean; mentionSource: string | null; aiConfigured: boolean };
type Mention = { url: string; title: string; snippet: string };

export default function OutreachTab() {
  const [status, setStatus] = useState<Status | null>(null);
  const [mentions, setMentions] = useState<Mention[] | null>(null);
  const [mentionMsg, setMentionMsg] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<OutreachDraftEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([seoAuditApi.getOutreachStatus(), seoAuditApi.getOutreachDrafts()])
      .then(([s, d]) => {
        if (cancelled) return;
        setStatus(s);
        setDrafts(d);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load outreach.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const search = async () => {
    setSearching(true);
    setError(null);
    try {
      const r = await seoAuditApi.findUnlinkedMentions();
      setMentions(r.mentions);
      setMentionMsg(r.configured ? `Checked ${r.checked} result(s): ${r.mentions.length} mention(s) without a link to this site.` : r.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : "The search failed.");
    } finally {
      setSearching(false);
    }
  };

  const draft = async (m: Mention) => {
    setBusy(m.url);
    setError(null);
    try {
      await seoAuditApi.createOutreachDraft({ url: m.url });
      setVersion((v) => v + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not write the draft.");
    } finally {
      setBusy(null);
    }
  };

  const push = async (d: OutreachDraftEntry) => {
    setBusy(d._id);
    setError(null);
    try {
      await seoAuditApi.pushOutreachDraft(d._id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not push the draft.");
    } finally {
      setBusy(null);
      setVersion((v) => v + 1);
    }
  };

  if (loading && !status) {
    return <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-6 text-xs font-bold text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-2 text-xs">
        <div className="font-black text-[#0b2a6b]">Outreach for unlinked brand mentions</div>
        <p className="text-[11px] font-medium text-slate-500">Polite, one-off emails to sites that already mention you without linking. Drafts are written by the AI, shown here for you to read, and only sent to your automation webhook when you press Push. Nothing is sent automatically.</p>
        <div className="flex flex-wrap gap-2 text-[11px] font-bold">
          <span className={`rounded-full px-2.5 py-1 ${status?.mentionSourceConfigured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>Mention search: {status?.mentionSourceConfigured ? "configured" : "not configured"}</span>
          <span className={`rounded-full px-2.5 py-1 ${status?.aiConfigured ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>AI writer: {status?.aiConfigured ? "configured" : "not configured"}</span>
        </div>
        {!status?.mentionSourceConfigured && <div className="text-[11px] text-amber-800">Without a search source (Google Programmable Search: GOOGLE_CSE_API_KEY and GOOGLE_CSE_ID on the server) no mentions can be found, and none are invented.</div>}
        <button type="button" onClick={search} disabled={searching || !status?.mentionSourceConfigured} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0b2a6b] px-3.5 font-black text-white disabled:opacity-60 cursor-pointer">
          {searching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />} Find unlinked mentions
        </button>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700">{error}</div>}
      {mentionMsg && <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700">{mentionMsg}</div>}

      {mentions && mentions.length > 0 && (
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-xs">
          {mentions.map((m) => (
            <li key={m.url} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs">
              <div className="min-w-0">
                <div className="truncate font-bold text-slate-900">{m.title || m.url}</div>
                <div className="truncate font-mono text-[10px] text-slate-400">{m.url}</div>
              </div>
              <button type="button" disabled={busy === m.url || !status?.aiConfigured} onClick={() => draft(m)} className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 font-black text-white disabled:opacity-60 cursor-pointer">
                {busy === m.url ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Mail className="h-3.5 w-3.5" />} Write draft
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="text-xs font-black text-[#0b2a6b]">Drafts</div>
      {!drafts || drafts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-xs font-bold text-slate-500">No drafts yet.</div>
      ) : (
        <ul className="space-y-3">
          {drafts.map((d) => (
            <li key={d._id} className="rounded-xl border border-slate-200 bg-white p-4 text-xs shadow-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 truncate font-mono text-[10px] text-slate-400">{d.mentionUrl}</div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${d.status === "pushed" ? "bg-emerald-100 text-emerald-700" : d.status === "failed" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>{d.status}</span>
              </div>
              <div className="font-bold text-slate-900">{d.subject}</div>
              <p className="whitespace-pre-wrap text-slate-700">{d.body}</p>
              {d.error && <div className="font-bold text-red-700">{d.error}</div>}
              {(d.status === "draft" || d.status === "failed") && (
                <button type="button" disabled={busy === d._id} onClick={() => push(d)} className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-300 px-2.5 font-black text-slate-800 disabled:opacity-60 cursor-pointer">
                  {busy === d._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Push to webhook
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
