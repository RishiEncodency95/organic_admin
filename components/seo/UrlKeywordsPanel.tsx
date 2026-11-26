"use client";

import { useState } from "react";
import { Check, Copy, Info, Link2, Loader2, Search } from "lucide-react";
import { seoAuditApi, type UrlKeywordsData } from "@/lib/seoAuditApi";
import { SITE_ORIGIN } from "@/lib/siteConfig";
import { errorMessage } from "@/lib/errorMessage";

/** Keywords of any page address: AI Strategy, Recommended Primary Target, LSI, and 20+ Variations Table */
export default function UrlKeywordsPanel() {
  const [url, setUrl] = useState(SITE_ORIGIN + "/");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UrlKeywordsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const run = async (e: React.FormEvent | null, refresh = false) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      setData(await seoAuditApi.keywordsFromUrl(url.trim(), refresh));
    } catch (err) {
      setData(null);
      setError(errorMessage(err) || "The page could not be read.");
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="space-y-3 p-4">
      <form onSubmit={(e) => void run(e)} className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[280px] max-w-2xl flex-1">
          <Link2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://mokshavoyage.in/services/pind-daan"
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-[0.8125rem] text-slate-800 outline-none focus:border-indigo-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-4 text-[0.8125rem] text-white transition hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {loading ? "Reading and analysing the page…" : "Get keywords"}
        </button>
      </form>
      <p className="text-[0.75rem] text-slate-500">Paste the address of any page (yours or a competitor&apos;s). The page is opened, its real words are counted, and the AI analyses what the page is about. The analysis is saved, so the same page is not analysed twice.</p>

      {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[0.75rem] text-rose-800">{error}</div>}

      {data && (
        <>
          <div className="grid gap-2.5 md:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5">
              <div className="text-[0.6875rem] uppercase tracking-wide text-slate-500">Page</div>
              <div className="truncate text-[0.8125rem] text-slate-800 [font-weight:500]" title={data.title}>{data.title || "(no title)"}</div>
              <div className="truncate font-mono text-[0.6875rem] text-slate-500">{data.url}</div>
              <div className="mt-1 line-clamp-2 text-[0.75rem] text-slate-600">{data.metaDescription || "No meta description."}</div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2.5">
                <div className="text-[1.25rem] leading-none text-violet-800 [font-weight:500]">{data.wordCount.toLocaleString()}</div>
                <div className="mt-1 text-[0.75rem] text-slate-600">Words on the page</div>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                <div className="text-[1.25rem] leading-none text-emerald-800 [font-weight:500]">{(data.keywordVariations && data.keywordVariations.length) || data.keywords.length}</div>
                <div className="mt-1 text-[0.75rem] text-slate-600">{data.keywordVariations && data.keywordVariations.length ? "Keywords analysed" : "Words measured"}</div>
              </div>
            </div>
          </div>

          <div className={`flex flex-wrap items-start gap-2 rounded-lg border px-3 py-2 text-[0.75rem] ${data.ai?.available ? "border-indigo-200 bg-indigo-50 text-indigo-950" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
            <Info className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${data.ai?.available ? "text-indigo-600" : "text-amber-600"}`} />
            <span className="min-w-0 flex-1">
              {data.searchVolume.note}
              {data.ai?.available && data.ai.analysedAt && (
                <span className="block text-[0.6875rem] opacity-80">
                  AI analysis of {new Date(data.ai.analysedAt).toLocaleString("en-IN")}{data.ai.cached ? " (saved result; the page has not changed)" : " (just made)"}.
                  {data.ai.message ? ` ${data.ai.message}` : ""}
                </span>
              )}
            </span>
            <button type="button" disabled={loading} onClick={() => void run(null, true)} className="inline-flex h-6 shrink-0 cursor-pointer items-center rounded-md border border-current/30 bg-white px-2 text-[0.6875rem] hover:bg-slate-50 disabled:opacity-60">
              Analyse again
            </button>
          </div>

          {/* AI Recommended Primary Target */}
          {data.primaryRecommendation && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 shadow-2xs">
              <span className="text-[11px] font-black uppercase text-indigo-900 tracking-wider">Recommended Primary Target:</span>
              <span className="rounded-lg bg-indigo-600 px-3 py-1 font-mono text-xs font-extrabold text-white shadow-2xs">
                {data.primaryRecommendation}
              </span>
              <button
                type="button"
                onClick={() => copy(data.primaryRecommendation!)}
                className="ml-auto inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 shadow-2xs cursor-pointer border border-indigo-200"
              >
                {copied === data.primaryRecommendation ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied === data.primaryRecommendation ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          {/* LSI Keywords */}
          {data.lsiKeywords && data.lsiKeywords.length > 0 && (
            <div className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">LSI Keywords:</span>
              <div className="flex flex-wrap gap-1.5">
                {data.lsiKeywords.map((lsi) => (
                  <button
                    key={lsi}
                    type="button"
                    onClick={() => copy(lsi)}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition cursor-pointer"
                    title="Click to copy"
                  >
                    {lsi}
                    {copied === lsi ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-2.5 w-2.5 text-slate-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 20+ Keyword Variations Table */}
          {data.keywordVariations && data.keywordVariations.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Keyword Variations & Market Metrics ({data.keywordVariations.length} items)
                </h3>
                <button
                  type="button"
                  onClick={() => copy(data.keywordVariations!.map((k) => k.keyword).join("\n"))}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy all variations
                </button>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Keyword Variation</th>
                      <th className="py-2.5 px-3 text-center">Monthly Volume <span className="font-normal normal-case text-slate-400">(AI est.)</span></th>
                      <th className="py-2.5 px-3 text-center">Keyword Difficulty (KD) <span className="font-normal normal-case text-slate-400">(AI est.)</span></th>
                      <th className="py-2.5 px-3 text-center">Search Intent</th>
                      <th className="py-2.5 px-3 text-center">Est. CPC (INR)</th>
                      <th className="py-2.5 px-3 text-center">On the page <span className="font-normal normal-case text-slate-400">(measured)</span></th>
                      <th className="py-2.5 px-3 text-center">Competition</th>
                      <th className="py-2.5 px-3 text-right">Copy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {data.keywordVariations.map((kw, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{kw.keyword}</td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                          {kw.searchVolume.toLocaleString()} / mo
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full font-black text-[10px] ${
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
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {kw.intent}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">
                          ₹{kw.cpc}
                        </td>
                        <td className="py-2.5 px-3 text-center text-[11px]">
                          {kw.usedOnPage > 0 ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800">{kw.usedOnPage}× written</span>
                          ) : kw.onPage ? (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">words only</span>
                          ) : (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">not on the page</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-center">
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
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => copy(kw.keyword)}
                            className="h-6 px-2 inline-flex items-center gap-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] cursor-pointer"
                          >
                            {copied === kw.keyword ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                            {copied === kw.keyword ? "Copied" : "Copy"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Measured from the page: the words and phrases it really uses */}
          {data.keywords.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Measured from the page: words and phrases it really uses ({Math.min(15, data.keywords.length)} of {data.keywords.length})</h3>
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full min-w-[640px] text-left text-[0.75rem] text-slate-600">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[0.6875rem] uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2 font-normal">Phrase</th>
                      <th className="px-3 py-2 text-center font-normal">Used</th>
                      <th className="px-3 py-2 text-center font-normal">Share</th>
                      <th className="px-3 py-2 text-center font-normal">Title</th>
                      <th className="px-3 py-2 text-center font-normal">Description</th>
                      <th className="px-3 py-2 text-center font-normal">H1</th>
                      <th className="px-3 py-2 text-center font-normal">H2/H3</th>
                      <th className="px-3 py-2 text-center font-normal">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.keywords.slice(0, 15).map((k) => (
                      <tr key={k.keyword}>
                        <td className="px-3 py-1.5 text-slate-800">{k.keyword}</td>
                        <td className="px-3 py-1.5 text-center tabular-nums">{k.count}×</td>
                        <td className="px-3 py-1.5 text-center tabular-nums">{k.density}%</td>
                        {[k.inTitle, k.inDescription, k.inH1, k.inH2, k.inUrl].map((on, i) => (
                          <td key={i} className="px-3 py-1.5 text-center">{on ? <Check className="mx-auto h-3.5 w-3.5 text-emerald-600" /> : <span className="text-slate-300">–</span>}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
