"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  EyeOff,
  FileText,
  Filter,
  FolderClosed,
  GripVertical,
  Heart,
  HelpCircle,
  Home,
  Lightbulb,
  Menu,
  Monitor,
  Pencil,
  Plus,
  Search,
  Settings,
  Trash2,
  UsersRound,
  Video,
} from "lucide-react";

type MenuStatus = "Active" | "Inactive";

type MenuRecord = {
  id: number;
  name: string;
  description: string;
  location: string;
  status: MenuStatus;
  items: number;
  updatedDate: string;
  updatedTime: string;
};

type MenuStructureItem = {
  id: string;
  label: string;
  type: string;
  url?: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children?: MenuStructureItem[];
};

const MENUS: MenuRecord[] = [
  {
    id: 1,
    name: "Primary Header Menu",
    description: "Main website navigation header bar with parent & child dropdowns",
    location: "Header Bar",
    status: "Active",
    items: 12,
    updatedDate: "20 May 2026",
    updatedTime: "10:30 AM",
  },
  {
    id: 2,
    name: "Registration & Action Menu",
    description: "Header registration buttons & advisor helpline",
    location: "Header Action Bar",
    status: "Active",
    items: 6,
    updatedDate: "20 May 2026",
    updatedTime: "10:35 AM",
  },
  {
    id: 3,
    name: "Footer Quick Links",
    description: "Footer 10 key links & navigation",
    location: "Footer Left",
    status: "Active",
    items: 10,
    updatedDate: "20 May 2026",
    updatedTime: "10:40 AM",
  },
  {
    id: 4,
    name: "Footer Legal & Policy Links",
    description: "Privacy policy, terms & conditions, refund policy",
    location: "Footer Bottom",
    status: "Active",
    items: 3,
    updatedDate: "20 May 2026",
    updatedTime: "10:45 AM",
  },
  {
    id: 5,
    name: "Mobile Drawer Navigation Menu",
    description: "Mobile bottom sheet drawer & tab bar links",
    location: "Mobile Drawer",
    status: "Active",
    items: 11,
    updatedDate: "20 May 2026",
    updatedTime: "10:50 AM",
  },
  {
    id: 6,
    name: "User & Portal Logins Menu",
    description: "Exhibitor, Buyer, Delegates & User Login links",
    location: "Top Bar Dropdown",
    status: "Active",
    items: 4,
    updatedDate: "20 May 2026",
    updatedTime: "10:55 AM",
  },
  {
    id: 7,
    name: "Top Bar Utility & Helpline",
    description: "Email, phone number & announcement ticker",
    location: "Top Bar",
    status: "Active",
    items: 3,
    updatedDate: "20 May 2026",
    updatedTime: "11:00 AM",
  },
];

const MENU_STRUCTURES: Record<number, MenuStructureItem[]> = {
  1: [
    { id: "home", label: "Home", type: "Custom Link", url: "/", icon: Home },
    {
      id: "about",
      label: "About Us",
      type: "Dropdown Parent",
      url: "/about",
      icon: FolderClosed,
      children: [
        { id: "about-expo", label: "About Expo", type: "Page", url: "/about", icon: FileText },
        { id: "advisory-board", label: "Advisory Board Members", type: "Page", url: "/about/advisory_board_member", icon: UsersRound },
        { id: "blogs", label: "Blogs & News", type: "Category", url: "/blog", icon: FileText },
      ],
    },
    {
      id: "participate",
      label: "Participate",
      type: "Dropdown Parent",
      url: "/why-exhibit",
      icon: FolderClosed,
      children: [
        { id: "why-exhibit", label: "Why Exhibit at ORGANIC EXPO?", type: "Page", url: "/why-exhibit", icon: FileText },
        { id: "exhibitors", label: "Exhibitor List", type: "Page", url: "/exhibitors", icon: FileText },
        { id: "why-visit", label: "Why Visit ORGANIC EXPO", type: "Page", url: "/why-visit", icon: FileText },
        { id: "msme", label: "MSME PMS Scheme", type: "Page", url: "/participate/msme", icon: FileText },
      ],
    },
    { id: "buyer-seller", label: "Buyer-Seller Meet", type: "Page", url: "/buyer-seller-meet", icon: FileText },
    {
      id: "opportunities",
      label: "Opportunities",
      type: "Dropdown Parent",
      url: "/sponsorship",
      icon: FolderClosed,
      children: [
        { id: "sponsorship", label: "Sponsorship Opportunities", type: "Page", url: "/sponsorship", icon: FileText },
        { id: "epromotion", label: "E-Promotion Opportunity", type: "Page", url: "/e-promotion-web", icon: FileText },
        { id: "partnership", label: "Partnership / Collaboration", type: "Page", url: "/partnership", icon: FileText },
      ],
    },
    { id: "glimpses", label: "Glimpses & Media", type: "Page", url: "/gallery", icon: FileText },
    { id: "conference", label: "Global Conference", type: "External Link", url: "https://arogya.namogange.org/", icon: ExternalLink },
    { id: "awards", label: "Organic Awards", type: "Page", url: "/awards", icon: FileText },
    { id: "contact", label: "Contact Us", type: "Page", url: "/contact", icon: Menu },
  ],
  2: [
    { id: "book-stall", label: "BOOK A STALL", type: "Action CTA", url: "/registration/book-a-stand", icon: FileText },
    { id: "reg-visitor", label: "REGISTER AS VISITOR", type: "Action CTA", url: "/registration/visitor-registration", icon: FileText },
    { id: "reg-delegate", label: "DELEGATE REGISTRATION", type: "External Link", url: "https://arogya.namogange.org/", icon: ExternalLink },
    { id: "reg-buyer", label: "REGISTER AS BUYER", type: "Action CTA", url: "/registration/buyer-registration", icon: FileText },
    { id: "spon-opp", label: "SPONSORSHIP OPPORTUNITIES", type: "Action CTA", url: "/sponsorship", icon: FileText },
    { id: "talk-advisor", label: "TALK TO EXPO ADVISOR", type: "Phone Link", url: "tel:+919654900525", icon: HelpCircle },
  ],
  3: [
    { id: "f-home", label: "Home", type: "Footer Link", url: "/", icon: Home },
    { id: "f-about", label: "About Us", type: "Footer Link", url: "/about", icon: FileText },
    { id: "f-exhibitor-reg", label: "Exhibitor Registration", type: "Footer Link", url: "/registration/book-a-stand", icon: FileText },
    { id: "f-delegate-reg", label: "Delegate Registration", type: "External Link", url: "https://arogya.namogange.org/", icon: ExternalLink },
    { id: "f-conference-tracks", label: "Conference Tracks", type: "External Link", url: "https://arogya.namogange.org/", icon: ExternalLink },
    { id: "f-bs-meet", label: "Buyer Seller Meet", type: "Footer Link", url: "/buyer-seller-meet", icon: FileText },
    { id: "f-exhibitors", label: "Exhibitor List", type: "Footer Link", url: "/exhibitors", icon: FileText },
    { id: "f-blogs", label: "Blogs", type: "Category", url: "/blog", icon: FileText },
    { id: "f-awards", label: "Awards", type: "Footer Link", url: "/awards", icon: FileText },
    { id: "f-contact", label: "Contact Us", type: "Footer Link", url: "/contact", icon: Menu },
  ],
  4: [
    { id: "f-privacy", label: "Privacy Policy", type: "Legal Policy", url: "/registration/privacy-policy", icon: FileText },
    { id: "f-terms", label: "Terms & Conditions", type: "Legal Policy", url: "/registration/terms-and-conditions", icon: FileText },
    { id: "f-refund", label: "Refund Policy", type: "Legal Policy", url: "/registration/refund-policy", icon: FileText },
  ],
  5: [
    { id: "m-home", label: "Home", type: "Mobile Tab", url: "/", icon: Home },
    {
      id: "m-about",
      label: "About Us",
      type: "Accordion Parent",
      url: "/about",
      icon: FolderClosed,
      children: [
        { id: "m-about-expo", label: "About Expo", type: "Sub Menu", url: "/about", icon: FileText },
        { id: "m-advisory", label: "Advisory Board Members", type: "Sub Menu", url: "/about/advisory_board_member", icon: UsersRound },
        { id: "m-blogs", label: "Blogs", type: "Sub Menu", url: "/blog", icon: FileText },
      ],
    },
    {
      id: "m-participate",
      label: "Participate",
      type: "Accordion Parent",
      url: "/why-exhibit",
      icon: FolderClosed,
      children: [
        { id: "m-why-exhibit", label: "Why Exhibit", type: "Sub Menu", url: "/why-exhibit", icon: FileText },
        { id: "m-exhibitors", label: "Exhibitor List", type: "Sub Menu", url: "/exhibitors", icon: FileText },
        { id: "m-why-visit", label: "Why Visit", type: "Sub Menu", url: "/why-visit", icon: FileText },
        { id: "m-msme", label: "MSME PMS Scheme", type: "Sub Menu", url: "/participate/msme", icon: FileText },
      ],
    },
    { id: "m-bs-meet", label: "Buyer-Seller Meet", type: "Mobile Item", url: "/buyer-seller-meet", icon: FileText },
    {
      id: "m-opp",
      label: "Opportunities",
      type: "Accordion Parent",
      url: "/sponsorship",
      icon: FolderClosed,
      children: [
        { id: "m-sponsership", label: "Sponsorship", type: "Sub Menu", url: "/sponsorship", icon: FileText },
        { id: "m-epromo", label: "E-Promotion", type: "Sub Menu", url: "/e-promotion-web", icon: FileText },
        { id: "m-partner", label: "Partnership / Collaboration", type: "Sub Menu", url: "/partnership", icon: FileText },
      ],
    },
    { id: "m-gallery", label: "Media / Gallery", type: "Mobile Item", url: "/gallery", icon: FileText },
    { id: "m-conf", label: "Conference", type: "External Link", url: "https://arogya.namogange.org/", icon: ExternalLink },
    { id: "m-awards", label: "Awards", type: "Mobile Item", url: "/awards", icon: FileText },
    { id: "m-contact", label: "Contact", type: "Mobile Item", url: "/contact", icon: Menu },
  ],
  6: [
    { id: "l-user", label: "User Login", type: "Portal Login", url: "https://admin.organicexpo.in/login", icon: ExternalLink },
    { id: "l-exhibitor", label: "Exhibitor Login", type: "Portal Login", url: "/exhibitor-login", icon: FileText },
    { id: "l-buyer", label: "Buyer Login", type: "Portal Login", url: "/buyer-login", icon: FileText },
    { id: "l-delegates", label: "Delegates Login", type: "Portal Login", url: "/delegates-login", icon: FileText },
  ],
  7: [
    { id: "t-email", label: "Email: info@namogangewellness.com", type: "Top Bar Email", url: "mailto:info@namogangewellness.com", icon: HelpCircle },
    { id: "t-phone", label: "Phone: +91 96549 00525", type: "Top Bar Phone", url: "tel:+919654900525", icon: HelpCircle },
    { id: "t-marquee", label: "Ticker: 500+ SPEAKERS CONFIRMED • EARLY BIRD DISCOUNT ENDING SOON!", type: "Top Bar Ticker", url: "#", icon: Lightbulb },
  ],
};

function MetricCard({
  icon,
  iconClass,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="flex min-h-[56px] items-center gap-[10px] rounded-[7px] border border-[#e7e9ec] bg-white px-[12px] py-[7px] shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full ${iconClass}`}>
        {icon}
      </div>

      <div className="min-w-0 overflow-hidden">
        <p className="text-[9.5px] font-semibold text-[#34435e]">{label}</p>
        <div className="mt-[2px] flex items-baseline gap-[6px]">
          <span className="text-[17px] font-semibold leading-none tracking-[-0.03em] text-[#10204a]">
            {value}
          </span>
          <span className="truncate text-[8.5px] font-semibold text-[#66738b]">{note}</span>
        </div>
      </div>
    </article>
  );
}

function StructureRow({
  item,
  nested = false,
  onNavigateEdit,
}: {
  item: MenuStructureItem;
  nested?: boolean;
  onNavigateEdit?: (url?: string) => void;
}) {
  const Icon = item.icon;

  return (
    <div className={nested ? "ml-[24px] border-l border-dashed border-[#b8c5d6] pl-[10px]" : ""}>
      <div className="flex min-h-[34px] items-center gap-[8px] rounded-[5px] border border-[#e4e8eb] bg-white px-[10px] py-[4px]">
        <Icon className="h-[13px] w-[13px] shrink-0 text-[#075b33]" strokeWidth={1.8} />

        <div className="flex flex-1 items-center gap-[6px] min-w-0">
          <span className="truncate text-[9.5px] font-bold text-[#1a2b4c]">
            {item.label}
          </span>
          {item.url && (
            <span className="truncate rounded-[3px] bg-[#f0f9f4] px-[5px] py-[1px] font-mono text-[8px] font-semibold text-[#075b33] border border-[#cde8d7]">
              {item.url}
            </span>
          )}
        </div>

        {item.url && onNavigateEdit && (
          <button
            type="button"
            onClick={() => onNavigateEdit(item.url)}
            className="shrink-0 inline-flex items-center gap-[3px] rounded-[4px] bg-[#075b33] px-[6px] py-[2px] text-[8px] font-bold text-white hover:bg-[#054828] transition"
          >
            <Pencil className="h-[9px] w-[9px]" />
            Edit Page
          </button>
        )}

        <span className="shrink-0 rounded-[3px] bg-[#f1f5f9] px-[5px] py-[1px] text-[8px] font-bold text-[#64748b]">
          {item.type}
        </span>

        {item.children?.length ? (
          <ChevronDown className="h-[11px] w-[11px] shrink-0 text-[#075b33] rotate-180" />
        ) : null}
      </div>

      {item.children?.length ? (
        <div className="mt-[4px] space-y-[4px]">
          {item.children.map((child) => (
            <StructureRow key={child.id} item={child} nested onNavigateEdit={onNavigateEdit} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function NavigationMenusPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [selectedMenuId, setSelectedMenuId] = useState(1);
  const [activeTab, setActiveTab] = useState<"Menu Structure" | "Menu Settings">("Menu Structure");

  const rows = useMemo(() => {
    return MENUS.filter((item) => {
      const searchMatch =
        !query ||
        `${item.name} ${item.description} ${item.location}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const statusMatch = status === "All Status" || item.status === status;

      return searchMatch && statusMatch;
    });
  }, [query, status]);

  const selectedMenu =
    MENUS.find((item) => item.id === selectedMenuId) ?? MENUS[0];

  const currentStructure = MENU_STRUCTURES[selectedMenuId] ?? MENU_STRUCTURES[1];

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[14px] py-[10px] text-[#142347] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        {/* HEADER */}
        <header className="flex items-center justify-between gap-[12px]">
          <div>
            <h1 className="text-[22px] font-semibold leading-none tracking-[-0.03em] text-[#075b33]">
              Navigation Menus
            </h1>

            <nav className="mt-[4px] flex items-center gap-[6px] text-[10px] font-semibold text-[#1d2b58]">
              <span
                onClick={() => router.push("/")}
                className="cursor-pointer transition hover:text-[#075b33]"
              >
                Dashboard
              </span>
              <span className="text-[#7b8597]">›</span>
              <span className="text-[#075b33]">Navigation Menus</span>
            </nav>
          </div>

          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => router.push("/pages")}
              className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] border border-[#cfe4d7] bg-[#f0f9f4] px-[14px] text-[10px] font-semibold text-[#075b33] transition hover:bg-[#e4f3eb]"
            >
              <FileText className="h-[14px] w-[14px]" />
              Manage Pages & CMS
            </button>

            <button
              type="button"
              onClick={() => router.push("/navigation-menus/new")}
              className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[16px] text-[10px] font-semibold text-white shadow-[0_4px_10px_rgba(0,0,0,.12)] transition hover:opacity-95"
            >
              <Plus className="h-[14px] w-[14px]" />
              Add New Menu
            </button>
          </div>
        </header>

        {/* STATS */}
        <section className="mt-[10px] grid grid-cols-4 gap-[10px]">
          <MetricCard
            icon={<Menu className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Menus"
            value={MENUS.length.toString()}
            note="Bharat Organic Expo menus"
          />

          <MetricCard
            icon={<Monitor className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Active Menus"
            value={MENUS.filter((m) => m.status === "Active").length.toString()}
            note="Live website menus"
          />

          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Inactive Menus"
            value={MENUS.filter((m) => m.status === "Inactive").length.toString()}
            note="Hidden or draft menus"
          />

          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-blue-50 text-blue-700"
            label="Total Menu Items"
            value={MENUS.reduce((acc, m) => acc + m.items, 0).toString()}
            note="Across all menus"
          />
        </section>

        {/* MAIN GRID */}
        <section className="mt-[10px] grid items-stretch gap-[10px] xl:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
          {/* LEFT MENU LIST */}
          <section className="flex flex-col justify-between rounded-[8px] border border-[#e7e9ec] bg-white p-[10px] shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <div>
              <div className="grid grid-cols-[minmax(220px,1fr)_140px_34px] gap-[8px]">
                <label className="relative">
                  <Search className="absolute left-[10px] top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-[#5d6b84]" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search menus..."
                    className="h-[34px] w-full rounded-[5px] border border-[#dfe4e8] bg-white pl-[32px] pr-[10px] text-[10px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
                  />
                </label>

                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  className="h-[34px] rounded-[5px] border border-[#dfe4e8] bg-white px-[10px] text-[9.5px] font-semibold text-[#2a3855] outline-none"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>

                <button
                  type="button"
                  className="grid h-[34px] w-[34px] place-items-center rounded-[5px] border border-[#dfe4e8] bg-white text-[#44516a]"
                >
                  <Filter className="h-[13px] w-[13px]" />
                </button>
              </div>

              <div className="mt-[8px] overflow-hidden rounded-[6px] border border-[#eceff1]">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[660px] border-collapse text-left">
                    <thead>
                      <tr className="h-[34px] border-b border-[#edf0f2] bg-[#fafbfc] text-[8px] font-semibold uppercase tracking-[0.04em] text-[#44516a]">
                        <th className="w-[38px] px-[8px]"></th>
                        <th className="px-[8px]">Menu Name</th>
                        <th className="px-[8px]">Location</th>
                        <th className="px-[8px]">Status</th>
                        <th className="px-[8px] text-center">Items</th>
                        <th className="px-[8px] whitespace-nowrap">Last Updated</th>
                        <th className="px-[8px] text-center">Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map((item) => (
                        <tr
                          key={item.id}
                          onClick={() => {
                            setSelectedMenuId(item.id);
                          }}
                          className={`h-[52px] cursor-pointer border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/60 ${selectedMenuId === item.id ? "bg-[#fbfefc]" : ""
                            }`}
                        >
                          <td className="px-[8px] text-center">
                            <GripVertical className="mx-auto h-[13px] w-[13px] text-[#8a95a8]" />
                          </td>

                          <td className="px-[8px]">
                            <div className="min-w-[160px]">
                              <p className="text-[10px] font-bold text-[#19274a]">
                                {item.name}
                              </p>
                              <p className="mt-[2px] text-[8.5px] font-semibold text-[#68758d]">
                                {item.description}
                              </p>
                            </div>
                          </td>

                          <td className="px-[8px]">
                            <span className="inline-flex rounded-[4px] border border-[#dce1e6] bg-white px-[7px] py-[2.5px] text-[8px] font-bold text-[#075b33]">
                              {item.location}
                            </span>
                          </td>

                          <td className="px-[8px]">
                            <span
                              className={`inline-flex rounded-[4px] border px-[8px] py-[2.5px] text-[8px] font-semibold ${item.status === "Active"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-rose-200 bg-rose-50 text-rose-600"
                                }`}
                            >
                              {item.status}
                            </span>
                          </td>

                          <td className="px-[8px] text-center">
                            <span className="text-[9.5px] font-semibold text-[#17234a]">
                              {item.items}
                            </span>
                          </td>

                          <td className="px-[8px] whitespace-nowrap">
                            <span className="text-[8.5px] font-semibold text-[#34425e]">
                              {item.updatedDate}
                            </span>
                            <span className="ml-[4px] text-[8px] font-semibold text-[#68758d]">
                              {item.updatedTime}
                            </span>
                          </td>

                          <td className="px-[8px]">
                            <div className="flex items-center justify-center gap-[8px]">
                              <button className="text-[#263650]">
                                <Pencil className="h-[13px] w-[13px]" />
                              </button>
                              <button className="text-[#45536b]">
                                <Copy className="h-[13px] w-[13px]" />
                              </button>
                              <button className="text-[#d74a40]">
                                <Trash2 className="h-[13px] w-[13px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex min-h-[38px] items-center border-t border-[#edf0f2] px-[10px]">
              <p className="text-[9px] font-semibold text-[#47546c]">
                Showing 1 to {rows.length} of {MENUS.length} menus
              </p>
            </div>
          </section>

          {/* RIGHT PREVIEW */}
          <section className="flex flex-col justify-between rounded-[8px] border border-[#e7e9ec] bg-white p-[10px] shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
            <div className="flex items-center justify-between gap-[12px]">
              <h2 className="text-[12px] font-bold text-[#19274a]">
                Menu Structure & Live Preview ({selectedMenu.name})
              </h2>

              <select
                value={selectedMenuId}
                onChange={(event) => setSelectedMenuId(Number(event.target.value))}
                className="h-[32px] min-w-[180px] rounded-[5px] border border-[#dfe4e8] bg-white px-[10px] text-[9px] font-semibold text-[#35445f] outline-none"
              >
                {MENUS.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-[8px] overflow-x-auto rounded-[5px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[10px] py-[6px] [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-300/50">
              <div className="flex flex-nowrap items-center gap-[10px] whitespace-nowrap text-white">
                {currentStructure.map((item) => (
                  <span
                    key={item.id}
                    className="flex shrink-0 items-center gap-[3px] text-[7.5px] font-extrabold uppercase tracking-wider text-white"
                  >
                    {item.label}
                    {item.children?.length ? (
                      <ChevronDown className="h-[8px] w-[8px] text-[#facc15]" />
                    ) : null}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-[10px] flex items-end gap-[8px] border-b border-[#e7eaed]">
              {(["Menu Structure", "Menu Settings"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative h-[30px] px-[10px] text-[9px] font-semibold ${activeTab === tab ? "text-[#075b33]" : "text-[#5e6b83]"
                    }`}
                >
                  {tab}
                  {activeTab === tab ? (
                    <span className="absolute inset-x-[3px] bottom-0 h-[2px] bg-[#075b33]" />
                  ) : null}
                </button>
              ))}
            </div>

            {activeTab === "Menu Structure" ? (
              <div className="mt-[8px]">
                <div className="flex items-center gap-[6px] text-[8.5px] font-semibold text-[#66738b]">
                  <HelpCircle className="h-[12px] w-[12px] text-[#4d8b69]" />
                  Click "Edit Page" on any menu item to go directly to its Admin CMS Edit Page!
                </div>

                <div className="mt-[8px] space-y-[4px]">
                  {currentStructure.map((item) => (
                    <StructureRow
                      key={item.id}
                      item={item}
                      onNavigateEdit={(url) => {
                        if (!url) return;
                        let targetRoute = "home"; // Default Home
                        const cleanUrl = url.toLowerCase().trim();

                        if (cleanUrl === "/" || cleanUrl === "home") targetRoute = "home";
                        else if (cleanUrl.includes("about")) targetRoute = "about-us";
                        else if (cleanUrl.includes("advisory")) targetRoute = "advisory-board";
                        else if (cleanUrl.includes("blog")) targetRoute = "blogs-and-news";
                        else if (cleanUrl.includes("why-visit")) targetRoute = "why-visit";
                        else if (cleanUrl.includes("why-exhibit")) targetRoute = "why-exhibit";
                        else if (cleanUrl.includes("msme")) targetRoute = "msme-pms-scheme";
                        else if (cleanUrl.includes("exhibitor")) targetRoute = "exhibitors-list";
                        else if (cleanUrl.includes("buyer-seller")) targetRoute = "buyer-seller-meet";
                        else if (cleanUrl.includes("gallery")) targetRoute = "glimpses-and-gallery";
                        else if (cleanUrl.includes("service")) targetRoute = "our-services";
                        else if (cleanUrl.includes("contact")) targetRoute = "contact-us";

                        router.push(`/pages/${targetRoute}/edit`);
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-[10px] space-y-[8px]">
                <div className="rounded-[6px] border border-[#e3e7ea] bg-[#fafcfa] p-[10px]">
                  <p className="text-[9px] font-semibold text-[#293854]">
                    Selected Menu
                  </p>
                  <p className="mt-[3px] text-[8.5px] font-semibold text-[#68758d]">
                    {selectedMenu.name} · {selectedMenu.location}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-[8px]">
                  <div className="rounded-[6px] border border-[#e3e7ea] bg-white p-[10px]">
                    <p className="text-[8.5px] font-semibold text-[#33415e]">Status</p>
                    <p className="mt-[3px] text-[9.5px] font-semibold text-emerald-700">
                      {selectedMenu.status}
                    </p>
                  </div>

                  <div className="rounded-[6px] border border-[#e3e7ea] bg-white p-[10px]">
                    <p className="text-[8.5px] font-semibold text-[#33415e]">Menu Items</p>
                    <p className="mt-[3px] text-[9.5px] font-semibold text-[#17234a]">
                      {selectedMenu.items}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </section>

        {/* BOTTOM HELP STRIP */}
        <section className="mt-[10px] grid gap-[10px] rounded-[8px] border border-[#dfe9e2] bg-[linear-gradient(90deg,#f1f8f4_0%,#f8fbf9_100%)] p-[10px] xl:grid-cols-[1.35fr_0.85fr_0.85fr]">
          <div className="flex items-start gap-[10px] px-[6px] py-[4px]">
            <Lightbulb className="mt-[2px] h-[20px] w-[20px] shrink-0 text-[#246b47]" />

            <div>
              <h3 className="text-[11.5px] font-semibold text-[#285039]">
                Bharat Organic Expo Menu Structure Tips
              </h3>

              <div className="mt-[6px] space-y-[4px]">
                {[
                  "Primary Header Menu supports Parent & Child dropdown items for About Us, Participate & Opportunities.",
                  "Registration Action Menu links directly to Book Stall, Visitor, Delegate & Buyer registration pages.",
                  "Mobile Drawer Navigation mirrors all website links for seamless mobile device navigation.",
                ].map((tip) => (
                  <div key={tip} className="flex items-center gap-[6px]">
                    <CheckCircle2 className="h-[11px] w-[11px] shrink-0 text-[#2b8154]" />
                    <span className="text-[8.5px] font-semibold text-[#53627a]">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-[10px] rounded-[6px] bg-white/70 px-[12px] py-[10px]">
            <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-violet-50 text-violet-700">
              <HelpCircle className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 overflow-hidden">
              <p className="text-[10px] font-semibold text-[#1f2d52]">Need Navigation Help?</p>
              <p className="mt-[2px] text-[8.5px] font-semibold text-[#68758d]">
                Configure header, footer & mobile links.
              </p>

              <button className="mt-[6px] inline-flex h-[26px] items-center gap-[5px] rounded-[4px] border border-[#dfe4e8] bg-white px-[8px] text-[8px] font-semibold text-[#35445f]">
                View Documentation
                <ExternalLink className="h-[9px] w-[9px]" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-[10px] rounded-[6px] bg-white/70 px-[12px] py-[10px]">
            <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-amber-50 text-amber-700">
              <Video className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0 overflow-hidden">
              <p className="text-[10px] font-semibold text-[#1f2d52]">Video Tutorial</p>
              <p className="mt-[2px] text-[8.5px] font-semibold text-[#68758d]">
                Watch step-by-step guide.
              </p>

              <button className="mt-[6px] inline-flex h-[26px] items-center gap-[5px] rounded-[4px] border border-[#dfe4e8] bg-white px-[8px] text-[8px] font-semibold text-[#35445f]">
                Watch Tutorial
                <ExternalLink className="h-[9px] w-[9px]" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
