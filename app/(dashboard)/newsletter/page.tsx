"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Globe2,
  Headphones,
  Mail,
  MailOpen,
  Megaphone,
  MessageSquareText,
  MoreHorizontal,
  MousePointer2,
  Phone,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { newsletterApi } from "@/lib/newsletterApi";
import { NewsletterSubscriber } from "@/lib/types";
import { formatDateTime } from "@/lib/statusMeta";

/* ============================================================
   EXTENDED TYPE

   Existing NewsletterSubscriber ko break nahi karega.
   Backend future me ye fields bheje to automatically use hongi.
============================================================ */

type SubscriberRow = NewsletterSubscriber & {
  name?: string;
  phone?: string;
  status?: string;
  location?: string;
  tags?: string[];
  emailSentAt?: string;
  openedAt?: string;
  clickedAt?: string;
};

/* ============================================================
   HELPERS
============================================================ */

function getStatus(value?: string) {
  if (!value) return "Active";

  const normalized = value.toLowerCase();

  if (normalized === "active") return "Active";
  if (normalized === "unsubscribed") return "Unsubscribed";
  if (normalized === "bounced") return "Bounced";
  if (normalized === "complaint") return "Complaint";

  return value;
}

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return {
        background: "#E4F4E7",
        color: "#237A43",
        border: "#CCE8D3",
      };

    case "unsubscribed":
      return {
        background: "#FDE9E9",
        color: "#D64F4F",
        border: "#F8D5D5",
      };

    case "bounced":
      return {
        background: "#FFF0DE",
        color: "#E47E28",
        border: "#FADCBF",
      };

    case "complaint":
      return {
        background: "#F0F2F5",
        color: "#667085",
        border: "#E4E7EC",
      };

    default:
      return {
        background: "#E4F4E7",
        color: "#237A43",
        border: "#CCE8D3",
      };
  }
}

function getInitials(subscriber: SubscriberRow) {
  if (subscriber.name?.trim()) {
    return subscriber.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  const username = subscriber.email?.split("@")[0] ?? "U";

  const words = username
    .split(/[._\-\s]+/)
    .filter(Boolean);

  if (words.length >= 2) {
    return (
      words[0].charAt(0) +
      words[1].charAt(0)
    ).toUpperCase();
  }

  return username.slice(0, 2).toUpperCase();
}

function getDisplayName(subscriber: SubscriberRow) {
  if (subscriber.name?.trim()) {
    return subscriber.name;
  }

  const username = subscriber.email?.split("@")[0] ?? "Subscriber";

  return username
    .split(/[._\-]+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}

function avatarStyle(index: number) {
  const styles = [
    {
      background: "#E5F5E8",
      color: "#268A47",
    },
    {
      background: "#F1E8FD",
      color: "#8C43DD",
    },
    {
      background: "#FFF2D8",
      color: "#D89716",
    },
    {
      background: "#E7F2FE",
      color: "#2876CE",
    },
    {
      background: "#FCE8ED",
      color: "#DC5470",
    },
    {
      background: "#E0F6F2",
      color: "#168B7D",
    },
  ];

  return styles[index % styles.length];
}

function getSourceIcon(source?: string) {
  const normalized = source?.toLowerCase() ?? "";

  if (
    normalized.includes("website") ||
    normalized.includes("footer")
  ) {
    return Globe2;
  }

  if (
    normalized.includes("csr")
  ) {
    return ShieldCheck;
  }

  if (
    normalized.includes("newsletter")
  ) {
    return Mail;
  }

  return MessageSquareText;
}

function calculatePercentage(
  value: number,
  total: number
) {
  if (!total) return 0;

  return (value / total) * 100;
}

function isCurrentMonth(dateValue?: string) {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

type DateRangeFilter =
  | "ALL"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH";

function matchesDateRange(
  value: string | undefined,
  range: DateRangeFilter
) {
  if (range === "ALL") {
    return true;
  }

  if (!value) {
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

/* ============================================================
   STAT CARD
============================================================ */

type StatCardProps = {
  label: string;
  value: string;
  change?: string;
  compare?: string;
  icon: React.ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
    style?: React.CSSProperties;
  }>;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
};

function StatCard({
  label,
  value,
  change,
  compare,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor = "#00652F",
}: StatCardProps) {
  return (
    <div
      className="
        flex
        h-[116px]
        min-w-0
        flex-col
        justify-between
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
            style={
              {
                color: iconColor,
              } as React.CSSProperties
            }
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
            "
            style={{
              color: valueColor,
            }}
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
              className="
                shrink-0
                text-[#169248]
              "
            />

            <span
              className="
                text-[9px]
                font-semibold
                text-[#169248]
              "
            >
              {change}
            </span>
          </>
        )}

        <span className="text-[9px] font-semibold text-[#536181]">
          {compare ?? "current data"}
        </span>
      </div>
    </div>
  );
}

function FilterButton({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="
        flex
        h-[40px]
        min-w-0
        items-center
        justify-between
        gap-[7px]
        rounded-[6px]
        border
        border-[#E0E5EB]
        bg-white
        px-[11px]
        text-[9px]
        font-semibold
        text-[#172762]
      "
    >
      <span className="whitespace-nowrap">
        {children}
      </span>

      <ChevronDown
        size={11}
        className="shrink-0"
      />
    </button>
  );
}

/* ============================================================
   PAGE
============================================================ */

export default function NewsletterPage() {
  const [subscribers, setSubscribers] =
    useState<SubscriberRow[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [sourceFilter, setSourceFilter] =
    useState("All");

  const [
    dateRangeFilter,
    setDateRangeFilter,
  ] = useState<DateRangeFilter>("ALL");

  const [page, setPage] = useState(1);

  const [perPage, setPerPage] = useState(8);

  /* ==========================================================
     API
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    setLoading(true);

    newsletterApi
      .list()
      .then((data) => {
        if (!mounted) return;

        setSubscribers(
          (data ?? []) as SubscriberRow[]
        );
      })
      .catch((error) => {
        console.error(
          "Unable to load newsletter subscribers:",
          error
        );

        if (mounted) {
          setSubscribers([]);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     DYNAMIC STATS
  ========================================================== */

  const totalSubscribers = subscribers.length;

  const newThisMonth = useMemo(
    () =>
      subscribers.filter((subscriber) =>
        isCurrentMonth(subscriber.createdAt)
      ).length,
    [subscribers]
  );

  const emailsSent = useMemo(
    () =>
      subscribers.filter(
        (subscriber) =>
          Boolean(subscriber.emailSentAt)
      ).length,
    [subscribers]
  );

  const openedCount = useMemo(
    () =>
      subscribers.filter(
        (subscriber) =>
          Boolean(subscriber.openedAt)
      ).length,
    [subscribers]
  );

  const clickedCount = useMemo(
    () =>
      subscribers.filter(
        (subscriber) =>
          Boolean(subscriber.clickedAt)
      ).length,
    [subscribers]
  );

  const openRate =
    emailsSent > 0
      ? calculatePercentage(
        openedCount,
        emailsSent
      )
      : 0;

  const clickRate =
    emailsSent > 0
      ? calculatePercentage(
        clickedCount,
        emailsSent
      )
      : 0;

  /* ==========================================================
     STATUS STATS
  ========================================================== */

  const statusStats = useMemo(() => {
    const active = subscribers.filter(
      (subscriber) =>
        getStatus(subscriber.status) ===
        "Active"
    ).length;

    const unsubscribed =
      subscribers.filter(
        (subscriber) =>
          getStatus(subscriber.status) ===
          "Unsubscribed"
      ).length;

    const bounced = subscribers.filter(
      (subscriber) =>
        getStatus(subscriber.status) ===
        "Bounced"
    ).length;

    const complaints = subscribers.filter(
      (subscriber) =>
        getStatus(subscriber.status) ===
        "Complaint"
    ).length;

    return {
      active,
      unsubscribed,
      bounced,
      complaints,
    };
  }, [subscribers]);

  /* ==========================================================
     SOURCE STATS
  ========================================================== */

  const sourceStats = useMemo(() => {
    const sourceMap = new Map<
      string,
      number
    >();

    subscribers.forEach((subscriber) => {
      const source =
        subscriber.source?.trim() ||
        "Unknown";

      sourceMap.set(
        source,
        (sourceMap.get(source) ?? 0) + 1
      );
    });

    return Array.from(sourceMap.entries())
      .map(([label, value]) => ({
        label,
        value,
        percentage:
          calculatePercentage(
            value,
            totalSubscribers
          ),
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [subscribers, totalSubscribers]);

  const maxSourceValue =
    sourceStats[0]?.value || 1;

  /* ==========================================================
     SOURCE OPTIONS
  ========================================================== */

  const sourceOptions = useMemo(() => {
    return Array.from(
      new Set(
        subscribers
          .map((subscriber) =>
            subscriber.source?.trim()
          )
          .filter(
            (value): value is string =>
              Boolean(value)
          )
      )
    );
  }, [subscribers]);

  /* ==========================================================
     FILTER DATA
  ========================================================== */

  const filteredSubscribers =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return subscribers
        .filter((subscriber) => {
          if (!query) return true;

          const text = [
            getDisplayName(subscriber),
            subscriber.email,
            subscriber.phone,
            subscriber.source,
            subscriber.location,
            subscriber.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return text.includes(query);
        })
        .filter((subscriber) => {
          if (statusFilter === "All") {
            return true;
          }

          return (
            getStatus(subscriber.status) ===
            statusFilter
          );
        })
        .filter((subscriber) => {
          if (sourceFilter === "All") {
            return true;
          }

          return (
            subscriber.source ===
            sourceFilter
          );
        })
        .filter((subscriber) =>
          matchesDateRange(
            subscriber.createdAt,
            dateRangeFilter
          )
        )
        .sort((a, b) => {
          const first = new Date(
            a.createdAt
          ).getTime();

          const second = new Date(
            b.createdAt
          ).getTime();

          return second - first;
        });
    }, [
      subscribers,
      search,
      statusFilter,
      sourceFilter,
      dateRangeFilter,
    ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSubscribers.length /
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
    filteredSubscribers.length
  );

  const paginatedSubscribers =
    filteredSubscribers.slice(
      startIndex,
      endIndex
    );

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setSourceFilter("All");
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
              tracking-[-0.4px]
              text-[#005E2E]
            "
          >
            Newsletter Subscribers
          </h1>

          <p
            className="
              mt-[2px]
              text-[9.5px]
              font-semibold
              leading-[14px]
              text-[#344574]
            "
          >
            Manage and engage with your
            newsletter subscribers.
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
            href="/newsletter/new"
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
              shadow-[0_2px_5px_rgba(0,95,46,0.12)]
              hover:bg-[#004d25]
              transition
            "
          >
            <Plus size={15} />

            Add Subscriber
          </Link>
        </div>
      </div>

      {/* ======================================================
          CONTENT GRID
      ====================================================== */}

      <div
        className="
          mt-[22px]
          grid
          w-full
          min-w-0
          grid-cols-[minmax(0,1fr)_285px]
          gap-[16px]
        "
      >
        {/* ====================================================
            LEFT CONTENT
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
                label="Total Subscribers"
                value={String(
                  totalSubscribers
                )}
                change={
                  totalSubscribers
                    ? "Live"
                    : undefined
                }
                compare="total"
                icon={Mail}
                iconBg="#E6F6E9"
                iconColor="#198F45"
              />

              <StatCard
                label="New This Month"
                value={String(newThisMonth)}
                change={
                  newThisMonth
                    ? `${calculatePercentage(
                      newThisMonth,
                      totalSubscribers
                    ).toFixed(1)}%`
                    : undefined
                }
                compare="of total"
                icon={Send}
                iconBg="#E8F2FF"
                iconColor="#2578E8"
                valueColor="#172969"
              />

              <StatCard
                label="Emails Sent"
                value={String(emailsSent)}
                icon={MailOpen}
                iconBg="#F1E6FD"
                iconColor="#9438E8"
                valueColor="#172969"
              />

              <StatCard
                label="Open Rate"
                value={`${openRate.toFixed(
                  1
                )}%`}
                icon={MailOpen}
                iconBg="#FFF0DB"
                iconColor="#F79413"
                valueColor="#111111"
              />

              <StatCard
                label="Click Rate"
                value={`${clickRate.toFixed(
                  1
                )}%`}
                icon={MousePointer2}
                iconBg="#E0F6F2"
                iconColor="#1CA99C"
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
              w-full
              min-w-0
              grid-cols-[minmax(220px,1.9fr)_125px_135px_120px_minmax(150px,1.15fr)_78px]
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
              <Search
                size={15}
                className="
                  mr-[8px]
                  shrink-0
                  text-[#283E7E]
                "
              />

              <input
                value={search}
                onChange={(event) => {
                  setSearch(
                    event.target.value
                  );
                  setPage(1);
                }}
                placeholder="Search by name, email or location..."
                className="
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[9px]
                  font-semibold
                  text-[#172762]
                  outline-none
                  placeholder:text-[#536184]
                "
              />
            </div>

            {/* STATUS */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(
                    event.target.value
                  );
                  setPage(1);
                }}
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
                  text-[9px]
                  font-semibold
                  text-[#172762]
                  outline-none
                "
              >
                <option value="All">
                  All Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Unsubscribed">
                  Unsubscribed
                </option>

                <option value="Bounced">
                  Bounced
                </option>

                <option value="Complaint">
                  Complaint
                </option>
              </select>

              <ChevronDown
                size={11}
                className="
                  pointer-events-none
                  absolute
                  right-[11px]
                  top-1/2
                  -translate-y-1/2
                  text-[#172762]
                "
              />
            </div>

            {/* SOURCE */}

            <div className="relative">
              <select
                value={sourceFilter}
                onChange={(event) => {
                  setSourceFilter(
                    event.target.value
                  );
                  setPage(1);
                }}
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
                  text-[9px]
                  font-semibold
                  text-[#172762]
                  outline-none
                "
              >
                <option value="All">
                  All Source
                </option>

                {sourceOptions.map(
                  (source) => (
                    <option
                      key={source}
                      value={source}
                    >
                      {source}
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={11}
                className="
                  pointer-events-none
                  absolute
                  right-[11px]
                  top-1/2
                  -translate-y-1/2
                  text-[#172762]
                "
              />
            </div>

            <FilterButton>
              All Tags
            </FilterButton>

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
                text-[#536080]
              "
            >
              <CalendarRange
                size={14}
                className="
                  shrink-0
                  text-[#213C79]
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
                  text-[#536080]
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
                  text-[#213C79]
                "
              />
            </div>

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
                min-w-[1320px]
                table-fixed
                border-collapse
              "
            >
              <colgroup>
                <col style={{ width: "38px" }} />
                <col style={{ width: "220px" }} />
                <col style={{ width: "260px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "210px" }} />
                <col style={{ width: "180px" }} />
                <col style={{ width: "130px" }} />
                <col style={{ width: "70px" }} />
              </colgroup>

              <thead>
                <tr
                  className="
                    h-[36px]
                    bg-[#F8FAFC]
                    text-left
                    text-[#172762]
                  "
                >
                  <th className="px-[9px]">
                    <input
                      type="checkbox"
                      className="
                        h-[11px]
                        w-[11px]
                      "
                    />
                  </th>

                  <th
                    className="
                      px-[7px]
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                    "
                  >
                    Subscriber
                  </th>

                  <th
                    className="
                      px-[7px]
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                    "
                  >
                    Email
                  </th>

                  <th
                    className="
                      px-[7px]
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                    "
                  >
                    Status
                  </th>

                  <th
                    className="
                      px-[7px]
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                    "
                  >
                    Source
                  </th>

                  <th
                    className="
                      px-[7px]
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    Subscribed On
                  </th>

                  <th
                    className="
                      px-[7px]
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                    "
                  >
                    Location
                  </th>

                  <th
                    className="
                      px-[5px]
                      text-center
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-wider
                    "
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {/* LOADING */}

                {loading &&
                  Array.from({
                    length: perPage,
                  }).map((_, index) => (
                    <tr
                      key={`loading-${index}`}
                      className="
                        h-[65px]
                        border-t
                        border-[#E8EBEF]
                      "
                    >
                      <td
                        colSpan={8}
                        className="px-[12px]"
                      >
                        <div
                          className="
                            h-[12px]
                            w-full
                            animate-pulse
                            rounded
                            bg-[#F1F3F5]
                          "
                        />
                      </td>
                    </tr>
                  ))}

                {/* DATA */}

                {!loading &&
                  paginatedSubscribers.map(
                    (
                      subscriber,
                      index
                    ) => {
                      const SourceIcon =
                        getSourceIcon(
                          subscriber.source
                        );

                      const avatar =
                        avatarStyle(
                          startIndex +
                          index
                        );

                      const status =
                        getStatus(
                          subscriber.status
                        );

                      const statusMeta =
                        getStatusStyle(
                          status
                        );

                      const formattedDate = formatDateTime(subscriber.createdAt);
                      const dateParts = formattedDate ? formattedDate.split(",") : ["—"];
                      const dateStr = dateParts[0] || "—";
                      const timeStr = dateParts.slice(1).join(",").trim();

                      return (
                        <tr
                          key={
                            subscriber._id
                          }
                          className="
                            h-[46px]
                            border-t
                            border-[#E8EBEF]
                            bg-white
                            transition-colors
                            hover:bg-[#FBFCFD]
                          "
                        >
                          {/* CHECK */}

                          <td
                            className="
                              px-[9px]
                              align-middle
                            "
                          >
                            <input
                              type="checkbox"
                              className="
                                h-[11px]
                                w-[11px]
                              "
                            />
                          </td>

                          {/* SUBSCRIBER */}

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
                                gap-[8px]
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-[30px]
                                  w-[30px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  text-[9px]
                                  font-semibold
                                "
                                style={
                                  avatar
                                }
                              >
                                {getInitials(
                                  subscriber
                                )}
                              </div>

                              <div className="min-w-0 overflow-hidden">
                                <p
                                  className="
                                    truncate
                                    text-[9px]
                                    font-semibold
                                    leading-[11px]
                                    text-[#192B66]
                                  "
                                >
                                  {getDisplayName(
                                    subscriber
                                  )}
                                </p>

                                <p
                                  className="
                                    mt-[3px]
                                    whitespace-nowrap
                                    text-[9px]
                                    font-semibold
                                    leading-[10px]
                                    text-[#2F4074]
                                  "
                                >
                                  {subscriber.phone ||
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* EMAIL */}

                          <td
                            className="
                              min-w-0
                              px-[7px]
                              align-middle
                            "
                          >
                            <p
                              className="
                                truncate
                                text-[9px]
                                font-semibold
                                text-[#2A3D72]
                              "
                              title={
                                subscriber.email
                              }
                            >
                              {
                                subscriber.email
                              }
                            </p>
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
                                  statusMeta.background,
                                color:
                                  statusMeta.color,
                                borderColor:
                                  statusMeta.border,
                              }}
                            >
                              {status}
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
                                size={12}
                                className="
                                  shrink-0
                                  text-[#354585]
                                "
                              />

                              <span
                                className="
                                  truncate
                                  text-[9px]
                                  font-semibold
                                  text-[#354273]
                                "
                              >
                                {subscriber.source ||
                                  "Unknown"}
                              </span>
                            </div>
                          </td>

                          {/* CREATED */}

                          <td
                            className="
                              px-[7px]
                              align-middle
                              whitespace-nowrap
                            "
                          >
                            <span
                              className="
                                text-[9px]
                                font-semibold
                                text-[#192B66]
                              "
                            >
                              {dateStr}
                            </span>
                            {timeStr && (
                              <span
                                className="
                                  ml-[4px]
                                  text-[8.5px]
                                  font-semibold
                                  text-[#556586]
                                "
                              >
                                {timeStr}
                              </span>
                            )}
                          </td>

                          {/* LOCATION */}

                          <td
                            className="
                              min-w-0
                              px-[7px]
                              align-middle
                            "
                          >
                            <span
                              className="
                                block
                                truncate
                                text-[9px]
                                font-semibold
                                text-[#304176]
                              "
                            >
                              {subscriber.location ||
                                "—"}
                            </span>
                          </td>

                          {/* ACTION */}

                          <td
                            className="
                              px-[4px]
                              text-center
                              align-middle
                            "
                          >
                            <button
                              type="button"
                              className="
                                mx-auto
                                flex
                                h-[28px]
                                w-[28px]
                                items-center
                                justify-center
                                rounded-[5px]
                                border
                                border-[#E3E7EC]
                                bg-white
                                text-[#263C76]
                                transition
                                hover:bg-[#F8FAFC]
                              "
                            >
                              <MoreHorizontal
                                size={
                                  14
                                }
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}

                {/* EMPTY */}

                {!loading &&
                  paginatedSubscribers.length ===
                  0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="
                          h-[180px]
                          text-center
                        "
                      >
                        <div
                          className="
                            mx-auto
                            flex
                            max-w-[300px]
                            flex-col
                            items-center
                          "
                        >
                          <div
                            className="
                              flex
                              h-[44px]
                              w-[44px]
                              items-center
                              justify-center
                              rounded-full
                              bg-[#E8F7EA]
                              text-[#198F45]
                            "
                          >
                            <UsersRound
                              size={
                                21
                              }
                            />
                          </div>

                          <p
                            className="
                              mt-[10px]
                              text-[9px]
                              font-semibold
                              text-[#172762]
                            "
                          >
                            No subscribers
                            found
                          </p>

                          <p
                            className="
                              mt-[4px]
                              text-[9px]
                              text-[#667085]
                            "
                          >
                            Try changing
                            your filters or
                            search.
                          </p>
                        </div>
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
                min-w-[1320px]
                min-h-[56px]
                items-center
                justify-between
                gap-[10px]
                border-t
                border-[#E6E9ED]
                px-[16px]
                py-[10px]
              "
            >
              <p
                className="
                  shrink-0
                  whitespace-nowrap
                  text-[10px]
                  font-semibold
                  text-[#475A83]
                "
              >
                {filteredSubscribers.length >
                  0
                  ? `Showing ${startIndex + 1
                  } to ${endIndex} of ${filteredSubscribers.length
                  } subscribers`
                  : "Showing 0 subscribers"}
              </p>

              <div className="flex shrink-0 items-center gap-[14px]">
                <div
                  className="
                    flex
                    items-center
                    gap-[5px]
                  "
                >
                  <button
                    type="button"
                    disabled={safePage === 1}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(
                          1,
                          current - 1
                        )
                      )
                    }
                    className="
                      flex
                      h-[28px]
                      w-[28px]
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
                      3,
                      totalPages
                    ),
                  }).map((_, index) => {
                    const number =
                      index + 1;

                    return (
                      <button
                        key={number}
                        type="button"
                        onClick={() =>
                          setPage(
                            number
                          )
                        }
                        className={`
                          flex
                          h-[28px]
                          w-[28px]
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
                  })}

                  {totalPages > 4 && (
                    <span
                      className="
                        flex
                        h-[28px]
                        w-[28px]
                        items-center
                        justify-center
                        rounded-[4px]
                        border
                        border-[#E3E7ED]
                        bg-white
                        text-[9px]
                        text-[#596584]
                      "
                    >
                      ...
                    </span>
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
                        h-[28px]
                        min-w-[28px]
                        items-center
                        justify-center
                        rounded-[4px]
                        border
                        px-[5px]
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
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                    className="
                      flex
                      h-[28px]
                      w-[28px]
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
                  onChange={(event) => {
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
                    text-[#182A65]
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
                  size={11}
                  className="
                    pointer-events-none
                    absolute
                    right-[8px]
                    top-1/2
                    -translate-y-1/2
                    text-[#182A65]
                  "
                />
                </div>
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
              SUBSCRIBER OVERVIEW
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
                gap-[7px]
              "
            >
              <h2
                className="
                  whitespace-nowrap
                  text-[11px]
                  font-semibold
                  text-[#182A65]
                "
              >
                Subscriber Overview
              </h2>

              <button
                type="button"
                className="
                  flex
                  shrink-0
                  items-center
                  gap-[3px]
                  text-[9px]
                  font-semibold
                  text-[#167E48]
                "
              >
                View Report

                <ArrowRight
                  size={10}
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
                  relative
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
                    totalSubscribers > 0
                      ? `conic-gradient(
                          #2DB83D 0% ${calculatePercentage(
                        statusStats.active,
                        totalSubscribers
                      )
                      }%,
                          #F6A313 ${calculatePercentage(
                        statusStats.active,
                        totalSubscribers
                      )
                      }% ${calculatePercentage(
                        statusStats.active +
                        statusStats.unsubscribed,
                        totalSubscribers
                      )
                      }%,
                          #F01B1F ${calculatePercentage(
                        statusStats.active +
                        statusStats.unsubscribed,
                        totalSubscribers
                      )
                      }% ${calculatePercentage(
                        statusStats.active +
                        statusStats.unsubscribed +
                        statusStats.bounced,
                        totalSubscribers
                      )
                      }%,
                          #99A4B8 ${calculatePercentage(
                        statusStats.active +
                        statusStats.unsubscribed +
                        statusStats.bounced,
                        totalSubscribers
                      )
                      }% 100%
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
                      text-[#111111]
                    "
                  >
                    {totalSubscribers}
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
                {[
                  {
                    label: "Active",
                    value:
                      statusStats.active,
                    color: "#2DB83D",
                  },
                  {
                    label:
                      "Unsubscribed",
                    value:
                      statusStats.unsubscribed,
                    color: "#F6A313",
                  },
                  {
                    label: "Bounced",
                    value:
                      statusStats.bounced,
                    color: "#F01B1F",
                  },
                  {
                    label:
                      "Complaints",
                    value:
                      statusStats.complaints,
                    color: "#99A4B8",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
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
                          text-[#182A65]
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
                      {calculatePercentage(
                        item.value,
                        totalSubscribers
                      ).toFixed(1)}
                      %)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================
              TOP SOURCES
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
                text-[#182A65]
              "
            >
              Top Subscription Sources
            </h2>

            {sourceStats.length > 0 ? (
              <div
                className="
                  mt-[16px]
                  space-y-[12px]
                "
              >
                {sourceStats.map(
                  (item, index) => {
                    const colors = [
                      "#178B49",
                      "#1777DD",
                      "#854BDD",
                      "#F6A012",
                      "#17939D",
                    ];

                    return (
                      <div
                        key={item.label}
                        className="
                          grid
                          grid-cols-[82px_minmax(0,1fr)_55px]
                          items-center
                          gap-[5px]
                        "
                      >
                        <span
                          className="
                            truncate
                            text-[9px]
                            font-semibold
                            text-[#182A65]
                          "
                          title={
                            item.label
                          }
                        >
                          {item.label}
                        </span>

                        <div
                          className="
                            h-[5px]
                            min-w-0
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
                                  maxSourceValue) *
                                100
                              )}%`,
                              backgroundColor:
                                colors[
                                index %
                                colors.length
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
                            text-[#344477]
                          "
                        >
                          {item.value} (
                          {item.percentage.toFixed(
                            1
                          )}
                          %)
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <p
                className="
                  py-[30px]
                  text-center
                  text-[9px]
                  text-[#667085]
                "
              >
                No source data yet.
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
                  text-[9px]
                  font-semibold
                  text-[#182A65]
                "
              >
                Quick Actions
              </h2>
            </div>

            {[
              {
                label:
                  "Add New Subscriber",
                icon: UserPlus,
              },
              {
                label:
                  "Import Subscribers",
                icon: Download,
              },
              {
                label:
                  "Send Newsletter",
                icon: Send,
              },
              {
                label:
                  "Create New Campaign",
                icon: Megaphone,
              },
              {
                label:
                  "View All Campaigns",
                icon: Mail,
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
                      size={12}
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
                    size={12}
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
              border-[#E2E8E4]
              bg-[#FAFCFA]
              px-[14px]
              pb-[16px]
              pt-[14px]
            "
          >
            <div
              className="
                flex
                items-start
                gap-[10px]
              "
            >
              <Headphones
                size={25}
                strokeWidth={1.8}
                className="
                  mt-[1px]
                  shrink-0
                  text-[#17733B]
                "
              />

              <div>
                <h2
                  className="
                    text-[9.5px]
                    font-semibold
                    text-[#08602E]
                  "
                >
                  Need Help?
                </h2>

                <p
                  className="
                    mt-[7px]
                    text-[9px]
                    font-semibold
                    text-[#44537C]
                  "
                >
                  For any assistance,
                  contact our team.
                </p>
              </div>
            </div>

            <div
              className="
                ml-[34px]
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
                ml-[34px]
                mt-[11px]
                flex
                min-w-0
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
    </section>
  );
}
