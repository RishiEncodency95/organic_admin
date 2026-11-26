"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, ExternalLink, ChevronDown, ChevronUp, RefreshCw, Wrench } from "lucide-react";
import type { SeoCheckupReportData } from "@/lib/seoCheckupData";
import { findCmsPageByRouteKey, getCmsPageRouteKey, cmsPages } from "@/lib/cmsPages";
import { SITE_ORIGIN } from "@/lib/siteConfig";

interface PriorityIssuesTableProps {
  issues: SeoCheckupReportData["issues"];
  baseUrl?: string;
  /** Opens the admin's "Issues to fix" list on this page and kind of issue */
  onOpenIssues?: (route: string, issueType: string) => void;
  /** "route::issueType" of every issue now in the Issues to fix list: the button is only offered when there is one */
  issueKeys?: string[];
  onReAudit?: () => void;
}

/** Who fixes a check, in plain words */
const WHO: Record<string, { label: string; tone: string; hint: string }> = {
  admin: { label: "Fix from admin", tone: "bg-emerald-50 text-emerald-700 border-emerald-200", hint: "The Issues to fix list can change this" },
  content: { label: "Edit page text", tone: "bg-sky-50 text-sky-700 border-sky-200", hint: "Change the words on the page in Pages & CMS" },
  developer: { label: "Website developer", tone: "bg-violet-50 text-violet-700 border-violet-200", hint: "A change in the website's code or build" },
  server: { label: "Server / Cloudflare", tone: "bg-slate-100 text-slate-700 border-slate-300", hint: "A setting at the host, Cloudflare or DNS" },
};

export function PriorityIssueRow({
  issue,
  baseUrl,
  onOpenIssues,
  issueKeys,
}: {
  issue: SeoCheckupReportData["issues"][number];
  baseUrl?: string;
  onOpenIssues?: (route: string, issueType: string) => void;
  issueKeys?: string[];
}) {
  const inIssuesList = Boolean(issue.adminIssueType && issueKeys?.includes(`${issue.route || "/"}::${issue.adminIssueType}`));
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const rowTone =
    issue.status === "failed"
      ? "bg-rose-50/25 hover:bg-rose-50/60"
      : issue.status === "warning"
      ? "bg-amber-50/25 hover:bg-amber-50/60"
      : "bg-white hover:bg-slate-50";

  return (
    <React.Fragment>
      <tr className={`transition-colors border-b border-slate-100 ${rowTone}`}>
        <td className="px-3.5 py-3">
          <span
            className={`inline-block rounded px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider text-white ${
              issue.priority === "HIGH"
                ? "bg-rose-600"
                : issue.priority === "MEDIUM"
                ? "bg-amber-500"
                : "bg-slate-500"
            }`}
          >
            {issue.priority}
          </span>
        </td>
        <td className="px-3.5 py-3">
          <span
            className={`inline-block rounded border px-2 py-0.5 text-[9.5px] font-extrabold tracking-wider ${
              issue.status === "failed"
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-amber-300 bg-amber-50 text-amber-700"
            }`}
          >
            {issue.status === "failed" ? "FAIL" : "WARNING"}
          </span>
        </td>
        <td className="px-3.5 py-3 font-semibold text-slate-700">
          {issue.group ?? "General"}
        </td>
        <td className="px-3.5 py-3">
          <p className="font-bold text-slate-900 leading-snug">{issue.title}</p>
          {issue.fixKind && (
            <span title={WHO[issue.fixKind]?.hint} className={`mt-1 inline-block rounded-full border px-2 py-px text-[10px] font-normal ${WHO[issue.fixKind]?.tone}`}>
              {WHO[issue.fixKind]?.label}
            </span>
          )}
        </td>
        <td className="px-3.5 py-3 font-mono text-[11px] font-bold text-slate-600">
          {issue.route ?? "/"}
        </td>
        <td className="px-3.5 py-3 text-right whitespace-nowrap">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={() => setIsOpen((val) => !val)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 hover:text-[#0b2a6b] cursor-pointer shrink-0 transition"
            >
              {isOpen ? (
                <>
                  <ChevronUp className="h-3 w-3" /> Hide
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" /> Details
                </>
              )}
            </button>

            {issue.fixedAfterAudit ? (
              <span
                title={`Fixed ${new Date(issue.fixedAfterAudit.at).toLocaleString("en-IN")}${issue.fixedAfterAudit.by ? ` by ${issue.fixedAfterAudit.by}` : ""}. The next audit confirms it.`}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-normal text-emerald-700"
              >
                <CheckCircle2 className="h-3 w-3" /> Fixed · re-audit to confirm
              </span>
            ) : issue.fixKind === "admin" && onOpenIssues && inIssuesList ? (
              <button
                type="button"
                onClick={() => onOpenIssues(issue.route || "/", issue.adminIssueType || "all")}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-normal text-white shadow-2xs transition hover:bg-emerald-500"
                title="Open this page's issues in the Issues to fix list"
              >
                <Wrench className="h-3 w-3" /> Fix in Issues list
              </button>
            ) : issue.fixKind === "content" ? (
              <button
                type="button"
                onClick={() => {
                  const route = issue.route || "/";
                  const page = findCmsPageByRouteKey(cmsPages, route);
                  const routeKey = page ? getCmsPageRouteKey(page) : route === "/" ? "home" : route.replace(/^\//, "");
                  router.push(`/pages/${routeKey}/edit`);
                }}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg bg-[#0b2a6b] px-2.5 py-1 text-[11px] font-normal text-white shadow-2xs transition hover:bg-[#081e4d]"
                title="Open this page in Pages & CMS"
              >
                <ExternalLink className="h-3 w-3" /> Edit page
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-normal text-slate-600 transition hover:bg-slate-100"
                title="See who fixes this and how"
              >
                How to fix
              </button>
            )}
          </div>
        </td>
      </tr>

      {isOpen && (
        <tr className="bg-slate-50/90">
          <td colSpan={6} className="px-5 py-4 border-b border-slate-200">
            <div className="space-y-3 text-xs">
              {issue.detail && (
                <div>
                  <strong className="text-slate-900 block mb-0.5">Details:</strong>
                  <p className="text-slate-700 leading-relaxed">{issue.detail}</p>
                </div>
              )}

              {issue.evidence && issue.evidence.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    {issue.evidence.length} Affected Asset{issue.evidence.length === 1 ? "" : "s"}
                  </p>
                  <ul className="max-h-60 space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin]">
                    {issue.evidence.map((item, i) => {
                      const isImage =
                        typeof item === "string" &&
                        (item.match(/\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i) ||
                          item.includes("res.cloudinary.com") ||
                          item.includes("/_next/image"));
                      if (isImage) {
                        let srcUrl = item;
                        if (item.startsWith("/")) {
                          const defaultBase =
                            typeof window !== "undefined" && window.location.hostname !== "localhost"
                              ? SITE_ORIGIN
                              : "http://localhost:3000";
                          const base = baseUrl?.startsWith("http") ? baseUrl : defaultBase;
                          try {
                            srcUrl = new URL(item, base).toString();
                          } catch {}
                        }
                        let sectionHint = "Unknown Section";
                        try {
                          sectionHint = decodeURIComponent(item).split("/").pop()?.split(".")[0] || "Unknown Section";
                        } catch {}
                        return (
                          <li
                            key={i}
                            className="flex flex-col gap-1.5 break-all font-mono text-[10.5px] text-slate-700 rounded-lg border border-slate-200 bg-slate-50/60 p-2.5"
                          >
                            <span className="font-bold text-[#0b2a6b]">Asset Section: {sectionHint}</span>
                            <span>{item}</span>
                            <div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white flex items-center justify-center p-1">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={srcUrl} alt="" className="max-h-full max-w-full object-contain" loading="lazy" />
                            </div>
                          </li>
                        );
                      }
                      return (
                        <li key={i} className="break-all font-mono text-[11px] text-slate-700">
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {issue.fix && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3">
                  <strong className="block text-[10.5px] font-bold uppercase tracking-wider text-blue-800">
                    How to Fix
                  </strong>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-800">{issue.fix}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

export default function PriorityIssuesTable({
  issues,
  baseUrl,
  onOpenIssues,
  issueKeys,
  onReAudit,
}: PriorityIssuesTableProps) {
  // every issue of the audit is listed: the tab count, this count and the audit all say the same number
  const displayableIssues = issues;
  const fixedCount = issues.filter((i) => i.fixedAfterAudit).length;

  return (
    <div id="report-issues" className="report-section space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs scroll-mt-32">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
          <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
          Priority Issues Action Table
        </h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs font-semibold text-slate-600">
          {displayableIssues.length} Issues Flagged
        </span>
      </div>

      {fixedCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[12px] text-emerald-900">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {fixedCount} issue{fixedCount === 1 ? " was" : "s were"} fixed from the admin after this audit ran. This report shows the audit as it was; the next audit confirms them.
          </span>
          {onReAudit && (
            <button type="button" onClick={onReAudit} className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] text-emerald-800 transition hover:bg-emerald-100">
              <RefreshCw className="h-3 w-3" /> Re-audit now
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-3.5 py-3">Priority</th>
              <th className="px-3.5 py-3">Status</th>
              <th className="px-3.5 py-3">Category</th>
              <th className="px-3.5 py-3">Issue Title & Details</th>
              <th className="px-3.5 py-3">Route</th>
              <th className="px-3.5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {displayableIssues.length > 0 ? (
              displayableIssues.map((issue, index) => (
                <PriorityIssueRow key={index} issue={issue} baseUrl={baseUrl} onOpenIssues={onOpenIssues} issueKeys={issueKeys} />
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500 font-semibold">
                  No high-priority content or SEO issues found on this route.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

