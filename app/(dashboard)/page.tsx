"use client";

import {
  Children,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";
import Link from "next/link";

import typography from "./DashboardTypography.module.css";

import {
  dashboardApi,
  type LiveDashboardOverview,
} from "@/lib/dashboardApi";
import { useAppSelector } from "@/store/hooks";

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  FileSearch,
  FileText,
  Globe2,
  ImageIcon,
  Link2,
  LockKeyhole,
  Menu,
  MousePointerClick,
  Search,
  ShieldCheck,
  Target,
  Timer,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wrench,
  X,
  Edit,
  Trash2,
  Eye,
  type LucideIcon,
} from "lucide-react";

type DropdownKey =
  | "menu"
  | "website"
  | "date"
  | "notifications"
  | "profile"
  | "search-console-range"
  | "analytics-range"
  | "web-vitals-range"
  | "top-pages-range"
  | "keyword-range"
  | "location-range"
  | null;

/* =========================================================
   ANIMATED COUNTER
========================================================= */

function AnimatedCounter({
  value,
  duration = 1200,
}: {
  value: string | number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState<
    string | number
  >("");

  useEffect(() => {
    const strVal = String(value);

    const numericMatch = strVal.match(
      /^([^\d.]*)([\d,.]+)(.*)$/,
    );

    if (!numericMatch) {
      setDisplayValue(value);
      return;
    }

    const prefix = numericMatch[1];

    const rawNumberStr =
      numericMatch[2].replace(/,/g, "");

    const targetNum =
      parseFloat(rawNumberStr);

    const suffix = numericMatch[3];

    if (
      isNaN(targetNum) ||
      targetNum === 0
    ) {
      setDisplayValue(value);
      return;
    }

    const hasComma =
      numericMatch[2].includes(",");

    const decimalPlaces =
      (
        rawNumberStr.split(".")[1] ||
        ""
      ).length;

    let startTime: number | null =
      null;

    let animationFrameId: number;

    const step = (
      timestamp: number,
    ) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTime) /
        duration,
        1,
      );

      const easeProgress =
        1 -
        Math.pow(
          1 - progress,
          3,
        );

      const currentNum =
        targetNum *
        easeProgress;

      let formattedNum =
        currentNum.toFixed(
          decimalPlaces,
        );

      if (hasComma) {
        const parts =
          formattedNum.split(".");

        parts[0] = parseInt(
          parts[0],
          10,
        ).toLocaleString();

        formattedNum =
          parts.join(".");
      }

      setDisplayValue(
        `${prefix}${formattedNum}${suffix}`,
      );

      if (progress < 1) {
        animationFrameId =
          requestAnimationFrame(
            step,
          );
      }
    };

    animationFrameId =
      requestAnimationFrame(
        step,
      );

    return () =>
      cancelAnimationFrame(
        animationFrameId,
      );
  }, [value, duration]);

  return (
    <>
      {displayValue || value}
    </>
  );
}

/* =========================================================
   TYPES
========================================================= */

type IssueTone =
  | "rose"
  | "amber"
  | "violet";

type IssueLevel =
  | "High"
  | "Medium"
  | "Low";

interface DashboardIssue {
  label: string;
  level: IssueLevel;
  count: number;
  icon: LucideIcon;
  tone: IssueTone;
}

/* =========================================================
   TOP STATS
========================================================= */

const defaultTopStats = [
  {
    title: "SEO HEALTH SCORE",
    value: "—",
    suffix: "/100",
    note: "Loading",
    icon: TrendingUp,
    tone: "emerald",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #dcfce7 100%)",
    borderColor: "#d1fae5",
    numColor: "#15803d",
    footer:
      "View full SEO report",
    href: "/pages",
  },

  {
    title: "TOTAL PAGES",
    value: "—",
    note: "Loading",
    icon: FileText,
    tone: "violet",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ede9fe 100%)",
    borderColor: "#e9d5ff",
    numColor: "#6d28d9",
    footer:
      "View all pages",
    href: "/pages",
  },

  {
    title: "TOTAL POSTS",
    value: "—",
    note: "Loading",
    icon: FileSearch,
    tone: "amber",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fef3c7 100%)",
    borderColor: "#fde68a",
    numColor: "#b45309",
    footer:
      "View all posts",
    href: "/blogs",
  },

  {
    title: "INDEXED PAGES",
    value: "—",
    suffix: "",
    note: "Not Connected",
    icon: Search,
    tone: "blue",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #dbeafe 100%)",
    borderColor: "#bfdbfe",
    numColor: "#1d4ed8",
    footer:
      "View details",
    href: "/seo",
  },

  {
    title:
      "EXPO ENQUIRIES (MTD)",
    value: "—",
    note: "Loading",
    icon: Users,
    tone: "rose",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ffe4e6 100%)",
    borderColor: "#fecdd3",
    numColor: "#be123c",
    footer:
      "View all submissions",
    href: "/submissions",
  },

  {
    title:
      "CONVERSION RATE",
    value: "—",
    note: "Loading",
    icon: Target,
    tone: "emerald",
    gradient:
      "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #ccfbf1 100%)",
    borderColor: "#a7f3d0",
    numColor: "#0f766e",
    footer:
      "View analytics",
    href: "/analytics",
  },
];

const toneClass = {
  emerald:
    "bg-emerald-50 text-emerald-700 ring-emerald-100",

  violet:
    "bg-violet-50 text-violet-700 ring-violet-100",

  amber:
    "bg-amber-50 text-amber-700 ring-amber-100",

  blue:
    "bg-blue-50 text-blue-700 ring-blue-100",

  rose:
    "bg-rose-50 text-rose-700 ring-rose-100",
} as const;

/* =========================================================
   RANGES
========================================================= */

const searchConsoleRanges = [
  "Last 7 Days",
  "Last 28 Days",
  "Last 3 Months",
  "Last 6 Months",
  "Last 12 Months",
];

const analyticsRanges = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "This Month",
  "Previous Month",
];

const webVitalsRanges = [
  "Last 7 Days",
  "Last 28 Days",
  "Last 3 Months",
];

const monthlyRanges = [
  "This Month",
  "Previous Month",
  "Last 3 Months",
  "Last 6 Months",
];

/* =========================================================
   MINI SPARKLINE
========================================================= */

function MiniSparkline({
  points,
}: {
  points: number[];
}) {
  const max =
    Math.max(...points);

  const min =
    Math.min(...points);

  const width = 148;
  const height = 27;
  const pad = 2;

  const path = points
    .map(
      (
        value,
        index,
      ) => {
        const x =
          pad +
          (index /
            (points.length -
              1)) *
          (width -
            pad * 2);

        const y =
          height -
          pad -
          ((value - min) /
            Math.max(
              1,
              max - min,
            )) *
          (height -
            pad * 2);

        return `${index === 0
          ? "M"
          : "L"
          } ${x.toFixed(
            1,
          )} ${y.toFixed(1)}`;
      },
    )
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[27px] w-full"
    >
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        className="text-emerald-700"
      />
    </svg>
  );
}

/* =========================================================
   PANEL
========================================================= */

function Panel({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const items =
    Children.toArray(
      children,
    );

  const firstItem =
    items[0];

  const isHeader =
    isValidElement(
      firstItem,
    ) &&
    firstItem.type ===
    PanelTitle;

  const lastItem =
    items.at(-1);

  const hasFooter =
    isValidElement(
      lastItem,
    ) &&
    lastItem.type ===
    FooterButton;

  const bodyItems =
    isHeader
      ? hasFooter
        ? items.slice(
          1,
          -1,
        )
        : items.slice(1)
      : hasFooter
        ? items.slice(
          0,
          -1,
        )
        : items;

  return (
    <section
      className={`
        relative
        flex
        h-full
        min-h-0
        flex-col
        overflow-hidden
        rounded-[11px]
        border
        border-[#e5e7e6]
        bg-white
        ${className}
      `}
      style={{
        boxShadow:
          "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",

        ...style,
      }}
    >
      {isHeader &&
        firstItem}

      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
          justify-between
          overflow-auto
          pb-0
        "
      >
        {bodyItems}
      </div>

      {hasFooter &&
        lastItem}
    </section>
  );
}

/* =========================================================
   PANEL TITLE
========================================================= */

function PanelTitle({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div
      className="
        sticky
        top-0
        z-20
        flex
        h-[32px]
        shrink-0
        items-center
        justify-between
        border-b
        border-slate-200/80
        bg-[#f0f3f6]
        px-2.5
        backdrop-blur-sm
      "
    >
      <h2
        className="
          text-[10.5px]
          font-semibold
          tracking-[-0.01em]
          text-black
        "
        style={{
          color: "#000000",
          fontWeight: 600,
        }}
      >
        {children}
      </h2>

      {right}
    </div>
  );
}

/* =========================================================
   FOOTER BUTTON
========================================================= */

function FooterButton({
  children,
  dark = false,
}: {
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <button
      type="button"
      className={`
        mx-2.5
        mb-1.5
        mt-0.5
        flex
        h-[26px]
        shrink-0
        items-center
        justify-center
        gap-1.5
        rounded-md
        text-[8.5px]
        font-bold
        transition

        ${dark
          ? "bg-[#071d3c] text-white hover:bg-[#0b2a55]"
          : "border border-[#eee8dc] bg-[#fffdf8] text-[#27344c] hover:bg-[#fff9ed]"
        }
      `}
    >
      {children}

      <ArrowRight className="h-3.5 w-3.5" />
    </button>
  );
}

/* =========================================================
   RANGE DROPDOWN
========================================================= */

function RangeDropdown({
  dropdownKey,
  openDropdown,
  setOpenDropdown,
  value,
  setValue,
  options,
}: {
  dropdownKey: DropdownKey;

  openDropdown: DropdownKey;

  setOpenDropdown:
  React.Dispatch<
    React.SetStateAction<DropdownKey>
  >;

  value: string;

  setValue: (
    value: string,
  ) => void;

  options: string[];
}) {
  const isOpen =
    openDropdown ===
    dropdownKey;

  const buttonRef =
    useRef<HTMLButtonElement>(
      null,
    );

  const [
    menuPosition,
    setMenuPosition,
  ] = useState({
    top: 0,
    right: 0,
  });

  const updateMenuPosition =
    () => {
      const rect =
        buttonRef.current?.getBoundingClientRect();

      if (!rect) {
        return;
      }

      setMenuPosition({
        top:
          rect.bottom +
          7,

        right: Math.max(
          8,
          window.innerWidth -
          rect.right,
        ),
      });
    };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateMenuPosition();

    window.addEventListener(
      "resize",
      updateMenuPosition,
    );

    window.addEventListener(
      "scroll",
      updateMenuPosition,
      true,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateMenuPosition,
      );

      window.removeEventListener(
        "scroll",
        updateMenuPosition,
        true,
      );
    };
  }, [isOpen]);

  return (
    <div
      className="relative"
      data-dashboard-dropdown
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          updateMenuPosition();

          setOpenDropdown(
            isOpen
              ? null
              : dropdownKey,
          );
        }}
        className="
          flex
          items-center
          gap-1
          text-[8px]
          font-bold
        "
      >
        {value}

        <ChevronDown
          className={`
            h-3.5
            w-3.5
            transition-transform

            ${isOpen
              ? "rotate-180"
              : ""
            }
          `}
        />
      </button>

      {isOpen &&
        typeof document !==
        "undefined" &&
        createPortal(
          <div
            data-dashboard-dropdown
            className="
              fixed
              z-[9999]
              min-w-[142px]
              overflow-hidden
              rounded-[9px]
              border
              border-[#e5e2da]
              bg-white
              p-1.5
              shadow-[0_10px_30px_rgba(15,23,42,0.14)]
            "
            style={{
              top:
                menuPosition.top,

              right:
                menuPosition.right,
            }}
          >
            {options.map(
              (option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => {
                    setValue(
                      option,
                    );

                    setOpenDropdown(
                      null,
                    );
                  }}
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-[6px]
                    px-2.5
                    py-2
                    text-left
                    text-[10px]
                    font-bold
                    transition

                    ${value ===
                      option
                      ? "bg-[#f2f5f2] text-[#26372b]"
                      : "text-[#465168] hover:bg-[#f7f7f4]"
                    }
                  `}
                >
                  <span>
                    {option}
                  </span>

                  {value ===
                    option && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                </button>
              ),
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function DashboardPage() {
  const { admin } = useAppSelector((state) => state.auth);
  const [cachedPageSpeed, setCachedPageSpeed] = useState<LiveDashboardOverview["sources"]["pageSpeed"]["data"]>(null);
  const [
    liveDashboard,
    setLiveDashboard,
  ] =
    useState<LiveDashboardOverview | null>(
      null,
    );

  const [
    openDropdown,
    setOpenDropdown,
  ] =
    useState<DropdownKey>(
      null,
    );

  const [
    selectedWebsite,
    setSelectedWebsite,
  ] = useState(
    "mokshasewa.org",
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    "31 May 2026",
  );

  const [
    activeMenuItem,
    setActiveMenuItem,
  ] = useState(
    "Dashboard",
  );

  const [
    notificationCount,
    setNotificationCount,
  ] = useState(8);

  /* =========================================================
     DASHBOARD DATA
  ========================================================= */

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("moksha-dashboard-pagespeed");
      if (stored) setCachedPageSpeed(JSON.parse(stored));
    } catch {
      // Ignore an invalid or unavailable browser cache.
    }
  }, []);

  useEffect(() => {
    const current = liveDashboard?.sources.pageSpeed;
    if (current?.status === "connected" && current.data) {
      setCachedPageSpeed(current.data);
      window.localStorage.setItem("moksha-dashboard-pagespeed", JSON.stringify(current.data));
    }
  }, [liveDashboard?.sources.pageSpeed]);

  useEffect(() => {
    let active = true;

    dashboardApi
      .overview()
      .then((data) => {
        if (active) {
          setLiveDashboard(
            data,
          );
        }
      })
      .catch(() => {
        if (active) {
          setLiveDashboard(
            null,
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (
      !liveDashboard ||
      liveDashboard.sources.pageSpeed.data?.lighthouseAvailable === true
    ) {
      return;
    }

    let active = true;

    const refresh =
      async () => {
        try {
          const pageSpeed =
            await dashboardApi.pageSpeed();

          if (active) {
            setLiveDashboard(
              (current) =>
                current
                  ? {
                    ...current,

                    sources: {
                      ...current.sources,

                      pageSpeed,
                    },
                  }
                  : current,
            );
          }
        } catch {
          // Keep latest truthful state.
        }
      };

    const timer =
      window.setInterval(
        refresh,
        10_000,
      );

    void refresh();

    return () => {
      active = false;

      window.clearInterval(
        timer,
      );
    };
  }, [
    liveDashboard?.sources.pageSpeed.data?.lighthouseAvailable,
  ]);

  useEffect(() => {
    if (
      !liveDashboard ||
      liveDashboard.sources
        .indexCoverage
        ?.status ===
      "connected"
    ) {
      return;
    }

    let active = true;

    const refresh =
      async () => {
        try {
          const indexCoverage =
            await dashboardApi.indexCoverage();

          if (active) {
            setLiveDashboard(
              (current) =>
                current
                  ? {
                    ...current,

                    sources: {
                      ...current.sources,

                      indexCoverage,
                    },
                  }
                  : current,
            );
          }
        } catch {
          // Preserve last source state.
        }
      };

    const timer =
      window.setInterval(
        refresh,
        10_000,
      );

    return () => {
      active = false;

      window.clearInterval(
        timer,
      );
    };
  }, [
    liveDashboard?.sources
      .indexCoverage
      ?.status,
  ]);

  useEffect(() => {
    if (
      !liveDashboard ||
      liveDashboard.sources
        .siteStatus
        ?.status ===
      "connected"
    ) {
      return;
    }

    let active = true;

    const refresh =
      async () => {
        try {
          const siteStatus =
            await dashboardApi.siteStatus();

          if (active) {
            setLiveDashboard(
              (current) =>
                current
                  ? {
                    ...current,

                    sources: {
                      ...current.sources,

                      siteStatus,
                    },
                  }
                  : current,
            );
          }
        } catch {
          /* retry */
        }
      };

    const timer =
      window.setInterval(
        refresh,
        5_000,
      );

    return () => {
      active = false;

      window.clearInterval(
        timer,
      );
    };
  }, [
    liveDashboard?.sources
      .siteStatus
      ?.status,
  ]);

  /* =========================================================
     LIVE DATA
  ========================================================= */

  const internal =
    liveDashboard?.sources
      .internal.data;

  const analytics =
    liveDashboard?.sources
      .analytics.data;

  const searchConsole =
    liveDashboard?.sources
      .searchConsole.data;

  const pageSpeedSource =
    liveDashboard?.sources
      .pageSpeed;

  const pageSpeed =
    liveDashboard?.sources
      .pageSpeed.data ?? cachedPageSpeed;

  const indexCoverageSource =
    liveDashboard?.sources
      .indexCoverage;

  const indexCoverage =
    indexCoverageSource?.data;

  const siteStatus =
    liveDashboard?.sources
      .siteStatus?.data;

  const seoScore =
    pageSpeed?.seoScore ?? 0;

  /* =========================================================
     ACTION REQUIRED
  ========================================================= */

  const liveIssues: DashboardIssue[] = [
    {
      label: "3 Exhibitor Stall Bookings pending approval",
      level: "High" as const,
      count: 3,
      icon: FileSearch,
      tone: "rose" as const,
    },
    {
      label: "12 International Buyer Registrations requiring verification",
      level: "Medium" as const,
      count: 12,
      icon: Activity,
      tone: "amber" as const,
    },
    {
      label: "2 Sponsorship Enquiries for Premium Pavilion",
      level: "Medium" as const,
      count: 2,
      icon: AlertCircle,
      tone: "amber" as const,
    },
    {
      label: "5 Trade Visitor Pass Requests queued",
      level: "Low" as const,
      count: 5,
      icon: Timer,
      tone: "violet" as const,
    },
  ];

  const number = (
    value: number,
  ) =>
    new Intl.NumberFormat(
      "en-IN",
    ).format(
      Math.round(value),
    );

  const duration = (
    seconds: number,
  ) =>
    `${String(
      Math.floor(
        seconds / 60,
      ),
    ).padStart(
      2,
      "0",
    )}:${String(
      Math.round(
        seconds % 60,
      ),
    ).padStart(
      2,
      "0",
    )}`;

  const growthText = (
    value:
      | number
      | null
      | undefined,

    inverse = false,
  ) => {
    if (value == null) {
      return "—";
    }

    const adjusted =
      inverse
        ? -value
        : value;

    return `${adjusted >= 0
      ? "↑"
      : "↓"
      } ${Math.abs(
        value,
      ).toFixed(1)}%`;
  };

  const locationRows =
    internal?.topLocations
      .length
      ? internal.topLocations.map(
        (item) =>
          [
            item.city,

            item.count,

            `${internal.totalEnquiries >
              0
              ? (
                (item.count /
                  internal.totalEnquiries) *
                100
              ).toFixed(
                1,
              )
              : "0.0"
            }%`,
          ] as [
            string,
            number,
            string,
          ],
      )
      : [];

  const submissionRows =
    internal?.recentSubmissions
      ?.length
      ? internal.recentSubmissions.map(
        (item) => {
          let typeStr = item.type.toLowerCase().replace("contact", "form").replaceAll("_", " ");

          // To simulate an activity log visually, we can just use "Created" 
          // (Since we don't have edited/deleted status in the API yet)
          let actionText = `Created ${typeStr}`;

          return {
            id: item.id || item.name,
            name: item.name.split(" ")[0],
            action: actionText,
            date: new Date(item.createdAt).toLocaleDateString("en-IN", {
              weekday: "long",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
      )
      : [];

  const liveTopPages = (
    analytics?.pages ?? []
  )
    .slice(0, 5)
    .map((item) => {
      const name =
        item.path === "/"
          ? "Home"
          : item.path
            .split("/")
            .filter(
              Boolean,
            )
            .pop()
            ?.replaceAll(
              "-",
              " ",
            ) ||
          item.path;

      return [
        name,
        item.path,
        number(item.views),
      ] as [
          string,
          string,
          string,
        ];
    });

  const liveKeywordRows = (
    searchConsole?.queries ??
    []
  )
    .slice(0, 5)
    .map((item) => [
      item.query,

      number(item.clicks),

      number(
        item.impressions,
      ),

      item.position.toFixed(
        1,
      ),
    ]) as [
      string,
      string,
      string,
      string,
    ][];

  const analyticsDaily =
    analytics?.daily ?? [];

  const analyticsChartSamples =
    analyticsDaily.length <=
      5
      ? analyticsDaily
      : [
        0,
        0.25,
        0.5,
        0.75,
        1,
      ].map(
        (ratio) =>
          analyticsDaily[
          Math.round(
            (analyticsDaily.length -
              1) *
            ratio,
          )
          ],
      );

  const analyticsChartMax =
    Math.max(
      1,

      ...analyticsChartSamples.flatMap(
        (item) => [
          item.users,
          item.pageViews,
        ],
      ),
    );

  const analyticsChartData =
    analyticsChartSamples.map(
      (
        item,
        index,
      ) => {
        const date =
          item.date.length === 8
            ? new Date(
              `${item.date.slice(
                0,
                4,
              )}-${item.date.slice(
                4,
                6,
              )}-${item.date.slice(
                6,
                8,
              )}T00:00:00`,
            ).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month:
                  "short",
              },
            )
            : item.date;

        return {
          date,

          x:
            48 +
            index * 90,

          blueH:
            (item.users /
              analyticsChartMax) *
            72,

          emH:
            (item.pageViews /
              analyticsChartMax) *
            72,
        };
      },
    );

  /* =========================================================
     TOP STATS LIVE DATA
  ========================================================= */

  const topStats =
    defaultTopStats.map(
      (item) => {
        if (
          item.title ===
          "SEO HEALTH SCORE" &&
          pageSpeed
        ) {
          return {
            ...item,

            value: String(
              pageSpeed.seoScore,
            ),

            note:
              pageSpeed.seoScore >=
                90
                ? "Excellent"
                : pageSpeed.seoScore >=
                  70
                  ? "Good"
                  : "Needs Work",
          };
        }

        if (
          item.title ===
          "SEO HEALTH SCORE"
        ) {
          return {
            ...item,

            value: "—",

            note:
              pageSpeedSource?.message ??
              "Connecting to PageSpeed",
          };
        }

        if (
          item.title ===
          "TOTAL PAGES" &&
          internal
        ) {
          return {
            ...item,

            value: String(
              internal.totalPages,
            ),

            note:
              "Live from CMS",
          };
        }

        if (
          item.title ===
          "TOTAL POSTS" &&
          internal
        ) {
          return {
            ...item,

            value: String(
              internal.totalPosts,
            ),

            note:
              growthText(
                internal.growth
                  .posts,
              ),
          };
        }

        if (
          item.title ===
          "INDEXED PAGES" &&
          indexCoverage
        ) {
          return {
            ...item,

            value: `${indexCoverage.indexed}/${indexCoverage.total}`,

            note: `${indexCoverage.total >
              0
              ? (
                (indexCoverage.indexed /
                  indexCoverage.total) *
                100
              ).toFixed(1)
              : "0.0"
              }% Indexed`,
          };
        }

        if (
          item.title ===
          "INDEXED PAGES"
        ) {
          return {
            ...item,

            value: "—",

            note:
              indexCoverageSource?.message ??
              "Connecting to Search Console",
          };
        }

        if (
          item.title ===
          "EXPO ENQUIRIES (MTD)" &&
          internal
        ) {
          return {
            ...item,

            value: String(
              internal.enquiriesMtd,
            ),

            note:
              growthText(
                internal.growth
                  .enquiriesMtd,
              ),
          };
        }

        if (
          item.title ===
          "CONVERSION RATE" &&
          analytics
        ) {
          const rate =
            analytics.sessions >
              0
              ? (analytics.conversions /
                analytics.sessions) *
              100
              : 0;

          return {
            ...item,

            value: `${rate.toFixed(
              1,
            )}%`,

            note:
              growthText(
                analytics.growth
                  .conversionRate,
              ),
          };
        }

        return item;
      },
    );

  /* =========================================================
     DROPDOWN
  ========================================================= */

  const toggleDropdown = (
    key: DropdownKey,
  ) => {
    setOpenDropdown(
      (current) =>
        current === key
          ? null
          : key,
    );
  };

  const [
    searchConsoleRange,
    setSearchConsoleRange,
  ] = useState(
    "Last 28 Days",
  );

  const [
    analyticsRange,
    setAnalyticsRange,
  ] = useState(
    "Last 30 Days",
  );

  const [
    webVitalsRange,
    setWebVitalsRange,
  ] = useState(
    "Last 28 Days",
  );

  const [
    topPagesRange,
    setTopPagesRange,
  ] = useState(
    "This Month",
  );

  const [
    keywordRange,
    setKeywordRange,
  ] = useState(
    "This Month",
  );

  const [
    locationRange,
    setLocationRange,
  ] = useState(
    "This Month",
  );

  useEffect(() => {
    const handleMouseDown = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as HTMLElement;

      if (
        !target.closest(
          "[data-dashboard-dropdown]",
        )
      ) {
        setOpenDropdown(
          null,
        );
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setOpenDropdown(
          null,
        );
      }
    };

    document.addEventListener(
      "mousedown",
      handleMouseDown,
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleMouseDown,
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, []);

  return (
    <div
      className={`
        ${typography.dashboard}
        min-h-full
        w-full
        overflow-visible
        bg-white
        text-[#13213d]
      `}
    >
      <div className="flex min-h-full flex-col overflow-visible">

        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="hidden">
          <div className="flex h-full items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">

              <div
                className="relative shrink-0"
                data-dashboard-dropdown
              >
                <button
                  type="button"
                  onClick={() =>
                    toggleDropdown(
                      "menu",
                    )
                  }
                  className="
                    grid
                    h-10
                    w-10
                    shrink-0
                    place-items-center
                    rounded-[12px]
                    bg-[#30392d]
                    text-white
                    transition
                    hover:bg-[#222b20]
                  "
                >
                  {openDropdown ===
                    "menu" ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>

                {openDropdown ===
                  "menu" && (
                    <div className="absolute left-0 top-[48px] z-[120] w-[210px] overflow-hidden rounded-[12px] border border-[#e5e2da] bg-white p-2 shadow-[0_14px_40px_rgba(15,23,42,0.16)]">
                      <div className="border-b border-[#ecece7] px-2.5 pb-2 pt-1">
                        <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#8a92a0]">
                          Navigation
                        </p>
                      </div>

                      {[
                        "Dashboard",
                        "Website Pages",
                        "Blog Posts",
                        "SEO Manager",
                        "Analytics",
                        "Form Submissions",
                        "Media Library",
                        "Settings",
                      ].map(
                        (item) => (
                          <button
                            key={
                              item
                            }
                            type="button"
                            onClick={() => {
                              setActiveMenuItem(
                                item,
                              );

                              setOpenDropdown(
                                null,
                              );
                            }}
                            className={`
                            mt-1
                            flex
                            w-full
                            items-center
                            justify-between
                            rounded-[8px]
                            px-3
                            py-2
                            text-left
                            text-[10px]
                            font-bold
                            transition

                            ${activeMenuItem ===
                                item
                                ? "bg-[#30392d] text-white"
                                : "text-[#33415a] hover:bg-[#f5f6f3]"
                              }
                          `}
                          >
                            {item}

                            {activeMenuItem ===
                              item && (
                                <Check className="h-3.5 w-3.5" />
                              )}
                          </button>
                        ),
                      )}
                    </div>
                  )}
              </div>

              <div
                className="min-w-0 rounded-md border border-black bg-white px-3 py-1.5"
                style={{
                  boxShadow:
                    "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                }}
              >
                <h1 className="truncate text-[20px] font-semibold leading-tight tracking-[-0.025em]">
                  Welcome back,{" "}
                  {admin?.name || "Admin"}!{" "}

                  <span className="text-[18px]">
                    👋
                  </span>
                </h1>

                <p className="truncate text-[11px] font-semibold leading-tight text-[#4a5261]">
                  Here&apos;s an
                  overview of your
                  website today{" "}

                  <b className="font-semibold">
                    mokshasewa.org
                  </b>
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ===================================================
            MAIN
        =================================================== */}

        <main
          className="
            min-h-0
            flex-1
            overflow-visible
            pl-5
            pr-5
            pt-4
            pb-5
          "
        >
          {/* =================================================
              IMPORTANT HEIGHT CHANGE

              Top stats = 98px
              Every section row below = 260px
              Bottom row = 160px
          ================================================= */}

          <div
            className="
              grid
              h-full
              min-h-0
              w-full
              grid-rows-[98px_260px_260px_160px]
              gap-2
            "
          >
            {/* =============================
                TOP STATS
            ============================== */}

            <div className="grid min-h-0 grid-cols-6 gap-2">
              {topStats.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <Panel
                      key={
                        item.title
                      }
                      className="
                        flex
                        flex-col
                        !overflow-hidden
                        p-2
                        !pb-5.5
                      "
                      style={{
                        background:
                          item.gradient,

                        borderColor:
                          (item as any).borderColor || undefined,

                        boxShadow:
                          "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
                      }}
                    >
                      <div className="flex items-start gap-1.5">
                        <div
                          className={`
                            grid
                            h-[30px]
                            w-[30px]
                            shrink-0
                            place-items-center
                            rounded-full
                            ring-1
                            bg-white/80
                            shadow-xs

                            ${toneClass[
                            item.tone as keyof typeof toneClass
                            ]
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-[8.5px] !font-semibold tracking-[0.01em] text-slate-900"
                            style={{
                              fontWeight: 600,
                              color:
                                "#0f172a",
                            }}
                          >
                            {
                              item.title
                            }
                          </p>

                          <div className="mt-1.5 flex items-end gap-1">
                            <span
                              className="text-[21px] !font-semibold leading-none tracking-[-0.04em]"
                              style={{
                                color:
                                  item.numColor,

                                fontWeight: 600,
                              }}
                            >
                              <AnimatedCounter
                                value={
                                  item.value
                                }
                              />
                            </span>

                            {item.suffix && (
                              <span className="mb-0.5 text-[9.5px] font-bold">
                                {
                                  item.suffix
                                }
                              </span>
                            )}
                          </div>

                          <p
                            className={`
                              mt-0.5
                              text-[8.5px]
                              font-bold

                              ${item.title ===
                                "INDEXED PAGES"
                                ? "text-blue-600"
                                : "text-emerald-700"
                              }
                            `}
                          >
                            {
                              item.note
                            }
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => window.open(item.href || "/pages", "_blank")}
                        className="absolute bottom-1 left-2 right-2 flex cursor-pointer items-center justify-center gap-1 text-[8px] font-semibold text-[#293957] transition hover:text-blue-600"
                      >
                        {
                          item.footer
                        }

                        <ArrowRight className="h-3 w-3" />
                      </div>
                    </Panel>
                  );
                },
              )}
            </div>

            {/* =============================
                ROW 2 — 260PX
            ============================== */}

            <div
              className="
                grid
                h-full
                min-h-0
                grid-cols-[0.92fr_1.12fr_1.06fr]
                gap-2
              "
            >
              {/* =================================================
                  SEO HEALTH
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <button
                      type="button"
                      onClick={() => window.open("/seo", "_blank")}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      View Data

                      <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                  }
                >
                  SEO Health
                  Overview
                </PanelTitle>

                <div className="grid min-h-0 grid-cols-[110px_1fr] items-center gap-2 px-3 pt-3">
                  <div className="relative mx-auto h-[96px] w-[96px]">
                    <svg
                      className="pointer-events-none absolute inset-0 z-0 h-full w-full -rotate-90"
                    >
                      <defs>
                        <mask id="seo-donut-mask">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="16"
                            className="animate-donut-fill"
                          />
                        </mask>
                      </defs>
                    </svg>

                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(#148151 0deg ${seoScore *
                          3.6
                          }deg, #edf0ea ${seoScore *
                          3.6
                          }deg 360deg)`,

                        mask:
                          "url(#seo-donut-mask)",

                        WebkitMask:
                          "url(#seo-donut-mask)",
                      }}
                    />

                    <div className="absolute inset-[9px] z-10 grid place-items-center rounded-full bg-white text-center">
                      <div>
                        <div className="text-[22px] font-semibold leading-none text-emerald-600">
                          <AnimatedCounter
                            value={
                              pageSpeed
                                ? seoScore
                                : "—"
                            }
                            duration={
                              2500
                            }
                          />
                        </div>

                        <div className="mt-0.5 text-[9px] font-bold text-emerald-700">
                          {pageSpeed
                            ? seoScore >=
                              90
                              ? "Excellent"
                              : seoScore >=
                                70
                                ? "Good"
                                : "Needs Work"
                            : "No Live Data"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="space-y-[5px] text-[11.5px] font-semibold text-slate-900"
                    style={{
                      fontSize:
                        "11.5px",

                      fontWeight: 600,

                      color:
                        "#0f172a",
                    }}
                  >
                    {(pageSpeed?.seoChecks ?? [
                      { key: "meta-title", label: "Meta Title", status: "not_checked" as const },
                      { key: "meta-description", label: "Meta Description", status: "not_checked" as const },
                      { key: "headings", label: "Headings", status: "not_checked" as const },
                      { key: "content-quality", label: "Content Quality", status: "not_checked" as const },
                      { key: "internal-linking", label: "Internal Linking", status: "not_checked" as const },
                      { key: "image-alt", label: "Images (ALT Text)", status: "not_checked" as const },
                      { key: "schema-markup", label: "Schema Markup", status: "not_checked" as const },
                      { key: "mobile-friendly", label: "Mobile Friendliness", status: "not_checked" as const },
                      { key: "page-speed", label: "Page Speed", status: "not_checked" as const },
                    ]).map(
                      (check) => (
                        <div
                          key={check.key}
                          className="grid grid-cols-[14px_1fr_auto] items-center gap-1"
                        >
                          {check.status === "good" ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                          ) : (
                            <AlertCircle className={`h-3.5 w-3.5 ${check.status === "needs_work" ? "text-amber-500" : "text-slate-400"}`} />
                          )}

                          <span
                            className="font-semibold text-slate-900"
                            style={{
                              color:
                                "#0f172a",

                              fontWeight: 600,
                            }}
                          >
                            {check.label}
                          </span>

                          <span
                            className={
                              check.status === "good"
                                ? "text-emerald-700"
                                : check.status === "needs_work"
                                  ? "text-amber-500"
                                  : "text-slate-400"
                            }
                          >
                            {check.status === "good"
                              ? "Good"
                              : check.status === "needs_work"
                                ? "Needs Work"
                                : "Not Checked"}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </Panel>

              {/* =================================================
                  SEARCH CONSOLE
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open("/seo", "_blank")}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        View Console

                        <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                    </div>
                  }
                >
                  Google Search
                  Console Summary
                </PanelTitle>

                <div className="grid grid-cols-4 gap-1.5 px-3 pt-3">
                  {[
                    {
                      label:
                        "Total Clicks",

                      value:
                        searchConsole
                          ? number(
                            searchConsole.clicks,
                          )
                          : "—",

                      change:
                        searchConsole
                          ? growthText(
                            searchConsole
                              .growth
                              .clicks,
                          )
                          : "No Live Data",

                      bg:
                        "bg-[#eff6ff] border-[#dbeafe]",

                      valColor:
                        "text-blue-900",
                    },

                    {
                      label:
                        "Total Impressions",

                      value:
                        searchConsole
                          ? number(
                            searchConsole.impressions,
                          )
                          : "—",

                      change:
                        searchConsole
                          ? growthText(
                            searchConsole
                              .growth
                              .impressions,
                          )
                          : "No Live Data",

                      bg:
                        "bg-[#f0fdf4] border-[#dcfce7]",

                      valColor:
                        "text-emerald-900",
                    },

                    {
                      label:
                        "Average CTR",

                      value:
                        searchConsole
                          ? `${searchConsole.ctr.toFixed(
                            2,
                          )}%`
                          : "—",

                      change:
                        searchConsole
                          ? growthText(
                            searchConsole
                              .growth
                              .ctr,
                          )
                          : "No Live Data",

                      bg:
                        "bg-[#faf5ff] border-[#f3e8ff]",

                      valColor:
                        "text-purple-900",
                    },

                    {
                      label:
                        "Average Position",

                      value:
                        searchConsole
                          ? searchConsole.position.toFixed(
                            1,
                          )
                          : "—",

                      change:
                        searchConsole
                          ? growthText(
                            searchConsole
                              .growth
                              .position,

                            true,
                          )
                          : "No Live Data",

                      bg:
                        "bg-[#fff7ed] border-[#ffedd5]",

                      valColor:
                        "text-amber-900",
                    },
                  ].map(
                    (item) => (
                      <div
                        key={
                          item.label
                        }
                        className={`
                          rounded-[7px]
                          border
                          px-2
                          py-1.5
                          ${item.bg}
                        `}
                        style={{
                          boxShadow:
                            "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px",
                        }}
                      >
                        <p className="text-[9px] font-bold text-[#334666]">
                          {
                            item.label
                          }
                        </p>

                        <p
                          className={`
                            mt-1
                            text-[18px]
                            font-semibold
                            ${item.valColor}
                          `}
                        >
                          <AnimatedCounter
                            value={
                              item.value
                            }
                          />
                        </p>

                        {item.change && (
                          <p className="mt-0.5 text-[9px] font-bold text-emerald-700">
                            {
                              item.change
                            }
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>

                <div className="w-full min-h-0 px-3 pt-2 pb-1">
                  <svg
                    viewBox="0 0 520 120"
                    preserveAspectRatio="none"
                    className="block h-[90px] w-full overflow-visible"
                  >
                    <defs>
                      <linearGradient
                        id="sc-green-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity="0.28"
                        />

                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity="0"
                        />
                      </linearGradient>

                      <linearGradient
                        id="sc-blue-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity="0.22"
                        />

                        <stop
                          offset="100%"
                          stopColor="#3b82f6"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <g className="animate-grow-left">
                      {[
                        20,
                        50,
                        80,
                      ].map(
                        (y) => (
                          <line
                            key={
                              y
                            }
                            x1="12"
                            x2="508"
                            y1={
                              y
                            }
                            y2={
                              y
                            }
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                        ),
                      )}

                      <path
                        d="M 12 40 C 40 22, 80 34, 136 18 C 180 36, 220 16, 260 28 C 300 14, 340 32, 384 18 C 424 30, 464 14, 508 10 L 508 90 L 12 90 Z"
                        fill="url(#sc-green-gradient)"
                      />

                      <path
                        d="M 12 76 C 40 64, 80 74, 136 58 C 180 72, 220 58, 260 68 C 300 58, 340 74, 384 60 C 424 72, 464 58, 508 52 L 508 90 L 12 90 Z"
                        fill="url(#sc-blue-gradient)"
                      />

                      <path
                        d="M 12 40 C 40 22, 80 34, 136 18 C 180 36, 220 16, 260 28 C 300 14, 340 32, 384 18 C 424 30, 464 14, 508 10"
                        fill="none"
                        stroke="#059669"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="animate-chart-line"
                      />

                      <path
                        d="M 12 76 C 40 64, 80 74, 136 58 C 180 72, 220 58, 260 68 C 300 58, 340 74, 384 60 C 424 72, 464 58, 508 52"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="animate-chart-line"
                      />
                    </g>

                    <text
                      x="12"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="start"
                    >
                      03 May
                    </text>

                    <text
                      x="136"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="middle"
                    >
                      10 May
                    </text>

                    <text
                      x="260"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="middle"
                    >
                      17 May
                    </text>

                    <text
                      x="384"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="middle"
                    >
                      24 May
                    </text>

                    <text
                      x="508"
                      y="114"
                      fontSize="11"
                      fontWeight="600"
                      fill="#2563eb"
                      textAnchor="end"
                    >
                      31 May
                    </text>
                  </svg>
                </div>
              </Panel>

              {/* =================================================
                  ACTION REQUIRED
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <button
                      type="button"
                      onClick={() => window.open("/pages", "_blank")}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      View All

                      <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                    </button>
                  }
                >
                  Action Required
                </PanelTitle>

                <div className="px-3 pt-2">
                  {liveIssues.map(
                    ({
                      label,
                      level,
                      count,
                      icon: Icon,
                      tone,
                    }) => (
                      <div
                        key={
                          label
                        }
                        className={`
                          grid
                          grid-cols-[24px_1fr_auto_22px]
                          items-center
                          gap-2
                          border-b
                          border-[#f0f0ec]
                          py-[6px]
                          px-2
                          mb-1
                          text-[10px]
                          last:border-b-0
                          last:mb-0
                          rounded-[6px]
                          
                          ${level === "High"
                            ? "bg-red-100"
                            : level === "Medium"
                              ? "bg-orange-100"
                              : "bg-yellow-100"
                          }
                        `}
                      >
                        <div
                          className={`
                            grid
                            h-[24px]
                            w-[24px]
                            place-items-center
                            rounded-[6px]

                            ${toneClass[
                            tone
                            ]
                            }
                          `}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <span
                          className="truncate font-semibold text-slate-900"
                          style={{
                            color:
                              "#0f172a",

                            fontWeight: 600,
                          }}
                        >
                          {label}
                        </span>

                        {/* ======================================
                            HIGH / MEDIUM / LOW BACKGROUND
                        ====================================== */}

                        <span
                          className={`
                            inline-flex
                            h-[22px]
                            min-w-[58px]
                            items-center
                            justify-center
                            rounded-[6px]
                            border
                            px-2
                            text-[9px]
                            font-semibold

                            ${level ===
                              "High"
                              ? "border-red-200 bg-red-100 text-red-700"
                              : level ===
                                "Medium"
                                ? "border-orange-200 bg-orange-100 text-orange-700"
                                : "border-yellow-200 bg-yellow-100 text-yellow-700"
                            }
                          `}
                        >
                          {level}
                        </span>

                        <span
                          className="
                            grid
                            h-[20px]
                            min-w-[20px]
                            place-items-center
                            rounded-full
                            bg-[#f8f2ee]
                            px-1
                            font-semibold
                            text-[#695b50]
                          "
                        >
                          {count}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </Panel>
            </div>

            {/* =============================
                ROW 3 — 260PX
            ============================== */}

            <div
              className="
                grid
                h-full
                min-h-0
                grid-cols-[0.92fr_1.12fr_1.06fr]
                gap-2
              "
            >
              {/* =================================================
                  ANALYTICS
              ================================================= */}

              <Panel className="flex h-full flex-col justify-between">
                <div>
                  <PanelTitle
                    right={
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                        >
                          View Report

                          <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                        </button>
                      </div>
                    }
                  >
                    Analytics Overview
                  </PanelTitle>

                  <div className="grid grid-cols-4 gap-1.5 px-3 pt-3">
                    {[
                      {
                        label:
                          "Users",

                        value:
                          analytics
                            ? number(
                              analytics.users,
                            )
                            : "—",

                        delta:
                          analytics
                            ? growthText(
                              analytics
                                .growth
                                .users,
                            )
                            : "No Live Data",

                        good:
                          true,

                        bg:
                          "bg-[#eff6ff] border-[#dbeafe]",

                        valColor:
                          "text-blue-900",
                      },

                      {
                        label:
                          "Page Views",

                        value:
                          analytics
                            ? number(
                              analytics.pageViews,
                            )
                            : "—",

                        delta:
                          analytics
                            ? growthText(
                              analytics
                                .growth
                                .pageViews,
                            )
                            : "No Live Data",

                        good:
                          true,

                        bg:
                          "bg-[#f0fdf4] border-[#dcfce7]",

                        valColor:
                          "text-emerald-900",
                      },

                      {
                        label:
                          "Avg. Session",

                        value:
                          analytics
                            ? duration(
                              analytics.averageSessionSeconds,
                            )
                            : "—",

                        delta:
                          analytics
                            ? growthText(
                              analytics
                                .growth
                                .averageSession,
                            )
                            : "No Live Data",

                        good:
                          true,

                        bg:
                          "bg-[#faf5ff] border-[#f3e8ff]",

                        valColor:
                          "text-purple-900",
                      },

                      {
                        label:
                          "Bounce Rate",

                        value:
                          analytics
                            ? `${analytics.bounceRate.toFixed(
                              1,
                            )}%`
                            : "—",

                        delta:
                          analytics
                            ? growthText(
                              analytics
                                .growth
                                .bounceRate,

                              true,
                            )
                            : "No Live Data",

                        good:
                          false,

                        bg:
                          "bg-[#fff7ed] border-[#ffedd5]",

                        valColor:
                          "text-amber-900",
                      },
                    ].map(
                      (item) => (
                        <div
                          key={
                            item.label
                          }
                          className={`
                            rounded-[7px]
                            border
                            px-2
                            py-1.5

                            ${item.bg}
                          `}
                          style={{
                            boxShadow:
                              "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px",
                          }}
                        >
                          <p className="text-[9px] font-bold text-[#334666]">
                            {
                              item.label
                            }
                          </p>

                          <p
                            className={`
                              mt-0.5
                              text-[17px]
                              font-semibold
                              ${item.valColor}
                            `}
                            style={{
                              fontWeight: 600,
                            }}
                          >
                            <AnimatedCounter
                              value={
                                item.value
                              }
                            />
                          </p>

                          <p
                            className={`
                              mt-0.5
                              text-[9px]
                              font-bold

                              ${item.good
                                ? "text-emerald-700"
                                : "text-rose-600"
                              }
                            `}
                          >
                            {
                              item.delta
                            }
                          </p>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                <div className="mt-auto w-full min-h-0 px-3 pt-0 pb-3">
                  <svg
                    viewBox="0 0 430 110"
                    preserveAspectRatio="none"
                    className="block h-[95px] w-full overflow-visible"
                  >
                    <defs>
                      <linearGradient
                        id="bar-blue-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                        />

                        <stop
                          offset="100%"
                          stopColor="#1d4ed8"
                        />
                      </linearGradient>

                      <linearGradient
                        id="bar-emerald-gradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#10b981"
                        />

                        <stop
                          offset="100%"
                          stopColor="#047857"
                        />
                      </linearGradient>
                    </defs>

                    <g
                      className="animate-grow-chart"
                      style={{
                        transformOrigin:
                          "215px 90px",
                      }}
                    >
                      {[
                        20,
                        44,
                        68,
                      ].map(
                        (y) => (
                          <line
                            key={
                              y
                            }
                            x1="12"
                            x2="420"
                            y1={
                              y
                            }
                            y2={
                              y
                            }
                            stroke="#e2e8f0"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                          />
                        ),
                      )}

                      <line
                        x1="12"
                        x2="420"
                        y1="90"
                        y2="90"
                        stroke="#cbd5e1"
                        strokeWidth="1.2"
                      />

                      {analyticsChartData.map(
                        (item) => (
                          <g
                            key={
                              item.date
                            }
                          >
                            <rect
                              x={
                                item.x -
                                12
                              }
                              y={
                                90 -
                                item.blueH
                              }
                              width="10"
                              height={
                                item.blueH
                              }
                              rx="3"
                              ry="3"
                              fill="url(#bar-blue-gradient)"
                            />

                            <rect
                              x={
                                item.x +
                                2
                              }
                              y={
                                90 -
                                item.emH
                              }
                              width="10"
                              height={
                                item.emH
                              }
                              rx="3"
                              ry="3"
                              fill="url(#bar-emerald-gradient)"
                            />

                            <text
                              x={
                                item.x
                              }
                              y="108"
                              textAnchor="middle"
                              fill="#2563eb"
                              fontSize="10.5"
                              fontWeight="600"
                            >
                              {
                                item.date
                              }
                            </text>
                          </g>
                        ),
                      )}
                    </g>
                  </svg>
                </div>
              </Panel>

              {/* =================================================
                  CORE WEB VITALS
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.open("/analytics", "_blank")}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        View Performance

                        <ArrowRight className="h-3.5 w-3.5 text-blue-600" />
                      </button>
                    </div>
                  }
                >
                  Core Web Vitals
                  (Field Data)
                </PanelTitle>

                <div className="grid grid-cols-3 gap-1.5 px-3 pt-3">
                  {[
                    {
                      label:
                        "Largest Contentful Paint (LCP)",

                      value:
                        pageSpeed?.lcp !=
                          null
                          ? `${(
                            pageSpeed.lcp /
                            1000
                          ).toFixed(
                            1,
                          )}s`
                          : "—",

                      status:
                        pageSpeed?.lcp ==
                          null
                          ? "No Data"
                          : pageSpeed.lcp <=
                            2500
                            ? "Good"
                            : pageSpeed.lcp <=
                              4000
                              ? "Needs Work"
                              : "Poor",

                      score:
                        pageSpeed?.lcp ==
                          null
                          ? "0%"
                          : pageSpeed.lcp <=
                            2500
                            ? "100%"
                            : pageSpeed.lcp <=
                              4000
                              ? "60%"
                              : "25%",

                      bg:
                        "bg-[#eff6ff] border-[#dbeafe]",

                      valColor:
                        "text-blue-900",

                      barColor:
                        "bg-blue-600",

                      scoreColor:
                        "text-blue-700",
                    },

                    {
                      label:
                        "Interaction to Next Paint (INP)",

                      value:
                        pageSpeed?.inp !=
                          null
                          ? `${Math.round(
                            pageSpeed.inp,
                          )}ms`
                          : "—",

                      status:
                        pageSpeed?.inp ==
                          null
                          ? "No Data"
                          : pageSpeed.inp <=
                            200
                            ? "Good"
                            : pageSpeed.inp <=
                              500
                              ? "Needs Work"
                              : "Poor",

                      score:
                        pageSpeed?.inp ==
                          null
                          ? "0%"
                          : pageSpeed.inp <=
                            200
                            ? "100%"
                            : pageSpeed.inp <=
                              500
                              ? "60%"
                              : "25%",

                      bg:
                        "bg-[#f0fdf4] border-[#dcfce7]",

                      valColor:
                        "text-emerald-900",

                      barColor:
                        "bg-emerald-600",

                      scoreColor:
                        "text-emerald-700",
                    },

                    {
                      label:
                        "Cumulative Layout Shift (CLS)",

                      value:
                        pageSpeed?.cls !=
                          null
                          ? pageSpeed.cls.toFixed(
                            2,
                          )
                          : "—",

                      status:
                        pageSpeed?.cls ==
                          null
                          ? "No Data"
                          : pageSpeed.cls <=
                            0.1
                            ? "Good"
                            : pageSpeed.cls <=
                              0.25
                              ? "Needs Work"
                              : "Poor",

                      score:
                        pageSpeed?.cls ==
                          null
                          ? "0%"
                          : pageSpeed.cls <=
                            0.1
                            ? "100%"
                            : pageSpeed.cls <=
                              0.25
                              ? "60%"
                              : "25%",

                      bg:
                        "bg-[#faf5ff] border-[#f3e8ff]",

                      valColor:
                        "text-purple-900",

                      barColor:
                        "bg-purple-600",

                      scoreColor:
                        "text-purple-700",
                    },
                  ].map(
                    (item) => (
                      <div
                        key={
                          item.label
                        }
                        className={`
                          rounded-[7px]
                          border
                          px-2
                          py-2

                          ${item.bg}
                        `}
                        style={{
                          boxShadow:
                            "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.08) 0px 0px 0px 1px",
                        }}
                      >
                        <p
                          className="text-[9.5px] font-bold text-slate-900"
                          style={{
                            color:
                              "#0f172a",

                            fontWeight: 700,
                          }}
                        >
                          {
                            item.label
                          }
                        </p>

                        <p
                          className={`
                            mt-1
                            text-[16px]
                            font-semibold
                            ${item.valColor}
                          `}
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          <AnimatedCounter
                            value={
                              item.value
                            }
                          />
                        </p>

                        <p
                          className={`
                            mt-0.5
                            text-[9px]
                            font-bold

                            ${item.status ===
                              "Good"
                              ? "text-emerald-700"
                              : item.status ===
                                "No Data"
                                ? "text-slate-500"
                                : item.status ===
                                  "Needs Work"
                                  ? "text-amber-700"
                                  : "text-red-700"
                            }
                          `}
                        >
                          {
                            item.status
                          }
                        </p>

                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200/60">
                          <div
                            className={`
                              h-full
                              rounded-full
                              ${item.barColor}
                            `}
                            style={{
                              width:
                                item.score,
                            }}
                          />
                        </div>

                        <p
                          className={`
                            mt-0.5
                            text-right
                            text-[8px]
                            font-bold
                            ${item.scoreColor}
                          `}
                        >
                          {item.status ===
                            "No Data"
                            ? "—"
                            : item.score}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                <div className="px-3 pt-2.5 pb-2">
                  <p
                    className="mb-1 text-[10px] font-semibold text-slate-900"
                    style={{
                      color:
                        "#0f172a",

                      fontWeight: 800,
                    }}
                  >
                    Other Performance
                    Metrics
                  </p>

                  <div className="grid grid-cols-[1fr_64px_64px] text-[9px] font-bold">
                    <div className="rounded-l-[4px] bg-[#eaeff5] px-2 py-1 text-black">
                      Metric
                    </div>

                    <div className="bg-[#eaeff5] px-2 py-1 text-center text-black">
                      Mobile
                    </div>

                    <div className="rounded-r-[4px] bg-[#eaeff5] px-2 py-1 text-center text-black">
                      Desktop
                    </div>

                    {[
                      [
                        "First Contentful Paint (FCP)",

                        pageSpeed?.fcp !=
                          null
                          ? `${(
                            pageSpeed.fcp /
                            1000
                          ).toFixed(
                            1,
                          )}s`
                          : "—",

                        "—",
                      ],

                      [
                        "Time to First Byte (TTFB)",
                        "—",
                        "—",
                        "#2563eb",
                      ],

                      [
                        "Total Blocking Time (TBT)",

                        pageSpeed?.tbt !=
                          null
                          ? `${Math.round(
                            pageSpeed.tbt,
                          )}ms`
                          : "—",

                        "—",

                        "#4B1426",
                      ],
                    ].map(
                      (row) => (
                        <div
                          key={
                            row[0]
                          }
                          className="contents"
                        >
                          <div
                            className="px-2 py-1 font-semibold text-slate-900"
                            style={{
                              color:
                                "#0f172a",

                              fontWeight: 600,
                            }}
                          >
                            {
                              row[0]
                            }
                          </div>

                          <div
                            className="px-2 py-1 text-center font-bold"
                            style={{
                              color:
                                row[3] ||
                                "#047857",
                            }}
                          >
                            {
                              row[1]
                            }
                          </div>

                          <div
                            className="px-2 py-1 text-center font-bold"
                            style={{
                              color:
                                row[3] ||
                                "#047857",
                            }}
                          >
                            {
                              row[2]
                            }
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </Panel>

              {/* =================================================
                  SITE STATUS
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <Link
                      href="#"
                      className="text-[9px] font-bold text-blue-600 hover:underline"
                    >
                      View Site Health
                    </Link>
                  }
                >
                  Site Status
                </PanelTitle>

                <div className="px-3">
                  {(siteStatus
                    ? [
                      [
                        LockKeyhole,
                        "SSL Certificate",

                        siteStatus.sslValid
                          ? "Valid"
                          : "Invalid",
                      ],

                      [
                        Timer,
                        "SSL Expiry",

                        siteStatus.certificateDaysRemaining !=
                          null
                          ? `${siteStatus.certificateDaysRemaining} Days · ${siteStatus.sslIssuer ??
                          "Issuer Unknown"
                          }`
                          : "Unavailable",
                      ],

                      [
                        ShieldCheck,
                        "Security Status",

                        `${siteStatus.securityHeaders.present}/${siteStatus.securityHeaders.total} Headers`,
                      ],

                      [
                        Timer,
                        "Current Availability",

                        siteStatus.online
                          ? `Online · ${siteStatus.responseTimeMs}ms`
                          : `HTTP ${siteStatus.httpStatus}`,
                      ],

                      [
                        Globe2,
                        "HTTP Status",

                        `${siteStatus.httpStatus}${siteStatus.redirected
                          ? " · Redirected"
                          : ""
                        }`,
                      ],

                      [
                        Globe2,
                        "Server IP",

                        siteStatus.ipAddress ??
                        "Unavailable",
                      ],

                      [
                        Wrench,
                        "Node.js Version",

                        siteStatus.nodeVersion,
                      ],
                    ]
                    : [
                      [
                        Activity,
                        "Website Health",

                        liveDashboard?.sources.siteStatus
                          ?.message ??
                        "Checking",
                      ],
                    ]
                  ).map(
                    ([
                      Icon,
                      label,
                      value,
                    ]) => (
                      <div
                        key={String(
                          label,
                        )}
                        className="
                          grid
                          grid-cols-[19px_1fr_auto_17px]
                          items-center
                          gap-2
                          border-b
                          border-[#f0f0ec]
                          py-[6px]
                          text-[10px]
                          last:border-b-0
                        "
                      >
                        <Icon className="h-4 w-4 text-[#3b4d70]" />

                        <span className="font-bold">
                          {label as string}
                        </span>

                        <span
                          className={`
                            font-bold

                            ${label ===
                              "Last Backup"
                              ? "text-[#4B1426]"
                              : label ===
                                "Security Status"
                                ? "text-blue-600"
                                : "text-emerald-700"
                            }
                          `}
                        >
                          {value as string}
                        </span>

                        <CheckCircle2
                          className={`
                            h-4
                            w-4

                            ${siteStatus
                              ? "text-emerald-700"
                              : "text-slate-400"
                            }
                          `}
                        />
                      </div>
                    ),
                  )}
                </div>
              </Panel>
            </div>

            {/* =============================
                BOTTOM ROW — 160PX
            ============================== */}

            <div
              className="
                grid
                h-full
                min-h-0
                grid-cols-[1.02fr_1fr_1fr_1.12fr]
                gap-2
              "
            >
              {/* =================================================
                  TOP PAGES
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <a
                      href="/pages"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-blue-600 hover:underline"
                    >
                      View All
                    </a>
                  }
                >
                  Top Pages by
                  Traffic
                </PanelTitle>

                <div className="px-3 text-[9px]">
                  {liveTopPages.map(
                    (
                      row,
                      index,
                    ) => (
                      <div
                        key={
                          row[0]
                        }
                        className="
                          grid
                          grid-cols-[16px_1fr_76px_42px_14px]
                          items-center
                          gap-2
                          py-1.5
                          font-bold
                        "
                      >
                        <span>
                          {index +
                            1}
                          .
                        </span>

                        <span>
                          {
                            row[0]
                          }
                        </span>

                        <span className="truncate text-[#4B1426]">
                          {
                            row[1]
                          }
                        </span>

                        <span className="text-right">
                          {
                            row[2]
                          }
                        </span>

                        <Search className="h-3 w-3 text-[#9aa5b4]" />
                      </div>
                    ),
                  )}
                </div>
              </Panel>

              {/* =================================================
                  KEYWORD PERFORMANCE
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <a
                      href="/seo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-blue-600 hover:underline"
                    >
                      View Data
                    </a>
                  }
                >
                  Keyword Performance
                </PanelTitle>

                <div className="grid grid-cols-[1fr_42px_62px_50px] gap-1 px-3 text-[9px] font-bold">
                  <span>
                    Keyword
                  </span>

                  <span>
                    Clicks
                  </span>

                  <span>
                    Impressions
                  </span>

                  <span>
                    Position
                  </span>

                  {liveKeywordRows.map(
                    (row) => (
                      <div
                        className="contents"
                        key={
                          row[0]
                        }
                      >
                        <span className="py-[3px]">
                          {
                            row[0]
                          }
                        </span>

                        <span className="py-[3px]">
                          {
                            row[1]
                          }
                        </span>

                        <span className="py-[3px]">
                          {
                            row[2]
                          }
                        </span>

                        <span className="py-[3px] text-emerald-700">
                          {
                            row[3]
                          }{" "}
                          ↑
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </Panel>

              {/* =================================================
                  LOCATIONS
              ================================================= */}

              <Panel>
                <PanelTitle
                  right={
                    <a
                      href="/analytics"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[9px] font-bold text-blue-600 hover:underline"
                    >
                      View Report
                    </a>
                  }
                >
                  Top Sewa Help
                  Locations
                </PanelTitle>

                <div className="space-y-3 px-3 pt-1 pb-1">
                  {locationRows.map(
                    (
                      [
                        name,
                        count,
                        pct,
                      ],

                      index,
                    ) => (
                      <div
                        key={String(
                          name,
                        )}
                        className="
                          grid
                          grid-cols-[62px_1fr_28px_42px]
                          items-center
                          gap-1.5
                          text-[9px]
                          font-bold
                        "
                      >
                        <span className="text-[#4B1426]">
                          {
                            name
                          }
                        </span>

                        <div className="h-1.5 rounded-full bg-[#edf2f8]">
                          <div
                            className="h-full rounded-full bg-[#4B1426]"
                            style={{
                              width: `${88 -
                                index *
                                14
                                }%`,
                            }}
                          />
                        </div>

                        <span className="text-right">
                          {
                            count
                          }
                        </span>

                        <span className="text-right text-emerald-700">
                          (
                          {
                            pct
                          }
                          )
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </Panel>

              {/* =================================================
                  RECENT SUBMISSIONS
              ================================================= */}

              <Panel
                style={{
                  boxShadow:
                    "rgba(0, 0, 0, 0.05) 0px 0px 0px 1px",
                }}
              >
                <PanelTitle
                  right={
                    <button
                      type="button"
                      onClick={() => window.open("/submissions", "_blank")}
                      className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700"
                    >
                      View All

                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  }
                >
                  Recent Form
                  Submissions
                </PanelTitle>

                <div className="px-3">
                  {submissionRows.map(
                    (
                      row,
                      index,
                    ) => (
                      <div
                        key={
                          row.id
                        }
                        className="
                          grid
                          grid-cols-[20px_auto_auto_1fr]
                          items-center
                          gap-1.5
                          py-[3px]
                          text-[9px]
                          font-bold
                        "
                      >
                        <div
                          className={`
                            grid
                            h-[20px]
                            w-[20px]
                            place-items-center
                            rounded-full

                            ${index === 0
                              ? "bg-emerald-50 text-emerald-700"
                              : index === 1
                                ? "bg-violet-50 text-violet-700"
                                : index === 2
                                  ? "bg-amber-50 text-amber-700"
                                  : index === 3
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-blue-50 text-blue-700"
                            }
                          `}
                        >
                          <FileText className="h-3 w-3" />
                        </div>

                        <span className="whitespace-nowrap text-[#4B1426]">
                          {
                            row.name
                          }
                        </span>

                        <span className="whitespace-nowrap text-blue-600">
                          {
                            row.action
                          }
                        </span>

                        <span className="whitespace-nowrap text-right text-[#43526d]">
                          {
                            row.date
                          }
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </Panel>
            </div>
          </div>
        </main>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="hidden">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[28px] bg-[linear-gradient(to_top,rgba(214,230,220,0.55),rgba(250,249,246,0))]" />

          <div
            className="pointer-events-none absolute bottom-0 right-0 z-0 h-full w-[370px] bg-no-repeat"
            style={{
              backgroundImage:
                'url("/assets/footer-moksha-scene.png")',

              backgroundSize:
                "370px 64px",

              backgroundPosition:
                "right bottom",
            }}
          />

          <div className="relative z-10 flex h-full items-center px-4 pr-[390px]">
            <div className="flex w-full items-center justify-center">
              <p className="text-center text-[11px] font-semibold text-slate-600">
                &copy;{" "}
                {new Date().getFullYear()}{" "}

                <span className="font-semibold text-slate-900">
                  Namo Gange Trust
                </span>{" "}

                — Free Cremation
                Assistance. Admin
                Panel. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
