"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ManageBlogCategoriesView from "@/components/blogs/ManageBlogCategoriesView";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Eye,
  FileText,
  FolderClosed,
  Info,
  Megaphone,
  MessageCircleMore,
  MoreVertical,
  Pencil,
  Plus,
  Share2,
  Tag,
} from "lucide-react";

type PostStatus = "Published" | "Draft";
type PostCategory = "Moksha Sewa" | "Stories" | "Awareness" | "Guidance";

type BlogPost = {
  id: number;
  title: string;
  category: PostCategory;
  status: PostStatus;
  views: number | null;
  date: string | null;
  image: string;
};

const POSTS: BlogPost[] = [
  {
    id: 1,
    title: "Why Dignified Final Rites Matter for Every Human",
    category: "Moksha Sewa",
    status: "Published",
    views: 1245,
    date: "28 May 2026",
    image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=220&q=80",
  },
  {
    id: 2,
    title: "How Our Volunteers Bring Hope to Families in Need",
    category: "Stories",
    status: "Published",
    views: 980,
    date: "26 May 2026",
    image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=220&q=80",
  },
  {
    id: 3,
    title: "The Spiritual Significance of Last Rites in Hindu Tradition",
    category: "Awareness",
    status: "Published",
    views: 1560,
    date: "24 May 2026",
    image: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=220&q=80",
  },
  {
    id: 4,
    title: "Supporting Families Beyond Cremation",
    category: "Guidance",
    status: "Draft",
    views: null,
    date: null,
    image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=220&q=80",
  },
  {
    id: 5,
    title: "Rituals After Cremation: What Families Should Know",
    category: "Awareness",
    status: "Draft",
    views: null,
    date: null,
    image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=220&q=80",
  },
];

const CAMPAIGNS = [
  { title: "Dignity for Every Soul", date: "01 May – 31 May 2026", status: "Active" },
  { title: "No One Dies Alone", date: "01 Apr – 30 Apr 2026", status: "Completed" },
  { title: "Help a Family in Their Toughest Time", date: "01 Mar – 31 Mar 2026", status: "Completed" },
  { title: "Give Dignity, Give Peace", date: "01 Feb – 28 Feb 2026", status: "Completed" },
  { title: "Winter Support Drive", date: "01 Dec – 31 Dec 2025", status: "Completed" },
];

const categoryTone: Record<PostCategory, string> = {
  "Moksha Sewa": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Stories: "bg-amber-50 text-amber-700 border-amber-200",
  Awareness: "bg-blue-50 text-blue-700 border-blue-200",
  Guidance: "bg-violet-50 text-violet-700 border-violet-200",
};

function MetricCard({
  icon,
  iconClass,
  label,
  value,
  lines,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  lines: React.ReactNode;
}) {
  return (
    <article className="flex min-h-[56px] items-center gap-[10px] rounded-[7px] border border-[#e7e9ec] bg-white px-[12px] py-[7px] shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full ${iconClass}`}>
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9.5px] font-semibold text-[#34435e]">{label}</p>
        <div className="mt-[2px] flex items-baseline gap-[6px]">
          <span className="text-[17px] font-semibold leading-none tracking-[-0.03em] text-[#10204a]">
            {value}
          </span>
          <div className="truncate text-[8.5px] font-semibold text-[#66738b]">{lines}</div>
        </div>
      </div>
    </article>
  );
}

export default function BlogAwarenessPage() {
  const router = useRouter();
  const [showCategories, setShowCategories] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const recentPosts = useMemo(() => POSTS.slice(0, 5), []);

  if (showCategories) {
    return <ManageBlogCategoriesView />;
  }

  return (
    <main
      style={{
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[18px] py-[14px] text-[#142347] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
        <header className="flex items-start justify-between gap-[16px]">
          <div>
            <h1 className="text-[28px] font-semibold leading-none tracking-[-0.03em] text-[#075b33]">
              Blog &amp; Awareness
            </h1>

            <nav className="mt-[10px] flex items-center gap-[8px] text-[11px] font-semibold text-[#1d2b58]">
              <span
                onClick={() => router.push("/")}
                className="cursor-pointer transition hover:text-[#075b33]"
              >
                Dashboard
              </span>
              <span className="text-[#7b8597]">›</span>
              <span className="text-[#075b33]">Blog &amp; Awareness</span>
            </nav>
          </div>

          <div className="flex items-center gap-[12px]">
            <Link
              href="/blogs/categories"
              onClick={(e) => {
                setShowCategories(true);
              }}
              className="inline-flex h-[42px] items-center gap-[9px] rounded-[7px] border border-[#dfe3e7] bg-white px-[20px] text-[10.5px] font-semibold text-[#273655] hover:bg-slate-50 transition"
            >
              <FolderClosed className="h-[15px] w-[15px]" />
              Manage Categories
            </Link>

            <button
              type="button"
              onClick={() => router.push("/blogs/new")}
              className="inline-flex h-[42px] items-center gap-[9px] rounded-[7px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[20px] text-[10.5px] font-semibold text-white shadow-[0_7px_16px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <Plus className="h-[15px] w-[15px]" />
              Add New Post
            </button>
          </div>
        </header>

        <section className="mt-[10px] grid grid-cols-4 gap-[10px]">
          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Posts"
            value="86"
            lines={
              <div className="flex items-center gap-[6px]">
                <span>Pub: 72</span>
                <span className="text-[#9aa4b5]">|</span>
                <span>Draft: 14</span>
              </div>
            }
          />

          <MetricCard
            icon={<Eye className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-blue-50 text-blue-700"
            label="Total Views"
            value="24,580"
            lines={<span className="font-semibold text-emerald-700">+18.6%</span>}
          />

          <MetricCard
            icon={<Megaphone className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Campaigns"
            value="12"
            lines={
              <div className="flex items-center gap-[6px]">
                <span>Active: 5</span>
                <span className="text-[#9aa4b5]">|</span>
                <span>Done: 7</span>
              </div>
            }
          />

          <MetricCard
            icon={<CalendarDays className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Scheduled Posts"
            value="8"
            lines={<span>Next: 02 Jun</span>}
          />
        </section>

        <section className="mt-[20px] grid items-start gap-[20px] xl:grid-cols-[minmax(0,1.48fr)_minmax(360px,0.98fr)]">
          <section className="overflow-hidden rounded-[10px] border border-[#e6e9ec] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
            <div className="flex h-[54px] items-center justify-between border-b border-[#edf0f2] px-[20px]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">Recent Blog Posts</h2>
              <button className="inline-flex items-center gap-[8px] text-[10px] font-semibold text-[#14683d]">
                View All Posts
                <ArrowRight className="h-[13px] w-[13px]" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="h-[42px] border-b border-[#edf0f2] text-[8.5px] font-semibold uppercase tracking-[0.04em] text-[#4a566d]">
                    <th className="px-[20px]">Title</th>
                    <th className="px-[10px]">Category</th>
                    <th className="px-[10px]">Status</th>
                    <th className="px-[10px]">Views</th>
                    <th className="px-[10px] whitespace-nowrap">Date</th>
                    <th className="px-[10px]">Action</th>
                    <th className="w-[42px] px-[10px]"></th>
                  </tr>
                </thead>

                <tbody>
                  {recentPosts.map((post) => (
                    <tr key={post.id} className="h-[64px] border-b border-[#eef0f2] last:border-b-0">
                      <td className="px-[20px]">
                        <div className="flex min-w-[285px] items-center gap-[12px]">
                          <img src={post.image} alt="" className="h-[42px] w-[66px] shrink-0 rounded-[6px] border border-[#e5e8eb] object-cover" />
                          <p className="max-w-[270px] text-[10.5px] font-semibold leading-[1.45] text-[#19274a]">{post.title}</p>
                        </div>
                      </td>

                      <td className="px-[10px]">
                        <span className={`inline-flex rounded-[5px] border px-[9px] py-[4px] text-[8px] font-semibold ${categoryTone[post.category]}`}>
                          {post.category}
                        </span>
                      </td>

                      <td className="px-[10px]">
                        <span
                          className={`inline-flex rounded-[5px] border px-[9px] py-[4px] text-[8px] font-semibold ${post.status === "Published"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                        >
                          {post.status}
                        </span>
                      </td>

                      <td className="px-[10px] text-[9.5px] font-semibold text-[#34425e]">
                        {post.views ? post.views.toLocaleString() : "—"}
                      </td>

                      <td className="px-[10px] whitespace-nowrap text-[9.5px] font-semibold text-[#34425e]">
                        {post.date ?? "—"}
                      </td>

                      <td className="px-[10px] text-center">
                        <MoreVertical className="mx-auto h-[15px] w-[15px] text-[#44516a]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button className="flex h-[50px] w-full items-center justify-center gap-[8px] border-t border-[#edf0f2] text-[10px] font-semibold text-[#14683d]">
              View all posts
              <ArrowRight className="h-[13px] w-[13px]" />
            </button>
          </section>

          <section className="overflow-hidden rounded-[10px] border border-[#e6e9ec] bg-white shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
            <div className="flex h-[54px] items-center justify-between border-b border-[#edf0f2] px-[20px]">
              <h2 className="text-[14px] font-semibold text-[#17234a]">Awareness Campaigns</h2>
              <button className="inline-flex items-center gap-[8px] text-[10px] font-semibold text-[#14683d]">
                View All
                <ArrowRight className="h-[13px] w-[13px]" />
              </button>
            </div>

            <div className="px-[18px]">
              {CAMPAIGNS.map((campaign) => (
                <div
                  key={campaign.title}
                  className="grid min-h-[64px] grid-cols-[38px_minmax(0,1fr)_auto_20px] items-center gap-[12px] border-b border-[#eef0f2] last:border-b-0"
                >
                  <div className="grid h-[38px] w-[38px] place-items-center rounded-[7px] bg-emerald-50 text-emerald-700">
                    <Megaphone className="h-[17px] w-[17px]" strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-[10.5px] font-semibold text-[#19274a]">{campaign.title}</p>
                    <p className="mt-[4px] whitespace-nowrap text-[9px] font-semibold text-[#68758d]">{campaign.date}</p>
                  </div>

                  <span
                    className={`rounded-[5px] border px-[10px] py-[4px] text-[8px] font-semibold ${campaign.status === "Active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                      }`}
                  >
                    {campaign.status}
                  </span>

                  <ChevronRight className="h-[14px] w-[14px] text-[#526078]" />
                </div>
              ))}
            </div>

            <button className="flex h-[50px] w-full items-center justify-center gap-[8px] border-t border-[#edf0f2] text-[10px] font-semibold text-[#14683d]">
              Create New Campaign
              <ArrowRight className="h-[13px] w-[13px]" />
            </button>
          </section>
        </section>

        <section className="mt-[20px] grid items-stretch gap-[20px] xl:grid-cols-[minmax(380px,0.76fr)_minmax(0,1fr)]">
          <section className="rounded-[10px] border border-[#e6e9ec] bg-white px-[20px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
            <h2 className="text-[14px] font-semibold text-[#17234a]">Quick Actions</h2>

            <div className="mt-[18px] grid grid-cols-5 gap-[18px]">
              {[
                [Pencil, "Add New Post"],
                [Megaphone, "Add New Campaign"],
                [FolderClosed, "Manage Categories"],
                [Tag, "Manage Tags"],
                [MessageCircleMore, "View Comments"],
              ].map(([Icon, label]) => {
                const ActionIcon = Icon as typeof Pencil;

                return (
                  <button
                    key={String(label)}
                    onClick={() => {
                      if (label === "Manage Categories") {
                        setShowCategories(true);
                      }
                    }}
                    className="min-w-0 text-center hover:opacity-80 transition"
                  >
                    <div className="mx-auto grid h-[64px] w-[64px] place-items-center rounded-[10px] bg-[linear-gradient(180deg,#eef7f1_0%,#f7faf8_100%)] text-[#14683d]">
                      <ActionIcon className="h-[28px] w-[28px]" strokeWidth={1.8} />
                    </div>
                    <span className="mt-[9px] block text-[8.5px] font-semibold leading-[1.35] text-[#293854]">
                      {String(label)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[10px] border border-[#e6e9ec] bg-white px-[20px] py-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
            <h2 className="text-[14px] font-semibold text-[#17234a]">Content Insights (This Month)</h2>

            <div className="mt-[18px] grid grid-cols-4 gap-[20px]">
              {[
                {
                  icon: <FileText className="h-[24px] w-[24px]" />,
                  iconClass: "bg-emerald-50 text-emerald-700",
                  value: "8",
                  label: "New Posts Published",
                  note: "+4 vs last month",
                },
                {
                  icon: <Eye className="h-[24px] w-[24px]" />,
                  iconClass: "bg-blue-50 text-blue-700",
                  value: "6,842",
                  label: "Post Views",
                  note: "+22.3% vs last month",
                },
                {
                  icon: <MessageCircleMore className="h-[24px] w-[24px]" />,
                  iconClass: "bg-violet-50 text-violet-700",
                  value: "136",
                  label: "Comments",
                  note: "+18.5% vs last month",
                },
                {
                  icon: <Share2 className="h-[24px] w-[24px]" />,
                  iconClass: "bg-amber-50 text-amber-700",
                  value: "243",
                  label: "Shares",
                  note: "+15.7% vs last month",
                },
              ].map((item) => (
                <div key={item.label} className="flex min-w-0 items-start gap-[12px]">
                  <div className={`grid h-[48px] w-[48px] shrink-0 place-items-center rounded-full ${item.iconClass}`}>
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <p className="text-[22px] font-semibold leading-none text-[#10204a]">{item.value}</p>
                    <p className="mt-[4px] text-[8.8px] font-semibold leading-[1.3] text-[#34425e]">{item.label}</p>
                    <p className="mt-[8px] text-[8px] font-semibold text-emerald-700">{item.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>

        <section className="mt-[20px] flex min-h-[58px] items-center rounded-[8px] border border-[#dce8df] bg-[linear-gradient(90deg,#eef7f1,#f7fbf8)] px-[18px]">
          <div className="mr-[12px] grid h-[26px] w-[26px] place-items-center rounded-full border border-[#cfe1d4] bg-white text-[#0d6b3e]">
            <Info className="h-[15px] w-[15px]" />
          </div>

          <p className="text-[10px] font-semibold text-[#38654b]">
            <span className="font-semibold">Tip:</span>{" "}
            Consistent blogging and awareness campaigns help increase trust, engagement and support for our mission.
          </p>
        </section>
      </div>
    </main>
  );
}