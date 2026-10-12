"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Quote,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ApiRequestError } from "@/lib/api";
import { uploadApi } from "@/lib/uploadApi";
import { BLOG_EXPERT_LIMITS, blogExpertsApi, type BlogExpert, type BlogExpertInput } from "@/lib/blogExpertsApi";

/*
 * Blog Experts — the "Voices of Experts" cards on the website's /blog and /blog/experts pages.
 */

const SORTS = ["Sort By: Order", "Sort By: Newest", "Sort By: Name A-Z"] as const;
const PAGE_SIZES = [10, 20, 50];
const NAME_RE = /^\p{L}[\p{L}\p{M} .'()-]*$/u;

const errorText = (err: unknown, fallback: string) =>
  err instanceof ApiRequestError || err instanceof Error ? err.message || fallback : fallback;

type FormState = Omit<BlogExpertInput, "order"> & { order: string };

const emptyForm = (order: number): FormState => ({ name: "", role: "", quote: "", image: "", status: "published", order: String(order) });

const initials = (name: string) =>
  name
    .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

function Avatar({ expert, size = 44 }: { expert: Pick<BlogExpert, "name" | "image">; size?: number }) {
  const style = { width: size, height: size };
  if (expert.image) {
    // eslint-disable-next-line @next/next/no-img-element -- uploaded photos come from any host
    return <img src={expert.image} alt={expert.name} style={style} className="shrink-0 rounded-full object-cover ring-2 ring-[#e8f2eb]" />;
  }
  return (
    <div style={style} className="grid shrink-0 place-items-center rounded-full bg-[#eef7f1] text-[12px] font-extrabold text-[#147044] ring-2 ring-[#e8f2eb]">
      {initials(expert.name) || <UsersRound className="h-[18px] w-[18px]" />}
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

export default function BlogExpertsPage() {
  const router = useRouter();
  const [experts, setExperts] = useState<BlogExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Sort By: Order");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editing, setEditing] = useState<BlogExpert | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(1));
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [deleting, setDeleting] = useState<BlogExpert | null>(null);
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
      setExperts(await blogExpertsApi.list());
    } catch (err) {
      setLoadError(errorText(err, "Could not load the experts."));
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

  const nextOrder = useMemo(() => experts.reduce((max, e) => Math.max(max, e.order), 0) + 1, [experts]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(nextOrder));
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (item: BlogExpert) => {
    setEditing(item);
    setForm({ name: item.name, role: item.role, quote: item.quote, image: item.image || "", status: item.status, order: String(item.order) });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving || uploading) return;
    setFormOpen(false);
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [field]: value }));

  const pickPhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFormError("Please choose an image file (JPG, PNG or WebP).");
      return;
    }
    setUploading(true);
    setFormError("");
    try {
      const res = await uploadApi.file(file, "bharat-organic/blog-experts");
      if (!res?.url) throw new Error("The upload did not return a link.");
      setField("image", res.url);
    } catch (err) {
      setFormError(errorText(err, "Could not upload the photo."));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const quoteText = form.quote.trim().replace(/^["“”']+|["“”']+$/g, "").trim();

  const formProblem = (): string => {
    const name = form.name.trim();
    if (!name) return "Expert name is required.";
    if (name.length < 2) return "Expert name must be at least 2 characters.";
    if (!NAME_RE.test(name)) return "Expert name can contain only letters, spaces, dots, hyphens and apostrophes.";
    if (!form.role.trim()) return "Designation / organisation is required.";
    if (form.role.trim().length < 2) return "Designation / organisation must be at least 2 characters.";
    if (!quoteText) return "Quote is required.";
    if (quoteText.length < 10) return "Quote must be at least 10 characters.";
    if (quoteText.length > BLOG_EXPERT_LIMITS.quote) return `Quote can be at most ${BLOG_EXPERT_LIMITS.quote} characters.`;
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
    const payload: BlogExpertInput = {
      name: form.name.trim(),
      role: form.role.trim(),
      quote: quoteText,
      image: form.image.trim(),
      status: form.status,
      order: Number(form.order),
    };
    setSaving(true);
    setFormError("");
    try {
      if (editing) await blogExpertsApi.update(editing._id, payload);
      else await blogExpertsApi.create(payload);
      setNotice({ tone: "ok", text: `"${payload.name}" ${editing ? "saved" : "added"}.` });
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(errorText(err, "Could not save the expert."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item: BlogExpert) => {
    const status = item.status === "published" ? "hidden" : "published";
    setExperts((list) => list.map((e) => (e._id === item._id ? { ...e, status } : e)));
    try {
      await blogExpertsApi.update(item._id, { status });
      setNotice({ tone: "ok", text: `"${item.name}" is now ${status === "published" ? "shown on" : "hidden from"} the website.` });
    } catch (err) {
      setExperts((list) => list.map((e) => (e._id === item._id ? { ...e, status: item.status } : e)));
      setNotice({ tone: "error", text: errorText(err, "Could not change the status.") });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await blogExpertsApi.remove(deleting._id);
      setNotice({ tone: "ok", text: `"${deleting.name}" deleted.` });
      setDeleting(null);
      await load();
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not delete the expert.") });
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = experts.filter((e) => {
      const searchMatch = !q || `${e.name} ${e.role} ${e.quote}`.toLowerCase().includes(q);
      const statusMatch =
        statusFilter === "All Status" || (statusFilter === "Published" ? e.status === "published" : e.status === "hidden");
      return searchMatch && statusMatch;
    });
    const time = (s: string) => new Date(s).getTime() || 0;
    if (sort === "Sort By: Order") list = [...list].sort((a, b) => a.order - b.order || time(a.createdAt) - time(b.createdAt));
    if (sort === "Sort By: Newest") list = [...list].sort((a, b) => time(b.createdAt) - time(a.createdAt));
    if (sort === "Sort By: Name A-Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [experts, query, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstShown = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastShown = (currentPage - 1) * pageSize + pageItems.length;

  const published = experts.filter((e) => e.status === "published").length;
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
            <h1 className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-[#075b33]">Blog Experts</h1>
            <nav className="mt-[4px] flex items-center gap-[6px] text-[10px] font-semibold text-[#1d2b58]">
              <span onClick={() => router.push("/")} className="cursor-pointer transition hover:text-[#075b33]">Dashboard</span>
              <span className="text-[#7b8597]">›</span>
              <span onClick={() => router.push("/blogs")} className="cursor-pointer transition hover:text-[#075b33]">Blog &amp; Insights</span>
              <span className="text-[#7b8597]">›</span>
              <span className="text-[#075b33]">Voices of Experts</span>
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
              Add New Expert
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
            icon={<UsersRound className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Experts"
            value={loading ? "–" : String(experts.length)}
            note="In Voices of Experts"
          />
          <MetricCard
            icon={<Quote className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Published"
            value={loading ? "–" : String(published)}
            note="Visible on website"
          />
          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Hidden"
            value={loading ? "–" : String(experts.length - published)}
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
                placeholder="Search experts..."
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
              <table className="w-full min-w-[1000px] border-collapse text-left">
                <thead>
                  <tr className="h-[40px] border-b border-[#edf0f2] bg-[#fafbfc] text-[9px] font-extrabold uppercase tracking-[0.04em] text-[#44516a]">
                    <th className="px-[12px] whitespace-nowrap">Expert</th>
                    <th className="px-[12px]">Quote</th>
                    <th className="px-[12px] text-center whitespace-nowrap">Status</th>
                    <th className="px-[12px] text-center">Order</th>
                    <th className="px-[12px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && experts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">Loading experts…</td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={5} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-red-600">
                        {loadError}{" "}
                        <button type="button" onClick={() => void load()} className="underline">Try again</button>
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">
                        {experts.length ? "No expert matches these filters." : "No experts yet. Add the first one."}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item) => (
                      <tr key={item._id} className="h-[64px] border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/50">
                        <td className="px-[12px] whitespace-nowrap">
                          <div className="flex min-w-[240px] items-center gap-[14px]">
                            <Avatar expert={item} />
                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold text-[#19274a]">{item.name}</p>
                              <p className="mt-[5px] text-[9px] font-semibold text-[#68758d]">{item.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-[12px]">
                          <p className="max-w-[460px] text-[10.5px] font-semibold italic leading-[1.55] text-[#55627a]">&ldquo;{item.quote}&rdquo;</p>
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
                            <button type="button" onClick={() => openEdit(item)} className="text-[#263650] transition hover:text-[#075b33]" aria-label={`Edit ${item.name}`} title="Edit">
                              <Pencil className="h-[16px] w-[16px]" />
                            </button>
                            <button type="button" onClick={() => setDeleting(item)} className="text-[#d74a40] transition hover:text-red-700" aria-label={`Delete ${item.name}`} title="Delete">
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
                Showing {firstShown} to {lastShown} of {filtered.length} expert{filtered.length === 1 ? "" : "s"}
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
        title={editing ? `Edit “${editing.name}”` : "Add New Expert"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeForm} disabled={saving || uploading}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form="blog-expert-form" loading={saving} disabled={uploading}>
              {editing ? "Save Changes" : "Add Expert"}
            </Button>
          </>
        }
      >
        <form id="blog-expert-form" onSubmit={save} className="space-y-4" noValidate>
          <div className="flex items-center gap-4">
            <Avatar expert={{ name: form.name || "?", image: form.image }} size={64} />
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void pickPhoto(e.target.files?.[0])}
              />
              <Button type="button" variant="secondary" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                <ImagePlus className="h-[14px] w-[14px]" />
                {form.image ? "Change Photo" : "Upload Photo"}
              </Button>
              {form.image && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setField("image", "")} disabled={uploading}>
                  <X className="h-[14px] w-[14px]" />
                  Remove
                </Button>
              )}
              <p className="w-full text-[11px] text-[#68758d]">Square photo works best. Without a photo the website shows its default expert picture.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Expert Name"
              required
              value={form.name}
              maxLength={BLOG_EXPERT_LIMITS.name}
              onChange={(e) => setField("name", e.target.value)}
              placeholder="e.g. Dr. Ramesh Patel"
              autoFocus
            />
            <Input
              label="Designation / Organisation"
              required
              value={form.role}
              maxLength={BLOG_EXPERT_LIMITS.role}
              onChange={(e) => setField("role", e.target.value)}
              placeholder="e.g. CEO, Organic India"
            />
          </div>

          <Textarea
            label="Quote"
            required
            rows={3}
            value={form.quote}
            maxLength={BLOG_EXPERT_LIMITS.quote + 4}
            onChange={(e) => setField("quote", e.target.value)}
            placeholder="What the expert says (quotation marks are added on the website)."
            hint={`${quoteText.length}/${BLOG_EXPERT_LIMITS.quote} characters (10 minimum)`}
          />

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
              hint="Lower numbers are shown first."
            />
          </div>

          {formError && <p className="text-[11.5px] font-semibold text-red-600">{formError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete expert?"
        description={deleting ? `"${deleting.name}" will be removed from the admin and the website. This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        loading={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </main>
  );
}
