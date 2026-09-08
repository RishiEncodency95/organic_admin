"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock3,
  Eye,
  EyeOff,
  Filter,
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Star,
  Tag,
} from "lucide-react";

type TestimonialStatus = "Published" | "Pending Review" | "Hidden";
type TestimonialCategory =
  | "Family Member"
  | "Beneficiary Family"
  | "Volunteer"
  | "Community Partner"
  | "Donor";

type Testimonial = {
  id: number;
  name: string;
  role: string;
  message: string;
  category: TestimonialCategory;
  rating: number;
  status: TestimonialStatus;
  date: string;
  author: string;
  avatar: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Dr. Meera Sharma",
    role: "Family Member",
    message:
      "Moksha Sewa stands as a beacon of compassion. Their support during a difficult time was invaluable.",
    category: "Family Member",
    rating: 5,
    status: "Published",
    date: "30 May 2026",
    author: "Admin User",
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    id: 2,
    name: "Ramesh Patel",
    role: "Beneficiary Family",
    message:
      "A truly selfless initiative. The team handled everything with respect and dignity.",
    category: "Beneficiary Family",
    rating: 5,
    status: "Published",
    date: "29 May 2026",
    author: "Seva Team",
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: 3,
    name: "Vikram Singh",
    role: "Volunteer",
    message:
      "The volunteers are very supportive and responsive. Highly appreciate their dedication.",
    category: "Volunteer",
    rating: 4.5,
    status: "Published",
    date: "28 May 2026",
    author: "Admin User",
    avatar: "https://i.pravatar.cc/100?img=14",
  },
  {
    id: 4,
    name: "Anjali Jain",
    role: "Family Member",
    message:
      "Thank you for giving my father a dignified farewell. We are forever grateful.",
    category: "Family Member",
    rating: 5,
    status: "Published",
    date: "27 May 2026",
    author: "Seva Team",
    avatar: "https://i.pravatar.cc/100?img=32",
  },
  {
    id: 5,
    name: "Dr. Arvind Kumar",
    role: "Community Partner",
    message:
      "Moksha Sewa is setting an example of humanity. Keep up the amazing work!",
    category: "Community Partner",
    rating: 4.5,
    status: "Pending Review",
    date: "26 May 2026",
    author: "Admin User",
    avatar: "https://i.pravatar.cc/100?img=53",
  },
  {
    id: 6,
    name: "Neha Agarwal",
    role: "Donor",
    message:
      "Professional, compassionate and trustworthy. This initiative is truly needed in our society.",
    category: "Donor",
    rating: 4,
    status: "Pending Review",
    date: "25 May 2026",
    author: "Seva Team",
    avatar: "https://i.pravatar.cc/100?img=45",
  },
  {
    id: 7,
    name: "Suresh Gupta",
    role: "Beneficiary Family",
    message:
      "Their help came at the right moment when we had no one to turn to.",
    category: "Beneficiary Family",
    rating: 5,
    status: "Published",
    date: "24 May 2026",
    author: "Admin User",
    avatar: "https://i.pravatar.cc/100?img=11",
  },
  {
    id: 8,
    name: "Pooja Verma",
    role: "Volunteer",
    message:
      "Grateful to the entire team for their timely support and kindness.",
    category: "Volunteer",
    rating: 4.5,
    status: "Hidden",
    date: "23 May 2026",
    author: "Admin User",
    avatar: "https://i.pravatar.cc/100?img=44",
  },
];

const categoryStyle: Record<TestimonialCategory, string> = {
  "Family Member": "bg-emerald-50 text-emerald-700",
  "Beneficiary Family": "bg-blue-50 text-blue-700",
  Volunteer: "bg-violet-50 text-violet-700",
  "Community Partner": "bg-orange-50 text-orange-700",
  Donor: "bg-rose-50 text-rose-700",
};

const statusStyle: Record<TestimonialStatus, string> = {
  Published: "bg-emerald-50 text-emerald-700",
  "Pending Review": "bg-amber-50 text-amber-700",
  Hidden: "bg-slate-100 text-slate-600",
};

const categoryData = [
  { label: "Family Member", value: 22, percent: "39.3%", color: "#0f766e" },
  { label: "Beneficiary Family", value: 14, percent: "25.0%", color: "#f59e0b" },
  { label: "Volunteer", value: 8, percent: "14.3%", color: "#7c3aed" },
  { label: "Community Partner", value: 6, percent: "10.7%", color: "#2563eb" },
  { label: "Donor", value: 6, percent: "10.7%", color: "#fb7185" },
];

const ratingData = [
  { label: "5 Stars", stars: 5, count: 32, percent: "57.1%", width: "70%" },
  { label: "4 Stars", stars: 4, count: 16, percent: "28.6%", width: "44%" },
  { label: "3 Stars", stars: 3, count: 5, percent: "8.9%", width: "17%" },
  { label: "2 Stars", stars: 2, count: 2, percent: "3.6%", width: "8%" },
  { label: "1 Star", stars: 1, count: 1, percent: "1.8%", width: "4%" },
];

function RatingStars({ value, size = 12 }: { value: number; size?: number }) {
  const rounded = Math.round(value);

  return (
    <div className="flex items-center gap-[2px]">
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={size}
          strokeWidth={1.6}
          className={
            index < rounded
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-200 text-slate-300"
          }
        />
      ))}
    </div>
  );
}

function MetricCard({
  icon,
  iconClass,
  label,
  value,
  note,
  stars,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  note: string;
  stars?: boolean;
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
          {stars ? (
            <RatingStars value={5} size={11} />
          ) : (
            <span className="truncate text-[8.5px] font-semibold text-[#66738b]">
              {note}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TestimonialsManagementPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All Status");
  const [category, setCategory] = useState("All Categories");
  const [rating, setRating] = useState("All Ratings");

  const rows = useMemo(() => {
    return TESTIMONIALS.filter((item) => {
      const searchMatch =
        !query ||
        `${item.name} ${item.role} ${item.message}`
          .toLowerCase()
          .includes(query.toLowerCase());

      const statusMatch = status === "All Status" || item.status === status;
      const categoryMatch =
        category === "All Categories" || item.category === category;

      const ratingMatch =
        rating === "All Ratings" ||
        Math.round(item.rating) === Number(rating.replace(" Stars", ""));

      return searchMatch && statusMatch && categoryMatch && ratingMatch;
    });
  }, [query, status, category, rating]);

  const clearFilters = () => {
    setQuery("");
    setStatus("All Status");
    setCategory("All Categories");
    setRating("All Ratings");
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
              Testimonials Management
            </h1>

            <nav className="mt-[9px] flex items-center gap-[8px] text-[10.5px] font-semibold text-[#1d2b58]">
              <span>Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span>Testimonials Management</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px]">
            <button
              type="button"
              onClick={() => router.push("/testimonials/new")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <Plus className="h-[15px] w-[15px]" />
              Add New Testimonial
            </button>

            <button
              type="button"
              onClick={() => router.push("/testimonials/settings")}
              className="inline-flex h-[40px] items-center gap-[8px] rounded-[6px] border border-[#dfe3e7] bg-white px-[18px] text-[10.5px] font-semibold text-[#273655] transition hover:bg-slate-50"
            >
              <Settings className="h-[15px] w-[15px]" />
              Testimonial Settings
            </button>
          </div>
        </header>

        {/* TOP STATS */}
        <section className="mt-[18px] grid grid-cols-5 gap-[14px]">
          <MetricCard
            icon={<MessageCircleMore className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Testimonials"
            value="56"
            note="Published: 48"
          />

          <MetricCard
            icon={<Star className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-violet-50 text-violet-600"
            label="Published"
            value="48"
            note="85.7% of total"
          />

          <MetricCard
            icon={<Clock3 className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-orange-50 text-orange-500"
            label="Pending Review"
            value="5"
            note="8.9% of total"
          />

          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-blue-50 text-blue-600"
            label="Hidden"
            value="3"
            note="5.4% of total"
          />

          <MetricCard
            icon={<Star className="h-[16px] w-[16px]" strokeWidth={1.8} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Average Rating"
            value="4.8 / 5"
            note=""
            stars
          />
        </section>

        {/* MAIN GRID */}
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
                  placeholder="Search testimonials by name, role or keyword..."
                  className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white px-[14px] pr-[40px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
                />
              </label>

              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-[40px] min-w-[115px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Status</option>
                <option>Published</option>
                <option>Pending Review</option>
                <option>Hidden</option>
              </select>

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="h-[40px] min-w-[125px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Categories</option>
                <option>Family Member</option>
                <option>Beneficiary Family</option>
                <option>Volunteer</option>
                <option>Community Partner</option>
                <option>Donor</option>
              </select>

              <select
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                className="h-[40px] min-w-[110px] rounded-[6px] border border-[#dfe4e8] bg-white px-[10px] text-[10px] font-semibold text-[#2a3855] outline-none"
              >
                <option>All Ratings</option>
                <option>5 Stars</option>
                <option>4 Stars</option>
                <option>3 Stars</option>
                <option>2 Stars</option>
                <option>1 Star</option>
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
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead>
                    <tr className="h-[42px] border-b border-[#e7e9ec] bg-[#fafbfc] text-[8.5px] font-semibold uppercase tracking-[0.04em] text-[#44516a]">
                      <th className="w-[42px] px-[12px] text-center">
                        <input type="checkbox" />
                      </th>
                      <th className="px-[8px]">Testimonial</th>
                      <th className="px-[8px]">Category</th>
                      <th className="px-[8px]">Rating</th>
                      <th className="px-[8px]">Status</th>
                      <th className="px-[8px]">Added On</th>
                      <th className="px-[8px] text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((item) => (
                      <tr
                        key={item.id}
                        className="h-[70px] border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/60"
                      >
                        <td className="px-[12px] text-center">
                          <input type="checkbox" />
                        </td>

                        <td className="px-[8px]">
                          <div className="flex min-w-[300px] items-center gap-[12px]">
                            <img
                              src={item.avatar}
                              alt=""
                              className="h-[44px] w-[44px] shrink-0 rounded-full border border-[#e0e4e8] object-cover"
                            />

                            <div className="min-w-0 overflow-hidden">
                              <p className="text-[10.5px] font-semibold text-[#19274a]">
                                {item.name}
                              </p>
                              <p className="mt-[4px] max-w-[335px] text-[8.8px] font-semibold leading-[1.4] text-[#53627c]">
                                {item.message}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-[8px]">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-[5px] px-[8px] py-[4px] text-[8px] font-semibold ${categoryStyle[item.category]}`}
                          >
                            {item.category}
                          </span>
                        </td>

                        <td className="px-[8px]">
                          <div className="flex items-center gap-[8px] whitespace-nowrap">
                            <RatingStars value={item.rating} />
                            <span className="text-[9px] font-semibold text-[#33425c]">
                              {item.rating.toFixed(1)}
                            </span>
                          </div>
                        </td>

                        <td className="px-[8px]">
                          <span
                            className={`inline-flex items-center gap-[5px] whitespace-nowrap rounded-[5px] px-[8px] py-[4px] text-[8px] font-semibold ${statusStyle[item.status]}`}
                          >
                            <span
                              className={`h-[5px] w-[5px] rounded-full ${item.status === "Published"
                                ? "bg-emerald-500"
                                : item.status === "Pending Review"
                                  ? "bg-amber-500"
                                  : "bg-slate-400"
                                }`}
                            />
                            {item.status}
                          </span>
                        </td>

                        <td className="px-[8px]">
                          <p className="whitespace-nowrap text-[9px] font-semibold text-[#2c3a58]">
                            {item.date}
                          </p>
                          <p className="mt-[4px] whitespace-nowrap text-[8px] font-semibold text-[#68758d]">
                            By {item.author}
                          </p>
                        </td>

                        <td className="px-[8px]">
                          <div className="flex items-center justify-center gap-[8px]">
                            <button
                              type="button"
                              onClick={() => router.push("/testimonials/new")}
                              className="grid h-[30px] w-[30px] place-items-center rounded-[5px] border border-[#e1e5e9] bg-white text-[#4b5871] hover:bg-slate-50"
                            >
                              <Eye className="h-[12px] w-[12px]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => router.push("/testimonials/new")}
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="flex min-h-[58px] items-center justify-between gap-[12px] border-t border-[#e7e9ec] px-[12px]">
                <p className="text-[9px] font-semibold text-[#47546c]">
                  Showing 1 to {rows.length} of 56 testimonials
                </p>

                <div className="flex items-center gap-[6px]">
                  <button type="button" className="grid h-[32px] w-[32px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white">
                    <ChevronLeft className="h-[13px] w-[13px]" />
                  </button>

                  {[1, 2, 3, 4, 5, 6].map((page) => (
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
            {/* CATEGORY */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[12px] font-semibold text-[#19274a]">
                Testimonials by Category
              </h2>

              <div className="mt-[12px] flex items-center gap-[15px]">
                <div
                  className="grid h-[110px] w-[110px] shrink-0 place-items-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(#0f766e 0 39.3%, #f59e0b 39.3% 64.3%, #7c3aed 64.3% 78.6%, #2563eb 78.6% 89.3%, #fb7185 89.3% 100%)",
                  }}
                >
                  <div className="grid h-[70px] w-[70px] place-items-center rounded-full bg-white text-center">
                    <div>
                      <p className="text-[18px] font-semibold leading-none text-[#10204a]">56</p>
                      <p className="mt-[4px] text-[8px] font-semibold text-[#61708c]">Total</p>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-[7px]">
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
                        {item.value} ({item.percent})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* RATING */}
            <section className="rounded-[8px] border border-[#e7e9ec] bg-white px-[14px] py-[13px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <h2 className="text-[12px] font-semibold text-[#19274a]">
                Rating Distribution
              </h2>

              <div className="mt-[12px] space-y-[10px]">
                {ratingData.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[40px_70px_1fr_58px] items-center gap-[6px]"
                  >
                    <span className="text-[8.5px] font-semibold text-[#47546b]">
                      {item.label}
                    </span>

                    <RatingStars value={item.stars} size={9} />

                    <div className="h-[6px] overflow-hidden rounded-full bg-[#edf0f2]">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{ width: item.width }}
                      />
                    </div>

                    <span className="text-right text-[8.3px] font-semibold text-[#4b5870]">
                      {item.count} ({item.percent})
                    </span>
                  </div>
                ))}
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
                  onClick={() => router.push("/testimonials/new")}
                  className="flex h-[36px] w-full items-center gap-[9px] rounded-[5px] border border-[#e2e6ea] bg-white px-[10px] text-[9px] font-semibold text-[#293854] transition hover:bg-slate-50"
                >
                  <Plus className="h-[13px] w-[13px]" />
                  Add New Testimonial
                </button>

                <button
                  type="button"
                  className="flex h-[36px] w-full items-center gap-[9px] rounded-[5px] border border-[#e2e6ea] bg-white px-[10px] text-[9px] font-semibold text-[#293854] transition hover:bg-slate-50"
                >
                  <Clock3 className="h-[13px] w-[13px]" />
                  Review Pending (5)
                </button>

                <button
                  type="button"
                  className="flex h-[36px] w-full items-center gap-[9px] rounded-[5px] border border-[#e2e6ea] bg-white px-[10px] text-[9px] font-semibold text-[#293854] transition hover:bg-slate-50"
                >
                  <Tag className="h-[13px] w-[13px]" />
                  Manage Categories
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/testimonials/settings")}
                  className="flex h-[36px] w-full items-center gap-[9px] rounded-[5px] border border-[#e2e6ea] bg-white px-[10px] text-[9px] font-semibold text-[#293854] transition hover:bg-slate-50"
                >
                  <Settings className="h-[13px] w-[13px]" />
                  Testimonial Settings
                </button>
              </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden rounded-[8px] bg-[linear-gradient(135deg,#08643a_0%,#07542f_100%)] px-[18px] py-[18px] text-white shadow-[0_7px_18px_rgba(5,94,49,.12)]">
              <div className="relative z-10 max-w-[205px]">
                <p className="text-[12px] font-semibold leading-[1.4]">
                  Real stories. Real impact.
                </p>
                <p className="mt-[9px] text-[10px] font-semibold leading-[1.55] text-white/90">
                  Share the voices that inspire trust and compassion.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/testimonials/new")}
                  className="mt-[16px] inline-flex h-[36px] items-center gap-[8px] rounded-[5px] bg-white px-[14px] text-[9px] font-semibold text-[#075b33] transition hover:bg-slate-100"
                >
                  Add New Testimonial
                  <ChevronRight className="h-[12px] w-[12px]" />
                </button>
              </div>

              <MessageCircleMore className="absolute bottom-[-16px] right-[8px] h-[92px] w-[92px] text-emerald-200/25" strokeWidth={1.2} />
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
