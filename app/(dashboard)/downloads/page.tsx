"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download as DownloadIcon,
  Eye,
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
import { Input, Select } from "@/components/ui/Input";
import { ApiRequestError } from "@/lib/api";
import { DOWNLOAD_LIMITS, downloadsApi, type AuditUser, type DownloadItem, type DownloadStatus } from "@/lib/downloadsApi";

/*
 * Downloads — the PDFs in the website navbar's "Download" menu (after Contact).
 * Only Active items are shown there, in Order By order.
 */

const SORTS = ["Sort By: Order", "Sort By: Newest", "Sort By: Name A-Z"] as const;
const PAGE_SIZES = [10, 20, 50];
const MAX_BYTES = DOWNLOAD_LIMITS.maxPdfMb * 1024 * 1024;

const errorText = (err: unknown, fallback: string) =>
  err instanceof ApiRequestError || err instanceof Error ? err.message || fallback : fallback;

type FormState = { name: string; status: DownloadStatus; orderBy: string; file: File | null };

const emptyForm = (orderBy: number): FormState => ({ name: "", status: "active", orderBy: String(orderBy), file: null });

const formatSize = (bytes: number) => {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso?: string) => {
  const d = iso ? new Date(iso) : null;
  return d && !Number.isNaN(d.getTime())
    ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";
};

/** Checks the picked file is a PDF within the size limit; "" when fine */
const pdfProblem = (file: File) => {
  const isPdf = file.type === "application/pdf" && /\.pdf$/i.test(file.name);
  if (!isPdf) return "Only PDF files are allowed.";
  if (file.size > MAX_BYTES) return `The PDF must be ${DOWNLOAD_LIMITS.maxPdfMb} MB or smaller.`;
  if (file.size === 0) return "This PDF is empty.";
  return "";
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

function AuditCell({ user, at }: { user: AuditUser | null; at: string }) {
  return (
    <div className="min-w-[120px]">
      <p className="text-[10px] font-bold text-[#19274a]">{user?.name || user?.email || "—"}</p>
      <p className="mt-[3px] text-[9px] font-semibold text-[#68758d]">{formatDate(at)}</p>
    </div>
  );
}

export default function DownloadsPage() {
  const router = useRouter();
  const [items, setItems] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Sort By: Order");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [editing, setEditing] = useState<DownloadItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(1));
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [deleting, setDeleting] = useState<DownloadItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setItems(await downloadsApi.list());
    } catch (err) {
      setLoadError(errorText(err, "Could not load the downloads."));
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

  const nextOrder = useMemo(() => items.reduce((max, d) => Math.max(max, d.orderBy), 0) + 1, [items]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm(nextOrder));
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (item: DownloadItem) => {
    setEditing(item);
    setForm({ name: item.name, status: item.status, orderBy: String(item.orderBy), file: null });
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
  };

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm((prev) => ({ ...prev, [field]: value }));

  const pickFile = (file?: File) => {
    if (fileRef.current) fileRef.current.value = "";
    if (!file) return;
    const problem = pdfProblem(file);
    if (problem) {
      setFormError(problem);
      return;
    }
    setFormError("");
    setForm((prev) => ({
      ...prev,
      file,
      // A new item without a name yet takes the file name
      name: prev.name.trim() ? prev.name : file.name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim().slice(0, DOWNLOAD_LIMITS.name),
    }));
  };

  const formProblem = (): string => {
    const name = form.name.trim();
    if (!name) return "Name is required.";
    if (name.length < 2) return "Name must be at least 2 characters.";
    if (name.length > DOWNLOAD_LIMITS.name) return `Name can be at most ${DOWNLOAD_LIMITS.name} characters.`;
    const duplicate = items.some((d) => d._id !== editing?._id && d.name.trim().toLowerCase() === name.toLowerCase());
    if (duplicate) return `A download named "${name}" already exists.`;
    if (!editing && !form.file) return "Please choose a PDF file.";
    if (form.file) {
      const problem = pdfProblem(form.file);
      if (problem) return problem;
    }
    const orderBy = Number(form.orderBy);
    if (form.orderBy.trim() === "" || !Number.isInteger(orderBy) || orderBy < 0 || orderBy > DOWNLOAD_LIMITS.orderBy) {
      return `Order By must be a whole number from 0 to ${DOWNLOAD_LIMITS.orderBy}.`;
    }
    return "";
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = formProblem();
    if (problem) {
      setFormError(problem);
      return;
    }
    const payload = { name: form.name.trim().replace(/\s+/g, " "), status: form.status, orderBy: Number(form.orderBy), file: form.file };
    setSaving(true);
    setFormError("");
    try {
      if (editing) await downloadsApi.update(editing._id, payload);
      else await downloadsApi.create(payload);
      setNotice({ tone: "ok", text: `"${payload.name}" ${editing ? "saved" : "added"}.` });
      setFormOpen(false);
      await load();
    } catch (err) {
      setFormError(errorText(err, "Could not save the download."));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item: DownloadItem) => {
    const status: DownloadStatus = item.status === "active" ? "inactive" : "active";
    setItems((list) => list.map((d) => (d._id === item._id ? { ...d, status } : d)));
    try {
      await downloadsApi.update(item._id, { status });
      setNotice({ tone: "ok", text: `"${item.name}" is now ${status === "active" ? "shown in" : "hidden from"} the website's Download menu.` });
      await load();
    } catch (err) {
      setItems((list) => list.map((d) => (d._id === item._id ? { ...d, status: item.status } : d)));
      setNotice({ tone: "error", text: errorText(err, "Could not change the status.") });
    }
  };

  const viewPdf = async (item: DownloadItem) => {
    try {
      await downloadsApi.openPdf(item._id);
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not open this PDF.") });
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await downloadsApi.remove(deleting._id);
      setNotice({ tone: "ok", text: `"${deleting.name}" deleted.` });
      setDeleting(null);
      await load();
    } catch (err) {
      setNotice({ tone: "error", text: errorText(err, "Could not delete the download.") });
      setDeleting(null);
    } finally {
      setDeleteBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = items.filter((d) => {
      const searchMatch = !q || `${d.name} ${d.fileName} ${d.addedBy?.name ?? ""} ${d.updatedBy?.name ?? ""}`.toLowerCase().includes(q);
      const statusMatch = statusFilter === "All Status" || (statusFilter === "Active" ? d.status === "active" : d.status === "inactive");
      return searchMatch && statusMatch;
    });
    const time = (s: string) => new Date(s).getTime() || 0;
    if (sort === "Sort By: Order") list = [...list].sort((a, b) => a.orderBy - b.orderBy || time(a.createdAt) - time(b.createdAt));
    if (sort === "Sort By: Newest") list = [...list].sort((a, b) => time(b.createdAt) - time(a.createdAt));
    if (sort === "Sort By: Name A-Z") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [items, query, statusFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const firstShown = filtered.length ? (currentPage - 1) * pageSize + 1 : 0;
  const lastShown = (currentPage - 1) * pageSize + pageItems.length;

  const active = items.filter((d) => d.status === "active").length;
  const filtersActive = query !== "" || statusFilter !== "All Status" || sort !== "Sort By: Order";
  const COLS = 7;

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
              <h1 className="text-[22px] font-extrabold leading-none tracking-[-0.03em] text-[#075b33]">Downloads</h1>
              <nav className="mt-[4px] flex items-center gap-[6px] text-[10px] font-semibold text-[#1d2b58]">
                <span onClick={() => router.push("/")} className="cursor-pointer transition hover:text-[#075b33]">Dashboard</span>
                <span className="text-[#7b8597]">›</span>
                <span>Content Management</span>
                <span className="text-[#7b8597]">›</span>
                <span className="text-[#075b33]">Downloads</span>
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
              Add New Download
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
            icon={<FileText className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-emerald-50 text-emerald-700"
            label="Total Downloads"
            value={loading ? "–" : String(items.length)}
            note="PDF files"
          />
          <MetricCard
            icon={<DownloadIcon className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-violet-50 text-violet-700"
            label="Active"
            value={loading ? "–" : String(active)}
            note="In the website's Download menu"
          />
          <MetricCard
            icon={<EyeOff className="h-[16px] w-[16px]" strokeWidth={1.7} />}
            iconClass="bg-amber-50 text-amber-700"
            label="Inactive"
            value={loading ? "–" : String(items.length - active)}
            note="Not shown on the website"
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
                placeholder="Search downloads..."
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
              <option>Active</option>
              <option>Inactive</option>
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
                    <th className="px-[12px] whitespace-nowrap">Name</th>
                    <th className="px-[12px] text-center whitespace-nowrap">File Format</th>
                    <th className="px-[12px] text-center whitespace-nowrap">Status</th>
                    <th className="px-[12px] text-center whitespace-nowrap">Order By</th>
                    <th className="px-[12px] whitespace-nowrap">Added By</th>
                    <th className="px-[12px] whitespace-nowrap">Updated By</th>
                    <th className="px-[12px] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && items.length === 0 ? (
                    <tr>
                      <td colSpan={COLS} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">Loading downloads…</td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={COLS} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-red-600">
                        {loadError}{" "}
                        <button type="button" onClick={() => void load()} className="underline">Try again</button>
                      </td>
                    </tr>
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={COLS} className="px-[12px] py-[28px] text-center text-[10.5px] font-semibold text-[#68758d]">
                        {items.length ? "No download matches these filters." : "No downloads yet. Add the first PDF."}
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((item) => (
                      <tr key={item._id} className="h-[64px] border-b border-[#eef0f2] align-middle last:border-b-0 hover:bg-slate-50/50">
                        <td className="px-[12px]">
                          <div className="flex min-w-[240px] items-center gap-[12px]">
                            <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-[8px] bg-red-50 text-red-600">
                              <FileText className="h-[18px] w-[18px]" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-extrabold text-[#19274a]">{item.name}</p>
                              <p className="mt-[4px] max-w-[320px] truncate text-[9px] font-semibold text-[#68758d]" title={item.fileName}>
                                {item.fileName || "document.pdf"}
                                {item.fileSize ? ` · ${formatSize(item.fileSize)}` : ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-[12px] text-center">
                          <span className="inline-flex rounded-[5px] border border-red-200 bg-red-50 px-[8px] py-[4px] text-[9px] font-extrabold uppercase text-red-700">PDF</span>
                        </td>
                        <td className="px-[12px] text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => void toggleStatus(item)}
                            title={item.status === "active" ? "Click to hide from the website" : "Click to show on the website"}
                            className={`inline-flex whitespace-nowrap rounded-[5px] border px-[10px] py-[5px] text-[9px] font-bold transition hover:opacity-80 ${
                              item.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="px-[12px] text-center">
                          <span className="text-[10px] font-bold text-[#34425e]">{item.orderBy}</span>
                        </td>
                        <td className="px-[12px]">
                          <AuditCell user={item.addedBy} at={item.createdAt} />
                        </td>
                        <td className="px-[12px]">
                          <AuditCell user={item.updatedBy} at={item.updatedAt} />
                        </td>
                        <td className="px-[12px]">
                          <div className="flex items-center justify-center gap-[16px]">
                            <button
                              type="button"
                              onClick={() => void viewPdf(item)}
                              className="text-[#263650] transition hover:text-[#075b33]"
                              aria-label={`View ${item.name}`}
                              title="View PDF"
                            >
                              <Eye className="h-[16px] w-[16px]" />
                            </button>
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
                Showing {firstShown} to {lastShown} of {filtered.length} download{filtered.length === 1 ? "" : "s"}
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
        title={editing ? `Edit “${editing.name}”` : "Add New Download"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={closeForm} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" type="submit" form="download-form" loading={saving}>
              {saving ? "Uploading…" : editing ? "Save Changes" : "Add Download"}
            </Button>
          </>
        }
      >
        <form id="download-form" onSubmit={save} className="space-y-4" noValidate>
          <div>
            <p className="mb-1.5 text-[12px] font-semibold text-[#34435e]">
              PDF File {!editing && <span className="text-red-500">*</span>}
            </p>
            <input ref={fileRef} type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
            <div className="flex items-center gap-3 rounded-[8px] border border-dashed border-[#cfd8d2] bg-[#fafcfb] p-3">
              <div className="grid h-[40px] w-[40px] shrink-0 place-items-center rounded-[8px] bg-red-50 text-red-600">
                <FileText className="h-[20px] w-[20px]" />
              </div>
              <div className="min-w-0 flex-1">
                {form.file ? (
                  <>
                    <p className="truncate text-[12px] font-bold text-[#19274a]">{form.file.name}</p>
                    <p className="text-[11px] text-[#68758d]">{formatSize(form.file.size)} · new file, uploads when you save</p>
                  </>
                ) : editing ? (
                  <>
                    <p className="truncate text-[12px] font-bold text-[#19274a]">{editing.fileName || "document.pdf"}</p>
                    <p className="text-[11px] text-[#68758d]">
                      {formatSize(editing.fileSize)} · current file{" "}
                      <button type="button" onClick={() => void viewPdf(editing)} className="font-semibold text-[#075b33] underline">
                        View
                      </button>
                    </p>
                  </>
                ) : (
                  <p className="text-[12px] text-[#68758d]">No file chosen</p>
                )}
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={saving}>
                <FileUp className="h-[14px] w-[14px]" />
                {form.file || editing ? "Replace PDF" : "Choose PDF"}
              </Button>
              {form.file && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setField("file", null)} disabled={saving} aria-label="Remove chosen file">
                  <X className="h-[14px] w-[14px]" />
                </Button>
              )}
            </div>
            <p className="mt-1 text-[11px] text-[#68758d]">Only PDF files, up to {DOWNLOAD_LIMITS.maxPdfMb} MB.</p>
          </div>

          <Input
            label="Name"
            required
            value={form.name}
            maxLength={DOWNLOAD_LIMITS.name}
            onChange={(e) => setField("name", e.target.value)}
            placeholder="e.g. Exhibitor Brochure 2027"
            hint="Shown in the website's Download menu and used as the downloaded file's name."
            autoFocus
          />

          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={(e) => setField("status", e.target.value as DownloadStatus)}>
              <option value="active">Active — shown on the website</option>
              <option value="inactive">Inactive — not shown on the website</option>
            </Select>
            <Input
              label="Order By"
              required
              type="number"
              min={0}
              max={DOWNLOAD_LIMITS.orderBy}
              step={1}
              value={form.orderBy}
              onChange={(e) => setField("orderBy", e.target.value)}
              hint="Lower numbers are shown first."
            />
          </div>

          {formError && <p className="text-[11.5px] font-semibold text-red-600">{formError}</p>}
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        title="Delete download?"
        description={deleting ? `"${deleting.name}" and its PDF will be removed from the admin and the website. This cannot be undone.` : ""}
        confirmLabel="Delete"
        danger
        loading={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </main>
  );
}
