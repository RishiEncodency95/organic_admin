"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, X } from "lucide-react";
import { seoAuditApi, type SeoOverview, type PageSpeedAudit, type FixLogEntry } from "@/lib/seoAuditApi";
import type { SeoCheckupReportData } from "@/lib/seoCheckupData";
import { getSavedPageSpeed, savePageSpeed, getSavedPageSpeedMap } from "@/lib/pageSpeedBatch";
import { SITE_ORIGIN, SITE_NAME } from "@/lib/siteConfig";
import AuditHeader from "@/components/seo/AuditHeader";
import AuditNav from "@/components/seo/AuditNav";
import AutoFixMasterBar from "@/components/seo/AutoFixMasterBar";
import ActiveIssuesList from "@/components/seo/ActiveIssuesList";
import ResolvedIssuesHistory from "@/components/seo/ResolvedIssuesHistory";
import AiContentInspectorTab from "@/components/seo/AiContentInspectorTab";
import AiImageInspectorTab from "@/components/seo/AiImageInspectorTab";
import InternalLinksTab from "@/components/seo/InternalLinksTab";
import HeadingsAuditTab from "@/components/seo/HeadingsAuditTab";
import SocialTagsTab from "@/components/seo/SocialTagsTab";
import AiPictureCheckTab from "@/components/seo/AiPictureCheckTab";
import NotFoundLogTab from "@/components/seo/NotFoundLogTab";
import OutreachTab from "@/components/seo/OutreachTab";
import { useSeoAuditRun } from "@/lib/useSeoAuditRun";
import { useSeoPending } from "@/lib/useSeoPending";
import SeoSiteCheckupReport from "@/components/seo/SeoSiteCheckupReport";
import BacklinkManager from "@/components/seo/BacklinkManager";
import AiContentAuditor from "@/components/seo/AiContentAuditor";
import KeywordPlannerTool from "@/components/seo/KeywordPlannerTool";
import SeoActivityLogWidget from "@/components/seo/SeoActivityLogWidget";
import SemrushComparePanel from "@/components/seo/semrush/SemrushComparePanel";
import AuditTasksPanel from "@/components/seo/semrush/AuditTasksPanel";
import { useSemrushReport } from "@/lib/useSemrushReport";
import { useAuditTasks } from "@/lib/useAuditTasks";
import { errorMessage } from "@/lib/errorMessage";
import AutoFixConfirmModal from "@/components/seo/modals/AutoFixConfirmModal";
import AutoFixResultModal from "@/components/seo/modals/AutoFixResultModal";
import AuditScheduleModal, { fromLocalInput, toLocalInput, type AuditScheduleState } from "@/components/seo/modals/AuditScheduleModal";
import AutoPilotApprovalModal from "@/components/seo/modals/AutoPilotApprovalModal";
import AuditRouteSelector, { type RouteOption } from "@/components/seo/audit/AuditRouteSelector";

const HOME_OPTION: RouteOption = { id: "home", label: "Home Page", path: "/" };

const routeUrl = (p: RouteOption) =>
  p.id === "home" ? SITE_ORIGIN : `${SITE_ORIGIN}${p.path.startsWith("/") ? "" : "/"}${p.path}`;

/** "audit" is the three main views; every other id is a tool opened from the navigation (components/seo/AuditNav) */
type SeoTabId = "audit" | "headings" | "social" | "ai_pictures" | "backlinks" | "ai_content" | "keyword_planner" | "activity_log" | "semrush" | "tasks" | "ai_inspector" | "image_inspector" | "internal_links" | "not_found" | "outreach";

export default function SeoAuditedPagesPage() {
  const [activeTab, setActiveTab] = useState<SeoTabId>("audit");
  const [auditSubSection, setAuditSubSection] = useState<"matrix" | "issues" | "history">("issues");
  const [imageInspectorTarget, setImageInspectorTarget] = useState<string>("/");
  // the Page report can send the admin to one page / kind of issue of the Issues to fix list
  const [issuesFocus, setIssuesFocus] = useState<{ route: string; type: string; key: number } | null>(null);
  const semrush = useSemrushReport();
  const auditTasks = useAuditTasks();
  const [, setOverview] = useState<SeoOverview | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([HOME_OPTION]);
  const [, setRoutesError] = useState<string | null>(null);
  const [selectedPageId, setSelectedPageId] = useState<string>("home");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [speed, setSpeed] = useState<{ pageId: string; strategy: "mobile" | "desktop"; data: PageSpeedAudit | null } | null>(null);
  const [auditVersion, setAuditVersion] = useState(0);
  const [auditReport, setAuditReport] = useState<SeoCheckupReportData | null>(null);
  const [auditSettledKey, setAuditSettledKey] = useState<string | null>(null);
  const auditKey = `${selectedPageId}#${auditVersion}`;
  const auditLoading = auditSettledKey !== auditKey;
  const [reAuditing, setReAuditing] = useState(false);
  const [liveFetching, setLiveFetching] = useState(false);
  const prefetchStarted = useRef(false);

  // Modals & Export States
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const [scheduleState, setScheduleState] = useState<AuditScheduleState>({
    frequency: "weekly",
    intervalDays: 7,
    autoPilotEnabled: false,
    webhookUrl: "",
    usingRedis: false,
    redisConnected: false,
    lastRunAt: "",
    nextRunAt: "",
    runAt: "",
    approvalsWaiting: 0,
  });
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [scheduleLoaded, setScheduleLoaded] = useState(false);
  const [scheduleLoadError, setScheduleLoadError] = useState<string | null>(null);
  const [autoFixConfirmOpen, setAutoFixConfirmOpen] = useState(false);
  const [autoFixModal, setAutoFixModal] = useState<{
    open: boolean;
    totalPages: number;
    fixedCount: number;
    failedCount: number;
    logs: FixLogEntry[];
  } | null>(null);

  const pending = useSeoPending();
  const [historyKey, setHistoryKey] = useState(0);
  const [scheduleVersion, setScheduleVersion] = useState(0);

  const refreshAfterChange = () => {
    void pending.reload();
    setHistoryKey((k) => k + 1);
    setAuditVersion((v) => v + 1);
  };

  const run = useSeoAuditRun((kind, result) => {
    refreshAfterChange();
    if (kind === "autofix_all" && result) {
      setAutoFixModal({
        open: true,
        totalPages: Number(result.totalPages) || 0,
        fixedCount: Number(result.fixedCount) || 0,
        failedCount: Number(result.failedCount) || 0,
        logs: (Array.isArray(result.fixes) ? result.fixes : []) as unknown as FixLogEntry[],
      });
    }
    if (kind === "audit") {
      seoAuditApi.overview().then(setOverview).catch(() => undefined);
      seoAuditApi.auditRoutes().then((list) => list.length > 0 && setRoutes(list)).catch(() => undefined);
    }
  });

  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const executeAutoFixAll = () => {
    setAutoFixConfirmOpen(false);
    void run.runAutoFix();
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloadingExcel(true);
      await seoAuditApi.downloadExcelReport();
    } catch (err) {
      setNotice({ tone: "error", text: errorMessage(err) || "Failed to download the Excel report." });
    } finally {
      setDownloadingExcel(false);
    }
  };

  const openScheduleModal = async () => {
    setScheduleModalOpen(true);
    setScheduleLoaded(false);
    setScheduleLoadError(null);
    try {
      const res = await seoAuditApi.getAuditSchedule();
      if (res && res.data) {
        setScheduleState({
          frequency: res.data.schedule?.frequency || "weekly",
          intervalDays: res.data.schedule?.intervalDays || 7,
          autoPilotEnabled: Boolean(res.data.schedule?.autoPilotEnabled),
          webhookUrl: res.data.schedule?.webhookUrl || "",
          usingRedis: Boolean(res.data.usingRedis),
          redisConnected: Boolean(res.data.redisConnected),
          lastRunAt: res.data.schedule?.lastRunAt || "",
          nextRunAt: res.data.schedule?.nextRunAt || "",
          // the saved next run is shown in the date box, so saving again keeps the chosen time
          runAt: res.data.schedule?.frequency === "on_demand" ? "" : toLocalInput(res.data.schedule?.nextRunAt),
          approvalsWaiting: res.data.approvalsWaiting ?? 0,
        });
        setScheduleLoaded(true);
      } else {
        setScheduleLoadError("The saved schedule could not be read.");
      }
    } catch (err) {
      setScheduleLoadError(err instanceof Error ? err.message : "The saved schedule could not be loaded.");
    }
  };

  const saveSchedule = async () => {
    if (!scheduleLoaded || scheduleSaving) return;
    try {
      setScheduleSaving(true);
      await seoAuditApi.updateAuditSchedule({
        frequency: scheduleState.frequency,
        intervalDays: scheduleState.intervalDays,
        autoPilotEnabled: scheduleState.autoPilotEnabled,
        webhookUrl: scheduleState.webhookUrl,
        runAt: scheduleState.frequency === "on_demand" ? undefined : fromLocalInput(scheduleState.runAt),
      });
      setNotice({ tone: "ok", text: "Audit schedule saved." });
      setScheduleModalOpen(false);
      setScheduleVersion((v) => v + 1);
    } catch (err) {
      setNotice({ tone: "error", text: errorMessage(err) || "Failed to save the schedule." });
    } finally {
      setScheduleSaving(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    seoAuditApi
      .checkupReport(selectedPageId)
      .then((data) => {
        if (!cancelled) setAuditReport(data);
      })
      .catch(() => {
        if (!cancelled) setAuditReport(null);
      })
      .finally(() => {
        if (!cancelled) setAuditSettledKey(`${selectedPageId}#${auditVersion}`);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPageId, auditVersion]);

  useEffect(() => {
    seoAuditApi.overview().then(setOverview).catch(() => undefined);
    seoAuditApi
      .auditRoutes()
      .then((list) => {
        if (list.length > 0) setRoutes(list);
        else setRoutesError("The live sitemap could not be reached, so only the home route is listed.");
      })
      .catch(() => {
        setRoutesError("The live sitemap could not be reached, so only the home route is listed.");
      });
  }, []);

  const ALL_SITE_PAGES = routes;

  useEffect(() => {
    const pageObj = ALL_SITE_PAGES.find((p) => p.id === selectedPageId) || ALL_SITE_PAGES[0];
    if (!pageObj) return;
    const targetUrl = routeUrl(pageObj);
    const cacheKey = `${targetUrl}:${strategy}`;

    const cached = getSavedPageSpeed(targetUrl);
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (cached && cached.strategy === strategy) {
        setSpeed({ pageId: pageObj.id, strategy, data: cached });
      } else {
        setSpeed(null);
      }
      setLiveFetching(true);
    });
    seoAuditApi
      .pagespeed(targetUrl, strategy, false)
      .then((data) => {
        if (cancelled) return;
        setSpeed({ pageId: pageObj.id, strategy, data });
        if (data?.ok) {
          savePageSpeed(cacheKey, data);
        }
      })
      .catch(() => {
        if (!cancelled) setSpeed({ pageId: pageObj.id, strategy, data: cached ?? null });
      })
      .finally(() => {
        if (!cancelled) setLiveFetching(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPageId, routes, strategy]);

  useEffect(() => {
    if (prefetchStarted.current || routes.length < 2) return;
    prefetchStarted.current = true;
    const saved = getSavedPageSpeedMap();
    const pendingRoutes = routes.filter((r) => !saved.has(routeUrl(r)));
    if (pendingRoutes.length === 0) return;

    let stopped = false;
    const timer = setTimeout(() => {
      void (async () => {
        for (const r of pendingRoutes) {
          if (stopped) return;
          try {
            const auditMobile = await seoAuditApi.pagespeed(routeUrl(r), "mobile", false);
            if (!stopped && auditMobile?.ok) savePageSpeed(routeUrl(r), auditMobile);
            // Google refused (quota, site not reachable): stop here instead of spending more of the daily quota
            if (!auditMobile?.ok) return;
            const auditDesktop = await seoAuditApi.pagespeed(routeUrl(r), "desktop", false);
            if (!stopped && auditDesktop?.ok) savePageSpeed(routeUrl(r), auditDesktop);
          } catch {
            // skip this route
          }
        }
      })();
    }, 2500);

    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [routes]);

  const selectedPageObj = ALL_SITE_PAGES.find((p) => p.id === selectedPageId) || ALL_SITE_PAGES[0];
  const pageSpeed = speed?.pageId === selectedPageObj.id && speed?.strategy === strategy ? speed.data : null;
  const updating = liveFetching || reAuditing;
  const pendingCount = pending.data?.counts.pending ?? 0;

  return (
    <div className="min-h-screen bg-slate-100 p-4 lg:p-6 lg:pr-20 space-y-4 text-slate-900">
      {/* Top Header */}
      <AuditHeader
        siteName={SITE_NAME}
        run={run}
        onRunNow={run.runNow}
        onDownloadExcel={handleDownloadExcel}
        downloading={downloadingExcel}
        onOpenScheduleSettings={openScheduleModal}
        onOpenApprovals={() => setApprovalOpen(true)}
        scheduleVersion={scheduleVersion}
      />

      {notice && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-xl border px-4 py-2.5 text-xs font-bold ${
            notice.tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="cursor-pointer text-current opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation: three main views, then the other tools grouped by purpose */}
      <AuditNav
        activeTab={activeTab}
        view={auditSubSection}
        pendingCount={pendingCount}
        onOpenView={(v) => {
          setActiveTab("audit");
          setAuditSubSection(v);
        }}
        onOpenTool={(id) => setActiveTab(id as SeoTabId)}
      />

      {/* Tab 1: Page SEO Audit */}
      {activeTab === "audit" && (
        <div className="space-y-5">
          {/* Summary: issues, fix score, waiting for website, Auto-Fix All (the Page report has its own scores) */}
          {auditSubSection !== "matrix" && (
          <AutoFixMasterBar
            loading={pending.loading && !pending.data}
            error={pending.error && !pending.data ? pending.error : null}
            hasAudit={Boolean(pending.data?.hasAudit)}
            pendingCount={pendingCount}
            resolvedCount={pending.data?.counts.resolved ?? 0}
            criticalCount={pending.data?.counts.critical ?? 0}
            warningCount={pending.data?.counts.warning ?? 0}
            healthScore={pending.data?.healthScore ?? null}
            healthScoreAtAudit={pending.data?.healthScoreAtAudit ?? null}
            fixing={run.running && run.kind === "autofix_all"}
            busyOther={run.running && run.kind !== "autofix_all"}
            percent={run.percent}
            step={run.step}
            runError={run.kind === "autofix_all" ? run.error : null}
            onAutoFixAll={() => setAutoFixConfirmOpen(true)}
            onRetry={() => void pending.reload()}
          />
          )}

          {/* Sub-Section 1: Deep Page Audit Matrix */}
          {auditSubSection === "matrix" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Route Selector Bar */}
              <AuditRouteSelector
                routes={ALL_SITE_PAGES}
                selectedPageId={selectedPageId}
                onSelectRoute={(id) => setSelectedPageId(id)}
                currentUrl={routeUrl(selectedPageObj)}
              />

              {/* Status indicator */}
              {(updating || auditLoading) && (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-2xs">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  {reAuditing
                    ? "Running live audit on backend (crawling routes, checking tags, querying Google PageSpeed)..."
                    : "Loading live SEO audit report…"}
                </div>
              )}

              {/* Deep Page Checkup Report */}
              <SeoSiteCheckupReport
                issueKeys={pending.data?.pending.map((p) => `${p.route}::${p.issueType}`)}
                onOpenIssues={(route, type) => {
                  setIssuesFocus({ route, type, key: Date.now() });
                  setActiveTab("audit");
                  setAuditSubSection("issues");
                }}
                pageId={selectedPageObj.id}
                url={routeUrl(selectedPageObj)}
                pagespeed={pageSpeed}
                strategy={strategy}
                report={auditReport}
                onStrategyChange={(s) => setStrategy(s)}
                onReAudit={async () => {
                  const targetUrl = routeUrl(selectedPageObj);
                  const pageId = selectedPageObj.id;
                  const cacheKey = `${targetUrl}:${strategy}`;
                  setReAuditing(true);
                  try {
                    await seoAuditApi.startAudit({ force: true });
                    const refreshedRoutes = await seoAuditApi.auditRoutes().catch(() => []);
                    if (refreshedRoutes.length > 0) setRoutes(refreshedRoutes);
                    const data = await seoAuditApi.pagespeed(targetUrl, strategy, true).catch(() => null);
                    if (data) {
                      setSpeed({ pageId, strategy, data });
                      if (data?.ok) {
                        savePageSpeed(cacheKey, data);
                      }
                    }
                    const freshReport = await seoAuditApi.checkupReport(pageId).catch(() => null);
                    setAuditReport(freshReport);
                    setAuditVersion((v) => v + 1);
                    await pending.reload().catch(() => undefined);
                  } catch (err) {
                    console.error("Audit run error:", err);
                  } finally {
                    setReAuditing(false);
                  }
                }}
              />
            </div>
          )}

          {/* Sub-Section 2: Active Issues Queue (With Route Filter and 1-Click Image Inspector) */}
          {auditSubSection === "issues" && !pending.data?.hasAudit && (
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-xs font-bold text-slate-500 shadow-xs">
              {pending.loading ? "Loading issues…" : "No audit has been run yet. Press \"Run audit now\" at the top to find issues."}
            </div>
          )}

          {auditSubSection === "issues" && pending.data?.hasAudit && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <ActiveIssuesList
                key={issuesFocus?.key ?? 0}
                initialFilter={issuesFocus && issuesFocus.type !== "all" ? issuesFocus.type : undefined}
                initialRoute={issuesFocus?.route}
                issues={pending.data.pending}
                loading={pending.loading}
                error={pending.error}
                onFixed={(issue) => {
                  pending.removeIssue(issue.id);
                  refreshAfterChange();
                }}
                onOpenImageInspector={(targetRoute) => {
                  setImageInspectorTarget(targetRoute);
                  setActiveTab("image_inspector");
                }}
              />
            </div>
          )}

          {/* Sub-Section 3: Resolved Issues History & 1-Click Rollback */}
          {auditSubSection === "history" && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <ResolvedIssuesHistory refreshKey={historyKey} onUndone={refreshAfterChange} />
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Backlink Management & Excel Tracker */}
      {activeTab === "backlinks" && <BacklinkManager />}

      {/* Tab 3: AI Content Audit & Copy Detector */}
      {activeTab === "ai_content" && <AiContentAuditor currentRoute={selectedPageObj.path} />}

      {/* Tab 4: Keyword Planner (Dual Mode) */}
      {activeTab === "keyword_planner" && <KeywordPlannerTool />}

      {/* Tab 5: SEO Activity Logs */}
      {activeTab === "activity_log" && <SeoActivityLogWidget />}

      {/* Tab 6: Semrush Compare */}
      {activeTab === "semrush" && (
        <SemrushComparePanel
          comparison={semrush.data?.comparison ?? null}
          loading={semrush.loading}
          loadError={semrush.error}
          uploading={semrush.uploading}
          onUpload={semrush.upload}
        />
      )}

      {/* Tab 7: Fix Tasks */}
      {activeTab === "tasks" && (
        <AuditTasksPanel data={auditTasks.data} loading={auditTasks.loading} error={auditTasks.error} onSetStatus={auditTasks.setStatus} />
      )}

      {/* Tab 8: AI Content Inspector */}
      {activeTab === "ai_inspector" && <AiContentInspectorTab routes={routes} initialPath={selectedPageObj.path} />}

      {/* Tab 9: AI Image Inspector */}
      {activeTab === "image_inspector" && <AiImageInspectorTab routes={routes} initialPath={imageInspectorTarget || selectedPageObj.path} />}

      {/* Headings audit, share cards, AI picture check */}
      {activeTab === "headings" && (
        <HeadingsAuditTab
          onOpenIssues={(targetRoute) => {
            setIssuesFocus({ route: targetRoute, type: "h1", key: Date.now() });
            setActiveTab("audit");
            setAuditSubSection("issues");
          }}
        />
      )}
      {activeTab === "social" && <SocialTagsTab routes={routes} initialPath={selectedPageObj.path} />}
      {activeTab === "ai_pictures" && <AiPictureCheckTab routes={routes} initialPath={selectedPageObj.path} />}

      {/* Tab 10: Internal Links */}
      {activeTab === "internal_links" && <InternalLinksTab />}

      {/* Tab 11: 404 Log */}
      {activeTab === "not_found" && <NotFoundLogTab />}

      {/* Tab 12: Outreach */}
      {activeTab === "outreach" && <OutreachTab />}

      {/* Auto-Fix Confirmation Modal */}
      <AutoFixConfirmModal
        isOpen={autoFixConfirmOpen}
        pendingCount={pendingCount}
        onConfirm={executeAutoFixAll}
        onClose={() => setAutoFixConfirmOpen(false)}
      />

      {/* Auto-Fix Results Review Modal */}
      <AutoFixResultModal
        data={autoFixModal}
        onClose={() => setAutoFixModal(null)}
        onDownloadExcel={handleDownloadExcel}
      />

      {/* Audit Schedule & BullMQ Queue Modal */}
      <AuditScheduleModal
        isOpen={scheduleModalOpen}
        scheduleLoaded={scheduleLoaded}
        scheduleSaving={scheduleSaving}
        scheduleLoadError={scheduleLoadError}
        scheduleState={scheduleState}
        onStateChange={setScheduleState}
        onSave={saveSchedule}
        onClose={() => setScheduleModalOpen(false)}
        onReviewApprovals={() => {
          setScheduleModalOpen(false);
          setApprovalOpen(true);
        }}
      />

      {/* Auto-Pilot suggestions: nothing is applied until the admin approves */}
      <AutoPilotApprovalModal
        isOpen={approvalOpen}
        onClose={() => {
          setApprovalOpen(false);
          setScheduleVersion((v) => v + 1);
        }}
        onChanged={refreshAfterChange}
      />
    </div>
  );
}
