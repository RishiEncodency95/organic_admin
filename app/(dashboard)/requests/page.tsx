"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  Filter,
  HandHeart,
  Info,
  Mail,
  MessageCircleMore,
  MoreVertical,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Siren,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";

import { requestsApi } from "@/lib/requestsApi";
import {
  AssistanceRequest,
  CasePriority,
} from "@/lib/types";

import {
  formatDateTime,
} from "@/lib/statusMeta";

import { ApiRequestError } from "@/lib/api";

/* ============================================================
   TYPES
============================================================ */

type RequestTab =
  | ""
  | "SUBMITTED"
  | "CONVERTED"
  | "REJECTED";

type RequestTypeFilter =
  | ""
  | "EMERGENCY"
  | "NORMAL";

/* ============================================================
   TABS
============================================================ */

const TABS: {
  key: RequestTab;
  label: string;
}[] = [
    {
      key: "",
      label: "All Requests",
    },
    {
      key: "SUBMITTED",
      label: "Submitted",
    },
    {
      key: "CONVERTED",
      label: "Converted",
    },
    {
      key: "REJECTED",
      label: "Rejected",
    },
  ];

/* ============================================================
   HELPERS
============================================================ */

function percentage(
  value: number,
  total: number
) {
  if (!total) return 0;

  return (
    (value / total) *
    100
  );
}

function statusLabel(
  status: string
) {
  switch (status) {
    case "SUBMITTED":
      return "Submitted";

    case "CONVERTED":
      return "Converted";

    case "REJECTED":
      return "Rejected";

    default:
      return status;
  }
}

function statusStyle(
  status: string
) {
  switch (status) {
    case "SUBMITTED":
      return {
        background:
          "#E8F2FE",
        color: "#2673D2",
        border: "#D2E5FB",
      };

    case "CONVERTED":
      return {
        background:
          "#DEF3E4",
        color: "#237B44",
        border: "#C9E6D1",
      };

    case "REJECTED":
      return {
        background:
          "#FDE8E8",
        color: "#DB4141",
        border: "#F3D0D0",
      };

    default:
      return {
        background:
          "#F1F3F6",
        color: "#53617D",
        border: "#E1E5EA",
      };
  }
}

function requestTypeStyle(
  type: string
) {
  if (type === "EMERGENCY") {
    return {
      background:
        "#FDE8E8",
      color: "#DE3D3D",
      border: "#F5CCCC",
    };
  }

  return {
    background:
      "#E5F5E9",
    color: "#277E49",
    border: "#CDE8D5",
  };
}

function requestTypeLabel(
  type: string
) {
  return type === "EMERGENCY"
    ? "Emergency"
    : "Normal";
}

function requesterType(
  request: AssistanceRequest
) {
  return (
    request.requester
      .relation || "Individual"
  );
}

function fullLocation(
  request: AssistanceRequest
) {
  return [
    request.location
      .address,
    request.location.city,
    request.location.state,
  ]
    .filter(Boolean)
    .join(", ");
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function RequestsPage() {
  const router = useRouter();

  const [
    requests,
    setRequests,
  ] = useState<
    AssistanceRequest[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<RequestTab>("");

  const [
    selectedId,
    setSelectedId,
  ] = useState("");

  const [
    priority,
    setPriority,
  ] =
    useState<CasePriority>(
      "NORMAL"
    );

  const [busy, setBusy] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [
    typeFilter,
    setTypeFilter,
  ] =
    useState<RequestTypeFilter>(
      ""
    );

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  const [page, setPage] =
    useState(1);

  const [perPage, setPerPage] =
    useState(8);

  /* ==========================================================
     LOAD ALL REQUESTS
  ========================================================== */

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const data =
        await requestsApi.list();

      setRequests(data ?? []);

      setSelectedId(
        (current) => {
          if (
            current &&
            data?.some(
              (request) =>
                request._id ===
                current
            )
          ) {
            return current;
          }

          return (
            data?.[0]?._id ??
            ""
          );
        }
      );
    } catch (err) {
      setError(
        err instanceof
          ApiRequestError
          ? err.message
          : "Could not load requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* ==========================================================
     COUNTS
  ========================================================== */

  const total =
    requests.length;

  const submittedCount =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.status ===
            "SUBMITTED"
        ).length,
      [requests]
    );

  const convertedCount =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.status ===
            "CONVERTED"
        ).length,
      [requests]
    );

  const rejectedCount =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.status ===
            "REJECTED"
        ).length,
      [requests]
    );

  const emergencyCount =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            request.type ===
            "EMERGENCY"
        ).length,
      [requests]
    );

  const normalCount =
    total -
    emergencyCount;

  const duplicateCount =
    useMemo(
      () =>
        requests.filter(
          (request) =>
            Boolean(
              request
                .duplicateOfRequestId
            )
        ).length,
      [requests]
    );

  /* ==========================================================
     FILTER
  ========================================================== */

  const visible =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return requests
        .filter(
          (request) => {
            if (
              !activeTab
            ) {
              return true;
            }

            return (
              request.status ===
              activeTab
            );
          }
        )

        .filter(
          (request) => {
            if (
              !typeFilter
            ) {
              return true;
            }

            return (
              request.type ===
              typeFilter
            );
          }
        )

        .filter(
          (request) => {
            if (!query) {
              return true;
            }

            return [
              request.requestNo,
              request.type,
              request.status,
              request.requester
                .name,
              request.requester
                .phone,
              request.requester
                .email,
              request.requester
                .relation,
              request.deceased
                .name,
              request.location
                .address,
              request.location
                .city,
              request.location
                .state,
              request.location
                .pincode,
              request.notes,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query);
          }
        );
    }, [
      requests,
      activeTab,
      typeFilter,
      search,
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
     SELECTED REQUEST
  ========================================================== */

  const selected =
    requests.find(
      (request) =>
        request._id ===
        selectedId
    ) ??
    pageRows[0] ??
    null;

  /* ==========================================================
     CONVERT
  ========================================================== */

  const handleConvert =
    async () => {
      if (!selected) {
        return;
      }

      setBusy(true);
      setError("");

      try {
        const kase =
          await requestsApi.convertToCase(
            selected._id,
            priority
          );

        router.push(
          `/cases/${kase._id}`
        );
      } catch (err) {
        setError(
          err instanceof
            ApiRequestError
            ? err.message
            : "Could not convert this request."
        );
      } finally {
        setBusy(false);
      }
    };

  /* ==========================================================
     REJECT
  ========================================================== */

  const handleReject =
    async () => {
      if (!selected) {
        return;
      }

      setBusy(true);
      setError("");

      try {
        await requestsApi.reject(
          selected._id
        );

        await load();
      } catch (err) {
        setError(
          err instanceof
            ApiRequestError
            ? err.message
            : "Could not reject this request."
        );
      } finally {
        setBusy(false);
      }
    };

  /* ==========================================================
     SELECT REQUEST
  ========================================================== */

  function selectRequest(
    request: AssistanceRequest
  ) {
    setSelectedId(
      request._id
    );

    setPriority("NORMAL");
    setError("");
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <section
      className="
        w-full
        min-w-0
        overflow-hidden
        bg-white
        px-[15px]
        pb-[15px]
        pt-[10px]
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
          gap-[18px]
        "
      >
        <div className="min-w-0 overflow-hidden">
          <div
            className="
              flex
              items-center
              gap-[8px]
            "
          >
            <h1
              className="
                text-[20px]
                font-semibold
                leading-[25px]
                tracking-[-0.3px]
                text-[#005E2E]
              "
            >
              Sewa Help
              Requests
            </h1>

            <HandHeart
              size={19}
              strokeWidth={2}
              className="
                text-[#168248]
              "
            />
          </div>

          <p
            className="
              mt-[3px]
              text-[9px]
              font-semibold
              leading-[13px]
              text-[#263A70]
            "
          >
            Requests for free
            sewa, assistance
            and guidance —
            Handle with
            compassion &amp;
            responsibility.
          </p>

          <div
            className="
              mt-[7px]
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
              Sewa Help
              Requests
            </span>
          </div>
        </div>

        {/* BUTTONS */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-[11px]
            pt-[4px]
          "
        >
          <HeaderButton
            icon={Download}
          >
            Export
          </HeaderButton>

          <HeaderButton
            icon={BarChart3}
          >
            Reports
          </HeaderButton>

          <Link
            href="/requests/new"
            className="
              flex
              h-[38px]
              items-center
              gap-[8px]
              rounded-[5px]
              bg-[#005F2E]
              px-[17px]
              text-[9px]
              font-semibold
              text-white
              shadow-[0_2px_5px_rgba(0,95,46,0.15)]
              hover:bg-[#004d25]
              transition
            "
          >
            <Plus size={15} />

            Add New Request
          </Link>
        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div
          className="
            mt-[10px]
            flex
            items-start
            gap-[7px]
            rounded-[6px]
            border
            border-red-200
            bg-red-50
            px-[10px]
            py-[8px]
            text-[9px]
            font-semibold
            text-red-700
          "
        >
          <AlertTriangle
            size={12}
            className="shrink-0"
          />

          {error}
        </div>
      )}

      {/* ======================================================
          TOP STATS
      ====================================================== */}

      <div className="w-full min-w-0 overflow-x-auto">
        <div
          className="
            mt-[16px]
            grid
            w-full
            min-w-[1100px]
            grid-cols-6
            gap-[10px]
          "
        >
        <StatCard
          label="Total Sewa Requests"
          value={total}
          icon={HandHeart}
          iconBg="#DFF5ED"
          iconColor="#16856A"
          footer={
            <>
              <span className="text-[#18904A]">
                ↑ Live
              </span>

              <span>
                current data
              </span>
            </>
          }
        />

        <StatCard
          label="Submitted Requests"
          value={
            submittedCount
          }
          icon={
            CalendarDays
          }
          iconBg="#E7F1FF"
          iconColor="#2268D3"
          footer={
            <>
              <span className="text-[#18904A]">
                ↑{" "}
                {percentage(
                  submittedCount,
                  total
                ).toFixed(1)}
                %
              </span>

              <span>
                of total
              </span>
            </>
          }
        />

        <StatCard
          label="Emergency Requests"
          value={
            emergencyCount
          }
          icon={Siren}
          iconBg="#FDE7E7"
          iconColor="#DA3A3A"
          footer={
            <span className="text-[#D94B41]">
              Needs priority
              review
            </span>
          }
        />

        <StatCard
          label="Normal Requests"
          value={normalCount}
          icon={ShieldCheck}
          iconBg="#FFF0E3"
          iconColor="#A45B21"
          footer={
            <span>
              Standard intake
            </span>
          }
        />

        <StatCard
          label="Converted to Case"
          value={
            convertedCount
          }
          icon={
            CheckCircle2
          }
          iconBg="#E5F6EA"
          iconColor="#178448"
          footer={
            <>
              <span className="text-[#18904A]">
                ↑{" "}
                {percentage(
                  convertedCount,
                  total
                ).toFixed(1)}
                %
              </span>

              <span>
                converted
              </span>
            </>
          }
        />

        <StatCard
          label="Duplicates Flagged"
          value={duplicateCount}
          icon={AlertTriangle}
          iconBg="#FFF5E5"
          iconColor="#D88615"
          footer={
            <>
              <span className="text-[#D88615]">
                ● Flagged
              </span>

              <span>
                for review
              </span>
            </>
          }
        />
      </div>
      </div>

      {/* ======================================================
          TABS + SEARCH
      ====================================================== */}

      <div
        className="
          mt-[18px]
          flex
          min-w-0
          items-end
          justify-between
          gap-[15px]
        "
      >
        {/* TABS */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-[30px]
          "
        >
          {TABS.map(
            (tab) => {
              const count =
                tab.key === ""
                  ? total
                  : tab.key ===
                    "SUBMITTED"
                    ? submittedCount
                    : tab.key ===
                      "CONVERTED"
                      ? convertedCount
                      : rejectedCount;

              return (
                <TabButton
                  key={tab.key}
                  active={
                    activeTab ===
                    tab.key
                  }
                  onClick={() => {
                    setActiveTab(
                      tab.key
                    );

                    setPage(1);
                  }}
                >
                  {tab.label} (
                  {count})
                </TabButton>
              );
            }
          )}

          <TabButton
            active={false}
            onClick={() => {
              setTypeFilter(
                "EMERGENCY"
              );

              setPage(1);
            }}
          >
            Emergency (
            {emergencyCount})
          </TabButton>

          <TabButton
            active={false}
            onClick={() => {
              setTypeFilter("");
              setPage(1);
            }}
          >
            Duplicates (
            {duplicateCount})
          </TabButton>
        </div>

        {/* SEARCH + FILTER */}

        <div
          className="
            relative
            flex
            shrink-0
            items-center
            gap-[8px]
          "
        >
          <div
            className="
              flex
              h-[36px]
              w-[220px]
              items-center
              rounded-[5px]
              border
              border-[#DFE4EA]
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
                  event.target
                    .value
                );

                setPage(1);
              }}
              placeholder="Search requests..."
              className="
                min-w-0
                flex-1
                bg-transparent
                text-[9px]
                font-semibold
                text-[#263A70]
                outline-none
                placeholder:text-[#66738E]
              "
            />

            <Search
              size={14}
              className="
                shrink-0
                text-[#304576]
              "
            />
          </div>

          <button
            type="button"
            onClick={() =>
              setFiltersOpen(
                (current) =>
                  !current
              )
            }
            className="
              flex
              h-[36px]
              items-center
              gap-[6px]
              rounded-[5px]
              border
              border-[#DFE4EA]
              bg-white
              px-[14px]
              text-[9px]
              font-semibold
              text-[#263A70]
            "
          >
            <Filter size={13} />

            Filters
          </button>

          {/* FILTER POPUP */}

          {filtersOpen && (
            <div
              className="
                absolute
                right-0
                top-[43px]
                z-50
                w-[150px]
                rounded-[6px]
                border
                border-[#DEE4E9]
                bg-white
                p-[6px]
                shadow-lg
              "
            >
              <p
                className="
                  px-[6px]
                  pb-[5px]
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-[#6A7690]
                "
              >
                Request Type
              </p>

              {[
                {
                  value: "",
                  label:
                    "All Types",
                },
                {
                  value:
                    "EMERGENCY",
                  label:
                    "Emergency",
                },
                {
                  value:
                    "NORMAL",
                  label:
                    "Normal",
                },
              ].map(
                (option) => (
                  <button
                    type="button"
                    key={
                      option.value
                    }
                    onClick={() => {
                      setTypeFilter(
                        option.value as RequestTypeFilter
                      );

                      setFiltersOpen(
                        false
                      );

                      setPage(1);
                    }}
                    className={`
                      flex
                      h-[29px]
                      w-full
                      items-center
                      rounded-[4px]
                      px-[7px]
                      text-left
                      text-[9px]
                      font-semibold

                      ${typeFilter ===
                        option.value
                        ? "bg-[#EDF7F1] text-[#187344]"
                        : "text-[#334575] hover:bg-[#F6F8FA]"
                      }
                    `}
                  >
                    {
                      option.label
                    }
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================
          TABLE + SIDE PANEL
      ====================================================== */}

      <div
        className="
          mt-[10px]
          grid
          w-full
          min-w-0
          grid-cols-[minmax(0,1fr)_275px]
          gap-[16px]
          overflow-hidden
        "
      >
        {/* ====================================================
            TABLE
        ==================================================== */}

        <div
          className="
            min-w-0
            overflow-x-auto
            rounded-[6px]
            border
            border-[#E1E6EA]
            bg-white
          "
        >
          <table
            className="
              w-full
              min-w-[1300px]
              table-fixed
              border-collapse
            "
          >
            <colgroup>
              <col
                style={{
                  width: "40px",
                }}
              />

              <col
                style={{
                  width: "120px",
                }}
              />

              <col
                style={{
                  width: "155px",
                }}
              />

              <col
                style={{
                  width: "180px",
                }}
              />

              <col
                style={{
                  width: "260px",
                }}
              />

              <col
                style={{
                  width: "135px",
                }}
              />

              <col
                style={{
                  width: "140px",
                }}
              />

              <col
                style={{
                  width: "65px",
                }}
              />

              <col
                style={{
                  width: "65px",
                }}
              />
            </colgroup>

            <thead>
              <tr
                className="
                  h-[37px]
                  bg-[#F7F8FB]
                  text-left
                  text-[#182A65]
                "
              >
                <th className="px-[10px]">
                  <input
                    type="checkbox"
                    className="
                      h-[12px]
                      w-[12px]
                    "
                  />
                </th>

                <th className="text-[9px] font-semibold">
                  ID
                </th>

                <th className="text-[9px] font-semibold whitespace-nowrap">
                  RECEIVED
                </th>

                <th className="text-[9px] font-semibold">
                  REQUESTER
                </th>

                <th className="text-[9px] font-semibold whitespace-nowrap">
                  LOCATION
                </th>

                <th className="text-[9px] font-semibold">
                  REQUEST TYPE
                </th>

                <th className="text-[9px] font-semibold">
                  STATUS
                </th>

                <th className="text-center text-[9px] font-semibold">
                  ALERT
                </th>

                <th className="text-center text-[9px] font-semibold">
                  ACTIONS
                </th>
              </tr>
            </thead>

            <tbody>
              {/* LOADING */}

              {loading &&
                Array.from({
                  length: 8,
                }).map(
                  (
                    _,
                    index
                  ) => (
                    <tr
                      key={
                        index
                      }
                      className="
                        h-[55px]
                        border-t
                        border-[#E7EAEE]
                      "
                    >
                      <td
                        colSpan={
                          9
                        }
                        className="px-[10px]"
                      >
                        <div
                          className="
                            h-[9px]
                            w-full
                            animate-pulse
                            rounded
                            bg-[#F0F2F4]
                          "
                        />
                      </td>
                    </tr>
                  )
                )}

              {/* DATA */}

              {!loading &&
                pageRows.map(
                  (request) => {
                    const isSelected =
                      selected?._id ===
                      request._id;

                    const typeMeta =
                      requestTypeStyle(
                        request.type
                      );

                    const statusMeta =
                      statusStyle(
                        request.status
                      );

                    return (
                      <tr
                        key={
                          request._id
                        }
                        onClick={() =>
                          selectRequest(
                            request
                          )
                        }
                        className={`
                          h-[55px]
                          cursor-pointer
                          border-t
                          border-[#E7EAEE]

                          ${isSelected
                            ? "bg-[#EAF8F3]"
                            : "bg-white hover:bg-[#FBFCFD]"
                          }
                        `}
                      >
                        {/* CHECK */}

                        <td className="px-[10px] align-middle">
                          <input
                            type="checkbox"
                            checked={
                              isSelected
                            }
                            readOnly
                            className="
                              h-[12px]
                              w-[12px]
                              accent-[#176F45]
                            "
                          />
                        </td>

                        {/* ID */}

                        <td className="align-middle">
                          <span
                            className="
                              block
                              truncate
                              text-[9px]
                              font-semibold
                              text-[#176D45]
                            "
                          >
                            {
                              request.requestNo
                            }
                          </span>
                        </td>

                        {/* DATE */}

                        <td className="px-[10px] align-middle whitespace-nowrap">
                          <span className="text-[9px] font-semibold text-[#182A65]">
                            {formatDateTime(request.createdAt).split(",")[0]}
                          </span>
                          <span className="ml-[4px] text-[8.5px] font-semibold text-[#556488]">
                            {formatDateTime(request.createdAt).split(",")[1] || ""}
                          </span>
                        </td>

                        {/* REQUESTER */}

                        <td className="min-w-0 align-middle">
                          <div
                            className="
                              flex
                              min-w-0
                              items-center
                              gap-[7px]
                            "
                          >
                            <div
                              className="
                                flex
                                h-[27px]
                                w-[27px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-full
                                bg-[#F2F4F6]
                              "
                            >
                              <UserRound
                                size={13}
                                className="text-[#263A70]"
                              />
                            </div>
                            <div className="min-w-0 overflow-hidden">
                              <p
                                className="
                                  truncate
                                  text-[9px]
                                  font-semibold
                                  text-[#20316A]
                                "
                              >
                                {
                                  request.requester
                                    .name
                                }
                              </p>

                              <p
                                className="
                                  mt-[2px]
                                  truncate
                                  text-[9px]
                                  font-semibold
                                  text-[#45547A]
                                "
                              >
                                {requesterType(
                                  request
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* LOCATION */}

                        <td className="min-w-0 overflow-hidden align-middle px-[6px]">
                          <p
                            title={`${request.location.city || ""}${request.location.state ? `, ${request.location.state}` : ""}`}
                            className="
                              truncate
                              whitespace-nowrap
                              text-[9px]
                              font-semibold
                              leading-[11px]
                              text-[#314172]
                            "
                          >
                            {request.location
                              .city ||
                              "—"}

                            {request.location
                              .state
                              ? `, ${request.location.state}`
                              : ""}
                          </p>
                        </td>

                        {/* TYPE */}

                        <td className="align-middle">
                          <MetaBadge
                            meta={
                              typeMeta
                            }
                          >
                            {request.type ===
                              "EMERGENCY" ? (
                              <>
                                <AlertTriangle
                                  size={
                                    11
                                  }
                                />

                                Emergency
                              </>
                            ) : (
                              "Normal"
                            )}
                          </MetaBadge>
                        </td>

                        {/* STATUS */}

                        <td className="align-middle">
                          <MetaBadge
                            meta={
                              statusMeta
                            }
                          >
                            {statusLabel(
                              request.status
                            )}
                          </MetaBadge>
                        </td>

                        {/* ALERT */}

                        <td className="text-center align-middle">
                          {request.duplicateOfRequestId ? (
                            <span
                              title={
                                request.duplicateNote ??
                                "Possible duplicate"
                              }
                              className="
                                inline-flex
                                h-[22px]
                                w-[22px]
                                items-center
                                justify-center
                                rounded-full
                                bg-[#FFF0D7]
                                text-[#DA8A17]
                              "
                            >
                              <AlertTriangle
                                size={
                                  11
                                }
                              />
                            </span>
                          ) : request.type ===
                            "EMERGENCY" ? (
                            <span
                              className="
                                inline-flex
                                h-[22px]
                                w-[22px]
                                items-center
                                justify-center
                                rounded-full
                                bg-[#FDE8E8]
                                text-[#D94040]
                              "
                            >
                              <Siren
                                size={
                                  11
                                }
                              />
                            </span>
                          ) : (
                            <span
                              className="
                                text-[9px]
                                text-[#9AA3B4]
                              "
                            >
                              —
                            </span>
                          )}
                        </td>

                        <td className="text-center align-middle">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectRequest(request);
                            }}
                            className="mx-auto flex h-[28px] w-[28px] items-center justify-center rounded-[5px] border border-[#E3E7EC] bg-white text-[#263C76] hover:bg-[#F8FAFC]"
                          >
                            <Eye size={14} />
                          </button>
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
                      colSpan={
                        9
                      }
                      className="
                        h-[150px]
                        text-center
                        text-[9px]
                        font-semibold
                        text-[#69748D]
                      "
                    >
                      No assistance
                      requests found.
                    </td>
                  </tr>
                )}
            </tbody>
          </table>

          {/* PAGINATION */}

          <div
            className="
              flex
              min-h-[56px]
              min-w-[1180px]
              items-center
              justify-between
              gap-[10px]
              border-t
              border-[#E7EAEE]
              px-[14px]
              py-[10px]
            "
          >
            <p
              className="
                min-w-0
                truncate
                text-[9px]
                font-semibold
                text-[#44537C]
              "
            >
              Showing{" "}
              {visible.length
                ? startIndex +
                1
                : 0}{" "}
              to {endIndex} of{" "}
              {visible.length}{" "}
              requests
            </p>

            <div
              className="
                flex
                shrink-0
                items-center
                gap-[14px]
              "
            >
              <div className="flex items-center gap-[5px]">
                <PageButton
                  disabled={
                    safePage === 1
                  }
                  onClick={() =>
                    setPage(
                      Math.max(
                        1,
                        safePage -
                        1
                      )
                    )
                  }
                >
                  <ChevronLeft
                    size={11}
                  />
                </PageButton>

                {Array.from({
                  length:
                    Math.min(
                      5,
                      totalPages
                    ),
                }).map(
                  (
                    _,
                    index
                  ) => {
                    const number =
                      index + 1;

                    return (
                      <PageButton
                        key={
                          number
                        }
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

                <PageButton
                  disabled={
                    safePage ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      Math.min(
                        totalPages,
                        safePage +
                        1
                      )
                    )
                  }
                >
                  <ChevronRight
                    size={11}
                  />
                </PageButton>
              </div>

              <div className="relative">
                <select
                  value={
                    perPage
                  }
                  onChange={(
                    event
                  ) => {
                    setPerPage(
                      Number(
                        event
                          .target
                          .value
                      )
                    );

                    setPage(1);
                  }}
                  className="
                    h-[30px]
                    w-[96px]
                    appearance-none
                    rounded-[4px]
                    border
                    border-[#E0E5EA]
                    bg-white
                    px-[8px]
                    pr-[24px]
                    text-[9px]
                    font-semibold
                    text-[#334574]
                    outline-none
                  "
                >
                  <option value={8}>
                    8 / page
                  </option>

                  <option value={10}>
                    10 / page
                  </option>

                  <option value={20}>
                    20 / page
                  </option>

                  <option value={50}>
                    50 / page
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
                    text-[#334574]
                  "
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================
            DETAILS PANEL
        ==================================================== */}

        <aside
          className="
            min-w-0
            overflow-hidden
            rounded-[7px]
            border
            border-[#E1E6EA]
            bg-white
          "
        >
          {selected ? (
            <>
              {/* HEADER */}

              <div
                className="
                  flex
                  h-[45px]
                  items-center
                  justify-between
                  gap-[8px]
                  border-b
                  border-[#E9ECEF]
                  px-[13px]
                "
              >
                <h2
                  className="
                    min-w-0
                    truncate
                    text-[13px]
                    font-semibold
                    text-[#202A47]
                  "
                >
                  {
                    selected.requestNo
                  }
                </h2>

                <MetaBadge
                  meta={statusStyle(
                    selected.status
                  )}
                >
                  {statusLabel(
                    selected.status
                  )}
                </MetaBadge>
              </div>

              {/* TABS */}

              <div
                className="
                  grid
                  grid-cols-3
                  border-b
                  border-[#E9ECEF]
                "
              >
                <PanelTab
                  active
                >
                  Details
                </PanelTab>

                <PanelTab>
                  History
                </PanelTab>

                <PanelTab>
                  Notes
                </PanelTab>
              </div>

              <div
                className="
                  px-[14px]
                  pb-[13px]
                  pt-[11px]
                "
              >
                {/* DUPLICATE */}

                {selected.duplicateOfRequestId ? (
                  <div
                    className="
                      flex
                      gap-[7px]
                      rounded-[5px]
                      border
                      border-[#F1D69E]
                      bg-[#FFF7E5]
                      px-[9px]
                      py-[8px]
                    "
                  >
                    <AlertTriangle
                      size={13}
                      className="
                        mt-[1px]
                        shrink-0
                        text-[#D38A18]
                      "
                    />

                    <p
                      className="
                        text-[9px]
                        font-semibold
                        leading-[10px]
                        text-[#73591E]
                      "
                    >
                      {selected.duplicateNote ??
                        "Possible duplicate of a recent request."}
                    </p>
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      gap-[7px]
                      rounded-[5px]
                      border
                      border-[#CFDFF4]
                      bg-[#EEF5FE]
                      px-[9px]
                      py-[8px]
                    "
                  >
                    <Info
                      size={13}
                      className="
                        mt-[1px]
                        shrink-0
                        text-[#396FD0]
                      "
                    />

                    <p
                      className="
                        text-[9px]
                        font-semibold
                        leading-[11px]
                        text-[#324575]
                      "
                    >
                      Request received.
                      Review the
                      information before
                      taking action.
                    </p>
                  </div>
                )}

                {/* REQUESTER */}

                <DetailSection
                  title="Requester Information"
                >
                  <DetailRow
                    icon={UserRound}
                  >
                    <span>
                      Name:
                    </span>{" "}
                    {
                      selected.requester
                        .name
                    }
                  </DetailRow>

                  <DetailRow
                    icon={Users}
                  >
                    <span>
                      Relation:
                    </span>{" "}
                    {selected.requester
                      .relation ||
                      "—"}
                  </DetailRow>

                  <DetailRow
                    icon={Phone}
                  >
                    <span>
                      Phone:
                    </span>{" "}
                    {
                      selected.requester
                        .phone
                    }
                  </DetailRow>

                  {selected.requester
                    .email && (
                      <DetailRow
                        icon={Mail}
                      >
                        <span>
                          Email:
                        </span>{" "}
                        {
                          selected.requester
                            .email
                        }
                      </DetailRow>
                    )}
                </DetailSection>

                {/* DECEASED */}

                <DetailSection
                  title="Deceased Information"
                >
                  <DetailRow
                    icon={UserRound}
                  >
                    <span>
                      Name:
                    </span>{" "}
                    {
                      selected.deceased
                        .name
                    }
                  </DetailRow>

                  {(selected.deceased
                    .age ||
                    selected.deceased
                      .gender) && (
                      <DetailRow
                        icon={
                          ClipboardCheck
                        }
                      >
                        {selected.deceased
                          .age && (
                            <>
                              <span>
                                Age:
                              </span>{" "}
                              {
                                selected
                                  .deceased
                                  .age
                              }{" "}
                              yrs
                            </>
                          )}

                        {selected.deceased
                          .age &&
                          selected.deceased
                            .gender &&
                          " · "}

                        {selected.deceased
                          .gender && (
                            <>
                              <span>
                                Gender:
                              </span>{" "}
                              {
                                selected
                                  .deceased
                                  .gender
                              }
                            </>
                          )}
                      </DetailRow>
                    )}
                </DetailSection>

                {/* LOCATION */}

                <DetailSection
                  title="Request Details"
                >
                  <DetailRow
                    icon={
                      AlertTriangle
                    }
                  >
                    <span>
                      Type:
                    </span>{" "}
                    {requestTypeLabel(
                      selected.type
                    )}
                  </DetailRow>

                  <DetailRow
                    icon={
                      FileText
                    }
                  >
                    <span>
                      Status:
                    </span>{" "}
                    {statusLabel(
                      selected.status
                    )}
                  </DetailRow>

                  <DetailRow
                    icon={
                      ShieldCheck
                    }
                  >
                    <span>
                      Location:
                    </span>{" "}
                    {fullLocation(
                      selected
                    )}
                  </DetailRow>

                  {selected.location
                    .pincode && (
                      <DetailRow
                        icon={
                          ClipboardCheck
                        }
                      >
                        <span>
                          Pincode:
                        </span>{" "}
                        {
                          selected.location
                            .pincode
                        }
                      </DetailRow>
                    )}

                  {selected.notes && (
                    <div className="mt-[8px]">
                      <div
                        className="
                          flex
                          items-center
                          gap-[6px]
                        "
                      >
                        <FileText
                          size={13}
                          className="text-[#304575]"
                        />

                        <span
                          className="
                            text-[9px]
                            font-semibold
                            text-[#273A70]
                          "
                        >
                          Notes:
                        </span>
                      </div>

                      <div
                        className="
                          mt-[6px]
                          rounded-[5px]
                          border
                          border-[#E0E5EA]
                          bg-[#FAFBFC]
                          px-[8px]
                          py-[7px]
                        "
                      >
                        <p
                          className="
                            text-[9px]
                            font-semibold
                            leading-[11px]
                            text-[#415178]
                          "
                        >
                          {
                            selected.notes
                          }
                        </p>
                      </div>
                    </div>
                  )}
                </DetailSection>

                {/* ACTION SECTION */}

                {selected.status ===
                  "SUBMITTED" && (
                    <>
                      <div
                        className="
                        mt-[13px]
                      "
                      >
                        <label
                          className="
                          mb-[5px]
                          block
                          text-[9px]
                          font-semibold
                          text-[#273A70]
                        "
                        >
                          Case Priority
                        </label>

                        <div className="relative">
                          <select
                            value={
                              priority
                            }
                            disabled={
                              busy
                            }
                            onChange={(
                              event
                            ) =>
                              setPriority(
                                event
                                  .target
                                  .value as CasePriority
                              )
                            }
                            className="
                              h-[33px]
                              w-full
                              appearance-none
                              rounded-[5px]
                              border
                              border-[#DDE3E9]
                              bg-white
                              px-[10px]
                              pr-[28px]
                              text-[9px]
                              font-semibold
                              text-[#182A65]
                              outline-none
                            "
                          >
                            <option value="LOW">
                              Low
                            </option>

                            <option value="NORMAL">
                              Normal
                            </option>

                            <option value="HIGH">
                              High
                            </option>

                            <option value="CRITICAL">
                              Critical
                            </option>
                          </select>

                          <ChevronDown
                            size={11}
                            className="
                              pointer-events-none
                              absolute
                              right-[9px]
                              top-1/2
                              -translate-y-1/2
                              text-[#182A65]
                            "
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleConvert
                        }
                        disabled={
                          busy
                        }
                        className="
                        mt-[10px]
                        flex
                        h-[34px]
                        w-full
                        items-center
                        justify-center
                        gap-[7px]
                        rounded-[4px]
                        bg-[#005F2E]
                        text-[9px]
                        font-semibold
                        text-white
                        disabled:opacity-60
                      "
                      >
                        <Check
                          size={12}
                        />

                        {busy
                          ? "Processing..."
                          : "Convert to Case"}
                      </button>

                      <div
                        className="
                        mt-[8px]
                        grid
                        grid-cols-2
                        gap-[8px]
                      "
                      >
                        <button
                          type="button"
                          onClick={
                            handleReject
                          }
                          disabled={
                            busy
                          }
                          className="
                          flex
                          h-[34px]
                          items-center
                          justify-center
                          gap-[6px]
                          rounded-[4px]
                          border
                          border-[#F1D2D2]
                          bg-white
                          text-[9px]
                          font-semibold
                          text-[#CB4040]
                          disabled:opacity-60
                        "
                        >
                          <XCircle
                            size={12}
                          />

                          Reject
                        </button>

                        <button
                          type="button"
                          className="
                          flex
                          h-[34px]
                          items-center
                          justify-center
                          gap-[6px]
                          rounded-[4px]
                          border
                          border-[#DDE3E9]
                          bg-white
                          text-[9px]
                          font-semibold
                          text-[#182A65]
                        "
                        >
                          <Eye
                            size={12}
                          />

                          Full Details
                        </button>
                      </div>
                    </>
                  )}

                {selected.status !==
                  "SUBMITTED" && (
                    <button
                      type="button"
                      className="
                      mt-[13px]
                      flex
                      h-[36px]
                      w-full
                      items-center
                      justify-center
                      gap-[7px]
                      rounded-[5px]
                      border
                      border-[#DDE3E9]
                      bg-white
                      text-[9px]
                      font-semibold
                      text-[#182A65]
                    "
                    >
                      <Eye
                        size={13}
                      />

                      View Full Details
                    </button>
                  )}
              </div>
            </>
          ) : (
            <div
              className="
                flex
                min-h-[410px]
                items-center
                justify-center
                px-[20px]
                text-center
                text-[9px]
                font-semibold
                text-[#69758D]
              "
            >
              Select a request
              from the table to
              view details.
            </div>
          )}
        </aside>
      </div>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <div
        className="
          mt-[11px]
          rounded-[7px]
          border
          border-[#E3E7EB]
          bg-white
          px-[14px]
          pb-[11px]
          pt-[8px]
        "
      >
        <h2
          className="
            text-[9px]
            font-semibold
            text-[#17613B]
          "
        >
          Quick Actions
        </h2>

        <div className="mt-[7px] w-full min-w-0 overflow-x-auto pt-[4px] pb-[4px]">
          <div
            className="
              flex
              min-w-max
              gap-[10px]
            "
          >
          <QuickAction
            icon={
              CalendarDays
            }
            iconBg="#FFF2DF"
            iconColor="#F39B1A"
            count={
              submittedCount
            }
            onClick={() => {
              setActiveTab(
                "SUBMITTED"
              );

              setPage(1);
            }}
          >
            View Submitted
            Requests
          </QuickAction>

          <QuickAction
            icon={Siren}
            iconBg="#FDE8E8"
            iconColor="#DB4040"
            count={
              emergencyCount
            }
            onClick={() => {
              setTypeFilter(
                "EMERGENCY"
              );

              setPage(1);
            }}
          >
            Emergency Requests
          </QuickAction>

          <QuickAction
            icon={
              AlertTriangle
            }
            iconBg="#FFF1D8"
            iconColor="#D78A16"
            count={
              duplicateCount
            }
          >
            Possible Duplicates
          </QuickAction>

          <QuickAction
            icon={
              CheckCircle2
            }
            iconBg="#E5F5E9"
            iconColor="#258149"
            count={
              convertedCount
            }
            onClick={() => {
              setActiveTab(
                "CONVERTED"
              );

              setPage(1);
            }}
          >
            Converted Cases
          </QuickAction>

          <QuickAction
            icon={Download}
            iconBg="#F1F3F6"
            iconColor="#40527E"
          >
            Download Report
          </QuickAction>

          <QuickAction
            icon={
              MessageCircleMore
            }
            iconBg="#EEF5D9"
            iconColor="#6A8C12"
          >
            Communication
            Center
          </QuickAction>
        </div>
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
  footer,
}: {
  label: string;
  value: number;

  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: CSSProperties;
    className?: string;
  }>;

  iconBg: string;
  iconColor: string;

  footer: ReactNode;
}) {
  return (
    <div
      className="
        flex
        flex-col
        justify-between
        h-[116px]
        min-w-0
        overflow-hidden
        rounded-[7px]
        border
        border-[#E3E7EB]
        bg-white
        px-[10px]
        py-[9px]
      "
    >
      {/* TOP: Full Label Content - Only label shifted left */}
      <div className="w-full text-left">
        <p className="-ml-[2px] whitespace-nowrap text-[8.5px] font-semibold uppercase tracking-wider text-[#182A65] text-left">
          {label}
        </p>
      </div>

      {/* MIDDLE ROW: Icon + Number Value (Strict Left Aligned) */}
      <div className="mt-[4px] flex w-full items-center justify-start gap-[6px]">
        <div
          className="
            flex
            h-[34px]
            w-[34px]
            shrink-0
            items-center
            justify-center
            rounded-full
          "
          style={{
            backgroundColor:
              iconBg,
          }}
        >
          <Icon
            size={18}
            style={{
              color:
                iconColor,
            }}
          />
        </div>

        <div
          className="
            whitespace-nowrap
            text-2xl
            font-semibold
            leading-none
            text-[#172B68]
            text-left
          "
        >
          {value}
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
          text-[9px]
          font-semibold
          text-[#65708A]
        "
      >
        {footer}
      </div>
    </div>
  );
}

/* ============================================================
   HEADER BUTTON
============================================================ */

function HeaderButton({
  children,
  icon: Icon,
}: {
  children: ReactNode;

  icon: ComponentType<{
    size?: number;
  }>;
}) {
  return (
    <button
      type="button"
      className="
        flex
        h-[38px]
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
      <Icon size={13} />

      {children}
    </button>
  );
}

/* ============================================================
   TAB BUTTON
============================================================ */

function TabButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;

  onClick: () => void;

  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        h-[35px]
        whitespace-nowrap
        text-[9px]
        font-semibold

        ${active
          ? "text-[#185D3A]"
          : "text-[#3E4D75]"
        }
      `}
    >
      {children}

      {active && (
        <span
          className="
            absolute
            bottom-0
            left-0
            h-[2px]
            w-full
            bg-[#176A43]
          "
        />
      )}
    </button>
  );
}

/* ============================================================
   BADGE
============================================================ */

function MetaBadge({
  meta,
  children,
}: {
  meta: {
    background: string;
    color: string;
    border: string;
  };

  children: ReactNode;
}) {
  return (
    <span
      className="
        inline-flex
        max-w-full
        items-center
        gap-[4px]
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
        backgroundColor:
          meta.background,

        color: meta.color,

        borderColor:
          meta.border,
      }}
    >
      {children}
    </span>
  );
}

/* ============================================================
   PAGINATION
============================================================ */

function PageButton({
  children,
  active,
  disabled,
  onClick,
}: {
  children: ReactNode;

  active?: boolean;
  disabled?: boolean;

  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
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
        disabled:opacity-40

        ${active
          ? "border-[#006132] bg-[#006132] text-white"
          : "border-[#E0E5EA] bg-white text-[#334574]"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ============================================================
   PANEL TAB
============================================================ */

function PanelTab({
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
        relative
        h-[36px]
        text-[9px]
        font-semibold

        ${active
          ? "text-[#185D3A]"
          : "text-[#3F4D73]"
        }
      `}
    >
      {children}

      {active && (
        <span
          className="
            absolute
            bottom-0
            left-[18%]
            right-[18%]
            h-[2px]
            bg-[#176A43]
          "
        />
      )}
    </button>
  );
}

/* ============================================================
   DETAIL SECTION
============================================================ */

function DetailSection({
  title,
  children,
}: {
  title: string;

  children: ReactNode;
}) {
  return (
    <div className="mt-[15px]">
      <h3
        className="
          mb-[8px]
          text-[9px]
          font-semibold
          text-[#182A65]
        "
      >
        {title}
      </h3>

      <div className="space-y-[7px]">
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: CSSProperties;
    className?: string;
  }>;

  children: ReactNode;
}) {
  return (
    <div
      className="
        flex
        min-w-0
        items-start
        gap-[7px]
      "
    >
      <Icon
        size={13}
        className="
          mt-[1px]
          shrink-0
          text-[#314677]
        "
      />

      <p
        className="
          min-w-0
          break-words
          text-[9px]
          font-semibold
          leading-[11px]
          text-[#20316A]
        "
      >
        {children}
      </p>
    </div>
  );
}

/* ============================================================
   QUICK ACTION
============================================================ */

function QuickAction({
  icon: Icon,
  iconBg,
  iconColor,
  count,
  onClick,
  children,
}: {
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    style?: CSSProperties;
    className?: string;
  }>;

  iconBg: string;
  iconColor: string;

  count?: number;

  onClick?: () => void;

  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        relative
        flex
        h-[74px]
        w-[172px]
        min-w-[172px]
        items-center
        gap-[10px]
        rounded-[6px]
        border
        border-[#E4E8EC]
        bg-white
        px-[12px]
        pr-[22px]
        text-left
        hover:bg-[#FBFCFD]
      "
    >
      <div
        className="
          flex
          h-[32px]
          w-[32px]
          shrink-0
          items-center
          justify-center
          rounded-full
        "
        style={{
          backgroundColor:
            iconBg,
        }}
      >
        <Icon
          size={15}
          style={{
            color:
              iconColor,
          }}
        />
      </div>

      <span
        className="
          min-w-0
          text-[9px]
          font-semibold
          leading-[14px]
          text-[#182A65]
        "
      >
        {children}
      </span>

      {count !==
        undefined && (
          <span
            className="
            absolute
            right-[7px]
            top-[6px]
            flex
            h-[18px]
            min-w-[18px]
            items-center
            justify-center
            rounded-full
            bg-[#F18C13]
            px-[4px]
            text-[9px]
            font-semibold
            text-white
          "
          >
            {count}
          </span>
        )}
    </button>
  );
}
