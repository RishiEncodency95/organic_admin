"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  ImageIcon,
  ImagePlus,
  Link2,
  Megaphone,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ApiRequestError } from "@/lib/api";
import { uploadApi } from "@/lib/uploadApi";
import { blogsApi } from "@/lib/blogsApi";
import { BLOG_UPDATE_LIMITS, blogUpdatesApi, type BlogUpdate, type BlogUpdateInput } from "@/lib/blogUpdatesApi";

/*
 * Manage Updates — the "Latest from Bharat Organic Expo" cards on the website's /blog and
 * /blog/updates pages.
 */

const SORTS = ["Sort By: Order", "Sort By: Date (newest)", "Sort By: Title A-Z"] as const;
const PAGE_SIZES = [10, 20, 50];
const LINK_RE = /^(\/(?!\/)[^\s]*|https?:\/\/[^\s]+)$/i;
const L = BLOG_UPDATE_LIMITS;

const errorText = (err: unknown, fallback: string) =>
  err instanceof ApiRequestError || err instanceof Error ? err.message || fallback : fallback;

const todayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const toDateInput = (iso: string) => (iso ? iso.slice(0, 10) : "");
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
};

type FormState = {
  tag: string;
  title: string;
  description: string;
  image: string;
  date: string;
  readMinutes: string;
  link: string;
  status: BlogUpdateInput["status"];
  order: string;
};

const emptyForm = (order: number): FormState => ({
  tag: "",
  title: "",
  description: "",
  image: "",
  date: todayIso(),
  readMinutes: "3",
  link: "",
  status: "published",
  order: String(order),
});

function Thumb({ image, size = "md" }: { image: string; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "h-[90px] w-[150px]" : "h-[44px] w-[70px]";
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element -- uploaded images come from any host
    return <img src={image} alt="" className={`${cls} shrink-0 rounded-[6px] object-cover ring-1 ring-[#e7e9ec]`} />;
  }
  return (
    <div className={`${cls} grid shrink-0 place-items-center rounded-[6px] bg-[#eef7f1] text-[#147044] ring-1 ring-[#e7e9ec]`}>
      <ImageIcon className="h-[18px] w-[18px]" />
    </div>
  );
}

function MetricCard({ icon, iconClass, label, value, note }: { icon: React.ReactNode; iconClass: string; label: string; value: string; note: string }) {
  return (
    <article className="flex min-h-[56px] items-center gap-[10px] rounded-[7px] border border-[#e7e9ec] bg-white px-[12px] py-[7px] shadow-[0_1px_2px_rgba(15,23,42,0.02)]">
      <div className={`grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full ${iconClass}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[9.5px] font-extrabold text-[#34435e]">{label}</p>
        <div className="mt-[2px] flex items-baseline gap-[6px]">
          <span className="text-[17px] font-extrabold leading-none tracking-[-0.03em] text-[#10204a]">{value}</span>
          <span className="truncate text-[9px] font-semibold text-[#66738b]">{note}</span>
        </div>
      </div>
    </article>
  );
}

export default function BlogUpdatesPage() {
  const router = useRouter();
  const [updates, setUpdates] = useState<BlogUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Sort By: Order");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [posts, setPosts] = useState<{ title: string; slug: string }[]>([]);

  const [editing, setEditing] = useState<BlogUpdate | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(1));
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [deleting, setDeleting] = useState<BlogUpdate | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  // Previous page, or Blog & Insights when this page was opened directly
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/blogs");
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setUpdates(await blogUpdatesApi.list());
    } catch (err) {
      setLoadError(errorText(err, "Could not load the updates."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch on mount
    void load();
    // Published blog posts, to link a card to one of them
    blogsApi
      .list({ status: "published", limit: 100 })
      .then((res) => setPosts((res?.posts ?? []).filter((p) => p.slug).map((p) => ({ title: p.title, slug: p.slug }))))
      .catch(() => setPosts([]));
  }, [load]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const nextOrder = useMemo(() => updates.reduce((max, u) => Math.max(max, u.order), 0) + 1, [updates]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(nextOrder));
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (item: BlogUpdate) => {
    setEditing(item);
    setForm({
      tag: item.tag,
      title: item.title,
      description: item.description,
      image: item.image || "",
      date: toDateInput(item.date),
      readMinutes: String(item.readMinutes ?? 3),
      link: item.link || "",
      status: item.status,
      order: String(item.order),
    });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving || uploading) return;
    setFormOpen(false);
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [field]: value }));

  const pickImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (JPG, PNG or WebP).");
      return;
    }
    setUploading(true);
    setFormError("");
    try {
      const res = await uploadApi.file(file, "bharat-organic/blog-updates");
      if (!res?.url) throw new Error("The upload did not return a link.");
      setField("image", res.url);
    } catch (err) {
      setFormError(errorText(err, "Could not upload the image."));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const linkedPost = posts.find((p) => form.link === `/blog/${p.slug}`);

  const formProblem = (): string => {
    const tag = form.tag.trim();
    const title = form.title.trim();
    const description = form.description.trim();
    if (!tag) return "Tag is required.";
    if (tag.length < 2) return "Tag must be at least 2 characters.";
    if (!title) return "Title is required.";
    if (title.length < 5) return "Title must be at least 5 characters.";
    if (!description) return "Short description is required.";
    if (description.length < 10) return "Short description must be at least 10 characters.";
    if (!form.date) return "Date is required.";
    const minutes = Number(form.readMinutes);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 60) return "Read time must be a whole number of minutes from 1 to 60.";
    const link = form.link.trim();
    if (link && !LINK_RE.test(link)) return "Link must be a page on this site (starting with /) or a full https:// address.";
    const order = Number(form.order);
    if (form.order.trim() === "" || !Number.isInteger(order) || order < 0 || order > 9999) return "Order must be a whole number from 0 to 9999.";
    return "";
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (uploading) return;
    const problem = formProblem();
    if (problem) {
      setFormError(problem);
      return;
    }
    const payload: BlogUpdateInput = {
      tag: form.tag.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      image: form.image.trim(),
      date: form.date,
      readMinutes: Number(form.readMinutes),
      link: form.link.trim(),
      status: form.status,
      order: Number(form.order),
    };
    setSaving(true);
    setFormError("");
    try {
      if (editing) await blogUpdatesApi.update(editing._id, payload);
      else await blogUpdatesApi.create(payload);
      setNotice({ tone: "ok", text: `"${payload.title}" ${editing ? "saved" : "added"}.` });
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(errorText(err, "Could not save the update."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item: BlogUpdate) => {
    const status = item.status === "published" ? "hidden" : "published";
    setUpdates((list) => list.map((u) => (u._id === item._id ? { ...u, status } : u)));
    try {
      await blogUpdatesApi.update(item._id, { status });
      setNotice({ tone: "ok", text: `"${item.title}" is now ${status === "published" ? "shown on" : "hidden from"} the website.` });
    } catch (err) {
      setUpdates((list) => list.map((u) => (u._id === item._id ? { ...u, status: item.status } : u)));
      setNotice({ tone: "error", text: errorText(err, "Could not change the status.") });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await blogUpdatesApi.remove(deleting._id);
      setNotice({ tone: "ok", text: `"${deleting.title}" deleted.` });
      setDeleting(null);
      await load();
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not delete the update.") });
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = updates.filter((u) => {
      const searchMatch = !q || `${u.title} ${u.tag} ${u.description}`.toLowerCase().includes(q);
      const statusMatch =
        statusFilter === "All Status" || (statusFilter === "Published" ? u.status === "published" : u.status === "hidden");
      return searchMatch && statusMatch;
    });
    const time = (s: string) => new Date(s).getTime() || 0;
    if (sort === "Sort By: Order") list = [...list].sort((a, b) => a.order - b.order || time(b.date) - time(a.date));
    if (sort === "Sort By: Date (newest)") list = [...list].sort((a, b) => time(b.date) - time(a.date));
    if (sort === "Sort By: Title A-Z") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [updates, query, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstShown = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastShown = (currentPage - 1) * pageSize + pageItems.length;

  const published = updates.filter((u) => u.status === "published").length;
  const filtersActive = query !== "" || statusFilter !== "All Status" || sort !== "Sort By: Order";

  return (
    <main
      style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
      className="h-full min-h-0 w-full overflow-y-auto overflow-x-hidden bg-[#fffefb] px-[14px] py-[10px] text-[#142347] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300"
    >
      <div className="min-h-full w-full">
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
              <h1 className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-[#075b33]">Manage Updates</h1>
              <nav className="mt-[4px] flex items-center gap-[6px] text-[10px] font-semibold text-[#1d2b58]">
                <span onClick={() => router.push("/")} className="cursor-pointer transition hover:text-[#075b33]">Dashboard</span>
                <span className="text-[#7b8597]">›</span>
                <span onClick={() => router.push("/blogs")} className="cursor-pointer transition hover:text-[#075b33]">Blog &amp; Insights</span>
                <span className="text-[#7b8597]">›</span>
                <span className="text-[#075b33]">Latest from Bharat Organic Expo</span>
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
              Add New Update
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

        <section className="mt-[10px] grid grid-cols-3 gap-[10px]">
          <MetricCard
            icon={<Megaphone className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Updates"
            value={loading ? "–" : String(updates.length)}
            note="In Latest from Bharat Organic Expo"
          />
          <MetricCard
            icon={<CalendarDays className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Published"
            value={loading ? "–" : String(published)}
            note="Visible on website"
          />
          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Hidden"
            value={loading ? "–" : String(updates.length - published)}
            note="Not visible on website"
          />
        </section>

        <section className="mt-[16px] rounded-[10px] border border-[#e7e9ec] bg-white p-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
          <div className="grid grid-cols-[minmax(280px,1fr)_170px_42px_minmax(20px,1fr)_205px] items-center gap-[10px]">
            <label className="relative">
              <Search className="absolute left-[13px] top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-[#5d6b84]" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search updates..."
                className="h-[40px] w-full rounded-[6px] border border-[#dfe4e8] bg-white pl-[40px] pr-[12px] text-[10.5px] font-semibold text-[#273655] outline-none placeholder:text-[#8b95a7]"
              />
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
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
              onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
              className="h-[40px] rounded-[6px] border border-[#dfe4e8] bg-white px-[12px] text-[10px] font-bold text-[#35445f] outline-none"
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="mt-[10px] overflow-hidden rounded-[7px] border border-[#eceff1]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1060px] border-collapse text-left">
                <thead>
                  <tr className="h-[40px] border-b border-[#edf0f2] bg-[#fafbfc] text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#44516a]">
                    <th className="px-[12px] whitespace-nowrap">Update</th>
                    <th className="px-[12px] whitespace-nowrap">Date</th>
                    <th className="px-[12px] whitespace-nowrap">Opens</th>
                    <th className="px-[12px] text-center whitespace-nowrap">Status</th>
                    <th className="px-[12px] text-center">Order</th>
                    <th className="px-[12px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && updates.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">Loading updates…</td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={6} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-red-600">
                        {loadError}{" "}
                        <button type="button" onClick={() => void load()} className="underline">Try again</button>
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">
                        {updates.length ? "No update matches these filters." : "No updates yet. Add the first one."}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item) => (
                      <tr key={item._id} className="h-[68px] border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/50">
                        <td className="px-[12px]">
                          <div className="flex min-w-[340px] items-center gap-[12px]">
                            <Thumb image={item.image} />
                            <div className="min-w-0">
                              <span className="inline-block rounded-[4px] bg-[#1b5e20] px-[6px] py-[2px] text-[8px] font-bold uppercase tracking-wider text-white">{item.tag}</span>
                              <p className="mt-[4px] max-w-[420px] truncate text-[11px] font-extrabold text-[#19274a]" title={item.title}>{item.title}</p>
                              <p className="mt-[2px] max-w-[420px] truncate text-[9.5px] font-semibold text-[#68758d]" title={item.description}>{item.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-[12px] whitespace-nowrap">
                          <p className="text-[10px] font-bold text-[#34425e]">{formatDate(item.date)}</p>
                          <p className="mt-[3px] text-[9px] font-semibold text-[#68758d]">{item.readMinutes} min read</p>
                        </td>
                        <td className="px-[12px]">
                          {item.link ? (
                            <span className="inline-flex max-w-[220px] items-center gap-[4px] truncate text-[9.5px] font-semibold text-[#2563eb]" title={item.link}>
                              <Link2 className="h-[12px] w-[12px] shrink-0" />
                              <span className="truncate">{item.link}</span>
                            </span>
                          ) : (
                            <span className="text-[9.5px] font-semibold text-[#a0a9b8]">Not clickable</span>
                          )}
                        </td>
                        <td className="px-[12px] text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => void toggleStatus(item)}
                            title={item.status === "published" ? "Click to hide from the website" : "Click to show on the website"}
                            className={`inline-flex whitespace-nowrap rounded-[5px] border px-[10px] py-[5px] text-[9px] font-bold transition hover:opacity-80 ${
                              item.status === "published" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status === "published" ? "Published" : "Hidden"}
                          </button>
                        </td>
                        <td className="px-[12px] text-center">
                          <span className="text-[10px] font-bold text-[#34425e]">{item.order}</span>
                        </td>
                        <td className="px-[12px]">
                          <div className="flex items-center justify-center gap-[18px]">
                            <button type="button" onClick={() => openEdit(item)} className="text-[#263650] transition hover:text-[#075b33]" aria-label={`Edit ${item.title}`} title="Edit">
                              <Pencil className="h-[16px] w-[16px]" />
                            </button>
                            <button type="button" onClick={() => setDeleting(item)} className="text-[#d74a40] transition hover:text-red-700" aria-label={`Delete ${item.title}`} title="Delete">
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

            <div className="flex min-h-[56px] items-center justify-between gap-[14px] border-t border-[#edf0f2] px-[12px]">
              <p className="text-[9.5px] font-semibold text-[#47546c]">
                Showing {firstShown} to {lastShown} of {filtered.length} update{filtered.length === 1 ? "" : "s"}
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
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
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

      <Modal
        isOpen={formOpen}
        onClose={closeForm}
        title={editing ? "Edit Update" : "Add New Update"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeForm} disabled={saving || uploading}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form="blog-update-form" loading={saving} disabled={uploading}>
              {editing ? "Save Changes" : "Add Update"}
            </Button>
          </>
        }
      >
        <form id="blog-update-form" onSubmit={save} className="space-y-4" noValidate>
          <div className="flex items-center gap-4">
            <Thumb image={form.image} size="lg" />
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void pickImage(e.target.files?.[0])}
              />
              <Button type="button" variant="secondary" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                <ImagePlus className="h-[14px] w-[14px]" />
                {form.image ? "Change Image" : "Upload Image"}
              </Button>
              {form.image && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setField("image", "")} disabled={uploading}>
                  <X className="h-[14px] w-[14px]" />
                  Remove
                </Button>
              )}
              <p className="w-full text-[11px] text-[#68758d]">Landscape image (about 16:9) works best. Without one the website shows a default image.</p>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <Input
              label="Tag"
              required
              value={form.tag}
              maxLength={L.tag}
              onChange={(e) => setField("tag", e.target.value)}
              placeholder="e.g. Expo Update"
              autoFocus
            />
            <Input
              label="Title"
              required
              value={form.title}
              maxLength={L.title}
              onChange={(e) => setField("title", e.target.value)}
              placeholder="e.g. Inside Bharat Organic Expo 2026"
            />
          </div>

          <Textarea
            label="Short Description"
            required
            rows={3}
            value={form.description}
            maxLength={L.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="One or two lines shown under the title on the card."
            hint={`${form.description.trim().length}/${L.description} characters (10 minimum)`}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Date" required type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
            <Input
              label="Read Time (minutes)"
              required
              type="number"
              min={1}
              max={60}
              step={1}
              value={form.readMinutes}
              onChange={(e) => setField("readMinutes", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Open a Blog Post"
              value={linkedPost ? linkedPost.slug : ""}
              onChange={(e) => setField("link", e.target.value ? `/blog/${e.target.value}` : "")}
              hint={posts.length ? "Picks the link for you." : "No published blog posts found."}
            >
              <option value="">— Choose a post (optional) —</option>
              {posts.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </Select>
            <Input
              label="Or Link"
              value={form.link}
              maxLength={500}
              onChange={(e) => setField("link", e.target.value)}
              placeholder="/blog/all-articles or https://…"
              hint="Leave empty if the card should not open anything."
            />
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
              hint="Lower numbers are shown first; the blog page shows the first two."
            />
          </div>

          {formError && <p className="text-[11.5px] font-semibold text-red-600">{formError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete update?"
        description={deleting ? `"${deleting.title}" will be removed from the admin and the website. This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        loading={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </main>
  );
}
