"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, ShieldCheck, X, XCircle } from "lucide-react";
import { seoAuditApi, type AutoPilotItem, type AutoPilotItemStatus, type AutoPilotOverview } from "@/lib/seoAuditApi";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Called after something was applied, so the audit lists reload */
  onChanged: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  title: "Page title",
  description: "Meta description",
  canonical: "Canonical link",
  og: "Share card (Open Graph)",
  schema: "Schema markup",
  h1: "Main heading (H1)",
};

const STATUS_STYLE: Record<AutoPilotItemStatus, { label: string; cls: string }> = {
  pending: { label: "Waiting for you", cls: "border-amber-200 bg-amber-50 text-amber-800" },
  applying: { label: "Applying…", cls: "border-slate-200 bg-slate-50 text-slate-700" },
  applied: { label: "Applied", cls: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  rejected: { label: "Rejected", cls: "border-slate-200 bg-slate-100 text-slate-600" },
  stale: { label: "Page changed meanwhile", cls: "border-orange-200 bg-orange-50 text-orange-800" },
  failed: { label: "Not applied", cls: "border-red-200 bg-red-50 text-red-700" },
};

const REASON_TEXT: Record<string, string> = {
  ai_unavailable: "no AI answer was available, so nothing was suggested (nothing is invented)",
  ai_out_of_range: "the AI answer was outside the allowed length, so nothing was suggested",
  no_source_value: "there is no text to build it from",
};

const reasonText = (raw: string) => {
  const [field, code] = raw.split(": ");
  return `${field}: ${REASON_TEXT[code] ?? code ?? raw}`;
};

const pageName = (route: string) => (route === "home" ? "Home page  /" : `/${route}`);

/** One value as readable lines (a text, or the share-card fields) */
function ValueView({ value, tone }: { value: unknown; tone: "old" | "new" }) {
  const box = tone === "new" ? "border-emerald-200 bg-emerald-50/60 text-slate-900" : "border-slate-200 bg-slate-50 text-slate-700";
  let body: React.ReactNode;
  if (value === null || value === undefined || value === "") {
    body = <span className="italic text-slate-400">(empty)</span>;
  } else if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    body = (
      <dl className="space-y-1">
        {Object.entries(o).map(([k, v]) => (
          <div key={k}>
            <dt className="text-[0.6875rem] uppercase tracking-wide text-slate-500">{k.replace(/^og/, "").replace(/([A-Z])/g, " $1").trim() || k}</dt>
            <dd className="break-words">{v === "" || v == null ? <span className="italic text-slate-400">(empty)</span> : String(v)}</dd>
          </div>
        ))}
      </dl>
    );
  } else {
    const text = String(value);
    body = <span className="whitespace-pre-wrap break-words">{text.length > 600 ? `${text.slice(0, 600)}…` : text}</span>;
  }
  return <div className={`max-h-40 overflow-auto rounded-lg border px-2.5 py-2 text-[0.8125rem] leading-snug ${box} ${typeof value === "string" && /^</.test(value.trim()) ? "font-mono text-[0.75rem]" : ""}`}>{body}</div>;
}

export default function AutoPilotApprovalModal({ isOpen, onClose, onChanged }: Props) {
  const [data, setData] = useState<AutoPilotOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "warn"; text: string } | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await seoAuditApi.getAutoPilot();
      setData(d);
      setError(null);
      setPicked(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the suggestions.");
    }
  }, []);

  useEffect(() => {
    // the request itself is async; only its answer sets state
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isOpen) void load();
  }, [isOpen, load]);

  // forget the last session's data and messages, so the next opening starts clean
  const close = () => {
    setData(null);
    setError(null);
    setMessage(null);
    setPicked(new Set());
    onClose();
  };

  const current = data?.current ?? null;
  const pending = useMemo(() => (current?.items ?? []).filter((i) => i.status === "pending"), [current]);
  const groups = useMemo(() => {
    const m = new Map<string, AutoPilotItem[]>();
    for (const i of current?.items ?? []) m.set(i.route, [...(m.get(i.route) ?? []), i]);
    return Array.from(m.entries());
  }, [current]);

  if (!isOpen) return null;

  const toggle = (id: string) =>
    setPicked((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allPicked = pending.length > 0 && pending.every((i) => picked.has(i.id));

  const decide = async (mode: "approve" | "reject") => {
    if (!current || picked.size === 0 || busy) return;
    setBusy(mode);
    setMessage(null);
    try {
      const ids = Array.from(picked);
      const res = await seoAuditApi.decideAutoPilot(current.id, mode === "approve" ? ids : [], mode === "reject" ? ids : []);
      const count = (s: AutoPilotItemStatus) => res.results.filter((r) => r.status === s).length;
      if (mode === "approve") {
        const parts = [`${count("applied")} applied`];
        if (count("stale")) parts.push(`${count("stale")} skipped because the page changed meanwhile`);
        if (count("failed")) parts.push(`${count("failed")} could not be applied`);
        setMessage({ tone: count("stale") + count("failed") > 0 ? "warn" : "ok", text: parts.join(", ") + "." });
        if (count("applied") > 0) onChanged();
      } else {
        setMessage({ tone: "ok", text: `${count("rejected")} rejected. Nothing was changed on your website.` });
      }
      await load();
    } catch (err) {
      setMessage({ tone: "warn", text: err instanceof Error ? err.message : "The decision could not be saved." });
      await load();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div>
            <div className="flex items-center gap-2 text-base font-semibold text-[#0b2a6b]">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Auto-Pilot suggestions: your approval needed
            </div>
            <p className="mt-1 text-[0.8125rem] text-slate-600">
              Nothing below is changed on your website yet. Tick what you want, then approve. Approved changes are logged and can be undone from the fix history.
            </p>
          </div>
          <button type="button" onClick={close} aria-label="Close" className="rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {message && (
            <div className={`mb-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-[0.8125rem] ${message.tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
              {message.tone === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}
          {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.8125rem] text-red-700">{error}</div>}
          {!data && !error && (
            <div className="flex items-center gap-2 py-10 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading suggestions…
            </div>
          )}

          {data && !current && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center text-sm text-slate-600">
              <p className="[font-weight:500] text-slate-800">Nothing is waiting for approval.</p>
              <p className="mt-1">When Auto-Pilot is ON, the next audit lists what it would change here. It never changes anything by itself.</p>
            </div>
          )}

          {current && (
            <>
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8125rem] text-slate-600">
                <span>
                  Prepared <strong className="font-semibold text-slate-800">{new Date(current.createdAt).toLocaleString()}</strong> from the latest audit ({current.pagesChecked} pages checked)
                </span>
                <span>
                  <strong className="font-semibold text-amber-700">{current.counts.pending}</strong> waiting
                  {current.counts.applied ? <> · <strong className="font-semibold text-emerald-700">{current.counts.applied}</strong> applied</> : null}
                  {current.counts.rejected ? <> · {current.counts.rejected} rejected</> : null}
                </span>
              </div>

              <div className="space-y-3">
                {groups.map(([route, items]) => (
                  <section key={route} className="overflow-hidden rounded-xl border border-slate-200">
                    <h3 className="border-b border-slate-200 bg-slate-50 px-4 py-2 text-[0.8125rem] font-semibold text-slate-800">{pageName(route)}</h3>
                    <ul className="divide-y divide-slate-100">
                      {items.map((i) => {
                        const st = STATUS_STYLE[i.status];
                        const decidable = i.status === "pending";
                        return (
                          <li key={i.id} className="px-4 py-3">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              {decidable ? (
                                <input type="checkbox" checked={picked.has(i.id)} onChange={() => toggle(i.id)} aria-label={`Select ${TYPE_LABEL[i.type] ?? i.type} of ${route}`} className="h-4 w-4 cursor-pointer accent-emerald-600" />
                              ) : (
                                <span className="h-4 w-4" />
                              )}
                              <span className="text-[0.8125rem] font-semibold text-slate-800">{TYPE_LABEL[i.type] ?? i.type}</span>
                              <span className={`rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold ${st.cls}`}>{st.label}</span>
                              {i.note && <span className="text-[0.75rem] text-slate-600">{i.note}</span>}
                            </div>
                            <div className="grid gap-2 md:grid-cols-2 md:pl-6">
                              <div>
                                <div className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-slate-500">Now</div>
                                <ValueView value={i.before} tone="old" />
                              </div>
                              <div>
                                <div className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-emerald-700">Auto-Pilot suggests</div>
                                <ValueView value={i.after} tone="new" />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              {current.notProposed.length > 0 && (
                <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[0.8125rem] text-slate-600">
                  <summary className="cursor-pointer font-semibold text-slate-700">{current.notProposed.length} problem(s) where no suggestion could be made</summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {current.notProposed.map((n, idx) => (
                      <li key={`${n.route}-${idx}`}>
                        <span className="font-medium">{pageName(n.route)}</span>: {reasonText(n.reason)}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </>
          )}

          {data && data.recent.length > 0 && (
            <details className="mt-4 text-[0.8125rem] text-slate-600">
              <summary className="cursor-pointer font-semibold text-slate-700">Earlier suggestions</summary>
              <ul className="mt-2 space-y-1">
                {data.recent.map((p) => (
                  <li key={p.id}>
                    {new Date(p.createdAt).toLocaleString()}: {p.counts.applied} applied, {p.counts.rejected} rejected
                    {p.counts.stale ? `, ${p.counts.stale} changed meanwhile` : ""}
                    {p.counts.failed ? `, ${p.counts.failed} failed` : ""}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-6 py-3">
          <label className="flex items-center gap-2 text-[0.8125rem] text-slate-700">
            <input
              type="checkbox"
              disabled={pending.length === 0}
              checked={allPicked}
              onChange={() => setPicked(allPicked ? new Set() : new Set(pending.map((i) => i.id)))}
              className="h-4 w-4 cursor-pointer accent-emerald-600"
            />
            Select all waiting ({pending.length})
          </label>
          <div className="flex items-center gap-2">
            <button type="button" onClick={close} className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-[0.8125rem] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              Close
            </button>
            <button
              type="button"
              disabled={picked.size === 0 || busy !== null}
              onClick={() => void decide("reject")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-[0.8125rem] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              {busy === "reject" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              Reject selected
            </button>
            <button
              type="button"
              disabled={picked.size === 0 || busy !== null}
              onClick={() => void decide("approve")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-[0.8125rem] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
            >
              {busy === "approve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Approve &amp; apply selected ({picked.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
