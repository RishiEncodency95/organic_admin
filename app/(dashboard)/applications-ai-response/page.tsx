"use client";

import React, { useState, useMemo } from "react";
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
  Plus,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock3,
  TrendingUp,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import Swal from "sweetalert2";
import typography from "../pages/PagesTypography.module.css";
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
}

// --- Initial Mock Data ---
const INITIAL_APPLICATIONS: CandidateApplication[] = [
  {
    id: "APP-001",
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "5 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 98765 43210",
    email: "priya.sharma@gmail.com",
    aiScore: 92,
    aiResult: "Eligible",
    aiAnalysisSummary: "Strong match for the role based on skills, experience and industry background.",
    stage: "Submitted",
    hrStatus: "Shortlisted",
    appliedOn: "17 Oct 2026",
    appliedTime: "11:24 AM",
    jobCode: "BOE-SALES-001",
    location: "Delhi NCR",
    currentCompany: "ABC Exhibitions Pvt. Ltd.",
    currentCtc: "₹45,000 / month",
    expectedCtc: "₹50,000 – ₹55,000 / month",
    noticePeriod: "30 Days",
    joiningAvailability: "After 30 Days",
    willingToRelocate: "Yes",
    updatedByHrOn: "18 Oct 2026, 02:10 PM",
  },
  {
    id: "APP-002",
    name: "Amit Verma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "4 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 98111 22334",
    email: "amit.verma@outlook.com",
    aiScore: 78,
    aiResult: "Partial Match",
    aiAnalysisSummary: "Good sales background, moderate experience in domestic trade shows.",
    stage: "Submitted",
    hrStatus: "Under Review",
    appliedOn: "16 Oct 2026",
    appliedTime: "04:10 PM",
    jobCode: "BOE-SALES-001",
    location: "Mumbai",
    currentCompany: "Global Trades Ltd.",
    currentCtc: "₹40,000 / month",
    expectedCtc: "₹50,000 / month",
    noticePeriod: "15 Days",
    joiningAvailability: "Immediate",
    willingToRelocate: "Yes",
    updatedByHrOn: "17 Oct 2026, 10:00 AM",
  },
  {
    id: "APP-003",
    name: "Neha Gupta",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "4 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 98710 55667",
    email: "neha.gupta@gmail.com",
    aiScore: 88,
    aiResult: "Eligible",
    aiAnalysisSummary: "High overall qualification alignment and strong communication skills.",
    stage: "Submitted",
    hrStatus: "Interview",
    appliedOn: "16 Oct 2026",
    appliedTime: "01:35 PM",
    jobCode: "BOE-SALES-001",
    location: "Bengaluru",
    currentCompany: "Expo Solutions",
    currentCtc: "₹48,000 / month",
    expectedCtc: "₹60,000 / month",
    noticePeriod: "60 Days",
    joiningAvailability: "60 Days",
    willingToRelocate: "No",
    updatedByHrOn: "17 Oct 2026, 11:30 AM",
  },
  {
    id: "APP-004",
    name: "Rohit Kumar",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "3 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 99901 23456",
    email: "rohit.kumar@gmail.com",
    aiScore: 46,
    aiResult: "Not Eligible",
    aiAnalysisSummary: "Lacks mandatory experience in large-scale domestic exhibition sales.",
    stage: "Submitted",
    hrStatus: "Not Forwarded",
    appliedOn: "15 Oct 2026",
    appliedTime: "05:20 PM",
    jobCode: "BOE-SALES-001",
    location: "Gurugram",
    currentCompany: "Event Horizon",
    currentCtc: "₹30,000 / month",
    expectedCtc: "₹42,000 / month",
    noticePeriod: "30 Days",
    joiningAvailability: "30 Days",
    willingToRelocate: "Yes",
    updatedByHrOn: "16 Oct 2026, 09:15 AM",
  },
  {
    id: "APP-005",
    name: "Sneha Mehta",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "7 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 98100 88990",
    email: "sneha.mehta@rediffmail.com",
    aiScore: 81,
    aiResult: "Eligible",
    aiAnalysisSummary: "Extensive experience in corporate sponsorships and key client management.",
    stage: "Submitted",
    hrStatus: "Selected",
    appliedOn: "15 Oct 2026",
    appliedTime: "12:15 PM",
    jobCode: "BOE-SALES-001",
    location: "Noida",
    currentCompany: "Apex Expo Media",
    currentCtc: "₹55,000 / month",
    expectedCtc: "₹65,000 / month",
    noticePeriod: "15 Days",
    joiningAvailability: "15 Days",
    willingToRelocate: "Yes",
    updatedByHrOn: "16 Oct 2026, 04:00 PM",
  },
  {
    id: "APP-006",
    name: "Vikram Singh",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "5 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 98990 11223",
    email: "vikram.singh@gmail.com",
    aiScore: 69,
    aiResult: "Partial Match",
    aiAnalysisSummary: "Meets basic criteria, but higher CTC expectation than budgeted range.",
    stage: "CV Uploaded",
    hrStatus: "Sent to HR",
    appliedOn: "14 Oct 2026",
    appliedTime: "03:40 PM",
    jobCode: "BOE-SALES-001",
    location: "Chandigarh",
    currentCompany: "Organic World Events",
    currentCtc: "₹42,000 / month",
    expectedCtc: "₹58,000 / month",
    noticePeriod: "30 Days",
    joiningAvailability: "30 Days",
    willingToRelocate: "Yes",
    updatedByHrOn: "15 Oct 2026, 11:00 AM",
  },
  {
    id: "APP-007",
    name: "Kavita Rao",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "4 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 98765 77889",
    email: "kavita.rao@gmail.com",
    aiScore: 85,
    aiResult: "Eligible",
    aiAnalysisSummary: "Strong technical sales aptitude and domestic exhibition client network.",
    stage: "Submitted",
    hrStatus: "Rejected",
    appliedOn: "14 Oct 2026",
    appliedTime: "11:05 AM",
    jobCode: "BOE-SALES-001",
    location: "Hyderabad",
    currentCompany: "Deccan Trade Fairs",
    currentCtc: "₹45,000 / month",
    expectedCtc: "₹52,000 / month",
    noticePeriod: "30 Days",
    joiningAvailability: "30 Days",
    willingToRelocate: "No",
    updatedByHrOn: "15 Oct 2026, 02:20 PM",
  },
  {
    id: "APP-008",
    name: "Arjun Patel",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "2 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 98211 44556",
    email: "arjun.patel@gmail.com",
    aiScore: 62,
    aiResult: "Partial Match",
    aiAnalysisSummary: "Junior level experience; needs further verification of exhibition portfolio.",
    stage: "Incomplete",
    hrStatus: "Not Forwarded",
    appliedOn: "13 Oct 2026",
    appliedTime: "04:22 PM",
    jobCode: "BOE-SALES-001",
    location: "Ahmedabad",
    currentCompany: "Gujarat Expo",
    currentCtc: "₹28,000 / month",
    expectedCtc: "₹38,000 / month",
    noticePeriod: "15 Days",
    joiningAvailability: "15 Days",
    willingToRelocate: "Yes",
    updatedByHrOn: "14 Oct 2026, 09:30 AM",
  },
  {
    id: "APP-009",
    name: "Simran Kaur",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "6 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 99102 33445",
    email: "simran.kaur@gmail.com",
    aiScore: 90,
    aiResult: "Eligible",
    aiAnalysisSummary: "Exceptional profile with verified high-value exhibition deal history.",
    stage: "Submitted",
    hrStatus: "On Hold",
    appliedOn: "12 Oct 2026",
    appliedTime: "02:18 PM",
    jobCode: "BOE-SALES-001",
    location: "Delhi NCR",
    currentCompany: "North Fairs India",
    currentCtc: "₹50,000 / month",
    expectedCtc: "₹62,000 / month",
    noticePeriod: "30 Days",
    joiningAvailability: "Immediate",
    willingToRelocate: "Yes",
    updatedByHrOn: "13 Oct 2026, 01:15 PM",
  },
  {
    id: "APP-010",
    name: "Aditya Mishra",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    experienceYrs: "3 Yrs Exp",
    position: "Sales Manager – Domestic Exhibition",
    department: "Sales & Sponsorships",
    phone: "+91 98908 77665",
    email: "aditya.mishra@gmail.com",
    aiScore: 71,
    aiResult: "Partial Match",
    aiAnalysisSummary: "Adequate background in general sales, limited exhibition stall management.",
    stage: "Submitted",
    hrStatus: "Not Forwarded",
    appliedOn: "12 Oct 2026",
    appliedTime: "10:40 AM",
    jobCode: "BOE-SALES-001",
    location: "Lucknow",
    currentCompany: "UP Trade Promoters",
    currentCtc: "₹32,000 / month",
    expectedCtc: "₹42,000 / month",
    noticePeriod: "30 Days",
    joiningAvailability: "30 Days",
    willingToRelocate: "Yes",
    updatedByHrOn: "13 Oct 2026, 10:00 AM",
  },
];

export default function ApplicationsAiResponsePage() {
  const [applications, setApplications] = useState<CandidateApplication[]>(INITIAL_APPLICATIONS);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateApplication | null>(
    INITIAL_APPLICATIONS[0]
  );
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

  const showToast = (icon: "success" | "info" | "warning", title: string) => {
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

  const handleForwardToHr = (app: CandidateApplication) => {
    setApplications((prev) =>
      prev.map((item) =>
        item.id === app.id
          ? { ...item, hrStatus: "Sent to HR", updatedByHrOn: new Date().toLocaleString() }
          : item
      )
    );
    if (selectedCandidate?.id === app.id) {
      setSelectedCandidate((prev) =>
        prev ? { ...prev, hrStatus: "Sent to HR", updatedByHrOn: new Date().toLocaleString() } : null
      );
    }
    showToast("success", `Application of ${app.name} forwarded to HR`);
  };

  // Badge Color Mappers
  const getAiResultBadge = (result: AIResultType) => {
    switch (result) {
      case "Eligible":
        return "bg-[#e6f4ea] text-[#137333]";
      case "Partial Match":
        return "bg-[#fef7e0] text-[#b06000]";
      case "Not Eligible":
        return "bg-[#fce8e6] text-[#c5221f]";
    }
  };

  const getStageBadge = (stage: ApplicationStageType) => {
    switch (stage) {
      case "Submitted":
        return "bg-[#e8f0fe] text-[#1a73e8]";
      case "CV Uploaded":
        return "bg-[#e0f7fa] text-[#00838f]";
      case "Incomplete":
        return "bg-[#f1f3f4] text-[#5f6368]";
    }
  };

  const getHrStatusBadge = (status: HRStatusType) => {
    switch (status) {
      case "Shortlisted":
      case "Selected":
        return "bg-[#e6f4ea] text-[#137333]";
      case "Under Review":
      case "Sent to HR":
        return "bg-[#e8f0fe] text-[#1a73e8]";
      case "Interview":
        return "bg-[#f3e8fd] text-[#8e24aa]";
      case "Rejected":
        return "bg-[#fce8e6] text-[#c5221f]";
      case "On Hold":
        return "bg-[#fef7e0] text-[#b06000]";
      case "Not Forwarded":
      default:
        return "bg-[#f1f3f4] text-[#5f6368]";
    }
  };

  return (
    <div className={`${typography.pages} min-h-screen w-full bg-[#f8fafc] text-[#1e293b] font-sans p-3 md:p-4 text-[11px]`}>
      <div className="flex flex-col lg:flex-row items-start gap-4">
        {/* =========================================================
            LEFT COLUMN (HEADER, 7 CARDS IN 1 ROW, FILTERS IN 1 ROW, TABLE)
        ========================================================= */}
        <div className="flex-1 min-w-0 space-y-2.5 w-full">
          {/* HEADER & BREADCRUMB */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[10px] font-medium text-slate-500 mb-0.5">
                Careers & Applications <span className="mx-1 text-slate-400">/</span>{" "}
                <span className="font-semibold text-slate-700">Applications & AI Response</span>
              </div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
                Applications & AI Response
              </h1>
              <p className="text-[10.5px] text-slate-500">
                Manage job applications, AI analysis results and HR status in one place.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => showToast("info", "Applications export downloaded")}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 shadow-2xs transition active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                Export
              </button>
            </div>
          </div>

          {/* METRIC / STAT CARDS ROW (Reduced Height, Sleek & Compact 7 Cards in 1 Row) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2">
            {/* Total Applications */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-500 mb-0.5">
                <FileText className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">Total Applications</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900">148</span>
                <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">↑ 12%</span>
              </div>
              <div className="text-[8.5px] text-slate-400">All time</div>
            </div>

            {/* CV Uploaded */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-500 mb-0.5">
                <Download className="w-3 h-3 text-blue-500 shrink-0" />
                <span className="truncate">CV Uploaded</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900">132</span>
                <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">↑ 89%</span>
              </div>
            </div>

            {/* Applications Submitted */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-500 mb-0.5">
                <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Applications Submitted</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900">125</span>
                <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">↑ 84%</span>
              </div>
            </div>

            {/* Eligible (AI) */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-500 mb-0.5">
                <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                <span className="truncate">Eligible (AI)</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900">62</span>
                <span className="text-[8.5px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">↑ 42%</span>
              </div>
            </div>

            {/* Partial Match */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-500 mb-0.5">
                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Partial Match</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900">38</span>
                <span className="text-[8.5px] font-bold text-amber-600 bg-amber-50 px-1 rounded">↑ 26%</span>
              </div>
            </div>

            {/* Not Eligible */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-500 mb-0.5">
                <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
                <span className="truncate">Not Eligible</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900">25</span>
                <span className="text-[8.5px] font-bold text-rose-600 bg-rose-50 px-1 rounded">↑ 17%</span>
              </div>
            </div>

            {/* Incomplete */}
            <div className="bg-white border border-slate-200 rounded-lg p-2 shadow-2xs">
              <div className="flex items-center gap-1 text-[9.5px] font-semibold text-slate-500 mb-0.5">
                <Clock3 className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">Incomplete</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900">23</span>
                <span className="text-[8.5px] font-bold text-slate-500 bg-slate-100 px-1 rounded">↑ 16%</span>
              </div>
            </div>
          </div>

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
                  <option value="Sales Manager – Domestic Exhibition">Sales Manager – Domestic Exhibition</option>
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

          {/* TABLE CONTAINER */}
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider h-8">
                    <th className="py-1.5 px-2 w-6 text-center">
                      <input
                        type="checkbox"
                        checked={
                          currentPaginatedRows.length > 0 &&
                          currentPaginatedRows.every((r) => selectedIds.includes(r.id))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3 h-3"
                      />
                    </th>
                    <th className="py-1.5 px-2 whitespace-nowrap">Candidate Name</th>
                    <th className="py-1.5 px-2 whitespace-nowrap">Position</th>
                    <th className="py-1.5 px-2 whitespace-nowrap">Contact</th>
                    <th className="py-1.5 px-2 whitespace-nowrap">AI Score</th>
                    <th className="py-1.5 px-2 whitespace-nowrap">AI Result</th>
                    <th className="py-1.5 px-2 whitespace-nowrap">Application Stage</th>
                    <th className="py-1.5 px-2 whitespace-nowrap">HR Status</th>
                    <th className="py-1.5 px-2 whitespace-nowrap flex items-center gap-1">
                      Applied On <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </th>
                    <th className="py-1.5 px-2 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[10.5px]">
                  {currentPaginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-6 text-center text-slate-400">
                        No applications found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    currentPaginatedRows.map((app) => {
                      const isSelected = selectedCandidate?.id === app.id;
                      return (
                        <tr
                          key={app.id}
                          onClick={() => setSelectedCandidate(app)}
                          className={`cursor-pointer transition hover:bg-slate-50/90 h-11 ${isSelected ? "bg-[#f0fdf4]" : ""
                            }`}
                        >
                          {/* Checkbox */}
                          <td className="py-1.5 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(app.id)}
                              onChange={(e) => handleSelectOne(app.id, e.target.checked)}
                              className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-3 h-3"
                            />
                          </td>

                          {/* Candidate Name */}
                          <td className="py-1.5 px-2 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <img
                                src={app.avatar}
                                alt={app.name}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                              <div className="leading-tight">
                                <div className="font-bold text-slate-900">{app.name}</div>
                                <div className="text-[9.5px] text-slate-400 font-medium">{app.experienceYrs}</div>
                              </div>
                            </div>
                          </td>

                          {/* Position */}
                          <td className="py-1.5 px-2 max-w-[170px]">
                            <div className="font-semibold text-slate-800 truncate" title={app.position}>
                              {app.position}
                            </div>
                            <div className="text-[9.5px] text-slate-400 truncate">{app.department}</div>
                          </td>

                          {/* Contact */}
                          <td className="py-1.5 px-2 whitespace-nowrap">
                            <div className="font-medium text-slate-800">{app.phone}</div>
                            <div className="text-[9.5px] text-slate-400">{app.email}</div>
                          </td>

                          {/* AI Score */}
                          <td className="py-1.5 px-2 whitespace-nowrap">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${app.aiScore >= 80
                                  ? "bg-emerald-100 text-emerald-800"
                                  : app.aiScore >= 60
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                            >
                              {app.aiScore}%
                            </span>
                          </td>

                          {/* AI Result */}
                          <td className="py-1.5 px-2 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-semibold ${getAiResultBadge(
                                app.aiResult
                              )}`}
                            >
                              {app.aiResult}
                            </span>
                          </td>

                          {/* Application Stage */}
                          <td className="py-1.5 px-2 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-semibold ${getStageBadge(
                                app.stage
                              )}`}
                            >
                              {app.stage}
                            </span>
                          </td>

                          {/* HR Status */}
                          <td className="py-1.5 px-2 whitespace-nowrap">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-semibold ${getHrStatusBadge(
                                app.hrStatus
                              )}`}
                            >
                              {app.hrStatus}
                            </span>
                          </td>

                          {/* Applied On */}
                          <td className="py-1.5 px-2 text-slate-600 text-[10px] whitespace-nowrap leading-tight">
                            <div>{app.appliedOn}</div>
                            <div className="text-slate-400 text-[9px]">{app.appliedTime}</div>
                          </td>

                          {/* Action */}
                          <td className="py-1.5 px-2 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => setSelectedCandidate(app)}
                                className="px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 border border-blue-300 bg-blue-50/50 hover:bg-blue-100 rounded transition"
                              >
                                View
                              </button>
                              <button
                                type="button"
                                onClick={() => showToast("info", `Options for ${app.name}`)}
                                className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition"
                              >
                                <MoreVertical className="w-3.5 h-3.5" />
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

            {/* PAGINATION FOOTER */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-2.5 bg-slate-50 border-t border-slate-200 text-[10px] font-medium text-slate-600">
              <div>
                Showing {filteredApplications.length > 0 ? startIndex + 1 : 0} to {endIndex} of{" "}
                {filteredApplications.length} applications
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`w-5 h-5 rounded text-[10px] font-semibold ${currentPage === page
                          ? "bg-[#0f766e] text-white"
                          : "bg-white border border-slate-300 hover:bg-slate-100 text-slate-700"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1 border border-slate-300 rounded bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[10px] text-slate-700 font-medium outline-none"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
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
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CANDIDATE DETAILS</span>
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
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h2 className="text-xs font-bold text-slate-900 truncate">{selectedCandidate.name}</h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold shrink-0 ${getAiResultBadge(
                        selectedCandidate.aiResult
                      )}`}
                    >
                      Eligible ({selectedCandidate.aiScore}%)
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-slate-800 leading-tight mt-0.5 truncate">
                    {selectedCandidate.position}
                  </p>
                  <p className="text-[9.5px] text-slate-400 truncate">{selectedCandidate.department}</p>
                </div>
              </div>

              {/* Contact Icons Table */}
              <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="flex items-center gap-1.5 truncate">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedCandidate.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedCandidate.email}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedCandidate.location}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedCandidate.experienceYrs}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleForwardToHr(selectedCandidate)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#0f766e] hover:bg-[#0d655e] text-white rounded text-[11px] font-bold transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  Forward to HR
                </button>
                <button
                  type="button"
                  onClick={() => showToast("success", "CV Download started")}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded text-[11px] font-bold transition active:scale-95 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
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
              {activeDrawerTab === "Overview" && (
                <>
                  {/* Application Details */}
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1.5 text-[11px]">Application Details</h3>
                    <div className="space-y-1.5 text-slate-600 bg-slate-50/70 p-2.5 rounded border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Applied On</span>
                        <span className="font-semibold text-slate-800">
                          {selectedCandidate.appliedOn}, {selectedCandidate.appliedTime}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Application Stage</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-semibold ${getStageBadge(
                            selectedCandidate.stage
                          )}`}
                        >
                          {selectedCandidate.stage}
                        </span>
                      </div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-slate-400 shrink-0">Job Position</span>
                        <span className="font-semibold text-slate-800 text-right">
                          {selectedCandidate.position}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Job Code</span>
                        <span className="font-mono font-semibold text-slate-800">{selectedCandidate.jobCode}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Analysis */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-slate-900 text-[11px]">AI Analysis</h3>
                      <button
                        type="button"
                        onClick={() => showToast("info", "Opening AI report")}
                        className="text-[10px] font-semibold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        View Full Analysis <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-lg p-2.5 flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-full border-4 border-emerald-600 flex items-center justify-center bg-white shrink-0">
                        <span className="text-[11px] font-extrabold text-emerald-800">
                          {selectedCandidate.aiScore}%
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-emerald-900 text-xs">Eligible Match</div>
                        <p className="text-[10px] text-emerald-700 leading-snug mt-0.5">
                          "{selectedCandidate.aiAnalysisSummary}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* HR Status */}
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1.5 text-[11px]">HR Status</h3>
                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-100">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${getHrStatusBadge(
                          selectedCandidate.hrStatus
                        )}`}
                      >
                        {selectedCandidate.hrStatus}
                      </span>
                      <span className="text-[9.5px] text-slate-400">
                        Updated by HR • {selectedCandidate.updatedByHrOn || "18 Oct 2026, 02:10 PM"}
                      </span>
                    </div>
                  </div>

                  {/* Key Information */}
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1.5 text-[11px]">Key Information</h3>
                    <div className="space-y-2 text-slate-600">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Building2 className="w-3.5 h-3.5" /> Current Company
                        </span>
                        <span className="font-semibold text-slate-800">{selectedCandidate.currentCompany}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <DollarSign className="w-3.5 h-3.5" /> Current CTC
                        </span>
                        <span className="font-semibold text-slate-800">{selectedCandidate.currentCtc}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <TrendingUp className="w-3.5 h-3.5" /> Expected CTC
                        </span>
                        <span className="font-semibold text-slate-800">{selectedCandidate.expectedCtc}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5" /> Notice Period
                        </span>
                        <span className="font-semibold text-slate-800">{selectedCandidate.noticePeriod}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <UserCheck className="w-3.5 h-3.5" /> Joining Availability
                        </span>
                        <span className="font-semibold text-slate-800">{selectedCandidate.joiningAvailability}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <MapPin className="w-3.5 h-3.5" /> Willing to Relocate
                        </span>
                        <span className="font-semibold text-slate-800">{selectedCandidate.willingToRelocate}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeDrawerTab === "Application" && (
                <div className="space-y-2.5 text-slate-700">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                    <p className="font-bold text-slate-900">Resume File</p>
                    <p className="text-slate-500 text-[10px] mb-2">Priya_Sharma_Resume.pdf (1.8 MB)</p>
                    <button
                      type="button"
                      onClick={() => showToast("success", "Downloading resume...")}
                      className="px-2.5 py-1 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition text-[10px]"
                    >
                      View Resume PDF
                    </button>
                  </div>
                </div>
              )}

              {activeDrawerTab === "AI Analysis" && (
                <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900">
                  <p className="font-bold">Key Strengths Detected:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-emerald-800">
                    <li>5+ Years in Domestic Exhibition Sales</li>
                    <li>Proven track record in stall bookings</li>
                  </ul>
                </div>
              )}

              {activeDrawerTab === "HR Status" && (
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 block">Update Status:</label>
                  <select
                    value={selectedCandidate.hrStatus}
                    onChange={(e) => {
                      const next = e.target.value as HRStatusType;
                      setApplications((prev) =>
                        prev.map((item) =>
                          item.id === selectedCandidate.id ? { ...item, hrStatus: next } : item
                        )
                      );
                      setSelectedCandidate((prev) => (prev ? { ...prev, hrStatus: next } : null));
                      showToast("success", `HR status updated to ${next}`);
                    }}
                    className="w-full p-2 border border-slate-300 rounded font-medium text-slate-800 bg-white"
                  >
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Interview">Interview</option>
                    <option value="Sent to HR">Sent to HR</option>
                    <option value="Selected">Selected</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Not Forwarded">Not Forwarded</option>
                  </select>
                </div>
              )}

              {activeDrawerTab === "Activity" && (
                <div className="space-y-1 text-slate-600">
                  <div className="border-l-2 border-blue-500 pl-2 py-1">
                    <p className="font-semibold text-slate-800">Application Received</p>
                    <p className="text-[9.5px] text-slate-400">17 Oct 2026, 11:24 AM</p>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Action Footer */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => showToast("info", "Opening full application detail view")}
                className="flex-1 py-1.5 px-2 text-center text-[10.5px] font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition"
              >
                View Full Application
              </button>
              <button
                type="button"
                onClick={() => showToast("info", "Note added")}
                className="flex-1 py-1.5 px-2 text-center text-[10.5px] font-bold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition"
              >
                Add Note
              </button>
            </div>
          </div>
        )}
      </div>
      <Suspense fallback={null}>
        <ModalHandler />
      </Suspense>
    </div>
  );
}
