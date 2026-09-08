"use client";

import {
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  HandHeart,
  Mail,
  MessageCircleMore,
  MoreHorizontal,
  Phone,
  Plus,
  Search,
  Send,
  Users,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type SubmissionStatus =
  | "New"
  | "In Progress"
  | "Contacted"
  | "Responded";

type FormType =
  | "Sewa Help Request"
  | "General Enquiry"
  | "Volunteer Registration"
  | "CSR / Partner Enquiry"
  | "Donation Enquiry"
  | "Newsletter Subscription"
  | "Other Forms";

type Submission = {
  id: string;

  name: string;
  email: string;
  phone: string;

  formType: FormType;

  submittedDate: string;
  submittedTime: string;

  status: SubmissionStatus;

  assignedTo: string;
};

type DateRangeFilter =
  | "ALL"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH";

function parseSubmissionDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function matchesDateRange(
  value: string,
  range: DateRangeFilter
) {
  if (range === "ALL") {
    return true;
  }

  const date = parseSubmissionDate(value);

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

/* ============================================================
   DATA
   Later tum API data se replace kar sakte ho.
============================================================ */

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: "SUB-2026-1248",
    name: "Ramesh Sharma",
    email: "rameshsharma@email.com",
    phone: "9876543210",
    formType: "Sewa Help Request",
    submittedDate: "31 May 2026",
    submittedTime: "10:30 AM",
    status: "New",
    assignedTo: "Vikram Singh",
  },

  {
    id: "SUB-2026-1247",
    name: "Priya Kapoor",
    email: "priyak@gmail.com",
    phone: "9812345678",
    formType: "General Enquiry",
    submittedDate: "31 May 2026",
    submittedTime: "09:45 AM",
    status: "New",
    assignedTo: "Anjali Verma",
  },

  {
    id: "SUB-2026-1246",
    name: "Ankit Nair",
    email: "ankitnair@gmail.com",
    phone: "9712345670",
    formType: "Volunteer Registration",
    submittedDate: "31 May 2026",
    submittedTime: "09:20 AM",
    status: "Contacted",
    assignedTo: "Rohit Kumar",
  },

  {
    id: "SUB-2026-1245",
    name: "Sunita Chauhan",
    email: "sunitac@gmail.com",
    phone: "9998765432",
    formType: "CSR / Partner Enquiry",
    submittedDate: "31 May 2026",
    submittedTime: "08:55 AM",
    status: "In Progress",
    assignedTo: "Vikram Singh",
  },

  {
    id: "SUB-2026-1244",
    name: "Meera Das",
    email: "meeradas@email.com",
    phone: "9870012345",
    formType: "General Enquiry",
    submittedDate: "31 May 2026",
    submittedTime: "08:15 AM",
    status: "New",
    assignedTo: "Anjali Verma",
  },

  {
    id: "SUB-2026-1243",
    name: "Green Earth Pvt. Ltd.",
    email: "contact@greenearth.com",
    phone: "9811122233",
    formType: "CSR / Partner Enquiry",
    submittedDate: "30 May 2026",
    submittedTime: "07:40 PM",
    status: "Responded",
    assignedTo: "Vikram Singh",
  },

  {
    id: "SUB-2026-1242",
    name: "Rahul Verma",
    email: "rahulv@gmail.com",
    phone: "9898989898",
    formType: "Sewa Help Request",
    submittedDate: "30 May 2026",
    submittedTime: "06:20 PM",
    status: "In Progress",
    assignedTo: "Rohit Kumar",
  },

  {
    id: "SUB-2026-1241",
    name: "Neha Joshi",
    email: "neha.joshi@gmail.com",
    phone: "9876540001",
    formType: "General Enquiry",
    submittedDate: "30 May 2026",
    submittedTime: "05:15 PM",
    status: "Contacted",
    assignedTo: "Anjali Verma",
  },

  {
    id: "SUB-2026-1240",
    name: "Amitabh Singh",
    email: "amitabh@outlook.com",
    phone: "9955443322",
    formType: "Volunteer Registration",
    submittedDate: "30 May 2026",
    submittedTime: "04:05 PM",
    status: "New",
    assignedTo: "Rohit Kumar",
  },

  {
    id: "SUB-2026-1239",
    name: "HealthPlus Foundation",
    email: "info@healthplus.org",
    phone: "9811100222",
    formType: "CSR / Partner Enquiry",
    submittedDate: "30 May 2026",
    submittedTime: "03:20 PM",
    status: "Responded",
    assignedTo: "Vikram Singh",
  },
];

/* ============================================================
   FORM TYPE META
============================================================ */

const FORM_TYPES: {
  type: FormType;
  icon: ComponentType<{
    size?: number;
    style?: CSSProperties;
    className?: string;
  }>;
  bg: string;
  color: string;
  count: number;
}[] = [
    {
      type: "Sewa Help Request",
      icon: HandHeart,
      bg: "#E5F5E9",
      color: "#29834C",
      count: 58,
    },
    {
      type: "General Enquiry",
      icon: Mail,
      bg: "#E9F2FE",
      color: "#3378D4",
      count: 421,
    },
    {
      type: "Volunteer Registration",
      icon: Users,
      bg: "#F1E8FD",
      color: "#844EDA",
      count: 32,
    },
    {
      type: "CSR / Partner Enquiry",
      icon: Building2,
      bg: "#E7F5EB",
      color: "#298551",
      count: 21,
    },
    {
      type: "Donation Enquiry",
      icon: HandHeart,
      bg: "#FFF1E1",
      color: "#E78122",
      count: 16,
    },
    {
      type: "Newsletter Subscription",
      icon: Send,
      bg: "#FDE9ED",
      color: "#DE5368",
      count: 342,
    },
    {
      type: "Other Forms",
      icon: MoreHorizontal,
      bg: "#EEF1F6",
      color: "#536686",
      count: 58,
    },
  ];

/* ============================================================
   STATUS META
============================================================ */

const STATUS_META: Record<
  SubmissionStatus,
  {
    bg: string;
    color: string;
    border: string;
  }
> = {
  New: {
    bg: "#E8F2FE",
    color: "#3377D1",
    border: "#D2E4F8",
  },

  "In Progress": {
    bg: "#FFF3DC",
    color: "#D98B15",
    border: "#F1DEB7",
  },

  Contacted: {
    bg: "#FFF1D9",
    color: "#E08D17",
    border: "#F5DBAB",
  },

  Responded: {
    bg: "#E3F4E8",
    color: "#28804A",
    border: "#CBE6D2",
  },
};

/* ============================================================
   FORM BADGE
============================================================ */

function getFormStyle(
  form: FormType
) {
  switch (form) {
    case "Sewa Help Request":
      return {
        bg: "#E4F5EE",
        color: "#287C5D",
        border: "#CFE8DD",
      };

    case "General Enquiry":
      return {
        bg: "#E8F2FE",
        color: "#3377D1",
        border: "#D2E4F8",
      };

    case "Volunteer Registration":
      return {
        bg: "#F1E8FD",
        color: "#8550D6",
        border: "#E0D3F5",
      };

    case "CSR / Partner Enquiry":
      return {
        bg: "#E4F5EA",
        color: "#2D7D4D",
        border: "#CFE7D6",
      };

    case "Donation Enquiry":
      return {
        bg: "#FFF1DD",
        color: "#D9841D",
        border: "#F2DCB8",
      };

    case "Newsletter Subscription":
      return {
        bg: "#FDE9ED",
        color: "#D64D68",
        border: "#F2D4DB",
      };

    default:
      return {
        bg: "#EEF1F5",
        color: "#59677F",
        border: "#DEE3E9",
      };
  }
}

/* ============================================================
   PAGE
============================================================ */

export default function FormsSubmissionsPage() {
  const [
    submissions,
    setSubmissions,
  ] = useState<Submission[]>(
    INITIAL_SUBMISSIONS
  );

  const [search, setSearch] =
    useState("");

  const [
    formFilter,
    setFormFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    dateRangeFilter,
    setDateRangeFilter,
  ] = useState<DateRangeFilter>("ALL");

  const [page, setPage] =
    useState(1);

  const [perPage, setPerPage] =
    useState(10);

  const [
    checkedRows,
    setCheckedRows,
  ] = useState<string[]>([]);

  /* ==========================================================
     STATS
  ========================================================== */

  const totalSubmissions =
    submissions.length;

  const newCount =
    useMemo(
      () =>
        submissions.filter(
          (item) =>
            item.status === "New"
        ).length,
      [submissions]
    );

  const pendingCount =
    useMemo(
      () =>
        submissions.filter(
          (item) =>
            item.status ===
            "In Progress" ||
            item.status ===
            "Contacted"
        ).length,
      [submissions]
    );

  const respondedCount =
    useMemo(
      () =>
        submissions.filter(
          (item) =>
            item.status ===
            "Responded"
        ).length,
      [submissions]
    );

  /* ==========================================================
     FILTERED
  ========================================================== */

  const visible =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return submissions.filter(
        (item) => {
          if (
            formFilter &&
            item.formType !==
            formFilter
          ) {
            return false;
          }

          if (
            statusFilter &&
            item.status !==
            statusFilter
          ) {
            return false;
          }

          if (
            !matchesDateRange(
              item.submittedDate,
              dateRangeFilter
            )
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          return [
            item.name,
            item.email,
            item.phone,
            item.formType,
            item.status,
            item.assignedTo,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query);
        }
      );
    }, [
      submissions,
      search,
      formFilter,
      statusFilter,
      dateRangeFilter,
    ]);

  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        visible.length /
        perPage
      )
    );

  const safePage =
    Math.min(
      page,
      totalPages
    );

  const startIndex =
    (safePage - 1) *
    perPage;

  const endIndex =
    Math.min(
      startIndex +
      perPage,
      visible.length
    );

  const pageRows =
    visible.slice(
      startIndex,
      endIndex
    );

  /* ==========================================================
     CHECKBOX
  ========================================================== */

  function toggleRow(
    id: string
  ) {
    setCheckedRows(
      (current) =>
        current.includes(id)
          ? current.filter(
            (item) =>
              item !== id
          )
          : [...current, id]
    );
  }

  function toggleAll() {
    const ids =
      pageRows.map(
        (item) => item.id
      );

    const allChecked =
      ids.every((id) =>
        checkedRows.includes(id)
      );

    if (allChecked) {
      setCheckedRows(
        (current) =>
          current.filter(
            (id) =>
              !ids.includes(id)
          )
      );
    } else {
      setCheckedRows(
        (current) =>
          Array.from(
            new Set([
              ...current,
              ...ids,
            ])
          )
      );
    }
  }

  return (
    <section
      className="
        w-full
        min-w-0
        overflow-hidden
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
          min-w-0
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
            Forms &amp; Submissions
          </h1>

          <div
            className="
              mt-[6px]
              flex
              items-center
              gap-[7px]
              text-[9px]
              font-semibold
              text-[#334575]
            "
          >
            <span>
              Dashboard
            </span>

            <ChevronRight
              size={9}
            />

            <span>
              Engagement &amp;
              Leads
            </span>

            <ChevronRight
              size={9}
            />

            <span>
              Forms &amp;
              Submissions
            </span>
          </div>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-[11px]
            pt-[3px]
          "
        >
          <button
            type="button"
            className="
              flex
              h-[36px]
              items-center
              gap-[7px]
              rounded-[5px]
              border
              border-[#DFE4EA]
              bg-white
              px-[15px]
              text-[9px]
              font-semibold
              text-[#263A70]
            "
          >
            <Download
              size={13}
            />

            Export Data
          </button>

          <button
            type="button"
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
            "
          >
            <Plus size={14} />

            Add New Form
          </button>
        </div>
      </div>

      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="mt-[15px] w-full min-w-0 overflow-x-auto pb-[4px]">
        <div
          className="
            grid
            w-full
            min-w-[950px]
            grid-cols-5
            gap-[10px]
          "
        >
          <StatCard
            label="Total Submissions"
            value="1,248"
            icon={FileSpreadsheet}
            iconBg="#E5F5E9"
            iconColor="#267E4A"
            change="18.6%"
          />

          <StatCard
            label="New This Week"
            value="342"
            icon={FileSpreadsheet}
            iconBg="#E9F2FE"
            iconColor="#3479D3"
            change="22.4%"
          />

          <StatCard
            label="Pending / Unread"
            value="186"
            icon={Clock3}
            iconBg="#FFF0E0"
            iconColor="#F08324"
            change="8.3%"
            negative
          />

          <StatCard
            label="Responded"
            value="876"
            icon={CheckCircle2}
            iconBg="#F0E8FD"
            iconColor="#7650D5"
            change="16.2%"
          />

          <StatCard
            label="Conversion Rate"
            value="6.24%"
            icon={Filter}
            iconBg="#E3F4EF"
            iconColor="#2A8871"
            change="1.35%"
          />
        </div>
      </div>

      {/* ======================================================
          FILTER BAR
      ====================================================== */}

      <div className="mt-[15px] w-full min-w-0 overflow-x-auto pb-[4px]">
        <div
          className="
            grid
            w-full
            min-w-[950px]
            grid-cols-[minmax(220px,1.25fr)_150px_150px_230px_minmax(0,1fr)_105px]
            gap-[9px]
            rounded-[6px]
            border
            border-[#E5E8EC]
            bg-white
            p-[8px]
          "
        >
          {/* SEARCH */}

          <div
            className="
            flex
            h-[36px]
            min-w-0
            items-center
            overflow-hidden
            rounded-[5px]
            border
            border-[#DFE4EA]
            bg-white
            px-[10px]
          "
          >
            <Search
              size={13}
              className="
              mr-[7px]
              shrink-0
              text-[#304576]
            "
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target
                    .value
                );

                setPage(1);
              }}
              placeholder="Search by name, email, phone..."
              className="
              h-full
              w-0
              min-w-0
              flex-1
              bg-transparent
              text-[9px]
              font-semibold
              text-[#334574]
              outline-none
              placeholder:text-[#69758E]
            "
            />
          </div>

          {/* FORM */}

          <FilterSelect
            value={formFilter}
            onChange={(value) => {
              setFormFilter(
                value
              );

              setPage(1);
            }}
          >
            <option value="">
              All Forms
            </option>

            {FORM_TYPES.map(
              (item) => (
                <option
                  key={item.type}
                  value={item.type}
                >
                  {item.type}
                </option>
              )
            )}
          </FilterSelect>

          {/* STATUS */}

          <FilterSelect
            value={statusFilter}
            onChange={(value) => {
              setStatusFilter(
                value
              );

              setPage(1);
            }}
          >
            <option value="">
              All Status
            </option>

            <option value="New">
              New
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Contacted">
              Contacted
            </option>

            <option value="Responded">
              Responded
            </option>
          </FilterSelect>

          {/* DATE */}

          <div
            className="
            relative
            flex
            h-[36px]
            min-w-0
            items-center
            gap-[8px]
            overflow-hidden
            rounded-[5px]
            border
            border-[#DFE4EA]
            bg-white
            px-[10px]
            text-[9px]
            font-semibold
            text-[#334574]
          "
          >
            <CalendarDays
              size={13}
              className="shrink-0"
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
              min-w-0
              cursor-pointer
              appearance-none
              bg-transparent
              pr-[22px]
              text-[9px]
              font-semibold
              text-[#334574]
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
              right-[9px]
              top-1/2
              -translate-y-1/2
            "
            />
          </div>

          <div />

          <button
            type="button"
            className="
            flex
            h-[36px]
            items-center
            justify-center
            gap-[6px]
            rounded-[5px]
            border
            border-[#DFE4EA]
            bg-white
            text-[9px]
            font-semibold
            text-[#263A70]
          "
          >
            <Filter size={12} />

            More Filters
          </button>
        </div>
      </div>

      {/* ======================================================
          CONTENT GRID
      ====================================================== */}

      <div
        className="
          mt-[10px]
          grid
          w-full
          min-w-0
          grid-cols-1
          gap-[10px]
          lg:grid-cols-[245px_minmax(0,1fr)]
        "
      >
        {/* ====================================================
            LEFT SIDEBAR
        ==================================================== */}

        <aside
          className="
            w-[245px]
            min-w-0
          "
        >
          {/* FORM TYPES */}

          <div
            className="
              rounded-[7px]
              border
              border-[#E2E7EB]
              bg-white
              px-[12px]
              pb-[12px]
              pt-[11px]
            "
          >
            <h2 className="text-[10px] font-semibold text-[#182A65]">
              Form Types
            </h2>

            <div className="mt-[11px] space-y-[10px]">
              {FORM_TYPES.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    type="button"
                    key={item.type}
                    onClick={() => {
                      setFormFilter(item.type);
                      setPage(1);
                    }}
                    className="
                      flex
                      w-full
                      min-w-0
                      items-center
                      gap-[8px]
                    "
                  >
                    <div
                      className="
                        flex
                        h-[22px]
                        w-[22px]
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                      "
                      style={{
                        backgroundColor: item.bg,
                      }}
                    >
                      <Icon
                        size={11}
                        style={{
                          color: item.color,
                        }}
                      />
                    </div>

                    <span
                      className="
                        min-w-0
                        flex-1
                        truncate
                        text-left
                        text-[9px]
                        font-semibold
                        text-[#293B70]
                      "
                    >
                      {item.type}
                    </span>

                    <span
                      className="
                        shrink-0
                        text-[9px]
                        font-semibold
                        text-[#526080]
                      "
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="
                mt-[15px]
                flex
                w-full
                items-center
                justify-center
                gap-[7px]
                text-[9px]
                font-semibold
                text-[#385084]
                hover:text-[#182A65]
              "
            >
              View All Forms
              <ArrowRight size={10} />
            </button>
          </div>

          {/* STATUS */}

          <div
            className="
              mt-[10px]
              rounded-[7px]
              border
              border-[#E2E7EB]
              bg-white
              px-[12px]
              pb-[13px]
              pt-[11px]
            "
          >
            <h2 className="text-[10px] font-semibold text-[#182A65]">
              Submission Status
            </h2>

            <div
              className="
                mt-[15px]
                flex
                items-center
                gap-[11px]
              "
            >
              {/* DONUT */}

              <div
                className="
                  flex
                  h-[91px]
                  w-[91px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                "
                style={{
                  background: `
                    conic-gradient(
                      #29A676 0% 27.4%,
                      #357CDF 27.4% 42.3%,
                      #FF894A 42.3% 74.5%,
                      #9A55D9 74.5% 100%
                    )
                  `,
                }}
              >
                <div
                  className="
                    flex
                    h-[56px]
                    w-[56px]
                    flex-col
                    items-center
                    justify-center
                    rounded-full
                    bg-white
                  "
                >
                  <span
                    className="
                      text-[16px]
                      font-semibold
                      leading-none
                      text-[#182A65]
                    "
                  >
                    1,248
                  </span>

                  <span
                    className="
                      mt-[4px]
                      text-[9px]
                      font-semibold
                      text-[#5D6983]
                    "
                  >
                    Total
                  </span>
                </div>
              </div>

              <div
                className="
                  min-w-0
                  flex-1
                  space-y-[9px]
                "
              >
                <LegendRow
                  color="#29A676"
                  label="New"
                  value="342 (27.4%)"
                />

                <LegendRow
                  color="#357CDF"
                  label="In Progress"
                  value="186 (14.9%)"
                />

                <LegendRow
                  color="#FF894A"
                  label="Contacted"
                  value="402 (32.2%)"
                />

                <LegendRow
                  color="#9A55D9"
                  label="Responded"
                  value="318 (25.5%)"
                />
              </div>
            </div>

            <button
              type="button"
              className="
                mt-[16px]
                flex
                w-full
                items-center
                justify-center
                gap-[7px]
                text-[9px]
                font-semibold
                text-[#385084]
                hover:text-[#182A65]
              "
            >
              View Status Report
              <ArrowRight size={10} />
            </button>
          </div>
        </aside>

        {/* ====================================================
            TABLE
        ==================================================== */}

        <main
          className="
            w-full
            min-w-0
            rounded-[7px]
            border
            border-[#E2E7EB]
            bg-white
          "
        >
          {/* TABLE HEADER */}

          <div
            className="
              flex
              h-[37px]
              min-w-0
              items-center
              justify-between
              gap-[10px]
              px-[12px]
            "
          >
            <h2
              className="
                text-[10px]
                font-semibold
                text-[#203470]
              "
            >
              All Submissions
            </h2>

            <div
              className="
                flex
                shrink-0
                items-center
                gap-[12px]
              "
            >
              <span
                className="
                  text-[9px]
                  font-semibold
                  text-[#5D6985]
                "
              >
                Showing 1 to 10 of 1,248
              </span>

              <div
                className="
                  flex
                  items-center
                  gap-[4px]
                "
              >
                <SmallPageButton>
                  <ChevronLeft size={9} />
                </SmallPageButton>

                <SmallPageButton active>1</SmallPageButton>

                <SmallPageButton>2</SmallPageButton>

                <SmallPageButton>3</SmallPageButton>

                <span
                  className="
                    px-[4px]
                    text-[9px]
                    text-[#596681]
                  "
                >
                  ...
                </span>

                <SmallPageButton>125</SmallPageButton>

                <SmallPageButton>
                  <ChevronRight size={9} />
                </SmallPageButton>
              </div>
            </div>
          </div>

          {/* TABLE SCROLL WRAPPER */}

          <div className="w-full min-w-0 overflow-x-auto">
            <table
              className="
                w-full
                min-w-[1100px]
                table-fixed
                border-collapse
              "
            >
              <colgroup>
                <col style={{ width: "4%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "5%" }} />
              </colgroup>

              <thead>
                <tr
                  className="
                  h-[33px]
                  bg-[#F7F8FB]
                  text-left
                "
                >
                  <th
                    className="
                    px-[10px]
                  "
                  >
                    <input
                      type="checkbox"
                      checked={
                        pageRows.length >
                        0 &&
                        pageRows.every(
                          (item) =>
                            checkedRows.includes(
                              item.id
                            )
                        )
                      }
                      onChange={
                        toggleAll
                      }
                      className="
                      h-[12px]
                      w-[12px]
                      accent-[#176D43]
                    "
                    />
                  </th>

                  <TableHead>
                    NAME
                  </TableHead>

                  <TableHead>
                    FORM TYPE
                  </TableHead>

                  <TableHead>
                    CONTACT
                  </TableHead>

                  <TableHead>
                    SUBMITTED ON
                  </TableHead>

                  <TableHead>
                    STATUS
                  </TableHead>

                  <TableHead>
                    ASSIGNED TO
                  </TableHead>

                  <TableHead>
                    ACTIONS
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {pageRows.map(
                  (item) => {
                    const formMeta =
                      getFormStyle(
                        item.formType
                      );

                    const statusMeta =
                      STATUS_META[
                      item.status
                      ];

                    return (
                      <tr
                        key={item.id}
                        className="
                        h-[47px]
                        border-t
                        border-[#E8EBEF]
                        bg-white
                        hover:bg-[#FBFCFD]
                      "
                      >
                        <td
                          className="
                          px-[10px]
                          align-middle
                        "
                        >
                          <input
                            type="checkbox"
                            checked={checkedRows.includes(
                              item.id
                            )}
                            onChange={() =>
                              toggleRow(
                                item.id
                              )
                            }
                            className="
                            h-[12px]
                            w-[12px]
                            accent-[#176D43]
                          "
                          />
                        </td>

                        {/* NAME */}

                        <td
                          className="
                          min-w-0
                          align-middle
                        "
                        >
                          <p
                            className="
                            truncate
                            pr-[7px]
                            text-sm
                            font-semibold
                            text-[#26396E]
                          "
                          >
                            {item.name}
                          </p>

                          <p
                            className="
                            mt-[2px]
                            truncate
                            pr-[7px]
                            text-xs
                            font-semibold
                            text-[#5F6C86]
                          "
                          >
                            {item.email}
                          </p>
                        </td>

                        {/* FORM TYPE */}

                        <td
                          className="
                          align-middle
                        "
                        >
                          <MetaBadge
                            bg={
                              formMeta.bg
                            }
                            color={
                              formMeta.color
                            }
                            border={
                              formMeta.border
                            }
                          >
                            {
                              item.formType
                            }
                          </MetaBadge>
                        </td>

                        {/* CONTACT */}

                        <td
                          className="
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
                            <Phone
                              size={12}
                              className="
                              shrink-0
                              text-[#526181]
                            "
                            />

                            <span
                              className="
                              truncate
                              text-xs
                              font-semibold
                              text-[#415079]
                            "
                            >
                              {item.phone}
                            </span>
                          </div>
                        </td>

                        {/* DATE */}

                        <td className="px-[10px] align-middle">
                          <p
                            className="
                            whitespace-nowrap
                            text-[9px]
                            font-semibold
                            leading-[11px]
                            text-[#26396D]
                          "
                          >
                            {item.submittedDate}
                          </p>

                          <p
                            className="
                            mt-[1px]
                            whitespace-nowrap
                            text-[9px]
                            font-semibold
                            leading-[10px]
                            text-[#556488]
                          "
                          >
                            {item.submittedTime}
                          </p>
                        </td>

                        {/* STATUS */}

                        <td className="align-middle">
                          <MetaBadge
                            bg={statusMeta.bg}
                            color={statusMeta.color}
                            border={statusMeta.border}
                          >
                            {item.status}
                          </MetaBadge>
                        </td>

                        {/* ASSIGNED */}

                        <td className="min-w-0 align-middle">
                          <p
                            className="
                            truncate
                            pr-[8px]
                            text-[9px]
                            font-semibold
                            text-[#344574]
                          "
                          >
                            {item.assignedTo}
                          </p>
                        </td>

                        {/* ACTION */}

                        <td
                          className="
                          align-middle
                        "
                        >
                          <div className="flex items-center justify-end gap-[6px] pr-[8px]">
                            <button
                              type="button"
                              title="View Details"
                              className="flex h-[28px] w-[28px] items-center justify-center rounded-[5px] border border-[#E3E7EC] bg-white text-[#263C76] hover:bg-[#F8FAFC]"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              type="button"
                              title="Send Email"
                              className="flex h-[28px] w-[28px] items-center justify-center rounded-[5px] border border-[#E3E7EC] bg-white text-[#263C76] hover:bg-[#F8FAFC]"
                            >
                              <Mail size={14} />
                            </button>

                            <button
                              type="button"
                              title="More Actions"
                              className="flex h-[28px] w-[28px] items-center justify-center rounded-[5px] border border-[#E3E7EC] bg-white text-[#263C76] hover:bg-[#F8FAFC]"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>

          {/* =================================================
              TABLE FOOT
          ================================================= */}

          <div
            className="
              flex
              h-[42px]
              min-w-0
              items-center
              justify-between
              gap-[10px]
              border-t
              border-[#E8EBEF]
              px-[12px]
            "
          >
            <div className="relative">
              <select
                className="
                  h-[30px]
                  w-[110px]
                  appearance-none
                  rounded-[4px]
                  border
                  border-[#DFE4EA]
                  bg-white
                  px-[8px]
                  pr-[24px]
                  text-[9px]
                  font-semibold
                  text-[#344574]
                  outline-none
                "
              >
                <option>
                  Bulk Actions
                </option>

                <option>
                  Mark Responded
                </option>

                <option>
                  Assign
                </option>

                <option>
                  Export
                </option>
              </select>

              <ChevronDown
                size={11}
                className="
                  pointer-events-none
                  absolute
                  right-[7px]
                  top-1/2
                  -translate-y-1/2
                  text-[#344574]
                "
              />
            </div>

            <div
              className="
                flex
                items-center
                gap-[4px]
              "
            >
              <PageButton
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
              >
                <ChevronLeft
                  size={9}
                />
              </PageButton>

              {Array.from({
                length: Math.min(
                  3,
                  totalPages
                ),
              }).map(
                (_, index) => {
                  const number =
                    index + 1;

                  return (
                    <PageButton
                      key={number}
                      active={
                        safePage ===
                        number
                      }
                      onClick={() =>
                        setPage(
                          number
                        )
                      }
                    >
                      {number}
                    </PageButton>
                  );
                }
              )}

              {totalPages > 4 && (
                <span
                  className="
                    px-[4px]
                    text-[9px]
                    text-[#596783]
                  "
                >
                  ...
                </span>
              )}

              {totalPages > 3 && (
                <PageButton
                  onClick={() =>
                    setPage(
                      totalPages
                    )
                  }
                >
                  {totalPages}
                </PageButton>
              )}

              <PageButton
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
              >
                <ChevronRight
                  size={9}
                />
              </PageButton>
            </div>
          </div>
        </main>
      </div>

      {/* ======================================================
          BOTTOM REPORT CARDS (OVERFLOW X ENABLED)
      ====================================================== */}

      <div className="mt-[10px] w-full min-w-0 overflow-x-auto pb-[4px]">
        <div
          className="
            grid
            w-full
            min-w-[850px]
            grid-cols-4
            gap-[10px]
          "
        >
          {/* TOP PERFORMING */}

          <BottomCard>
            <div className="flex items-center gap-[7px]">
              <FileSpreadsheet size={13} className="text-[#42578B]" />

              <h3 className="text-[10px] font-semibold text-[#182A65]">
                Top Performing Forms
              </h3>
            </div>

            <div className="mt-[10px] space-y-[7px]">
              <RankRow
                number={1}
                label="Sewa Help Request"
                value="6.8%"
              />

              <RankRow
                number={2}
                label="Volunteer Registration"
                value="5.4%"
              />

              <RankRow
                number={3}
                label="CSR / Partner Enquiry"
                value="4.9%"
              />
            </div>

            <ReportLink>View Full Report</ReportLink>
          </BottomCard>

          {/* SOURCES */}

          <BottomCard>
            <div className="flex items-center gap-[7px]">
              <Users size={13} className="text-[#42578B]" />

              <h3 className="text-[10px] font-semibold text-[#182A65]">
                Top Sources
              </h3>
            </div>

            <div className="mt-[10px] space-y-[7px]">
              <RankRow
                number={1}
                label="Direct / Type"
                value="33.7%"
              />

              <RankRow
                number={2}
                label="Organic Search"
                value="25.0%"
              />

              <RankRow
                number={3}
                label="Social Media"
                value="15.9%"
              />
            </div>

            <ReportLink>View Source Report</ReportLink>
          </BottomCard>

          {/* RESPONSE */}

          <BottomCard>
            <div className="flex items-center gap-[7px]">
              <Clock3 size={13} className="text-[#42578B]" />

              <h3 className="text-[10px] font-semibold text-[#182A65]">
                Response Time (Avg.)
              </h3>
            </div>

            <div className="mt-[13px] flex items-center gap-[10px]">
              <div
                className="
                  flex
                  h-[30px]
                  w-[30px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#E7F3EC]
                "
              >
                <Clock3 size={14} className="text-[#33865A]" />
              </div>

              <div>
                <p className="text-[18px] font-semibold leading-none text-[#182A65]">
                  2h 45m
                </p>

                <p className="mt-[5px] text-[9px] font-semibold text-[#299252]">
                  ↓ 12.6%
                  <span className="ml-[4px] font-semibold text-[#66728A]">
                    vs last 7 days
                  </span>
                </p>
              </div>
            </div>

            <ReportLink>View Response Report</ReportLink>
          </BottomCard>

          {/* UNREAD */}

          <BottomCard>
            <h3 className="text-[10px] font-semibold text-[#182A65]">
              Unread Submissions
            </h3>

            <div className="mt-[15px] flex items-center gap-[10px]">
              <div
                className="
                  flex
                  h-[32px]
                  w-[32px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[#F1F3F6]
                "
              >
                <Mail size={15} className="text-[#425A90]" />
              </div>

              <span className="text-[18px] font-semibold text-[#182A65]">
                186
              </span>
            </div>

            <ReportLink>View Unread</ReportLink>
          </BottomCard>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  change,
  negative,
}: {
  label: string;
  value: string;

  icon: ComponentType<{
    size?: number;
    style?: CSSProperties;
    className?: string;
  }>;

  iconBg: string;
  iconColor: string;

  change: string;

  negative?: boolean;
}) {
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
        border-[#E3E7EB]
        bg-white
        px-[12px]
        py-[11px]
      "
    >
      <div
        className="
          flex
          min-w-0
          items-center
          gap-[10px]
        "
      >
        <div
          className="
            flex
            h-[44px]
            w-[44px]
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
            size={22}
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
              text-[#26386F]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-[2px]
              text-2xl
              font-semibold
              leading-none
              text-[#172B68]
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
        {change === "Live" ? (
          <span className="rounded-[4px] bg-[#E4F5E8] px-[5px] py-[1px] text-[9px] font-semibold text-[#238B4C]">
            Live
          </span>
        ) : (
          <>
            {negative ? (
              <ArrowDown
                size={10}
                className="shrink-0 text-[#E34848]"
              />
            ) : (
              <ArrowUp
                size={10}
                className="shrink-0 text-[#1AA756]"
              />
            )}

            <span
              className={`
                text-[9px]
                font-semibold

                ${negative
                  ? "text-[#E34848]"
                  : "text-[#1AA756]"
                }
              `}
            >
              {change}
            </span>
          </>
        )}

        <span className="text-[9px] font-semibold text-[#556384]">
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
    <div
      className="
        relative
        min-w-0
        overflow-hidden
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
          h-[36px]
          w-full
          min-w-0
          appearance-none
          overflow-hidden
          text-ellipsis
          whitespace-nowrap
          rounded-[5px]
          border
          border-[#DFE4EA]
          bg-white
          px-[10px]
          pr-[26px]
          text-[9px]
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
          right-[8px]
          top-1/2
          -translate-y-1/2
          text-[#182A65]
        "
      />
    </div>
  );
}

/* ============================================================
   TABLE HEAD
============================================================ */

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th
      className="
        text-[9px]
        font-semibold
        uppercase
        tracking-wider
        text-[#182A65]
      "
    >
      {children}
    </th>
  );
}

/* ============================================================
   META BADGE
============================================================ */

function MetaBadge({
  children,
  bg,
  color,
  border,
}: {
  children: ReactNode;

  bg: string;
  color: string;
  border: string;
}) {
  return (
    <span
      className="
        inline-flex
        max-w-[95%]
        truncate
        whitespace-nowrap
        rounded-[4px]
        border
        px-[9px]
        py-[4px]
        text-[9px]
        font-semibold
        leading-none
      "
      style={{
        backgroundColor: bg,
        color,
        borderColor: border,
      }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   LEGEND
============================================================ */

function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        flex
        min-w-0
        items-center
        justify-between
        gap-[5px]
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
            h-[8px]
            w-[8px]
            shrink-0
            rounded-full
          "
          style={{
            backgroundColor: color,
          }}
        />

        <span
          className="
            truncate
            text-[9px]
            font-semibold
            text-[#324575]
          "
        >
          {label}
        </span>
      </div>

      <span
        className="
          shrink-0
          whitespace-nowrap
          text-[9px]
          font-semibold
          text-[#324575]
        "
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   PAGE BUTTON
============================================================ */

function PageButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        h-[25px]
        min-w-[25px]
        items-center
        justify-center
        rounded-[4px]
        border
        px-[5px]
        text-[9px]
        font-semibold
        disabled:opacity-40

        ${active
          ? "border-[#08613A] bg-[#08613A] text-white"
          : "border-[#E0E4E9] bg-white text-[#334574]"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   SMALL PAGE BUTTON
============================================================ */

function SmallPageButton({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={`
        flex
        h-[20px]
        min-w-[20px]
        items-center
        justify-center
        rounded-[3px]
        border
        px-[4px]
        text-[9px]
        font-semibold

        ${active
          ? "border-[#E0E4E9] bg-white text-[#334574]"
          : "border-transparent bg-transparent text-[#43537A]"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   BOTTOM CARD
============================================================ */

function BottomCard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      className="
        flex
        min-h-[145px]
        min-w-0
        flex-col
        rounded-[7px]
        border
        border-[#E2E7EB]
        bg-white
        px-[14px]
        pb-[12px]
        pt-[11px]
      "
    >
      {children}
    </div>
  );
}

/* ============================================================
   RANK ROW
============================================================ */

function RankRow({
  number,
  label,
  value,
}: {
  number: number;
  label: string;
  value: string;
}) {
  return (
    <div
      className="
        grid
        min-w-0
        grid-cols-[20px_minmax(0,1fr)_42px]
        items-center
        gap-[4px]
        leading-[14px]
      "
    >
      <span
        className="
          text-[9px]
          font-semibold
          text-[#354979]
        "
      >
        {number}.
      </span>

      <span
        className="
          truncate
          text-[9px]
          font-semibold
          text-[#354979]
        "
      >
        {label}
      </span>

      <span
        className="
          text-right
          text-[9px]
          font-semibold
          text-[#354979]
        "
      >
        {value}
      </span>
    </div>
  );
}

/* ============================================================
   REPORT LINK
============================================================ */

function ReportLink({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="
        mt-auto
        w-full
        flex
        items-center
        justify-end
        gap-[6px]
        pt-[12px]
        whitespace-nowrap
        text-[9px]
        font-semibold
        text-[#42578B]
        hover:text-[#182A65]
      "
    >
      {children}

      <ArrowRight size={10} />
    </button>
  );
}
