"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Zap,
  CheckCircle2,
  Edit3,
  Link2,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { formatDateTime, SeverityBadge } from "../SeoBadges";
import { seoAuditApi, type SeoIssue } from "@/lib/seoAuditApi";
import { errorMessage } from "@/lib/errorMessage";

function SectionCard({
  title,
  icon,
  children,
  note,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-gradient-to-b from-[#182238] to-[#121a2c] p-6 shadow-xl backdrop-blur-md">
      <div className="flex items-center gap-3 mb-3 border-b border-slate-700/50 pb-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/10 text-red-400 border border-red-500/30">
          {icon}
        </div>
        <div>
          <h4 className="text-[15px] font-bold text-white tracking-wide">{title}</h4>
          {note && <p className="text-[11px] text-slate-400 mt-0.5">{note}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function detectIssueType(ruleId: string = "", title: string = ""): "title" | "description" | "canonical" | "og" | "schema" | "robots" | "h1" | "redirect" | "all" {
  const r = (ruleId + " " + title).toLowerCase();
  if (r.includes("404") || r.includes("broken") || r.includes("not_found") || r.includes("status_4xx")) return "redirect";
  if (r.includes("h1") || r.includes("heading")) return "h1";
  if (r.includes("title")) return "title";
  if (r.includes("desc")) return "description";
  if (r.includes("canon")) return "canonical";
  if (r.includes("og") || r.includes("open_graph") || r.includes("social")) return "og";
  if (r.includes("schema") || r.includes("json_ld") || r.includes("structured")) return "schema";
  if (r.includes("robot") || r.includes("noindex")) return "robots";
  return "all";
}

export default function AuditIssuesSection({
  issues,
  pageUrl = "",
  route = "",
  onFixed,
}: {
  issues: SeoIssue[];
  pageUrl?: string;
  route?: string;
  onFixed?: () => void;
}) {
  const [activeIssues, setActiveIssues] = useState<SeoIssue[]>(issues || []);
  const [fixingId, setFixingId] = useState<string | null>(null);
  const [fixedIds, setFixedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // H1 Modal state
  const [h1Modal, setH1Modal] = useState<{ open: boolean; issue: SeoIssue | null; value: string }>({
    open: false,
    issue: null,
    value: "",
  });

  // 301 Redirect Modal state
  const [redirectModal, setRedirectModal] = useState<{
    open: boolean;
    issue: SeoIssue | null;
    fromUrl: string;
    toUrl: string;
  }>({
    open: false,
    issue: null,
    fromUrl: "",
    toUrl: "/",
  });

  // Re-sync the local list whenever the parent passes a new issues array (adjusting state during render).
  const [syncedIssues, setSyncedIssues] = useState(issues);
  if (syncedIssues !== issues) {
    setSyncedIssues(issues);
    setActiveIssues(issues || []);
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAutoFix = async (issue: SeoIssue) => {
    const issueType = detectIssueType(issue.ruleId, issue.title);

    // If it's specifically an H1 or Redirect issue, open the dedicated modal
    if (issueType === "h1") {
      setH1Modal({ open: true, issue, value: "" });
      return;
    }
    if (issueType === "redirect") {
      setRedirectModal({
        open: true,
        issue,
        fromUrl: issue.url || pageUrl || "/",
        toUrl: "/",
      });
      return;
    }

    try {
      setFixingId(issue.id);
      const res = await seoAuditApi.autoFixPage({
        pageUrl: pageUrl || issue.url || "/",
        route: route || "/",
        issueType,
      });

      if (res && res.success) {
        setFixedIds((prev) => new Set(prev).add(issue.id));
        setActiveIssues((prev) => prev.filter((i) => i.id !== issue.id));
        setToast({
          type: "success",
          message: `✓ Auto-healed "${issue.title}". Direct MongoDB update completed.`,
        });
        if (onFixed) onFixed();
      } else {
        throw new Error(res?.message || "Failed to auto-fix issue");
      }
    } catch (err) {
      setToast({
        type: "error",
        message: errorMessage(err) || "Auto-fix failed. Check API connection.",
      });
    } finally {
      setFixingId(null);
    }
  };

  const submitH1Override = async () => {
    if (!h1Modal.value.trim()) return;
    try {
      setFixingId(h1Modal.issue?.id || "h1");
      const res = await seoAuditApi.autoFixPage({
        pageUrl: pageUrl || "/",
        route: route || "/",
        issueType: "h1",
        options: { h1Heading: h1Modal.value.trim() },
      });

      if (res && res.success) {
        if (h1Modal.issue) {
          setFixedIds((prev) => new Set(prev).add(h1Modal.issue!.id));
          setActiveIssues((prev) => prev.filter((i) => i.id !== h1Modal.issue!.id));
        }
        setToast({
          type: "success",
          message: `✓ H1 overridden to "${h1Modal.value.trim()}" and committed to database.`,
        });
        setH1Modal({ open: false, issue: null, value: "" });
        if (onFixed) onFixed();
      }
    } catch (err) {
      setToast({ type: "error", message: errorMessage(err) || "Failed to override H1." });
    } finally {
      setFixingId(null);
    }
  };

  const submitRedirect = async () => {
    if (!redirectModal.fromUrl.trim() || !redirectModal.toUrl.trim()) return;
    try {
      setFixingId(redirectModal.issue?.id || "redirect");
      const res = await seoAuditApi.addRedirect({
        fromUrl: redirectModal.fromUrl.trim(),
        toUrl: redirectModal.toUrl.trim(),
        statusCode: 301,
      });

      if (res && res.success) {
        if (redirectModal.issue) {
          setFixedIds((prev) => new Set(prev).add(redirectModal.issue!.id));
          setActiveIssues((prev) => prev.filter((i) => i.id !== redirectModal.issue!.id));
        }
        setToast({
          type: "success",
          message: `✓ 301 Permanent Redirect created from ${redirectModal.fromUrl} → ${redirectModal.toUrl}`,
        });
        setRedirectModal({ open: false, issue: null, fromUrl: "", toUrl: "/" });
        if (onFixed) onFixed();
      }
    } catch (err) {
      setToast({ type: "error", message: errorMessage(err) || "Failed to create 301 redirect." });
    } finally {
      setFixingId(null);
    }
  };

  return (
    <section id="section-issues" className="scroll-mt-36 space-y-5">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl border text-xs font-bold shadow-lg animate-in fade-in duration-200 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/60 text-emerald-200"
              : "bg-rose-950/90 border-rose-500/60 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white cursor-pointer ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 to-rose-600 text-[11px] font-black text-white shadow-lg shadow-red-500/20">
            13
          </span>
          <h3 className="text-[17px] font-extrabold tracking-wide text-white uppercase">Detected SEO Issues</h3>
        </div>
        <div className="flex items-center gap-2">
          {fixedIds.size > 0 && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> {fixedIds.size} Resolved in this session
            </span>
          )}
          <span className="text-[11px] font-semibold text-red-400 bg-red-950/60 border border-red-800/60 px-3 py-1 rounded-full">
            Rules Engine Audit ({activeIssues.length} Open Issues)
          </span>
        </div>
      </div>

      <SectionCard
        title={`Audit Issues List (${activeIssues.length})`}
        icon={<AlertCircle className="w-5 h-5" />}
        note="Live detected issues from crawl metrics. Click [⚡ Auto Fix with AI] to resolve and commit directly to MongoDB."
      >
        {activeIssues.length === 0 ? (
          <p className="text-[13px] text-emerald-300 font-bold bg-emerald-950/40 p-4 rounded-xl border border-emerald-800/60 flex items-center gap-2">
            <span className="text-emerald-400 font-black">✓</span> All SEO issues on this page have been healed and optimized!
          </p>
        ) : (
          <div className="space-y-3">
            {activeIssues.map((issue) => {
              const issueType = detectIssueType(issue.ruleId, issue.title);
              const isFixing = fixingId === issue.id;

              return (
                <div
                  key={issue.id}
                  className="border border-slate-700/60 bg-[#0f172a]/70 p-4 rounded-xl hover:border-red-500/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
                      <SeverityBadge severity={issue.severity} />
                      <span className="text-[13.5px] font-bold text-white">{issue.title}</span>
                      <span className="rounded-md bg-slate-800 border border-slate-700/60 px-2 py-0.5 font-mono text-[10.5px] font-bold text-slate-300">
                        {issue.ruleId}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-300 leading-relaxed mt-1">{issue.detail}</p>
                    <p className="mt-2 text-[10.5px] font-medium text-slate-400">
                      First detected: {formatDateTime(issue.firstSeenAt)}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    {issueType === "h1" ? (
                      <button
                        type="button"
                        disabled={isFixing}
                        onClick={() => setH1Modal({ open: true, issue, value: "" })}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-black transition cursor-pointer disabled:opacity-50"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Override H1</span>
                      </button>
                    ) : issueType === "redirect" ? (
                      <button
                        type="button"
                        disabled={isFixing}
                        onClick={() =>
                          setRedirectModal({
                            open: true,
                            issue,
                            fromUrl: issue.url || pageUrl || "/",
                            toUrl: "/",
                          })
                        }
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 text-xs font-black transition cursor-pointer disabled:opacity-50"
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>301 Redirect</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isFixing}
                        onClick={() => handleAutoFix(issue)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md shadow-emerald-950/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isFixing ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Healing...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                            <span>Auto Fix with AI</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ✏️ H1 Override Modal */}
      {h1Modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Edit3 className="w-4 h-4 text-amber-400" />
                <span>Override Primary H1 Heading</span>
              </div>
              <button
                type="button"
                onClick={() => setH1Modal({ open: false, issue: null, value: "" })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Specify the authoritative H1 heading to inject into the SEO metadata for{" "}
              <strong className="text-white">{route || pageUrl || "this page"}</strong>:
            </p>

            <input
              type="text"
              autoFocus
              placeholder="e.g. Dignified Funeral & Antim Sanskar Services in Delhi NCR"
              value={h1Modal.value}
              onChange={(e) => setH1Modal((prev) => ({ ...prev, value: e.target.value }))}
              className="w-full h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white outline-none focus:border-emerald-500 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setH1Modal({ open: false, issue: null, value: "" })}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!h1Modal.value.trim() || fixingId === h1Modal.issue?.id}
                onClick={submitH1Override}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {fixingId === h1Modal.issue?.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Save H1 Override</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔗 301 Redirect Modal */}
      {redirectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Link2 className="w-4 h-4 text-indigo-400" />
                <span>Create 301 Permanent Redirect</span>
              </div>
              <button
                type="button"
                onClick={() => setRedirectModal({ open: false, issue: null, fromUrl: "", toUrl: "/" })}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-4">
              Map this 404 or broken URL to an active target route. The redirect will be committed to the database.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Source URL (Broken / 404)</label>
                <input
                  type="text"
                  value={redirectModal.fromUrl}
                  onChange={(e) => setRedirectModal((prev) => ({ ...prev, fromUrl: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Destination Target Route</label>
                <input
                  type="text"
                  value={redirectModal.toUrl}
                  placeholder="e.g. /services/cremation-services-delhi or /"
                  onChange={(e) => setRedirectModal((prev) => ({ ...prev, toUrl: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-slate-700 bg-slate-950 px-3 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRedirectModal({ open: false, issue: null, fromUrl: "", toUrl: "/" })}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!redirectModal.fromUrl.trim() || !redirectModal.toUrl.trim() || fixingId === redirectModal.issue?.id}
                onClick={submitRedirect}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {fixingId === redirectModal.issue?.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Deploy 301 Redirect</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
