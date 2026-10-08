"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, CalendarDays, ChevronDown, Download, FilePlus2, FilePen, History, RefreshCw, Search, ShieldAlert, Trash2, type LucideIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Pager from "@/components/ui/Pager";
import { kpiToneClass, type KpiStatCardItem } from "@/components/ui/KpiStatCards";
import { ApiRequestError } from "@/lib/api";
import { activityLogApi, type ActivityChange, type ActivityLogEntry, type ActivityLogFilters, type ActivityLogPage } from "@/lib/activityLogApi";
import typography from "@/app/(dashboard)/pages/PagesTypography.module.css";

/*
 * Activity Log: who added, updated or deleted what in the admin panel, from which page,
 * and from which IP. Rows are written by the backend automatically; this page only reads.
 * A link can open it pre-filtered with ?action= / ?status= / ?user= / ?module=.
 */

const PAGE_SIZE = 20;

const inputClass =
  "h-[30px] w-full rounded-[5px] border border-[#e5e6e2] bg-white px-[9px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]";
const selectClass =
  "h-[30px] max-w-[160px] cursor-pointer appearance-none truncate rounded-[5px] border border-[#e5e6e2] bg-white pl-[9px] pr-[24px] text-[9.5px] font-medium text-[#414b5e] outline-none focus:border-[#8fa98e]";
const th = "overflow-hidden truncate px-[6px] py-[5px] text-[7px] font-bold uppercase text-white";

const ACTION_TONE: Record<string, string> = {
  Created: "bg-emerald-50 text-emerald-700",
  Updated: "bg-sky-50 text-sky-700",
  Deleted: "bg-rose-50 text-rose-700",
  Login: "bg-indigo-50 text-indigo-700",
  Logout: "bg-slate-100 text-slate-600",
};

/** 08 Oct 2026, 12:18 PM */
const formatWhen = (iso: string) => {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${date}, ${time}`;
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

const errorText = (err: unknown) => (err instanceof ApiRequestError ? err.message : "Could not load the activity log.");

const csvCell = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

function FilterSelect({ value, onChange, label, children }: { value: string; onChange: (v: string) => void; label: string; children: React.ReactNode }) {
  return (
    <div className="relative shrink-0">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} className={selectClass}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-[7px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#64748b]" />
    </div>
  );
}

/** A stored value as readable text: strings as they are, everything else as JSON. */
const showValue = (value: unknown) => {
  if (value === undefined) return "—";
  if (value === null || value === "") return "(empty)";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return JSON.stringify(value, null, 1);
};

const fieldLabel = (key: string) =>
  key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());

const OPERATION_STYLE: Record<ActivityChange["operation"], { label: string; tone: string }> = {
  created: { label: "Added", tone: "bg-emerald-50 text-emerald-700" },
  updated: { label: "Updated", tone: "bg-sky-50 text-sky-700" },
  deleted: { label: "Deleted", tone: "bg-rose-50 text-rose-700" },
};

/** Old → new values of every record the action touched. */
function ChangesView({ changes }: { changes: ActivityChange[] }) {
  if (!changes.length) {
    return (
      <p className="rounded-[6px] border border-dashed border-[#e2e8f0] px-3 py-2 text-[11.5px] text-[#64748b]">
        No field-level changes were recorded for this action.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">What changed</p>
      {changes.map((change, i) => {
        const keys = [...new Set([...Object.keys(change.before ?? {}), ...Object.keys(change.after ?? {})])].filter((k) => k !== "_id");
        const style = OPERATION_STYLE[change.operation];
        return (
          <div key={`${change.entityId}-${i}`} className="overflow-hidden rounded-[6px] border border-[#e2e8f0]">
            <div className="flex items-center gap-2 border-b border-[#e2e8f0] bg-[#f8fafc] px-3 py-1.5">
              <span className={`rounded-[4px] px-1.5 py-0.5 text-[10px] font-bold ${style.tone}`}>{style.label}</span>
              <span className="text-[11.5px] font-semibold text-[#1e293b]">{fieldLabel(change.entity)}</span>
              {change.entityId && <span className="font-mono text-[10px] text-[#94a3b8]">#{change.entityId.slice(-8)}</span>}
            </div>
            <div className="max-h-[320px] overflow-auto">
              <table className="w-full table-fixed border-collapse text-left text-[11.5px]">
                <thead>
                  <tr className="bg-white text-[10px] uppercase tracking-wide text-[#94a3b8]">
                    <th className="w-[26%] px-3 py-1.5 font-semibold">Field</th>
                    {change.operation !== "created" && <th className="px-3 py-1.5 font-semibold">Old value</th>}
                    {change.operation !== "deleted" && <th className="px-3 py-1.5 font-semibold">New value</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {keys.map((key) => (
                    <tr key={key} className="align-top">
                      <td className="px-3 py-1.5 font-semibold text-[#334155]">{fieldLabel(key)}</td>
                      {change.operation !== "created" && (
                        <td className="whitespace-pre-wrap break-words bg-rose-50/40 px-3 py-1.5 text-[#9f1239]">{showValue(change.before?.[key])}</td>
                      )}
                      {change.operation !== "deleted" && (
                        <td className="whitespace-pre-wrap break-words bg-emerald-50/40 px-3 py-1.5 text-[#166534]">{showValue(change.after?.[key])}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#94a3b8]">{label}</p>
      <p className="break-words text-[12px] font-medium text-[#1e293b]">{value === undefined || value === "" ? "—" : value}</p>
    </div>
  );
}

function ActivityLogView({ initial }: { initial: ActivityLogFilters }) {
  const [filters, setFilters] = useState<ActivityLogFilters>(initial);
  const [searchInput, setSearchInput] = useState(initial.q ?? "");
  const [page, setPage] = useState(1);
  const [reloadTick, setReloadTick] = useState(0);
  const [data, setData] = useState<ActivityLogPage | null>(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ActivityLogEntry | null>(null);
  const [exporting, setExporting] = useState(false);

  const requestKey = JSON.stringify({ filters, page, reloadTick });
  const loading = loadedKey !== requestKey;

  // Search waits for a pause in typing
  useEffect(() => {
    const id = setTimeout(() => {
      const q = searchInput.trim();
      if ((filters.q ?? "") === q) return;
      setFilters((f) => ({ ...f, q }));
      setPage(1);
    }, 350);
    return () => clearTimeout(id);
  }, [searchInput, filters.q]);

  useEffect(() => {
    let cancelled = false;
    activityLogApi
      .list({ ...filters, page, limit: PAGE_SIZE })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError("");
      })
      .catch((err) => !cancelled && setError(errorText(err)))
      .finally(() => !cancelled && setLoadedKey(requestKey));
    return () => {
      cancelled = true;
    };
  }, [filters, page, requestKey]);

  const setFilter = (key: keyof ActivityLogFilters, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };
  const showOnly = (next: ActivityLogFilters) => {
    setFilters({ ...next, q: filters.q });
    setPage(1);
  };
  const clearAll = () => {
    setFilters({});
    setSearchInput("");
    setPage(1);
  };
  const hasFilters = Object.values(filters).some(Boolean);

  type TabKey = "all" | "Created" | "Updated" | "Deleted" | "Login" | "failed";
  const tab: TabKey = filters.status === "Failed" ? "failed" : ((["Created", "Updated", "Deleted", "Login"].includes(filters.action ?? "") ? filters.action : "all") as TabKey);
  const openTab = (key: TabKey) => {
    setFilters((f) => ({
      ...f,
      action: key === "all" || key === "failed" ? undefined : key,
      status: key === "failed" ? "Failed" : undefined,
    }));
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all = await activityLogApi.list({ ...filters, page: 1, limit: 5000 });
      const header = ["Date & Time", "User", "Email", "Role", "Action", "Module/Page", "URL", "IP Address", "Status", "Details", "Method", "API Path", "Old → New"];
      const rows = all.items.map((l) => [formatWhen(l.createdAt), l.userName, l.userEmail, l.userRole, l.action, l.module, l.url, l.ip, l.status, l.details, l.method, l.apiPath, l.changes?.length ? JSON.stringify(l.changes.map(({ entity, operation, before, after }) => ({ entity, operation, before, after }))) : ""]);
      const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
      const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setExporting(false);
    }
  };

  const stats = data?.stats;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 1;
  const first = (page - 1) * PAGE_SIZE;

  const card = (
    title: string,
    value: number | undefined,
    icon: LucideIcon,
    tone: KpiStatCardItem["tone"],
    colors: [string, string],
    footer: string,
    onClick: () => void
  ): KpiStatCardItem => ({
    title,
    value: value ?? 0,
    icon,
    tone,
    gradient: `linear-gradient(135deg, #ffffff 0%, #ffffff 42%, ${colors[0]} 100%)`,
    borderColor: colors[0],
    numColor: colors[1],
    footer,
    onClick,
  });

  const cards: KpiStatCardItem[] = [
    card("Total Activity", stats?.total, Activity, "emerald", ["#bbf7d0", "#15803d"], `${stats?.today ?? 0} today`, clearAll),
    card("Created", stats?.created, FilePlus2, "blue", ["#bae6fd", "#0284c7"], "Records added", () => showOnly({ action: "Created" })),
    card("Updated", stats?.updated, FilePen, "indigo", ["#c7d2fe", "#4338ca"], "Records changed", () => showOnly({ action: "Updated" })),
    card("Deleted", stats?.deleted, Trash2, "amber", ["#fed7aa", "#c2410c"], "Records removed", () => showOnly({ action: "Deleted" })),
    card("Failed", stats?.failed, ShieldAlert, "rose", ["#fecdd3", "#be123c"], `${stats?.logins ?? 0} logins in total`, () => showOnly({ status: "Failed" })),
  ];

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white px-[18px] pb-[16px] pt-[14px] text-[#18233b]`}>
      <div className="mb-[10px] grid grid-cols-2 gap-[8px] md:grid-cols-3 xl:grid-cols-5">
        {cards.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              onClick={item.onClick}
              title={item.footer}
              className="flex h-[52px] items-center gap-[8px] rounded-[9px] border px-[10px] text-left transition-all hover:-translate-y-px"
              style={{ background: item.gradient, borderColor: item.borderColor, boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
            >
              <span className={`grid h-[24px] w-[24px] shrink-0 place-items-center rounded-full bg-white/80 ring-1 ${kpiToneClass[item.tone]}`}>
                <Icon className="h-[12px] w-[12px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[10.2px] font-semibold leading-tight text-[#0f172a]">{item.title}</span>
                <span className="mt-[2px] flex items-baseline gap-[6px]">
                  <span className="text-[15px] font-bold leading-none tracking-[-0.03em]" style={{ color: item.numColor }}>
                    {stats ? item.value : "–"}
                  </span>
                  <span className="truncate text-[9.8px] font-medium leading-none text-[#64748b]">{item.footer}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-col overflow-hidden border border-[#e8e5df] bg-white">
        {/* TABS */}
        <div className="flex flex-wrap items-center gap-x-[20px] gap-y-[4px] border-b border-[#e8e5df] px-[16px] pt-[11px]">
          {(
            [
              ["all", "All Activity", stats?.total],
              ["Created", "Created", stats?.created],
              ["Updated", "Updated", stats?.updated],
              ["Deleted", "Deleted", stats?.deleted],
              ["Login", "Logins", stats?.logins],
              ["failed", "Failed", stats?.failed],
            ] as [TabKey, string, number | undefined][]
          ).map(([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => openTab(key)}
              className={`relative pb-[9px] text-[10px] font-bold transition-colors ${tab === key ? "text-[#166b40]" : "text-[#6c7587] hover:text-[#18233b]"}`}
            >
              {label} ({count ?? 0})
              {tab === key && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#166b40]" />}
            </button>
          ))}
        </div>

        {/* FILTER BAR */}
        <div className="flex items-center gap-[8px] overflow-x-auto border-b border-[#f0f0ec] px-[16px] py-[10px]">
          <div className="relative min-w-[180px] flex-1">
            <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search user, module, URL, IP or details…"
              className={`${inputClass} pl-[26px]`}
            />
          </div>
          <FilterSelect label="User" value={filters.user ?? ""} onChange={(v) => setFilter("user", v)}>
            <option value="">All users</option>
            {data?.filters.users.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect label="Module" value={filters.module ?? ""} onChange={(v) => setFilter("module", v)}>
            <option value="">All modules</option>
            {data?.filters.modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </FilterSelect>
          {/* Date range in one box */}
          <div className="flex h-[30px] shrink-0 items-center gap-[4px] rounded-[5px] border border-[#e5e6e2] bg-white px-[8px] text-[9.5px] font-medium text-[#414b5e] focus-within:border-[#8fa98e]">
            <CalendarDays className="h-[12px] w-[12px] shrink-0 text-[#9aa0aa]" />
            <input
              type="date"
              value={filters.from ?? ""}
              max={filters.to || undefined}
              onChange={(e) => setFilter("from", e.target.value)}
              aria-label="From date"
              className="w-[92px] bg-transparent outline-none"
            />
            <span className="text-[#9aa0aa]">to</span>
            <input
              type="date"
              value={filters.to ?? ""}
              min={filters.from || undefined}
              onChange={(e) => setFilter("to", e.target.value)}
              aria-label="To date"
              className="w-[92px] bg-transparent outline-none"
            />
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={clearAll}
              className="flex h-[30px] shrink-0 items-center whitespace-nowrap rounded-[5px] border border-[#cfe3d6] bg-[#eef7f1] px-[10px] text-[9.5px] font-semibold text-[#166b40] hover:bg-[#e3f1e8]"
            >
              Clear ✕
            </button>
          )}
          <button
            type="button"
            onClick={() => setReloadTick((n) => n + 1)}
            className="flex h-[30px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-[5px] border border-[#e5e6e2] bg-white px-[10px] text-[9.5px] font-semibold text-[#414b5e] hover:bg-slate-50"
          >
            <RefreshCw className={`h-[11px] w-[11px] ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting || total === 0}
            className="flex h-[30px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-[5px] border border-[#233D4D] bg-[#233D4D] px-[10px] text-[9.5px] font-semibold text-white hover:bg-[#1b3140] disabled:opacity-40"
          >
            <Download className="h-[11px] w-[11px]" /> {exporting ? "Exporting…" : "Export CSV"}
          </button>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] table-fixed border-collapse text-left">
            <thead>
              <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                <th className={`${th} w-[112px] pl-[14px]`}>Date &amp; Time</th>
                <th className={`${th} w-[150px]`}>User</th>
                <th className={`${th} w-[96px]`}>Action</th>
                <th className={`${th} w-[160px]`}>Module/Page</th>
                <th className={`${th} w-[200px]`}>URL</th>
                <th className={`${th} w-[116px]`}>IP Address</th>
                <th className={`${th} w-[90px]`}>Status</th>
                <th className={`${th} pr-[14px]`}>Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f0ec]">
              {loading && !data ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[10px] text-[#6c7587]">
                    Loading activity…
                  </td>
                </tr>
              ) : error && !data ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[10px] font-semibold text-red-600">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-14">
                    <div className="flex flex-col items-center text-center">
                      <span className="mb-[8px] grid h-[38px] w-[38px] place-items-center rounded-full bg-[#eef6f1] text-[#166b40]">
                        <History className="h-[17px] w-[17px]" />
                      </span>
                      <p className="text-[11px] font-bold text-[#263148]">{hasFilters ? "No activity matches your filters" : "No activity yet"}</p>
                      <p className="mt-[3px] max-w-[360px] text-[9px] font-medium leading-snug text-[#6c7587]">
                        {hasFilters
                          ? "Try another tab, user, module or date range."
                          : "Every add, update, delete and login in the admin panel will be listed here with the user, page and IP address."}
                      </p>
                      {hasFilters && (
                        <button type="button" onClick={clearAll} className="mt-[8px] text-[9.5px] font-bold text-[#166b40] hover:underline">
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((log) => (
                  <tr key={log._id} className={`cursor-pointer align-middle transition hover:bg-slate-50/80 ${loading ? "opacity-60" : ""}`} onClick={() => setSelected(log)}>
                    <td className="py-[8px] pl-[14px] pr-[6px]" title={formatWhen(log.createdAt)}>
                      <span className="block truncate text-[8px] font-semibold text-[#334155]">{formatDate(log.createdAt)}</span>
                      <span className="block truncate text-[7px] font-medium text-[#9aa0aa]">{formatTime(log.createdAt)}</span>
                    </td>
                    <td className="px-[6px] py-[8px]">
                      <span className="block truncate text-[8.5px] font-bold text-[#4B1426]" title={log.userName}>
                        {log.userName}
                      </span>
                      {log.userRole && <span className="block truncate text-[7px] font-medium text-[#9aa0aa]">{log.userRole}</span>}
                    </td>
                    <td className="px-[6px] py-[8px]">
                      <span className={`inline-flex h-[20px] items-center rounded-[4px] px-[6px] text-[7px] font-bold ${ACTION_TONE[log.action] ?? "bg-amber-50 text-amber-700"}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="truncate px-[6px] py-[8px] text-[7.5px] font-bold text-[#166534]" title={log.module}>
                      {log.module}
                    </td>
                    <td className="truncate px-[6px] py-[8px] font-mono text-[7px] text-[#475569]" title={log.url}>
                      {log.url}
                    </td>
                    <td className="truncate px-[6px] py-[8px] font-mono text-[7px] text-[#475569]">{log.ip || "—"}</td>
                    <td className="px-[6px] py-[8px]">
                      <span
                        className={`inline-flex h-[20px] items-center rounded-[4px] px-[6px] text-[7px] font-bold ${
                          log.status === "Success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="truncate py-[8px] pl-[6px] pr-[14px] text-[7.5px] font-medium text-[#334155]" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {error && data && <p className="border-t border-[#f0f0ec] px-[12px] py-[6px] text-[8px] font-semibold text-red-600">{error}</p>}

        {total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[8px] text-[8px]">
            <span className="font-semibold text-[#5f6a7c]">
              Showing {first + 1} to {Math.min(first + PAGE_SIZE, total)} of {total} activities
            </span>
            <Pager page={page} pages={pages} onPage={setPage} />
          </div>
        )}
      </div>

      <Modal isOpen={selected !== null} onClose={() => setSelected(null)} title={selected ? `${selected.action} · ${selected.module}` : "Activity"} size="lg">
        {selected && (
          <div className="space-y-4">
            <p className="rounded-[6px] bg-[#f8fafc] px-3 py-2 text-[12.5px] font-medium text-[#1e293b]">{selected.details || "—"}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
              <Detail label="Date & Time" value={formatWhen(selected.createdAt)} />
              <Detail label="User" value={selected.userName} />
              <Detail label="Email" value={selected.userEmail} />
              <Detail label="Role" value={selected.userRole} />
              <Detail label="Action" value={selected.action} />
              <Detail label="Status" value={`${selected.status} (${selected.statusCode})`} />
              <Detail label="Module/Page" value={selected.module} />
              <Detail label="Page URL" value={selected.url} />
              <Detail label="IP Address" value={selected.ip} />
              <Detail label="Request" value={`${selected.method} ${selected.apiPath}`} />
              <Detail label="Record ID" value={selected.entityId} />
              <Detail label="Time Taken" value={selected.durationMs !== undefined ? `${selected.durationMs} ms` : undefined} />
            </div>
            <ChangesView changes={selected.changes ?? []} />
            <Detail label="Browser / Device" value={selected.userAgent} />
          </div>
        )}
      </Modal>
    </div>
  );
}

function ActivityLogPageInner() {
  const searchParams = useSearchParams();
  const pick = (key: string) => searchParams.get(key) ?? undefined;
  const initial: ActivityLogFilters = { action: pick("action"), status: pick("status"), user: pick("user"), module: pick("module") };
  // Remount when a link changes the query (e.g. ?action=Login)
  return <ActivityLogView key={searchParams.toString()} initial={initial} />;
}

export default function ActivityLogPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-text-secondary">Loading…</div>}>
      <ActivityLogPageInner />
    </Suspense>
  );
}
