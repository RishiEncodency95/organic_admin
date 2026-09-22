"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  ExternalLink,
  Headphones,
  MapPin,
  MousePointerClick,
  Plus,
  ScanSearch,
  Settings2,
  Sprout,
  UploadCloud,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import typography from "../pages/PagesTypography.module.css";

/* =========================================================
   MOCK DATA
   No careers analytics backend exists yet - this page is the
   UI shell wired to static data shaped like the real thing,
   so swapping in a careersApi later only touches the source.
========================================================= */

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2200,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
});

function notImplemented(action: string) {
  Toast.fire({ icon: "info", iconColor: "#38bdf8", title: `${action} — coming soon` });
}

const toneClass = {
  slate: "bg-slate-50 text-slate-700 ring-slate-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  teal: "bg-teal-50 text-teal-700 ring-teal-200",
} as const;

interface StatCardItem {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone: keyof typeof toneClass;
  gradient: string;
  borderColor: string;
  numColor: string;
  trend: string;
  footer: string;
  onClick: () => void;
}

const STAT_CARDS: StatCardItem[] = [
  {
    title: "ACTIVE JOBS",
    value: 6,
    icon: Briefcase,
    tone: "slate",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #e2e8f0 100%)",
    borderColor: "#e2e8f0",
    numColor: "#334155",
    trend: "↑ 20%",
    footer: "View job postings",
    onClick: () => notImplemented("Job postings"),
  },
  {
    title: "CAREER PAGE VIEWS",
    value: "4,820",
    icon: Eye,
    tone: "blue",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
    borderColor: "#bae6fd",
    numColor: "#0284c7",
    trend: "↑ 32%",
    footer: "View page analytics",
    onClick: () => notImplemented("Page view analytics"),
  },
  {
    title: "APPLY CLICKS",
    value: 326,
    icon: MousePointerClick,
    tone: "violet",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ddd6fe 100%)",
    borderColor: "#ddd6fe",
    numColor: "#6d28d9",
    trend: "↑ 18%",
    footer: "View click analytics",
    onClick: () => notImplemented("Apply click analytics"),
  },
  {
    title: "CV UPLOADS",
    value: 214,
    icon: UploadCloud,
    tone: "indigo",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #c7d2fe 100%)",
    borderColor: "#c7d2fe",
    numColor: "#4338ca",
    trend: "↑ 26%",
    footer: "View uploads",
    onClick: () => notImplemented("CV uploads"),
  },
  {
    title: "AI CHECKED",
    value: 208,
    icon: ScanSearch,
    tone: "cyan",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #a5f3fc 100%)",
    borderColor: "#a5f3fc",
    numColor: "#0e7490",
    trend: "↑ 24%",
    footer: "View AI screening",
    onClick: () => notImplemented("AI screening results"),
  },
  {
    title: "ELIGIBLE",
    value: 126,
    icon: CheckCircle2,
    tone: "emerald",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
    borderColor: "#bbf7d0",
    numColor: "#15803d",
    trend: "↑ 28%",
    footer: "View eligible candidates",
    onClick: () => notImplemented("Eligible candidates"),
  },
  {
    title: "PARTIAL MATCH",
    value: 47,
    icon: AlertTriangle,
    tone: "amber",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
    borderColor: "#fed7aa",
    numColor: "#c2410c",
    trend: "↑ 12%",
    footer: "View partial matches",
    onClick: () => notImplemented("Partial match candidates"),
  },
  {
    title: "NOT ELIGIBLE",
    value: 35,
    icon: XCircle,
    tone: "rose",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
    borderColor: "#fecdd3",
    numColor: "#be123c",
    trend: "↓ 8%",
    footer: "View not eligible",
    onClick: () => notImplemented("Not eligible candidates"),
  },
  {
    title: "APPLICATIONS SUBMITTED",
    value: 98,
    icon: ClipboardList,
    tone: "teal",
    gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #99f6e4 100%)",
    borderColor: "#99f6e4",
    numColor: "#0f766e",
    trend: "↑ 22%",
    footer: "View applications",
    onClick: () => notImplemented("Applications list"),
  },
];

interface FunnelStage {
  label: string;
  value: string;
  pct: string;
  barWidth: number;
  color: string;
}

const FUNNEL_STAGES: FunnelStage[] = [
  { label: "Career Page Views", value: "4,820", pct: "100%", barWidth: 100, color: "#1f6f4a" },
  { label: "Job Detail Views", value: "2,960", pct: "61%", barWidth: 85, color: "#2f9e63" },
  { label: "Apply Clicks", value: "326", pct: "6.8%", barWidth: 38, color: "#7fc79a" },
  { label: "CV Uploads", value: "214", pct: "4.4%", barWidth: 32, color: "#a8dab5" },
  { label: "AI Checked", value: "208", pct: "4.3%", barWidth: 30, color: "#bfe4c8" },
  { label: "Eligible (≥ 60%)", value: "126", pct: "2.6%", barWidth: 20, color: "#dff2e3" },
  { label: "Partial Match (50–59%)", value: "47", pct: "1.0%", barWidth: 15, color: "#fde68a" },
  { label: "Not Eligible (< 50%)", value: "35", pct: "0.7%", barWidth: 13, color: "#fecaca" },
  { label: "Applications Submitted", value: "98", pct: "2.0%", barWidth: 26, color: "#93c5fd" },
];

const PERFORMANCE_DATA = [
  { month: "Aug 2026", pageViews: 720, applyClicks: 360, cvUploads: 260 },
  { month: "Sep 2026", pageViews: 1180, applyClicks: 610, cvUploads: 410 },
  { month: "Oct 2026", pageViews: 1300, applyClicks: 670, cvUploads: 455 },
  { month: "Nov 2026", pageViews: 1420, applyClicks: 705, cvUploads: 480 },
  { month: "Dec 2026", pageViews: 1380, applyClicks: 690, cvUploads: 465 },
];

interface DonutSlice {
  key: string;
  label: string;
  value: number;
  pct: string;
  color: string;
}

const AI_SCREENING_TOTAL = 208;
const AI_SCREENING_SLICES: DonutSlice[] = [
  { key: "eligible", label: "Eligible (60%+)", value: 126, pct: "60.6%", color: "#16a34a" },
  { key: "partial", label: "Partial Match (50-59%)", value: 47, pct: "22.6%", color: "#f59e0b" },
  { key: "not-eligible", label: "Not Eligible (< 50%)", value: 35, pct: "16.8%", color: "#ef4444" },
];

const TOP_LOCATIONS = [
  { city: "Delhi NCR", count: 62 },
  { city: "Bengaluru", count: 18 },
  { city: "Mumbai", count: 12 },
  { city: "Hyderabad", count: 10 },
  { city: "Others", count: 8 },
];

const QUICK_ACTIONS: { label: string; icon: LucideIcon; href?: string }[] = [
  { label: "Add New Job Posting", icon: Plus, href: "/job-postings/create" },
  { label: "Manage Job Postings", icon: Briefcase, href: "/job-postings" },
  { label: "View Applications", icon: Users, href: "/applications-ai-response" },
  { label: "Career Settings", icon: Settings2, href: "/career-settings" },
  { label: "View Career Page", icon: ExternalLink },
];

type ApplicationResult = "Eligible" | "Partial Match" | "Not Eligible";
type ApplicationStatus = "Completed" | "Not Applied";

interface ApplicationRow {
  id: number;
  name: string;
  position: string;
  appliedOn: string;
  matchScore: number;
  result: ApplicationResult;
  status: ApplicationStatus;
  source: string;
  avatarColor: string;
}

const RESULT_STYLES: Record<ApplicationResult, string> = {
  Eligible: "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]",
  "Partial Match": "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]",
  "Not Eligible": "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]",
};

const LATEST_APPLICATIONS: ApplicationRow[] = [
  { id: 1, name: "Priya Singh", position: "Sales Manager", appliedOn: "16 Sep 2026", matchScore: 82, result: "Eligible", status: "Completed", source: "Website", avatarColor: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Rahul Mehta", position: "Sales Manager", appliedOn: "15 Sep 2026", matchScore: 58, result: "Partial Match", status: "Completed", source: "LinkedIn", avatarColor: "bg-violet-100 text-violet-700" },
  { id: 3, name: "Neha Verma", position: "Marketing Executive", appliedOn: "14 Sep 2026", matchScore: 38, result: "Not Eligible", status: "Not Applied", source: "Website", avatarColor: "bg-amber-100 text-amber-700" },
  { id: 4, name: "Amit Kumar", position: "Business Development", appliedOn: "14 Sep 2026", matchScore: 66, result: "Eligible", status: "Completed", source: "Naukri", avatarColor: "bg-emerald-100 text-emerald-700" },
  { id: 5, name: "Sneha Kapoor", position: "Event Coordinator", appliedOn: "13 Sep 2026", matchScore: 72, result: "Eligible", status: "Completed", source: "Indeed", avatarColor: "bg-rose-100 text-rose-700" },
];

/* =========================================================
   ANIMATED COUNTER (matches Job Postings page's counter)
========================================================= */

function AnimatedCounter({ value, duration = 1200 }: { value: string | number; duration?: number }) {
  const strVal = String(value);
  const numericMatch = strVal.match(/^([^0-9]*)([0-9.,]+)([^0-9]*)$/);
  const prefix = numericMatch?.[1] ?? "";
  const suffix = numericMatch?.[3] ?? "";
  const rawNumberStr = numericMatch ? numericMatch[2].replace(/,/g, "") : "";
  const targetNum = numericMatch ? parseFloat(rawNumberStr) : NaN;
  const hasComma = numericMatch ? numericMatch[2].includes(",") : false;
  const decimalPlaces = (rawNumberStr.split(".")[1] || "").length;
  const canAnimate = Boolean(numericMatch) && !isNaN(targetNum) && targetNum !== 0;

  const [displayValue, setDisplayValue] = useState<string>(() =>
    canAnimate ? `${prefix}0${suffix}` : strVal
  );
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!canAnimate) return;

    let animationFrameId: number | null = null;

    const startCounting = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      let startTime: number | null = null;

      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentNum = targetNum * easeProgress;
        let formattedNum = currentNum.toFixed(decimalPlaces);

        if (hasComma) {
          const parts = formattedNum.split(".");
          parts[0] = parseInt(parts[0], 10).toLocaleString();
          formattedNum = parts.join(".");
        }

        setDisplayValue(`${prefix}${formattedNum}${suffix}`);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(step);
        }
      };

      animationFrameId = requestAnimationFrame(step);
    };

    if (typeof IntersectionObserver !== "undefined") {
      const el = spanRef.current;
      if (!el) {
        startCounting();
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounting();
            } else {
              setDisplayValue(`${prefix}0${suffix}`);
            }
          });
        },
        { threshold: 0.15 }
      );

      observer.observe(el);

      return () => {
        observer.disconnect();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    } else {
      startCounting();
      return () => {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
      };
    }
  }, [duration, canAnimate, prefix, suffix, targetNum, hasComma, decimalPlaces]);

  return <span ref={spanRef}>{displayValue}</span>;
}

/* =========================================================
   CARD WRAPPER
========================================================= */

function Card({
  title,
  right,
  children,
  className = "",
  noPadding = false,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div className={`border border-[#e8e5df] bg-white ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-[#f0f0ec] px-[12px] py-[9px]">
          <h2 className="text-[11px] font-bold text-[#263148]">{title}</h2>
          {right}
        </div>
      )}
      <div className={noPadding ? "" : "p-[12px]"}>{children}</div>
    </div>
  );
}

/* =========================================================
   LINE CHART TOOLTIP
========================================================= */

function PerformanceTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-[6px] border border-[#e5e6e2] bg-white px-[9px] py-[7px] text-[9px] shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
      <p className="mb-1 font-bold text-[#263148]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-1.5 font-semibold text-[#334155]">
          <span className="h-[6px] w-[6px] rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
}

/* =========================================================
   CAREER DASHBOARD PAGE
========================================================= */

export default function CareerDashboardPage() {
  const maxLocationCount = Math.max(...TOP_LOCATIONS.map((l) => l.count));

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-[14px] flex flex-wrap items-start justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[10px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">
              Careers Dashboard
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Monitor performance and response for your career pages and job postings.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={() => notImplemented("Date range picker")}
              className="flex h-[30px] items-center gap-[6px] rounded-[6px] border border-[#e5e6e2] bg-white px-[10px] text-[9px] font-semibold text-[#334155] hover:bg-slate-50"
            >
              <CalendarDays className="h-[12px] w-[12px] text-[#64748b]" />
              01 Aug 2026 – 17 Sep 2026
              <ChevronDown className="h-[11px] w-[11px] text-[#64748b]" />
            </button>
          </div>
        </div>

        {/* =================================================
            STATS ROW
        ================================================= */}
        <div className="mb-[12px] grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-9">
          {STAT_CARDS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="relative flex h-[76px] flex-col overflow-hidden rounded-[10px] border border-[#e5e7e6] bg-white p-1.5 !pb-4 transition-all hover:translate-y-[-1px]"
                style={{
                  background: item.gradient,
                  borderColor: item.borderColor || undefined,
                  boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <div className="flex items-start gap-1.5">
                  <div
                    className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full ring-1 bg-white/80 shadow-xs ${toneClass[item.tone]}`}
                  >
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-[7.6px] !font-semibold leading-tight tracking-[0.01em] text-slate-900"
                      style={{ fontWeight: 600, color: "#0f172a" }}
                    >
                      {item.title}
                    </p>

                    <div className="mt-1 flex items-end justify-between">
                      <span
                        className="text-[14.5px] !font-semibold leading-none tracking-[-0.04em]"
                        style={{ color: item.numColor, fontWeight: 600 }}
                      >
                        <AnimatedCounter value={item.value} />
                      </span>

                      <span
                        className={`mb-0.5 text-[6.7px] font-bold ${item.trend.startsWith("↓") ? "text-[#dc2626]" : "text-[#16a34a]"}`}
                      >
                        {item.trend}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  onClick={item.onClick}
                  className="absolute bottom-1 left-1.5 right-1.5 flex cursor-pointer items-center justify-center gap-1 text-[7.6px] font-semibold text-[#293957] transition hover:text-blue-600"
                >
                  {item.footer}
                  <ArrowRight className="h-2.5 w-2.5" />
                </div>
              </div>
            );
          })}
        </div>

        {/* =================================================
            MAIN GRID
        ================================================= */}
        <div className="grid flex-1 grid-cols-1 items-start gap-[10px] xl:grid-cols-[minmax(0,2.6fr)_minmax(260px,1fr)]">
          {/* =============================================
              LEFT: MAIN COLUMN
          ============================================= */}
          <div className="flex min-w-0 flex-col gap-[10px]">
            <div className="grid grid-cols-1 gap-[10px] lg:grid-cols-2">
              {/* APPLICATION FUNNEL */}
              <Card title="Application Funnel">
                <p className="-mt-[7px] mb-[10px] text-[8px] font-semibold text-[#2563eb]">
                  From page view to application submission
                </p>
                <div className="flex flex-col gap-[7px]">
                  {FUNNEL_STAGES.map((stage) => (
                    <div key={stage.label} className="grid grid-cols-[104px_1fr_46px] items-center gap-[8px]">
                      <span className="truncate text-[8px] font-semibold text-[#334155]">{stage.label}</span>
                      <div className="h-[14px] w-full overflow-hidden rounded-[3px] bg-[#f4f4f1]">
                        <div
                          className="h-full rounded-[3px]"
                          style={{ width: `${stage.barWidth}%`, backgroundColor: stage.color }}
                        />
                      </div>
                      <span className="text-right text-[8px] font-bold text-[#263148]">
                        {stage.value} <span className="font-medium text-[#8a92a0]">({stage.pct})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* RIGHT: PERFORMANCE + AI SCREENING */}
              <div className="flex flex-col gap-[10px]">
                <Card
                  title="Career Page Performance"
                  right={
                    <button
                      type="button"
                      onClick={() => notImplemented("Chart range filter")}
                      className="flex items-center gap-1 text-[8.5px] font-semibold text-[#334155] hover:text-[#166b40]"
                    >
                      Monthly
                      <ChevronDown className="h-[11px] w-[11px]" />
                    </button>
                  }
                >
                  <div className="mb-[8px] flex items-center gap-[12px] text-[7.5px] font-semibold text-[#334155]">
                    <span className="flex items-center gap-1">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#16a34a]" /> Page Views
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#2563eb]" /> Apply Clicks
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="h-[6px] w-[6px] rounded-full bg-[#f59e0b]" /> CV Uploads
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={168}>
                    <LineChart data={PERFORMANCE_DATA} margin={{ top: 4, right: 6, bottom: 0, left: -18 }}>
                      <CartesianGrid vertical={false} stroke="#eef0ec" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#8a92a0", fontSize: 9, fontWeight: 600 }}
                      />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8a92a0", fontSize: 9, fontWeight: 600 }} width={44} />
                      <Tooltip content={<PerformanceTooltip />} cursor={{ stroke: "#e5e6e2" }} />
                      <Line type="monotone" dataKey="pageViews" name="Page Views" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: "#16a34a" }} />
                      <Line type="monotone" dataKey="applyClicks" name="Apply Clicks" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: "#2563eb" }} />
                      <Line type="monotone" dataKey="cvUploads" name="CV Uploads" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>

                <Card title="AI Screening Results">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-[12px]">
                    <div className="relative mx-auto h-[100px] w-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={AI_SCREENING_SLICES}
                            dataKey="value"
                            nameKey="label"
                            innerRadius="62%"
                            outerRadius="98%"
                            paddingAngle={2}
                            strokeWidth={0}
                          >
                            {AI_SCREENING_SLICES.map((slice) => (
                              <Cell key={slice.key} fill={slice.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <div className="text-center">
                          <p className="text-[16px] font-bold leading-none text-[#18233b]">
                            <AnimatedCounter value={AI_SCREENING_TOTAL} />
                          </p>
                          <p className="mt-0.5 text-[7px] font-semibold text-[#8a92a0]">Total</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[7px]">
                      {AI_SCREENING_SLICES.map((slice) => (
                        <div key={slice.key} className="flex items-center gap-[6px]">
                          <span className="h-[8px] w-[8px] shrink-0 rounded-full" style={{ backgroundColor: slice.color }} />
                          <span className="min-w-0 flex-1 truncate text-[8.5px] font-semibold text-[#334155]">
                            {slice.label}
                          </span>
                          <span className="shrink-0 text-[8.5px] font-bold text-[#263148]">
                            {slice.value} <span className="font-medium text-[#8a92a0]">({slice.pct})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* =============================================
                LATEST APPLICATIONS
            ============================================= */}
            <Card
              title="Latest Applications"
              right={
                <Link
                  href="/applications-ai-response"
                  className="flex items-center gap-1 text-[8.5px] font-bold text-[#293681] hover:text-[#4B1426]"
                >
                  View All
                  <ArrowRight className="h-[11px] w-[11px]" />
                </Link>
              }
              noPadding
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left">
                  <thead>
                    <tr className="h-[28px] border-b border-[#e8e5df] bg-[#233D4D]">
                      <th className="w-[26px] px-[8px] py-[5px] text-[7px] font-bold text-white uppercase">#</th>
                      <th className="px-[8px] py-[5px] text-[7px] font-bold text-white uppercase">Candidate Name</th>
                      <th className="px-[8px] py-[5px] text-[7px] font-bold text-white uppercase">Job Position</th>
                      <th className="px-[8px] py-[5px] text-[7px] font-bold text-white uppercase">Applied On</th>
                      <th className="px-[8px] py-[5px] text-[7px] font-bold text-white uppercase">Match Score</th>
                      <th className="px-[8px] py-[5px] text-[7px] font-bold text-white uppercase">Result</th>
                      <th className="px-[8px] py-[5px] text-[7px] font-bold text-white uppercase">App. Status</th>
                      <th className="px-[8px] py-[5px] text-[7px] font-bold text-white uppercase">Source</th>
                      <th className="px-[8px] py-[5px] text-right text-[7px] font-bold text-white uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f0f0ec]">
                    {LATEST_APPLICATIONS.map((app, index) => (
                      <tr key={app.id} className="transition hover:bg-slate-50/80">
                        <td className="px-[8px] py-[7px] text-[7.5px] font-semibold text-[#6c7587]">{index + 1}</td>
                        <td className="px-[8px] py-[7px]">
                          <div className="flex items-center gap-[7px]">
                            <span
                              className={`grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-[7.5px] font-bold ${app.avatarColor}`}
                            >
                              {app.name.charAt(0)}
                            </span>
                            <span className="truncate text-[7.8px] font-bold text-[#18233b]">{app.name}</span>
                          </div>
                        </td>
                        <td className="px-[8px] py-[7px] truncate text-[7.8px] font-medium text-[#334155]">{app.position}</td>
                        <td className="px-[8px] py-[7px] truncate text-[7.8px] font-medium text-[#334155]">{app.appliedOn}</td>
                        <td className="px-[8px] py-[7px]">
                          <span
                            className={`text-[7.8px] font-bold ${app.matchScore >= 60 ? "text-[#16a34a]" : app.matchScore >= 50 ? "text-[#b78103]" : "text-[#c62828]"}`}
                          >
                            {app.matchScore}%
                          </span>
                        </td>
                        <td className="px-[8px] py-[7px]">
                          <span className={`inline-flex h-[19px] items-center rounded-[4px] px-[7px] text-[7px] font-bold ${RESULT_STYLES[app.result]}`}>
                            {app.result}
                          </span>
                        </td>
                        <td className="px-[8px] py-[7px]">
                          <span className={`text-[7.5px] font-bold ${app.status === "Completed" ? "text-[#166534]" : "text-[#94a3b8]"}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-[8px] py-[7px] truncate text-[7.8px] font-medium text-[#334155]">{app.source}</td>
                        <td className="px-[8px] py-[7px]">
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              title="View Application"
                              onClick={() => notImplemented(`View "${app.name}"`)}
                              className="flex h-[24px] w-[24px] items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-400/30 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:bg-orange-500/20 hover:border-orange-400/50 hover:scale-105 active:scale-95"
                            >
                              <Eye className="h-[12px] w-[12px] text-orange-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* =============================================
              RIGHT: SIDEBAR
          ============================================= */}
          <div className="flex flex-col gap-[10px]">
            {/* PROMO PANEL */}
            <div className="border border-[#e7e7e3] bg-white p-[12px]">
              <div className="relative h-[100px] w-full overflow-hidden rounded-[6px]">
                <Image src="/career.png" alt="People, Ideas, Partnerships for a Greener Tomorrow" fill className="object-cover" />
              </div>

              <div className="mt-[9px] flex items-start gap-[8px] rounded-[6px] bg-[#eef6f1] p-[9px]">
                <span className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full bg-white text-[#23714a] shadow-2xs">
                  <Sprout className="h-[11px] w-[11px]" />
                </span>
                <p className="text-[8px] font-semibold italic leading-snug text-[#23471d]">
                  &ldquo;The right people build a brighter tomorrow.&rdquo;
                </p>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="border border-[#e7e7e3] bg-white p-[12px]">
              <h2 className="mb-[8px] text-[11px] font-bold text-[#263148]">Quick Actions</h2>
              <div className="flex flex-col gap-[2px]">
                {QUICK_ACTIONS.map(({ label, icon: Icon, href }) => {
                  if (href) {
                    return (
                      <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-[8px] rounded-[4px] px-[6px] py-[7px] text-left text-[9.5px] font-semibold text-[#334155] transition hover:bg-slate-50"
                      >
                        <Icon className="h-[13px] w-[13px] text-[#218DAE]" />
                        {label}
                        <ArrowRight className="ml-auto h-[11px] w-[11px] text-[#c2c7d0]" />
                      </Link>
                    );
                  }
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => notImplemented(label)}
                      className="flex items-center gap-[8px] rounded-[4px] px-[6px] py-[7px] text-left text-[9.5px] font-semibold text-[#334155] transition hover:bg-slate-50"
                    >
                      <Icon className="h-[13px] w-[13px] text-[#218DAE]" />
                      {label}
                      <ArrowRight className="ml-auto h-[11px] w-[11px] text-[#c2c7d0]" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TOP JOB LOCATIONS */}
            <div className="border border-[#e7e7e3] bg-white p-[12px]">
              <h2 className="mb-[9px] flex items-center gap-[6px] text-[11px] font-bold text-[#263148]">
                <MapPin className="h-[12px] w-[12px] text-[#166b40]" />
                Top Job Locations <span className="font-medium text-[#8a92a0]">(by applications)</span>
              </h2>
              <div className="flex flex-col gap-[8px]">
                {TOP_LOCATIONS.map((loc) => (
                  <div key={loc.city} className="grid grid-cols-[74px_1fr_24px] items-center gap-[8px]">
                    <span className="truncate text-[8.5px] font-semibold text-[#334155]">{loc.city}</span>
                    <div className="h-[7px] w-full overflow-hidden rounded-full bg-[#f0f0ec]">
                      <div
                        className="h-full rounded-full bg-[#166b40]"
                        style={{ width: `${(loc.count / maxLocationCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-right text-[8.5px] font-bold text-[#263148]">{loc.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* NEED HELP */}
            <div className="flex items-start gap-[9px] rounded-[6px] bg-[#eef6f1] p-[11px]">
              <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-white text-[#23714a] shadow-2xs">
                <Headphones className="h-[13px] w-[13px]" />
              </span>
              <div className="min-w-0">
                <p className="text-[9.5px] font-bold text-[#23471d]">Need Help?</p>
                <p className="mt-0.5 text-[8px] font-medium leading-snug text-[#3f5a4a]">
                  For support, contact IT Team
                </p>
                <a
                  href="mailto:it.support@bharatorganicexpo.com"
                  className="text-[8px] font-bold text-[#166b40] hover:underline"
                >
                  it.support@bharatorganicexpo.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
