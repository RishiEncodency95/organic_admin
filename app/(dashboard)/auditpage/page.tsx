"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileSearch, Gauge, Globe2, ShieldCheck, TriangleAlert } from "lucide-react";
import { seoAuditApi, type SeoOverview } from "@/lib/seoAuditApi";

export default function SeoAuditedPagesPage() {
  const [overview, setOverview] = useState<SeoOverview | null>(null);

  useEffect(() => {
    seoAuditApi.overview().then(setOverview).catch(() => undefined);
  }, []);

  const counts = overview?.counts;
  const stats = [
    { label: "Pages crawled", value: counts?.urlsCrawled ?? 28, hint: `${counts?.indexablePages ?? 26} indexable`, icon: Globe2, tone: "text-accent bg-accent-soft" },
    { label: "Average SEO score", value: overview?.scores?.overall ?? 94, hint: "Latest site score", icon: Gauge, tone: "text-status-success-text bg-status-success-bg" },
    { label: "Critical issues", value: counts?.criticalIssues ?? 0, hint: "Needs immediate action", icon: TriangleAlert, tone: "text-status-danger-text bg-status-danger-bg" },
    { label: "Healthy pages", value: counts ? Math.max(0, (counts.urlsCrawled ?? 28) - (counts.pagesWithIssues ?? 4)) : 24, hint: "No open issues", icon: ShieldCheck, tone: "text-status-progress-text bg-status-progress-bg" },
  ];

  return (
    <div className="h-full min-h-0 overflow-y-auto bg-white p-3 lg:p-4 space-y-4">
      {/* Header matching Bharat Organic SEO Intelligence */}
      <div className="flex shrink-0 items-center justify-between border-b-[2px] border-[#23471d] pb-[10px]">
        <div>
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#16a34a]">
            <FileSearch className="h-3.5 w-3.5" /> Bharat Organic SEO Intelligence
          </div>
          <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em]" style={{ color: "#23471d" }}>
            Audited Pages Inventory
          </h1>
          <p className="mt-0.5 text-[10px] font-medium text-[#6c7587]">
            Inspect discovered Bharat Organic Expo URLs with technical facts, Core Web Vitals, and crawler findings.
          </p>
        </div>
        <Link
          href="/seo"
          className="inline-flex h-[32px] items-center gap-1.5 rounded-[5px] border border-[#d1d5db] bg-white px-3 text-[11px] font-semibold text-[#374151] hover:bg-[#f9fafb] shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5 text-[#16a34a]" /> Command Center
        </Link>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(({ label, value, hint, icon: Icon }) => (
          <div
            key={label}
            className="relative flex flex-col justify-center overflow-hidden rounded-[8px] p-3.5"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #ffffff 55%, #f0fdf4 100%)",
              boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#166534]">{label}</p>
                <p className="mt-1 text-[22px] font-extrabold tracking-[-0.03em] text-[#166534]">{value}</p>
                <p className="text-[10px] font-medium text-[#16a34a]">{hint}</p>
              </div>
              <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[#dcfce7] text-[#166534]">
                <Icon className="h-4 w-4" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
