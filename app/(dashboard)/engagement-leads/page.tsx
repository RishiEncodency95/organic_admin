"use client";

import {
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Building2,
  CalendarDays,
  Clock3,
  Download,
  HandHeart,
  Mail,
  MessageCircleMore,
  UserRound,
  Users,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

type RecentStatus =
  | "New"
  | "Contacted"
  | "In Progress";

type Priority =
  | "High"
  | "Medium"
  | "Low";

/* ============================================================
   DATA
============================================================ */

const leadSources = [
  {
    label: "Direct / Type",
    value: 420,
    percentage: 33.7,
    color: "#5476E8",
  },
  {
    label: "Organic Search",
    value: 312,
    percentage: 25.0,
    color: "#37AE84",
  },
  {
    label: "Social Media",
    value: 198,
    percentage: 15.9,
    color: "#5DA78C",
  },
  {
    label: "Referral",
    value: 156,
    percentage: 12.5,
    color: "#8D67D8",
  },
  {
    label: "Paid Campaigns",
    value: 102,
    percentage: 8.2,
    color: "#FF7A45",
  },
  {
    label: "Email Campaigns",
    value: 60,
    percentage: 4.8,
    color: "#F7A194",
  },
];

const recentEnquiries = [
  {
    initials: "RS",
    name: "Ramesh Sharma",
    email: "rameshsharma@email.com",
    type: "Sewa Help Request",
    source: "Organic Search",
    date: "31 May 2026",
    time: "10:30 AM",
    status: "New" as RecentStatus,
  },
  {
    initials: "PK",
    name: "Priya Kapoor",
    email: "priyak@gmail.com",
    type: "General Enquiry",
    source: "Direct",
    date: "31 May 2026",
    time: "09:45 AM",
    status: "New" as RecentStatus,
  },
  {
    initials: "AN",
    name: "Ankit Nair",
    email: "ankitnair@gmail.com",
    type: "Volunteer",
    source: "Social Media",
    date: "31 May 2026",
    time: "09:20 AM",
    status: "Contacted" as RecentStatus,
  },
  {
    initials: "SC",
    name: "Sunita Chauhan",
    email: "sunitac@gmail.com",
    type: "CSR / Partner",
    source: "Referral",
    date: "31 May 2026",
    time: "08:55 AM",
    status: "In Progress" as RecentStatus,
  },
  {
    initials: "MD",
    name: "Meera Das",
    email: "meeradas@email.com",
    type: "General Enquiry",
    source: "Organic Search",
    date: "31 May 2026",
    time: "08:15 AM",
    status: "New" as RecentStatus,
  },
];

const followUps = [
  {
    name: "Rajesh Verma",
    type: "Sewa Help Request",
    assigned: "Vikram Singh",
    due: "1 Jun 2026",
    priority: "High" as Priority,
    icon: HandHeart,
    iconBg: "#FFF0DF",
    iconColor: "#F08A24",
  },
  {
    name: "Neha Joshi",
    type: "General Enquiry",
    assigned: "Anjali Verma",
    due: "2 Jun 2026",
    priority: "Medium" as Priority,
    icon: Mail,
    iconBg: "#E8F3F8",
    iconColor: "#3985A8",
  },
  {
    name: "Green Earth Pvt. Ltd.",
    type: "CSR / Partner",
    assigned: "Vikram Singh",
    due: "3 Jun 2026",
    priority: "High" as Priority,
    icon: Building2,
    iconBg: "#F4F0E6",
    iconColor: "#7E6D3A",
  },
  {
    name: "Amitabh Singh",
    type: "Volunteer Lead",
    assigned: "Anjali Verma",
    due: "4 Jun 2026",
    priority: "Medium" as Priority,
    icon: Users,
    iconBg: "#F1E8FD",
    iconColor: "#8751D5",
  },
  {
    name: "Kiran Patel",
    type: "General Enquiry",
    assigned: "Rohit Kumar",
    due: "5 Jun 2026",
    priority: "Low" as Priority,
    icon: Mail,
    iconBg: "#EDF2F5",
    iconColor: "#61748E",
  },
];

const trendData = [
  { day: "25 May", value: 186 },
  { day: "26 May", value: 213 },
  { day: "27 May", value: 245 },
  { day: "28 May", value: 296 },
  { day: "29 May", value: 312 },
  { day: "30 May", value: 336 },
  { day: "31 May", value: 342 },
];

/* ============================================================
   PAGE
============================================================ */

export default function EngagementLeadsOverviewPage() {
  return (
    <section
      className="
        w-full
        min-w-0
        bg-white
        px-[16px]
        pb-[14px]
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
          <h1
            className="
              text-[20px]
              font-semibold
              leading-[24px]
              tracking-[-0.3px]
              text-[#005E2E]
            "
          >
            Engagement &amp; Leads Overview
          </h1>

          <p
            className="
              mt-[2px]
              text-[9px]
              font-semibold
              text-[#354675]
            "
          >
            Track enquiries, requests, volunteers and all leads from your website.
          </p>
        </div>

        <div
          className="
            flex
            shrink-0
            items-center
            gap-[10px]
          "
        >
          <button
            type="button"
            className="
              flex
              h-[34px]
              items-center
              gap-[7px]
              rounded-[5px]
              border
              border-[#DFE4EA]
              bg-white
              px-[12px]
              text-[9px]
              font-semibold
              text-[#26396F]
              hover:bg-[#F8FAFC]
            "
          >
            <Download size={12} />
            Export Report
          </button>

          <button
            type="button"
            className="
              flex
              h-[34px]
              items-center
              gap-[8px]
              rounded-[5px]
              border
              border-[#DFE4EA]
              bg-white
              px-[12px]
              text-[9px]
              font-semibold
              text-[#26396F]
              hover:bg-[#F8FAFC]
            "
          >
            <CalendarDays size={12} />
            25 May 2026 - 31 May 2026
            <span className="ml-[2px] text-[9px]">▼</span>
          </button>
        </div>
      </div>

      {/* ======================================================
          TOP STATS (OVERFLOW X ENABLED)
      ====================================================== */}

      <div className="mt-[14px] w-full min-w-0 overflow-x-auto pb-[4px]">
        <div
          className="
            grid
            w-full
            min-w-[1100px]
            grid-cols-7
            gap-[8px]
          "
        >
          <StatCard
            label="Total Enquiries"
            value="1,248"
            icon={UserRound}
            iconBg="#E6F5E9"
            iconColor="#287E4D"
            change="18.6%"
          />

          <StatCard
            label="New This Week"
            value="342"
            icon={CalendarDays}
            iconBg="#E7F0FE"
            iconColor="#386DD2"
            change="22.4%"
          />

          <StatCard
            label="Pending Follow-ups"
            value="186"
            icon={Clock3}
            iconBg="#FFF0E5"
            iconColor="#EB7040"
            change="8.3%"
            negative
          />

          <StatCard
            label="Sewa Help Requests"
            value="58"
            icon={HandHeart}
            iconBg="#F2EAFD"
            iconColor="#7F50D5"
            change="11.5%"
          />

          <StatCard
            label="Volunteer Leads"
            value="32"
            icon={Users}
            iconBg="#FDE8ED"
            iconColor="#E65778"
            change="14.3%"
          />

          <StatCard
            label="CSR / Partner Leads"
            value="21"
            icon={Building2}
            iconBg="#E3F6F3"
            iconColor="#24968E"
            change="5.0%"
          />

          <StatCard
            label="Conversion Rate"
            value="6.24%"
            icon={BarChart3}
            iconBg="#FFF3E1"
            iconColor="#EAA128"
            change="1.35%"
          />
        </div>
      </div>

      {/* ======================================================
          ANALYTICS ROW (OVERFLOW X ENABLED)
      ====================================================== */}

      <div className="mt-[10px] w-full min-w-0 overflow-x-auto pb-[4px]">
        <div
          className="
            grid
            w-full
            min-w-[1000px]
            grid-cols-[0.92fr_0.92fr_1.16fr]
            gap-[10px]
          "
        >
          {/* ====================================================
              LEADS BY SOURCE
          ==================================================== */}

          <DashboardCard>
            <h2 className={sectionHeading}>
              Leads by Source
            </h2>

            <div
              className="
                mt-[13px]
                flex
                min-w-0
                items-center
                gap-[14px]
              "
            >
              {/* DONUT */}

              <div
                className="
                  flex
                  h-[145px]
                  w-[145px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                "
                style={{
                  background: `
                    conic-gradient(
                      #5476E8 0% 33.7%,
                      #37AE84 33.7% 58.7%,
                      #5DA78C 58.7% 74.6%,
                      #8D67D8 74.6% 87.1%,
                      #FF7A45 87.1% 95.3%,
                      #F7A194 95.3% 100%
                    )
                  `,
                }}
              >
                <div
                  className="
                    flex
                    h-[89px]
                    w-[89px]
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
                      text-[#161D32]
                    "
                  >
                    1,248
                  </span>

                  <span
                    className="
                      mt-[5px]
                      text-[9px]
                      font-semibold
                      text-[#5F6981]
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
                  space-y-[9px]
                "
              >
                {leadSources.map((item) => (
                  <div
                    key={item.label}
                    className="
                      flex
                      min-w-0
                      items-center
                      justify-between
                      gap-[7px]
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
                      <span
                        className="
                          h-[8px]
                          w-[8px]
                          shrink-0
                          rounded-full
                        "
                        style={{
                          backgroundColor: item.color,
                        }}
                      />

                      <span
                        className="
                          truncate
                          text-[9px]
                          font-semibold
                          text-[#42517B]
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
                        text-[#354572]
                      "
                    >
                      {item.value} ({item.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <BottomLink>View full report</BottomLink>
          </DashboardCard>

          {/* ====================================================
              FUNNEL
          ==================================================== */}

          <DashboardCard>
            <h2 className={sectionHeading}>
              Enquiry to Sewa Conversion Funnel
            </h2>

            <div className="mt-[14px] min-w-0 space-y-[4px]">
              <FunnelRow
                width="100%"
                bg="#5274E7"
                label="Total Enquiries"
                value="1,248"
              />

              <FunnelRow
                width="84%"
                bg="#42AF89"
                label="Qualified Enquiries"
                value="342"
                extra="27.4%"
              />

              <FunnelRow
                width="69%"
                bg="#F7B942"
                label="Sewa Help Requests"
                value="58"
                extra="17.0%"
              />

              <FunnelRow
                width="55%"
                bg="#9E61CE"
                label="Sewa Cases"
                value="38"
                extra="65.5%"
              />

              <FunnelRow
                width="40%"
                bg="#EF5B8A"
                label="Completed"
                value="22"
                extra="57.9%"
              />
            </div>

            <BottomLink className="bottom-[6px] translate-y-[4px]">View conversion report</BottomLink>
          </DashboardCard>

          {/* ====================================================
              TREND
          ==================================================== */}

          <DashboardCard>
            <div
              className="
                flex
                min-w-0
                items-center
                justify-between
                gap-[10px]
              "
            >
              <h2 className={sectionHeading}>
                Engagement Trend
                <span className="ml-[4px] text-[9px] font-semibold text-[#6B748B]">
                  (Last 7 Days)
                </span>
              </h2>

              <button
                type="button"
                className="
                  flex
                  h-[28px]
                  shrink-0
                  items-center
                  gap-[7px]
                  rounded-[5px]
                  border
                  border-[#DFE4EA]
                  bg-white
                  px-[10px]
                  text-[9px]
                  font-semibold
                  text-[#344574]
                  hover:bg-[#F8FAFC]
                "
              >
                All Leads
                <span>⌄</span>
              </button>
            </div>

            <div
              className="
                mt-[10px]
                h-[172px]
                w-full
                min-w-0
              "
            >
              <TrendChart />
            </div>

            <BottomLink>View analytics</BottomLink>
          </DashboardCard>
        </div>
      </div>

      {/* ======================================================
          TABLES ROW
      ====================================================== */}

      <div
        className="
          mt-[10px]
          grid
          w-full
          min-w-0
          grid-cols-1
          gap-[10px]
          lg:grid-cols-[1.08fr_0.92fr]
        "
      >
        {/* ====================================================
            RECENT ENQUIRIES (OVERFLOW X ENABLED)
        ==================================================== */}

        <DashboardCard className="pb-[10px]">
          <h2 className={sectionHeading}>
            Recent Enquiries
          </h2>

          <div
            className="
              mt-[11px]
              w-full
              min-w-0
              overflow-x-auto
              rounded-[4px]
              border
              border-[#EDF0F3]
            "
          >
            <table
              className="
                w-full
                min-w-[550px]
                table-fixed
                border-collapse
              "
            >
              <colgroup>
                <col style={{ width: "32%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "12%" }} />
              </colgroup>

              <thead>
                <tr className="h-[30px] bg-[#F7F8FB] text-left">
                  <TableHead>NAME</TableHead>
                  <TableHead>TYPE</TableHead>
                  <TableHead>SOURCE</TableHead>
                  <TableHead>SUBMITTED</TableHead>
                  <TableHead>STATUS</TableHead>
                </tr>
              </thead>

              <tbody>
                {recentEnquiries.map((item) => (
                  <tr
                    key={item.email}
                    className="
                      h-[42px]
                      border-t
                      border-[#E9EDF0]
                      hover:bg-[#FBFCFD]
                    "
                  >
                    <td className="px-[8px] align-middle">
                      <div className="flex min-w-0 items-center gap-[8px]">
                        <div
                          className="
                            flex
                            h-[26px]
                            w-[26px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#EEF0F5]
                            text-[9px]
                            font-semibold
                            text-[#516285]
                          "
                        >
                          {item.initials}
                        </div>

                        <div className="min-w-0 overflow-hidden">
                          <p
                            className="
                              truncate
                              text-[9px]
                              font-semibold
                              leading-[11px]
                              text-[#27386E]
                            "
                          >
                            {item.name}
                          </p>

                          <p
                            className="
                              mt-[1px]
                              truncate
                              text-[9px]
                              font-semibold
                              leading-[10px]
                              text-[#69758D]
                            "
                          >
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="align-middle">
                      <TypeBadge type={item.type}>{item.type}</TypeBadge>
                    </td>

                    <td
                      className="
                        truncate
                        pr-[5px]
                        text-[9px]
                        font-semibold
                        align-middle
                        text-[#405078]
                      "
                    >
                      {item.source}
                    </td>

                    <td className="align-middle">
                      <p
                        className="
                          whitespace-nowrap
                          text-[9px]
                          font-semibold
                          leading-[11px]
                          text-[#26396D]
                        "
                      >
                        {item.date}
                      </p>

                      <p
                        className="
                          mt-[1px]
                          whitespace-nowrap
                          text-[9px]
                          font-semibold
                          leading-[10px]
                          text-[#65718A]
                        "
                      >
                        {item.time}
                      </p>
                    </td>

                    <td className="align-middle">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <BottomLink>View all enquiries</BottomLink>
        </DashboardCard>

        {/* ====================================================
            PRIORITY FOLLOWUPS (OVERFLOW X ENABLED)
        ==================================================== */}

        <DashboardCard className="pb-[10px]">
          <h2 className={sectionHeading}>
            Priority Follow-ups
          </h2>

          <div
            className="
              mt-[11px]
              w-full
              min-w-0
              overflow-x-auto
              rounded-[4px]
              border
              border-[#EDF0F3]
            "
          >
            <div className="min-w-[450px]">
              {followUps.map((item, index) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.name}
                    className={`
                      grid
                      min-w-0
                      grid-cols-[minmax(0,1.5fr)_0.8fr_0.7fr_54px]
                      items-center
                      gap-[8px]
                      px-[10px]
                      py-[7px]

                      ${index !== 0 ? "border-t border-[#E9EDF0]" : ""}
                    `}
                  >
                    <div className="flex min-w-0 items-center gap-[8px]">
                      <div
                        className="
                          flex
                          h-[27px]
                          w-[27px]
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
                          size={12}
                          style={{
                            color: item.iconColor,
                          }}
                        />
                      </div>

                      <div className="min-w-0 overflow-hidden">
                        <p
                          className="
                            truncate
                            text-[9px]
                            font-semibold
                            leading-[11px]
                            text-[#27386E]
                          "
                        >
                          {item.name}
                        </p>

                        <p
                          className="
                            mt-[1px]
                            truncate
                            text-[9px]
                            font-semibold
                            leading-[10px]
                            text-[#69758D]
                          "
                        >
                          {item.type}
                        </p>
                      </div>
                    </div>

                    <div className="min-w-0 overflow-hidden">
                      <p className="text-[9px] font-semibold text-[#7A8397]">
                        Assigned to
                      </p>

                      <p
                        className="
                          mt-[1px]
                          truncate
                          text-[9px]
                          font-semibold
                          leading-[11px]
                          text-[#3C4A73]
                        "
                      >
                        {item.assigned}
                      </p>
                    </div>

                    <div>
                      <p className="text-[9px] font-semibold text-[#7A8397]">
                        Due Date
                      </p>

                      <p
                        className="
                          mt-[1px]
                          text-[9px]
                          font-semibold
                          leading-[11px]
                          text-[#3C4A73]
                        "
                      >
                        {item.due}
                      </p>
                    </div>

                    <PriorityBadge priority={item.priority} />
                  </div>
                );
              })}
            </div>
          </div>

          <BottomLink>View All</BottomLink>
        </DashboardCard>
      </div>

      {/* ======================================================
          QUICK ACTIONS (OVERFLOW X ENABLED)
      ====================================================== */}

      <div
        className="
          mt-[10px]
          rounded-[7px]
          border
          border-[#E3E7EB]
          bg-white
          px-[14px]
          pb-[11px]
          pt-[9px]
        "
      >
        <h2 className="text-[10px] font-semibold text-[#17613B]">
          Quick Actions
        </h2>

        <div className="mt-[8px] w-full min-w-0 overflow-x-auto pb-[4px]">
          <div
            className="
              flex
              min-w-max
              gap-[8px]
            "
          >
            <QuickAction
              icon={HandHeart}
              iconBg="#FFF2E1"
              iconColor="#E99A29"
              count="127"
            >
              View All Sewa
              <br />
              Help Requests
            </QuickAction>

            <QuickAction
              icon={HandHeart}
              iconBg="#E8F2FE"
              iconColor="#3478D3"
              count="32"
            >
              Review New
              <br />
              Submissions
            </QuickAction>

            <QuickAction
              icon={Users}
              iconBg="#EAF5EF"
              iconColor="#397F68"
            >
              Manage
              <br />
              Volunteers
            </QuickAction>

            <QuickAction
              icon={Building2}
              iconBg="#E5F5E9"
              iconColor="#2C7D4E"
              count="21"
            >
              CSR &amp; Partner
              <br />
              Enquiries
            </QuickAction>

            <QuickAction
              icon={Mail}
              iconBg="#E9F2FE"
              iconColor="#3980B6"
              count="342"
            >
              Newsletter
              <br />
              Subscribers
            </QuickAction>

            <QuickAction
              icon={Download}
              iconBg="#EAF2FF"
              iconColor="#3478D3"
            >
              Download
              <br />
              Lead Report
            </QuickAction>

            <QuickAction
              icon={MessageCircleMore}
              iconBg="#E8F5ED"
              iconColor="#367E59"
            >
              Communication
              <br />
              Center
            </QuickAction>

            <QuickAction
              icon={CalendarDays}
              iconBg="#F0E8FD"
              iconColor="#8051D0"
            >
              Add Follow-up
              <br />
              Task
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
  change,
  negative,
}: {
  label: string;
  value: string;

  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
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
            backgroundColor: iconBg,
          }}
        >
          <Icon
            size={18}
            strokeWidth={2}
            style={{
              color: iconColor,
            }}
          />
        </div>

        <div
          className="
            whitespace-nowrap
            text-2xl
            font-semibold
            leading-none
            text-[#152965]
            text-left
          "
        >
          {value}
        </div>
      </div>

      <div className="flex w-full items-center justify-start gap-[4px] whitespace-nowrap text-left">
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

            ${negative ? "text-[#E44747]" : "text-[#15944B]"}
          `}
        >
          {change}
        </span>

        <span className="text-[9px] font-semibold text-[#596685]">
          vs last 7 days
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD CARD
============================================================ */

function DashboardCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        relative
        min-h-[235px]
        min-w-0
        overflow-hidden
        rounded-[7px]
        border
        border-[#E3E7EB]
        bg-white
        px-[14px]
        pb-[26px]
        pt-[12px]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

const sectionHeading = `
  text-[11px]
  font-semibold
  text-[#182A65]
`;

/* ============================================================
   BOTTOM LINK
============================================================ */

function BottomLink({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`
        absolute
        bottom-[10px]
        left-1/2
        flex
        -translate-x-1/2
        items-center
        gap-[7px]
        whitespace-nowrap
        text-[9px]
        font-semibold
        text-[#465986]
        hover:text-[#182A65]
        ${className}
      `}
    >
      {children}

      <ArrowRight size={10} />
    </button>
  );
}

/* ============================================================
   FUNNEL
============================================================ */

function FunnelRow({
  width,
  bg,
  label,
  value,
  extra,
}: {
  width: string;
  bg: string;
  label: ReactNode;
  value: string;
  extra?: string;
}) {
  return (
    <div
      className="
        grid
        min-w-0
        grid-cols-[minmax(0,1fr)_53px_40px]
        items-center
        gap-[8px]
      "
    >
      <div className="flex h-[36px] justify-center">
        <div
          className="
            flex
            h-full
            items-center
            justify-center
            text-[7px]
            font-semibold
            text-white
            whitespace-nowrap
          "
          style={{
            width,
            backgroundColor: bg,
            clipPath: "polygon(4% 0, 96% 0, 86% 100%, 14% 100%)",
          }}
        >
          {label}
        </div>
      </div>

      <span className="text-right text-[9px] font-semibold text-[#26376B]">
        {value}
      </span>

      <span className="text-right text-[9px] font-semibold text-[#5C6883]">
        {extra ?? ""}
      </span>
    </div>
  );
}

/* ============================================================
   TREND SVG
============================================================ */

function TrendChart() {
  const width = 520;
  const height = 165;

  const left = 42;
  const right = 16;
  const top = 15;
  const bottom = 31;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const max = 500;

  const points = trendData.map((item, index) => {
    const x = left + (index / (trendData.length - 1)) * chartWidth;
    const y = top + chartHeight - (item.value / max) * chartHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full overflow-visible"
      preserveAspectRatio="none"
    >
      {/* horizontal grid */}
      {[0, 100, 200, 300, 400, 500].map((value) => {
        const y = top + chartHeight - (value / max) * chartHeight;

        return (
          <g key={value}>
            <line
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              stroke="#E8ECEF"
              strokeWidth="1"
            />

            <text x="0" y={y + 3} fontSize="9" fill="#667085">
              {value}
            </text>
          </g>
        );
      })}

      {/* area */}
      <path
        d={`
          M ${points[0].x} ${top + chartHeight}
          ${points.map((point) => `L ${point.x} ${point.y}`).join(" ")}
          L ${points[points.length - 1].x} ${top + chartHeight}
          Z
        `}
        fill="rgba(23,105,67,0.06)"
      />

      {/* line */}
      <polyline
        fill="none"
        stroke="#176943"
        strokeWidth="2"
        points={points.map((point) => `${point.x},${point.y}`).join(" ")}
      />

      {/* points */}
      {points.map((point) => (
        <g key={point.day}>
          <circle cx={point.x} cy={point.y} r="3.7" fill="#176943" />

          <text
            x={point.x}
            y={point.y - 8}
            textAnchor="middle"
            fontSize="9"
            fontWeight="400"
            fill="#2B344A"
          >
            {point.value}
          </text>

          <text
            x={point.x}
            y={top + chartHeight + 18}
            textAnchor="middle"
            fontSize="9"
            fill="#626D84"
          >
            {point.day}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ============================================================
   TABLE HEAD
============================================================ */

function TableHead({ children }: { children: ReactNode }) {
  return (
    <th className="px-[8px] text-[9px] font-semibold text-[#182A65]">
      {children}
    </th>
  );
}

/* ============================================================
   TYPE BADGE
============================================================ */

function TypeBadge({
  type,
  children,
}: {
  type: string;
  children: ReactNode;
}) {
  let bg = "#EEF1F5";
  let color = "#53617D";
  let border = "#DEE3E8";

  if (type.includes("Sewa")) {
    bg = "#E4F5EA";
    color = "#2A7D4D";
    border = "#CCE7D5";
  } else if (type.includes("General")) {
    bg = "#E7F1FE";
    color = "#3375CF";
    border = "#D2E4F9";
  } else if (type.includes("Volunteer")) {
    bg = "#F1E8FD";
    color = "#8450D4";
    border = "#E0D2F5";
  } else if (type.includes("CSR")) {
    bg = "#E4F5EA";
    color = "#297B4B";
    border = "#CEE7D6";
  }

  return (
    <span
      className="
        inline-flex
        max-w-[95%]
        truncate
        whitespace-nowrap
        rounded-[4px]
        border
        px-[7px]
        py-[3px]
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
   STATUS
============================================================ */

function StatusBadge({ status }: { status: RecentStatus }) {
  const meta =
    status === "New"
      ? {
        bg: "#E8F2FE",
        color: "#3576D0",
        border: "#D4E5F9",
      }
      : {
        bg: "#FFF3DB",
        color: "#D78916",
        border: "#F3DFB6",
      };

  return (
    <span
      className="
        inline-flex
        rounded-[4px]
        border
        px-[7px]
        py-[3px]
        text-[9px]
        font-semibold
        leading-none
      "
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        borderColor: meta.border,
      }}
    >
      {status}
    </span>
  );
}

/* ============================================================
   PRIORITY
============================================================ */

function PriorityBadge({ priority }: { priority: Priority }) {
  const meta =
    priority === "High"
      ? {
        bg: "#FDE9E9",
        color: "#D94343",
        border: "#F2D0D0",
      }
      : priority === "Medium"
        ? {
          bg: "#FFF2DC",
          color: "#D98A16",
          border: "#F1DCB5",
        }
        : {
          bg: "#E5F4E9",
          color: "#2D8250",
          border: "#D0E8D6",
        };

  return (
    <span
      className="
        inline-flex
        justify-center
        rounded-[4px]
        border
        px-[7px]
        py-[3px]
        text-[9px]
        font-semibold
        leading-none
      "
      style={{
        backgroundColor: meta.bg,
        color: meta.color,
        borderColor: meta.border,
      }}
    >
      {priority}
    </span>
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
  children,
}: {
  icon: ComponentType<{
    size?: number;
    style?: CSSProperties;
    className?: string;
  }>;

  iconBg: string;
  iconColor: string;
  count?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
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
        border-[#E3E7EB]
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
          h-[34px]
          w-[34px]
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
          size={16}
          style={{
            color: iconColor,
          }}
        />
      </div>

      <span
        className="
          min-w-0
          text-[9px]
          font-semibold
          leading-[14px]
          text-[#2E4074]
        "
      >
        {children}
      </span>

      {count && (
        <span
          className="
            absolute
            right-[8px]
            top-[6px]
            flex
            h-[17px]
            min-w-[17px]
            items-center
            justify-center
            rounded-full
            bg-[#F18714]
            px-[4px]
            text-[9px]
            font-semibold
            text-[#FFFFFF]
          "
        >
          {count}
        </span>
      )}
    </button>
  );
}
