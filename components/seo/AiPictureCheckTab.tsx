"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Image as ImageIcon, Info, Loader2, ScanSearch, ShieldCheck } from "lucide-react";
import { seoAuditApi, type AiImageRow, type AiImagesData } from "@/lib/seoAuditApi";
import { errorMessage } from "@/lib/errorMessage";
import PaginationBar from "@/components/seo/PaginationBar";

interface RouteOption {
  id: string;
  label: string;
  path: string;
}

type Filter = "all" | "ai" | "real" | "unknown";

const fileName = (src: string) => {
  try {
    return decodeURIComponent(new URL(src).pathname.split("/").pop() || src);
  } catch {
    return src;
  }
};

function Verdict({ r, threshold }: { r: AiImageRow; threshold: number }) {
  if (r.status !== "checked") {
    return <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-px text-[0.6875rem] text-slate-500">{r.status === "failed" ? "Could not read" : "Skipped"}</span>;
  }
  if (r.provenAi) return <span className="rounded-full border border-rose-300 bg-rose-100 px-2 py-px text-[0.6875rem] text-rose-800">Proven AI-made (the file says so)</span>;
  if (r.likelihood === null) return <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-px text-[0.6875rem] text-slate-500">No AI estimate</span>;
  if (r.likelihood >= threshold) return <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-px text-[0.6875rem] text-amber-900">Looks AI-made · {r.likelihood}% (estimate)</span>;
  return <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-px text-[0.6875rem] text-emerald-800">Looks real · {r.likelihood}% AI (estimate)</span>;
}

/** How much of a page's pictures are AI-made: proof from the file where it exists, an AI model's estimate (labelled) otherwise */
export default function AiPictureCheckTab({ routes, initialPath }: { routes: RouteOption[]; initialPath?: string }) {
  const [route, setRoute] = useState(initialPath || routes[0]?.path || "/");
  const [data, setData] = useState<AiImagesData | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const run = async (force = false) => {
    setRunning(true);
    setError(null);
    setPage(1);
    try {
      setData(await seoAuditApi.aiImages(route, { force }));
    } catch (e) {
      setData(null);
      setError(errorMessage(e) || "The pictures could not be checked.");
    } finally {
      setRunning(false);
    }
  };

  const rows = useMemo(() => {
    const all = data?.rows ?? [];
    return all.filter((r) => {
      if (filter === "ai") return r.provenAi || (r.likelihood ?? 0) >= (data?.threshold ?? 70);
      if (filter === "real") return !r.provenAi && r.likelihood !== null && r.likelihood < (data?.threshold ?? 70);
      if (filter === "unknown") return r.status !== "checked" || (!r.provenAi && r.likelihood === null);
      return true;
    });
  }, [data, filter]);
  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * pageSize, current * pageSize);

  const pct = data?.percentAi;
  const tone = pct === null || pct === undefined ? "slate" : pct >= 40 ? "rose" : pct >= 15 ? "amber" : "emerald";
  const toneCls = { slate: "bg-slate-50 border-slate-200 text-slate-700", rose: "bg-rose-50 border-rose-200 text-rose-800", amber: "bg-amber-50 border-amber-200 text-amber-800", emerald: "bg-emerald-50 border-emerald-200 text-emerald-800" }[tone];

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3">
        <h2 className="text-[0.9375rem] text-slate-800 [font-weight:500]">AI picture check</h2>
        <p className="max-w-3xl text-[0.75rem] text-slate-500">
          Finds out how many pictures of a page were made by AI. Two kinds of answer are kept apart: <strong>proof</strong> written inside the picture file
          (a fact), and an <strong>estimate</strong> from an AI model that looks at the picture (never proof).
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select value={route} onChange={(e) => { setRoute(e.target.value); setData(null); }} aria-label="Choose a page" className="h-8 min-w-[260px] cursor-pointer rounded-lg border border-slate-200 bg-white px-2 text-[0.8125rem] text-slate-800">
            {routes.map((r) => (
              <option key={r.id} value={r.path}>
                {r.label}
              </option>
            ))}
          </select>
          <button type="button" onClick={() => void run(false)} disabled={running} className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg bg-violet-600 px-4 text-[0.8125rem] text-white transition hover:bg-violet-500 disabled:opacity-60">
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />} {running ? "Checking the pictures…" : "Check the pictures"}
          </button>
          {data && (
            <button type="button" onClick={() => void run(true)} disabled={running} className="h-8 cursor-pointer rounded-lg border border-slate-200 bg-white px-3 text-[0.75rem] text-slate-600 hover:bg-slate-50 disabled:opacity-60" title="Ask the AI model again even for pictures already checked">
              Check again from scratch
            </button>
          )}
        </div>
      </div>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[0.75rem] text-rose-800">{error}</div>}

      {!data && !running && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-[0.8125rem] text-slate-500">
          Pick a page and press &ldquo;Check the pictures&rdquo;. Each picture is opened once; a picture checked before is not sent to the AI model again.
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <div className={`rounded-xl border px-3 py-2.5 ${toneCls}`}>
              <div className="text-[1.5rem] leading-none [font-weight:500]">{pct === null || pct === undefined ? "—" : `${pct}%`}</div>
              <div className="mt-1 text-[0.75rem]">of the pictures are AI-made</div>
              <div className="text-[0.6875rem] opacity-80">{data.judged ? `${data.provenAi + data.likelyAi} of ${data.judged} judged (proven, or estimated at ${data.threshold}%+)` : "No picture could be judged"}</div>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5">
              <div className="text-[1.25rem] leading-none text-sky-800 [font-weight:500]">{data.totalPictures}</div>
              <div className="mt-1 text-[0.75rem] text-slate-700">Pictures on the page</div>
              <div className="text-[0.6875rem] text-slate-500">{data.skippedDecorative} decorative · {data.skippedVector} icons / SVG skipped</div>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[1.25rem] leading-none text-rose-800 [font-weight:500]"><ShieldCheck className="h-4 w-4" />{data.provenAi}</div>
              <div className="mt-1 text-[0.75rem] text-slate-700">Proven AI-made</div>
              <div className="text-[0.6875rem] text-slate-500">The file itself says so</div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <div className="flex items-center gap-1.5 text-[1.25rem] leading-none text-amber-800 [font-weight:500]"><Bot className="h-4 w-4" />{data.likelyAi}</div>
              <div className="mt-1 text-[0.75rem] text-slate-700">Look AI-made (estimate)</div>
              <div className="text-[0.6875rem] text-slate-500">{data.averageLikelihood !== null ? `Average estimate ${data.averageLikelihood}%` : "No estimate available"}</div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[0.75rem] text-amber-900">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              A percentage from an AI model is an <strong>estimate</strong>, not proof: a real photo can look AI-made and the other way round. Only &ldquo;Proven&rdquo; is a fact.
              {data.notCheckedThisRun > 0 && ` ${data.notCheckedThisRun} more picture${data.notCheckedThisRun === 1 ? "" : "s"} on this page were not checked in this run.`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[0.6875rem]">
            {([
              { id: "all", label: "All" },
              { id: "ai", label: "AI-made or looks AI" },
              { id: "real", label: "Look real" },
              { id: "unknown", label: "Could not judge" },
            ] as const).map((f) => (
              <button key={f.id} type="button" aria-pressed={filter === f.id} onClick={() => { setFilter(f.id); setPage(1); }} className={`cursor-pointer rounded-full border px-2.5 py-0.5 transition ${filter === f.id ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"}`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            {visible.map((r) => (
              <article key={r.src} className="flex gap-3 rounded-xl border border-slate-200 bg-white p-2">
                <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.src} alt={r.alt} className="max-h-full max-w-full object-contain" loading="lazy" onError={(e) => (e.currentTarget.style.display = "none")} />
                  <ImageIcon className="absolute h-5 w-5 text-slate-300 -z-10" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate font-mono text-[0.75rem] text-slate-800" title={r.src}>{fileName(r.src)}</span>
                    <Verdict r={r} threshold={data.threshold} />
                    {r.kind && <span className="rounded-full bg-slate-100 px-2 py-px text-[0.6875rem] text-slate-500">{r.kind}</span>}
                    {r.cached && <span className="text-[0.6875rem] text-slate-400">saved result</span>}
                  </div>
                  {r.likelihood !== null && (
                    <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100" title={`${r.likelihood}% estimated`}>
                      <div className={`h-full rounded-full ${r.likelihood >= data.threshold ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${r.likelihood}%` }} />
                    </div>
                  )}
                  {r.metadataSignals.length > 0 && (
                    <ul className="text-[0.6875rem] text-slate-600">
                      {r.metadataSignals.map((m) => (
                        <li key={m} className="flex items-start gap-1"><AlertTriangle className="mt-px h-3 w-3 shrink-0 text-rose-500" />{m}</li>
                      ))}
                    </ul>
                  )}
                  {r.reasons.length > 0 && <p className="text-[0.6875rem] text-slate-500">{r.reasons.join(" · ")}{r.model ? ` (${r.model})` : ""}</p>}
                  {r.reason && <p className="text-[0.6875rem] text-slate-500">{r.reason}</p>}
                  {r.status === "checked" && r.likelihood === null && !r.provenAi && !r.reason && <p className="flex items-center gap-1 text-[0.6875rem] text-slate-500"><CheckCircle2 className="h-3 w-3" /> No AI marker found in the file.</p>}
                </div>
              </article>
            ))}
            {rows.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-[0.8125rem] text-slate-500">No picture matches this filter.</div>}
          </div>

          {rows.length > 0 && <PaginationBar page={current} pageSize={pageSize} total={rows.length} noun="pictures" sizes={[10, 20, 40]} onPage={setPage} onPageSize={(n) => { setPageSize(n); setPage(1); }} />}
        </>
      )}
    </div>
  );
}
