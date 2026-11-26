"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, BadgeCheck, CalendarClock, ExternalLink, FileText, Globe2, Image as ImageIcon, Link2, Maximize2, Smartphone, X } from "lucide-react";
import type { ReportSite } from "@/lib/competitorAnalyzerApi";
import { colorFor } from "./charts";
import { Badge } from "./ui";
import SiteIcon, { useImageAsset } from "./SiteIcon";
import DisplayText from "./DisplayText";

const BRAND_TEXT: Record<string, string> = {
  matched: "Brand matched to this website", possible: "Similar brand found; identity needs review",
  not_found: "No Knowledge Graph entry found", unavailable: "Brand verification unavailable",
};

function Shot({ cacheKey, load, site }: { cacheKey: string; load: (() => Promise<Blob>) | null; site: ReportSite }) {
  const { src, failed, markFailed } = useImageAsset(cacheKey, load);
  const [expanded, setExpanded] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previewTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = previewTrigger.current;
    if (!expanded || !dialog) return;
    dialog.showModal();
    return () => { if (dialog.open) dialog.close(); trigger?.focus({ preventScroll: true }); };
  }, [expanded]);
  // These images are authenticated local blobs; Next Image cannot optimize blob URLs.
  // eslint-disable-next-line @next/next/no-img-element
  const image = (full = false) => src && !failed ? <img src={src} alt={`Saved mobile page preview of ${site.domain}`} onError={markFailed} className={full ? "max-h-[80vh] w-auto max-w-full object-contain" : "h-full w-full object-contain object-top"} /> : null;
  return <>
    <div className="overflow-hidden rounded-xl border border-[#e3e8df] bg-[#f1f4ef]">
      <div className="flex items-center gap-1 border-b border-[#e3e8df] bg-white/80 px-2.5 py-2"><span className="h-1.5 w-1.5 rounded-full bg-[#c6d3c4]" /><span className="h-1.5 w-1.5 rounded-full bg-[#d4ddd0]" /><span className="h-1.5 w-1.5 rounded-full bg-[#e1e7df]" /><span className="normal-case mx-2 min-w-0 flex-1 truncate text-[9px] text-slate-400">{site.domain}</span><a href={site.rootUrl} target="_blank" rel="noreferrer noopener" aria-label={`Visit ${site.domain}`} className="text-slate-400 hover:text-emerald-700"><ExternalLink size={11} /></a></div>
      <div className="relative flex h-44 items-start justify-center overflow-hidden bg-[linear-gradient(135deg,#eef2eb,#fafbf8)] p-2">
        {src && !failed ? <button ref={previewTrigger} type="button" onClick={() => setExpanded(true)} className="h-full max-w-full cursor-zoom-in overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm" aria-label={`Expand preview of ${site.domain}`}>{image()}<span className="absolute bottom-3 right-3 rounded-lg border border-slate-200 bg-white/90 p-1.5 text-slate-500"><Maximize2 size={13} /></span></button>
          : !failed ? <div className="h-full w-24 animate-pulse rounded-md bg-[#e3e9df]" />
            : <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center"><span className="rounded-2xl border border-[#dce5d6] bg-white/80 p-3 text-[#9aaf8c]"><ImageIcon size={24} /></span><p className="text-[11px] font-medium text-[#738168]">No saved page preview</p><p className="max-w-48 text-[10px] leading-relaxed text-slate-400">The website evidence is still available. Open the live site to see its current design.</p><a href={site.rootUrl} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1 text-[10px] font-semibold text-[#5b7b4f]">Visit website <ArrowUpRight size={11} /></a></div>}
      </div>
      {src && !failed && <p className="border-t border-[#e3e8df] bg-white/70 px-2.5 py-1.5 text-[9px] text-slate-400">Saved mobile lab preview · tap to enlarge</p>}
    </div>
    {expanded && src && !failed && <dialog ref={dialogRef} aria-label={`Page preview of ${site.domain}`} onCancel={() => setExpanded(false)} onClose={() => setExpanded(false)} onClick={(e) => { if (e.target === e.currentTarget) setExpanded(false); }} className="fixed inset-0 m-auto max-h-[90vh] max-w-[90vw] overflow-auto rounded-2xl bg-white p-3 shadow-xl backdrop:bg-[#12251c]/80 backdrop:backdrop-blur-sm"><div className="relative flex flex-col items-center"><button type="button" autoFocus onClick={() => setExpanded(false)} aria-label="Close page preview" className="absolute right-1 top-1 rounded-full border border-slate-200 bg-white p-2 text-slate-700"><X size={16} /></button>{image(true)}<span className="normal-case mt-2 text-xs text-slate-600">{site.domain} · saved mobile preview</span></div></dialog>}
  </>;
}

function Fact({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint?: string }) {
  return <div className="rounded-xl border border-[#edf0e9] bg-[#f8faf5] p-2.5" title={hint}><div className="mb-1 flex items-center gap-1 text-[9px] font-medium text-[#8a9682]">{icon}{label}</div><p className="text-[12px] font-semibold leading-relaxed text-[#43553b]">{value}</p></div>;
}

const cleanCta = (text: string) => text.replace(/\s+/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/([a-zA-Z])(\+\d)/g, "$1 $2").replace(/\s*\|\s*/g, " · ").replace(/^(.{3,80})\s+\1$/i, "$1").trim();
export default function WebsiteCards({ sites, screenshot, favicon, runId }: { sites: ReportSite[]; runId: string; screenshot: (domain: string) => (() => Promise<Blob>) | null; favicon?: (domain: string) => (() => Promise<Blob>) | null }) {
  return <div className="grid items-start gap-1 md:grid-cols-2 2xl:grid-cols-3">{sites.map((s) => {
    const u = s.upClose;
    const altPct = u?.images ? Math.round(u.imagesWithAlt / u.images * 100) : null;
    const ctas = [...new Set((u?.ctas ?? []).map(cleanCta))].filter(Boolean).slice(0, 5);
    const socials = [...new Map((s.socials ?? []).map((link) => [link.platform, link])).values()];
    const key = `${runId}:${s.domain}`;
    return <section key={key} data-analyzer-card className="min-w-0 overflow-hidden rounded-2xl border border-[#dfe7dc] bg-white shadow-[0_2px_8px_-5px_rgba(19,54,43,.15)]">
      <div className="h-1" style={{ background: colorFor(sites, s.domain) }} />
      <div className="space-y-1 p-3">
        <div className="flex items-center gap-2.5 p-1 pb-2">
          <SiteIcon large cacheKey={`favicon:${key}`} load={favicon?.(s.domain) ?? null} domain={s.domain} />
          <div className="min-w-0 flex-1"><a href={s.rootUrl} target="_blank" rel="noreferrer noopener" className="block truncate text-[13px] font-semibold text-[#2c4932] hover:underline"><DisplayText text={s.siteName ?? s.domain} /></a><p className="normal-case mt-0.5 truncate text-[10px] text-slate-400">{s.domain}</p><span className={`mt-1 inline-block text-[9px] font-medium ${s.role === "own" ? "text-[#65814e]" : "text-slate-400"}`}>{s.role === "own" ? "Your website" : "Competitor website"}</span></div>
          <div className="rounded-xl border border-[#e0e8d9] bg-[#f1f5eb] px-3 py-2 text-center"><b className="block text-xl font-semibold tracking-tight text-[#557742]">{s.score?.overall ?? "—"}</b><span className="text-[8px] font-medium text-[#8c9b7e]">Score / 100</span></div>
        </div>
        <Shot cacheKey={`shot:${key}`} load={s.hasScreenshot ? screenshot(s.domain) : null} site={s} />
        {s.crawlState !== "ok" ? <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">Website could not be read ({s.crawlState}). {s.crawlError}</p> : <div className="grid grid-cols-2 gap-1 pt-1">
          <Fact icon={<FileText size={12} />} label="Pages sampled" value={<>{u?.pagesRead ?? s.coverage.read} <span className="font-normal text-[#9aa48f]">/ {(u?.words ?? 0).toLocaleString("en-IN")} words</span></>} hint="The sample is bounded; this is not the size of the whole website." />
          <Fact icon={<Smartphone size={12} />} label="Mobile speed · lab" value={<>{s.speed?.mobile?.performance ?? "Not measured"}{s.speed?.mobile?.performance != null && <span className="font-normal text-[#9aa48f]"> / 100</span>}</>} />
          <Fact icon={<CalendarClock size={12} />} label="Sitemap updates" value={s.sitemap?.found ? `${s.sitemap.recent30 ?? "—"} in 30d / ${s.sitemap.recent90 ?? "—"} in 90d` : "No sitemap"} hint="Dates reported by the website's own sitemap, not independently verified publication dates." />
          <Fact icon={<Globe2 size={12} />} label="Sitemap size" value={s.sitemap?.found ? `${s.sitemap.entryCount} URLs` : "Not found"} />
          <Fact icon={<ImageIcon size={12} />} label="Image descriptions" value={altPct !== null ? <>{altPct}% <span className="font-normal text-[#9aa48f]">({u!.imagesWithAlt}/{u!.images})</span></> : "No images observed"} hint="Images with alternative text in the sampled pages." />
          <Fact icon={<CalendarClock size={12} />} label="Latest dated content" value={s.newestContentDate ?? "No date observed"} />
        </div>}
        {u && <details className="rounded-xl border border-[#e8ede3] p-2.5"><summary className="cursor-pointer text-[10px] font-semibold text-[#6a7f59]">Technical checks & structured data</summary><div className="mt-2 flex flex-wrap gap-1"><Badge value={u.https ? "pass" : "fail"} label={u.https ? "HTTPS" : "No HTTPS"} /><Badge value={u.h1Count === 1 ? "pass" : "warn"} label={`H1: ${u.h1Count ?? "—"}`} /><Badge value={u.titleLength && u.titleLength >= 30 && u.titleLength <= 65 ? "pass" : "warn"} label={`Title: ${u.titleLength ?? "—"} chars`} /><Badge value={u.descriptionLength && u.descriptionLength >= 70 && u.descriptionLength <= 170 ? "pass" : "warn"} label={`Description: ${u.descriptionLength ?? "—"} chars`} /><Badge value={u.openGraph ? "pass" : "warn"} label={u.openGraph ? "Share preview ready" : "No share preview"} />{u.schemaTypes.slice(0, 6).map((type) => <Badge key={type} value="present" label={type} />)}</div><p className="mt-2 text-[10px] text-slate-400">Latest sitemap date: {s.sitemap?.latestLastmod ?? "Not provided"}</p></details>}
        <details className="rounded-xl bg-[#f8faf6] px-2.5 py-2"><summary className="flex cursor-pointer items-center gap-1.5 text-[10px] text-slate-400"><BadgeCheck size={13} className={s.brand?.state === "matched" ? "text-emerald-600" : "text-slate-300"} />{s.brand ? BRAND_TEXT[s.brand.state] ?? s.brand.state : "Brand not checked"}</summary>{s.brand?.error && <p className="mt-2 text-[10px] leading-relaxed text-slate-400">{s.brand.error}</p>}</details>
        {!!ctas.length && <div className="rounded-xl border border-[#edf0e9] p-2.5"><p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-[#8c9b80]">Visitor calls to action</p><div className="flex flex-wrap gap-1">{ctas.map((cta) => <span key={cta} className="max-w-full break-words rounded-lg border border-[#e1e8da] bg-[#f7faf3] px-2 py-1 text-[10px] leading-relaxed text-[#718564]">{cta.slice(0, 85)}</span>)}</div></div>}
        {!!socials.length && <div className="flex flex-wrap gap-1 px-1 pt-1">{socials.slice(0, 6).map((link) => <a key={link.platform} href={link.href} target="_blank" rel="noreferrer noopener" className="!capitalize inline-flex items-center gap-1 rounded-lg border border-slate-100 px-2 py-1 text-[10px] text-slate-400 hover:text-emerald-700"><Link2 size={10} />{link.platform}</a>)}</div>}
      </div>
    </section>;
  })}</div>;
}
