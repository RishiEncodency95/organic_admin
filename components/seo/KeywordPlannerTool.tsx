"use client";

import { useState } from "react";
import { KeyRound, Search, Globe, Cpu, TrendingUp, DollarSign, Check, Copy } from "lucide-react";
import { api } from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

interface KeywordItem {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  intent: string;
  competition: string;
}

export default function KeywordPlannerTool() {
  const [seed, setSeed] = useState("");
  const [mode, setMode] = useState<"ai" | "google_ads">("ai");
  const [loading, setLoading] = useState(false);
  const [copiedKw, setCopiedKw] = useState<string | null>(null);
  const [data, setData] = useState<{
    keywords: KeywordItem[];
    primaryRecommendation: string;
    lsiKeywords: string[];
  } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handlePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seed.trim()) return;

    try {
      setLoading(true);
      setNotice(null);
      const res = await api.post<{
        keywords?: KeywordItem[];
        primaryRecommendation?: string;
        lsiKeywords?: string[];
        requiresSetup?: boolean;
        message?: string;
      }>("/seo/keyword-planner", {
        seedKeyword: seed,
        mode,
      });

      if (res && Array.isArray(res.keywords)) {
        setData(res as any);
        setNotice(null);
      } else if (res?.message) {
        setNotice(res.message);
      }
    } catch (err: any) {
      alert(err.message || "Failed to fetch keyword suggestions");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKw(text);
    setTimeout(() => setCopiedKw(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23471d]">
            <KeyRound className="h-4 w-4" /> Search Intent & Volume Matrix
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">
            SEO Keyword Planner & LSI Discovery
          </h2>
          <p className="text-xs font-medium text-slate-500">
            Generate high-intent organic keywords, monthly search estimates, and difficulty scores.
          </p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setMode("ai")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              mode === "ai" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" /> AI Keyword Intelligence
          </button>
          <button
            type="button"
            onClick={() => setMode("google_ads")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer ${
              mode === "google_ads" ? "bg-white text-blue-800 shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Globe className="h-3.5 w-3.5" /> Google Ads Network
          </button>
        </div>
      </div>

      {notice && (
        <div className="mx-5 mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
          {notice}
        </div>
      )}

      {/* Search Input Bar */}
      <div className="p-5 border-b border-slate-200">
        <form onSubmit={handlePlan} className="flex gap-2 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              required
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              placeholder="Enter seed topic (e.g. Organic Millet Exhibition, Ayurveda Exporter)..."
              className="h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-5 bg-[#23471d] text-white text-xs font-extrabold rounded-lg hover:bg-[#1b3716] transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? <Spinner /> : <Search className="h-4 w-4" />}
            {loading ? "Discovering..." : "Generate Keywords"}
          </button>
        </form>
      </div>

      {/* Results View */}
      <div className="p-5">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center">
            <Spinner />
            <p className="mt-3 text-xs font-bold text-slate-500 animate-pulse">
              Analyzing Google Search volume trends & competitor difficulty...
            </p>
          </div>
        ) : !data ? (
          <div className="py-12 text-center text-slate-400">
            <KeyRound className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No Keyword Search Performed</p>
            <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
              Enter any organic farming, exhibitor, or product phrase above to plan your content strategy.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Highlights Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <div>
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800">
                  Recommended Primary Target:
                </span>
                <div className="text-sm font-extrabold text-emerald-950 mt-0.5">
                  {data.primaryRecommendation}
                </div>
              </div>

              {data.lsiKeywords?.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-emerald-900 mr-1">LSI Keywords:</span>
                  {data.lsiKeywords.map((lsi, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white border border-emerald-300 text-[11px] font-semibold text-emerald-800 shadow-2xs"
                    >
                      {lsi}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Keyword Data Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Keyword Variation</th>
                    <th className="py-3 px-4 text-center">Monthly Volume</th>
                    <th className="py-3 px-4 text-center">Keyword Difficulty (KD)</th>
                    <th className="py-3 px-4 text-center">Search Intent</th>
                    <th className="py-3 px-4 text-center">Est. CPC (INR)</th>
                    <th className="py-3 px-4 text-center">Competition</th>
                    <th className="py-3 px-4 text-right">Copy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {data.keywords.map((kw, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{kw.keyword}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                        {kw.searchVolume.toLocaleString()} / mo
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-black text-[11px] ${
                            kw.difficulty < 30
                              ? "bg-emerald-100 text-emerald-800"
                              : kw.difficulty < 60
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {kw.difficulty} / 100
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {kw.intent}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                        ₹{kw.cpc}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-black uppercase ${
                            kw.competition === "LOW"
                              ? "text-emerald-600"
                              : kw.competition === "MEDIUM"
                              ? "text-amber-600"
                              : "text-rose-600"
                          }`}
                        >
                          {kw.competition}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(kw.keyword)}
                          className="h-7 px-2 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer"
                        >
                          {copiedKw === kw.keyword ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          {copiedKw === kw.keyword ? "Copied" : "Copy"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
