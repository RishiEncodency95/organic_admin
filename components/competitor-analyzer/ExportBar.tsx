"use client";

import { useState } from "react";
import { Check, Copy, FileDown, Link2, X } from "lucide-react";
import { reportFiles, saveBlob, shareApi, type ShareLink } from "@/lib/competitorAnalyzerApi";
import { btnDanger, btnGhost, btnPrimary, ErrorBox, errorText, fmtDate } from "./ui";

/* PDF (English / Hindi) downloads and expiring, revocable share links — all from the saved run. */

export default function ExportBar({ studyId, runId, studyName }: { studyId: string; runId: string; studyName: string }) {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [links, setLinks] = useState<ShareLink[] | null>(null);
  const [created, setCreated] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [days, setDays] = useState<7 | 30 | 90>(30);

  const pdf = async (lang: "en" | "hi") => {
    setBusy(lang);
    setError("");
    try {
      saveBlob(await reportFiles.pdf(studyId, runId, lang), `${studyName.replace(/[^\w-]+/g, "-").slice(0, 50)}-${lang}.pdf`);
    } catch (e) {
      setError(errorText(e, "PDF could not be created"));
    } finally {
      setBusy("");
    }
  };
  const loadLinks = async () => {
    try {
      setLinks(await shareApi.list(studyId));
    } catch (e) {
      setError(errorText(e));
    }
  };
  const create = async () => {
    setBusy("share");
    setError("");
    try {
      const r = await shareApi.create(studyId, runId, days);
      setCreated(r.url);
      setCopied(false);
      await loadLinks();
    } catch (e) {
      setError(errorText(e, "Share link could not be created"));
    } finally {
      setBusy("");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-end gap-1 rounded-2xl border border-[#e1e7e3] bg-white p-2">
        <span className="mr-auto px-2 text-[10px] font-medium text-slate-400">Saved report / export & share</span>
        <button type="button" className={btnGhost} disabled={!!busy} onClick={() => pdf("en")}><FileDown size={14} /> {busy === "en" ? "Preparing…" : "PDF (English)"}</button>
        <button type="button" className={btnGhost} disabled={!!busy} onClick={() => pdf("hi")}><FileDown size={14} /> {busy === "hi" ? "तैयार हो रहा है…" : "PDF (हिंदी)"}</button>
        <button type="button" className={btnGhost} onClick={() => { setOpen((o) => !o); if (!links) void loadLinks(); }}><Link2 size={14} /> Share link</button>
      </div>
      <ErrorBox message={error} />
      {open && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Read-only link (no login needed)</p>
            <button type="button" onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
          </div>
          <p className="mb-2 text-xs text-slate-500">Shows this exact report (it will not change later). Private data — Search Console, notes, settings — is never included.</p>
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-8 rounded-md border border-slate-200 px-2 text-sm" value={days} onChange={(e) => setDays(Number(e.target.value) as 7 | 30 | 90)}>
              <option value={7}>Expires in 7 days</option>
              <option value={30}>Expires in 30 days</option>
              <option value={90}>Expires in 90 days</option>
            </select>
            <button type="button" className={btnPrimary} disabled={busy === "share"} onClick={create}><Link2 size={14} /> Create link</button>
          </div>
          {created && (
            <div className="mt-2 flex items-center gap-2 rounded bg-teal-50 p-2 text-xs">
              <code className="flex-1 break-all text-teal-900">{created}</code>
              <button type="button" className={btnGhost} onClick={async () => { await navigator.clipboard.writeText(created); setCopied(true); }}>{copied ? <Check size={14} /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>
            </div>
          )}
          {created && <p className="mt-1 text-[11px] text-amber-700">Copy it now — for safety the full link is shown only once.</p>}
          {!!links?.length && (
            <table className="mt-3 w-full text-left text-xs">
              <thead className="text-slate-400"><tr><th className="py-1">Created</th><th>Expires</th><th>Views</th><th>Status</th><th /></tr></thead>
              <tbody>
                {links.map((l) => (
                  <tr key={l.id} className="border-t border-slate-100">
                    <td className="py-1">{fmtDate(l.createdAt)}</td>
                    <td>{fmtDate(l.expiresAt)}</td>
                    <td>{l.views}</td>
                    <td>{l.active ? "active" : l.revokedAt ? "revoked" : "expired"}</td>
                    <td className="text-right">{l.active && <button type="button" className={btnDanger} onClick={async () => { await shareApi.revoke(studyId, l.id); await loadLinks(); }}>Revoke</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

