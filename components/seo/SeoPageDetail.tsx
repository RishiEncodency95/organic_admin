"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Sparkles,
  X,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { seoAuditApi, type SeoPageDetail as PageDetail, type SeoRecommendationResponse } from "@/lib/seoAuditApi";
import {
  HttpStatusBadge,
  ScorePill,
  SeverityBadge,
  StatusChip,
  formatDateTime,
  formatMs,
  formatNumber,
} from "./SeoBadges";

const SECTIONS = [
  "Overview",
  "Search",
  "Metadata",
  "Keywords",
  "Social SEO",
  "Headings",
  "Links",
  "Images",
  "Schema",
  "Performance",
  "Browser health",
  "Infrastructure",
  "Issues",
  "AI fixes",
  "History",
] as const;

type Section = (typeof SECTIONS)[number];
type LinkFilter = "all" | "internal" | "external" | "nofollow" | "broken" | "redirecting" | "mixed";

function Row({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)] items-start gap-3 border-b border-[#edf0f4] py-2.5 text-[12px] last:border-0">
      <span className="font-medium text-[#71798a]">{label}</span>
      <span className={`min-w-0 break-words font-medium text-[#202b41] ${mono ? "font-mono text-[11px]" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}

function SectionCard({ title, children, note }: { title: string; children: React.ReactNode; note?: string }) {
  return (
    <div className="rounded-xl border border-[#e1e5ec] bg-white p-4 shadow-[0_3px_14px_rgba(25,35,65,0.035)]">
      <h4 className="mb-2 text-[13px] font-bold tracking-[-0.01em] text-[#1c273c]">{title}</h4>
      {note && <p className="mb-3 text-[11px] leading-5 text-[#7d8698]">{note}</p>}
      {children}
    </div>
  );
}

export default function SeoPageDetail({ pageId, onClose }: { pageId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<PageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [section, setSection] = useState<Section>("Overview");
  const [selectedHeadingLevel, setSelectedHeadingLevel] = useState<number | null>(null);
  const [selectedHeadingIndex, setSelectedHeadingIndex] = useState<number | null>(null);
  const [linkFilter, setLinkFilter] = useState<LinkFilter>("all");
  const [aiState, setAiState] = useState<SeoRecommendationResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await seoAuditApi.page(pageId);
      setDetail(response);
      setAiState(response.recommendation ? { status: "ok", message: null, recommendation: response.recommendation } : null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not load this page");
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const generateAi = async (force: boolean) => {
    setAiLoading(true);
    try {
      setAiState(await seoAuditApi.generatePageRecommendation(pageId, force));
    } catch (caught) {
      setAiState({
        status: "error",
        message: caught instanceof Error ? caught.message : "AI request failed",
        recommendation: null,
      });
    } finally {
      setAiLoading(false);
    }
  };

  const page = detail?.page;

  return (
    <div className="fixed inset-0 z-[2147483647] flex justify-end bg-[#111827]/60 p-2 backdrop-blur-[2px] sm:p-3" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="SEO page audit details"
        className="flex h-full w-full max-w-[940px] flex-col overflow-hidden rounded-2xl border border-white/70 bg-[#f6f7fa] shadow-[0_28px_90px_rgba(10,18,38,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e2e5eb] bg-white px-5 py-4">
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              {page && <ScorePill score={page.score} size="lg" />}
              <div className="min-w-0 pt-0.5">
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#8992a4]">Page audit report</p>
                <h3 className="line-clamp-2 text-[16px] font-bold leading-5 tracking-[-0.015em] text-[#18233b]">
                  {page?.title ?? page?.path ?? "Page"}
                </h3>
              </div>
            </div>
            {page && (
              <a
                href={page.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-[11px] font-medium text-[#a06422] hover:text-[#7f4e18]"
              >
                {page.url}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
          <button type="button" aria-label="Close audit details" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#e0e4eb] bg-[#f8f9fb] text-[#667085] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto border-b border-[#e1e5ec] bg-white px-4 py-2.5 [scrollbar-width:thin]">
          {SECTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSection(item)}
              className={`whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-semibold transition-all ${
                section === item
                  ? "bg-[#293681] text-white shadow-[0_4px_10px_rgba(41,54,129,0.18)]"
                  : "bg-[#f5f6f8] text-[#616b7e] hover:bg-[#eceef4] hover:text-[#293681]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-[#f6f7fa] p-4 sm:p-5">
          {loading && (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-status-danger-text/30 bg-status-danger-bg px-3 py-2 text-[12px] text-status-danger-text">
              <AlertTriangle className="h-3.5 w-3.5" />
              {error}
            </div>
          )}

          {detail && page && (
            <div className="flex flex-col gap-3">
              {section === "Overview" && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <SectionCard title="Crawl result">
                      <Row label="HTTP status" value={<HttpStatusBadge status={page.httpStatus} />} />
                      <Row
                        label="Indexable"
                        value={
                          page.indexable ? "Yes" : `No — ${page.indexabilityReason ?? "not indexable"}`
                        }
                      />
                      <Row label="Content type" value={page.contentType} />
                      <Row label="Response time" value={formatMs(page.responseTimeMs)} />
                      <Row label="Crawled at" value={formatDateTime(page.lastCrawledAt)} />
                      <Row label="In sitemap" value={page.inSitemap ? "Yes" : "No"} />
                      {page.redirected && <Row label="Final URL" value={page.finalUrl} mono />}
                      {page.fetchError && <Row label="Fetch error" value={page.fetchError} />}
                    </SectionCard>

                    <SectionCard title="Structure">
                      <Row label="Word count" value={formatNumber(page.wordCount)} />
                      <Row label="Crawl depth" value={page.depth ?? "Not reachable from home"} />
                      <Row
                        label="Internal links in"
                        value={page.isOrphan ? `${page.inLinks} — orphan page` : page.inLinks}
                      />
                      <Row label="Internal links out" value={page.outLinks} />
                      <Row label="Broken links" value={page.brokenLinks} />
                      <Row label="Language" value={page.lang} />
                    </SectionCard>
                  </div>

                  <SectionCard
                    title="Score breakdown"
                    note="Each open issue subtracts a fixed penalty by severity. Categories with no data are not scored."
                  >
                    {page.scoreBreakdown.length === 0 ? (
                      <p className="text-[12px] text-text-secondary">No penalties — this page has no open issues.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {page.scoreBreakdown.map((entry) => (
                          <div
                            key={entry.category}
                            className="flex items-center gap-2 rounded-lg border border-surface-border px-2.5 py-1.5"
                          >
                            <span className="text-[11px] capitalize text-text-secondary">{entry.category}</span>
                            <ScorePill score={entry.score} />
                          </div>
                        ))}
                      </div>
                    )}
                  </SectionCard>
                </>
              )}

              {section === "Search" && (
                <SectionCard
                  title="Google Search Console"
                  note={detail.search.metric}
                >
                  {!detail.search.available || !detail.search.totals ? (
                    <p className="text-[12px] text-text-secondary">No Search Console data yet.</p>
                  ) : (
                    <>
                      <div className="mb-3 grid grid-cols-4 gap-2">
                        {[
                          { label: "Clicks", value: formatNumber(detail.search.totals.clicks) },
                          { label: "Impressions", value: formatNumber(detail.search.totals.impressions) },
                          { label: "CTR", value: `${detail.search.totals.ctr.toFixed(1)}%` },
                          { label: "Avg position", value: detail.search.totals.position.toFixed(1) },
                        ].map((item) => (
                          <div key={item.label} className="rounded-lg bg-surface-sunken px-2.5 py-2">
                            <span className="block text-[10px] uppercase tracking-wide text-text-muted">
                              {item.label}
                            </span>
                            <span className="text-[15px] font-semibold tabular-nums text-text-primary">
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mb-1.5 text-[11px] text-text-muted">
                        {detail.search.rangeStart} to {detail.search.rangeEnd}
                      </p>
                      {detail.search.topQueries.length === 0 ? (
                        <p className="text-[12px] text-text-secondary">No queries recorded for this URL.</p>
                      ) : (
                        <table className="w-full text-[12px]">
                          <thead>
                            <tr className="border-b border-surface-border text-text-secondary">
                              <th className="py-1 text-left font-medium">Query</th>
                              <th className="py-1 text-right font-medium">Clicks</th>
                              <th className="py-1 text-right font-medium">Impr.</th>
                              <th className="py-1 text-right font-medium">Avg pos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {detail.search.topQueries.map((query) => (
                              <tr key={query.query} className="border-b border-surface-border/50">
                                <td className="py-1 pr-2 text-text-primary">{query.query}</td>
                                <td className="py-1 text-right tabular-nums">{query.clicks}</td>
                                <td className="py-1 text-right tabular-nums">{query.impressions}</td>
                                <td className="py-1 text-right tabular-nums">{query.position.toFixed(1)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </>
                  )}
                </SectionCard>
              )}

              {section === "Metadata" && (
                <>
                  <SectionCard title="Title & description">
                    <Row
                      label="Title"
                      value={
                        <span>
                          {page.title ?? "Missing"}{" "}
                          <StatusChip value={page.titleStatus} title={`${page.titleLength} characters`} />
                        </span>
                      }
                    />
                    <Row
                      label="Description"
                      value={
                        <span>
                          {page.metaDescription ?? "Missing"}{" "}
                          <StatusChip
                            value={page.descriptionStatus}
                            title={`${page.metaDescriptionLength} characters`}
                          />
                        </span>
                      }
                    />
                    <Row label="Meta robots" value={page.metaRobots ?? "Not set (defaults to index,follow)"} />
                    <Row label="Viewport" value={page.viewport} />
                  </SectionCard>

                  <SectionCard title="Canonical">
                    <Row label="Declared" value={page.canonical} mono />
                    <Row label="Resolves to" value={page.canonicalNormalized} mono />
                    <Row label="Status" value={<StatusChip value={page.canonicalStatus} />} />
                    <Row label="Tags found" value={page.canonicalCount} />
                  </SectionCard>

                  <SectionCard title="Meta keywords" note="Modern Google Search does not use this tag as a ranking signal. It does not affect the SEO score.">
                    <Row label="Detected" value={page.metaKeywords ? "Yes" : "No"} />
                    <Row label="Value" value={page.metaKeywords ?? "Not present"} />
                    <Row label="Keyword count" value={page.metaKeywords ? page.metaKeywordCount : "Not available"} />
                  </SectionCard>
                </>
              )}

              {section === "Keywords" && (
                <SectionCard title="Keyword usage" note="Counts are measured in crawled page content. Search Console queries and configured targets are never generated by AI.">
                  {!page.keywordAnalysis.available ? (
                    <div className="rounded-lg border border-[#e1e5ec] bg-[#f8fafc] px-3 py-2.5 text-[12px] leading-5 text-text-secondary">
                      <p className="font-semibold text-text-primary">Page audited — no target keyword data available.</p>
                      <p>This section needs a configured keyword for this URL or a matching Search Console query. Technical, content, link and metadata checks still ran normally.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-[11px]">
                        <thead><tr className="border-b border-surface-border text-text-secondary">
                          <th className="py-2 text-left">Keyword</th><th>Source</th><th>Title</th><th>Meta</th><th>H1</th><th>H2/H3</th><th>Opening</th><th className="text-right">Mentions</th><th className="text-right">Density</th>
                        </tr></thead>
                        <tbody>{page.keywordAnalysis.targets.map((target) => (
                          <tr key={`${target.source}-${target.keyword}`} className="border-b border-surface-border/60 last:border-0">
                            <td className="py-2 font-medium text-text-primary">{target.keyword}</td>
                            <td className="px-2 text-center capitalize">{target.source.replaceAll("_", " ")}</td>
                            {[target.presentInTitle, target.presentInMetaDescription, target.presentInH1, target.presentInHeadings, target.presentInOpeningContent].map((present, index) => <td key={index} className="text-center">{present ? "Yes" : "No"}</td>)}
                            <td className="text-right tabular-nums">{target.exactMentions}</td>
                            <td className="text-right tabular-nums">{target.densityPercent.toFixed(2)}%</td>
                          </tr>
                        ))}</tbody>
                      </table>
                    </div>
                  )}
                </SectionCard>
              )}

              {section === "Social SEO" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <SectionCard title="Open Graph" note={`Status: ${page.socialStatus.openGraph.replaceAll("_", " ")}`}>
                    <Row label="og:title" value={page.ogTitle ?? "Not available"} />
                    <Row label="og:description" value={page.ogDescription ?? "Not available"} />
                    <Row label="og:image" value={page.ogImage ?? "Not available"} mono />
                    {page.ogImage && (
                      <a href={page.ogImage} target="_blank" rel="noopener noreferrer" className="mt-3 block overflow-hidden rounded-xl border border-surface-border bg-surface-sunken">
                        <div className="flex aspect-[1.91/1] max-h-52 items-center justify-center overflow-hidden bg-surface-sunken">
                          <img src={page.ogImage} alt="Open Graph share preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-surface-border bg-surface-card px-3 py-2 text-[10px] font-medium text-text-secondary">
                          <span>Open Graph image preview</span><ExternalLink className="h-3 w-3 shrink-0" />
                        </div>
                      </a>
                    )}
                    <Row label="og:url" value={page.ogUrl ?? "Not available"} mono />
                    <Row label="og:type" value={page.ogType ?? "Not available"} />
                  </SectionCard>
                  <SectionCard title="Twitter Card" note="Social preview quality only; missing tags are not treated as critical ranking issues.">
                    <Row label="twitter:card" value={page.twitterCard ?? "Not available"} />
                    <Row label="twitter:title" value={page.twitterTitle ?? "Not available"} />
                    <Row label="twitter:description" value={page.twitterDescription ?? "Not available"} />
                    <Row label="twitter:image" value={page.twitterImage ?? "Not available"} mono />
                    {page.twitterImage && (
                      <a href={page.twitterImage} target="_blank" rel="noopener noreferrer" className="mt-3 block overflow-hidden rounded-xl border border-surface-border bg-surface-sunken">
                        <div className="flex aspect-[1.91/1] max-h-52 items-center justify-center overflow-hidden bg-surface-sunken">
                          <img src={page.twitterImage} alt="Twitter Card share preview" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex items-center justify-between gap-2 border-t border-surface-border bg-surface-card px-3 py-2 text-[10px] font-medium text-text-secondary">
                          <span>Twitter Card image preview</span><ExternalLink className="h-3 w-3 shrink-0" />
                        </div>
                      </a>
                    )}
                  </SectionCard>
                </div>
              )}

              {section === "Headings" && (
                <SectionCard
                  title="Heading structure"
                  note="Hierarchy is checked for missing/multiple H1, skipped levels, empty and duplicated headings."
                >
                  <div className="mb-2 flex flex-wrap gap-2">
                    {Object.entries(page.headingCounts).map(([tag, count]) => {
                      const level = Number(tag.replace(/\D/g, ""));
                      const isSelected = selectedHeadingLevel === level;
                      return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => {
                          setSelectedHeadingLevel(isSelected ? null : level);
                          setSelectedHeadingIndex(null);
                        }}
                        className={`rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors ${
                          isSelected
                            ? "border-[#b77a1f] bg-[#fff2d6] text-[#8a570d] shadow-sm"
                            : "border-transparent bg-surface-sunken text-text-secondary hover:border-[#e4c68f] hover:bg-[#fff8ea]"
                        }`}
                      >
                        {tag.toUpperCase()}: {count}
                      </button>
                    )})}
                    <StatusChip value={page.h1Status} />
                  </div>

                  {page.headingIssues.length > 0 && (
                    <ul className="mb-2 list-inside list-disc text-[12px] text-status-pending-text">
                      {page.headingIssues.map((issue, index) => (
                        <li key={`${issue}-${index}`}>{issue}</li>
                      ))}
                    </ul>
                  )}

                  <div className="max-h-[320px] overflow-y-auto rounded border border-surface-border">
                    {page.headingSequence.length === 0 ? (
                      <p className="p-2 text-[12px] text-text-secondary">No headings found.</p>
                    ) : (
                      page.headingSequence.map((heading, index) => {
                        const isExactSelection = selectedHeadingIndex === index;
                        const isLevelSelection = selectedHeadingIndex === null && selectedHeadingLevel === heading.level;
                        const isHighlighted = isExactSelection || isLevelSelection;
                        return (
                        <div
                          key={`${index}-${heading.text}`}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isExactSelection}
                          onClick={() => {
                            setSelectedHeadingIndex(isExactSelection ? null : index);
                            setSelectedHeadingLevel(isExactSelection ? null : heading.level);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedHeadingIndex(isExactSelection ? null : index);
                              setSelectedHeadingLevel(isExactSelection ? null : heading.level);
                            }
                          }}
                          className={`flex cursor-pointer gap-2 border-b px-2 py-1.5 text-[12px] outline-none transition-colors last:border-0 ${
                            isHighlighted
                              ? "border-[#efd8a9] bg-[#fff4dc] shadow-[inset_3px_0_0_#b77a1f]"
                              : "border-surface-border/50 hover:bg-[#f7f9fc] focus-visible:bg-[#f7f9fc]"
                          }`}
                          style={{ paddingLeft: `${8 + (heading.level - 1) * 14}px` }}
                        >
                          <span className={`shrink-0 rounded px-1 font-mono text-[10px] font-semibold ${isHighlighted ? "bg-[#b77a1f] text-white" : "text-text-muted"}`}>H{heading.level}</span>
                          <span className={heading.text ? "text-text-primary" : "italic text-status-danger-text"}>
                            {heading.text || "(empty heading)"}
                          </span>
                        </div>
                      )})
                    )}
                  </div>
                </SectionCard>
              )}

              {section === "Links" && (
                <>
                  <div className="grid gap-3 lg:grid-cols-[minmax(260px,0.7fr)_minmax(0,1.3fr)]">
                    <SectionCard title="Summary">
                      <Row label="Internal links" value={page.internalLinkCount} />
                      <Row label="External links" value={page.externalLinkCount} />
                      <Row label="Nofollow" value={page.nofollowLinkCount} />
                      <Row label="Broken outgoing" value={detail.links.brokenOutgoing} />
                      <Row label="Redirecting outgoing" value={detail.links.redirectingOutgoing} />
                      <Row label="Mixed content" value={page.mixedContentLinkCount} />
                    </SectionCard>

                    <SectionCard title={`Incoming internal links (${detail.links.incoming.length})`}>
                      <div className="max-h-[220px] overflow-y-auto">
                        {detail.links.incoming.length === 0 ? (
                          <p className="text-[12px] text-status-danger-text">
                            Orphan page — nothing on the site links here.
                          </p>
                        ) : (
                          detail.links.incoming.map((link, index) => (
                            <div key={`${link.source}-${index}`} className="border-b border-surface-border/50 py-1 text-[11px] last:border-0">
                              <span className="block truncate font-mono text-text-primary">{link.source}</span>
                              {link.anchorText && (
                                <span className="text-text-muted">&ldquo;{link.anchorText}&rdquo;</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </SectionCard>
                  </div>

                  <SectionCard title="Outgoing link explorer">
                    {(() => {
                      const outgoing = detail.links.outgoing ?? [];
                      const counts: Record<LinkFilter, number> = {
                        all: outgoing.length,
                        internal: outgoing.filter((link) => link.isInternal).length,
                        external: outgoing.filter((link) => !link.isInternal).length,
                        nofollow: outgoing.filter((link) => link.isNofollow).length,
                        broken: outgoing.filter((link) => link.isBroken).length,
                        redirecting: outgoing.filter((link) => link.redirectHops > 0).length,
                        mixed: outgoing.filter((link) =>
                          page.url.startsWith("https://") && link.normalizedTarget.startsWith("http://")
                        ).length,
                      };
                      const labels: Record<LinkFilter, string> = {
                        all: "All",
                        internal: "Internal",
                        external: "External",
                        nofollow: "Nofollow",
                        broken: "Broken",
                        redirecting: "Redirecting",
                        mixed: "Mixed content",
                      };
                      const visibleLinks = outgoing.filter((link) => {
                        if (linkFilter === "internal") return link.isInternal;
                        if (linkFilter === "external") return !link.isInternal;
                        if (linkFilter === "nofollow") return link.isNofollow;
                        if (linkFilter === "broken") return link.isBroken;
                        if (linkFilter === "redirecting") return link.redirectHops > 0;
                        if (linkFilter === "mixed") return page.url.startsWith("https://") && link.normalizedTarget.startsWith("http://");
                        return true;
                      });
                      return <>
                    <div className="mb-3 flex flex-wrap gap-1.5">
                      {(Object.keys(labels) as LinkFilter[]).map((filter) => (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setLinkFilter(filter)}
                          className={`rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                            linkFilter === filter
                              ? "border-[#b77a1f] bg-[#fff2d6] text-[#8a570d]"
                              : "border-[#e1e5ec] bg-white text-[#667085] hover:bg-[#f7f9fc]"
                          }`}
                        >
                          {labels[filter]} <span className="ml-1 opacity-70">{counts[filter]}</span>
                        </button>
                      ))}
                    </div>
                    <div className="max-h-[320px] overflow-y-auto">
                      {visibleLinks.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-[#dfe3ea] bg-[#fafbfc] px-3 py-8 text-center text-[12px] text-text-muted">
                          No {labels[linkFilter].toLowerCase()} outgoing links found.
                        </div>
                      ) : (
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="border-b border-surface-border text-text-secondary">
                            <th className="py-1 text-left font-medium">Target</th>
                            <th className="py-1 text-left font-medium">Anchor</th>
                            <th className="py-1 text-left font-medium">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {visibleLinks.map((link, index) => (
                            <tr key={`${link.normalizedTarget}-${index}`} className="border-b border-surface-border/40">
                              <td className="max-w-[320px] truncate py-1 pr-2 font-mono" title={link.target}>
                                {link.target}
                              </td>
                              <td className="max-w-[140px] truncate py-1 pr-2 text-text-muted">{link.anchorText}</td>
                              <td className="whitespace-nowrap py-1">
                                <HttpStatusBadge status={link.httpStatus} />
                                {link.redirectHops > 0 && (
                                  <span className="ml-1 text-text-muted">{link.redirectHops} hop</span>
                                )}
                                {link.isNofollow && <span className="ml-1 rounded bg-surface-sunken px-1 py-0.5">nofollow</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      )}
                    </div>
                    </>})()}
                  </SectionCard>

                  {detail.redirectChain && (
                    <SectionCard title="Redirect chain">
                      <div className="flex flex-col gap-1 text-[11px]">
                        {detail.redirectChain.hops.map((hop, index) => (
                          <div key={`${hop.url}-${index}`} className="flex items-center gap-2">
                            <Link2 className="h-3 w-3 text-text-muted" />
                            <span className="truncate font-mono">{hop.url}</span>
                            <HttpStatusBadge status={hop.status} />
                          </div>
                        ))}
                      </div>
                      {detail.redirectChain.issues.length > 0 && (
                        <p className="mt-2 text-[11px] text-status-pending-text">
                          {detail.redirectChain.issues.join("; ")}
                        </p>
                      )}
                    </SectionCard>
                  )}
                </>
              )}

              {section === "Images" && (
                <SectionCard title={`Images (${page.imageCount})`}>
                  <div className="mb-2 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded bg-surface-sunken px-2 py-0.5">Total: {page.imageCount}</span>
                    <span
                      className={`rounded px-2 py-0.5 ${page.imagesMissingAlt > 0 ? "bg-status-danger-bg text-status-danger-text" : "bg-surface-sunken"}`}
                    >
                      Missing alt: {page.imagesMissingAlt}
                    </span>
                    <span className="rounded bg-surface-sunken px-2 py-0.5">Decorative: {page.imagesEmptyAlt}</span>
                    <span className="rounded bg-surface-sunken px-2 py-0.5">Lazy: {page.imagesLazyLoaded}</span>
                    <span
                      className={`rounded px-2 py-0.5 ${page.imagesWithoutDimensions > 0 ? "bg-status-pending-bg text-status-pending-text" : "bg-surface-sunken"}`}
                    >
                      No dimensions: {page.imagesWithoutDimensions}
                    </span>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto">
                    {page.images.map((image, index) => (
                      <div
                        key={`${image.src}-${index}`}
                        className="flex items-start gap-2 border-b border-surface-border/50 py-1.5 text-[11px] last:border-0"
                      >
                        <ImageIcon className="mt-0.5 h-3 w-3 shrink-0 text-text-muted" />
                        <div className="min-w-0 flex-1">
                          <span className="block truncate font-mono text-text-primary" title={image.src}>
                            {image.src}
                          </span>
                          <span className={image.hasAlt ? "text-text-muted" : "text-status-danger-text"}>
                            {image.hasAlt
                              ? `alt: ${image.alt}`
                              : image.isDecorative
                                ? "decorative (empty alt)"
                                : "missing alt"}
                            {image.width && image.height ? ` · ${image.width}×${image.height}` : " · no dimensions"}
                            {image.loading ? ` · ${image.loading}` : ""}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {section === "Schema" && (
                <SectionCard title="Structured data">
                  {page.schemas.length === 0 ? (
                    <p className="text-[12px] text-text-secondary">No JSON-LD structured data found on this page.</p>
                  ) : (
                    page.schemas.map((block, index) => (
                      <div key={index} className="mb-2 rounded border border-surface-border p-2 last:mb-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-[12px] font-medium text-text-primary">
                            {block.types.join(", ") || "Unknown type"}
                          </span>
                          <StatusChip value={block.valid ? "valid" : "invalid"} />
                        </div>
                        {block.errors.map((issue) => (
                          <p key={issue} className="text-[11px] text-status-danger-text">
                            {issue}
                          </p>
                        ))}
                        {block.warnings.map((issue) => (
                          <p key={issue} className="text-[11px] text-text-muted">
                            {issue}
                          </p>
                        ))}
                      </div>
                    ))
                  )}
                  {page.breadcrumbIssues.length > 0 && (
                    <div className="mt-2">
                      <span className="text-[12px] font-medium text-text-primary">Breadcrumb problems</span>
                      {page.breadcrumbIssues.map((issue) => (
                        <p key={issue} className="text-[11px] text-status-danger-text">
                          {issue}
                        </p>
                      ))}
                    </div>
                  )}
                </SectionCard>
              )}

              {section === "Performance" && (
                <>
                  {detail.performance.audits.length === 0 ? (
                    <SectionCard title="Performance">
                      <p className="text-[12px] text-text-secondary">
                        No PageSpeed Insights audit has been run for this URL. Audits run for a configurable set of
                        important pages, not every URL.
                      </p>
                    </SectionCard>
                  ) : (
                    detail.performance.audits.map((audit) => (
                      <SectionCard key={audit.id} title={`Lighthouse — ${audit.strategy}`}>
                        {audit.status === "error" ? (
                          <p className="text-[12px] text-status-danger-text">{audit.error}</p>
                        ) : (
                          <>
                            <div className="mb-3 grid grid-cols-4 gap-2">
                              {[
                                { label: "Performance", value: audit.lab.performance },
                                { label: "Accessibility", value: audit.lab.accessibility },
                                { label: "Best practices", value: audit.lab.bestPractices },
                                { label: "SEO", value: audit.lab.seo },
                              ].map((item) => (
                                <div key={item.label} className="flex flex-col items-center gap-1 rounded-lg bg-surface-sunken py-2">
                                  <ScorePill score={item.value} />
                                  <span className="text-[10px] text-text-muted">{item.label}</span>
                                </div>
                              ))}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div>
                                <h5 className="mb-1 text-[12px] font-semibold text-text-primary">Lab data</h5>
                                <p className="mb-1 text-[10px] text-text-muted">{detail.performance.labNote}</p>
                                <Row label="LCP" value={formatMs(audit.lab.lcpMs)} />
                                <Row label="CLS" value={audit.lab.clsScore?.toFixed(3) ?? "—"} />
                                <Row label="TBT" value={formatMs(audit.lab.tbtMs)} />
                                <Row label="FCP" value={formatMs(audit.lab.fcpMs)} />
                                <Row label="Speed Index" value={formatMs(audit.lab.speedIndexMs)} />
                                <Row label="Server / TTFB" value={formatMs(audit.lab.serverResponseMs)} />
                                <Row label="Transferred" value={audit.lab.totalByteWeight == null ? "Not available" : `${formatNumber(audit.lab.totalByteWeight)} bytes`} />
                                <Row label="Resources" value={audit.lab.resourceCount ?? "Not available"} />
                              </div>
                              <div>
                                <h5 className="mb-1 text-[12px] font-semibold text-text-primary">
                                  Field data (real users)
                                </h5>
                                <p className="mb-1 text-[10px] text-text-muted">{detail.performance.fieldNote}</p>
                                {audit.field.available ? (
                                  <>
                                    <Row label="Source" value={audit.field.source === "url" ? "This URL" : "Origin"} />
                                    <Row label="LCP" value={formatMs(audit.field.lcpMs as number | null)} />
                                    <Row
                                      label="CLS"
                                      value={
                                        audit.field.clsScore == null
                                          ? "—"
                                          : (audit.field.clsScore as number).toFixed(3)
                                      }
                                    />
                                    <Row label="INP" value={formatMs(audit.field.inpMs as number | null)} />
                                    <Row label="FCP" value={formatMs(audit.field.fcpMs as number | null)} />
                                    <Row label="TTFB" value={formatMs(audit.field.ttfbMs as number | null)} />
                                  </>
                                ) : (
                                  <p className="text-[12px] text-text-secondary">
                                    Not available — Google has no Chrome UX Report sample for this URL.
                                  </p>
                                )}
                              </div>
                            </div>

                            {audit.opportunities.length > 0 && (
                              <div className="mt-3">
                                <h5 className="mb-1 text-[12px] font-semibold text-text-primary">Opportunities</h5>
                                {audit.opportunities.map((opportunity) => (
                                  <div key={opportunity.id} className="flex justify-between border-b border-surface-border/50 py-1 text-[11px] last:border-0">
                                    <span className="text-text-primary">{opportunity.title}</span>
                                    <span className="tabular-nums text-text-muted">{formatMs(opportunity.savingsMs)}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="mt-3">
                              <h5 className="mb-1 text-[12px] font-semibold text-text-primary">Render Blocking Resources</h5>
                              {(audit.renderBlockingResources ?? []).length === 0 ? (
                                <p className="text-[11px] text-text-secondary">No render-blocking resources reported by PageSpeed.</p>
                              ) : (audit.renderBlockingResources ?? []).map((resource, index) => (
                                <div key={`${resource.url}-${index}`} className="grid grid-cols-[minmax(0,1fr)_80px_90px] gap-2 border-b border-surface-border/50 py-1.5 text-[11px] last:border-0">
                                  <span className="truncate font-mono" title={resource.url ?? "Not available"}>{resource.url ?? "Not available"}</span>
                                  <span className="capitalize text-text-secondary">{resource.type}</span>
                                  <span className="text-right tabular-nums text-text-muted">{resource.savingsMs == null ? "Not available" : formatMs(resource.savingsMs)}</span>
                                </div>
                              ))}
                            </div>

                            <p className="mt-2 text-[10px] text-text-muted">
                              Measured {formatDateTime(audit.fetchedAt)}
                              {audit.lighthouseVersion ? ` · Lighthouse ${audit.lighthouseVersion}` : ""}
                            </p>
                          </>
                        )}
                      </SectionCard>
                    ))
                  )}
                </>
              )}

              {section === "Browser health" && (
                <div className="flex flex-col gap-3">
                  {!page.renderedWithJs && (
                    <div className="rounded-xl border border-[#ead8b7] bg-[#fff9ed] px-4 py-3 text-[11px] leading-5 text-[#79551a]">
                      Browser telemetry was not measured for this page. Turn on <strong>JS rendering</strong> on the SEO dashboard and run a new audit to capture it.
                    </div>
                  )}
                  {(["jsExceptions", "consoleErrors", "consoleWarnings", "failedRequests"] as const).map((key) => (
                    <SectionCard key={key} title={`${key.replace(/([A-Z])/g, " $1")}${page.renderedWithJs ? ` (${page.browserHealth[key]?.length ?? 0})` : " — not measured"}`} note={page.renderedWithJs ? "Captured during the JavaScript-rendered crawl." : "A zero count is not shown because this page did not receive a browser-rendered audit."}>
                      {(page.browserHealth[key]?.length ?? 0) === 0 ? <p className="text-[11px] text-text-secondary">{page.renderedWithJs ? "No problems measured." : "Not available"}</p> : page.browserHealth[key].map((problem, index) => (
                        <div key={`${problem.type}-${problem.message}-${index}`} className="border-b border-surface-border/60 py-2 text-[11px] last:border-0">
                          <p className="font-medium text-text-primary">{problem.message}</p>
                          {problem.resourceUrl && <p className="mt-0.5 truncate font-mono text-text-muted" title={problem.resourceUrl}>{problem.resourceUrl}</p>}
                          <p className="mt-0.5 text-text-muted">{problem.resourceType ?? problem.type}{problem.statusCode ? ` · HTTP ${problem.statusCode}` : ""}</p>
                        </div>
                      ))}
                    </SectionCard>
                  ))}
                </div>
              )}

              {section === "Infrastructure" && (
                <SectionCard title="CDN & cache detection" note="This is evidence-based infrastructure detection; absence of indicators is not treated as a severe SEO issue.">
                  <Row label="Status" value={page.cdn.status.replaceAll("_", " ")} />
                  <Row label="Provider" value={page.cdn.provider ?? "Not available"} />
                  <Row label="Cache-Control" value={page.cdn.cacheControl ?? "Not available"} mono />
                  <Row label="Server" value={page.cdn.server ?? "Not available"} />
                  <Row label="Evidence" value={page.cdn.evidence.length ? page.cdn.evidence.join(" · ") : "No CDN indicators found"} />
                </SectionCard>
              )}

              {section === "Issues" && (
                <SectionCard title={`Detected issues (${detail.issues.length})`} note="Every issue below was detected by the rules engine from crawled facts.">
                  {detail.issues.length === 0 ? (
                    <p className="text-[12px] text-text-secondary">No open issues on this page.</p>
                  ) : (
                    detail.issues.map((issue) => (
                      <div key={issue.id} className="border-b border-surface-border/60 py-2 last:border-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <SeverityBadge severity={issue.severity} />
                          <span className="text-[12px] font-medium text-text-primary">{issue.title}</span>
                          <span className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                            {issue.ruleId}
                          </span>
                        </div>
                        <p className="text-[11px] text-text-secondary">{issue.detail}</p>
                        <p className="mt-0.5 text-[10px] text-text-muted">
                          First seen {formatDateTime(issue.firstSeenAt)}
                        </p>
                      </div>
                    ))
                  )}
                </SectionCard>
              )}

              {section === "AI fixes" && (
                <SectionCard
                  title="AI recommendations"
                  note="Gemini receives only the measured facts above. It explains and drafts fixes — it never supplies metrics."
                >
                  <div className="mb-3 flex gap-2">
                    <Button size="sm" onClick={() => void generateAi(false)} loading={aiLoading}>
                      <Sparkles className="h-3.5 w-3.5" />
                      Generate
                    </Button>
                    {aiState?.recommendation && (
                      <Button variant="secondary" size="sm" onClick={() => void generateAi(true)} loading={aiLoading}>
                        Regenerate
                      </Button>
                    )}
                  </div>

                  {aiState?.message && (
                    <p className="mb-2 rounded border border-surface-border bg-surface-sunken px-2.5 py-2 text-[12px] text-text-secondary">
                      {aiState.message}
                    </p>
                  )}

                  {aiState?.recommendation?.summary && (
                    <p className="mb-3 text-[12px] text-text-primary">{aiState.recommendation.summary}</p>
                  )}

                  {aiState?.recommendation?.items.map((item, index) => (
                    <div key={index} className="mb-2 rounded border border-surface-border p-2.5 last:mb-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-[12px] font-semibold text-text-primary">{item.title}</span>
                        <span className="rounded bg-surface-sunken px-1.5 py-0.5 text-[10px] uppercase text-text-secondary">
                          {item.priority}
                        </span>
                        {item.ruleId && (
                          <span className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-text-muted">
                            {item.ruleId}
                          </span>
                        )}
                      </div>
                      <p className="mb-1 text-[11px] text-text-secondary">{item.whyItMatters}</p>
                      <p className="mb-1 text-[11px] text-text-primary">{item.recommendedFix}</p>
                      {item.implementation && (
                        <pre className="mb-1 overflow-x-auto whitespace-pre-wrap rounded bg-surface-sunken p-2 text-[10px] text-text-secondary">
                          {item.implementation}
                        </pre>
                      )}
                      {item.suggestedTitle && <Row label="Suggested title" value={item.suggestedTitle} />}
                      {item.suggestedDescription && (
                        <Row label="Suggested description" value={item.suggestedDescription} />
                      )}
                      {item.headingSuggestions.length > 0 && (
                        <Row label="Headings" value={item.headingSuggestions.join(" · ")} />
                      )}
                      {item.internalLinkSuggestions.length > 0 && (
                        <Row
                          label="Internal links"
                          value={item.internalLinkSuggestions
                            .map((link) => `${link.anchorText} → ${link.fromOrTo}`)
                            .join(" · ")}
                        />
                      )}
                    </div>
                  ))}

                  {aiState?.recommendation && (
                    <p className="mt-2 text-[10px] text-text-muted">
                      {aiState.recommendation.model} · generated {formatDateTime(aiState.recommendation.generatedAt)}
                    </p>
                  )}
                </SectionCard>
              )}

              {section === "History" && (
                <SectionCard title="Audit history" note="One row per completed audit that included this URL.">
                  {detail.history.length === 0 ? (
                    <p className="text-[12px] text-text-secondary">No historical snapshots yet.</p>
                  ) : (
                    <table className="w-full text-[11px]">
                      <thead>
                        <tr className="border-b border-surface-border text-text-secondary">
                          <th className="py-1 text-left font-medium">Date</th>
                          <th className="py-1 text-right font-medium">Score</th>
                          <th className="py-1 text-right font-medium">Issues</th>
                          <th className="py-1 text-right font-medium">Words</th>
                          <th className="py-1 text-right font-medium">Clicks</th>
                          <th className="py-1 text-right font-medium">Avg pos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.history.map((entry) => (
                          <tr key={entry.capturedAt} className="border-b border-surface-border/50">
                            <td className="py-1">{formatDateTime(entry.capturedAt)}</td>
                            <td className="py-1 text-right tabular-nums">{entry.score ?? "—"}</td>
                            <td className="py-1 text-right tabular-nums">{entry.issueCounts.total}</td>
                            <td className="py-1 text-right tabular-nums">{entry.wordCount}</td>
                            <td className="py-1 text-right tabular-nums">{entry.clicks ?? "—"}</td>
                            <td className="py-1 text-right tabular-nums">
                              {entry.position ? entry.position.toFixed(1) : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </SectionCard>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
