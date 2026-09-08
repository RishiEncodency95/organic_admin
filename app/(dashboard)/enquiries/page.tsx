"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  ArrowRight,
  ArrowUp,
  Award,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Handshake,
  Headphones,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  UserPlus,
  Users,
} from "lucide-react";

import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";

import { enquiriesApi } from "@/lib/enquiriesApi";
import { Enquiry, EnquiryStatus } from "@/lib/types";
import {
  ENQUIRY_STATUS_META,
  formatDateTime,
} from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

/* ============================================================
   FILTERS
============================================================ */

const STATUS_OPTIONS: {
  key: EnquiryStatus | "";
  label: string;
}[] = [
    {
      key: "",
      label: "All Status",
    },
    {
      key: "new",
      label: "New",
    },
    {
      key: "contacted",
      label: "Contacted",
    },
    {
      key: "closed",
      label: "Closed",
    },
  ];

const SOURCE_OPTIONS = [
  {
    key: "",
    label: "All Sources",
  },
  {
    key: "contact",
    label: "Contact",
  },
  {
    key: "csr",
    label: "CSR",
  },
  {
    key: "partnership",
    label: "Partnership",
  },
  {
    key: "unclaimed_body",
    label: "Unclaimed Body",
  },
] as const;

const SOURCE_LABELS: Record<
  Enquiry["category"],
  string
> = {
  contact: "Contact",
  csr: "CSR Support",
  partnership: "Partnership",
  unclaimed_body: "Unclaimed Body",
};

type DateRangeFilter =
  | "ALL"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH";

/* ============================================================
   HELPERS
============================================================ */

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function isCurrentMonth(value?: string) {
  const date = parseDate(value);

  if (!date) {
    return false;
  }

  const now = new Date();

  return (
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function matchesDateRange(
  value: string | undefined,
  range: DateRangeFilter
) {
  if (range === "ALL") {
    return true;
  }

  const date = parseDate(value);

  if (!date) {
    return false;
  }

  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  if (range === "TODAY") {
    return date >= startOfToday;
  }

  if (range === "THIS_MONTH") {
    return (
      date.getFullYear() ===
      now.getFullYear() &&
      date.getMonth() ===
      now.getMonth()
    );
  }

  const days =
    range === "LAST_7_DAYS"
      ? 7
      : 30;

  const startDate = new Date(
    startOfToday
  );

  startDate.setDate(
    startDate.getDate() -
    (days - 1)
  );

  return date >= startDate;
}

function percentage(
  value: number,
  total: number
) {
  if (!total) {
    return 0;
  }

  return (value / total) * 100;
}

function getSourceLabel(
  category?: Enquiry["category"]
) {
  return SOURCE_LABELS[
    category ?? "contact"
  ];
}

function getPurpose(enquiry: Enquiry) {
  return (
    enquiry.interest?.trim() ||
    enquiry.message?.trim() ||
    "General Enquiry"
  );
}

function getOrganization(enquiry: Enquiry) {
  return (
    enquiry.organization?.trim() ||
    enquiry.name ||
    "—"
  );
}

function getContactName(enquiry: Enquiry) {
  if (
    enquiry.organization?.trim() &&
    enquiry.name
  ) {
    return enquiry.name;
  }

  return enquiry.designation || "";
}

/* ============================================================
   UI META
============================================================ */

function sourceStyle(
  category?: Enquiry["category"]
) {
  switch (category ?? "contact") {
    case "csr":
      return {
        background: "#E7F2FE",
        color: "#2C74C7",
        border: "#D2E5FA",
      };

    case "partnership":
      return {
        background: "#E5F5E8",
        color: "#257A44",
        border: "#CEE9D4",
      };

    case "unclaimed_body":
      return {
        background: "#FCE8ED",
        color: "#D65570",
        border: "#F6D5DD",
      };

    default:
      return {
        background: "#F1F3F6",
        color: "#56627C",
        border: "#E2E6EB",
      };
  }
}

function statusStyle(
  status: EnquiryStatus
) {
  switch (status) {
    case "new":
      return {
        background: "#E8F2FE",
        color: "#2875CD",
        border: "#D5E7FA",
      };

    case "contacted":
      return {
        background: "#FFF0D9",
        color: "#D98E16",
        border: "#F8DFB5",
      };

    case "closed":
      return {
        background: "#E4F4E7",
        color: "#247943",
        border: "#CFE9D5",
      };

    default:
      return {
        background: "#F3F4F6",
        color: "#475467",
        border: "#E4E7EC",
      };
  }
}

function getPriority(
  enquiry: Enquiry
): "High" | "Medium" | "Low" {
  if (
    enquiry.category ===
    "unclaimed_body"
  ) {
    return "High";
  }

  if (enquiry.category === "csr") {
    return "High";
  }

  if (
    enquiry.category ===
    "partnership"
  ) {
    return "Medium";
  }

  return "Low";
}

function priorityColor(
  priority: "High" | "Medium" | "Low"
) {
  if (priority === "High") {
    return "#E11D2E";
  }

  if (priority === "Medium") {
    return "#F5A016";
  }

  return "#1B9A54";
}

/* ============================================================
   SPARKLINE GENERATOR
============================================================ */

function makeSparkline(
  enquiries: Enquiry[],
  matcher?: (item: Enquiry) => boolean
) {
  const filtered = matcher
    ? enquiries.filter(matcher)
    : enquiries;

  if (!filtered.length) {
    return "3,25 20,25 37,25 54,25 71,25 88,25 105,25 122,25 139,25 156,25 177,25";
  }

  const validDates = enquiries
    .map((item) =>
      parseDate(item.createdAt)
    )
    .filter(
      (date): date is Date =>
        Boolean(date)
    );

  const anchor =
    validDates.length > 0
      ? new Date(
        Math.max(
          ...validDates.map((date) =>
            date.getTime()
          )
        )
      )
      : new Date();

  const days: number[] = [];

  for (let index = 10; index >= 0; index--) {
    const target = new Date(anchor);

    target.setHours(0, 0, 0, 0);
    target.setDate(
      target.getDate() - index
    );

    const nextDay =
      new Date(target);

    nextDay.setDate(
      nextDay.getDate() + 1
    );

    const count = filtered.filter(
      (item) => {
        const date =
          parseDate(item.createdAt);

        if (!date) {
          return false;
        }

        return (
          date >= target &&
          date < nextDay
        );
      }
    ).length;

    days.push(count);
  }

  const max = Math.max(...days, 1);

  return days
    .map((value, index) => {
      const x =
        3 +
        index *
        ((177 - 3) /
          (days.length - 1));

      const y =
        26 -
        (value / max) * 20;

      return `${x.toFixed(
        1
      )},${y.toFixed(1)}`;
    })
    .join(" ");
}

/* ============================================================
   MINI TREND
============================================================ */

function MiniTrend({
  color,
  points,
}: {
  color: string;
  points: string;
}) {
  return (
    <svg
      viewBox="0 0 180 31"
      preserveAspectRatio="none"
      className="
        mt-[6px]
        h-[25px]
        w-full
      "
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points
        .split(" ")
        .map((point, index) => {
          const [x, y] =
            point.split(",");

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="1.6"
              fill={color}
            />
          );
        })}
    </svg>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

type StatCardProps = {
  label: string;
  value: number | string;
  change?: string;

  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: CSSProperties;
  }>;

  iconBg: string;
  iconColor: string;

  graphColor: string;
  graphPoints: string;
};

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg,
  iconColor,
  graphColor,
  graphPoints,
}: StatCardProps) {
  return (
    <div
      className="
        flex
        flex-col
        justify-between
        h-[116px]
        min-w-0
        rounded-[7px]
        border
        border-[#E2E6EB]
        bg-white
        px-[10px]
        py-[9px]
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-[8px]
        "
      >
        <div
          className="
            flex
            h-[40px]
            w-[40px]
            shrink-0
            items-center
            justify-center
            rounded-full
          "
          style={{
            backgroundColor: iconBg,
          }}
        >
          <Icon
            size={20}
            strokeWidth={2}
            style={{
              color: iconColor,
            }}
          />
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <p
            className="
              break-words
              text-[9px]
              font-semibold
              uppercase
              tracking-wider
              leading-[11px]
              text-[#172762]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-[2px]
              whitespace-nowrap
              text-2xl
              font-semibold
              leading-none
              text-[#00632F]
            "
          >
            {value}
          </p>
        </div>
      </div>

      <div
        className="
          flex
          w-full
          items-center
          justify-start
          gap-[4px]
          whitespace-nowrap
          text-left
        "
      >
        {change === "Live" || !change ? (
          <span className="rounded-[4px] bg-[#E4F5E8] px-[5px] py-[1px] text-[9px] font-semibold text-[#238B4C]">
            Live
          </span>
        ) : (
          <>
            <ArrowUp
              size={10}
              strokeWidth={3}
              className="shrink-0 text-[#179249]"
            />

            <span className="text-[9px] font-semibold text-[#179249]">
              {change}
            </span>
          </>
        )}

        <span className="text-[9px] font-semibold text-[#536181]">
          current data
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   FILTER SELECT
============================================================ */

function FilterSelect({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div
      className="
        relative
        min-w-0
      "
    >
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          h-[40px]
          w-full
          appearance-none
          rounded-[6px]
          border
          border-[#E0E5EB]
          bg-white
          px-[11px]
          pr-[29px]
          text-[10px]
          font-semibold
          text-[#172762]
          outline-none
        "
      >
        {children}
      </select>

      <ChevronDown
        size={12}
        className="
          pointer-events-none
          absolute
          right-[10px]
          top-1/2
          -translate-y-1/2
          text-[#172762]
        "
      />
    </div>
  );
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] =
    useState<Enquiry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") as Enquiry["category"] | null;

  const [tab, setTab] =
    useState<EnquiryStatus | "">("");

  const [source, setSource] =
    useState<Enquiry["category"] | "">(
      categoryParam || ""
    );

  useEffect(() => {
    if (categoryParam) {
      setSource(categoryParam);
    }
  }, [categoryParam]);

  const [search, setSearch] =
    useState("");

  const [
    dateRangeFilter,
    setDateRangeFilter,
  ] = useState<DateRangeFilter>("ALL");

  const [selected, setSelected] =
    useState<Enquiry | null>(null);

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [perPage, setPerPage] =
    useState(8);

  /* ==========================================================
     API LOAD
  ========================================================== */

  const load = () => {
    setLoading(true);

    enquiriesApi
      .list()
      .then(setEnquiries)
      .catch(() => {
        setEnquiries([]);
      })
      .finally(() =>
        setLoading(false)
      );
  };

  useEffect(() => {
    load();
  }, []);

  /* ==========================================================
     STATUS UPDATE
  ========================================================== */

  const handleStatusChange =
    async (
      id: string,
      status: EnquiryStatus
    ) => {
      setBusy(true);
      setError("");

      try {
        const updated =
          await enquiriesApi.updateStatus(
            id,
            status
          );

        setEnquiries((previous) =>
          previous.map((item) =>
            item._id === id
              ? updated
              : item
          )
        );

        setSelected((previous) =>
          previous &&
            previous._id === id
            ? updated
            : previous
        );
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not update this enquiry."
        );
      } finally {
        setBusy(false);
      }
    };

  /* ==========================================================
     STATS
  ========================================================== */

  const totalEnquiries =
    enquiries.length;

  const newThisMonth = useMemo(
    () =>
      enquiries.filter((item) =>
        isCurrentMonth(
          item.createdAt
        )
      ).length,
    [enquiries]
  );

  const newCount = useMemo(
    () =>
      enquiries.filter(
        (item) =>
          item.status === "new"
      ).length,
    [enquiries]
  );

  const contactedCount =
    useMemo(
      () =>
        enquiries.filter(
          (item) =>
            item.status ===
            "contacted"
        ).length,
      [enquiries]
    );

  const closedCount = useMemo(
    () =>
      enquiries.filter(
        (item) =>
          item.status === "closed"
      ).length,
    [enquiries]
  );

  /* ==========================================================
     FILTERED DATA
  ========================================================== */

  const filteredEnquiries =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return enquiries
        .filter((item) => {
          if (!tab) {
            return true;
          }

          return (
            item.status === tab
          );
        })

        .filter((item) => {
          if (!source) {
            return true;
          }

          return (
            (item.category ??
              "contact") === source
          );
        })

        .filter((item) =>
          matchesDateRange(
            item.createdAt,
            dateRangeFilter
          )
        )

        .filter((item) => {
          if (!query) {
            return true;
          }

          const content = [
            item.name,
            item.organization,
            item.designation,
            item.phone,
            item.email,
            item.message,
            item.interest,
            item.city,
            item.authority,
            item.reference,
            getSourceLabel(
              item.category
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return content.includes(
            query
          );
        })

        .sort((a, b) => {
          const aTime =
            parseDate(
              a.createdAt
            )?.getTime() ?? 0;

          const bTime =
            parseDate(
              b.createdAt
            )?.getTime() ?? 0;

          return bTime - aTime;
        });
    }, [
      enquiries,
      tab,
      source,
      search,
      dateRangeFilter,
    ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEnquiries.length /
      perPage
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const startIndex =
    (safePage - 1) * perPage;

  const endIndex = Math.min(
    startIndex + perPage,
    filteredEnquiries.length
  );

  const pageRows =
    filteredEnquiries.slice(
      startIndex,
      endIndex
    );

  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summaryRows = [
    {
      label: "New",
      value: newCount,
      color: "#2087E5",
    },
    {
      label: "Contacted",
      value: contactedCount,
      color: "#F5A014",
    },
    {
      label: "Closed",
      value: closedCount,
      color: "#8552DD",
    },
  ];

  /* ==========================================================
     SOURCE / PURPOSE STATS
  ========================================================== */

  const categoryStats =
    useMemo(() => {
      return (
        [
          "csr",
          "partnership",
          "contact",
          "unclaimed_body",
        ] as Enquiry["category"][]
      )
        .map((category) => {
          const value =
            enquiries.filter(
              (item) =>
                (item.category ??
                  "contact") ===
                category
            ).length;

          return {
            category,
            label:
              getSourceLabel(
                category
              ),
            value,
            percentage:
              percentage(
                value,
                totalEnquiries
              ),
          };
        })
        .filter(
          (item) =>
            item.value > 0
        );
    }, [
      enquiries,
      totalEnquiries,
    ]);

  const maxCategory =
    Math.max(
      ...categoryStats.map(
        (item) => item.value
      ),
      1
    );

  const categoryColors = [
    "#188B49",
    "#1979DF",
    "#8350DD",
    "#F4A014",
  ];

  /* ==========================================================
     RESET
  ========================================================== */

  function resetFilters() {
    setSearch("");
    setTab("");
    setSource("");
    setDateRangeFilter("ALL");
    setPage(1);
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <section
      className="
        w-full
        min-w-0
        bg-white
        px-[16px]
        pb-[14px]
        pt-[11px]
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-[20px]
        "
      >
        <div className="min-w-0 overflow-hidden">
          <h1
            className="
              text-[20px]
              font-semibold
              leading-[25px]
              tracking-[-0.35px]
              text-[#005E2E]
            "
          >
            {source === "contact"
              ? "General Enquiries"
              : source === "csr"
                ? "CSR & Partners Enquiries"
                : source === "partnership"
                  ? "Partnership Enquiries"
                  : source === "unclaimed_body"
                    ? "Unclaimed Body Sewa Enquiries"
                    : "All Enquiries"}
          </h1>

          <p
            className="
              mt-[2px]
              text-[9px]
              font-semibold
              leading-[14px]
              text-[#344574]
            "
          >
            {source === "contact"
              ? "Manage general queries, contact submissions and helpline requests."
              : source === "csr"
                ? "Manage corporate CSR queries and partnership opportunities in one place."
                : source === "partnership"
                  ? "Manage institutional and NGO partnership proposals."
                  : source === "unclaimed_body"
                    ? "Manage emergency alerts and unclaimed body sewa requests."
                    : "Manage all general, contact, CSR and partnership enquiries in one place."}
          </p>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-[12px]
            pt-[2px]
          "
        >
          <button
            type="button"
            className="
              flex
              h-[36px]
              items-center
              gap-[8px]
              rounded-[5px]
              border
              border-[#E0E5EB]
              bg-white
              px-[15px]
              text-[9px]
              font-semibold
              text-[#172762]
            "
          >
            <Download size={14} />

            Export
          </button>

          <button
            type="button"
            className="
              flex
              h-[36px]
              items-center
              gap-[8px]
              rounded-[5px]
              border
              border-[#E0E5EB]
              bg-white
              px-[15px]
              text-[9px]
              font-semibold
              text-[#172762]
            "
          >
            <SlidersHorizontal
              size={14}
            />

            Filters
          </button>

          <Link
            href="/enquiries/new?category=csr"
            className="
              flex
              h-[36px]
              items-center
              gap-[8px]
              rounded-[5px]
              bg-[#005F2E]
              px-[17px]
              text-[9px]
              font-semibold
              text-white
              shadow-[0_2px_5px_rgba(0,95,46,0.13)]
              hover:bg-[#004d25]
              transition
            "
          >
            <Plus size={15} />

            Add New Enquiry
          </Link>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="
            mt-[10px]
            rounded-[6px]
            border
            border-red-200
            bg-red-50
            px-[11px]
            py-[8px]
            text-[9px]
            font-semibold
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div
        className="
          mt-[22px]
          grid
          min-w-0
          grid-cols-[minmax(0,1fr)_285px]
          gap-[16px]
        "
      >
        {/* ====================================================
            LEFT
        ==================================================== */}

        <main className="min-w-0 overflow-hidden">
          {/* ==================================================
              STATS
          ================================================== */}

          <div className="w-full min-w-0 overflow-x-auto pb-[4px]">
            <div
              className="
                grid
                w-full
                min-w-[1100px]
                grid-cols-5
                gap-[10px]
              "
            >
            <StatCard
              label="Total Enquiries"
              value={totalEnquiries}
              change="Live"
              icon={Handshake}
              iconBg="#E7F6EA"
              iconColor="#258E4C"
              graphColor="#299D55"
              graphPoints={makeSparkline(
                enquiries
              )}
            />

            <StatCard
              label="New This Month"
              value={newThisMonth}
              change={`${percentage(
                newThisMonth,
                totalEnquiries
              ).toFixed(1)}%`}
              icon={FileText}
              iconBg="#E8F2FF"
              iconColor="#2777D7"
              graphColor="#2F83E6"
              graphPoints={makeSparkline(
                enquiries,
                (item) =>
                  isCurrentMonth(
                    item.createdAt
                  )
              )}
            />

            <StatCard
              label="New Enquiries"
              value={newCount}
              change={`${percentage(
                newCount,
                totalEnquiries
              ).toFixed(1)}%`}
              icon={Users}
              iconBg="#FFF0DB"
              iconColor="#EF8D19"
              graphColor="#F29A1E"
              graphPoints={makeSparkline(
                enquiries,
                (item) =>
                  item.status === "new"
              )}
            />

            <StatCard
              label="In Discussion"
              value={contactedCount}
              change={`${percentage(
                contactedCount,
                totalEnquiries
              ).toFixed(1)}%`}
              icon={Send}
              iconBg="#F0E7FD"
              iconColor="#9142DD"
              graphColor="#9B55E5"
              graphPoints={makeSparkline(
                enquiries,
                (item) =>
                  item.status ===
                  "contacted"
              )}
            />

            <StatCard
              label="Closed Enquiries"
              value={closedCount}
              change={`${percentage(
                closedCount,
                totalEnquiries
              ).toFixed(1)}%`}
              icon={Award}
              iconBg="#E8F6E9"
              iconColor="#228D49"
              graphColor="#23944D"
              graphPoints={makeSparkline(
                enquiries,
                (item) =>
                  item.status ===
                  "closed"
              )}
            />
          </div>
          </div>

          {/* ==================================================
              FILTERS
          ================================================== */}

          <div
            className="
              mt-[20px]
              grid
              min-w-0
              grid-cols-[minmax(245px,2fr)_130px_145px_minmax(145px,1fr)_78px]
              gap-[9px]
            "
          >
            {/* SEARCH */}

            <div
              className="
                flex
                h-[40px]
                min-w-0
                items-center
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[11px]
              "
            >
              <input
                value={search}
                onChange={(
                  event
                ) => {
                  setSearch(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder="Search by organization, contact person, email or subject..."
                className="
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[10px]
                  font-semibold
                  text-[#172762]
                  outline-none
                  placeholder:text-[#566483]
                "
              />

              <Search
                size={15}
                className="
                  ml-[7px]
                  shrink-0
                  text-[#263D7A]
                "
              />
            </div>

            {/* STATUS */}

            <FilterSelect
              value={tab}
              onChange={(value) => {
                setTab(
                  value as
                  | EnquiryStatus
                  | ""
                );

                setPage(1);
              }}
            >
              {STATUS_OPTIONS.map(
                (item) => (
                  <option
                    key={item.key}
                    value={item.key}
                  >
                    {item.label}
                  </option>
                )
              )}
            </FilterSelect>

            {/* SOURCE */}

            <FilterSelect
              value={source}
              onChange={(value) => {
                setSource(
                  value as
                  | Enquiry["category"]
                  | ""
                );

                setPage(1);
              }}
            >
              {SOURCE_OPTIONS.map(
                (item) => (
                  <option
                    key={item.key}
                    value={item.key}
                  >
                    {item.label}
                  </option>
                )
              )}
            </FilterSelect>

            {/* DATE */}

            <div
              className="
                relative
                flex
                h-[40px]
                min-w-0
                items-center
                gap-[8px]
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[11px]
                text-[9px]
                font-semibold
                text-[#56617F]
              "
            >
              <CalendarRange
                size={14}
                className="
                  shrink-0
                  text-[#273F7B]
                "
              />

              <select
                value={dateRangeFilter}
                onChange={(event) => {
                  setDateRangeFilter(
                    event.target
                      .value as DateRangeFilter
                  );

                  setPage(1);
                }}
                className="
                  h-full
                  min-w-[128px]
                  cursor-pointer
                  appearance-none
                  bg-transparent
                  pr-[22px]
                  text-[9px]
                  font-semibold
                  text-[#56617F]
                  outline-none
                "
              >
                <option value="ALL">
                  Select Date
                </option>

                <option value="TODAY">
                  Today
                </option>

                <option value="LAST_7_DAYS">
                  Last 7 Days
                </option>

                <option value="LAST_30_DAYS">
                  Last 30 Days
                </option>

                <option value="THIS_MONTH">
                  This Month
                </option>
              </select>

              <ChevronDown
                size={12}
                className="
                  pointer-events-none
                  absolute
                  right-[10px]
                  top-1/2
                  -translate-y-1/2
                  text-[#273F7B]
                "
              />
            </div>

            {/* RESET */}

            <button
              type="button"
              onClick={resetFilters}
              className="
                flex
                h-[40px]
                items-center
                justify-center
                gap-[5px]
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[7px]
                text-[9px]
                font-semibold
                text-[#172762]
              "
            >
              <RotateCcw size={12} />

              Reset
            </button>
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div
            className="
              mt-[11px]
              min-w-0
              overflow-x-auto
              rounded-[6px]
              border
              border-[#E2E6EB]
              bg-white
            "
          >
            <table
              className="
                w-full
                min-w-[1100px]
                table-fixed
                border-collapse
              "
            >
              <colgroup>
                <col
                  style={{
                    width: "9%",
                  }}
                />

                <col
                  style={{
                    width: "20%",
                  }}
                />

                <col
                  style={{
                    width: "12%",
                  }}
                />

                <col
                  style={{
                    width: "18%",
                  }}
                />

                <col
                  style={{
                    width: "11%",
                  }}
                />

                <col
                  style={{
                    width: "9%",
                  }}
                />

                <col
                  style={{
                    width: "13%",
                  }}
                />

                <col
                  style={{
                    width: "8%",
                  }}
                />
              </colgroup>

              {/* HEADER */}

              <thead>
                <tr
                  className="
                    h-[35px]
                    bg-[#005F2E]
                    text-left
                    text-white
                  "
                >
                  <th className="px-[8px] text-[9px] font-semibold uppercase tracking-wider">
                    ID
                  </th>

                  <th className="px-[8px] text-[9px] font-semibold uppercase tracking-wider">
                    Organization / Contact
                  </th>

                  <th className="px-[7px] text-[9px] font-semibold uppercase tracking-wider">
                    Enquiry Type
                  </th>

                  <th className="px-[8px] text-[9px] font-semibold uppercase tracking-wider">
                    Purpose / Interest
                  </th>

                  <th className="px-[7px] text-[9px] font-semibold uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-[7px] text-[9px] font-semibold uppercase tracking-wider">
                    Priority
                  </th>

                  <th className="px-[7px] text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">
                    Received On
                  </th>

                  <th className="px-[7px] text-[9px] font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              {/* BODY */}

              <tbody>
                {loading &&
                  Array.from({
                    length: 8,
                  }).map(
                    (_, index) => (
                      <tr
                        key={`loading-${index}`}
                        className="
                          h-[68px]
                          border-b
                          border-[#E8EBEF]
                        "
                      >
                        <td
                          colSpan={8}
                          className="px-[10px]"
                        >
                          <div
                            className="
                              h-[11px]
                              w-full
                              animate-pulse
                              rounded
                              bg-[#F1F3F5]
                            "
                          />
                        </td>
                      </tr>
                    )
                  )}

                {!loading &&
                  pageRows.map(
                    (enquiry) => {
                      const typeMeta =
                        sourceStyle(
                          enquiry.category
                        );

                      const statusMeta =
                        statusStyle(
                          enquiry.status
                        );

                      const priority =
                        getPriority(
                          enquiry
                        );

                      return (
                        <tr
                          key={
                            enquiry._id
                          }
                          onClick={() =>
                            setSelected(
                              enquiry
                            )
                          }
                          className="
                            h-[68px]
                            cursor-pointer
                            border-b
                            border-[#E8EBEF]
                            bg-white
                            last:border-b-0
                            hover:bg-[#FBFCFD]
                          "
                        >
                          {/* ID */}

                          <td
                            className="
                              px-[8px]
                              align-middle
                            "
                          >
                            <span
                              className="
                                block
                                truncate
                                text-[9px]
                                font-semibold
                                text-[#13763E]
                              "
                              title={
                                enquiry._id
                              }
                            >
                              {enquiry.reference ||
                                enquiry._id}
                            </span>
                          </td>

                          {/* ORGANIZATION */}

                          <td
                            className="
                              min-w-0
                              px-[8px]
                              align-middle
                            "
                          >
                            <p
                              className="
                                truncate
                                text-[9px]
                                font-semibold
                                leading-[14px]
                                text-[#192B66]
                              "
                            >
                              {getOrganization(
                                enquiry
                              )}
                            </p>

                            {getContactName(
                              enquiry
                            ) && (
                                <p
                                  className="
                                  mt-[3px]
                                  truncate
                                  text-[9px]
                                  font-semibold
                                  leading-[12px]
                                  text-[#344576]
                                "
                                >
                                  {getContactName(
                                    enquiry
                                  )}
                                </p>
                              )}

                            <p
                              className="
                                mt-[2px]
                                truncate
                                text-[9px]
                                font-semibold
                                leading-[12px]
                                text-[#344576]
                              "
                            >
                              {enquiry.email ||
                                enquiry.phone ||
                                "—"}
                            </p>
                          </td>

                          {/* TYPE */}

                          <td
                            className="
                              px-[6px]
                              align-middle
                            "
                          >
                            <span
                              className="
                                inline-flex
                                max-w-full
                                items-center
                                whitespace-nowrap
                                rounded-[4px]
                                border
                                px-[8px]
                                py-[4px]
                                text-[9px]
                                font-semibold
                                leading-none
                              "
                              style={{
                                backgroundColor:
                                  typeMeta.background,

                                color:
                                  typeMeta.color,

                                borderColor:
                                  typeMeta.border,
                              }}
                            >
                              {getSourceLabel(
                                enquiry.category
                              )}
                            </span>
                          </td>

                          {/* PURPOSE */}

                          <td
                            className="
                              min-w-0
                              px-[8px]
                              align-middle
                            "
                          >
                            <p
                              className="
                                line-clamp-2
                                text-[9px]
                                font-semibold
                                leading-[11px]
                                text-[#26396F]
                              "
                            >
                              {getPurpose(
                                enquiry
                              )}
                            </p>
                          </td>

                          {/* STATUS */}

                          <td
                            className="
                              px-[6px]
                              align-middle
                            "
                          >
                            <span
                              className="
                                inline-flex
                                whitespace-nowrap
                                rounded-[4px]
                                border
                                px-[8px]
                                py-[4px]
                                text-[9px]
                                font-semibold
                                leading-none
                              "
                              style={{
                                backgroundColor:
                                  statusMeta.background,

                                color:
                                  statusMeta.color,

                                borderColor:
                                  statusMeta.border,
                              }}
                            >
                              {
                                ENQUIRY_STATUS_META[
                                  enquiry
                                    .status
                                ].label
                              }
                            </span>
                          </td>

                          {/* PRIORITY */}

                          <td
                            className="
                              px-[7px]
                              align-middle
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-[6px]
                              "
                            >
                              <span
                                className="
                                  h-[7px]
                                  w-[7px]
                                  shrink-0
                                  rounded-full
                                "
                                style={{
                                  backgroundColor:
                                    priorityColor(
                                      priority
                                    ),
                                }}
                              />

                              <span
                                className="
                                  whitespace-nowrap
                                  text-[9px]
                                  font-semibold
                                  text-[#344576]
                                "
                              >
                                {priority}
                              </span>
                            </div>
                          </td>

                          {/* DATE */}

                          <td
                            className="
                              px-[7px]
                              align-middle
                              whitespace-nowrap
                            "
                          >
                            <span className="text-[9px] font-semibold text-[#182A65]">
                              {formatDateTime(enquiry.createdAt).split(",")[0]}
                            </span>
                            <span className="ml-[4px] text-[8.5px] font-semibold text-[#556488]">
                              {formatDateTime(enquiry.createdAt).split(",")[1] || ""}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td
                            className="
                              px-[6px]
                              align-middle
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-[6px]
                              "
                            >
                              <button
                                type="button"
                                onClick={(
                                  event
                                ) => {
                                  event.stopPropagation();

                                  setSelected(
                                    enquiry
                                  );
                                }}
                                className="
                                  flex
                                  h-[28px]
                                  w-[28px]
                                  items-center
                                  justify-center
                                  rounded-[5px]
                                  border
                                  border-[#E3E7EC]
                                  bg-white
                                  text-[#283E78]
                                  hover:bg-[#F8FAFC]
                                "
                              >
                                <Eye
                                  size={
                                    14
                                  }
                                />
                              </button>

                              <button
                                type="button"
                                onClick={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                                className="
                                  flex
                                  h-[28px]
                                  w-[28px]
                                  items-center
                                  justify-center
                                  rounded-[5px]
                                  border
                                  border-[#E3E7EC]
                                  bg-white
                                  text-[#283E78]
                                  hover:bg-[#F8FAFC]
                                "
                              >
                                <MoreVertical
                                  size={
                                    14
                                  }
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}

                {!loading &&
                  pageRows.length ===
                  0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="
                          h-[150px]
                          text-center
                          text-[9px]
                          font-semibold
                          text-[#667085]
                        "
                      >
                        No enquiries
                        found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div
              className="
                flex
                h-[48px]
                items-center
                justify-between
                gap-[10px]
                border-t
                border-[#E6E9ED]
                px-[14px]
              "
            >
              <p
                className="
                  whitespace-nowrap
                  text-[9px]
                  font-semibold
                  text-[#475A83]
                "
              >
                {filteredEnquiries.length >
                  0
                  ? `Showing ${startIndex +
                  1
                  } to ${endIndex} of ${filteredEnquiries.length
                  } enquiries`
                  : "Showing 0 enquiries"}
              </p>

              <div
                className="
                  flex
                  items-center
                  gap-[5px]
                "
              >
                <button
                  type="button"
                  disabled={
                    safePage === 1
                  }
                  onClick={() =>
                    setPage(
                      Math.max(
                        1,
                        safePage - 1
                      )
                    )
                  }
                  className="
                    flex
                    h-[27px]
                    w-[27px]
                    items-center
                    justify-center
                    rounded-[4px]
                    border
                    border-[#E3E7ED]
                    bg-white
                    text-[#536180]
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft
                    size={12}
                  />
                </button>

                {Array.from({
                  length: Math.min(
                    totalPages,
                    3
                  ),
                }).map(
                  (_, index) => {
                    const number =
                      index + 1;

                    return (
                      <button
                        type="button"
                        key={number}
                        onClick={() =>
                          setPage(
                            number
                          )
                        }
                        className={`
                          flex
                          h-[27px]
                          w-[27px]
                          items-center
                          justify-center
                          rounded-[4px]
                          border
                          text-[9px]
                          font-semibold

                          ${safePage ===
                            number
                            ? "border-[#006132] bg-[#006132] text-white"
                            : "border-[#E3E7ED] bg-white text-[#334575]"
                          }
                        `}
                      >
                        {number}
                      </button>
                    );
                  }
                )}

                {totalPages > 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setPage(
                        totalPages
                      )
                    }
                    className={`
                      flex
                      h-[27px]
                      min-w-[27px]
                      items-center
                      justify-center
                      rounded-[4px]
                      border
                      px-[6px]
                      text-[9px]
                      font-semibold

                      ${safePage ===
                        totalPages
                        ? "border-[#006132] bg-[#006132] text-white"
                        : "border-[#E3E7ED] bg-white text-[#334575]"
                      }
                    `}
                  >
                    {totalPages}
                  </button>
                )}

                <button
                  type="button"
                  disabled={
                    safePage ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      Math.min(
                        totalPages,
                        safePage + 1
                      )
                    )
                  }
                  className="
                    flex
                    h-[27px]
                    w-[27px]
                    items-center
                    justify-center
                    rounded-[4px]
                    border
                    border-[#E3E7ED]
                    bg-white
                    text-[#334575]
                    disabled:opacity-40
                  "
                >
                  <ChevronRight
                    size={12}
                  />
                </button>
              </div>

              <div className="relative">
                <select
                  value={perPage}
                  onChange={(
                    event
                  ) => {
                    setPerPage(
                      Number(
                        event.target
                          .value
                      )
                    );

                    setPage(1);
                  }}
                  className="
                    h-[30px]
                    w-[100px]
                    appearance-none
                    rounded-[4px]
                    border
                    border-[#E3E7ED]
                    bg-white
                    px-[9px]
                    pr-[27px]
                    text-[9px]
                    font-semibold
                    text-[#536180]
                    outline-none
                  "
                >
                  <option value={8}>
                    8 per page
                  </option>

                  <option value={10}>
                    10 per page
                  </option>

                  <option value={20}>
                    20 per page
                  </option>
                </select>

                <ChevronDown
                  size={10}
                  className="
                    pointer-events-none
                    absolute
                    right-[8px]
                    top-1/2
                    -translate-y-1/2
                  "
                />
              </div>
            </div>
          </div>
        </main>

        {/* ====================================================
            RIGHT SIDEBAR
        ==================================================== */}

        <aside
          className="
            w-[285px]
            min-w-0
          "
        >
          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div
            className="
              rounded-[7px]
              border
              border-[#E2E6EB]
              bg-white
              px-[12px]
              pb-[14px]
              pt-[12px]
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-[8px]
              "
            >
              <h2
                className="
                  whitespace-nowrap
                  text-[11px]
                  font-semibold
                  text-[#1E2430]
                "
              >
                Enquiry Summary
              </h2>

              <button
                type="button"
                className="
                  flex
                  items-center
                  gap-[3px]
                  whitespace-nowrap
                  text-[10px]
                  font-semibold
                  text-[#16804B]
                "
              >
                View Report

                <ArrowRight
                  size={9}
                />
              </button>
            </div>

            <div
              className="
                mt-[17px]
                flex
                items-center
                gap-[10px]
              "
            >
              {/* DONUT */}

              <div
                className="
                  flex
                  h-[94px]
                  w-[94px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                "
                style={{
                  background:
                    totalEnquiries > 0
                      ? `conic-gradient(
                          #2087E5 0% ${percentage(
                        newCount,
                        totalEnquiries
                      )}%,
                          #F5A014 ${percentage(
                        newCount,
                        totalEnquiries
                      )}% ${percentage(
                        newCount +
                        contactedCount,
                        totalEnquiries
                      )}%,
                          #8552DD ${percentage(
                        newCount +
                        contactedCount,
                        totalEnquiries
                      )}% 100%
                        )`
                      : "#EEF1F4",
                }}
              >
                <div
                  className="
                    flex
                    h-[60px]
                    w-[60px]
                    flex-col
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                  "
                >
                  <span
                    className="
                      text-[18px]
                      font-semibold
                      leading-none
                      text-[#111]
                    "
                  >
                    {totalEnquiries}
                  </span>

                  <span
                    className="
                      mt-[4px]
                      text-[9px]
                      font-semibold
                      text-[#44537B]
                    "
                  >
                    Total
                  </span>
                </div>
              </div>

              {/* LEGEND */}

              <div
                className="
                  min-w-0
                  flex-1
                  space-y-[10px]
                "
              >
                {summaryRows.map(
                  (item) => (
                    <div
                      key={
                        item.label
                      }
                      className="
                        flex
                        min-w-0
                        items-center
                        justify-between
                        gap-[8px]
                      "
                    >
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-[5px]
                        "
                      >
                        <span
                          className="
                            h-[6px]
                            w-[6px]
                            shrink-0
                            rounded-full
                          "
                          style={{
                            backgroundColor:
                              item.color,
                          }}
                        />

                        <span
                          className="
                            truncate
                            whitespace-nowrap
                            text-[9px]
                            font-semibold
                            text-[#26386D]
                          "
                        >
                          {item.label}
                        </span>
                      </div>

                      <span
                        className="
                          shrink-0
                          whitespace-nowrap
                          text-[9px]
                          font-semibold
                          text-[#26386D]
                        "
                      >
                        {item.value} (
                        {percentage(
                          item.value,
                          totalEnquiries
                        ).toFixed(
                          1
                        )}
                        %)
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* ==================================================
              ENQUIRIES BY SOURCE
          ================================================== */}

          <div
            className="
              mt-[14px]
              rounded-[7px]
              border
              border-[#E2E6EB]
              bg-white
              px-[12px]
              pb-[14px]
              pt-[12px]
            "
          >
            <h2
              className="
                text-[9px]
                font-semibold
                text-[#1E2430]
              "
            >
              Enquiries by Source
            </h2>

            {categoryStats.length >
              0 ? (
              <div
                className="
                  mt-[16px]
                  space-y-[12px]
                "
              >
                {categoryStats.map(
                  (
                    item,
                    index
                  ) => (
                    <div
                      key={
                        item.category
                      }
                      className="
                        grid
                        grid-cols-[87px_minmax(0,1fr)_52px]
                        items-center
                        gap-[5px]
                      "
                    >
                      <span
                        className="
                          truncate
                          text-[9px]
                          font-semibold
                          text-[#334375]
                        "
                        title={
                          item.label
                        }
                      >
                        {item.label}
                      </span>

                      <div
                        className="
                          h-[6px]
                          overflow-hidden
                          rounded-full
                          bg-[#E9EDF2]
                        "
                      >
                        <div
                          className="
                            h-full
                            rounded-full
                          "
                          style={{
                            width: `${Math.max(
                              5,
                              (item.value /
                                maxCategory) *
                              100
                            )}%`,

                            backgroundColor:
                              categoryColors[
                              index %
                              categoryColors.length
                              ],
                          }}
                        />
                      </div>

                      <span
                        className="
                          whitespace-nowrap
                          text-right
                          text-[9px]
                          font-semibold
                          text-[#334375]
                        "
                      >
                        {item.value} (
                        {item.percentage.toFixed(
                          1
                        )}
                        %)
                      </span>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p
                className="
                  py-[25px]
                  text-center
                  text-[9px]
                  text-[#667085]
                "
              >
                No enquiry data
                available.
              </p>
            )}
          </div>

          {/* ==================================================
              QUICK ACTIONS
          ================================================== */}

          <div
            className="
              mt-[14px]
              overflow-hidden
              rounded-[7px]
              border
              border-[#E2E6EB]
              bg-[#FAFBFE]
            "
          >
            <div
              className="
                px-[12px]
                pb-[7px]
                pt-[12px]
              "
            >
              <h2
                className="
                  text-[9.7px]
                  font-semibold
                  text-[#1A3679]
                "
              >
                Quick Actions
              </h2>
            </div>

            {[
              {
                label:
                  "Add New Enquiry",
                icon: UserPlus,
              },
              {
                label:
                  "Assign to Team Member",
                icon: Users,
              },
              {
                label:
                  "Send Follow-up",
                icon: Send,
              },
              {
                label:
                  "View All Enquiries",
                icon: Eye,
              },
              {
                label:
                  "Download Report",
                icon: Download,
              },
            ].map((action) => {
              const Icon =
                action.icon;

              return (
                <button
                  type="button"
                  key={action.label}
                  className="
                    flex
                    h-[36px]
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-[#EDF0F4]
                    px-[12px]
                    text-[#1A2F6D]
                    last:border-b-0
                    hover:bg-white
                  "
                >
                  <span
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-[8px]
                    "
                  >
                    <Icon
                      size={14}
                      className="shrink-0"
                    />

                    <span
                      className="
                        whitespace-nowrap
                        text-[9px]
                        font-semibold
                      "
                    >
                      {action.label}
                    </span>
                  </span>

                  <ArrowRight
                    size={10}
                    className="shrink-0"
                  />
                </button>
              );
            })}
          </div>

          {/* ==================================================
              HELP
          ================================================== */}

          <div
            className="
              mt-[14px]
              rounded-[7px]
              border
              border-[#DFE9E2]
              bg-[#F5FBF6]
              px-[14px]
              pb-[16px]
              pt-[14px]
            "
          >
            <div
              className="
                flex
                items-center
                gap-[9px]
              "
            >
              <Headphones
                size={21}
                strokeWidth={1.8}
                className="
                  text-[#19723C]
                "
              />

              <h2
                className="
                  text-[10px]
                  font-semibold
                  text-[#0B6534]
                "
              >
                Need Help?
              </h2>
            </div>

            <p
              className="
                mt-[8px]
                text-[9px]
                font-semibold
                text-[#42537B]
              "
            >
              For any assistance,
              contact our team.
            </p>

            <div
              className="
                mt-[12px]
                flex
                items-center
                gap-[8px]
              "
            >
              <Phone
                size={14}
                className="
                  shrink-0
                  text-[#208447]
                "
              />

              <span
                className="
                  whitespace-nowrap
                  text-[9px]
                  font-semibold
                  text-[#21713A]
                "
              >
                +91 98765 43210
              </span>
            </div>

            <div
              className="
                mt-[11px]
                flex
                items-center
                gap-[8px]
              "
            >
              <Mail
                size={14}
                className="
                  shrink-0
                  text-[#208447]
                "
              />

              <span
                className="
                  whitespace-nowrap
                  text-[9px]
                  font-semibold
                  text-[#283C74]
                "
              >
                support@mokshasewa.org
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* ======================================================
          EXISTING DETAILS MODAL
      ====================================================== */}

      <Modal
        isOpen={!!selected}
        onClose={() =>
          setSelected(null)
        }
        title={
          selected?.name ??
          "Enquiry"
        }
      >
        {selected && (
          <div
            className="
              space-y-3
              text-sm
            "
          >
            <div
              className="
                grid
                grid-cols-2
                gap-3
                text-xs
              "
            >
              <div>
                <p
                  className="
                    font-semibold
                    uppercase
                    tracking-wide
                    text-text-muted
                  "
                >
                  Source
                </p>

                <p className="text-text-primary">
                  {getSourceLabel(
                    selected.category
                  )}
                </p>
              </div>

              <div>
                <p
                  className="
                    font-semibold
                    uppercase
                    tracking-wide
                    text-text-muted
                  "
                >
                  Phone
                </p>

                <p className="text-text-primary">
                  {selected.phone ||
                    "—"}
                </p>
              </div>

              {selected.email && (
                <div>
                  <p
                    className="
                      font-semibold
                      uppercase
                      tracking-wide
                      text-text-muted
                    "
                  >
                    Email
                  </p>

                  <p className="text-text-primary">
                    {
                      selected.email
                    }
                  </p>
                </div>
              )}

              <div>
                <p
                  className="
                    font-semibold
                    uppercase
                    tracking-wide
                    text-text-muted
                  "
                >
                  Received
                </p>

                <p className="text-text-primary">
                  {formatDateTime(
                    selected.createdAt
                  )}
                </p>
              </div>
            </div>

            {(selected.organization ||
              selected.designation ||
              selected.interest ||
              selected.city ||
              selected.authority ||
              selected.reference) && (
                <div
                  className="
                  grid
                  grid-cols-2
                  gap-3
                  rounded-lg
                  bg-surface-sunken
                  p-3
                  text-xs
                "
                >
                  {selected.organization && (
                    <div>
                      <p
                        className="
                        font-semibold
                        uppercase
                        tracking-wide
                        text-text-muted
                      "
                      >
                        Organisation
                      </p>

                      <p>
                        {
                          selected.organization
                        }
                      </p>
                    </div>
                  )}

                  {selected.designation && (
                    <div>
                      <p
                        className="
                        font-semibold
                        uppercase
                        tracking-wide
                        text-text-muted
                      "
                      >
                        Designation
                      </p>

                      <p>
                        {
                          selected.designation
                        }
                      </p>
                    </div>
                  )}

                  {selected.interest && (
                    <div>
                      <p
                        className="
                        font-semibold
                        uppercase
                        tracking-wide
                        text-text-muted
                      "
                      >
                        Interest
                      </p>

                      <p>
                        {
                          selected.interest
                        }
                      </p>
                    </div>
                  )}

                  {selected.city && (
                    <div>
                      <p
                        className="
                        font-semibold
                        uppercase
                        tracking-wide
                        text-text-muted
                      "
                      >
                        City / Area
                      </p>

                      <p>
                        {selected.city}
                      </p>
                    </div>
                  )}

                  {selected.authority && (
                    <div>
                      <p
                        className="
                        font-semibold
                        uppercase
                        tracking-wide
                        text-text-muted
                      "
                      >
                        Hospital /
                        Authority
                      </p>

                      <p>
                        {
                          selected.authority
                        }
                      </p>
                    </div>
                  )}

                  {selected.reference && (
                    <div>
                      <p
                        className="
                        font-semibold
                        uppercase
                        tracking-wide
                        text-text-muted
                      "
                      >
                        Case Reference
                      </p>

                      <p>
                        {
                          selected.reference
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}

            <div>
              <p
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-text-muted
                "
              >
                Message
              </p>

              <p className="text-text-primary">
                {selected.message ||
                  "—"}
              </p>
            </div>

            {selected.documentUrl && (
              <a
                href={
                  selected.documentUrl
                }
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  text-xs
                  font-semibold
                  text-accent
                  hover:underline
                "
              >
                View supporting
                document
              </a>
            )}

            <Select
              label="Status"
              value={selected.status}
              disabled={busy}
              onChange={(event) =>
                handleStatusChange(
                  selected._id,
                  event.target
                    .value as EnquiryStatus
                )
              }
            >
              <option value="new">
                New
              </option>

              <option value="contacted">
                Contacted
              </option>

              <option value="closed">
                Closed
              </option>
            </Select>
          </div>
        )}
      </Modal>
    </section>
  );
}
