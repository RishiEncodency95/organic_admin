"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
  FileText,
  UserCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  Send,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock3,
  TrendingUp,
  Sparkles,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import Swal from "sweetalert2";
import typography from "../pages/PagesTypography.module.css";
import { api, getBackendUrl } from "@/lib/api";
import { useAppSelector } from "@/store/hooks";
import KpiStatCards, { type KpiStatCardItem } from "@/components/ui/KpiStatCards";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import ApplicationSentModal from "@/components/ApplicationSentModal";
import CandidateDetailsModal from "@/components/CandidateDetailsModal";
import ForwardToHRModal from "@/components/ForwardToHRModal";

function ModalHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const modal = searchParams.get("modal");

  const closeModals = () => {
    router.push("/applications-ai-response");
  };

  return (
    <>
      <ApplicationSentModal isOpen={modal === "submitform"} onClose={closeModals} />
      <CandidateDetailsModal isOpen={modal === "candidatedetails"} onClose={closeModals} />
      <ForwardToHRModal isOpen={modal === "forwardtohr"} onClose={closeModals} />
    </>
  );
}

// --- Types ---
export type AIResultType = "Eligible" | "Partial Match" | "Not Eligible";
export type ApplicationStageType = "Submitted" | "CV Uploaded" | "Incomplete";
export type HRStatusType =
  | "Shortlisted"
  | "Under Review"
  | "Interview"
  | "Not Forwarded"
  | "Selected"
  | "Sent to HR"
  | "Rejected"
  | "On Hold";

export interface CandidateApplication {
  id: string;
  name: string;
  avatar: string;
  experienceYrs: string;
  position: string;
  department: string;
  phone: string;
  email: string;
  aiScore: number;
  aiResult: AIResultType;
  aiAnalysisSummary: string;
  stage: ApplicationStageType;
  hrStatus: HRStatusType;
  appliedOn: string;
  appliedTime: string;
  jobCode: string;
  location: string;
  currentCompany: string;
  currentCtc: string;
  expectedCtc: string;
  noticePeriod: string;
  joiningAvailability: string;
  willingToRelocate: string;
  updatedByHrOn?: string;
  // From /careers/admin/applications-board
  source?: "application" | "cv"; // "cv" = CV checked by AI but no application started
  currentDesignation?: string;
  skills?: string[];
  strengths?: string[];
  gaps?: string[];
  cvUrl?: string;
  cvFileName?: string;
  cvFileSize?: number;
  whyInterested?: string;
  notes?: string;
}

interface ApplicationEventRow {
  _id: string;
  oldStatus?: string;
  newStatus: string;
  changedBy?: string;
  note?: string;
  createdAt: string;
}

const BACKEND_URL = getBackendUrl();

// CVs and photos are Cloudinary URLs, files stored on the backend ("/uploads/..."), or —
// for photos added on the eligibility screen — inline base64 data URLs.
const toFileUrl = (url?: string) =>
  !url
    ? ""
    : /^(https?:|data:|blob:)/i.test(url)
    ? url
    : `${BACKEND_URL}${url.startsWith("/") ? "" : "/"}${url}`;

// Cloudinary refuses to serve PDFs from its public URLs on this account (401), so CV PDFs
// are opened through the backend's /api/files/pdf endpoint, which streams them inline.
const toCvUrl = (url?: string) => {
  const full = toFileUrl(url);
  return /^https:\/\/res\.cloudinary\.com\/[^?#]+\.pdf$/i.test(full)
    ? `${BACKEND_URL}/api/files/pdf?url=${encodeURIComponent(full)}`
    : full;
};

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "?";

// Candidate photo when they added one, otherwise (or if the file is missing) their initials.
function CandidateAvatar({ app, className }: { app: CandidateApplication; className: string }) {
  const src = toFileUrl(app.avatar);
  const [failedSrc, setFailedSrc] = useState("");
  if (src && failedSrc !== src) {
    return (
      <img src={src} alt={app.name} onError={() => setFailedSrc(src)} className={`${className} object-cover`} />
    );
  }
  return (
    <div className={`${className} flex items-center justify-center bg-[#e8f5e9] text-[#1b5e20] font-bold text-[11px]`}>
      {initialsOf(app.name)}
    </div>
  );
}

// Candidate names go into a SweetAlert html body, so they are escaped first.
const escapeHtml = (v: string) =>
  v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

const formatBytes = (bytes?: number) =>
  !bytes ? "" : bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;

export default function ApplicationsAiResponsePage() {
  const currentAdmin = useAppSelector((state) => state.auth.admin);
  const adminName = currentAdmin?.name?.trim() || "Admin";
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  // Activity of one application, tagged with its id so another candidate's history never shows.
  const [eventsFor, setEventsFor] = useState<{ id: string; list: ApplicationEventRow[] }>({ id: "", list: [] });

  // Everyone who used the /careers flow: applications plus AI-checked CV uploads.
  const fetchBoard = () =>
    api.get<CandidateApplication[]>(`/careers/admin/applications-board?_=${Date.now()}`);

  const applyBoard = useCallback((rows: CandidateApplication[]) => {
    const list = (Array.isArray(rows) ? rows : []).map((r) => ({ ...r, joiningAvailability: r.joiningAvailability || "" }));
    setLoadError("");
    setApplications(list);
    setSelectedCandidate((prev) => list.find((r) => r.id === prev?.id) || list[0] || null);
    setLoading(false);
  }, []);

  const failBoard = useCallback((err: unknown) => {
    setLoadError((err as Error)?.message || "Could not load applications.");
    setLoading(false);
  }, []);

  // Re-fetch after an HR update or note.
  const loadApplications = useCallback(async () => {
    try {
      applyBoard(await fetchBoard());
    } catch (err) {
      failBoard(err);
    }
  }, [applyBoard, failBoard]);

  // Everyone who used the /careers flow: applications plus AI-checked CV uploads.
  useEffect(() => {
    let active = true;
    fetchBoard()
      .then((rows) => active && applyBoard(rows))
      .catch((err) => active && failBoard(err));
    return () => {
      active = false;
    };
  }, [applyBoard, failBoard]);

  const [activeDrawerTab, setActiveDrawerTab] = useState<
    "Overview" | "Application" | "AI Analysis" | "HR Status" | "Activity"
  >("Overview");

  // Filters State
  const [positionFilter, setPositionFilter] = useState("All Positions");
  const [hrStatusFilter, setHrStatusFilter] = useState("All Status");
  const [aiResultFilter, setAiResultFilter] = useState("All Results");
  const [stageFilter, setStageFilter] = useState("All Stages");
  const [dateRange, setDateRange] = useState("17 Sep 2026 - 17 Oct 2026");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtering Logic
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (positionFilter !== "All Positions" && app.position !== positionFilter) return false;
      if (hrStatusFilter !== "All Status" && app.hrStatus !== hrStatusFilter) return false;
      if (aiResultFilter !== "All Results" && app.aiResult !== aiResultFilter) return false;
      if (stageFilter !== "All Stages" && app.stage !== stageFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = app.name.toLowerCase().includes(q);
        const matchesEmail = app.email.toLowerCase().includes(q);
        const matchesPhone = app.phone.toLowerCase().includes(q);
        const matchesPos = app.position.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesPhone && !matchesPos) return false;
      }

      return true;
    });
  }, [applications, positionFilter, hrStatusFilter, aiResultFilter, stageFilter, searchQuery]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredApplications.length);
  const currentPaginatedRows = filteredApplications.slice(startIndex, endIndex);

  // Checkbox Selectors
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(currentPaginatedRows.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleResetFilters = () => {
    setPositionFilter("All Positions");
    setHrStatusFilter("All Status");
    setAiResultFilter("All Results");
    setStageFilter("All Stages");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const showToast = (icon: "success" | "info" | "warning" | "error", title: string) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    });
  };

  const notAppliedYet = (app: CandidateApplication) => {
    if (app.source === "cv") {
      showToast("warning", `${app.name} only checked their CV and hasn't applied yet`);
      return true;
    }
    return false;
  };

  const updateHrStatus = async (app: CandidateApplication, next: HRStatusType) => {
    if (notAppliedYet(app)) return;
    try {
      await api.patch(`/careers/admin/applications/${encodeURIComponent(app.id)}/hr`, {
        hrStatus: next,
        changedBy: adminName,
      });
      showToast("success", `HR status updated to ${next}`);
      await loadApplications();
    } catch (err) {
      showToast("error", (err as Error)?.message || "Could not update HR status");
    }
  };

  // Eye icon in the table opens the full Candidate Details popup for that row.
  const [detailsId, setDetailsId] = useState<string | null>(null);

  // "Forward to HR" opens the forward form; submitting it marks the application "Sent to HR".
  const [forwardTarget, setForwardTarget] = useState<CandidateApplication | null>(null);

  const handleForwardToHr = (app: CandidateApplication) => {
    if (notAppliedYet(app)) return;
    setForwardTarget(app);
  };

  const submitForwardToHr = async ({ recipients, note, share }: { recipients: string[]; note: string; share: string[] }) => {
    const app = forwardTarget;
    if (!app) return;
    try {
      const result = await api.patch<{
        email: { sent: boolean; skipped?: boolean; error?: string } | null;
        recipients: { to: string[]; cc: string[]; bcc: string[] } | null;
      }>(`/careers/admin/applications/${encodeURIComponent(app.id)}/hr`, {
        hrStatus: "Sent to HR",
        changedBy: adminName,
        note: `Forwarded to HR (${recipients.join(", ")}). Shared: ${share.join(", ")}${note ? `. Note: ${note}` : ""}`,
        forward: { recipients, share, note },
      });
      // Close the form and confirm straight away; the list refreshes in the background
      // (re-loading every candidate first is what made the alert feel late).
      setForwardTarget(null);
      void loadApplications();
      const sentTo = result?.recipients || { to: recipients, cc: [], bcc: [] };
      const line = (label: string, list: string[]) =>
        list.length ? `<div><b>${label}:</b> ${escapeHtml(list.join(", "))}</div>` : "";
      const email = result?.email;
      const emailLine = email?.sent
        ? `<p style="margin:8px 0 0;font-size:13px;color:#148943">Email sent to HR.</p>`
        : email?.skipped
        ? `<p style="margin:8px 0 0;font-size:13px;color:#B45309">Email notification is off in Career Settings, so no email was sent.</p>`
        : `<p style="margin:8px 0 0;font-size:13px;color:#DC2626">Marked as Sent to HR, but the email could not be sent${email?.error ? `: ${escapeHtml(email.error)}` : ""}.</p>`;
      void Swal.fire({
        icon: email && !email.sent && !email.skipped ? "warning" : "success",
        title: "Forwarded to HR!",
        html:
          `<p style="margin:0 0 8px">${escapeHtml(app.name)}'s application has been forwarded.</p>` +
          `<div style="font-size:13px;color:#334155;text-align:left;display:inline-block">${line("To", sentTo.to)}${line("CC", sentTo.cc)}${line("BCC", sentTo.bcc)}</div>` +
          `<p style="margin:8px 0 0;font-size:13px;color:#475569">Shared: ${escapeHtml(share.join(", "))}</p>` +
          emailLine,
        confirmButtonText: "OK",
        confirmButtonColor: "#148943",
      });
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Could not forward",
        text: (err as Error)?.message || "Please try again.",
        confirmButtonColor: "#dc2626",
      });
    }
  };

  const handleAddNote = async (app: CandidateApplication) => {
    if (notAppliedYet(app)) return;
    const { value: note } = await Swal.fire({
      title: `Add note for ${app.name}`,
      input: "textarea",
      inputPlaceholder: "Write a note for this application...",
      showCancelButton: true,
      confirmButtonText: "Save Note",
      confirmButtonColor: "#0f766e",
      inputValidator: (v) => (!v || !v.trim() ? "Please write a note" : undefined),
    });
    if (!note) return;
    try {
      await api.post(`/careers/admin/applications/${encodeURIComponent(app.id)}/notes`, {
        note,
        changedBy: adminName,
      });
      showToast("success", "Note added");
      await loadApplications();
      if (activeDrawerTab === "Activity") loadEvents(app);
    } catch (err) {
      showToast("error", (err as Error)?.message || "Could not add note");
    }
  };

  // PDFs open in a new tab; Word files (and anything else) are downloaded under their own name.
  const openCv = async (app: CandidateApplication) => {
    const url = toCvUrl(app.cvUrl);
    if (!url) {
      showToast("warning", "No CV file found for this candidate");
      return;
    }
    const name = app.cvFileName || app.cvUrl?.split("/").pop() || "cv";
    const isPdf = /\.pdf$/i.test(name) || /\.pdf($|\?)/i.test(app.cvUrl || "");
    if (isPdf) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      // A download attribute is ignored for cross-origin links, so fetch the file first.
      const res = await fetch(url);
      if (!res.ok) {
        showToast("error", res.status === 404 ? "CV file not found on the server" : `Could not download CV (${res.status})`);
        return;
      }
      const blobUrl = URL.createObjectURL(await res.blob());
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Browsers download .doc/.docx when navigated to, so this still saves the file.
      window.location.href = url;
    }
  };

  const loadEvents = useCallback(async (app: CandidateApplication) => {
    if (app.source !== "application") return;
    try {
      const res = await api.get<{ events: ApplicationEventRow[] }>(
        `/careers/admin/applications/${encodeURIComponent(app.id)}?_=${Date.now()}`
      );
      setEventsFor({ id: app.id, list: Array.isArray(res?.events) ? res.events : [] });
    } catch {
      setEventsFor({ id: app.id, list: [] });
    }
  }, []);

  useEffect(() => {
    const app = detailsId ? applications.find((a) => a.id === detailsId) : null;
    if (app) loadEvents(app);
  }, [detailsId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedCandidate && activeDrawerTab === "Activity") loadEvents(selectedCandidate);
  }, [selectedCandidate?.id, activeDrawerTab, loadEvents]); // eslint-disable-line react-hooks/exhaustive-deps

  // Download the rows currently shown (all filters applied) as a CSV file.
  const handleExport = () => {
    const cols: [string, (a: CandidateApplication) => string | number][] = [
      ["Application ID", (a) => (a.source === "application" ? a.id : "")],
      ["Name", (a) => a.name],
      ["Email", (a) => a.email],
      ["Phone", (a) => a.phone],
      ["Location", (a) => a.location],
      ["Position", (a) => a.position],
      ["Department", (a) => a.department],
      ["Experience", (a) => a.experienceYrs],
      ["AI Score %", (a) => a.aiScore],
      ["AI Result", (a) => a.aiResult],
      ["Stage", (a) => a.stage],
      ["HR Status", (a) => a.hrStatus],
      ["Current Company", (a) => a.currentCompany],
      ["Current CTC", (a) => a.currentCtc],
      ["Expected CTC", (a) => a.expectedCtc],
      ["Notice Period", (a) => a.noticePeriod],
      ["Applied On", (a) => `${a.appliedOn} ${a.appliedTime}`],
      ["CV", (a) => toCvUrl(a.cvUrl)],
    ];
    const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.map(([h]) => esc(h)).join(","), ...filteredApplications.map((a) => cols.map(([, f]) => esc(f(a))).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `applications-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const positions = useMemo(
    () => Array.from(new Set(applications.map((a) => a.position).filter(Boolean))).sort(),
    [applications]
  );

  const counts = useMemo(() => {
    const by = (pred: (a: CandidateApplication) => boolean) => applications.filter(pred).length;
    return {
      total: applications.length,
      cvUploaded: by((a) => a.stage === "CV Uploaded"),
      submitted: by((a) => a.stage === "Submitted"),
      eligible: by((a) => a.aiResult === "Eligible"),
      partial: by((a) => a.aiResult === "Partial Match"),
      notEligible: by((a) => a.aiResult === "Not Eligible"),
      incomplete: by((a) => a.stage === "Incomplete"),
    };
  }, [applications]);

  const applyCardFilter = (apply: () => void) => {
    handleResetFilters();
    apply();
    setCurrentPage(1);
  };

  const statCards: KpiStatCardItem[] = [
    {
      title: "TOTAL CANDIDATES",
      value: counts.total,
      icon: FileText,
      tone: "blue",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
      borderColor: "#bae6fd",
      numColor: "#0284c7",
      footer: "View all candidates",
      onClick: handleResetFilters,
    },
    {
      title: "CV ONLY (NOT APPLIED)",
      value: counts.cvUploaded,
      icon: Download,
      tone: "indigo",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #c7d2fe 100%)",
      borderColor: "#c7d2fe",
      numColor: "#4338ca",
      footer: "View CV uploads",
      onClick: () => applyCardFilter(() => setStageFilter("CV Uploaded")),
    },
    {
      title: "APPLICATIONS SUBMITTED",
      value: counts.submitted,
      icon: CheckCircle,
      tone: "teal",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
      borderColor: "#99f6e4",
      numColor: "#0f766e",
      footer: "View submitted",
      onClick: () => applyCardFilter(() => setStageFilter("Submitted")),
    },
    {
      title: "ELIGIBLE (AI)",
      value: counts.eligible,
      icon: Sparkles,
      tone: "emerald",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
      borderColor: "#bbf7d0",
      numColor: "#15803d",
      footer: "View eligible",
      onClick: () => applyCardFilter(() => setAiResultFilter("Eligible")),
    },
    {
      title: "PARTIAL MATCH",
      value: counts.partial,
      icon: AlertCircle,
      tone: "amber",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
      borderColor: "#fed7aa",
      numColor: "#c2410c",
      footer: "View partial matches",
      onClick: () => applyCardFilter(() => setAiResultFilter("Partial Match")),
    },
    {
      title: "NOT ELIGIBLE",
      value: counts.notEligible,
      icon: XCircle,
      tone: "rose",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
      borderColor: "#fecdd3",
      numColor: "#be123c",
      footer: "View not eligible",
      onClick: () => applyCardFilter(() => setAiResultFilter("Not Eligible")),
    },
    {
      title: "INCOMPLETE",
      value: counts.incomplete,
      icon: Clock3,
      tone: "slate",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #e2e8f0 100%)",
      borderColor: "#e2e8f0",
      numColor: "#334155",
      footer: "View incomplete",
      onClick: () => applyCardFilter(() => setStageFilter("Incomplete")),
    },
  ];

  // Badge Color Mappers — same chip palette as the Testimonials table status pills
  const CHIP_GREEN = "bg-[#e8f5e9] text-[#23714a] border-[#a5d6a7]";
  const CHIP_AMBER = "bg-[#fff8e1] text-[#b78103] border-[#ffe082]";
  const CHIP_RED = "bg-[#ffebee] text-[#c62828] border-[#ef9a9a]";
  const CHIP_BLUE = "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]";
  const CHIP_TEAL = "bg-[#e0f7fa] text-[#00838f] border-[#80deea]";
  const CHIP_VIOLET = "bg-[#f3e8fd] text-[#7e22ce] border-[#d8b4fe]";
  const CHIP_GREY = "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]";

  const getAiScoreBadge = (score: number) => (score >= 80 ? CHIP_GREEN : score >= 60 ? CHIP_AMBER : CHIP_RED);

  const getAiResultBadge = (result: AIResultType) => {
    switch (result) {
      case "Eligible":
        return CHIP_GREEN;
      case "Partial Match":
        return CHIP_AMBER;
      case "Not Eligible":
        return CHIP_RED;
    }
  };

  const getStageBadge = (stage: ApplicationStageType) => {
    switch (stage) {
      case "Submitted":
        return CHIP_BLUE;
      case "CV Uploaded":
        return CHIP_TEAL;
      case "Incomplete":
        return CHIP_GREY;
    }
  };

  const getHrStatusBadge = (status: HRStatusType) => {
    switch (status) {
      case "Shortlisted":
      case "Selected":
        return CHIP_GREEN;
      case "Under Review":
      case "Sent to HR":
        return CHIP_BLUE;
      case "Interview":
        return CHIP_VIOLET;
      case "Rejected":
        return CHIP_RED;
      case "On Hold":
        return CHIP_AMBER;
      case "Not Forwarded":
      default:
        return CHIP_GREY;
    }
  };

  const chipClass = "inline-flex h-[22px] items-center whitespace-nowrap rounded-[4px] border px-[8px] text-[8px] font-bold shadow-xs";
  const thClass = "px-[12px] py-[6px] whitespace-nowrap text-[8.5px] font-bold text-white uppercase tracking-wider";

  return (
    <div className={`${typography.pages} min-h-screen w-full bg-[#fffefb] px-[18px] py-[14px] text-[#1e293b] font-sans text-[11px]`}>
      {/* TOP HEADING — same as the Exhibitor List page */}
      <div className="mb-[18px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
        <div>
          <h1
            className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
            style={{ color: "#23471d" }}
          >
            Applications & AI Response
          </h1>
          <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
            Manage job applications, AI analysis results and HR status in one place.
          </p>
        </div>

        <div className="flex items-center gap-[10px]">
          <button
            type="button"
            onClick={handleExport}
            className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] border border-[#bbf7d0] bg-[#f0fdf4] px-[14px] text-[8.5px] font-semibold text-[#15803d] transition hover:bg-[#dcfce7] shadow-sm"
          >
            <Download className="h-[12px] w-[12px]" strokeWidth={1.7} />
            Export
          </button>
        </div>
      </div>

      {/* METRIC STATS CARDS (same cards as Exhibitor List) */}
      <KpiStatCards
        items={statCards}
        gridClassName="mb-[12px] mt-[12px] grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7"
        compact
      />

      <div className="flex flex-col lg:flex-row items-start gap-4">
        {/* =========================================================
            LEFT COLUMN (FILTERS IN 1 ROW, TABLE)
        ========================================================= */}
        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          {/* FILTERS & SEARCH CARD (ALL FILTERS IN 1 SINGLE ROW) */}
          <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs space-y-2">
            {/* Filters Single Horizontal Row */}
            <div className="flex items-end flex-nowrap gap-2 overflow-x-auto text-[10px] pb-0.5">
              {/* Select Position */}
              <div className="flex flex-col gap-0.5 flex-1 min-w-[130px]">
                <label className="font-semibold text-slate-600 whitespace-nowrap">Select Position</label>
                <select
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                  className="h-7 px-2 bg-white border border-slate-300 rounded text-[10px] font-medium text-slate-700 outline-none w-full"
                >
                  <option value="All Positions">All Positions</option>
                  {positions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {/* HR Status */}
              <div className="flex flex-col gap-0.5 min-w-[100px]">
                <label className="font-semibold text-slate-600 whitespace-nowrap">HR Status</label>
                <select
                  value={hrStatusFilter}
                  onChange={(e) => setHrStatusFilter(e.target.value)}
                  className="h-7 px-2 bg-white border border-slate-300 rounded text-[10px] font-medium text-slate-700 outline-none w-full"
                >
                  <option value="All Status">All Status</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Interview">Interview</option>
                  <option value="Not Forwarded">Not Forwarded</option>
                  <option value="Selected">Selected</option>
                  <option value="Sent to HR">Sent to HR</option>
                  <option value="Rejected">Rejected</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              {/* AI Result */}
              <div className="flex flex-col gap-0.5 min-w-[100px]">
                <label className="font-semibold text-slate-600 whitespace-nowrap">AI Result</label>
                <select
                  value={aiResultFilter}
                  onChange={(e) => setAiResultFilter(e.target.value)}
                  className="h-7 px-2 bg-white border border-slate-300 rounded text-[10px] font-medium text-slate-700 outline-none w-full"
                >
                  <option value="All Results">All Results</option>
                  <option value="Eligible">Eligible</option>
                  <option value="Partial Match">Partial Match</option>
                  <option value="Not Eligible">Not Eligible</option>
                </select>
              </div>

              {/* Application Stage */}
              <div className="flex flex-col gap-0.5 min-w-[110px]">
                <label className="font-semibold text-slate-600 whitespace-nowrap">Application Stage</label>
                <select
                  value={stageFilter}
                  onChange={(e) => setStageFilter(e.target.value)}
                  className="h-7 px-2 bg-white border border-slate-300 rounded text-[10px] font-medium text-slate-700 outline-none w-full"
                >
                  <option value="All Stages">All Stages</option>
                  <option value="Submitted">Submitted</option>
                  <option value="CV Uploaded">CV Uploaded</option>
                  <option value="Incomplete">Incomplete</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="flex flex-col gap-0.5 min-w-[150px]">
                <label className="font-semibold text-slate-600 whitespace-nowrap">Date Range</label>
                <div className="relative">
                  <Calendar className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="h-7 pl-6 pr-2 bg-white border border-slate-300 rounded text-[10px] font-medium text-slate-700 outline-none w-full"
                  />
                </div>
              </div>

              {/* Reset & Apply Buttons in same line */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-7 px-2.5 text-[10px] font-medium text-slate-500 hover:text-slate-800 transition whitespace-nowrap"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => showToast("info", "Filters applied")}
                  className="h-7 px-3.5 text-[10px] font-semibold text-white bg-[#0f766e] hover:bg-[#0d655e] rounded transition shadow-2xs whitespace-nowrap"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by name, email or mobile..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-2.5 py-1 bg-slate-50 border border-slate-200 rounded text-[10.5px] text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-emerald-600 transition"
              />
            </div>
          </div>

          {/* TABLE CONTAINER — same look as the Testimonials table */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[7px] bg-white border border-[#e8e5df]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead>
                  <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                    <th className="w-[42px] rounded-tl-[6px] px-[12px] py-[6px] text-center">
                      <input
                        type="checkbox"
                        checked={
                          currentPaginatedRows.length > 0 &&
                          currentPaginatedRows.every((r) => selectedIds.includes(r.id))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="accent-[#233D4D] cursor-pointer"
                      />
                    </th>
                    <th className={thClass}>Candidate Name</th>
                    <th className={thClass}>Position</th>
                    <th className={thClass}>Contact</th>
                    <th className={thClass}>AI Score</th>
                    <th className={thClass}>AI Result</th>
                    <th className={thClass}>Application Stage</th>
                    <th className={thClass}>HR Status</th>
                    <th className={thClass}>
                      <span className="inline-flex items-center gap-1">
                        Applied On <ArrowUpDown className="h-3 w-3 text-white/60" />
                      </span>
                    </th>
                    <th className={`${thClass} rounded-tr-[6px] text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0ec]">
                  {currentPaginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-xs font-medium text-slate-500">
                        {loading
                          ? "Loading applications..."
                          : loadError
                          ? `Could not load applications: ${loadError}`
                          : applications.length === 0
                          ? "No applications yet. They appear here when candidates upload a CV on the Careers page."
                          : "No applications match your filter criteria."}
                      </td>
                    </tr>
                  ) : (
                    currentPaginatedRows.map((app) => {
                      const isSelected = selectedCandidate?.id === app.id;
                      return (
                        <tr
                          key={app.id}
                          onClick={() => setSelectedCandidate(app)}
                          className={`cursor-pointer transition hover:bg-slate-50/80 ${isSelected ? "bg-[#f4faf6]" : ""}`}
                        >
                          {/* Checkbox */}
                          <td className="px-[12px] py-[8px] text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(app.id)}
                              onChange={(e) => handleSelectOne(app.id, e.target.checked)}
                              className="accent-[#233D4D] cursor-pointer"
                            />
                          </td>

                          {/* Candidate Name */}
                          <td className="px-[12px] py-[8px]">
                            <div className="flex items-center gap-[10px] min-w-[160px]">
                              <div style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1.5px #e2e8f0" }} className="shrink-0 rounded-full">
                                <CandidateAvatar app={app} className="h-[32px] w-[32px] rounded-full border-[2px] border-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-[10.5px] font-bold text-[#1b5e20]">{app.name}</p>
                                <p className="truncate text-[8px] font-semibold text-[#4B1426]">{app.experienceYrs}</p>
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="px-[12px] py-[8px] max-w-[190px]">
                            <div className="flex items-center gap-1 text-[9px] font-bold text-[#0f766e]">
                              <Briefcase className="h-3 w-3 shrink-0 text-[#d26019]" />
                              <span className="truncate" title={app.position}>{app.position}</span>
                            </div>
                            <p className="mt-0.5 truncate text-[8px] font-medium text-[#64748b]">{app.department}</p>
                          </td>

                          {/* Contact */}
                          <td className="px-[12px] py-[8px] whitespace-nowrap">
                            <div className="flex flex-col items-start leading-tight">
                              <span className="text-[9px] font-bold text-[#dc2626]">{app.phone}</span>
                              <span className="mt-0.5 text-[8px] font-medium text-[#64748b]">{app.email}</span>
                            </div>
                          </td>

                          {/* AI Score */}
                          <td className="px-[12px] py-[8px] whitespace-nowrap">
                            <span className={`${chipClass} ${getAiScoreBadge(app.aiScore)}`}>{app.aiScore}%</span>
                          </td>

                          {/* AI Result */}
                          <td className="px-[12px] py-[8px] whitespace-nowrap">
                            <span className={`${chipClass} ${getAiResultBadge(app.aiResult)}`}>{app.aiResult}</span>
                          </td>

                          {/* Application Stage */}
                          <td className="px-[12px] py-[8px] whitespace-nowrap">
                            <span className={`${chipClass} ${getStageBadge(app.stage)}`}>{app.stage}</span>
                          </td>

                          {/* HR Status */}
                          <td className="px-[12px] py-[8px] whitespace-nowrap">
                            <span className={`${chipClass} ${getHrStatusBadge(app.hrStatus)}`}>{app.hrStatus}</span>
                          </td>

                          {/* Applied On */}
                          <td className="px-[12px] py-[8px] whitespace-nowrap">
                            <div className="flex flex-col items-start leading-tight">
                              <span className="text-[9px] font-bold text-[#293681]">{app.appliedOn}</span>
                              <span className="mt-0.5 text-[8px] font-medium text-[#64748b]">{app.appliedTime}</span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-[12px] py-[8px] text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                title="View Details"
                                onClick={() => {
                                  setSelectedCandidate(app);
                                  setDetailsId(app.id);
                                }}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-400/30 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:bg-orange-500/20 hover:border-orange-400/50 hover:shadow-[0_3px_10px_rgba(249,115,22,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                <Eye className="h-[12px] w-[12px] text-orange-600" />
                              </button>
                              <button
                                type="button"
                                title="More Options"
                                onClick={() => showToast("info", `Options for ${app.name}`)}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-600 backdrop-blur-md border border-blue-400/30 shadow-[0_2px_6px_rgba(37,99,235,0.12)] transition-all hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                <MoreVertical className="h-[12px] w-[12px] text-blue-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer Stats & Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2563eb]">
                  Total Applications: <strong className="font-bold text-[#1d4ed8]">{filteredApplications.length}</strong>
                </span>
                <span className="text-[7.5px] text-[#8a92a0]">
                  (Showing {filteredApplications.length > 0 ? startIndex + 1 : 0}–{endIndex} of {filteredApplications.length})
                </span>
              </div>

              <div className="flex items-center gap-[4px]">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-[22px] min-w-[22px] px-1.5 items-center justify-center rounded-[4px] border text-[8px] font-bold transition cursor-pointer ${
                      currentPage === page
                        ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs"
                        : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="ml-2 h-[22px] rounded-[4px] border border-[#d8dce2] bg-white px-[6px] text-[8px] font-semibold text-[#334155] outline-none"
                >
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                  <option value={50}>50 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN: CANDIDATE DETAILS PANEL (STICKY, TOP ALIGNED)
        ========================================================= */}
        {selectedCandidate && (
          <div className="w-full lg:w-[360px] xl:w-[380px] bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs shrink-0 lg:sticky lg:top-3">
            {/* Header with Close X icon */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 bg-white">
              <span className="text-[10px] font-bold text-black uppercase tracking-wider">CANDIDATE DETAILS</span>
              <button
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Summary Card */}
            <div className="p-3 border-b border-slate-100 bg-white space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CandidateAvatar app={selectedCandidate} className="w-12 h-12 rounded-full border border-slate-200 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="text-xs font-bold text-slate-900 truncate">{selectedCandidate.name}</h2>
                    <span
                      className={`whitespace-nowrap rounded-full border px-1.5 py-[1px] text-[7.5px] font-bold shrink-0 ${getAiResultBadge(
                        selectedCandidate.aiResult
                      )}`}
                    >
                      {selectedCandidate.aiResult} ({selectedCandidate.aiScore}%)
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#1d4ed8] leading-tight mt-0.5 truncate">
                    {selectedCandidate.position}
                  </p>
                  <p className="text-[9.5px] font-semibold text-[#dc2626] truncate">{selectedCandidate.department}</p>
                </div>
              </div>

              {/* Contact Icons Table */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8.5px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-[#15803d] shrink-0" />
                  <span className="truncate font-semibold text-[#15803d]">{selectedCandidate.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-[#7c3aed] shrink-0" />
                  <span className="truncate font-semibold text-[#7c3aed]">{selectedCandidate.email}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-[#ea580c] shrink-0" />
                  <span className="truncate font-semibold text-[#ea580c]">{selectedCandidate.location}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedCandidate.experienceYrs}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleForwardToHr(selectedCandidate)}
                  className="flex-1 flex items-center justify-center gap-1 px-2.5 py-1 bg-[#4B1426] hover:bg-[#3a0f1d] text-white rounded text-[9px] font-bold transition active:scale-95"
                >
                  <Send className="w-3 h-3" />
                  Forward to HR
                </button>
                <button
                  type="button"
                  onClick={() => openCv(selectedCandidate)}
                  className="flex items-center justify-center gap-1 px-2.5 py-1 bg-[#15803d] hover:bg-[#166534] text-white rounded text-[9px] font-bold transition active:scale-95 whitespace-nowrap"
                >
                  <Download className="w-3 h-3 text-white" />
                  Download CV
                </button>
              </div>
            </div>

            {/* Tabs Row */}
            <div className="flex items-center border-b border-slate-200 bg-slate-50 text-[10.5px] font-semibold text-slate-600 px-1 overflow-x-auto">
              {(["Overview", "Application", "AI Analysis", "HR Status", "Activity"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveDrawerTab(t)}
                  className={`py-2 px-2.5 border-b-2 transition whitespace-nowrap ${activeDrawerTab === t
                      ? "border-[#0f766e] text-[#0f766e] font-bold bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            <div className="p-3 space-y-3.5 max-h-[460px] overflow-y-auto text-[10.5px]">
              {activeDrawerTab === "Overview" && (() => {
                const aiTone =
                  selectedCandidate.aiResult === "Eligible"
                    ? { box: "bg-[#f0fdf4] border-[#bbf7d0]", ring: "border-[#16a34a]", score: "text-[#15803d]", title: "text-[#166534]", text: "text-[#3f6212]" }
                    : selectedCandidate.aiResult === "Partial Match"
                    ? { box: "bg-[#fffbeb] border-[#fde68a]", ring: "border-[#d97706]", score: "text-[#b45309]", title: "text-[#92400e]", text: "text-[#78350f]" }
                    : { box: "bg-[#fff1f2] border-[#fecdd3]", ring: "border-[#e11d48]", score: "text-[#be123c]", title: "text-[#9f1239]", text: "text-[#881337]" };
                const labelClass = "text-[#64748b] font-medium";
                const keyInfo = [
                  { icon: Building2, iconColor: "text-[#0f766e]", label: "Current Company", value: selectedCandidate.currentCompany, valueColor: "text-[#0f766e]" },
                  { icon: DollarSign, iconColor: "text-[#15803d]", label: "Current CTC", value: selectedCandidate.currentCtc, valueColor: "text-[#15803d]" },
                  { icon: TrendingUp, iconColor: "text-[#c2410c]", label: "Expected CTC", value: selectedCandidate.expectedCtc, valueColor: "text-[#c2410c]" },
                  { icon: Clock, iconColor: "text-[#7c3aed]", label: "Notice Period", value: selectedCandidate.noticePeriod, valueColor: "text-[#7c3aed]" },
                  { icon: UserCheck, iconColor: "text-[#293681]", label: "Joining Availability", value: selectedCandidate.joiningAvailability, valueColor: "text-[#293681]" },
                  {
                    icon: MapPin,
                    iconColor: "text-[#ea580c]",
                    label: "Willing to Relocate",
                    value: selectedCandidate.willingToRelocate,
                    valueColor: /^yes/i.test(String(selectedCandidate.willingToRelocate)) ? "text-[#15803d]" : "text-[#dc2626]",
                  },
                ];

                return (
                <>
                  {/* Application Details */}
                  <div>
                    <h3 className="font-bold text-[#23471d] mb-1.5 text-[11px]">Application Details</h3>
                    <div className="space-y-1.5 bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0]">
                      <div className="flex justify-between">
                        <span className={labelClass}>Applied On</span>
                        <span className="font-semibold text-[#293681]">
                          {selectedCandidate.appliedOn}, {selectedCandidate.appliedTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={labelClass}>Application Stage</span>
                        <span className={`${chipClass} ${getStageBadge(selectedCandidate.stage)}`}>
                          {selectedCandidate.stage}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className={`${labelClass} shrink-0`}>Job Position</span>
                        <span className="font-semibold text-[#1d4ed8] text-right">
                          {selectedCandidate.position}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={labelClass}>Job Code</span>
                        <span className="font-mono font-bold text-[#4B1426]">{selectedCandidate.jobCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-[#23471d] text-[11px]">AI Analysis</h3>
                      <button
                        type="button"
                        onClick={() => setActiveDrawerTab("AI Analysis")}
                        className="inline-flex items-center gap-0.5 rounded-[4px] border border-[#bfdbfe] bg-[#eff6ff] px-2 py-0.5 text-[8.5px] font-bold text-[#1d4ed8] transition hover:bg-[#dbeafe]"
                      >
                        View Full Analysis <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className={`border rounded-lg p-2.5 flex items-center gap-3 ${aiTone.box}`}>
                      <div className={`relative w-11 h-11 rounded-full border-4 flex items-center justify-center bg-white shrink-0 ${aiTone.ring}`}>
                        <span className={`text-[11px] font-extrabold ${aiTone.score}`}>
                          {selectedCandidate.aiScore}%
                        </span>
                      </div>
                      <div>
                        <div className={`font-bold text-xs ${aiTone.title}`}>{selectedCandidate.aiResult}</div>
                        <p className={`text-[10px] leading-snug mt-0.5 ${aiTone.text}`}>
                          &ldquo;{selectedCandidate.aiAnalysisSummary}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* HR Status */}
                  <div>
                    <h3 className="font-bold text-[#23471d] mb-1.5 text-[11px]">HR Status</h3>
                    <div className="flex items-center justify-between bg-[#f8fafc] p-2.5 rounded border border-[#e2e8f0]">
                      <span className={`${chipClass} ${getHrStatusBadge(selectedCandidate.hrStatus)}`}>
                        {selectedCandidate.hrStatus}
                      </span>
                      <span className="text-[9px] text-[#64748b]">
                        {selectedCandidate.updatedByHrOn ? (
                          <>
                            Updated by HR •{" "}
                            <span className="font-semibold text-[#293681]">{selectedCandidate.updatedByHrOn}</span>
                          </>
                        ) : (
                          "Not updated by HR yet"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Key Information */}
                  <div>
                    <h3 className="font-bold text-[#23471d] mb-1.5 text-[11px]">Key Information</h3>
                    <div className="space-y-2">
                      {keyInfo.map(({ icon: Icon, iconColor, label, value, valueColor }, i) => (
                        <div
                          key={label}
                          className={`flex items-center justify-between ${i < keyInfo.length - 1 ? "border-b border-[#f1f5f9] pb-1" : ""}`}
                        >
                          <span className={`flex items-center gap-1.5 ${labelClass}`}>
                            <Icon className={`w-3.5 h-3.5 ${iconColor}`} /> {label}
                          </span>
                          <span className={`font-semibold ${valueColor}`}>{value || "—"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
                );
              })()}

              {activeDrawerTab === "Application" && (
                <div className="space-y-2.5 text-slate-700">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <p className="font-bold text-slate-900">Resume File</p>
                    <p className="text-slate-500 text-[10px] mb-2 break-all">
                      {selectedCandidate.cvFileName || "CV"}
                      {selectedCandidate.cvFileSize ? ` (${formatBytes(selectedCandidate.cvFileSize)})` : ""}
                    </p>
                    <button
                      type="button"
                      onClick={() => openCv(selectedCandidate)}
                      className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition text-[10px]"
                    >
                      View Resume
                    </button>
                  </div>
                  {selectedCandidate.whyInterested && (
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <p className="font-bold text-slate-900 mb-1">Why interested</p>
                      <p className="text-[10px] text-slate-600 whitespace-pre-line">{selectedCandidate.whyInterested}</p>
                    </div>
                  )}
                  {(selectedCandidate.skills?.length ?? 0) > 0 && (
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <p className="font-bold text-slate-900 mb-1">Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedCandidate.skills!.map((sk) => (
                          <span key={sk} className="rounded border border-[#bae6fd] bg-[#e0f2fe] px-1.5 py-0.5 text-[9px] font-semibold text-[#0369a1]">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedCandidate.notes && (
                    <div className="p-2.5 bg-amber-50 rounded border border-amber-200">
                      <p className="font-bold text-amber-900 mb-1">Notes</p>
                      <p className="text-[10px] text-amber-800 whitespace-pre-line">{selectedCandidate.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {activeDrawerTab === "AI Analysis" && (
                <div className="space-y-2.5">
                  {selectedCandidate.aiAnalysisSummary && (
                    <p className="text-[10px] text-slate-700 leading-snug">{selectedCandidate.aiAnalysisSummary}</p>
                  )}
                  <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
                    <p className="font-bold">Key Strengths Detected:</p>
                    {(selectedCandidate.strengths?.length ?? 0) > 0 ? (
                      <ul className="list-disc list-inside mt-1 space-y-1 text-emerald-800">
                        {selectedCandidate.strengths!.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-emerald-800">None recorded.</p>
                    )}
                  </div>
                  <div className="p-2.5 bg-rose-50 rounded border border-rose-200 text-rose-900">
                    <p className="font-bold">Gaps:</p>
                    {(selectedCandidate.gaps?.length ?? 0) > 0 ? (
                      <ul className="list-disc list-inside mt-1 space-y-1 text-rose-800">
                        {selectedCandidate.gaps!.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-1 text-rose-800">None recorded.</p>
                    )}
                  </div>
                </div>
              )}

              {activeDrawerTab === "HR Status" && (
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 block">Update Status:</label>
                  {selectedCandidate.source === "cv" ? (
                    <p className="text-[10px] text-slate-500">
                      This candidate only checked their CV and hasn&apos;t applied yet, so there is no application to update.
                    </p>
                  ) : (
                    <select
                      value={selectedCandidate.hrStatus}
                      onChange={(e) => updateHrStatus(selectedCandidate, e.target.value as HRStatusType)}
                      className="w-full p-2 border border-slate-300 rounded font-medium text-slate-800 bg-white"
                    >
                      <option value="Not Forwarded">Not Forwarded</option>
                      <option value="Sent to HR">Sent to HR</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview">Interview</option>
                      <option value="Selected">Selected</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  )}
                </div>
              )}

              {activeDrawerTab === "Activity" && (() => {
                const events = eventsFor.id === selectedCandidate.id ? eventsFor.list : [];
                return (
                <div className="space-y-1 text-slate-600">
                  {events.length === 0 && (
                    <div className="border-l-2 border-blue-500 pl-2 py-1">
                      <p className="font-semibold text-slate-800">
                        {selectedCandidate.source === "cv" ? "CV checked by AI" : "Application received"}
                      </p>
                      <p className="text-[9.5px] text-slate-400">
                        {selectedCandidate.appliedOn}, {selectedCandidate.appliedTime}
                      </p>
                    </div>
                  )}
                  {events.map((ev) => (
                    <div key={ev._id} className="border-l-2 border-blue-500 pl-2 py-1">
                      <p className="font-semibold text-slate-800">{ev.note || ev.newStatus}</p>
                      <p className="text-[9.5px] text-slate-400">
                        {new Date(ev.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                        {ev.changedBy ? ` • ${ev.changedBy}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
                );
              })()}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setActiveDrawerTab("Application")}
                className="flex-1 py-1.5 px-2 text-center text-[10px] font-bold text-white bg-[#233D4D] rounded hover:bg-[#1a2e3a] transition active:scale-95"
              >
                View Full Application
              </button>
              <button
                type="button"
                onClick={() => handleAddNote(selectedCandidate)}
                className="flex-1 py-1.5 px-2 text-center text-[10px] font-bold text-white bg-[#0f766e] rounded hover:bg-[#0d655e] transition active:scale-95"
              >
                Add Note
              </button>
            </div>
          </div>
        )}
      </div>
      {(() => {
        const detailsApp = detailsId ? applications.find((a) => a.id === detailsId) || null : null;
        const idx = detailsApp ? filteredApplications.findIndex((a) => a.id === detailsApp.id) : -1;
        const goTo = (i: number) => {
          const next = filteredApplications[i];
          if (!next) return;
          setDetailsId(next.id);
          setSelectedCandidate(next);
        };
        const activity =
          detailsApp && eventsFor.id === detailsApp.id
            ? eventsFor.list.map((ev) => ({
                id: ev._id,
                title: ev.note || ev.newStatus,
                when: new Date(ev.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
                by: ev.changedBy,
              }))
            : [];
        return (
          <CandidateDetailsModal
            isOpen={!!detailsApp}
            onClose={() => setDetailsId(null)}
            activity={activity}
            onPrev={idx > 0 ? () => goTo(idx - 1) : undefined}
            onNext={idx >= 0 && idx < filteredApplications.length - 1 ? () => goTo(idx + 1) : undefined}
            onForwardToHr={detailsApp ? () => handleForwardToHr(detailsApp) : undefined}
            onDownloadCv={detailsApp ? () => openCv(detailsApp) : undefined}
            onAddNote={detailsApp ? () => handleAddNote(detailsApp) : undefined}
            candidate={
              detailsApp && {
                name: detailsApp.name,
                avatarUrl: toFileUrl(detailsApp.avatar),
                position: detailsApp.position,
                department: detailsApp.department,
                jobCode: detailsApp.jobCode,
                appliedOn: `${detailsApp.appliedOn}, ${detailsApp.appliedTime}`,
                phone: detailsApp.phone,
                email: detailsApp.email,
                location: detailsApp.location,
                source: detailsApp.source,
                stage: detailsApp.stage,
                aiScore: detailsApp.aiScore,
                aiResult: detailsApp.aiResult,
                aiSummary: detailsApp.aiAnalysisSummary,
                strengths: detailsApp.strengths,
                gaps: detailsApp.gaps,
                skills: detailsApp.skills,
                hrStatus: detailsApp.hrStatus,
                updatedByHrOn: detailsApp.updatedByHrOn,
                experience: detailsApp.experienceYrs,
                currentCompany: detailsApp.currentCompany,
                currentDesignation: detailsApp.currentDesignation,
                currentCtc: detailsApp.currentCtc,
                expectedCtc: detailsApp.expectedCtc,
                noticePeriod: detailsApp.noticePeriod,
                willingToRelocate: detailsApp.willingToRelocate,
                whyInterested: detailsApp.whyInterested,
                notes: detailsApp.notes,
                cvFileName: detailsApp.cvFileName,
              }
            }
          />
        );
      })()}
      <ForwardToHRModal
        isOpen={!!forwardTarget}
        onClose={() => setForwardTarget(null)}
        onSubmit={submitForwardToHr}
        candidate={
          forwardTarget && {
            name: forwardTarget.name,
            avatarUrl: toFileUrl(forwardTarget.avatar),
            position: forwardTarget.position,
            department: forwardTarget.department,
            jobCode: forwardTarget.jobCode,
            experience: forwardTarget.experienceYrs,
            location: forwardTarget.location,
            appliedOn: `${forwardTarget.appliedOn}, ${forwardTarget.appliedTime}`,
            aiScore: forwardTarget.aiScore,
            aiResult: forwardTarget.aiResult,
            aiSummary: forwardTarget.aiAnalysisSummary,
          }
        }
      />
      <Suspense fallback={null}>
        <ModalHandler />
      </Suspense>
    </div>
  );
}
