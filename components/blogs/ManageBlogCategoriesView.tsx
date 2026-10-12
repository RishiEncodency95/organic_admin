"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Apple,
  ArrowLeft,
  Award,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  FileText,
  FolderClosed,
  Globe,
  Heart,
  Leaf,
  Lightbulb,
  Megaphone,
  Newspaper,
  Package,
  Pencil,
  Plus,
  Recycle,
  RefreshCw,
  RotateCcw,
  Search,
  Sprout,
  Trash2,
  TrendingUp,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ApiRequestError } from "@/lib/api";
import {
  BLOG_CATEGORY_COLORS,
  BLOG_CATEGORY_ICONS,
  blogCategoriesApi,
  type BlogCategory,
  type BlogCategoryColor,
  type BlogCategoryIcon,
  type BlogCategoryInput,
} from "@/lib/blogCategoriesApi";

/* Same keys as the website's blog sidebar (organic_frontend BlogSidebar.tsx) */
const ICONS: Record<BlogCategoryIcon, LucideIcon> = {
  newspaper: Newspaper,
  sprout: Sprout,
  apple: Apple,
  package: Package,
  recycle: Recycle,
  lightbulb: Lightbulb,
  "file-text": FileText,
  "book-open": BookOpen,
  leaf: Leaf,
  heart: Heart,
  users: UsersRound,
  megaphone: Megaphone,
  calendar: CalendarDays,
  globe: Globe,
  award: Award,
  "trending-up": TrendingUp,
};

const COLORS: Record<BlogCategoryColor, string> = {
  sky: "bg-sky-800 text-sky-100",
  green: "bg-green-800 text-green-100",
  emerald: "bg-emerald-800 text-emerald-100",
  orange: "bg-orange-800 text-orange-100",
  teal: "bg-teal-800 text-teal-100",
  amber: "bg-amber-800 text-amber-100",
  rose: "bg-rose-800 text-rose-100",
  cyan: "bg-cyan-800 text-cyan-100",
  lime: "bg-lime-800 text-lime-100",
  indigo: "bg-indigo-800 text-indigo-100",
  violet: "bg-violet-800 text-violet-100",
  slate: "bg-slate-700 text-slate-100",
};

const SORTS = ["Sort By: Order", "Sort By: Newest", "Sort By: Oldest", "Sort By: Name A-Z", "Sort By: Most Posts"] as const;
const PAGE_SIZES = [10, 20, 50];

const toSlug = (s: string) =>
  s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const errorText = (err: unknown, fallback: string) =>
  err instanceof ApiRequestError || err instanceof Error ? err.message || fallback : fallback;

type FormState = Omit<BlogCategoryInput, "order"> & { order: string };

const emptyForm = (order: number): FormState => ({
  name: "",
  slug: "",
  description: "",
  icon: "newspaper",
  color: "green",
  status: "published",
  order: String(order),
});

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

function CategoryIcon({ icon, color, size = "md" }: { icon: BlogCategoryIcon; color: BlogCategoryColor; size?: "sm" | "md" }) {
  const Icon = ICONS[icon] ?? Newspaper;
  const box = size === "sm" ? "h-[30px] w-[30px]" : "h-[44px] w-[44px]";
  return (
    <div className={`grid ${box} shrink-0 place-items-center rounded-full ${COLORS[color] ?? COLORS.green}`}>
      <Icon className={size === "sm" ? "h-[14px] w-[14px]" : "h-[20px] w-[20px]"} strokeWidth={1.8} />
    </div>
  );
}

/**
 * `startAdding` opens the Add popup straight away (the /blogs/categories/new address).
 * `onBack` replaces the Back button's default (the previous page, else Blog & Insights).
 */
export default function ManageCategoriesPage({ startAdding = false, onBack }: { startAdding?: boolean; onBack?: () => void }) {
  const router = useRouter();
  const goBack = () => {
    if (onBack) return onBack();
    if (window.history.length > 1) router.back();
    else router.push("/blogs");
  };
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Sort By: Order");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Add / edit popup
  const [editing, setEditing] = useState<BlogCategory | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(1));
  const [slugTouched, setSlugTouched] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState<BlogCategory | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setCategories(await blogCategoriesApi.list());
    } catch (err) {
      setLoadError(errorText(err, "Could not load the categories."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load();
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const nextOrder = useMemo(() => categories.reduce((max, c) => Math.max(max, c.order), 0) + 1, [categories]);

  const openAdd = useCallback(() => {
    setEditing(null);
    setForm(emptyForm(nextOrder));
    setSlugTouched(false);
    setFormError("");
    setFormOpen(true);
  }, [nextOrder]);

  const [handledAdd, setHandledAdd] = useState(false);
  if (startAdding && !handledAdd && !loading) {
    setHandledAdd(true);
    openAdd();
  }

  const openEdit = (item: BlogCategory) => {
    setEditing(item);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      icon: item.icon,
      color: item.color,
      status: item.status,
      order: String(item.order),
    });
    setSlugTouched(true);
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    if (startAdding) router.replace("/blogs/categories");
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) =>
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && !slugTouched) next.slug = toSlug(String(value));
      return next;
    });

  const formProblem = (): string => {
    const name = form.name.trim();
    if (!name) return "Category name is required.";
    if (name.length < 2) return "Category name must be at least 2 characters.";
    if (!toSlug(form.slug || name)) return "Slug must contain letters or numbers.";
    const order = Number(form.order);
    if (form.order.trim() === "" || !Number.isInteger(order) || order < 0 || order > 9999) return "Order must be a whole number from 0 to 9999.";
    const clash = categories.find((c) => c._id !== editing?._id && c.name.trim().toLowerCase() === name.toLowerCase());
    if (clash) return `A category named "${clash.name}" already exists.`;
    const slug = toSlug(form.slug || name);
    const slugClash = categories.find((c) => c._id !== editing?._id && c.slug === slug);
    if (slugClash) return `The slug "${slug}" is already used by "${slugClash.name}".`;
    return "";
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = formProblem();
    if (problem) {
      setFormError(problem);
      return;
    }
    const payload: BlogCategoryInput = {
      name: form.name.trim(),
      slug: toSlug(form.slug || form.name),
      description: form.description.trim(),
      icon: form.icon,
      color: form.color,
      status: form.status,
      order: Number(form.order),
    };
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        await blogCategoriesApi.update(editing._id, payload);
        const renamed = editing.name !== payload.name && editing.postCount > 0;
        setNotice({
          tone: "ok",
          text: renamed
            ? `"${payload.name}" saved. Its ${editing.postCount} post${editing.postCount === 1 ? "" : "s"} moved to the new name too.`
            : `"${payload.name}" saved.`,
        });
      } else {
        await blogCategoriesApi.create(payload);
        setNotice({ tone: "ok", text: `"${payload.name}" added.` });
      }
      setFormOpen(false);
      if (startAdding) router.replace("/blogs/categories");
      await load();
    } catch (err) {
      setFormError(errorText(err, "Could not save the category."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item: BlogCategory) => {
    const status = item.status === "published" ? "hidden" : "published";
    setCategories((list) => list.map((c) => (c._id === item._id ? { ...c, status } : c)));
    try {
      await blogCategoriesApi.update(item._id, { status });
      setNotice({ tone: "ok", text: `"${item.name}" is now ${status === "published" ? "shown on" : "hidden from"} the website.` });
    } catch (err) {
      setCategories((list) => list.map((c) => (c._id === item._id ? { ...c, status: item.status } : c)));
      setNotice({ tone: "error", text: errorText(err, "Could not change the status.") });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await blogCategoriesApi.remove(deleting._id);
      setNotice({ tone: "ok", text: `"${deleting.name}" deleted.` });
      setDeleting(null);
      await load();
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not delete the category.") });
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = categories.filter((item) => {
      const searchMatch = !q || `${item.name} ${item.slug} ${item.description}`.toLowerCase().includes(q);
      const statusMatch =
        statusFilter === "All Status" ||
        (statusFilter === "Published" ? item.status === "published" : item.status === "hidden");
      return searchMatch && statusMatch;
    });

    const time = (s: string) => new Date(s).getTime() || 0;
    if (sort === "Sort By: Order") list = [...list].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    if (sort === "Sort By: Newest") list = [...list].sort((a, b) => time(b.createdAt) - time(a.createdAt));
    if (sort === "Sort By: Oldest") list = [...list].sort((a, b) => time(a.createdAt) - time(b.createdAt));
    if (sort === "Sort By: Name A-Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "Sort By: Most Posts") list = [...list].sort((a, b) => b.postCount - a.postCount);
    return list;
  }, [categories, query, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filteredCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstShown = filteredCategories.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastShown = (currentPage - 1) * pageSize + pageItems.length;

  const stats = useMemo(() => {
    const published = categories.filter((c) => c.status === "published").length;
    return {
      total: categories.length,
      published,
      hidden: categories.length - published,
      posts: categories.reduce((sum, c) => sum + c.postCount, 0),
    };
  }, [categories]);

  const filtersActive = query !== "" || statusFilter !== "All Status" || sort !== "Sort By: Order";

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
          <div className="flex items-center gap-[12px]">
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            title="Back"
            className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-[6px] border border-[#dfe4e8] bg-white text-[#35445f] transition hover:border-[#075b33] hover:bg-[#eef7f1] hover:text-[#075b33]"
          >
            <ArrowLeft className="h-[15px] w-[15px]" />
          </button>
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
          </div>

          <div className="flex items-center gap-[8px]">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-bold text-[#35445f] transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw className={`h-[13px] w-[13px] ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={openAdd}
              className="inline-flex h-[34px] items-center gap-[6px] rounded-[6px] bg-[linear-gradient(180deg,#076636_0%,#03542c_100%)] px-[16px] text-[10px] font-bold text-white shadow-[0_4px_10px_rgba(5,94,49,.12)] transition hover:opacity-95"
            >
              <Plus className="h-[14px] w-[14px]" />
              Add New Category
            </button>
          </div>
        </header>

        {notice && (
          <p
            role="status"
            className={`mt-[10px] rounded-[6px] border px-[12px] py-[8px] text-[10.5px] font-semibold ${
              notice.tone === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {notice.text}
          </p>
        )}

        {/* STATS */}
        <section className="mt-[10px] grid grid-cols-4 gap-[10px]">
          <MetricCard
            icon={<FolderClosed className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Categories"
            value={loading ? "–" : String(stats.total)}
            note="All Blog & Awareness Categories"
          />

          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Published"
            value={loading ? "–" : String(stats.published)}
            note="Visible on website"
          />

          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Hidden"
            value={loading ? "–" : String(stats.hidden)}
            note="Not visible on website"
          />

          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-blue-50 text-blue-700"
            label="Total Posts"
            value={loading ? "–" : String(stats.posts)}
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
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search categories..."
                className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[40px] pr-[12px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="h-[40px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-bold text-[#2a3855] outline-none"
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Hidden</option>
            </select>

            <button
              type="button"
              title="Clear search, status and sort"
              aria-label="Clear filters"
              disabled={!filtersActive}
              onClick={() => {
                setQuery("");
                setStatusFilter("All Status");
                setSort("Sort By: Order");
                setPage(1);
              }}
              className="grid h-[40px] w-[40px] place-items-center rounded-[6px] border border-[#dfe4e8] bg-white text-[#44516a] transition hover:bg-slate-50 disabled:opacity-40"
            >
              <RotateCcw className="h-[14px] w-[14px]" />
            </button>

            <div />

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as (typeof SORTS)[number])}
              className="h-[40px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-bold text-[#35445f] outline-none"
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* TABLE */}
          <div className="mt-[10px] overflow-hidden rounded-[7px] border border-[#eceff1]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] border-collapse text-left">
                <thead>
                  <tr className="h-[40px] border-b border-[#edf0f2] bg-[#fafbfc] text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#44516a]">
                    <th className="px-[12px] whitespace-nowrap">Category</th>
                    <th className="px-[12px]">Description</th>
                    <th className="px-[12px] text-center whitespace-nowrap">Total Posts</th>
                    <th className="px-[12px] text-center whitespace-nowrap">Status</th>
                    <th className="px-[12px] text-center">Order</th>
                    <th className="px-[12px] text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && categories.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">
                        Loading categories…
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={6} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-red-600">
                        {loadError}{" "}
                        <button type="button" onClick={() => void load()} className="underline">
                          Try again
                        </button>
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">
                        {categories.length ? "No category matches these filters." : "No categories yet. Add the first one."}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item) => (
                      <tr
                        key={item._id}
                        className="h-[64px] border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/50"
                      >
                        <td className="px-[12px] whitespace-nowrap">
                          <div className="flex min-w-[250px] items-center gap-[14px]">
                            <CategoryIcon icon={item.icon} color={item.color} />

                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold whitespace-nowrap text-[#19274a]">
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
                            {item.description || <span className="text-[#a0a9b8]">—</span>}
                          </p>
                        </td>

                        <td className="px-[12px] text-center">
                          <span className="text-[10px] font-extrabold text-[#2563eb]">
                            {item.postCount}
                          </span>
                        </td>

                        <td className="px-[12px] text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => void toggleStatus(item)}
                            title={item.status === "published" ? "Click to hide from the website" : "Click to show on the website"}
                            className={`inline-flex whitespace-nowrap rounded-[5px] border px-[10px] py-[5px] text-[9px] font-bold transition hover:opacity-80 ${item.status === "published"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                          >
                            {item.status === "published" ? "Published" : "Hidden"}
                          </button>
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
                              onClick={() => openEdit(item)}
                              className="text-[#263650] transition hover:text-[#075b33]"
                              aria-label={`Edit ${item.name}`}
                              title="Edit"
                            >
                              <Pencil className="h-[16px] w-[16px]" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleting(item)}
                              className="text-[#d74a40] transition hover:text-red-700"
                              aria-label={`Delete ${item.name}`}
                              title="Delete"
                            >
                              <Trash2 className="h-[16px] w-[16px]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="flex min-h-[56px] items-center justify-between gap-[14px] border-t border-[#edf0f2] px-[12px]">
              <p className="text-[9.5px] font-semibold text-[#47546c]">
                Showing {firstShown} to {lastShown} of {filteredCategories.length} categor{filteredCategories.length === 1 ? "y" : "ies"}
              </p>

              <div className="flex items-center gap-[10px]">
                <div className="flex items-center gap-[6px]">
                  <button
                    type="button"
                    aria-label="Previous page"
                    disabled={currentPage <= 1}
                    onClick={() => setPage(currentPage - 1)}
                    className="grid h-[34px] w-[34px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white disabled:opacity-40"
                  >
                    <ChevronLeft className="h-[13px] w-[13px]" />
                  </button>

                  {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPage(n)}
                      className={
                        n === currentPage
                          ? "grid h-[34px] min-w-[34px] place-items-center rounded-[5px] bg-[#075b33] px-[6px] text-[9px] font-bold text-white"
                          : "grid h-[34px] min-w-[34px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white px-[6px] text-[9px] font-bold text-[#35445f]"
                      }
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    type="button"
                    aria-label="Next page"
                    disabled={currentPage >= pageCount}
                    onClick={() => setPage(currentPage + 1)}
                    className="grid h-[34px] w-[34px] place-items-center rounded-[5px] border border-[#dfe3e7] bg-white disabled:opacity-40"
                  >
                    <ChevronRight className="h-[13px] w-[13px]" />
                  </button>
                </div>

                <select
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                  className="h-[34px] rounded-[5px] border border-[#dfe3e7] bg-white px-[10px] text-[9px] font-bold text-[#35445f]"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n} / page
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ADD / EDIT */}
      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editing ? `Edit “${editing.name}”` : "Add New Category"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form="blog-category-form" loading={saving}>
              {editing ? "Save Changes" : "Add Category"}
            </Button>
          </>
        }
      >
        <form id="blog-category-form" onSubmit={save} className="space-y-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category Name"
              required
              value={form.name}
              maxLength={80}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Organic Farming"
              autoFocus
            />
            <Input
              label="Slug"
              value={form.slug}
              maxLength={80}
              onChange={(e) => {
                setSlugTouched(true);
                setField("slug", e.target.value);
              }}
              onBlur={() => setField("slug", toSlug(form.slug || form.name))}
              placeholder="organic-farming"
              hint="Made from the name; lower-case letters, numbers and hyphens."
            />
          </div>

          <Textarea
            label="Description"
            rows={3}
            value={form.description}
            maxLength={400}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="A line about what this category covers (shown here in the admin)."
            hint={`${form.description.length}/400`}
          />

          <div>
            <p className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">Icon</p>
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORY_ICONS.map((key) => {
                const Icon = ICONS[key];
                const active = form.icon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={key}
                    aria-label={`Icon ${key}`}
                    aria-pressed={active}
                    onClick={() => setField("icon", key)}
                    className={`grid h-[34px] w-[34px] place-items-center rounded-full border transition ${
                      active ? "border-[#075b33] bg-[#eef7f1] text-[#075b33] ring-2 ring-[#075b33]/20" : "border-[#dfe4e8] text-[#44516a] hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-[15px] w-[15px]" />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">Colour</p>
            <div className="flex flex-wrap gap-2">
              {BLOG_CATEGORY_COLORS.map((key) => {
                const active = form.color === key;
                return (
                  <button
                    key={key}
                    type="button"
                    title={key}
                    aria-label={`Colour ${key}`}
                    aria-pressed={active}
                    onClick={() => setField("color", key)}
                    className={`h-[26px] w-[26px] rounded-full ${COLORS[key]} transition ${active ? "ring-2 ring-offset-2 ring-[#075b33]" : "opacity-80 hover:opacity-100"}`}
                  />
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={(e) => setField("status", e.target.value as FormState["status"])}>
              <option value="published">Published — shown on the website</option>
              <option value="hidden">Hidden — not shown on the website</option>
            </Select>
            <Input
              label="Order"
              required
              type="number"
              min={0}
              max={9999}
              step={1}
              value={form.order}
              onChange={(e) => setField("order", e.target.value)}
              hint="Lower numbers are listed first on the website."
            />
          </div>

          <div className="flex items-center gap-3 rounded-[8px] border border-[#e7e9ec] bg-[#fafbfc] px-3 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#68758d]">Preview</span>
            <CategoryIcon icon={form.icon} color={form.color} size="sm" />
            <span className="text-[13px] font-medium text-gray-700">{form.name.trim() || "Category name"}</span>
            {editing && <span className="ml-auto text-[11px] font-semibold text-[#68758d]">{editing.postCount} posts</span>}
          </div>

          {editing && editing.postCount > 0 && editing.name !== form.name.trim() && form.name.trim() && (
            <p className="text-[11px] font-medium text-amber-700">
              Renaming also moves its {editing.postCount} post{editing.postCount === 1 ? "" : "s"} to “{form.name.trim()}”.
            </p>
          )}
          {formError && <p className="text-[11.5px] font-semibold text-red-600">{formError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete category?"
        description={
          deleting
            ? deleting.postCount > 0
              ? `"${deleting.name}" is used by ${deleting.postCount} post${deleting.postCount === 1 ? "" : "s"}, so it cannot be deleted. Move those posts to another category first, or hide this category instead.`
              : `"${deleting.name}" will be removed from the admin and the website. This cannot be undone.`
            : ""
        }
        confirmLabel={deleting && deleting.postCount > 0 ? "OK" : "Delete"}
        danger={!!deleting && deleting.postCount === 0}
        loading={deleteBusy}
        onConfirm={() => (deleting && deleting.postCount > 0 ? setDeleting(null) : void confirmDelete())}
        onCancel={() => setDeleting(null)}
      />
    </main>
  );
}
