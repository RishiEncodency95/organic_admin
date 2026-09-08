"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  FileText,
  Filter,
  FolderClosed,
  Heart,
  Image as ImageIcon,
  Megaphone,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";

type CategoryStatus = "Published" | "Hidden";

type Category = {
  id: number;
  name: string;
  slug: string;
  description: string;
  totalPosts: number;
  status: CategoryStatus;
  order: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const categories: Category[] = [
  {
    id: 1,
    name: "Moksha Sewa Stories",
    slug: "moksha-sewa-stories",
    description: "Real stories of dignity, compassion and humanity from our sewa journey.",
    totalPosts: 18,
    status: "Published",
    order: 1,
    icon: Heart,
  },
  {
    id: 2,
    name: "Awareness",
    slug: "awareness",
    description: "Articles and resources to spread awareness about final journey dignity.",
    totalPosts: 16,
    status: "Published",
    order: 2,
    icon: Bell,
  },
  {
    id: 3,
    name: "Guidance",
    slug: "guidance",
    description: "Helpful guides for families during difficult times.",
    totalPosts: 12,
    status: "Published",
    order: 3,
    icon: BookOpen,
  },
  {
    id: 4,
    name: "Rituals & Traditions",
    slug: "rituals-traditions",
    description: "Information about rituals, last rites and cultural traditions.",
    totalPosts: 10,
    status: "Published",
    order: 4,
    icon: Heart,
  },
  {
    id: 5,
    name: "Volunteer Stories",
    slug: "volunteer-stories",
    description: "Inspiring stories from our volunteers and sewa partners.",
    totalPosts: 8,
    status: "Published",
    order: 5,
    icon: UsersRound,
  },
  {
    id: 6,
    name: "Campaigns",
    slug: "campaigns",
    description: "Updates and highlights of our awareness campaigns and initiatives.",
    totalPosts: 9,
    status: "Published",
    order: 6,
    icon: Megaphone,
  },
  {
    id: 7,
    name: "News & Updates",
    slug: "news-updates",
    description: "Latest news, announcements and organizational updates.",
    totalPosts: 7,
    status: "Hidden",
    order: 7,
    icon: FileText,
  },
  {
    id: 8,
    name: "Events",
    slug: "events",
    description: "Information about events, programmes and community gatherings.",
    totalPosts: 6,
    status: "Hidden",
    order: 8,
    icon: ImageIcon,
  },
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

      <div className="min-w-0">
        <p className="text-[9.5px] font-extrabold text-[#34435e]">{label}</p>
        <div className="mt-[2px] flex items-baseline gap-[6px]">
          <span className="text-[17px] font-extrabold leading-none tracking-[-0.03em] text-[#10204a]">
            {value}
          </span>
          <span className="truncate text-[9px] font-semibold text-[#66738b]">{note}</span>
        </div>
      </div>
    </article>
  );
}

export default function ManageCategoriesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState("Sort By: Newest");

  const filteredCategories = useMemo(() => {
    let list = categories.filter((item) => {
      const searchMatch =
        !query ||
        `${item.name} ${item.slug} ${item.description}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const statusMatch =
        statusFilter === "All Status" || item.status === statusFilter;

      return searchMatch && statusMatch;
    });

    if (sort === "Sort By: Name A-Z") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    if (sort === "Sort By: Oldest") {
      list = [...list].sort((a, b) => b.order - a.order);
    }

    return list;
  }, [query, statusFilter, sort]);

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
            <h1 className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-[#075b33]">
              Manage Categories
            </h1>

            <nav className="mt-[4px] flex items-center gap-[6px] text-[10px] font-semibold text-[#1d2b58]">
              <span
                onClick={() => router.push("/")}
                className="cursor-pointer transition hover:text-[#075b33]"
              >
                Dashboard
              </span>
              <span className="text-[#7b8597]">›</span>
              <span
                onClick={() => router.push("/blogs")}
                className="cursor-pointer transition hover:text-[#075b33]"
              >
                Blog &amp; Awareness
              </span>
              <span className="text-[#7b8597]">›</span>
              <span className="text-[#075b33]">Manage Categories</span>
            </nav>
          </div>

          <button
            type="button"
            onClick={() => router.push("/blogs/categories/new")}
            className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[16px] text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(5,94,49,.12)] transition hover:opacity-95"
          >
            <Plus className="h-[14px] w-[14px]" />
            Add New Category
          </button>
        </header>

        {/* STATS */}
        <section className="mt-[10px] grid grid-cols-4 gap-[10px]">
          <MetricCard
            icon={<FolderClosed className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Categories"
            value="12"
            note="All Blog &amp; Awareness Categories"
          />

          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Published"
            value="10"
            note="Visible on website"
          />

          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Hidden"
            value="2"
            note="Not visible on website"
          />

          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-blue-50 text-blue-700"
            label="Total Posts"
            value="86"
            note="Across all categories"
          />
        </section>

        {/* TABLE CARD */}
        <section className="mt-[16px] rounded-[10px] border border-[#e7e9ec] bg-white p-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
          {/* FILTER BAR */}
          <div className="grid grid-cols-[minmax(280px,1fr)_170px_42px_minmax(20px,1fr)_205px] items-center gap-[10px]">
            <label className="relative">
              <Search className="absolute left-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#5d6b84]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories..."
                className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[40px] pr-[12px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-[40px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-bold text-[#2a3855] outline-none"
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Hidden</option>
            </select>

            <button
              type="button"
              className="grid h-[40px] w-[40px] place-items-center rounded-[6px] border border-[#dfe4e8] bg-white text-[#44516a]"
            >
              <Filter className="h-[14px] w-[14px]" />
            </button>

            <div />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="h-[40px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-bold text-[#35445f] outline-none"
            >
              <option>Sort By: Newest</option>
              <option>Sort By: Oldest</option>
              <option>Sort By: Name A-Z</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="mt-[10px] overflow-hidden rounded-[7px] border border-[#eceff1]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <thead>
                  <tr className="h-[40px] border-b border-[#edf0f2] bg-[#fafbfc] text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#44516a]">
                    <th className="w-[42px] px-[12px]"></th>
                    <th className="px-[12px]">Category</th>
                    <th className="px-[12px]">Description</th>
                    <th className="px-[12px] text-center">Total Posts</th>
                    <th className="px-[12px] text-center">Status</th>
                    <th className="px-[12px] text-center">Order</th>
                    <th className="px-[12px] text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.map((item) => {
                    const Icon = item.icon;

                    return (
                      <tr
                        key={item.id}
                        className="h-[64px] border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/50"
                      >
                        <td className="px-[12px] text-center">
                          <MoreVertical className="mx-auto h-[14px] w-[14px] text-[#8a95a8]" />
                        </td>

                        <td className="px-[12px]">
                          <div className="flex min-w-[250px] items-center gap-[14px]">
                            <div className="grid h-[44px] w-[44px] shrink-0 place-items-center rounded-full bg-[#eef7f1] text-[#147044]">
                              <Icon className="h-[21px] w-[21px]" strokeWidth={1.7} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold text-[#19274a]">
                                {item.name}
                              </p>
                              <p className="mt-[5px] text-[9px] font-semibold text-[#68758d]">
                                {item.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-[12px]">
                          <p className="max-w-[390px] text-[10.5px] font-semibold leading-[1.55] text-[#55627a]">
                            {item.description}
                          </p>
                        </td>

                        <td className="px-[12px] text-center">
                          <span className="text-[10px] font-extrabold text-[#2563eb]">
                            {item.totalPosts}
                          </span>
                        </td>

                        <td className="px-[12px] text-center">
                          <span
                            className={`inline-flex rounded-[5px] border px-[10px] py-[5px] text-[9px] font-bold ${item.status === "Published"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-[12px] text-center">
                          <span className="text-[10px] font-bold text-[#34425e]">
                            {item.order}
                          </span>
                        </td>

                        <td className="px-[12px]">
                          <div className="flex items-center justify-center gap-[18px]">
                            <button
                              type="button"
                              className="text-[#263650] transition hover:text-[#075b33]"
                              aria-label={`Edit ${item.name}`}
                            >
                              <Pencil className="h-[16px] w-[16px]" />
                            </button>

                            <button
                              type="button"
                              className="text-[#d74a40] transition hover:text-red-700"
                              aria-label={`Delete ${item.name}`}
                            >
                              <Trash2 className="h-[16px] w-[16px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex min-h-[56px] items-center justify-between gap-[14px] border-t border-[#edf0f2] px-[12px]">
              <p className="text-[9.5px] font-semibold text-[#47546c]">
                Showing 1 to {filteredCategories.length} of 12 categories
              </p>

              <div className="flex items-center gap-[10px]">
                <div className="flex items-center gap-[6px]">
                  <button className="grid h-[34px] w-[34px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white">
                    <ChevronLeft className="h-[13px] w-[13px]" />
                  </button>

                  <button className="grid h-[34px] min-w-[34px] place-items-center rounded-[5px] bg-[#075b33] px-[6px] text-[9px] font-bold text-white">
                    1
                  </button>

                  <button className="grid h-[34px] min-w-[34px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white px-[6px] text-[9px] font-bold text-[#35445f]">
                    2
                  </button>

                  <button className="grid h-[34px] w-[34px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white">
                    <ChevronRight className="h-[13px] w-[13px]" />
                  </button>
                </div>

                <select className="h-[34px] rounded-[5px] border border-[#dfe3e7] bg-white px-[10px] text-[9px] font-bold text-[#35445f]">
                  <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
