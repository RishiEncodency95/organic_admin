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

  const applyCardFilter = (apply: () => void) => {
    handleResetFilters();
    apply();
    setCurrentPage(1);
  };

  const statCards: KpiStatCardItem[] = [
    {
      title: "TOTAL APPLICATIONS",
      value: 148,
      trend: "↑ 12%",
      icon: FileText,
      tone: "blue",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
      borderColor: "#bae6fd",
      numColor: "#0284c7",
      footer: "View all applications",
      onClick: handleResetFilters,
    },
    {
      title: "CV UPLOADED",
      value: 132,
      trend: "↑ 89%",
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
      value: 125,
      trend: "↑ 84%",
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
      value: 62,
      trend: "↑ 42%",
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
      value: 38,
      trend: "↑ 26%",
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
      value: 25,
      trend: "↑ 17%",
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
      value: 23,
      trend: "↑ 16%",
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
            onClick={() => showToast("info", "Applications export downloaded")}
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
                        No applications match your filter criteria.
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
                              <img
                                src={app.avatar}
                                alt={app.name}
                                className="h-[32px] w-[32px] shrink-0 rounded-full border-[2px] border-white object-cover"
                                style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1.5px #e2e8f0" }}
                              />
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
                                onClick={() => setSelectedCandidate(app)}
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
                <img
                  src={selectedCandidate.avatar}
                  alt={selectedCandidate.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                />
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
                  onClick={() => showToast("success", "CV Download started")}
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
                        onClick={() => showToast("info", "Opening AI report")}
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
                        Updated by HR •{" "}
                        <span className="font-semibold text-[#293681]">
                          {selectedCandidate.updatedByHrOn || "18 Oct 2026, 02:10 PM"}
                        </span>
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
                          <span className={`font-semibold ${valueColor}`}>{value}</span>
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
                className="flex-1 py-1.5 px-2 text-center text-[10px] font-bold text-white bg-[#233D4D] rounded hover:bg-[#1a2e3a] transition active:scale-95"
              >
                View Full Application
              </button>
              <button
                type="button"
                onClick={() => showToast("info", "Note added")}
                className="flex-1 py-1.5 px-2 text-center text-[10px] font-bold text-white bg-[#0f766e] rounded hover:bg-[#0d655e] transition active:scale-95"
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
