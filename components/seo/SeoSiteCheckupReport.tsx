"use client";

import React from "react";
import SeoCheckupFullReport from "./SeoCheckupFullReport";
import type { PageSpeedSnapshot, ReportMetaOverride } from "@/lib/seoCheckupData";

export interface SeoCheckupReportProps {
  pageId: string;
  url?: string;
  meta?: ReportMetaOverride;
  pagespeed?: PageSpeedSnapshot | null;
  onClose?: () => void;
  onReAudit?: () => void;
  onExportPdf?: () => void;
  onExportCsv?: () => void;
}

/**
 * Thin wrapper kept for existing call sites (page drawer + audited pages route picker).
 * Renders the complete SEO Site Checkup audit report for a single route.
 */
export function SeoSiteCheckupReport({
  pageId,
  url,
  meta,
  pagespeed,
  onClose,
  onReAudit,
  onExportPdf,
  onExportCsv,
}: SeoCheckupReportProps) {
  const route = !pageId || pageId === "home" || pageId === "index" ? "home" : pageId;

  return (
    <SeoCheckupFullReport
      scope="page"
      route={route}
      url={url}
      meta={meta}
      pagespeed={pagespeed}
      onClose={onClose}
      onReAudit={onReAudit}
      onExportPdf={onExportPdf}
      onExportCsv={onExportCsv}
    />
  );
}

export default SeoSiteCheckupReport;
