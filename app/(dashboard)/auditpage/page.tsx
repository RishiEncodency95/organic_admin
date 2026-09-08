"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileSearch, Gauge, Globe2, ShieldCheck, TriangleAlert } from "lucide-react";
import SeoPagesTable from "@/components/seo/SeoPagesTable";
import SeoPageDetail from "@/components/seo/SeoPageDetail";
import { seoAuditApi, type SeoOverview } from "@/lib/seoAuditApi";
import { formatDateTime } from "@/components/seo/SeoBadges";

export default function SeoAuditedPagesPage() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [overview, setOverview] = useState<SeoOverview | null>(null);

  useEffect(() => {
    seoAuditApi.overview().then(setOverview).catch(() => undefined);
  }, []);

  const counts = overview?.counts;
  const stats = [
    { label: "Pages crawled", value: counts?.urlsCrawled ?? "—", hint: `${counts?.indexablePages ?? 0} indexable`, icon: Globe2, tone: "text-accent bg-accent-soft" },
    { label: "Average SEO score", value: overview?.scores?.overall ?? "—", hint: "Latest site score", icon: Gauge, tone: "text-status-success-text bg-status-success-bg" },
    { label: "Critical issues", value: counts?.criticalIssues ?? "—", hint: "Needs immediate action", icon: TriangleAlert, tone: "text-status-danger-text bg-status-danger-bg" },
    { label: "Healthy pages", value: counts ? Math.max(0, (counts.urlsCrawled ?? 0) - (counts.pagesWithIssues ?? 0)) : "—", hint: "No open issues", icon: ShieldCheck, tone: "text-status-progress-text bg-status-progress-bg" },
  ];

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-surface-page">
      <div className="mx-auto flex min-h-full w-full max-w-[1800px] flex-col p-3 lg:p-4">
      <div className="relative mb-2.5 shrink-0 overflow-hidden rounded-xl border border-surface-border bg-surface-card px-4 py-3 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/5" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
          <div className="mb-0.5 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white shadow-sm"><FileSearch className="h-4 w-4" /></span>
            <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent">SEO Intelligence</p>
            <h1 className="text-[18px] font-bold leading-5 tracking-[-0.02em] text-text-primary">Audited Pages</h1>
            </div>
          </div>
          <p className="max-w-2xl text-[11px] leading-4 text-text-secondary">
            Inspect every discovered URL with crawler facts, technical issues, Search Console visibility and performance data.
          </p>
          {overview?.crawl?.completedAt && <p className="mt-0.5 text-[9px] font-medium leading-4 text-text-muted">Last completed audit · {formatDateTime(overview.crawl.completedAt)}</p>}
        </div>
        <Link href="/seo" className="flex h-8 items-center gap-1.5 rounded-lg border border-surface-border bg-surface-card px-3 text-[11px] font-semibold text-text-secondary shadow-sm transition hover:border-accent/30 hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> SEO overview
        </Link>
        </div>
      </div>

      <div className="mb-2.5 grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon, tone }) => (
          <div key={label} className="rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p><p className="mt-0.5 text-[21px] font-bold tracking-[-0.03em] text-text-primary">{value}</p><p className="text-[10px] text-text-muted">{hint}</p></div>
              <span className={`grid h-8 w-8 place-items-center rounded-lg ${tone}`}><Icon className="h-4 w-4" /></span>
            </div>
          </div>
        ))}
      </div>

      {notice && <div className="mb-3 shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[11px] font-medium text-emerald-700">{notice}</div>}

      <div className="min-h-[500px] flex-1 rounded-xl border border-surface-border bg-surface-card p-3 shadow-sm">
        <SeoPagesTable
          onSelectPage={setSelectedPageId}
          selectedPageId={selectedPageId}
          onAuditStarted={() => setNotice("SEO audit started — refreshed results will appear when it completes.")}
        />
      </div>

      {selectedPageId && <SeoPageDetail pageId={selectedPageId} onClose={() => setSelectedPageId(null)} />}
      </div>
    </div>
  );
}
