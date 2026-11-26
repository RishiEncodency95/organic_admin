"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, RotateCcw, ShieldCheck, Sparkles, Undo2 } from "lucide-react";
import { seoAuditApi, type ContentBlock, type ContentBlocksData, type HumanizeBlockData } from "@/lib/seoAuditApi";
import { errorMessage } from "@/lib/errorMessage";

interface PageTextBlocksProps {
  route: string;
}

type Preview = { data: HumanizeBlockData; text: string; edited: boolean };

const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The text split so every flagged phrase can be wrapped in <mark> */
function highlight(text: string, phrases: string[]) {
  const usable = phrases.map((p) => p.trim()).filter((p) => p.length > 2);
  if (usable.length === 0) return [text];
  return text.split(new RegExp(`(${usable.map(escapeRegex).join("|")})`, "gi"));
}

const shorten = (n: number) => (n === 0 ? "same length" : `${n > 0 ? "+" : ""}${n}% length`);

export default function PageTextBlocks({ route }: PageTextBlocksProps) {
  const [data, setData] = useState<ContentBlocksData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onlyFlagged, setOnlyFlagged] = useState(true);
  const [previews, setPreviews] = useState<Record<string, Preview>>({});
  const [busy, setBusy] = useState<Record<string, "humanize" | "apply" | "undo">>({});
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [applied, setApplied] = useState<Record<string, { logId: string; text: string }>>({});
  const [bulk, setBulk] = useState<{ done: number; total: number } | null>(null);
  const seq = useRef(0);

  const load = useCallback(async () => {
    const mine = ++seq.current;
    setLoading(true);
    setError(null);
    try {
      const d = await seoAuditApi.contentBlocks(route);
      if (mine !== seq.current) return;
      setData(d);
      setOnlyFlagged(d.flagged > 0);
      setPreviews({});
      setApplied({});
      setRowError({});
    } catch (err) {
      if (mine !== seq.current) return;
      setData(null);
      setError((errorMessage(err) || "The page text could not be read."));
    } finally {
      if (mine === seq.current) setLoading(false);
    }
  }, [route]);

  useEffect(() => {
    // the text is read when the page changes; load() shows the loading state while it runs
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const setBusyFor = (id: string, v: "humanize" | "apply" | "undo" | null) =>
    setBusy((p) => {
      const n = { ...p };
      if (v) n[id] = v;
      else delete n[id];
      return n;
    });
  const setErr = (id: string, m: string | null) =>
    setRowError((p) => {
      const n = { ...p };
      if (m) n[id] = m;
      else delete n[id];
      return n;
    });

  const humanize = async (b: ContentBlock): Promise<boolean> => {
    setBusyFor(b.id, "humanize");
    setErr(b.id, null);
    try {
      const d = await seoAuditApi.humanizeBlock(route, b.id);
      setPreviews((p) => ({ ...p, [b.id]: { data: d, text: d.humanized, edited: false } }));
      return true;
    } catch (err) {
      setErr(b.id, (errorMessage(err) || "The text could not be rewritten."));
      return false;
    } finally {
      setBusyFor(b.id, null);
    }
  };

  const apply = async (b: ContentBlock): Promise<boolean> => {
    const pv = previews[b.id];
    if (!pv) return false;
    setBusyFor(b.id, "apply");
    setErr(b.id, null);
    try {
      const r = await seoAuditApi.applyBlock({ route, blockId: b.id, original: pv.data.original, text: pv.text, edited: pv.edited });
      setApplied((p) => ({ ...p, [b.id]: { logId: r.logId, text: pv.text } }));
      setPreviews((p) => {
        const n = { ...p };
        delete n[b.id];
        return n;
      });
      // the block now holds the new text
      setData((d) => (d ? { ...d, blocks: d.blocks.map((x) => (x.id === b.id ? { ...x, text: pv.text, chars: pv.text.length } : x)) } : d));
      return true;
    } catch (err) {
      setErr(b.id, (errorMessage(err) || "The text could not be saved."));
      return false;
    } finally {
      setBusyFor(b.id, null);
    }
  };

  const undo = async (b: ContentBlock) => {
    const ap = applied[b.id];
    if (!ap) return;
    setBusyFor(b.id, "undo");
    setErr(b.id, null);
    try {
      await seoAuditApi.rollbackFix(ap.logId);
      setApplied((p) => {
        const n = { ...p };
        delete n[b.id];
        return n;
      });
      await load();
    } catch (err) {
      setErr(b.id, (errorMessage(err) || "Undo failed."));
    } finally {
      setBusyFor(b.id, null);
    }
  };

  const shown = useMemo(() => (data ? data.blocks.filter((b) => !onlyFlagged || b.flagged.length > 0 || previews[b.id] || applied[b.id]) : []), [data, onlyFlagged, previews, applied]);

  const humanizeAllFlagged = async () => {
    if (!data) return;
    const todo = data.blocks.filter((b) => b.flagged.length > 0 && !previews[b.id] && !applied[b.id]);
    setBulk({ done: 0, total: todo.length });
    for (let i = 0; i < todo.length; i++) {
      await humanize(todo[i]);
      setBulk({ done: i + 1, total: todo.length });
    }
    setBulk(null);
  };

  const applyAllReady = async () => {
    const ready = (data?.blocks ?? []).filter((b) => previews[b.id]);
    setBulk({ done: 0, total: ready.length });
    for (let i = 0; i < ready.length; i++) {
      await apply(ready[i]);
      setBulk({ done: i + 1, total: ready.length });
    }
    setBulk(null);
  };

  const readyCount = Object.keys(previews).length;

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="space-y-2 border-b border-slate-100 px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-1.5 text-sm font-black text-[#0b2a6b]">
              <Sparkles className="h-4 w-4 text-emerald-600" /> Page text
              {data && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-600">{data.total} blocks</span>}
              {data && data.flagged > 0 && <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-black text-red-700">{data.flagged} with stiff wording</span>}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">
              This is the text saved for this page in the website. Humanize only rewords it: same facts, same length, same line breaks. Nothing is saved until you press &ldquo;Apply to website&rdquo;.
            </p>
          </div>
          {data && (
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-[11px] font-bold text-slate-600">
                <input type="checkbox" checked={onlyFlagged} onChange={(e) => setOnlyFlagged(e.target.checked)} className="h-3.5 w-3.5 cursor-pointer accent-emerald-600" />
                Only stiff wording
              </label>
              <button
                type="button"
                disabled={bulk !== null || data.flagged === 0}
                onClick={() => void humanizeAllFlagged()}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3 text-xs font-black text-white hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 cursor-pointer"
              >
                {bulk && readyCount >= 0 && bulk.total > 0 ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {bulk ? `Working… ${bulk.done}/${bulk.total}` : `Humanize all flagged (${data.flagged})`}
              </button>
              {readyCount > 0 && (
                <button
                  type="button"
                  disabled={bulk !== null}
                  onClick={() => void applyAllReady()}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#0b2a6b] px-3 text-xs font-black text-white hover:bg-[#0d338a] disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Apply all ready ({readyCount})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {loading && !data ? (
        <div className="flex items-center gap-2 px-4 py-8 text-xs font-bold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Reading the page text…
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 px-4 py-6 text-xs font-bold text-amber-800">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      ) : shown.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-6 text-xs font-bold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> {data && data.flagged === 0 ? "No stiff wording found on this page." : "Nothing to show."}
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {shown.map((b) => {
            const pv = previews[b.id];
            const ap = applied[b.id];
            const work = busy[b.id];
            return (
              <li key={b.id} className="space-y-2 px-4 py-3 text-xs">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">{b.label}</span>
                      <span className="text-[10px] font-medium text-slate-400">{b.chars} characters{b.lineBreaks ? ` · ${b.lineBreaks + 1} lines` : ""}</span>
                      {b.flagged.map((f) => (
                        <span key={f} className="rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                          {f}
                        </span>
                      ))}
                    </div>
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-800">
                      {highlight(b.text, b.flagged).map((part, i) =>
                        b.flagged.some((f) => f.toLowerCase() === part.trim().toLowerCase()) ? (
                          <mark key={i} className="rounded bg-red-100 px-0.5 text-red-800">
                            {part}
                          </mark>
                        ) : (
                          <Fragment key={i}>{part}</Fragment>
                        )
                      )}
                    </p>
                  </div>
                  {!pv && !ap && (
                    <button
                      type="button"
                      disabled={work !== undefined || bulk !== null}
                      onClick={() => void humanize(b)}
                      className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 font-black text-white hover:bg-emerald-500 disabled:opacity-60 cursor-pointer"
                    >
                      {work === "humanize" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Humanize
                    </button>
                  )}
                </div>

                {pv && (
                  <div className="space-y-2 rounded-lg border border-emerald-300 bg-emerald-50 p-3">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-emerald-900">
                      <span>Nothing is saved yet. This is what will be written:</span>
                      <span className="rounded bg-white px-1.5 py-0.5 text-[10px] text-emerald-800">{b.chars} → {pv.text.length} characters ({shorten(Math.round(((pv.text.length - b.chars) / Math.max(1, b.chars)) * 100))})</span>
                      <span className="inline-flex items-center gap-1 rounded bg-white px-1.5 py-0.5 text-[10px] text-emerald-800"><ShieldCheck className="h-3 w-3" /> same line breaks · no new numbers, names or claims</span>
                    </div>
                    <textarea
                      value={pv.text}
                      onChange={(e) => setPreviews((p) => ({ ...p, [b.id]: { ...pv, text: e.target.value, edited: e.target.value !== pv.data.humanized } }))}
                      rows={Math.min(10, Math.max(2, pv.text.split("\n").length + 1))}
                      className="w-full rounded border border-emerald-300 bg-white p-2 text-xs leading-relaxed text-slate-900 outline-none focus:border-emerald-700"
                    />
                    {pv.edited && <div className="text-[11px] font-bold text-amber-700">You changed the text. It is saved exactly as typed (no automatic fact check).</div>}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={work !== undefined || bulk !== null || pv.text === pv.data.original}
                        onClick={() => void apply(b)}
                        className="h-8 rounded-lg bg-emerald-700 px-3 font-black text-white hover:bg-emerald-600 disabled:opacity-60 cursor-pointer"
                      >
                        {work === "apply" ? "Saving…" : "Apply to website"}
                      </button>
                      <button
                        type="button"
                        disabled={work !== undefined || bulk !== null}
                        onClick={() => void humanize(b)}
                        className="inline-flex h-8 items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 font-bold text-emerald-900 disabled:opacity-60 cursor-pointer"
                      >
                        {work === "humanize" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} Try again
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPreviews((p) => {
                            const n = { ...p };
                            delete n[b.id];
                            return n;
                          })
                        }
                        className="h-8 rounded-lg border border-slate-300 bg-white px-3 font-bold text-slate-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {ap && (
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] font-bold text-emerald-900">
                    <span className="inline-flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Saved. The website now shows this text.
                    </span>
                    <button
                      type="button"
                      disabled={work !== undefined}
                      onClick={() => void undo(b)}
                      className="inline-flex h-7 items-center gap-1 rounded-md border border-emerald-300 bg-white px-2.5 font-bold text-emerald-900 disabled:opacity-60 cursor-pointer"
                    >
                      {work === "undo" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />} Undo
                    </button>
                  </div>
                )}

                {rowError[b.id] && <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-900">{rowError[b.id]}</div>}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
