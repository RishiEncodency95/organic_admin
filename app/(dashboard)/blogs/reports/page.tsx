"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  EyeOff,
  FileText,
  FileUp,
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
import { BLOG_REPORT_LIMITS, blogReportsApi, formatFileSize, type BlogReport, type BlogReportInput } from "@/lib/blogReportsApi";

/*
 * Manage Reports — the downloadable PDFs in "Reports & Resources" on the website's /blog and
 * /blog/reports pages.
 */

const SORTS = ["Sort By: Order", "Sort By: Newest", "Sort By: Most Downloads", "Sort By: Title A-Z"] as const;
const PAGE_SIZES = [10, 20, 50];
const L = BLOG_REPORT_LIMITS;

const errorText = (err: unknown, fallback: string) =>
  err instanceof ApiRequestError || err instanceof Error ? err.message || fallback : fallback;

type FormState = {
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: BlogReportInput["status"];
  order: string;
};

const emptyForm = (order: number): FormState => ({
  title: "",
  description: "",
  fileUrl: "",
  fileName: "",
  fileSize: 0,
  status: "published",
  order: String(order),
});

/** "organic-report_2026.pdf" → "Organic report 2026" */
const titleFromFileName = (name: string) => {
  const base = name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
};

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

export default function BlogReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<BlogReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Sort By: Order");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editing, setEditing] = useState<BlogReport | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(1));
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [deleting, setDeleting] = useState<BlogReport | null>(null);
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
      setReports(await blogReportsApi.list());
    } catch (err) {
      setLoadError(errorText(err, "Could not load the reports."));
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

  const nextOrder = useMemo(() => reports.reduce((max, r) => Math.max(max, r.order), 0) + 1, [reports]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(nextOrder));
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (item: BlogReport) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description || "",
      fileUrl: item.fileUrl,
      fileName: item.fileName || "",
      fileSize: item.fileSize || 0,
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

  const pickPdf = async (file?: File) => {
    if (!file) return;
    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      setFormError("Please choose a PDF file.");
      return;
    }
    if (file.size > L.maxFileMB * 1024 * 1024) {
      setFormError(`The PDF is ${formatFileSize(file.size)} — it can be at most ${L.maxFileMB} MB.`);
      return;
    }
    setUploading(true);
    setFormError("");
    try {
      const res = await uploadApi.file(file, "bharat-organic/blog-reports");
      if (!res?.url) throw new Error("The upload did not return a link.");
      setForm((prev) => ({
        ...prev,
        fileUrl: res.url,
        fileName: file.name,
        fileSize: file.size,
        // A new report without a title takes it from the file name
        title: prev.title.trim() ? prev.title : titleFromFileName(file.name).slice(0, L.title),
      }));
    } catch (err) {
      setFormError(errorText(err, "Could not upload the PDF."));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const formProblem = (): string => {
    const title = form.title.trim();
    if (!title) return "Report title is required.";
    if (title.length < 3) return "Report title must be at least 3 characters.";
    if (form.description.trim().length > L.description) return `Short description can be at most ${L.description} characters.`;
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
    const payload: BlogReportInput = {
      title: form.title.trim(),
      description: form.description.trim(),
      fileUrl: form.fileUrl,
      fileName: form.fileName,
      fileSize: form.fileSize,
      status: form.status,
      order: Number(form.order),
    };
    setSaving(true);
    setFormError("");
    try {
      if (editing) await blogReportsApi.update(editing._id, payload);
      else await blogReportsApi.create(payload);
      setNotice({ tone: "ok", text: `"${payload.title}" ${editing ? "saved" : "added"}.` });
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(errorText(err, "Could not save the report."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item: BlogReport) => {
    const status = item.status === "published" ? "hidden" : "published";
    setReports((list) => list.map((r) => (r._id === item._id ? { ...r, status } : r)));
    try {
      await blogReportsApi.update(item._id, { status });
      setNotice({ tone: "ok", text: `"${item.title}" is now ${status === "published" ? "shown on" : "hidden from"} the website.` });
    } catch (err) {
      setReports((list) => list.map((r) => (r._id === item._id ? { ...r, status: item.status } : r)));
      setNotice({ tone: "error", text: errorText(err, "Could not change the status.") });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await blogReportsApi.remove(deleting._id);
      setNotice({ tone: "ok", text: `"${deleting.title}" deleted.` });
      setDeleting(null);
      await load();
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not delete the report.") });
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = reports.filter((r) => {
      const searchMatch = !q || `${r.title} ${r.description} ${r.fileName}`.toLowerCase().includes(q);
      const statusMatch =
        statusFilter === "All Status" || (statusFilter === "Published" ? r.status === "published" : r.status === "hidden");
      return searchMatch && statusMatch;
    });
    const time = (s: string) => new Date(s).getTime() || 0;
    if (sort === "Sort By: Order") list = [...list].sort((a, b) => a.order - b.order || time(b.createdAt) - time(a.createdAt));
    if (sort === "Sort By: Newest") list = [...list].sort((a, b) => time(b.createdAt) - time(a.createdAt));
    if (sort === "Sort By: Most Downloads") list = [...list].sort((a, b) => b.downloads - a.downloads);
    if (sort === "Sort By: Title A-Z") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [reports, query, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstShown = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastShown = (currentPage - 1) * pageSize + pageItems.length;

  const published = reports.filter((r) => r.status === "published").length;
  const totalDownloads = reports.reduce((sum, r) => sum + (r.downloads || 0), 0);
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
              <h1 className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-[#075b33]">Manage Reports</h1>
              <nav className="mt-[4px] flex items-center gap-[6px] text-[10px] font-semibold text-[#1d2b58]">
                <span onClick={() => router.push("/")} className="cursor-pointer transition hover:text-[#075b33]">Dashboard</span>
                <span className="text-[#7b8597]">›</span>
                <span onClick={() => router.push("/blogs")} className="cursor-pointer transition hover:text-[#075b33]">Blog &amp; Insights</span>
                <span className="text-[#7b8597]">›</span>
                <span className="text-[#075b33]">Reports &amp; Resources</span>
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
              Add New Report
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

        <section className="mt-[10px] grid grid-cols-4 gap-[10px]">
          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Reports"
            value={loading ? "–" : String(reports.length)}
            note="In Reports & Resources"
          />
          <MetricCard
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Published"
            value={loading ? "–" : String(published)}
            note="Visible on website"
          />
          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Hidden"
            value={loading ? "–" : String(reports.length - published)}
            note="Not visible on website"
          />
          <MetricCard
            icon={<Download className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-blue-50 text-blue-700"
            label="Downloads"
            value={loading ? "–" : String(totalDownloads)}
            note="From the website"
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
                placeholder="Search reports..."
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
                    <th className="px-[12px] whitespace-nowrap">Report</th>
                    <th className="px-[12px] whitespace-nowrap">File</th>
                    <th className="px-[12px] text-center whitespace-nowrap">Downloads</th>
                    <th className="px-[12px] text-center whitespace-nowrap">Status</th>
                    <th className="px-[12px] text-center">Order</th>
                    <th className="px-[12px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">Loading reports…</td>
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
                        {reports.length ? "No report matches these filters." : "No reports yet. Upload the first PDF with “Add New Report”."}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item) => (
                      <tr key={item._id} className="h-[64px] border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/50">
                        <td className="px-[12px]">
                          <div className="flex min-w-[300px] items-center gap-[12px]">
                            <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[8px] bg-[#eef7f1] text-[#147044]">
                              <FileText className="h-[17px] w-[17px]" />
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[420px] truncate text-[11px] font-extrabold text-[#19274a]" title={item.title}>{item.title}</p>
                              {item.description && (
                                <p className="mt-[3px] max-w-[420px] truncate text-[9.5px] font-semibold text-[#68758d]" title={item.description}>{item.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-[12px]">
                          {item.fileUrl ? (
                            <>
                              <a
                                href={item.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-[260px] items-center gap-[5px] text-[9.5px] font-semibold text-[#2563eb] hover:underline"
                                title="Open the PDF"
                              >
                                <ExternalLink className="h-[12px] w-[12px] shrink-0" />
                                <span className="truncate">{item.fileName || "Open PDF"}</span>
                              </a>
                              <p className="mt-[3px] text-[9px] font-semibold text-[#68758d]">PDF · {formatFileSize(item.fileSize)}</p>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openEdit(item)}
                              className="inline-flex items-center gap-[5px] rounded-[5px] border border-amber-200 bg-amber-50 px-[8px] py-[4px] text-[9px] font-bold text-amber-700 hover:bg-amber-100"
                              title="Upload the PDF for this report"
                            >
                              <FileUp className="h-[11px] w-[11px]" />
                              No PDF yet — upload
                            </button>
                          )}
                        </td>
                        <td className="px-[12px] text-center">
                          <span className="text-[10px] font-extrabold text-[#2563eb]">{item.downloads || 0}</span>
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
                Showing {firstShown} to {lastShown} of {filtered.length} report{filtered.length === 1 ? "" : "s"}
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
        title={editing ? "Edit Report" : "Add New Report"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeForm} disabled={saving || uploading}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form="blog-report-form" loading={saving} disabled={uploading}>
              {editing ? "Save Changes" : "Add Report"}
            </Button>
          </>
        }
      >
        <form id="blog-report-form" onSubmit={save} className="space-y-4" noValidate>
          <div>
            <p className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-[#18233b]">
              PDF File
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => void pickPdf(e.target.files?.[0])}
            />
            {form.fileUrl ? (
              <div className="flex items-center gap-3 rounded-[8px] border border-[#d6e9dc] bg-[#f4faf6] px-3 py-2.5">
                <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[8px] bg-white text-[#147044] ring-1 ring-[#d6e9dc]">
                  <FileText className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold text-[#19274a]">{form.fileName || "Uploaded PDF"}</p>
                  <p className="text-[11px] text-[#68758d]">PDF · {formatFileSize(form.fileSize)}</p>
                </div>
                <a href={form.fileUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-semibold text-[#2563eb] hover:underline">
                  Open
                </a>
                <Button type="button" variant="secondary" size="sm" loading={uploading} onClick={() => fileRef.current?.click()}>
                  <FileUp className="h-[14px] w-[14px]" />
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading}
                  onClick={() => setForm((prev) => ({ ...prev, fileUrl: "", fileName: "", fileSize: 0 }))}
                  title="Remove the PDF (the website will show Coming soon)"
                >
                  <X className="h-[14px] w-[14px]" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-[8px] border-2 border-dashed border-[#cfdde3] bg-[#fafbfc] px-4 py-6 text-center transition hover:border-[#075b33] hover:bg-[#f4faf6] disabled:opacity-60"
              >
                <FileUp className="h-[22px] w-[22px] text-[#147044]" />
                <span className="text-[12px] font-semibold text-[#19274a]">{uploading ? "Uploading…" : "Choose a PDF to upload"}</span>
                <span className="text-[11px] text-[#68758d]">PDF only, up to {L.maxFileMB} MB</span>
              </button>
            )}
            {!form.fileUrl && !uploading && (
              <p className="mt-1.5 text-[11px] font-medium text-amber-700">
                Without a PDF the report is listed on the website as “Coming soon” and cannot be downloaded.
              </p>
            )}
          </div>

          <Input
            label="Report Title"
            required
            value={form.title}
            maxLength={L.title}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="e.g. Organic Industry Report 2026"
            hint="Shown on the website and used as the downloaded file's name."
          />

          <Textarea
            label="Short Description (optional)"
            rows={2}
            value={form.description}
            maxLength={L.description}
            onChange={(e) => setField("description", e.target.value)}
            placeholder="A line about what is inside (shown on the View all page)."
            hint={`${form.description.trim().length}/${L.description} characters`}
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
              hint="Lower numbers are shown first; the blog page shows the first five."
            />
          </div>

          {formError && (
            <p className="flex items-start gap-1.5 text-[11.5px] font-semibold text-red-600">
              <X className="mt-[2px] h-[13px] w-[13px] shrink-0" />
              {formError}
            </p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete report?"
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
