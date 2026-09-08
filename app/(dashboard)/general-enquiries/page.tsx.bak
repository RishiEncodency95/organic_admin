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

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleX,
  Download,
  Eye,
  Filter,
  Globe2,
  Hourglass,
  Mail,
  MessageCircleMore,
  MoreVertical,
  Phone,
  Plus,
  RefreshCcw,
  Search,
  UserRound,
  Users,
} from "lucide-react";

import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";

import { enquiriesApi } from "@/lib/enquiriesApi";
import { Enquiry } from "@/lib/types";
import { formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

/* ============================================================
   RUNTIME TYPE

   Existing Enquiry ko break nahi karta.
   Agar API additional source/subject/resolved status bhejti hai
   to ye page automatically use karega.
============================================================ */

type RuntimeEnquiry = Omit<Enquiry, "status"> & {
  status: string;

  subject?: string;
  source?: string;
  enquirySource?: string;
  categoryLabel?: string;
};

/* ============================================================
   FILTER TYPES
============================================================ */

type UiStatus =
  | ""
  | "new"
  | "progress"
  | "resolved"
  | "closed";

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

function percentage(
  value: number,
  total: number
) {
  if (!total) {
    return 0;
  }

  return (value / total) * 100;
}

function normalizeStatus(
  status?: string
): Exclude<UiStatus, ""> {
  const value =
    String(status ?? "")
      .trim()
      .toLowerCase();

  if (
    value === "resolved" ||
    value === "completed"
  ) {
    return "resolved";
  }

  if (
    value === "contacted" ||
    value === "in_progress" ||
    value === "in progress" ||
    value === "progress" ||
    value === "pending"
  ) {
    return "progress";
  }

  if (
    value === "closed" ||
    value === "rejected"
  ) {
    return "closed";
  }

  return "new";
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

function getStatusLabel(
  status?: string
) {
  const normalized =
    normalizeStatus(status);

  if (normalized === "progress") {
    return "In Progress";
  }

  if (normalized === "resolved") {
    return "Resolved";
  }

  if (normalized === "closed") {
    return "Closed";
  }

  return "New";
}

function getStatusStyle(
  status?: string
) {
  const normalized =
    normalizeStatus(status);

  switch (normalized) {
    case "progress":
      return {
        background: "#FFF3DB",
        color: "#D68B16",
        border: "#F4E1BB",
      };

    case "resolved":
      return {
        background: "#E5F5E9",
        color: "#27814A",
        border: "#CEE9D5",
      };

    case "closed":
      return {
        background: "#FDE9E9",
        color: "#D94747",
        border: "#F5D4D4",
      };

    default:
      return {
        background: "#E8F2FE",
        color: "#2D73CA",
        border: "#D3E5FA",
      };
  }
}

/* ============================================================
   CATEGORY
============================================================ */

function getCategoryLabel(
  enquiry: RuntimeEnquiry
) {
  if (
    enquiry.categoryLabel?.trim()
  ) {
    return enquiry.categoryLabel;
  }

  switch (enquiry.category) {
    case "unclaimed_body":
      return "Sewa Support";

    case "partnership":
      return "Partnership";

    case "csr":
      return "Partnership";

    case "contact":
    default:
      break;
  }

  const interest =
    enquiry.interest
      ?.trim()
      .toLowerCase();

  if (
    interest?.includes("volunteer")
  ) {
    return "Volunteer";
  }

  if (
    interest?.includes("donat")
  ) {
    return "Donation";
  }

  if (
    interest?.includes("document")
  ) {
    return "Documentation";
  }

  if (
    interest?.includes("financial")
  ) {
    return "Financial Help";
  }

  return "General";
}

function categoryStyle(
  label: string
) {
  const value =
    label.toLowerCase();

  if (
    value.includes("sewa")
  ) {
    return {
      background: "#E5F5E9",
      color: "#25804A",
      border: "#CEE9D5",
    };
  }

  if (
    value.includes("volunteer")
  ) {
    return {
      background: "#F0E7FD",
      color: "#8B48DA",
      border: "#E4D6F9",
    };
  }

  if (
    value.includes("partner")
  ) {
    return {
      background: "#E8F2FE",
      color: "#2C76CE",
      border: "#D1E5F9",
    };
  }

  if (
    value.includes("information")
  ) {
    return {
      background: "#E8F2FE",
      color: "#2B79CE",
      border: "#D4E6FA",
    };
  }

  if (
    value.includes("financial")
  ) {
    return {
      background: "#FFF3DE",
      color: "#D88715",
      border: "#F7E2BA",
    };
  }

  if (
    value.includes("document")
  ) {
    return {
      background: "#EDF0F5",
      color: "#4D5D80",
      border: "#DEE3EB",
    };
  }

  if (
    value.includes("donation")
  ) {
    return {
      background: "#FCE8F6",
      color: "#C83F9A",
      border: "#F6D6EA",
    };
  }

  return {
    background: "#F1F3F6",
    color: "#53617D",
    border: "#E1E5EB",
  };
}

/* ============================================================
   SUBJECT
============================================================ */

function getSubject(
  enquiry: RuntimeEnquiry
) {
  if (enquiry.subject?.trim()) {
    return enquiry.subject;
  }

  if (enquiry.interest?.trim()) {
    return enquiry.interest;
  }

  if (enquiry.message?.trim()) {
    const text =
      enquiry.message.trim();

    if (text.length <= 52) {
      return text;
    }

    return `${text.slice(
      0,
      49
    )}...`;
  }

  return "General enquiry";
}

/* ============================================================
   SOURCE
============================================================ */

function getSource(
  enquiry: RuntimeEnquiry
) {
  const explicit =
    enquiry.source?.trim() ||
    enquiry.enquirySource?.trim();

  if (explicit) {
    return explicit;
  }

  /*
   * Existing schema does not expose a dedicated source field.
   * These enquiries originate from website forms by default.
   */
  return "Website Form";
}

function sourceIcon(
  source: string
) {
  const value =
    source.toLowerCase();

  if (
    value.includes("whatsapp")
  ) {
    return {
      icon: MessageCircleMore,
      color: "#22A75A",
    };
  }

  if (
    value.includes("email")
  ) {
    return {
      icon: Mail,
      color: "#253D82",
    };
  }

  if (
    value.includes("call") ||
    value.includes("phone")
  ) {
    return {
      icon: Phone,
      color: "#544FA7",
    };
  }

  if (
    value.includes("social")
  ) {
    return {
      icon: Globe2,
      color: "#2487DC",
    };
  }

  if (
    value.includes("referral") ||
    value.includes("walk")
  ) {
    return {
      icon: UserRound,
      color: "#42547E",
    };
  }

  return {
    icon: Globe2,
    color: "#263A70",
  };
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  change,
  negative,
  icon: Icon,
  iconBg,
  iconColor,
  cardBg,
}: {
  label: string;
  value: number;
  change: string;
  negative?: boolean;

  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: CSSProperties;
  }>;

  iconBg: string;
  iconColor: string;
  cardBg?: string;
}) {
  return (
    <div
      className="
        flex
        flex-col
        justify-between
        h-[102px]
        min-w-0
        rounded-[7px]
        border
        border-[#E3E7EC]
        px-[11px]
        py-[9px]
      "
      style={{
        backgroundColor:
          cardBg ?? "#FFFFFF",
      }}
    >
      {/* TOP: ICON + METRICS */}
      <div
        className="
          flex
          min-w-0
          items-center
          gap-[9px]
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

        <div className="min-w-0 overflow-hidden">
          <p
            className="
              break-words
              text-[9px]
              font-semibold
              uppercase
              tracking-wider
              leading-[11px]
              text-[#182A65]
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
              text-[#152965]
            "
          >
            {value}
          </p>
        </div>
      </div>

      {/* BOTTOM: LEFT ALIGNED SUBTEXT */}
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
        {change === "Live" ? (
          <span className="rounded-[4px] bg-[#E4F5E8] px-[5px] py-[1px] text-[9px] font-semibold text-[#238B4C]">
            Live
          </span>
        ) : (
          <>
            {negative ? (
              <ArrowDown
                size={10}
                strokeWidth={3}
                className="text-[#E44747]"
              />
            ) : (
              <ArrowUp
                size={10}
                strokeWidth={3}
                className="text-[#15944B]"
              />
            )}

            <span
              className={`
                text-[9px]
                font-semibold

                ${negative
                  ? "text-[#E44747]"
                  : "text-[#15944B]"
                }
              `}
            >
              {change}
            </span>
          </>
        )}

        <span
          className="
            text-[9px]
            font-semibold
            text-[#596685]
          "
        >
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
  onChange: (
    value: string
  ) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-[110px] max-w-[140px] flex-1">
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
          pr-[30px]
          text-[10px]
          font-semibold
          text-[#182A65]
          outline-none
        "
      >
        {children}
      </select>

      <ChevronDown
        size={11}
        className="
          pointer-events-none
          absolute
          right-[9px]
          top-1/2
          -translate-y-1/2
          text-[#243A75]
        "
      />
    </div>
  );
}

/* ============================================================
   SIDEBAR BAR
============================================================ */

function SidebarBar({
  label,
  value,
  percentageValue,
  color,
  icon: Icon,
  iconBg,
}: {
  label: string;
  value: number;
  percentageValue: number;
  color: string;

  icon?: ComponentType<{
    size?: number;
    strokeWidth?: number;
  }>;

  iconBg?: string;
}) {
  return (
    <div
      className="
        grid
        grid-cols-[100px_minmax(0,1fr)_60px]
        items-center
        gap-[6px]
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-[6px]
        "
      >
        {Icon && (
          <span
            className="
              flex
              h-[20px]
              w-[20px]
              shrink-0
              items-center
              justify-center
              rounded-full
            "
            style={{
              backgroundColor:
                iconBg ??
                "#EEF2F6",
            }}
          >
            <Icon
              size={11}
              strokeWidth={2}
            />
          </span>
        )}

        <span
          className="
            truncate
            text-[10px]
            font-semibold
            text-[#334475]
          "
        >
          {label}
        </span>
      </div>

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
              percentageValue,
              value > 0 ? 7 : 0
            )}%`,

            backgroundColor:
              color,
          }}
        />
      </div>

      <span
        className="
          whitespace-nowrap
          text-right
          text-[10px]
          font-semibold
          text-[#334475]
        "
      >
        {value} (
        {percentageValue.toFixed(
          1
        )}
        %)
      </span>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function GeneralEnquiriesPage() {
  const [enquiries, setEnquiries] =
    useState<RuntimeEnquiry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<UiStatus>("");

  const [
    categoryFilter,
    setCategoryFilter,
  ] = useState("");

  const [
    sourceFilter,
    setSourceFilter,
  ] = useState("");

  const [
    dateRangeFilter,
    setDateRangeFilter,
  ] = useState<DateRangeFilter>("ALL");

  const [selected, setSelected] =
    useState<RuntimeEnquiry | null>(
      null
    );

  const [page, setPage] =
    useState(1);

  const [perPage, setPerPage] =
    useState(10);

  /* ==========================================================
     LOAD
  ========================================================== */

  useEffect(() => {
    setLoading(true);

    enquiriesApi
      .list()
      .then((data) =>
        setEnquiries(
          (data ??
            []) as RuntimeEnquiry[]
        )
      )
      .catch((err) => {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Could not load enquiries."
        );
      })
      .finally(() =>
        setLoading(false)
      );
  }, []);

  /* ==========================================================
     COUNTS
  ========================================================== */

  const totalEnquiries =
    enquiries.length;

  const newCount = useMemo(
    () =>
      enquiries.filter(
        (item) =>
          normalizeStatus(
            item.status
          ) === "new"
      ).length,
    [enquiries]
  );

  const progressCount =
    useMemo(
      () =>
        enquiries.filter(
          (item) =>
            normalizeStatus(
              item.status
            ) === "progress"
        ).length,
      [enquiries]
    );

  const resolvedCount =
    useMemo(
      () =>
        enquiries.filter(
          (item) =>
            normalizeStatus(
              item.status
            ) === "resolved"
        ).length,
      [enquiries]
    );

  const closedCount = useMemo(
    () =>
      enquiries.filter(
        (item) =>
          normalizeStatus(
            item.status
          ) === "closed"
      ).length,
    [enquiries]
  );

  /* ==========================================================
     CATEGORY OPTIONS
  ========================================================== */

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          enquiries.map(
            getCategoryLabel
          )
        )
      ).sort(),
    [enquiries]
  );

  /* ==========================================================
     SOURCES
  ========================================================== */

  const sources = useMemo(
    () =>
      Array.from(
        new Set(
          enquiries.map(
            getSource
          )
        )
      ).sort(),
    [enquiries]
  );

  /* ==========================================================
     FILTERED
  ========================================================== */

  const visible = useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    return enquiries
      .filter((item) => {
        if (!statusFilter) {
          return true;
        }

        return (
          normalizeStatus(
            item.status
          ) === statusFilter
        );
      })

      .filter((item) => {
        if (!categoryFilter) {
          return true;
        }

        return (
          getCategoryLabel(
            item
          ) === categoryFilter
        );
      })

      .filter((item) => {
        if (!sourceFilter) {
          return true;
        }

        return (
          getSource(item) ===
          sourceFilter
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

        return [
          item._id,
          item.reference,
          item.name,
          item.email,
          item.phone,
          item.message,
          item.interest,
          getSubject(item),
          getCategoryLabel(item),
          getSource(item),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);
      })

      .sort((a, b) => {
        const first =
          parseDate(
            a.createdAt
          )?.getTime() ?? 0;

        const second =
          parseDate(
            b.createdAt
          )?.getTime() ?? 0;

        return second - first;
      });
  }, [
    enquiries,
    search,
    statusFilter,
    categoryFilter,
    sourceFilter,
    dateRangeFilter,
  ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      visible.length / perPage
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const startIndex =
    (safePage - 1) *
    perPage;

  const endIndex = Math.min(
    startIndex + perPage,
    visible.length
  );

  const pageRows = visible.slice(
    startIndex,
    endIndex
  );

  /* ==========================================================
     SOURCE STATS
  ========================================================== */

  const sourceStats = useMemo(
    () =>
      sources
        .map((source) => {
          const value =
            enquiries.filter(
              (item) =>
                getSource(
                  item
                ) === source
            ).length;

          return {
            label: source,
            value,
            percentage:
              percentage(
                value,
                totalEnquiries
              ),
          };
        })
        .sort(
          (a, b) =>
            b.value - a.value
        )
        .slice(0, 5),
    [
      sources,
      enquiries,
      totalEnquiries,
    ]
  );

  /* ==========================================================
     CATEGORY STATS
  ========================================================== */

  const categoryStats = useMemo(
    () =>
      categories
        .map((category) => {
          const value =
            enquiries.filter(
              (item) =>
                getCategoryLabel(
                  item
                ) === category
            ).length;

          return {
            label: category,
            value,
            percentage:
              percentage(
                value,
                totalEnquiries
              ),
          };
        })
        .sort(
          (a, b) =>
            b.value - a.value
        )
        .slice(0, 5),
    [
      categories,
      enquiries,
      totalEnquiries,
    ]
  );

  /* ==========================================================
     RESET
  ========================================================== */

  function resetFilters() {
    setSearch("");
    setStatusFilter("");
    setCategoryFilter("");
    setSourceFilter("");
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
        pb-[15px]
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
        <div>
          <h1
            className="
              text-[20px]
              font-semibold
              leading-[25px]
              tracking-[-0.35px]
              text-[#005E2E]
            "
          >
            General Enquiries
          </h1>

          <p
            className="
              mt-[2px]
              text-[10px]
              font-semibold
              leading-[16px]
              text-[#344574]
            "
          >
            View, manage and respond
            to all general enquiries
            from visitors.
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
              text-[10px]
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
              text-[10px]
              font-semibold
              text-[#172762]
            "
          >
            <Filter size={14} />
            Filters
          </button>

          <Link
            href="/enquiries/new?category=contact"
            className="
              flex
              h-[36px]
              items-center
              gap-[8px]
              rounded-[5px]
              bg-[#005F2E]
              px-[17px]
              text-[10px]
              font-semibold
              text-white
              shadow-[0_2px_5px_rgba(0,95,46,0.14)]
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
            text-[10px]
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
          grid-cols-[minmax(0,1fr)_255px]
          gap-[16px]
        "
      >
        {/* ====================================================
            LEFT
        ==================================================== */}

        <main className="min-w-0 flex-1 overflow-hidden">
          {/* ==================================================
              STAT CARDS
          ================================================== */}

          <div
            className="
              grid
              grid-cols-5
              gap-[10px]
            "
          >
            <StatCard
              label="Total Enquiries"
              value={totalEnquiries}
              change="Live"
              icon={MessageCircleMore}
              iconBg="#E4F5E8"
              iconColor="#238B4C"
              cardBg="#FBFEFC"
            />

            <StatCard
              label="New Enquiries"
              value={newCount}
              change={`${percentage(newCount, totalEnquiries).toFixed(1)}%`}
              icon={Mail}
              iconBg="#E9F2FF"
              iconColor="#3378D4"
              cardBg="#FCFDFF"
            />

            <StatCard
              label="In Progress"
              value={progressCount}
              change={`${percentage(progressCount, totalEnquiries).toFixed(1)}%`}
              icon={Hourglass}
              iconBg="#FFF3DC"
              iconColor="#DE941B"
              cardBg="#FFFCF6"
            />

            <StatCard
              label="Resolved"
              value={resolvedCount}
              change={`${percentage(resolvedCount, totalEnquiries).toFixed(1)}%`}
              icon={CheckCircle2}
              iconBg="#F0E7FD"
              iconColor="#8047D8"
              cardBg="#FDFAFF"
            />

            <StatCard
              label="Closed"
              value={closedCount}
              change={`${percentage(closedCount, totalEnquiries).toFixed(1)}%`}
              negative
              icon={CircleX}
              iconBg="#FDE5E5"
              iconColor="#EA3939"
              cardBg="#FFF9F9"
            />
          </div>

          {/* ==================================================
              SEARCH & FILTERS
          ================================================== */}

          <div
            className="
              mt-[14px]
              flex
              items-center
              gap-[8px]
            "
          >
            {/* SEARCH */}

            <div
              className="
                flex
                h-[40px]
                min-w-0
                flex-1
                items-center
                gap-[8px]
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[11px]
              "
            >
              <Search
                size={14}
                className="
                  shrink-0
                  text-[#687698]
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );

                  setPage(1);
                }}
                placeholder="Search by name, email, subject or message..."
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
            </div>

            {/* STATUS */}

            <FilterSelect
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(
                  value as UiStatus
                );

                setPage(1);
              }}
            >
              <option value="">
                All Status
              </option>

              <option value="new">
                New
              </option>

              <option value="progress">
                In Progress
              </option>

              <option value="resolved">
                Resolved
              </option>

              <option value="closed">
                Closed
              </option>
            </FilterSelect>

            {/* CATEGORY */}

            <FilterSelect
              value={
                categoryFilter
              }
              onChange={(value) => {
                setCategoryFilter(
                  value
                );

                setPage(1);
              }}
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}
            </FilterSelect>

            {/* SOURCE */}

            <FilterSelect
              value={sourceFilter}
              onChange={(value) => {
                setSourceFilter(
                  value
                );

                setPage(1);
              }}
            >
              <option value="">
                All Sources
              </option>

              {sources.map(
                (source) => (
                  <option
                    key={source}
                    value={source}
                  >
                    {source}
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
                shrink-0
                items-center
                gap-[6px]
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[11px]
                text-[10px]
                font-semibold
                text-[#586480]
              "
            >
              <CalendarDays
                size={14}
                className="
                  shrink-0
                  text-[#314578]
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
                  pr-[21px]
                  text-[10px]
                  font-semibold
                  text-[#586480]
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
                  text-[#314578]
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
                shrink-0
                items-center
                justify-center
                gap-[5px]
                rounded-[6px]
                border
                border-[#E0E5EB]
                bg-white
                px-[12px]
                text-[10px]
                font-semibold
                text-[#1C306A]
              "
            >
              <RefreshCcw
                size={12}
              />
              Reset
            </button>
          </div>

          {/* ==================================================
              TABLE
          ================================================== */}

          <div
            className="
              mt-[11px]
              w-full
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
                    width: "10%",
                  }}
                />

                <col
                  style={{
                    width: "15%",
                  }}
                />

                <col
                  style={{
                    width: "16%",
                  }}
                />

                <col
                  style={{
                    width: "12%",
                  }}
                />

                <col
                  style={{
                    width: "14%",
                  }}
                />

                <col
                  style={{
                    width: "12%",
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

              <thead>
                <tr
                  className="
                    h-[36px]
                    bg-[#F7F8FC]
                    text-left
                    text-[#172762]
                  "
                >
                  <th className="px-[9px] text-[10px] font-semibold uppercase tracking-wider">
                    ID
                  </th>

                  <th className="px-[8px] text-[10px] font-semibold uppercase tracking-wider">
                    Name
                  </th>

                  <th className="px-[8px] text-[10px] font-semibold uppercase tracking-wider">
                    Subject
                  </th>

                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Category
                  </th>

                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Source
                  </th>

                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Status
                  </th>

                  <th className="px-[7px] text-[10px] font-semibold uppercase tracking-wider">
                    Date &amp; Time
                  </th>

                  <th className="px-[6px] text-[10px] font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}

                {loading &&
                  Array.from({
                    length: 8,
                  }).map(
                    (_, index) => (
                      <tr
                        key={`loading-${index}`}
                        className="
                          h-[59px]
                          border-t
                          border-[#E9ECF0]
                        "
                      >
                        <td
                          colSpan={8}
                          className="px-[10px]"
                        >
                          <div
                            className="
                              h-[10px]
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

                {/* ROWS */}

                {!loading &&
                  pageRows.map(
                    (enquiry) => {
                      const category =
                        getCategoryLabel(
                          enquiry
                        );

                      const categoryMeta =
                        categoryStyle(
                          category
                        );

                      const statusMeta =
                        getStatusStyle(
                          enquiry.status
                        );

                      const source =
                        getSource(
                          enquiry
                        );

                      const sourceMeta =
                        sourceIcon(
                          source
                        );

                      const SourceIcon =
                        sourceMeta.icon;

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
                            h-[59px]
                            cursor-pointer
                            border-t
                            border-[#E9ECF0]
                            bg-white
                            hover:bg-[#FBFCFD]
                          "
                        >
                          {/* ID */}

                          <td className="px-[9px] align-middle">
                            <span
                              className="
                                block
                                truncate
                                text-[10px]
                                font-semibold
                                text-[#14763F]
                              "
                            >
                              {enquiry.reference ||
                                enquiry._id}
                            </span>
                          </td>

                          {/* NAME */}

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
                                text-[10px]
                                font-semibold
                                leading-[14px]
                                text-[#192B66]
                              "
                            >
                              {enquiry.name ||
                                "—"}
                            </p>

                            <p
                              className="
                                mt-[3px]
                                truncate
                                text-[10px]
                                font-semibold
                                leading-[12px]
                                text-[#52617F]
                              "
                            >
                              {enquiry.email ||
                                enquiry.phone ||
                                "—"}
                            </p>
                          </td>

                          {/* SUBJECT */}

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
                                text-[10px]
                                font-semibold
                                leading-[14px]
                                text-[#314273]
                              "
                            >
                              {getSubject(
                                enquiry
                              )}
                            </p>
                          </td>

                          {/* CATEGORY */}

                          <td
                            className="
                              px-[7px]
                              align-middle
                            "
                          >
                            <span
                              className="
                                inline-flex
                                max-w-full
                                rounded-[4px]
                                border
                                px-[8px]
                                py-[4px]
                                text-[10px]
                                font-semibold
                                leading-none
                              "
                              style={{
                                backgroundColor:
                                  categoryMeta.background,

                                color:
                                  categoryMeta.color,

                                borderColor:
                                  categoryMeta.border,
                              }}
                            >
                              <span className="truncate">
                                {category}
                              </span>
                            </span>
                          </td>

                          {/* SOURCE */}

                          <td
                            className="
                              min-w-0
                              px-[7px]
                              align-middle
                            "
                          >
                            <div
                              className="
                                flex
                                min-w-0
                                items-center
                                gap-[7px]
                              "
                            >
                              <SourceIcon
                                size={13}
                                strokeWidth={
                                  2
                                }
                                style={{
                                  color:
                                    sourceMeta.color,
                                }}
                                className="shrink-0"
                              />

                              <span
                                className="
                                  truncate
                                  text-[10px]
                                  font-semibold
                                  text-[#324374]
                                "
                              >
                                {source}
                              </span>
                            </div>
                          </td>

                          {/* STATUS */}

                          <td
                            className="
                              px-[7px]
                              align-middle
                            "
                          >
                            <span
                              className="
                                inline-flex
                                whitespace-nowrap
                                rounded-[4px]
                                border
                                px-[7px]
                                py-[4px]
                                text-[10px]
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
                              {getStatusLabel(
                                enquiry.status
                              )}
                            </span>
                          </td>

                          {/* DATE */}

                          <td className="px-[10px] align-middle">
                            {(() => {
                              const formatted = formatDateTime(enquiry.createdAt);
                              const parts = formatted.includes(", ")
                                ? formatted.split(", ")
                                : [formatted, ""];

                              return (
                                <>
                                  <p className="whitespace-nowrap text-[9px] font-semibold leading-[11px] text-[#26396D]">
                                    {parts[0]}
                                  </p>
                                  {parts[1] && (
                                    <p className="mt-[1px] whitespace-nowrap text-[9px] font-semibold leading-[10px] text-[#556488]">
                                      {parts[1]}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </td>

                          {/* ACTION */}

                          <td
                            className="
                              px-[5px]
                              align-middle
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-[5px]
                              "
                            >
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelected(enquiry);
                                }}
                                title="View Details"
                                className="
                                  flex
                                  h-[28px]
                                  w-[28px]
                                  items-center
                                  justify-center
                                  rounded-[5px]
                                  border
                                  border-[#E2E6EB]
                                  bg-white
                                  text-[#273D78]
                                  hover:bg-[#F7F9FB]
                                "
                              >
                                <Eye size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                }}
                                title="Reply / View"
                                className="
                                  flex
                                  h-[28px]
                                  w-[28px]
                                  items-center
                                  justify-center
                                  rounded-[5px]
                                  border
                                  border-[#E2E6EB]
                                  bg-white
                                  text-[#273D78]
                                  hover:bg-[#F7F9FB]
                                "
                              >
                                <ArrowLeft size={14} />
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
                          text-xs
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
                h-[49px]
                items-center
                justify-between
                gap-[10px]
                border-t
                border-[#E6E9ED]
                px-[16px]
              "
            >
              <p
                className="
                  whitespace-nowrap
                  text-[10px]
                  font-semibold
                  text-[#475A83]
                "
              >
                {visible.length > 0
                  ? `Showing ${startIndex + 1
                  } to ${endIndex} of ${visible.length
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
                    4,
                    totalPages
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
                          text-[10px]
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
                    h-[28px]
                    w-[94px]
                    appearance-none
                    rounded-[4px]
                    border
                    border-[#E3E3ED]
                    bg-white
                    px-[9px]
                    pr-[25px]
                    text-[10px]
                    font-semibold
                    text-[#536180]
                    outline-none
                  "
                >
                  <option value={10}>
                    10 per page
                  </option>

                  <option value={20}>
                    20 per page
                  </option>

                  <option value={50}>
                    50 per page
                  </option>
                </select>

                <ChevronDown
                  size={9}
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
            RIGHT SIDE
        ==================================================== */}

        <aside
          className="
            w-[255px]
            min-w-0
          "
        >
          {/* SUMMARY */}

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
            <h2
              className="
                break-words
                text-[9px]
                font-semibold
                uppercase
                tracking-wider
                leading-[11px]
                text-[#1D5E39]
              "
            >
              Enquiry Summary
            </h2>

            <div
              className="
                mt-[15px]
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
                          #3379DE 0% ${percentage(
                        newCount,
                        totalEnquiries
                      )}%,

                          #F49B16 ${percentage(
                        newCount,
                        totalEnquiries
                      )}% ${percentage(
                        newCount +
                        progressCount,
                        totalEnquiries
                      )}%,

                          #2CA25F ${percentage(
                        newCount +
                        progressCount,
                        totalEnquiries
                      )}% ${percentage(
                        newCount +
                        progressCount +
                        resolvedCount,
                        totalEnquiries
                      )}%,

                          #E4463E ${percentage(
                        newCount +
                        progressCount +
                        resolvedCount,
                        totalEnquiries
                      )}% 100%
                        )`
                      : "#EDF0F3",
                }}
              >
                <div
                  className="
                    flex
                    h-[59px]
                    w-[59px]
                    flex-col
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                  "
                >
                  <span
                    className="
                      text-[12px]
                      font-semibold
                      leading-none
                      text-[#141414]
                    "
                  >
                    {totalEnquiries}
                  </span>

                  <span
                    className="
                      mt-[2px]
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wide
                      text-[#44537B]
                    "
                  >
                    Total
                  </span>
                </div>
              </div>

              {/* SUMMARY LIST */}

              <div
                className="
                  min-w-0
                  flex-1
                  space-y-[8px]
                "
              >
                {[
                  {
                    label: "New",
                    value: newCount,
                    color: "#3379DE",
                  },
                  {
                    label:
                      "In Progress",
                    value:
                      progressCount,
                    color: "#F49B16",
                  },
                  {
                    label:
                      "Resolved",
                    value:
                      resolvedCount,
                    color: "#2CA25F",
                  },
                  {
                    label: "Closed",
                    value:
                      closedCount,
                    color: "#E4463E",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="
                      flex
                      items-center
                      justify-between
                      gap-[6px]
                      text-left
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-[6px]
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
                        whitespace-nowrap
                        text-left
                        text-[9px]
                        font-semibold
                        text-[#26386D]
                      "
                    >
                      {item.value} (
                      {percentage(
                        item.value,
                        totalEnquiries
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SOURCE */}

          <div
            className="
              mt-[13px]
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
                break-words
                text-[9px]
                font-semibold
                uppercase
                tracking-wider
                leading-[11px]
                text-[#1D5E39]
              "
            >
              Enquiries by Source
            </h2>

            <div
              className="
                mt-[15px]
                space-y-[11px]
              "
            >
              {sourceStats.map(
                (item, index) => {
                  const meta =
                    sourceIcon(
                      item.label
                    );

                  const Icon =
                    meta.icon;

                  const colors = [
                    "#327DDF",
                    "#25A35F",
                    "#F49D17",
                    "#8750DB",
                    "#D93A32",
                  ];

                  return (
                    <SidebarBar
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                      percentageValue={
                        item.percentage
                      }
                      color={
                        colors[
                        index %
                        colors.length
                        ]
                      }
                      icon={Icon}
                      iconBg="#F3F6FA"
                    />
                  );
                }
              )}

              {sourceStats.length ===
                0 && (
                  <p
                    className="
                    py-[15px]
                    text-center
                    text-[10px]
                    font-semibold
                    text-[#667085]
                  "
                  >
                    No source data
                  </p>
                )}
            </div>
          </div>

          {/* CATEGORIES */}

          <div
            className="
              mt-[13px]
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
                break-words
                text-[9px]
                font-semibold
                uppercase
                tracking-wider
                leading-[11px]
                text-[#1D5E39]
              "
            >
              Popular Categories
            </h2>

            <div
              className="
                mt-[15px]
                space-y-[11px]
              "
            >
              {categoryStats.map(
                (item, index) => {
                  const colors = [
                    "#29A15D",
                    "#2784E1",
                    "#8851DA",
                    "#F39B16",
                    "#7C9DB7",
                  ];

                  return (
                    <SidebarBar
                      key={
                        item.label
                      }
                      label={
                        item.label
                      }
                      value={
                        item.value
                      }
                      percentageValue={
                        item.percentage
                      }
                      color={
                        colors[
                        index %
                        colors.length
                        ]
                      }
                    />
                  );
                }
              )}

              {categoryStats.length ===
                0 && (
                  <p
                    className="
                    py-[15px]
                    text-center
                    text-[10px]
                    font-semibold
                    text-[#667085]
                  "
                  >
                    No category data
                  </p>
                )}
            </div>
          </div>

          {/* QUICK ACTIONS */}

          <div
            className="
              mt-[13px]
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
                  break-words
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-wider
                  leading-[11px]
                  text-[#1D5E39]
                "
              >
                Quick Actions
              </h2>
            </div>

            {[
              {
                label:
                  "Add New Enquiry",
                icon: Plus,
                href: "/enquiries/new?category=contact",
              },
              {
                label:
                  "View All Enquiries",
                icon: Eye,
              },
              {
                label:
                  "Assign to Team Member",
                icon: Users,
              },
              {
                label:
                  "Create Follow-up",
                icon: CalendarDays,
              },
              {
                label:
                  "Download Report",
                icon: Download,
              },
            ].map((action) => {
              const Icon =
                action.icon;

              const content = (
                <>
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
                        text-[10px]
                        font-semibold
                      "
                    >
                      {action.label}
                    </span>
                  </span>

                  <ArrowRight
                    size={14}
                    className="shrink-0 text-[#909BB0]"
                  />
                </>
              );

              const className =
                "flex h-[40px] w-full items-center justify-between border-b border-[#EDF0F4] px-[12px] text-[#1A2F6D] last:border-b-0 hover:bg-white transition";

              if (action.href) {
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={className}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  type="button"
                  key={action.label}
                  className={className}
                >
                  {content}
                </button>
              );
            })}
          </div>
        </aside>
      </div>

      {/* ======================================================
          DETAILS MODAL
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
              space-y-4
              text-[10px]
            "
          >
            {/* STATUS */}

            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  inline-flex
                  rounded-md
                  border
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                "
                style={{
                  backgroundColor:
                    getStatusStyle(
                      selected.status
                    ).background,

                  color:
                    getStatusStyle(
                      selected.status
                    ).color,

                  borderColor:
                    getStatusStyle(
                      selected.status
                    ).border,
                }}
              >
                {getStatusLabel(
                  selected.status
                )}
              </span>

              <Badge tone="neutral">
                {getCategoryLabel(
                  selected
                )}
              </Badge>
            </div>

            {/* INFO */}

            <div
              className="
                grid
                grid-cols-2
                gap-3
                text-[10px]
              "
            >
              <ModalField
                label="Name"
                value={
                  selected.name
                }
              />

              <ModalField
                label="Phone"
                value={
                  selected.phone
                }
              />

              <ModalField
                label="Email"
                value={
                  selected.email
                }
              />

              <ModalField
                label="Source"
                value={getSource(
                  selected
                )}
              />

              <ModalField
                label="Category"
                value={getCategoryLabel(
                  selected
                )}
              />

              <ModalField
                label="Received"
                value={formatDateTime(
                  selected.createdAt
                )}
              />
            </div>

            {/* SUBJECT */}

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-text-muted
                "
              >
                Subject
              </p>

              <p
                className="
                  mt-1
                  text-text-primary
                "
              >
                {getSubject(
                  selected
                )}
              </p>
            </div>

            {/* MESSAGE */}

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-text-muted
                "
              >
                Message
              </p>

              <p
                className="
                  mt-1
                  whitespace-pre-wrap
                  text-text-primary
                "
              >
                {selected.message ||
                  "—"}
              </p>
            </div>

            {selected.organization && (
              <ModalField
                label="Organisation"
                value={
                  selected.organization
                }
              />
            )}

            {selected.city && (
              <ModalField
                label="City / Area"
                value={
                  selected.city
                }
              />
            )}

            {selected.documentUrl && (
              <a
                href={
                  selected.documentUrl
                }
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  text-[10px]
                  font-semibold
                  text-accent
                  hover:underline
                "
              >
                View supporting
                document
              </a>
            )}
          </div>
        )}
      </Modal>
    </section>
  );
}

/* ============================================================
   MODAL FIELD
============================================================ */

function ModalField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <p
        className="
          text-[10px]
          font-semibold
          uppercase
          tracking-wide
          text-text-muted
        "
      >
        {label}
      </p>

      <p
        className="
          mt-[2px]
          break-words
          text-text-primary
        "
      >
        {value}
      </p>
    </div>
  );
}
