"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
import KpiStatCards, { type KpiStatCardItem } from "@/components/ui/KpiStatCards";
import { ApiRequestError } from "@/lib/api";
import { PUBLIC_SITE_URL } from "@/lib/cmsPages";
import { CAREER_RANGES, careerDashboardApi, type CareerCounts, type CareerDashboard } from "@/lib/careerDashboardApi";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

/* =========================================================
   LIVE DATA (GET /careers/admin/dashboard)
   Page views / job views / apply clicks come from the website's
   careers page; CV uploads, AI screening and applications from
   their own records. AI bands: Eligible >= 60, Partial 50-59.
========================================================= */

const APPLICATIONS = "/applications-ai-response";

/** "↑ 20%" / "↓ 8%"; nothing when there is no earlier period to compare */
const trendText = (pct: number | null | undefined) => (pct == null ? undefined : `${pct < 0 ? "↓" : "↑"} ${Math.abs(pct)}%`);

const fmt = (n: number | undefined) => (n == null ? "–" : n.toLocaleString("en-IN"));
const pctOf = (n: number, base: number) => (base ? `${((n / base) * 100).toFixed(n / base >= 0.1 ? 0 : 1)}%` : "–");

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

const QUICK_ACTIONS: { label: string; icon: LucideIcon; href?: string; external?: string }[] = [
  { label: "Add New Job Posting", icon: Plus, href: "/job-postings/create" },
  { label: "Manage Job Postings", icon: Briefcase, href: "/job-postings" },
  { label: "View Applications", icon: Users, href: APPLICATIONS },
  { label: "Career Settings", icon: Settings2, href: "/career-settings" },
  { label: "View Career Page", icon: ExternalLink, external: `${PUBLIC_SITE_URL}/careers` },
];

type ApplicationResult = "Eligible" | "Partial Match" | "Not Eligible";

const RESULT_STYLES: Record<ApplicationResult, string> = {
  Eligible: "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]",
  "Partial Match": "bg-[#fff8e1] text-[#b78103] border border-[#ffe082]",
  "Not Eligible": "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]",
};

const AVATAR_COLORS = ["bg-blue-100 text-blue-700", "bg-violet-100 text-violet-700", "bg-amber-100 text-amber-700", "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-700"];

const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

/* =========================================================
   ANIMATED COUNTER (matches Job Postings page's counter)
========================================================= */


/* =========================================================
   CARD WRAPPER
========================================================= */

function Card({
  title,
  right,
  children,
  className = "",
  noPadding = false,
  titleClassName = "text-[#263148]",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  titleClassName?: string;
}) {
  return (
    <div className={`border border-[#e8e5df] bg-white ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-[#f0f0ec] px-[12px] py-[9px]">
          <h2 className={`text-[11px] font-bold ${titleClassName}`}>{title}</h2>
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
  const router = useRouter();
  const [range, setRange] = useState("30d");
  const [chart, setChart] = useState<"monthly" | "weekly" | "daily">("monthly");
  const [data, setData] = useState<CareerDashboard | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    careerDashboardApi
      .get(range, chart)
      .then((d) => {
        if (cancelled) return;
        setData(d);
        setError("");
      })
      .catch((err) => !cancelled && setError(err instanceof ApiRequestError ? err.message : "Could not load the careers dashboard."));
    return () => {
      cancelled = true;
    };
  }, [range, chart]);

  const c: Partial<CareerCounts> = data?.current ?? {};
  const t = data?.trends;
  const goTo = (href: string) => () => router.push(href);
  const scrollToChart = () => document.getElementById("career-performance")?.scrollIntoView({ behavior: "smooth", block: "center" });

  const card = (
    title: string,
    value: number | undefined,
    icon: LucideIcon,
    tone: KpiStatCardItem["tone"],
    colors: [string, string],
    trend: number | null | undefined,
    footer: string,
    onClick: () => void
  ): KpiStatCardItem => ({
    title,
    value: data ? (value ?? 0).toLocaleString("en-IN") : "–",
    icon,
    tone,
    gradient: `linear-gradient(135deg, #ffffff 0%, #ffffff 42%, ${colors[0]} 100%)`,
    borderColor: colors[0],
    numColor: colors[1],
    trend: trendText(trend),
    footer,
    onClick,
  });

  const STAT_CARDS: KpiStatCardItem[] = [
    card("ACTIVE JOBS", data?.activeJobs, Briefcase, "slate", ["#e2e8f0", "#334155"], null, "View job postings", goTo("/job-postings")),
    card("CAREER PAGE VIEWS", c.pageViews, Eye, "blue", ["#bae6fd", "#0284c7"], t?.pageViews, "View page analytics", scrollToChart),
    card("APPLY CLICKS", c.applyClicks, MousePointerClick, "violet", ["#ddd6fe", "#6d28d9"], t?.applyClicks, "View click analytics", scrollToChart),
    card("CV UPLOADS", c.cvUploads, UploadCloud, "indigo", ["#c7d2fe", "#4338ca"], t?.cvUploads, "View uploads", goTo(APPLICATIONS)),
    card("AI CHECKED", c.aiChecked, ScanSearch, "cyan", ["#a5f3fc", "#0e7490"], t?.aiChecked, "View AI screening", goTo(APPLICATIONS)),
    card("ELIGIBLE", c.eligible, CheckCircle2, "emerald", ["#bbf7d0", "#15803d"], t?.eligible, "View eligible candidates", goTo(`${APPLICATIONS}?result=Eligible`)),
    card("PARTIAL MATCH", c.partial, AlertTriangle, "amber", ["#fed7aa", "#c2410c"], t?.partial, "View partial matches", goTo(`${APPLICATIONS}?result=Partial%20Match`)),
    card("NOT ELIGIBLE", c.notEligible, XCircle, "rose", ["#fecdd3", "#be123c"], t?.notEligible, "View not eligible", goTo(`${APPLICATIONS}?result=Not%20Eligible`)),
    card("APPLICATIONS SUBMITTED", c.submitted, ClipboardList, "teal", ["#99f6e4", "#0f766e"], t?.submitted, "View applications", goTo(`${APPLICATIONS}?stage=Submitted`)),
  ];

  const FUNNEL_STAGES: FunnelStage[] = [
    { label: "Career Page Views", value: c.pageViews ?? 0, color: "#1f6f4a" },
    { label: "Job Detail Views", value: c.jobViews ?? 0, color: "#2f9e63" },
    { label: "Apply Clicks", value: c.applyClicks ?? 0, color: "#7fc79a" },
    { label: "CV Uploads", value: c.cvUploads ?? 0, color: "#a8dab5" },
    { label: "AI Checked", value: c.aiChecked ?? 0, color: "#bfe4c8" },
    { label: "Eligible (≥ 60%)", value: c.eligible ?? 0, color: "#dff2e3" },
    { label: "Partial Match (50–59%)", value: c.partial ?? 0, color: "#fde68a" },
    { label: "Not Eligible (< 50%)", value: c.notEligible ?? 0, color: "#fecaca" },
    { label: "Applications Submitted", value: c.submitted ?? 0, color: "#93c5fd" },
  ];
  // Percentages against the widest stage (page views once the website has counted some)
  const funnelBase = Math.max(1, ...FUNNEL_STAGES.map((s) => s.value));
  const funnelTop = c.pageViews || funnelBase;

  const PERFORMANCE_DATA = (data?.series ?? []).map((p) => ({ month: p.label, pageViews: p.pageViews, applyClicks: p.applyClicks, cvUploads: p.cvUploads }));

  const AI_SCREENING_TOTAL = c.aiChecked ?? 0;
  const AI_SCREENING_SLICES: DonutSlice[] = [
    { key: "eligible", label: "Eligible (60%+)", value: c.eligible ?? 0, color: "#16a34a" },
    { key: "partial", label: "Partial Match (50-59%)", value: c.partial ?? 0, color: "#f59e0b" },
    { key: "not-eligible", label: "Not Eligible (< 50%)", value: c.notEligible ?? 0, color: "#ef4444" },
  ];

  const TOP_LOCATIONS = data?.topLocations ?? [];
  const LATEST_APPLICATIONS = data?.latestApplications ?? [];
  const maxLocationCount = Math.max(1, ...TOP_LOCATIONS.map((l) => l.count));
  const rangeLabel = CAREER_RANGES.find((r) => r.value === range)?.label ?? "";

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[10px] border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]">
              Careers Dashboard
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Monitor performance and response for your career pages and job postings.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <label className="relative flex h-[30px] items-center gap-[6px] rounded-[6px] border border-[#e5e6e2] bg-white px-[10px] text-[9px] font-semibold text-[#334155] hover:bg-slate-50">
              <CalendarDays className="h-[12px] w-[12px] text-[#64748b]" />
              {data?.from ? `${shortDate(data.from)} – ${shortDate(data.to)}` : rangeLabel}
              <ChevronDown className="h-[11px] w-[11px] text-[#64748b]" />
              <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Date range" className="absolute inset-0 cursor-pointer opacity-0">
                {CAREER_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error && <p className="mb-[8px] rounded-[6px] bg-red-50 px-[10px] py-[6px] text-[9px] font-semibold text-red-600">{error}</p>}

        {/* =================================================
            STATS ROW
        ================================================= */}
        <KpiStatCards
          items={STAT_CARDS}
          gridClassName="mb-[12px] mt-[12px] grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-9"
          compact="xs"
        />

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
                      <span className="truncate text-[10px] font-semibold text-[#334155]">{stage.label}</span>
                      <div className="h-[14px] w-full overflow-hidden rounded-[3px] bg-[#f4f4f1]">
                        <div
                          className="h-full rounded-[3px]"
                          style={{ width: `${stage.value ? Math.max(2, (stage.value / funnelBase) * 100) : 0}%`, backgroundColor: stage.color }}
                        />
                      </div>
                      <span className="text-right text-[10px] font-bold text-[#263148]">
                        {data ? fmt(stage.value) : "–"} <span className="font-medium text-[#8a92a0]">({pctOf(stage.value, funnelTop)})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* RIGHT: PERFORMANCE + AI SCREENING */}
              <div className="flex flex-col gap-[10px]">
                <div id="career-performance">
                <Card
                  title="Career Page Performance"
                  right={
                    <label className="relative flex items-center gap-1 text-[8.5px] font-semibold text-[#334155] hover:text-[#166b40]">
                      {chart === "monthly" ? "Monthly" : chart === "weekly" ? "Weekly" : "Daily"}
                      <ChevronDown className="h-[11px] w-[11px]" />
                      <select value={chart} onChange={(e) => setChart(e.target.value as typeof chart)} aria-label="Chart period" className="absolute inset-0 cursor-pointer opacity-0">
                        <option value="monthly">Monthly (6 months)</option>
                        <option value="weekly">Weekly (8 weeks)</option>
                        <option value="daily">Daily (14 days)</option>
                      </select>
                    </label>
                  }
                >
                  <div className="mb-[8px] flex items-center gap-[12px] text-[7.5px] font-bold text-black">
                    <span className="flex items-center gap-1.5">
                      <span className="h-[9px] w-[9px] rounded-full bg-[#16a34a]" /> Page Views
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-[9px] w-[9px] rounded-full bg-[#2563eb]" /> Apply Clicks
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-[9px] w-[9px] rounded-full bg-[#f59e0b]" /> CV Uploads
                    </span>
                  </div>
                  <ResponsiveContainer width="100%" height={168}>
                    <LineChart data={PERFORMANCE_DATA} margin={{ top: 4, right: 6, bottom: 0, left: -18 }}>
                      <CartesianGrid vertical={false} stroke="#eef0ec" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fill: "#000000", fontSize: 9, fontWeight: 700 }}
                      />
                      <YAxis tickLine={false} axisLine={false} tick={{ fill: "#000000", fontSize: 9, fontWeight: 700 }} width={44} />
                      <Tooltip content={<PerformanceTooltip />} cursor={{ stroke: "#e5e6e2" }} />
                      <Line type="monotone" dataKey="pageViews" name="Page Views" stroke="#16a34a" strokeWidth={2} dot={{ r: 3, fill: "#16a34a" }} />
                      <Line type="monotone" dataKey="applyClicks" name="Apply Clicks" stroke="#2563eb" strokeWidth={2} dot={{ r: 3, fill: "#2563eb" }} />
                      <Line type="monotone" dataKey="cvUploads" name="CV Uploads" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: "#f59e0b" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
                </div>

                <Card title="AI Screening Results">
                  <div className="grid grid-cols-[100px_1fr] items-center gap-[12px]">
                    <div className="relative mx-auto h-[100px] w-[100px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={AI_SCREENING_TOTAL ? AI_SCREENING_SLICES : [{ key: "none", label: "No CVs checked", value: 1, color: "#e5e7eb" }]}
                            dataKey="value"
                            nameKey="label"
                            innerRadius="62%"
                            outerRadius="98%"
                            paddingAngle={2}
                            strokeWidth={0}
                          >
                            {(AI_SCREENING_TOTAL ? AI_SCREENING_SLICES : [{ key: "none", color: "#e5e7eb" }]).map((slice) => (
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
                            {fmt(slice.value)} <span className="font-medium text-[#8a92a0]">({pctOf(slice.value, AI_SCREENING_TOTAL)})</span>
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
              titleClassName="text-[#dc2626]"
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
                    {LATEST_APPLICATIONS.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-[8.5px] text-[#6c7587]">
                          {data ? "No applications yet." : "Loading…"}
                        </td>
                      </tr>
                    )}
                    {LATEST_APPLICATIONS.map((app, index) => (
                      <tr key={app.id} className="transition hover:bg-slate-50/80">
                        <td className="px-[8px] py-[7px] text-[7.5px] font-semibold text-[#6c7587]">{index + 1}</td>
                        <td className="px-[8px] py-[7px]">
                          <div className="flex items-center gap-[7px]">
                            <span
                              className={`grid h-[19px] w-[19px] shrink-0 place-items-center rounded-full text-[7.5px] font-bold ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                            >
                              {app.name.charAt(0)}
                            </span>
                            <span className="truncate text-[7.8px] font-bold text-[#18233b]">{app.name}</span>
                          </div>
                        </td>
                        <td className="px-[8px] py-[7px] truncate text-[7.8px] font-medium text-[#334155]">{app.position}</td>
                        <td className="px-[8px] py-[7px] truncate text-[7.8px] font-medium text-[#334155]">{shortDate(app.appliedOn)}</td>
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
                              onClick={() => router.push(`${APPLICATIONS}?search=${encodeURIComponent(app.applicationId || app.name)}`)}
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
            <div className="border border-[#e7e7e3] bg-[#f6f9fe] p-[12px]">
              <h2 className="mb-[8px] text-[11px] font-bold text-[#263148]">Quick Actions</h2>
              <div className="flex flex-col gap-[2px]">
                {QUICK_ACTIONS.map(({ label, icon: Icon, href, external }) => {
                  if (href) {
                    return (
                      <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-[8px] rounded-[4px] px-[6px] py-[7px] text-left text-[9.5px] font-semibold text-black transition hover:bg-slate-50"
                      >
                        <Icon className="h-[13px] w-[13px] text-[#218DAE]" />
                        {label}
                        <ArrowRight className="ml-auto h-[11px] w-[11px] text-[#c2c7d0]" />
                      </Link>
                    );
                  }
                  return (
                    <a
                      key={label}
                      href={external}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-[8px] rounded-[4px] px-[6px] py-[7px] text-left text-[9.5px] font-semibold text-black transition hover:bg-slate-50"
                    >
                      <Icon className="h-[13px] w-[13px] text-[#218DAE]" />
                      {label}
                      <ArrowRight className="ml-auto h-[11px] w-[11px] text-[#c2c7d0]" />
                    </a>
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
                {TOP_LOCATIONS.length === 0 && <p className="text-[8.5px] text-[#6c7587]">{data ? "No submitted applications in this period." : "Loading…"}</p>}
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
