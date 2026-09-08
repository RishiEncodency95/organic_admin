"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Eye,
  Filter,
  HelpCircle,
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Star,
  ThumbsUp,
  Upload,
  Download,
  GripVertical,
} from "lucide-react";

type FaqStatus = "Published" | "Draft";
type FaqVisibility = "Public" | "Members Only" | "Internal";
type FaqCategory =
  | "General"
  | "Request Process"
  | "Services"
  | "Volunteer"
  | "Support";

type FAQ = {
  id: number;
  question: string;
  summary: string;
  category: FaqCategory;
  status: FaqStatus;
  visibility: FaqVisibility;
  views: number;
  votes: number;
  updatedOn: string;
  updatedBy: string;
};

const FAQS: FAQ[] = [
  {
    id: 1,
    question: "What is Moksha Sewa?",
    summary: "Learn about our mission, vision and purpose.",
    category: "General",
    status: "Published",
    visibility: "Public",
    views: 1245,
    votes: 342,
    updatedOn: "30 May 2026",
    updatedBy: "Admin User",
  },
  {
    id: 2,
    question: "Who can request Sewa help?",
    summary: "Know who is eligible to request assistance.",
    category: "Request Process",
    status: "Published",
    visibility: "Public",
    views: 987,
    votes: 276,
    updatedOn: "29 May 2026",
    updatedBy: "Seva Team",
  },
  {
    id: 3,
    question: "How does Moksha Sewa verify a request?",
    summary: "Our process of verification and eligibility.",
    category: "Request Process",
    status: "Published",
    visibility: "Public",
    views: 856,
    votes: 238,
    updatedOn: "28 May 2026",
    updatedBy: "Admin User",
  },
  {
    id: 4,
    question: "Is Moksha Sewa completely free?",
    summary: "Information about our free humanitarian services.",
    category: "Services",
    status: "Published",
    visibility: "Public",
    views: 1135,
    votes: 392,
    updatedOn: "28 May 2026",
    updatedBy: "Seva Team",
  },
  {
    id: 5,
    question: "What services does Moksha Sewa provide?",
    summary: "Details of services we provide with dignity.",
    category: "Services",
    status: "Published",
    visibility: "Public",
    views: 1876,
    votes: 512,
    updatedOn: "27 May 2026",
    updatedBy: "Admin User",
  },
  {
    id: 6,
    question: "Do you provide services outside Delhi NCR?",
    summary: "Areas where our services are currently available.",
    category: "Services",
    status: "Published",
    visibility: "Public",
    views: 642,
    votes: 184,
    updatedOn: "26 May 2026",
    updatedBy: "Seva Team",
  },
  {
    id: 7,
    question: "Can I become a volunteer?",
    summary: "How you can join hands and help.",
    category: "Volunteer",
    status: "Published",
    visibility: "Public",
    views: 734,
    votes: 198,
    updatedOn: "25 May 2026",
    updatedBy: "Admin User",
  },
  {
    id: 8,
    question: "How can I support Moksha Sewa?",
    summary: "Ways to support our mission and services.",
    category: "Support",
    status: "Published",
    visibility: "Public",
    views: 948,
    votes: 265,
    updatedOn: "24 May 2026",
    updatedBy: "Admin User",
  },
  {
    id: 9,
    question: "How is my donation used?",
    summary: "Transparency in use of donations and resources.",
    category: "Support",
    status: "Published",
    visibility: "Public",
    views: 512,
    votes: 146,
    updatedOn: "23 May 2026",
    updatedBy: "Seva Team",
  },
  {
    id: 10,
    question: "Whom can I contact for more help?",
    summary: "Get contact details and support channels.",
    category: "General",
    status: "Published",
    visibility: "Public",
    views: 345,
    votes: 98,
    updatedOn: "22 May 2026",
    updatedBy: "Admin User",
  },
];

const categoryTone: Record<FaqCategory, string> = {
  General: "bg-emerald-50 text-emerald-700",
  "Request Process": "bg-blue-50 text-blue-700",
  Services: "bg-violet-50 text-violet-700",
  Volunteer: "bg-orange-50 text-orange-700",
  Support: "bg-amber-50 text-amber-700",
};

const categoryData = [
  { label: "General", value: 15, color: "#0f766e" },
  { label: "Request Process", value: 12, color: "#2563eb" },
  { label: "Services", value: 18, color: "#7c3aed" },
  { label: "Volunteer", value: 8, color: "#f97316" },
  { label: "Support", value: 8, color: "#f59e0b" },
  { label: "Others", value: 7, color: "#9ca3af" },
];

const topViewedFaqs = [
  ["What is Moksha Sewa?", "1,245"],
  ["What services does Moksha Sewa provide?", "1,876"],
  ["Is Moksha Sewa completely free?", "1,135"],
  ["Who can request Sewa help?", "987"],
  ["How does Moksha Sewa verify a request?", "856"],
];

function MetricCard({
  icon,
  iconClass,
  label,
  value,
  note,
  noteTone = "text-[#64748b]",
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  note: string;
  noteTone?: string;
}) {
  return (
    <div className="relative flex h-[56px] min-w-0 items-center gap-[10px] overflow-hidden rounded-[7px] border border-[#e7e9ec] bg-white px-[12px] py-[7px] shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full ${iconClass}`}>
        {icon}
      </div>

      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="break-words text-[9px] font-semibold leading-[11px] text-[#34435e]">{label}</p>
        <div className="mt-[2px] flex items-baseline gap-[6px]">
          <span className="text-[17px] font-semibold leading-none tracking-[-0.03em] text-[#10204a]">
            {value}
          </span>
          <span className={`truncate text-[8.5px] font-semibold ${noteTone}`}>
            {note}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FAQsManagementPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Status");
  const [visibility, setVisibility] = useState("All Visibility");
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const rows = useMemo(() => {
    return FAQS.filter((item) => {
      const searchMatch =
        !query ||
        `${item.question} ${item.summary}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const categoryMatch =
        category === "All Categories" || item.category === category;

      const statusMatch = status === "All Status" || item.status === status;

      const visibilityMatch =
        visibility === "All Visibility" || item.visibility === visibility;

      return searchMatch && categoryMatch && statusMatch && visibilityMatch;
    });
  }, [query, category, status, visibility]);

  const clearFilters = () => {
    setQuery("");
    setCategory("All Categories");
    setStatus("All Status");
    setVisibility("All Visibility");
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        {/* HEADER */}
        <header className="flex items-start justify-between gap-[16px]">
          <div>
            <h1 className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-[#075b33]">
              FAQs Management
            </h1>

            <nav className="mt-[9px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span>FAQs Management</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => router.push("/faqs/new")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <Plus className="h-[15px] w-[15px]" />
              Add New FAQ
            </button>

            <button
              type="button"
              onClick={() => router.push("/faqs/settings")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655] transition hover:bg-slate-50"
            >
              <Settings className="h-[15px] w-[15px]" />
              FAQ Settings
            </button>
          </div>
        </header>

        {/* STATS */}
        <section className="mt-[18px] grid grid-cols-5 gap-[14px]">
          <MetricCard
            icon={<MessageCircleMore className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total FAQs"
            value="68"
            note="Published: 62"
          />

          <MetricCard
            icon={<SlidersHorizontal className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-violet-50 text-violet-600"
            label="Categories"
            value="8"
            note="Active: 8"
          />

          <MetricCard
            icon={<Eye className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-orange-50 text-orange-500"
            label="Total Views"
            value="7,842"
            note="↑ 21.4% this month"
            noteTone="text-emerald-700"
          />

          <MetricCard
            icon={<ThumbsUp className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-blue-50 text-blue-600"
            label="Helpful Votes"
            value="2,156"
            note="↑ 16.7% this month"
            noteTone="text-emerald-700"
          />

          <MetricCard
            icon={<CircleHelp className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-rose-50 text-rose-500"
            label="Unanswered"
            value="2"
            note="Needs Attention"
            noteTone="text-rose-500"
          />
        </section>

        {/* MAIN CONTENT */}
        <section className="mt-[16px] grid items-start gap-[14px] xl:grid-cols-[minmax(0,1fr)_320px]">
          {/* LEFT */}
          <div className="min-w-0 overflow-hidden">
            {/* FILTERS */}
            <div className="flex flex-wrap items-center gap-[10px]">
              <label className="relative min-w-[180px] flex-1">
                <Search className="absolute right-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#5d6b84]" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search FAQs by question or keyword..."
                  className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[14px] pr-[40px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
                />
              </label>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-[40px] min-w-[125px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Categories</option>
                <option>General</option>
                <option>Request Process</option>
                <option>Services</option>
                <option>Volunteer</option>
                <option>Support</option>
              </select>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-[40px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Status</option>
                <option>Published</option>
                <option>Draft</option>
              </select>

              <select
                value={visibility}
                onChange={(event) => setVisibility(event.target.value)}
                className="h-[40px] min-w-[115px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Visibility</option>
                <option>Public</option>
                <option>Members Only</option>
                <option>Internal</option>
              </select>

              <button
                type="button"
                className="inline-flex h-[40px] items-center justify-center gap-[6px] rounded-[6px] border border-[#cfe4d7] bg-white px-[12px] text-[10px] font-semibold text-[#146a3f] shrink-0"
              >
                <Filter className="h-[14px] w-[14px]" />
                More Filters
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-[40px] items-center justify-center gap-[6px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-semibold text-[#35445f] shrink-0"
              >
                <RefreshCw className="h-[14px] w-[14px]" />
                Clear
              </button>
            </div>

            {/* TABLE */}
            <div className="mt-[12px] overflow-hidden rounded-[8px] border border-[#e7e9ec] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[930px] border-collapse text-left">
                  <thead>
                    <tr className="h-[42px] border-b border-[#e7e9ec] bg-[#fafbfc] text-[8.5px] font-semibold uppercase tracking-[0.04em] text-[#44516a]">
                      <th className="w-[42px] px-[12px] text-center">
                        <input type="checkbox" />
                      </th>
                      <th className="px-[8px]">Question</th>
                      <th className="px-[8px]">Category</th>
                      <th className="px-[8px]">Status</th>
                      <th className="px-[8px] text-center">Views</th>
                      <th className="px-[8px] text-center whitespace-nowrap">Helpful Votes</th>
                      <th className="px-[8px] whitespace-nowrap">Updated On</th>
                      <th className="px-[8px] text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((item) => {
                      const isExpanded = expandedId === item.id;

                      return (
                        <React.Fragment key={item.id}>
                          <tr
                            onClick={() => toggleExpand(item.id)}
                            className={`h-[62px] cursor-pointer border-b border-[#eef0f2] align-middle transition ${isExpanded ? "bg-[#f5fbf7]" : "hover:bg-slate-50/60"
                              }`}
                          >
                            <td
                              className="px-[12px] text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input type="checkbox" />
                            </td>

                            <td className="px-[8px]">
                              <div className="min-w-[300px]">
                                <p className="text-[10.5px] font-semibold leading-tight text-[#19274a]">
                                  {item.question}
                                </p>
                                <p className="mt-[4px] max-w-[330px] text-[8.8px] font-semibold leading-[1.35] text-[#53627c]">
                                  {item.summary}
                                </p>
                              </div>
                            </td>

                            <td className="px-[8px]">
                              <span
                                className={`inline-flex whitespace-nowrap rounded-[5px] px-[8px] py-[4px] text-[8px] font-semibold ${categoryTone[item.category]}`}
                              >
                                {item.category}
                              </span>
                            </td>

                            <td className="px-[8px]">
                              <span className="inline-flex items-center gap-[5px] rounded-[5px] bg-emerald-50 px-[8px] py-[4px] text-[8px] font-semibold text-emerald-700">
                                <span className="h-[5px] w-[5px] rounded-full bg-emerald-500" />
                                {item.status}
                              </span>
                            </td>

                            <td className="px-[8px] text-center">
                              <span className="text-[9.5px] font-semibold tabular-nums text-[#2f3d58]">
                                {item.views.toLocaleString()}
                              </span>
                            </td>

                            <td className="px-[8px]">
                              <div className="flex items-center justify-center gap-[6px] text-emerald-700">
                                <ThumbsUp className="h-[12px] w-[12px]" />
                                <span className="text-[9.5px] font-semibold tabular-nums">
                                  {item.votes}
                                </span>
                              </div>
                            </td>

                            <td className="px-[8px] whitespace-nowrap">
                              <span className="text-[9px] font-semibold text-[#2c3a58]">
                                {item.updatedOn}
                              </span>
                              <span className="ml-[4px] text-[8px] font-semibold text-[#68758d]">
                                By {item.updatedBy}
                              </span>
                            </td>

                            <td
                              className="px-[8px]"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-center gap-[8px]">
                                <button
                                  type="button"
                                  onClick={() => router.push("/faqs/new")}
                                  className="grid h-[30px] w-[30px] place-items-center rounded-[5px] border border-[#e1e5e9] bg-white text-[#4b5871] hover:bg-slate-50"
                                >
                                  <Eye className="h-[12px] w-[12px]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => router.push("/faqs/new")}
                                  className="grid h-[30px] w-[30px] place-items-center rounded-[5px] border border-[#e1e5e9] bg-white text-[#4b5871] hover:bg-slate-50"
                                >
                                  <Pencil className="h-[12px] w-[12px]" />
                                </button>
                                <button
                                  type="button"
                                  className="grid h-[30px] w-[30px] place-items-center rounded-[5px] border border-[#e1e5e9] bg-white text-[#4b5871] hover:bg-slate-50"
                                >
                                  <MoreVertical className="h-[12px] w-[12px]" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* EXPANDED ACCORDION PANEL */}
                          {isExpanded && (
                            <tr className="bg-[#f7fbf8] border-b border-[#e5ece7]">
                              <td colSpan={8} className="px-[24px] py-[14px]">
                                <div className="rounded-[7px] border border-[#d6e6dc] bg-white p-[14px] shadow-[0_2px_6px_rgba(7,91,51,0.04)]">
                                  <div className="flex items-center justify-between gap-[12px]">
                                    <div className="flex items-center gap-[8px]">
                                      <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-[#eaf4ee] text-[10px] font-semibold text-[#075b33]">
                                        Q
                                      </span>
                                      <h4 className="text-[12px] font-semibold text-[#172648]">
                                        {item.question}
                                      </h4>
                                    </div>
                                    <span className="rounded-[4px] border border-[#d0e4d7] bg-[#f2f8f4] px-[8px] py-[2px] text-[8.5px] font-semibold text-[#075b33]">
                                      Visibility: {item.visibility}
                                    </span>
                                  </div>

                                  <div className="mt-[10px] pl-[30px]">
                                    <p className="text-[10px] font-semibold leading-[1.6] text-[#34435e]">
                                      {item.summary} Moksha Sewa provides dignified, scripture-guided humanitarian final journey services, cremation assistance, ambulance support, and Vedic rituals with utmost reverence and zero cost for families in need.
                                    </p>

                                    <div className="mt-[12px] flex items-center justify-between border-t border-[#f0f4f2] pt-[10px]">
                                      <div className="flex items-center gap-[14px] text-[9px] font-semibold text-[#5c6a83]">
                                        <span>Category: <span className="text-[#075b33]">{item.category}</span></span>
                                        <span>Total Views: <span className="text-[#19274a]">{item.views.toLocaleString()}</span></span>
                                        <span>Helpful Votes: <span className="text-emerald-700">{item.votes} 👍</span></span>
                                      </div>

                                      <div className="flex items-center gap-[8px]">
                                        <button
                                          type="button"
                                          onClick={() => router.push("/faqs/new")}
                                          className="inline-flex h-[28px] items-center gap-[6px] rounded-[5px] border border-[#d6ded9] bg-white px-[10px] text-[8.5px] font-semibold text-[#075b33] hover:bg-emerald-50"
                                        >
                                          <Pencil className="h-[10px] w-[10px]" />
                                          Edit FAQ
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex min-h-[58px] items-center justify-between gap-[12px] border-t border-[#e7e9ec] px-[12px]">
                <p className="text-[9px] font-semibold text-[#47546c]">
                  Showing 1 to {rows.length} of 68 FAQs
                </p>

                <div className="flex items-center gap-[6px]">
                  <button type="button" className="grid h-[32px] w-[32px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white">
                    <ChevronLeft className="h-[13px] w-[13px]" />
                  </button>

                  {[1, 2, 3, 4, 5].map((page) => (
                    <button
                      type="button"
                      key={page}
                      className={`grid h-[32px] min-w-[32px] place-items-center rounded-[5px] px-[6px] text-[9px] font-semibold ${page === 1
                        ? "bg-[#075b33] text-white"
                        : "border border-[#dfe3e7] bg-white text-[#35445f]"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <span className="px-[2px] text-[10px] font-semibold text-[#64748b]">…</span>

                  <button type="button" className="grid h-[32px] min-w-[32px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white px-[6px] text-[9px] font-semibold text-[#35445f]">
                    7
                  </button>

                  <button type="button" className="grid h-[32px] w-[32px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white">
                    <ChevronRight className="h-[13px] w-[13px]" />
                  </button>
                </div>

                <select className="h-[32px] rounded-[5px] border border-[#dfe3e7] bg-white px-[10px] text-[9px] font-semibold text-[#35445f]">
                  <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-[12px]">
            {/* CATEGORY DONUT */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[12px] font-semibold text-[#19274a]">
                FAQ Categories
              </h2>

              <div className="mt-[12px] flex items-center gap-[14px]">
                <div
                  className="grid h-[120px] w-[120px] shrink-0 place-items-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(#0f766e 0 22%, #2563eb 22% 40%, #7c3aed 40% 66%, #f97316 66% 78%, #f59e0b 78% 90%, #9ca3af 90% 100%)",
                  }}
                >
                  <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white text-center">
                    <div>
                      <p className="text-[18px] font-semibold leading-none text-[#10204a]">8</p>
                      <p className="mt-[4px] text-[8px] font-semibold text-[#61708c]">
                        Categories
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-[8px]">
                  {categoryData.map((item) => (
                    <div
                      key={item.label}
                      className="grid grid-cols-[8px_1fr_auto] items-center gap-[7px]"
                    >
                      <span
                        className="h-[8px] w-[8px] rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="truncate text-[8.5px] font-semibold text-[#34425e]">
                        {item.label}
                      </span>
                      <span className="whitespace-nowrap text-[8.3px] font-semibold text-[#34425e]">
                        ({item.value})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[12px] font-semibold text-[#19274a]">
                Quick Actions
              </h2>

              <div className="mt-[10px] space-y-[7px]">
                <button
                  type="button"
                  onClick={() => router.push("/faqs/new")}
                  className="flex h-[36px] w-full items-center gap-[9px] rounded-[5px] border border-[#e2e6ea] bg-white px-[10px] text-[9px] font-semibold text-[#293854] transition hover:bg-slate-50"
                >
                  <Plus className="h-[13px] w-[13px]" />
                  Add New FAQ
                </button>

                <button
                  type="button"
                  className="flex h-[36px] w-full items-center gap-[9px] rounded-[5px] border border-[#e2e6ea] bg-white px-[10px] text-[9px] font-semibold text-[#293854] transition hover:bg-slate-50"
                >
                  <SlidersHorizontal className="h-[13px] w-[13px]" />
                  Manage Categories
                </button>

                <button
                  type="button"
                  className="flex h-[36px] w-full items-center gap-[9px] rounded-[5px] border border-[#e2e6ea] bg-white px-[10px] text-[9px] font-semibold text-[#293854] transition hover:bg-slate-50"
                >
                  <GripVertical className="h-[13px] w-[13px]" />
                  Reorder FAQs
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/faqs/settings")}
                  className="flex h-[36px] w-full items-center gap-[9px] rounded-[5px] border border-[#e2e6ea] bg-white px-[10px] text-[9px] font-semibold text-[#293854] transition hover:bg-slate-50"
                >
                  <Settings className="h-[13px] w-[13px]" />
                  FAQ Settings
                </button>
              </div>
            </section>

            {/* TOP VIEWED */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="flex items-center justify-between gap-[10px]">
                <h2 className="text-[12px] font-semibold text-[#19274a]">
                  Top Viewed FAQs
                </h2>

                <button
                  type="button"
                  className="rounded-[5px] border border-[#d9eadf] bg-white px-[8px] py-[4px] text-[8px] font-semibold text-[#14683d]"
                >
                  View All
                </button>
              </div>

              <div className="mt-[10px] space-y-[8px]">
                {topViewedFaqs.map(([label, count], index) => (
                  <div
                    key={label}
                    className="grid grid-cols-[20px_1fr_auto] items-center gap-[8px]"
                  >
                    <span className="text-[13px] font-semibold text-[#17234a]">
                      {index + 1}
                    </span>

                    <span className="truncate text-[8.5px] font-semibold text-[#34425e]">
                      {label}
                    </span>

                    <span className="flex items-center gap-[5px] whitespace-nowrap text-[8.5px] font-semibold text-[#4b5870]">
                      <Eye className="h-[10px] w-[10px] text-[#7c8799]" />
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* GREEN CTA */}
            <section className="relative overflow-hidden rounded-[8px] bg-[linear-gradient(135deg,#08643a_0%,#07542f_100%)] px-[18px] py-[18px] text-white shadow-[0_7px_18px_rgba(5,94,49,.12)]">
              <div className="relative z-10 max-w-[210px]">
                <p className="text-[12px] font-semibold leading-[1.5]">
                  Keep your answers up-to-date
                  <br />
                  and help more people.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/faqs/new")}
                  className="mt-[16px] inline-flex h-[36px] items-center gap-[8px] rounded-[5px] bg-white px-[14px] text-[9px] font-semibold text-[#075b33] transition hover:bg-slate-100"
                >
                  Add New FAQ
                  <ChevronRight className="h-[12px] w-[12px]" />
                </button>
              </div>

              <HelpCircle className="absolute -bottom-[20px] right-[10px] h-[96px] w-[96px] text-emerald-200/20" strokeWidth={1.2} />
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
