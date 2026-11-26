"use client";

import { useState } from "react";
import { AlertTriangle, Bot, Info, Loader2, Search } from "lucide-react";
import { seoAuditApi, type LiveContentScanResponse } from "@/lib/seoAuditApi";
import PageTextBlocks from "@/components/seo/PageTextBlocks";

interface RouteOption {
  id: string;
  label: string;
  path: string;
}

interface AiContentInspectorTabProps {
  routes: RouteOption[];
  initialPath?: string;
}

const scoreTone = (n: number) => (n >= 60 ? "text-red-600" : n >= 30 ? "text-amber-600" : "text-emerald-600");

export default function AiContentInspectorTab({ routes, initialPath = "/" }: AiContentInspectorTabProps) {
  const [path, setPath] = useState(initialPath);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LiveContentScanResponse["data"] | null>(null);
  const analyze = async () => {
    setScanning(true);
    setError(null);
    try {
      const res = await seoAuditApi.analyzeLiveContent({ route: path });
      setResult(res.data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "The page could not be analysed.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <label className="text-xs font-extrabold uppercase text-slate-500">Page</label>
        <select
          value={path}
          onChange={(e) => setPath(e.target.value)}
          className="h-10 w-full max-w-md rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600 cursor-pointer"
        >
          {routes.map((r) => (
            <option key={r.id} value={r.path}>
              {r.label} ({r.path})
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={analyze}
          disabled={scanning}
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-[#0b2a6b] px-4 text-xs font-black text-white hover:bg-[#0d338a] disabled:opacity-60 cursor-pointer"
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Analyze live page
        </button>
      </div>

      {error && <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700"><AlertTriangle className="h-4 w-4" /> {error}</div>}

      {!result && !scanning && !error && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-10 text-center text-xs font-bold text-slate-500">
          Pick a page and press Analyze to read its live copy.
        </div>
      )}

      {result && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-center">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase text-slate-500">
                <Bot className="h-4 w-4" /> AI-written likelihood
              </div>
              <div className={`mt-1 text-5xl font-black ${scoreTone(result.aiScore)}`}>{result.aiScore}%</div>
              <div className="mt-1 text-xs font-bold text-slate-700">{result.verdict}</div>
              <div className="mt-2 text-[10px] font-medium text-slate-400">
                {result.scoreSource === "ai_model" ? "Scored by the configured AI model." : "Measured from robotic-phrase density (no AI key configured or model unavailable)."} {result.wordCount} words analysed.
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-[#0b2a6b]">
                <Info className="h-4 w-4" /> Why it matters
              </div>
              {result.eeatReasons.length === 0 ? (
                <div className="text-xs text-slate-500">No concerns were raised for this page.</div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {result.eeatReasons.map((r, i) => (
                    <span key={i} className="rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1.5 text-[11px] font-medium text-indigo-900">
                      {r}
                    </span>
                  ))}
                </div>
              )}
              {result.humanizationGuide.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-4 text-[11px] text-slate-600">
                  {result.humanizationGuide.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <PageTextBlocks route={result.route} />
          </div>
        </div>
      )}
    </div>
  );
}
