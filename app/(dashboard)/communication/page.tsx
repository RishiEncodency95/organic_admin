"use client";

import { useMemo, useState } from "react";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  CalendarPlus2,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Mail,
  MessageCircleMore,
  MessagesSquare,
  MessageSquareText,
  MoreVertical,
  Phone,
  PhoneCall,
  Plus,
  RotateCcw,
  Search,
  Send,
  SlidersHorizontal,
  UserRoundPlus,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

/* ============================================================
   STATS DATA
============================================================ */

const stats = [
  {
    label: "Total Communications",
    value: "562",
    change: "18.6%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: MessagesSquare,
    iconBg: "#EEE9FF",
    iconColor: "#7550EF",
  },
  {
    label: "Emails Sent",
    value: "245",
    change: "16.3%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: Send,
    iconBg: "#E8F1FF",
    iconColor: "#2679E8",
  },
  {
    label: "WhatsApp Messages",
    value: "188",
    change: "20.5%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: FaWhatsapp,
    iconBg: "#E6F7EB",
    iconColor: "#15994D",
  },
  {
    label: "Calls Made",
    value: "96",
    change: "12.8%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: Phone,
    iconBg: "#E1F6F0",
    iconColor: "#159B88",
  },
  {
    label: "Pending Follow-ups",
    value: "27",
    change: "7.4%",
    compare: "vs Apr 2026",
    direction: "down",
    icon: CalendarDays,
    iconBg: "#F3E8FF",
    iconColor: "#A448EF",
  },
  {
    label: "Completed Followups",
    value: "251",
    change: "22.1%",
    compare: "vs Apr 2026",
    direction: "up",
    icon: CheckCircle2,
    iconBg: "#E8F7EA",
    iconColor: "#189A49",
  },
];

/* ============================================================
   COMMUNICATION TABLE DATA
============================================================ */

const communications = [
  {
    id: "COM-2026-0562",
    name: "TechNova Solutions Pvt. Ltd.",
    email: "rohit.mehra@technova.com",
    phone: "+91 98765 43210",
    channel: "Email",
    subject: "CSR Partnership Opportunity",
    description: "Shared proposal & brochure",
    enquiry: "CSR & Partners",
    status: "Replied",
    lastDate: "31 May 2026",
    lastTime: "10:25 AM",
    nextDate: "04 Jun 2026",
    nextTime: "11:00 AM",
  },
  {
    id: "COM-2026-0561",
    name: "Priya Patel",
    email: "priya.patel@gmail.com",
    phone: "+91 91234 56789",
    channel: "WhatsApp",
    subject: "Volunteer Registration",
    description: "Interested in volunteering",
    enquiry: "Volunteers",
    status: "Pending",
    lastDate: "30 May 2026",
    lastTime: "04:15 PM",
    nextDate: "02 Jun 2026",
    nextTime: "04:00 PM",
  },
  {
    id: "COM-2026-0560",
    name: "GreenFuture Foundation",
    email: "info@greenfuture.org",
    phone: "+91 98711 44556",
    channel: "Call",
    subject: "Community Outreach Support",
    description: "Discussion on collaboration",
    enquiry: "CSR & Partners",
    status: "Completed",
    lastDate: "29 May 2026",
    lastTime: "02:05 PM",
    nextDate: "-",
    nextTime: "",
  },
  {
    id: "COM-2026-0559",
    name: "Sunrise Pharma Ltd.",
    email: "vikram.kapoor@sunrisepharma.com",
    phone: "+91 98123 66789",
    channel: "Email",
    subject: "Request for Assistance",
    description: "Ambulance support enquiry",
    enquiry: "General Enquiry",
    status: "Replied",
    lastDate: "28 May 2026",
    lastTime: "11:20 AM",
    nextDate: "31 May 2026",
    nextTime: "10:00 AM",
  },
  {
    id: "COM-2026-0558",
    name: "Neha Sinha",
    email: "neha.sinha@carewell.org",
    phone: "+91 93456 77889",
    channel: "WhatsApp",
    subject: "Sewa Help Request Follow-up",
    description: "Case verification update",
    enquiry: "Sewa Help",
    status: "Pending",
    lastDate: "27 May 2026",
    lastTime: "03:10 PM",
    nextDate: "29 May 2026",
    nextTime: "03:00 PM",
  },
  {
    id: "COM-2026-0557",
    name: "Amit Rawat",
    email: "amit.rawat@outlook.com",
    phone: "+91 99887 66554",
    channel: "Call",
    subject: "Ritual & Priest Support",
    description: "Details about arrangements",
    enquiry: "Sewa Help",
    status: "Completed",
    lastDate: "26 May 2026",
    lastTime: "01:25 PM",
    nextDate: "-",
    nextTime: "",
  },
  {
    id: "COM-2026-0556",
    name: "LifeLine Industries Ltd.",
    email: "pooja.nair@lifelineind.com",
    phone: "+91 98111 22334",
    channel: "Email",
    subject: "CSR Funding Discussion",
    description: "Budget & scope discussion",
    enquiry: "CSR & Partners",
    status: "Replied",
    lastDate: "25 May 2026",
    lastTime: "12:50 PM",
    nextDate: "28 May 2026",
    nextTime: "11:00 AM",
  },
  {
    id: "COM-2026-0555",
    name: "Deepak Bansal",
    email: "deepak.bansal@rediffmail.com",
    phone: "+91 98711 44556",
    channel: "WhatsApp",
    subject: "Support for Moksha Sewa",
    description: "General contribution enquiry",
    enquiry: "Donation / Support",
    status: "Pending",
    lastDate: "24 May 2026",
    lastTime: "09:40 AM",
    nextDate: "26 May 2026",
    nextTime: "10:00 AM",
  },
];

/* ============================================================
   COMMUNICATION CHANNELS
============================================================ */

const channelStats = [
  {
    label: "Email",
    value: "245 (43.6%)",
    width: 43.6,
    icon: Mail,
    bg: "#E8F1FF",
    iconColor: "#2779E4",
    barColor: "#2177D9",
  },
  {
    label: "WhatsApp",
    value: "188 (33.5%)",
    width: 33.5,
    icon: FaWhatsapp,
    bg: "#E8F7EA",
    iconColor: "#21964D",
    barColor: "#47A469",
  },
  {
    label: "Calls",
    value: "96 (17.1%)",
    width: 17.1,
    icon: Phone,
    bg: "#EEF8E4",
    iconColor: "#75A83A",
    barColor: "#F6A214",
  },
  {
    label: "SMS",
    value: "21 (3.7%)",
    width: 10,
    icon: MessageSquareText,
    bg: "#E9F6E9",
    iconColor: "#29925C",
    barColor: "#8D55DF",
  },
  {
    label: "Others",
    value: "12 (2.1%)",
    width: 7,
    icon: MoreVertical,
    bg: "#EFEFFF",
    iconColor: "#6255D0",
    barColor: "#8998AF",
  },
];

const quickActions = [
  {
    label: "New Communication",
    icon: UserRoundPlus,
  },
  {
    label: "Schedule Follow-up",
    icon: CalendarPlus2,
  },
  {
    label: "Send Bulk Email",
    icon: Send,
  },
  {
    label: "Message Templates",
    icon: MessageSquareText,
  },
  {
    label: "View All Conversations",
    icon: MessageCircleMore,
  },
];

/* ============================================================
   STYLES HELPERS
============================================================ */

function enquiryStyle(type: string) {
  switch (type) {
    case "CSR & Partners":
      return {
        background: "#E5F5E8",
        color: "#257844",
        border: "#CFE9D5",
      };

    case "Volunteers":
      return {
        background: "#F1E8FD",
        color: "#894ADE",
        border: "#E6D7FB",
      };

    case "General Enquiry":
      return {
        background: "#E7F2FE",
        color: "#2874CC",
        border: "#D3E6FA",
      };

    case "Sewa Help":
      return {
        background: "#FCE8ED",
        color: "#DB5771",
        border: "#F6D5DC",
      };

    case "Donation / Support":
      return {
        background: "#FFF1D8",
        color: "#D98E13",
        border: "#F9E2B8",
      };

    default:
      return {
        background: "#F3F4F6",
        color: "#475467",
        border: "#E4E7EC",
      };
  }
}

function statusStyle(status: string) {
  switch (status) {
    case "Replied":
      return {
        background: "#E4F4E7",
        color: "#247843",
        border: "#D0EAD5",
      };

    case "Pending":
      return {
        background: "#FFF1D8",
        color: "#E29515",
        border: "#F8E0B4",
      };

    case "Completed":
      return {
        background: "#E7F2FE",
        color: "#2874CD",
        border: "#D5E6FA",
      };

    default:
      return {
        background: "#F2F4F7",
        color: "#475467",
        border: "#EAECF0",
      };
  }
}

function getChannelStyle(channel: string) {
  switch (channel) {
    case "Email":
      return {
        background: "#E9F2FF",
        color: "#2872CE",
        border: "#D5E6FB",
      };

    case "WhatsApp":
      return {
        background: "#E6F6E9",
        color: "#26894C",
        border: "#CFEAD5",
      };

    default:
      return {
        background: "#FFF3D9",
        color: "#D99316",
        border: "#F7DFAD",
      };
  }
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  item,
}: {
  item: (typeof stats)[number];
}) {
  const Icon = item.icon;

  return (
    <div
      className="
        flex
        h-[108px]
        min-w-0
        flex-col
        justify-between
        rounded-[7px]
        border
        border-[#E1E6EC]
        bg-white
        px-[10px]
        py-[10px]
      "
    >
      {/* TOP: Full Label Content - Only label shifted left */}
      <div className="w-full text-left">
        <p className="-ml-[2px] whitespace-nowrap text-[8.5px] font-semibold text-[#172863] text-left">
          {item.label}
        </p>
      </div>

      {/* MIDDLE ROW: Icon + Number Value (Strict Left Aligned) */}
      <div className="mt-[4px] flex w-full items-center justify-start gap-[6px]">
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
            backgroundColor: item.iconBg,
          }}
        >
          <Icon
            size={18}
            strokeWidth={2}
            style={{
              color: item.iconColor,
            }}
          />
        </div>

        <div
          className="
            whitespace-nowrap
            text-[22px]
            font-semibold
            leading-none
            text-[#00642F]
            text-left
          "
        >
          {item.value}
        </div>
      </div>

      {/* BOTTOM ROW: LEFT-ALIGNED SUBTEXT */}
      <div className="flex w-full items-center justify-start gap-[4px] whitespace-nowrap text-left">
        {item.direction === "up" ? (
          <ArrowUp
            size={10}
            strokeWidth={3}
            className="shrink-0 text-[#169248]"
          />
        ) : (
          <ArrowDown
            size={10}
            strokeWidth={3}
            className="shrink-0 text-[#F04438]"
          />
        )}

        <span
          className={`
            shrink-0
            text-[9px]
            font-semibold
            ${item.direction === "up"
              ? "text-[#169248]"
              : "text-[#F04438]"
            }
          `}
        >
          {item.change}
        </span>

        <span
          className="
            shrink-0
            whitespace-nowrap
            text-[9px]
            font-semibold
            text-[#506083]
          "
        >
          {item.compare}
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   BADGE
============================================================ */

function Badge({
  text,
  style,
}: {
  text: string;
  style: {
    background: string;
    color: string;
    border: string;
  };
}) {
  return (
    <span
      className="
        inline-flex
        max-w-full
        items-center
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
        backgroundColor: style.background,
        color: style.color,
        borderColor: style.border,
      }}
    >
      {text}
    </span>
  );
}

/* ============================================================
   FILTER BUTTON
============================================================ */

/* ============================================================
   SELECT FILTER
============================================================ */

function SelectFilter({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <div
      className="
        relative
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          h-full
          w-full
          cursor-pointer
          appearance-none
          bg-transparent
          pr-[18px]
          text-[10px]
          font-semibold
          text-[#172762]
          outline-none
        "
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={12}
        strokeWidth={2.2}
        className="
          pointer-events-none
          absolute
          right-[10px]
          top-1/2
          -translate-y-1/2
          shrink-0
          text-[#172762]
        "
      />
    </div>
  );
}

/* ============================================================
   MAIN
============================================================ */

export default function CommunicationsFollowUps() {
  const [search, setSearch] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedEnquiry, setSelectedEnquiry] = useState("ALL");
  const [selectedDateRange, setSelectedDateRange] = useState("ALL");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    return communications.filter((item) => {
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const completeText = [
          item.id,
          item.name,
          item.email,
          item.phone,
          item.channel,
          item.subject,
          item.description,
          item.enquiry,
          item.status,
        ]
          .join(" ")
          .toLowerCase();

        if (!completeText.includes(query)) return false;
      }

      if (selectedChannel !== "ALL" && item.channel !== selectedChannel) {
        return false;
      }

      if (selectedStatus !== "ALL" && item.status !== selectedStatus) {
        return false;
      }

      if (selectedEnquiry !== "ALL" && item.enquiry !== selectedEnquiry) {
        return false;
      }

      return true;
    });
  }, [search, selectedChannel, selectedStatus, selectedEnquiry, selectedDateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const startIndex = filteredRows.length === 0 ? 0 : (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredRows.length);

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(startIndex, endIndex);
  }, [filteredRows, startIndex, endIndex]);

  function handleReset() {
    setSearch("");
    setSelectedChannel("ALL");
    setSelectedStatus("ALL");
    setSelectedEnquiry("ALL");
    setSelectedDateRange("ALL");
    setPage(1);
  }

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
          PAGE HEADER
      ====================================================== */}

      <div className="flex items-start justify-between gap-[20px]">
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
            Communications &amp; Follow-ups
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
            Track conversations, messages and follow-ups across all enquiries
            and leads.
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
            <SlidersHorizontal size={14} />

            Filters
          </button>

          <button
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
            "
          >
            <Plus size={15} />

            New Communication
          </button>
        </div>
      </div>

      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          mt-[21px]
          grid
          w-full
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
              TOP CARDS
          ================================================== */}

          <div
            className="
              grid
              w-full
              min-w-0
              grid-cols-6
              gap-[9px]
            "
          >
            {stats.map((item) => (
              <StatCard
                key={item.label}
                item={item}
              />
            ))}
          </div>

          {/* ==================================================
              FILTER BAR
          ================================================== */}

          <div
            className="
              mt-[20px]
              grid
              w-full
              min-w-0
              grid-cols-[minmax(190px,1.7fr)_122px_112px_133px_minmax(150px,1.15fr)_76px]
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
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, email"
                className="
                  h-full
                  min-w-0
                  flex-1
                  bg-transparent
                  text-[10px]
                  font-semibold
                  text-[#172762]
                  outline-none
                  placeholder:text-[#536184]
                "
              />

              <Search
                size={15}
                strokeWidth={2}
                className="ml-[7px] shrink-0 text-[#1D377A]"
              />
            </div>

            <SelectFilter
              value={selectedChannel}
              onChange={(val) => {
                setSelectedChannel(val);
                setPage(1);
              }}
              options={[
                { label: "All Channels", value: "ALL" },
                { label: "Email", value: "Email" },
                { label: "WhatsApp", value: "WhatsApp" },
                { label: "Call", value: "Call" },
                { label: "SMS", value: "SMS" },
                { label: "Others", value: "Others" },
              ]}
            />

            <SelectFilter
              value={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setPage(1);
              }}
              options={[
                { label: "All Status", value: "ALL" },
                { label: "Replied", value: "Replied" },
                { label: "Pending", value: "Pending" },
                { label: "Completed", value: "Completed" },
              ]}
            />

            <SelectFilter
              value={selectedEnquiry}
              onChange={(val) => {
                setSelectedEnquiry(val);
                setPage(1);
              }}
              options={[
                { label: "All Enquiry Types", value: "ALL" },
                { label: "CSR & Partners", value: "CSR & Partners" },
                { label: "Volunteers", value: "Volunteers" },
                { label: "General Enquiry", value: "General Enquiry" },
                { label: "Sewa Help", value: "Sewa Help" },
                { label: "Donation / Support", value: "Donation / Support" },
              ]}
            />

            {/* DATE RANGE DROPDOWN */}

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
              "
            >
              <CalendarRange
                size={14}
                strokeWidth={2}
                className="pointer-events-none shrink-0 text-[#213C79]"
              />

              <select
                value={selectedDateRange}
                onChange={(e) => {
                  setSelectedDateRange(e.target.value);
                  setPage(1);
                }}
                className="
                  h-full
                  w-full
                  cursor-pointer
                  appearance-none
                  bg-transparent
                  pr-[18px]
                  text-[10px]
                  font-semibold
                  text-[#536080]
                  outline-none
                "
              >
                <option value="ALL">Select Date</option>
                <option value="TODAY">Today</option>
                <option value="LAST_7_DAYS">Last 7 Days</option>
                <option value="LAST_30_DAYS">Last 30 Days</option>
                <option value="THIS_MONTH">This Month</option>
              </select>

              <ChevronDown
                size={12}
                strokeWidth={2.2}
                className="
                  pointer-events-none
                  absolute
                  right-[10px]
                  top-1/2
                  -translate-y-1/2
                  shrink-0
                  text-[#536080]
                "
              />
            </div>

            {/* RESET */}

            <button
              onClick={handleReset}
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
                hover:bg-[#F8FAFC]
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
                min-w-[1100px]
                table-fixed
                border-collapse
              "
            >
              <colgroup>
                <col style={{ width: "6%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "6%" }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "6%" }} />
              </colgroup>

              <thead>
                <tr
                  className="
                    h-[32px]
                    bg-[#005F2E]
                    text-left
                    text-white
                  "
                >
                  <th className="px-[6px] text-[9px] font-semibold whitespace-nowrap">
                    ID
                  </th>

                  <th className="px-[6px] text-[9px] font-semibold whitespace-nowrap">
                    Contact / Organization
                  </th>

                  <th className="px-[4px] text-[9px] font-semibold whitespace-nowrap text-center">
                    Channel
                  </th>

                  <th className="px-[6px] text-[9px] font-semibold whitespace-nowrap">
                    Subject / Conversation
                  </th>

                  <th className="px-[5px] text-[9px] font-semibold whitespace-nowrap">
                    Enquiry Type
                  </th>

                  <th className="px-[5px] text-[9px] font-semibold whitespace-nowrap">
                    Status
                  </th>

                  <th className="px-[6px] text-[9px] font-semibold whitespace-nowrap">
                    Last Activity
                  </th>

                  <th className="px-[6px] text-[9px] font-semibold whitespace-nowrap">
                    Next Follow-up
                  </th>

                  <th className="px-[6px] text-[9px] font-semibold whitespace-nowrap text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="
                        h-[120px]
                        text-center
                        text-[9px]
                        font-semibold
                        text-[#667085]
                      "
                    >
                      No communications found.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((row) => {
                    const channelColors =
                      getChannelStyle(row.channel);

                    return (
                      <tr
                        key={row.id}
                        className="
                          h-[44px]
                          border-b
                          border-[#E8EBEF]
                          bg-white
                          last:border-b-0
                          hover:bg-[#FBFCFD]
                        "
                      >
                        {/* ID */}

                        <td className="px-[6px] align-middle">
                          <span
                            className="
                              whitespace-nowrap
                              text-[9px]
                              font-semibold
                              text-[#13763E]
                            "
                          >
                            {row.id.replace("COM-2026-", "#")}
                          </span>
                        </td>

                        {/* CONTACT */}

                        <td className="min-w-0 px-[6px] align-middle">
                          <div className="min-w-0 overflow-hidden">
                            <p
                              className="
                                truncate
                                text-[9px]
                                font-semibold
                                leading-[11px]
                                text-[#192B66]
                              "
                              title={row.name}
                            >
                              {row.name}
                            </p>

                            <div className="mt-[2px] flex items-center gap-[4px]">
                              <a
                                href={`mailto:${row.email}`}
                                title={`Email: ${row.email}`}
                                className="
                                  flex
                                  h-[16px]
                                  w-[16px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-[3px]
                                  border
                                  border-[#D5E6FB]
                                  bg-[#E9F2FF]
                                  text-[#2872CE]
                                  hover:bg-[#D4E5FF]
                                "
                              >
                                <Mail size={8} />
                              </a>

                              <a
                                href={`https://wa.me/${row.phone.replace(/[^\d]/g, "")}`}
                                target="_blank"
                                rel="noreferrer"
                                title={`WhatsApp: ${row.phone}`}
                                className="
                                  flex
                                  h-[16px]
                                  w-[16px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-[3px]
                                  border
                                  border-[#CFEAD5]
                                  bg-[#E6F6E9]
                                  text-[#26894C]
                                  hover:bg-[#D2EED8]
                                "
                              >
                                <FaWhatsapp size={8} />
                              </a>

                              <span
                                className="
                                  whitespace-nowrap
                                  text-[9px]
                                  font-semibold
                                  text-[#293B70]
                                "
                              >
                                {row.phone}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* CHANNEL */}

                        <td className="px-[4px] text-center align-middle">
                          <span
                            title={row.channel}
                            className="
                              inline-flex
                              h-[22px]
                              w-[22px]
                              items-center
                              justify-center
                              rounded-[5px]
                              border
                            "
                            style={{
                              background:
                                channelColors.background,
                              color: channelColors.color,
                              borderColor:
                                channelColors.border,
                            }}
                          >
                            {row.channel === "Email" && (
                              <Mail size={10} />
                            )}

                            {row.channel === "WhatsApp" && (
                              <FaWhatsapp size={10} />
                            )}

                            {row.channel === "Call" && (
                              <Phone size={10} />
                            )}

                            {row.channel !== "Email" &&
                              row.channel !== "WhatsApp" &&
                              row.channel !== "Call" && (
                                <span className="text-[9px] font-semibold">
                                  {row.channel.slice(0, 2)}
                                </span>
                              )}
                          </span>
                        </td>

                        {/* SUBJECT */}

                        <td className="min-w-0 px-[6px] align-middle">
                          <p
                            className="
                              truncate
                              text-[9px]
                              font-semibold
                              leading-[11px]
                              text-[#192B66]
                            "
                          >
                            {row.subject}
                          </p>

                          <p
                            className="
                              mt-[2px]
                              truncate
                              text-[9px]
                              font-semibold
                              leading-[10px]
                              text-[#304276]
                            "
                          >
                            {row.description}
                          </p>
                        </td>

                        {/* ENQUIRY */}

                        <td className="px-[5px] align-middle">
                          <Badge
                            text={row.enquiry}
                            style={enquiryStyle(
                              row.enquiry
                            )}
                          />
                        </td>

                        {/* STATUS */}

                        <td className="px-[5px] align-middle">
                          <Badge
                            text={row.status}
                            style={statusStyle(
                              row.status
                            )}
                          />
                        </td>

                        {/* LAST ACTIVITY */}

                        <td className="px-[6px] align-middle">
                          <p
                            className="
                              whitespace-nowrap
                              text-[9px]
                              font-semibold
                              leading-[11px]
                              text-[#26396D]
                            "
                          >
                            {row.lastDate}
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
                            {row.lastTime}
                          </p>
                        </td>

                        {/* NEXT FOLLOW-UP */}

                        <td className="px-[6px] align-middle">
                          <p
                            className="
                              whitespace-nowrap
                              text-[9px]
                              font-semibold
                              leading-[11px]
                              text-[#26396D]
                            "
                          >
                            {row.nextDate}
                          </p>

                          {row.nextTime && (
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
                              {row.nextTime}
                            </p>
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-[8px] align-middle">
                          <div className="flex items-center justify-center gap-[5px]">
                            <button
                              title="View Details"
                              className="
                                flex
                                h-[28px]
                                w-[28px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-[5px]
                                border
                                border-[#E3E7EC]
                                bg-white
                                text-[#263C76]
                                hover:bg-[#F8FAFC]
                              "
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              title="More Options"
                              className="
                                flex
                                h-[28px]
                                w-[28px]
                                shrink-0
                                items-center
                                justify-center
                                rounded-[5px]
                                border
                                border-[#E3E7EC]
                                bg-white
                                text-[#263C76]
                                hover:bg-[#F8FAFC]
                              "
                            >
                              <MoreVertical size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                px-[9px]
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
                {filteredRows.length > 0
                  ? `Showing ${startIndex + 1} to ${endIndex} of ${filteredRows.length} communications`
                  : "Showing 0 communications"}
              </p>

              <div className="flex items-center gap-[5px]">
                <button
                  disabled={safePage === 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(1, current - 1)
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
                  <ChevronLeft size={12} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => setPage(number)}
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
                        ${safePage === number
                          ? "border-[#006132] bg-[#006132] text-white"
                          : "border-[#E3E7ED] bg-white text-[#334575]"
                        }
                      `}
                    >
                      {number}
                    </button>
                  )
                )}

                <button
                  disabled={safePage >= totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
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
                  <ChevronRight size={12} />
                </button>
              </div>

              {/* ROWS PER PAGE DROPDOWN */}

              <div
                className="
                  relative
                  flex
                  h-[28px]
                  w-[102px]
                  shrink-0
                  items-center
                  rounded-[4px]
                  border
                  border-[#E3E7ED]
                  bg-white
                  px-[8px]
                "
              >
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="
                    h-full
                    w-full
                    cursor-pointer
                    appearance-none
                    bg-transparent
                    pr-[16px]
                    text-[10px]
                    font-semibold
                    text-[#536180]
                    outline-none
                  "
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>

                <ChevronDown
                  size={11}
                  className="
                    pointer-events-none
                    absolute
                    right-[8px]
                    top-1/2
                    -translate-y-1/2
                    shrink-0
                    text-[#536180]
                  "
                />
              </div>
            </div>
          </div>
        </main>

        {/* ====================================================
            RIGHT SIDEBAR
        ==================================================== */}

        <aside className="w-[285px] min-w-0">
          {/* ==================================================
              COMMUNICATION OVERVIEW
          ================================================== */}

          <div
            className="
              rounded-[7px]
              border
              border-[#E2E6EB]
              bg-white
              px-[12px]
              pb-[13px]
              pt-[12px]
            "
          >
            <div className="flex items-center justify-between gap-[7px]">
              <h2
                className="
                  whitespace-nowrap
                  text-[11px]
                  font-semibold
                  text-[#1F2430]
                "
              >
                Communication Overview
              </h2>

              <button
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

                <ArrowRight size={9} />
              </button>
            </div>

            <div className="mt-[17px] flex items-center gap-[8px]">
              {/* DONUT */}

              <div
                className="
                  relative
                  flex
                  h-[82px]
                  w-[82px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                "
                style={{
                  background:
                    "conic-gradient(#007B3C 0deg 157deg,#49A861 157deg 278deg,#F6A313 278deg 340deg,#F01B1F 340deg 360deg)",
                }}
              >
                <div
                  className="
                    flex
                    h-[52px]
                    w-[52px]
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
                      text-[#111]
                    "
                  >
                    562
                  </span>

                  <span
                    className="
                      mt-[4px]
                      text-[8px]
                      font-semibold
                      text-[#44537B]
                    "
                  >
                    Total
                  </span>
                </div>
              </div>

              {/* LEGEND */}

              <div className="min-w-0 flex-1 space-y-[8px]">
                {[
                  {
                    label: "Email",
                    value: "245 (43.6%)",
                    color: "#007D3B",
                  },
                  {
                    label: "WhatsApp",
                    value: "188 (33.5%)",
                    color: "#6CB21A",
                  },
                  {
                    label: "Calls",
                    value: "96 (17.1%)",
                    color: "#F4A112",
                  },
                  {
                    label: "Others",
                    value: "33 (5.8%)",
                    color: "#EF1F23",
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
                      text-left
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
                          min-w-0
                          truncate
                          whitespace-nowrap
                          text-[8px]
                          font-semibold
                          text-[#26386D]
                        "
                      >
                        {item.label}
                      </span>
                    </div>

                    <span
                      className="
                        min-w-0
                        text-right
                        tabular-nums
                        whitespace-nowrap
                        text-[8px]
                        font-semibold
                        text-[#26386D]
                      "
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ==================================================
              CHANNELS
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
                text-[10px]
                font-semibold
                text-[#1F2430]
              "
            >
              Communication Channels
            </h2>

            <div className="mt-[14px] space-y-[10px]">
              {channelStats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="
                      grid
                      grid-cols-[90px_minmax(0,1fr)_62px]
                      items-center
                      gap-[6px]
                      text-left
                    "
                  >
                    <div className="flex min-w-0 items-center gap-[5px]">
                      <div
                        className="
                          flex
                          h-[19px]
                          w-[19px]
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
                          size={9}
                          strokeWidth={2}
                          style={{
                            color: item.iconColor,
                          }}
                        />
                      </div>

                      <span
                        className="
                          whitespace-nowrap
                          text-[9px]
                          font-semibold
                          text-[#26376D]
                        "
                      >
                        {item.label}
                      </span>
                    </div>

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
                        className="h-full rounded-full"
                        style={{
                          width: `${item.width}%`,
                          backgroundColor:
                            item.barColor,
                        }}
                      />
                    </div>

                    <span
                      className="
                        whitespace-nowrap
                        text-right
                        text-[9px]
                        font-semibold
                        text-[#26376D]
                      "
                    >
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
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
            <div className="px-[12px] pb-[7px] pt-[12px]">
              <h2
                className="
                  text-[10px]
                  font-semibold
                  text-[#193775]
                "
              >
                Quick Actions
              </h2>
            </div>

            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  className="
                    flex
                    h-[34px]
                    w-full
                    items-center
                    justify-between
                    border-b
                    border-[#EDF0F4]
                    px-[12px]
                    text-left
                    text-[#1A2F6D]
                    last:border-b-0
                  "
                >
                  <span className="flex min-w-0 items-center gap-[8px]">
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
              border-[#E2E8E4]
              bg-[#FAFCFA]
              px-[14px]
              pb-[16px]
              pt-[14px]
            "
          >
            <h2
              className="
                text-[10px]
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
              For any assistance, contact our team.
            </p>

            <div className="mt-[12px] flex items-center gap-[8px]">
              <PhoneCall
                size={15}
                className="shrink-0 text-[#208447]"
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
                min-w-0
                items-center
                gap-[8px]
              "
            >
              <Mail
                size={15}
                className="shrink-0 text-[#208447]"
              />

              <span
                className="
                  whitespace-nowrap
                  text-[10px]
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
