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
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children?: MenuStructureItem[];
};

const MENUS: MenuRecord[] = [
  {
    id: 1,
    name: "Primary Menu",
    description: "Main website navigation header bar",
    location: "Header",
    status: "Active",
    items: 12,
    updatedDate: "30 May 2026",
    updatedTime: "10:30 AM",
  },
  {
    id: 2,
    name: "Footer Menu",
    description: "Footer quick links & compliance",
    location: "Footer",
    status: "Active",
    items: 8,
    updatedDate: "29 May 2026",
    updatedTime: "04:15 PM",
  },
  {
    id: 3,
    name: "Mobile Menu",
    description: "Mobile drawer & overlay navigation",
    location: "Mobile",
    status: "Active",
    items: 10,
    updatedDate: "30 May 2026",
    updatedTime: "09:20 AM",
  },
  {
    id: 4,
    name: "Services Mega Menu",
    description: "Services dropdown full-width menu",
    location: "Mega Menu",
    status: "Active",
    items: 7,
    updatedDate: "28 May 2026",
    updatedTime: "02:45 PM",
  },
  {
    id: 5,
    name: "Utility Menu",
    description: "Top utility contact & language bar",
    location: "Top Bar",
    status: "Inactive",
    items: 5,
    updatedDate: "20 May 2026",
    updatedTime: "11:10 AM",
  },
  {
    id: 6,
    name: "Get Involved & Volunteer Menu",
    description: "Volunteer registration & donation links",
    location: "Header Dropdown",
    status: "Active",
    items: 6,
    updatedDate: "27 May 2026",
    updatedTime: "01:15 PM",
  },
  {
    id: 7,
    name: "Legal & Policy Footer Links",
    description: "Privacy, terms, and refund policy list",
    location: "Footer Bottom",
    status: "Active",
    items: 4,
    updatedDate: "25 May 2026",
    updatedTime: "06:40 PM",
  },
  {
    id: 8,
    name: "Media & Awareness Links",
    description: "Blogs, news, and press coverage items",
    location: "Mega Menu",
    status: "Active",
    items: 6,
    updatedDate: "24 May 2026",
    updatedTime: "11:05 AM",
  },
  {
    id: 9,
    name: "Emergency Sewa Help Menu",
    description: "Quick helpline & helpline numbers bar",
    location: "Top Bar",
    status: "Active",
    items: 3,
    updatedDate: "22 May 2026",
    updatedTime: "08:50 AM",
  },
];

const STRUCTURE: MenuStructureItem[] = [
  { id: "home", label: "Home", type: "Custom Link", icon: Home },
  {
    id: "about",
    label: "About Us",
    type: "Page",
    icon: FolderClosed,
    children: [
      { id: "mission", label: "Our Mission", type: "Page", icon: FileText },
      { id: "vision", label: "Our Vision", type: "Page", icon: FileText },
    ],
  },
  { id: "services", label: "Our Services", type: "Mega Menu", icon: FolderClosed },
  { id: "help", label: "Who We Help", type: "Page", icon: Heart },
  { id: "works", label: "How It Works", type: "Page", icon: Settings },
  { id: "involved", label: "Get Involved", type: "Mega Menu", icon: UsersRound },
  { id: "contact", label: "Contact Us", type: "Page", icon: Menu },
  { id: "helpline", label: "Emergency Sewa Support", type: "Custom Link", icon: HelpCircle },
  { id: "donate", label: "Donate & Support Journey", type: "Page", icon: Heart },
  { id: "blog", label: "Blogs & Awareness", type: "Category", icon: FileText },
];

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
}: {
  item: MenuStructureItem;
  nested?: boolean;
}) {
  const Icon = item.icon;

  return (
    <div className={nested ? "ml-[24px] border-l border-dashed border-[#b8c5d6] pl-[10px]" : ""}>
      <div className="flex min-h-[34px] items-center gap-[8px] rounded-[5px] border border-[#e4e8eb] bg-white px-[10px]">
        <Icon className="h-[13px] w-[13px] shrink-0 text-[#4d8b69]" strokeWidth={1.8} />

        <span className="min-w-0 flex-1 truncate text-[9px] font-semibold text-[#32405d]">
          {item.label}
        </span>

        <span className="shrink-0 text-[8px] font-semibold text-[#68758d]">
          {item.type}
        </span>

        <ChevronDown className="h-[11px] w-[11px] shrink-0 text-[#657188]" />
      </div>

      {item.children?.length ? (
        <div className="mt-[4px] space-y-[4px]">
          {item.children.map((child) => (
            <StructureRow key={child.id} item={child} nested />
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
  const [selectedPreview, setSelectedPreview] = useState("Primary Menu");
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
              className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[16px] text-[10px] font-semibold text-white shadow-[0_4px_10px_rgba(5,94,49,.12)] transition hover:opacity-95"
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
            note="All navigation menus"
          />

          <MetricCard
            icon={<Monitor className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Active Menus"
            value={MENUS.filter((m) => m.status === "Active").length.toString()}
            note="Currently live on website"
          />

          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Inactive Menus"
            value={MENUS.filter((m) => m.status === "Inactive").length.toString()}
            note="Not displayed on website"
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
                            setSelectedPreview(item.name);
                          }}
                          className={`h-[52px] cursor-pointer border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/60 ${selectedMenuId === item.id ? "bg-[#fbfefc]" : ""
                            }`}
                        >
                          <td className="px-[8px] text-center">
                            <GripVertical className="mx-auto h-[13px] w-[13px] text-[#8a95a8]" />
                          </td>

                          <td className="px-[8px]">
                            <div className="min-w-[160px]">
                              <p className="text-[10px] font-semibold text-[#19274a]">
                                {item.name}
                              </p>
                              <p className="mt-[2px] text-[8.5px] font-semibold text-[#68758d]">
                                {item.description}
                              </p>
                            </div>
                          </td>

                          <td className="px-[8px]">
                            <span className="inline-flex rounded-[4px] border border-[#dce1e6] bg-white px-[7px] py-[2.5px] text-[8px] font-semibold text-[#4f5c73]">
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
              <h2 className="text-[12px] font-semibold text-[#19274a]">
                Menu Preview
              </h2>

              <select
                value={selectedPreview}
                onChange={(event) => setSelectedPreview(event.target.value)}
                className="h-[32px] min-w-[160px] rounded-[5px] border border-[#dfe4e8] bg-white px-[10px] text-[9px] font-semibold text-[#35445f] outline-none"
              >
                {MENUS.map((item) => (
                  <option key={item.id}>{item.name}</option>
                ))}
              </select>
            </div>

            <div className="mt-[8px] overflow-x-auto rounded-[5px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[12px]">
              <div className="flex h-[32px] min-w-[540px] items-center justify-between gap-[10px] text-white">
                {[
                  "Home",
                  "About Us",
                  "Our Services",
                  "Who We Help",
                  "How It Works",
                  "Get Involved",
                  "Contact Us",
                ].map((item, index) => (
                  <span
                    key={item}
                    className="flex shrink-0 items-center gap-[3px] text-[8px] font-semibold"
                  >
                    {item}
                    {[1, 2, 5].includes(index) ? (
                      <ChevronDown className="h-[9px] w-[9px]" />
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
                  Drag and drop items to reorder. Click on an item to edit.
                </div>

                <div className="mt-[8px] space-y-[4px]">
                  {STRUCTURE.map((item) => (
                    <StructureRow key={item.id} item={item} />
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
                Quick Tips
              </h3>

              <div className="mt-[6px] space-y-[4px]">
                {[
                  "Keep your primary menu simple and user-friendly.",
                  "Use mega menus for large dropdowns like Services.",
                  "Mobile menu is used on all mobile devices.",
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
              <p className="text-[10px] font-semibold text-[#1f2d52]">Need Help?</p>
              <p className="mt-[2px] text-[8.5px] font-semibold text-[#68758d]">
                Learn how to create and manage menus.
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
