"use client";

import { useState } from "react";
import { Sparkles, Bot, ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, FileText } from "lucide-react";
import { api } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function AiContentAuditor({ currentRoute }: { currentRoute?: string }) {
  const [content, setContent] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    wordCount: number;
    aiScore: number;
    originalityScore: number;
    isAiDetected: boolean;
    verdict: string;
    flaggedPhrases: string[];
    feedback: string[];
    analyzedAt: string;
  } | null>(null);

  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || content.trim().length < 20) {
      alert("Please enter at least 20 characters of content.");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post<{
        wordCount: number;
        aiScore: number;
        originalityScore: number;
        isAiDetected: boolean;
        verdict: string;
        flaggedPhrases: string[];
        feedback: string[];
        analyzedAt: string;
      }>("/seo/content-audit", {
        text: content,
        targetKeyword: targetKeyword || undefined,
        route: currentRoute || "/",
      });

      if (res) {
        setResult(res);
      }
    } catch (err: any) {
      alert(err.message || "Failed to audit content");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23471d]">
            <Sparkles className="h-4 w-4" /> AI Content Quality & Originality Guard
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
            AI Content Audit & Copy Detector
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Scan your page content against robotic ChatGPT patterns, copy-paste templates, and keyword stuffing.
          </p>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <form onSubmit={handleAudit} className="lg:col-span-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Target SEO Focus Keyword (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Organic Food Exhibition Delhi 2027"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 px-3 text-xs outline-none focus:border-emerald-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Paste Page / Article Content to Audit
            </label>
            <textarea
              rows={8}
              required
              placeholder="Paste your page description, blog article body, or heading content here to scan for AI and copy-paste signals..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-emerald-600 font-mono text-slate-800"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Min. 20 characters recommended</span>
              <span>Words: {content.trim() ? content.trim().split(/\s+/).length : 0}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 rounded-lg bg-[#23471d] text-white text-xs font-extrabold hover:bg-[#1b3716] transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {loading ? "Scanning Content with AI Guard..." : "Run AI Content Audit"}
          </button>
        </form>

        {/* Results Pane */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {!result && !loading && (
            <div className="h-full border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center text-slate-400">
              <Bot className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">No Content Scanned Yet</p>
              <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                Paste your content on the left and click Audit to see AI likelihood %, originality score, and flagged phrases.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50">
              <Spinner />
              <p className="text-xs font-bold text-slate-600 mt-3 animate-pulse">
                Analyzing NLP perplexity, burstiness & duplication...
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4">
              {/* Score Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`p-4 rounded-xl border ${
                    result.isAiDetected
                      ? "bg-rose-50 border-rose-200 text-rose-900"
                      : "bg-emerald-50 border-emerald-200 text-emerald-900"
                  }`}
                >
                  <div className="text-[10px] uppercase font-black tracking-wider">AI Detected Likelihood</div>
                  <div className="text-3xl font-black mt-1">{result.aiScore}%</div>
                  <div className="text-[11px] font-semibold mt-0.5 flex items-center gap-1">
                    {result.isAiDetected ? (
                      <>
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" /> High AI / Template Risk
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Human Authentic Tone
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 text-slate-900">
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-500">
                    Originality Score
                  </div>
                  <div className="text-3xl font-black mt-1 text-indigo-700">{result.originalityScore}%</div>
                  <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                    {result.verdict}
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              {result.feedback?.length > 0 && (
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="text-xs font-black text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-[#23471d]" /> Quality Optimization Tips:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                    {result.feedback.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Flagged Phrases */}
              {result.flaggedPhrases?.length > 0 && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="text-xs font-black text-amber-800 mb-1 flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Flagged Robotic Phrases:
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {result.flaggedPhrases.map((phrase, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-medium"
                      >
                        &quot;{phrase}&quot;
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
