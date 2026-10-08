"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  FileStack,
  Info,
  Layers,
  ListChecks,
  ListX,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { kpiToneClass, type KpiStatCardItem } from "@/components/ui/KpiStatCards";
import Modal from "@/components/ui/Modal";
import { ApiRequestError } from "@/lib/api";
import { dropdownsApi, type DropdownListInfo, type DropdownOption } from "@/lib/dropdownsApi";
import typography from "@/app/(dashboard)/pages/PagesTypography.module.css";

/*
 * Dropdown Manager in the admin's list-page style (same as Job Postings): stat cards, then one
 * table of every dropdown on the website with a tab per website page, and a "Manage" popup to
 * add, edit, reorder, show / hide or delete a dropdown's options.
 */

const LIST_PAGE_SIZE = 10;
const OPTION_PAGE_SIZE = 8;

type FormState = { label: string; value: string; parentValue: string; isActive: boolean };
const EMPTY_FORM: FormState = { label: "", value: "", parentValue: "", isActive: true };

type StatusFilter = "all" | "hidden" | "empty";
const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "hidden", label: "Has hidden options" },
  { value: "empty", label: "Empty dropdowns" },
];
const matchesStatus = (l: DropdownListInfo, f: StatusFilter) => f === "all" || (f === "hidden" ? l.active < l.total : l.total === 0);

const errorText = (err: unknown, fallback: string) => (err instanceof ApiRequestError ? err.message : fallback);

/** Other managers on the Dropdown Manager page, listed in the "Other Settings" card */
export type ManagerTile<K extends string = string> = { key: K; label: string; description: string; icon: LucideIcon };

/* Same control styles as the Job Postings page */
const inputClass =
  "h-[30px] w-full rounded-[5px] border border-[#e5e6e2] bg-white px-[9px] text-[9.5px] font-medium text-[#414b5e] outline-none placeholder:text-[#9aa0aa] focus:border-[#8fa98e]";
const selectClass =
  "h-[30px] cursor-pointer appearance-none rounded-[5px] border border-[#e5e6e2] bg-white pl-[9px] pr-[24px] text-[9.5px] font-medium text-[#414b5e] outline-none focus:border-[#8fa98e]";
const th = "overflow-hidden truncate px-[6px] py-[5px] text-[7px] font-bold uppercase text-white";
const iconButton = (tone: "blue" | "red" | "slate") =>
  `flex h-[25px] w-[25px] items-center justify-center rounded-[6px] border backdrop-blur-md transition-all hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-30 ${
    tone === "blue"
      ? "border-blue-400/30 bg-blue-500/10 text-blue-600 shadow-[0_2px_6px_rgba(37,99,235,0.12)] hover:bg-blue-500/20"
      : tone === "red"
        ? "border-red-400/30 bg-red-500/10 text-red-600 shadow-[0_2px_6px_rgba(220,38,38,0.12)] hover:bg-red-500/20"
        : "border-slate-300 bg-white text-[#334155] hover:bg-slate-50"
  }`;

function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  const box = "flex h-[22px] min-w-[22px] items-center justify-center rounded-[4px] border px-1.5 text-[8px] font-bold transition";
  return (
    <div className="flex items-center gap-[4px]">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous page" className={`${box} border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50 disabled:opacity-30`}>
        <ChevronLeft className="h-3 w-3" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          aria-current={n === page ? "page" : undefined}
          className={`${box} ${n === page ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs" : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"}`}
        >
          {n}
        </button>
      ))}
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next page" className={`${box} border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50 disabled:opacity-30`}>
        <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

export default function DropdownListsManager<K extends string>({
  managers = [],
  onOpenManager,
}: {
  managers?: readonly ManagerTile<K>[];
  onOpenManager?: (key: K) => void;
}) {
  /* ---------- all dropdowns (the table) ---------- */
  const [lists, setLists] = useState<DropdownListInfo[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listsError, setListsError] = useState("");
  const [pageTab, setPageTab] = useState(""); // "" = all website pages
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [listPage, setListPage] = useState(1);

  /* ---------- the dropdown open in the "Manage" popup ---------- */
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [parentOptions, setParentOptions] = useState<DropdownOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionSearch, setOptionSearch] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [page, setPage] = useState(1);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState<DropdownOption | null>(null);
  const [deleting, setDeleting] = useState(false);

  const selected = lists.find((l) => l.key === selectedKey) ?? null;
  const parentKey = selected?.parent;
  const isDependent = Boolean(parentKey);

  /* ---------- loading ---------- */

  const fetchLists = useCallback(
    () =>
      dropdownsApi
        .lists()
        .then((data) => {
          setLists(data);
          setListsError("");
        })
        .catch((err) => setListsError(errorText(err, "Could not load dropdown lists.")))
        .finally(() => setListsLoading(false)),
    []
  );

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const refreshCounts = () => dropdownsApi.lists().then(setLists).catch(() => {});

  // Keyed on the list (not the list object) so refreshing the counts does not reload the options.
  useEffect(() => {
    if (!selectedKey) return;
    let cancelled = false;
    Promise.all([
      dropdownsApi.options(selectedKey),
      parentKey ? dropdownsApi.options(parentKey) : Promise.resolve([] as DropdownOption[]),
    ])
      .then(([own, parents]) => {
        if (cancelled) return;
        setOptions(own);
        setParentOptions(parents);
      })
      .catch((err) => !cancelled && setError(errorText(err, "Could not load options.")))
      .finally(() => !cancelled && setOptionsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedKey, parentKey]);

  const openManage = (key: string) => {
    setSelectedKey(key);
    setOptions([]);
    setParentOptions([]);
    setOptionsLoading(true);
    setOptionSearch("");
    setParentFilter("");
    setPage(1);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setNotice("");
  };
  const closeManage = useCallback(() => setSelectedKey(null), []);

  /* ---------- derived ---------- */

  // Website pages in API order, for the tabs
  const pageNames = useMemo(() => [...new Set(lists.map((l) => l.group))], [lists]);

  const filteredLists = useMemo(() => {
    const term = search.trim().toLowerCase();
    return lists.filter(
      (l) =>
        (!pageTab || l.group === pageTab) &&
        matchesStatus(l, statusFilter) &&
        (!term || [l.name, l.key, l.group, ...l.usedIn].join(" ").toLowerCase().includes(term))
    );
  }, [lists, pageTab, statusFilter, search]);

  const listPages = Math.max(1, Math.ceil(filteredLists.length / LIST_PAGE_SIZE));
  const safeListPage = Math.min(listPage, listPages);
  const listStart = (safeListPage - 1) * LIST_PAGE_SIZE;
  const listRows = filteredLists.slice(listStart, listStart + LIST_PAGE_SIZE);

  const totals = useMemo(
    () => ({
      options: lists.reduce((n, l) => n + l.total, 0),
      shown: lists.reduce((n, l) => n + l.active, 0),
      empty: lists.filter((l) => l.total === 0).length,
    }),
    [lists]
  );

  // Options sorted the way the website shows them (by parent, then order).
  const sortedOptions = useMemo(
    () =>
      [...options].sort(
        (a, b) => a.parentValue.localeCompare(b.parentValue) || a.order - b.order || a.createdAt.localeCompare(b.createdAt)
      ),
    [options]
  );

  const visibleOptions = useMemo(() => {
    const term = optionSearch.trim().toLowerCase();
    return sortedOptions.filter(
      (o) =>
        (!parentFilter || o.parentValue === parentFilter) &&
        (!term || o.label.toLowerCase().includes(term) || o.value.toLowerCase().includes(term))
    );
  }, [sortedOptions, optionSearch, parentFilter]);

  const parentLabel = (value: string) => parentOptions.find((p) => p.value === value)?.label ?? value;

  /* ---------- actions ---------- */

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, parentValue: parentFilter });
  };

  const startEdit = (option: DropdownOption) => {
    setEditingId(option._id);
    setForm({ label: option.label, value: option.value, parentValue: option.parentValue, isActive: option.isActive });
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!form.label.trim()) return setError("Please type the option name.");
    if (isDependent && !form.parentValue) return setError(`Please choose a ${selected.parentName}.`);

    setSaving(true);
    setError("");
    try {
      const payload = {
        label: form.label.trim(),
        value: form.value.trim() || form.label.trim(),
        isActive: form.isActive,
        ...(isDependent ? { parentValue: form.parentValue } : {}),
      };
      if (editingId) {
        const updated = await dropdownsApi.update(editingId, payload);
        setOptions((prev) => prev.map((o) => (o._id === editingId ? updated : o)));
        flash("Option updated.");
      } else {
        const created = await dropdownsApi.create(selected.key, payload);
        setOptions((prev) => [...prev, created]);
        setPage(Number.MAX_SAFE_INTEGER); // clamped to the last page, where the new option is
        flash("Option added.");
      }
      resetForm();
      refreshCounts();
    } catch (err) {
      setError(errorText(err, "Could not save the option."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (option: DropdownOption) => {
    setBusyId(option._id);
    try {
      const updated = await dropdownsApi.update(option._id, { isActive: !option.isActive });
      setOptions((prev) => prev.map((o) => (o._id === option._id ? updated : o)));
      refreshCounts();
    } catch (err) {
      setError(errorText(err, "Could not change the status."));
    } finally {
      setBusyId(null);
    }
  };

  /** Swaps an option with its neighbour inside the same parent group and saves the whole order. */
  const move = async (option: DropdownOption, direction: -1 | 1) => {
    if (!selected) return;
    const group = sortedOptions.filter((o) => o.parentValue === option.parentValue);
    const index = group.findIndex((o) => o._id === option._id);
    const target = index + direction;
    if (target < 0 || target >= group.length) return;

    const reorderedGroup = [...group];
    [reorderedGroup[index], reorderedGroup[target]] = [reorderedGroup[target], reorderedGroup[index]];
    const others = sortedOptions.filter((o) => o.parentValue !== option.parentValue);
    const ids = [...others, ...reorderedGroup].map((o) => o._id);

    setBusyId(option._id);
    try {
      setOptions(await dropdownsApi.reorder(selected.key, ids));
    } catch (err) {
      setError(errorText(err, "Could not save the new order."));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await dropdownsApi.remove(pendingDelete._id);
      setOptions((prev) => prev.filter((o) => o._id !== pendingDelete._id));
      if (editingId === pendingDelete._id) resetForm();
      setPendingDelete(null);
      refreshCounts();
      flash("Option deleted.");
    } catch (err) {
      setPendingDelete(null);
      setError(errorText(err, "Could not delete the option."));
    } finally {
      setDeleting(false);
    }
  };

  /* ---------- render ---------- */

  const optionPages = Math.max(1, Math.ceil(visibleOptions.length / OPTION_PAGE_SIZE));
  const currentPage = Math.min(page, optionPages);
  const firstRow = (currentPage - 1) * OPTION_PAGE_SIZE;
  const pageRows = visibleOptions.slice(firstRow, firstRow + OPTION_PAGE_SIZE);

  const setFilter = (tab: string, status: StatusFilter = "all") => {
    setPageTab(tab);
    setStatusFilter(status);
    setSearch("");
    setListPage(1);
  };

  const stats: KpiStatCardItem[] = [
    {
      title: "Total Dropdowns",
      value: lists.length,
      icon: ListChecks,
      tone: "emerald",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bbf7d0 100%)",
      borderColor: "#bbf7d0",
      numColor: "#15803d",
      footer: "View all",
      onClick: () => setFilter(""),
    },
    {
      title: "Website Pages",
      value: pageNames.length,
      icon: Layers,
      tone: "indigo",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #c7d2fe 100%)",
      borderColor: "#c7d2fe",
      numColor: "#4338ca",
      footer: "Use the page tabs",
      onClick: () => setFilter(""),
    },
    {
      title: "Total Options",
      value: totals.options,
      icon: FileStack,
      tone: "blue",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #bae6fd 100%)",
      borderColor: "#bae6fd",
      numColor: "#0284c7",
      footer: "In every dropdown",
      onClick: () => setFilter(""),
    },
    {
      title: "Hidden Options",
      value: totals.options - totals.shown,
      icon: EyeOff,
      tone: "amber",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fed7aa 100%)",
      borderColor: "#fed7aa",
      numColor: "#c2410c",
      footer: "Show these dropdowns",
      onClick: () => setFilter("", "hidden"),
    },
    {
      title: "Empty Dropdowns",
      value: totals.empty,
      icon: ListX,
      tone: "rose",
      gradient: "linear-gradient(135deg, #ffffff 0%, #ffffff 42%, #fecdd3 100%)",
      borderColor: "#fecdd3",
      numColor: "#be123c",
      footer: totals.empty ? "Show them" : "None — all good",
      onClick: () => setFilter("", "empty"),
    },
  ];

  return (
    <div className={`${typography.pages} w-full text-[#18233b]`}>
      {/* Small stat cards in the KPI card style. Font sizes are ones the admin typography CSS does not
          enlarge (10.2px / 15px), so the cards stay compact. */}
      <div className="mb-[10px] grid grid-cols-2 gap-[8px] md:grid-cols-3 xl:grid-cols-5">
        {stats.map((item) => {
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
                    {listsLoading ? "–" : item.value}
                  </span>
                  <span className="truncate text-[9.8px] font-medium leading-none text-[#64748b]">{item.footer}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 items-start gap-[10px] xl:grid-cols-[minmax(0,2.6fr)_minmax(240px,1fr)]">
        {/* =============================================
            LEFT: ALL DROPDOWNS
        ============================================= */}
        <div className="flex min-w-0 flex-col overflow-hidden border border-[#e8e5df] bg-white">
          {/* PAGE TABS */}
          <div className="flex flex-wrap items-center gap-x-[18px] gap-y-[4px] border-b border-[#e8e5df] px-[16px] pt-[11px]">
            {["", ...pageNames].map((name) => {
              const count = name ? lists.filter((l) => l.group === name).length : lists.length;
              const active = pageTab === name;
              return (
                <button
                  key={name || "all"}
                  type="button"
                  onClick={() => {
                    setPageTab(name);
                    setListPage(1);
                  }}
                  className={`relative pb-[9px] text-[9.5px] font-bold transition-colors ${active ? "text-[#166b40]" : "text-[#6c7587] hover:text-[#18233b]"}`}
                >
                  {name || "All Pages"} ({count})
                  {active && <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full bg-[#166b40]" />}
                </button>
              );
            })}
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-wrap items-center gap-[8px] border-b border-[#f0f0ec] px-[16px] py-[10px]">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setListPage(1);
                }}
                placeholder="Search dropdown by name, e.g. Gender, Stall Size, State…"
                className={`${inputClass} pl-[26px]`}
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as StatusFilter);
                  setListPage(1);
                }}
                aria-label="Status"
                className={selectClass}
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-[7px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#64748b]" />
            </div>
            <button
              type="button"
              onClick={() => {
                setListsLoading(true);
                fetchLists();
              }}
              className="flex h-[30px] items-center gap-[5px] rounded-[5px] border border-[#e5e6e2] bg-white px-[10px] text-[9.5px] font-semibold text-[#414b5e] hover:bg-slate-50"
            >
              <RefreshCw className={`h-[11px] w-[11px] ${listsLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed border-collapse text-left">
              <thead>
                <tr className="h-[28px] border-b border-[#e8e5df] bg-[#233D4D]">
                  <th className={`${th} w-[34px] pl-[12px]`}>#</th>
                  <th className={`${th} w-[190px]`}>Dropdown</th>
                  <th className={`${th} w-[120px]`}>Website Page</th>
                  <th className={th}>Used In</th>
                  <th className={`${th} w-[120px]`}>Options</th>
                  <th className={`${th} w-[96px]`}>Status</th>
                  <th className={`${th} w-[90px] pr-[12px] text-right`}>Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {listsLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[10px] text-[#6c7587]">
                      Loading dropdowns…
                    </td>
                  </tr>
                ) : listsError ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[10px] font-semibold text-red-600">
                      {listsError}
                    </td>
                  </tr>
                ) : listRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[10px] text-[#6c7587]">
                      No dropdown matches your filters.{" "}
                      <button type="button" onClick={() => setFilter("")} className="font-bold text-[#166b40] hover:underline">
                        Clear filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  listRows.map((list, i) => {
                    const hidden = list.total - list.active;
                    const pct = list.total ? Math.round((list.active / list.total) * 100) : 0;
                    return (
                      <tr key={list.key} className="cursor-pointer transition hover:bg-slate-50/80" onClick={() => openManage(list.key)}>
                        <td className="py-[7px] pl-[12px] pr-[6px] text-[7px] font-semibold text-[#6c7587]">{listStart + i + 1}</td>
                        <td className="px-[6px] py-[7px]">
                          <span className="block truncate text-[8.5px] font-bold text-[#4B1426]">{list.name}</span>
                          <span className="block truncate text-[7px] font-medium text-[#9aa0aa]">
                            {list.parentName ? `Depends on ${list.parentName}` : list.key}
                          </span>
                        </td>
                        <td className="truncate px-[6px] py-[7px] text-[7px] font-bold text-[#166534]">{list.group}</td>
                        <td className="truncate px-[6px] py-[7px] text-[7px] font-medium text-[#334155]" title={list.usedIn.join(" · ")}>
                          {list.usedIn.join(" · ") || "—"}
                        </td>
                        <td className="px-[6px] py-[7px]">
                          <span className="text-[8px] font-bold text-[#334155]">
                            {list.active} <span className="font-medium text-[#9aa0aa]">/ {list.total} shown</span>
                          </span>
                          <span className="mt-[3px] block h-[4px] w-[80px] overflow-hidden rounded-full bg-[#eef0f2]" aria-hidden="true">
                            <span className={`block h-full rounded-full ${hidden ? "bg-amber-500" : "bg-[#166b40]"}`} style={{ width: `${pct}%` }} />
                          </span>
                        </td>
                        <td className="px-[6px] py-[7px]">
                          <span
                            className={`inline-flex h-[20px] items-center rounded-[4px] px-[6px] text-[7px] font-bold ${
                              list.total === 0 ? "bg-rose-50 text-rose-700" : hidden ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {list.total === 0 ? "Empty" : hidden ? `${hidden} hidden` : "All shown"}
                          </span>
                        </td>
                        <td className="py-[7px] pl-[6px] pr-[12px]">
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openManage(list.key);
                              }}
                              className="flex h-[25px] items-center gap-[4px] rounded-[6px] border border-blue-400/30 bg-blue-500/10 px-[8px] text-[8px] font-bold text-blue-600 shadow-[0_2px_6px_rgba(37,99,235,0.12)] transition-all hover:bg-blue-500/20 active:scale-95"
                            >
                              <Pencil className="h-[11px] w-[11px]" /> Manage
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION FOOTER */}
          {!listsLoading && filteredLists.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[8px] text-[8px]">
              <span className="font-semibold text-[#5f6a7c]">
                Showing {listStart + 1} to {Math.min(listStart + LIST_PAGE_SIZE, filteredLists.length)} of {filteredLists.length} dropdowns
              </span>
              <Pager page={safeListPage} pages={listPages} onPage={setListPage} />
            </div>
          )}
        </div>

        {/* =============================================
            RIGHT: SIDEBAR
        ============================================= */}
        <div className="flex flex-col gap-[10px]">
          {managers.length > 0 && onOpenManager && (
            <div className="border border-[#e7e7e3] bg-white p-[12px]">
              <h2 className="mb-[8px] text-[11px] font-bold text-[#263148]">Other Settings</h2>
              <div className="flex flex-col gap-[2px]">
                {managers.map(({ key, label, description, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onOpenManager(key)}
                    className="flex items-center gap-[8px] rounded-[4px] px-[6px] py-[7px] text-left transition hover:bg-slate-50"
                  >
                    <Icon className="h-[13px] w-[13px] shrink-0 text-[#218DAE]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[9.5px] font-semibold text-[#334155]">{label}</span>
                      <span className="block truncate text-[7px] font-medium text-[#9aa0aa]">{description}</span>
                    </span>
                    <ChevronRight className="h-[12px] w-[12px] shrink-0 text-[#9aa0aa]" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border border-[#e7e7e3] bg-white p-[12px]">
            <h2 className="mb-[8px] text-[11px] font-bold text-[#263148]">How to use</h2>
            <ol className="flex flex-col gap-[6px] text-[8px] font-medium leading-snug text-[#414b5e]">
              {[
                "Pick a website page tab, or search the dropdown by name.",
                "Click Manage on the dropdown you want to change.",
                "Add, rename, reorder, show / hide or delete its options in the popup.",
              ].map((step, i) => (
                <li key={step} className="flex gap-[8px]">
                  <span className="grid h-[16px] w-[16px] shrink-0 place-items-center rounded-full bg-[#eef6f1] text-[7px] font-bold text-[#166b40]">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-start gap-[9px] rounded-[6px] bg-[#eef6f1] p-[11px]">
            <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-white text-[#23714a] shadow-2xs">
              <Info className="h-[13px] w-[13px]" />
            </span>
            <p className="text-[8px] font-medium leading-snug text-[#3f5a4a]">
              <span className="font-bold text-[#23471d]">Hide instead of delete.</span> Hidden options disappear from the website but old submissions keep their value.
            </p>
          </div>
        </div>
      </div>

      {/* =============================================
          MANAGE POPUP
      ============================================= */}
      <Modal isOpen={selected !== null} onClose={closeManage} title={selected ? `Manage: ${selected.name}` : "Manage"} size="lg">
        {selected && (
          <div className={`${typography.pages} text-[#18233b]`}>
            {/* About */}
            <div className="flex flex-wrap items-center gap-x-[10px] gap-y-[4px] text-[8px] font-medium text-[#6c7587]">
              <span className="rounded-[4px] bg-[#eef6f1] px-[6px] py-[2px] font-bold text-[#166b40]">{selected.group}</span>
              <span>
                {selected.active} shown · {selected.total - selected.active} hidden
              </span>
              {selected.usedIn.length > 0 && <span className="truncate">Used in: {selected.usedIn.join(" · ")}</span>}
            </div>
            {isDependent && (
              <p className="mt-[4px] text-[8px] font-medium text-[#414b5e]">
                Each option belongs to a <strong>{selected.parentName}</strong>; the website shows only the options of the one picked.
              </p>
            )}

            {/* Add / edit */}
            <form onSubmit={handleSubmit} className={`mt-[10px] rounded-[6px] border p-[10px] ${editingId ? "border-amber-300 bg-amber-50/60" : "border-[#e8e5df] bg-[#fafafa]"}`}>
              <p className="mb-[6px] text-[9.5px] font-bold text-[#263148]">{editingId ? "Edit option" : "Add a new option"}</p>
              <div className="flex flex-wrap items-end gap-[8px]">
                {isDependent && (
                  <label className="block w-[150px]">
                    <span className="mb-[2px] block text-[7px] font-bold uppercase text-[#6c7587]">{selected.parentName} *</span>
                    <span className="relative block">
                      <select className={`${selectClass} w-full`} value={form.parentValue} onChange={(e) => setForm({ ...form, parentValue: e.target.value })}>
                        <option value="">Select…</option>
                        {parentOptions.map((p) => (
                          <option key={p._id} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-[7px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#64748b]" />
                    </span>
                  </label>
                )}
                <label className="block min-w-[160px] flex-1">
                  <span className="mb-[2px] block text-[7px] font-bold uppercase text-[#6c7587]">Option name *</span>
                  <input className={inputClass} value={form.label} maxLength={200} placeholder="e.g. Organic Foods & Beverages" onChange={(e) => setForm({ ...form, label: e.target.value })} />
                </label>
                <label className="block w-[140px]">
                  <span className="mb-[2px] block text-[7px] font-bold uppercase text-[#6c7587]">Saved value</span>
                  <input className={inputClass} value={form.value} maxLength={200} placeholder="Same as name" onChange={(e) => setForm({ ...form, value: e.target.value })} />
                </label>
                <label className="flex h-[30px] cursor-pointer items-center gap-[5px] text-[8.5px] font-semibold text-[#414b5e]">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-[12px] w-[12px] accent-[#166b40]" />
                  Show on website
                </label>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex h-[30px] items-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[12px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d] active:scale-95 disabled:opacity-60"
                >
                  {editingId ? <Pencil className="h-[11px] w-[11px]" /> : <Plus className="h-[12px] w-[12px]" />}
                  {saving ? "Saving…" : editingId ? "Update" : "Add Option"}
                </button>
                {editingId && (
                  <button type="button" onClick={resetForm} className="h-[30px] rounded-[6px] border border-[#e5e6e2] bg-white px-[10px] text-[8.5px] font-semibold text-[#414b5e] hover:bg-slate-50">
                    Cancel
                  </button>
                )}
              </div>
              {editingId && form.value !== options.find((o) => o._id === editingId)?.value && (
                <p className="mt-[4px] text-[7px] font-medium text-amber-700">Changing the saved value does not change answers already submitted with the old value.</p>
              )}
              {error && <p className="mt-[4px] text-[8px] font-semibold text-red-600">{error}</p>}
              {notice && <p className="mt-[4px] text-[8px] font-semibold text-green-700">{notice}</p>}
            </form>

            {/* Search */}
            <div className="mt-[10px] flex flex-wrap items-center gap-[8px]">
              <div className="relative min-w-[160px] flex-1">
                <Search className="pointer-events-none absolute left-[9px] top-1/2 h-[12px] w-[12px] -translate-y-1/2 text-[#9aa0aa]" />
                <input
                  className={`${inputClass} pl-[26px]`}
                  placeholder="Search options…"
                  value={optionSearch}
                  onChange={(e) => {
                    setOptionSearch(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              {isDependent && (
                <div className="relative">
                  <select
                    className={selectClass}
                    value={parentFilter}
                    onChange={(e) => {
                      setParentFilter(e.target.value);
                      setPage(1);
                      if (!editingId) setForm((f) => ({ ...f, parentValue: e.target.value }));
                    }}
                  >
                    <option value="">All {selected.parentName}</option>
                    {parentOptions.map((p) => (
                      <option key={p._id} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-[7px] top-1/2 h-[11px] w-[11px] -translate-y-1/2 text-[#64748b]" />
                </div>
              )}
            </div>

            {/* Options table */}
            <div className="mt-[8px] overflow-hidden border border-[#e8e5df]">
              <table className="w-full table-fixed border-collapse text-left">
                <thead>
                  <tr className="h-[26px] bg-[#233D4D]">
                    <th className={`${th} w-[54px] pl-[10px]`}>Order</th>
                    {isDependent && <th className={`${th} w-[110px]`}>{selected.parentName}</th>}
                    <th className={th}>Option</th>
                    <th className={`${th} w-[110px]`}>Saved Value</th>
                    <th className={`${th} w-[70px]`}>Status</th>
                    <th className={`${th} w-[66px] pr-[10px] text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0ec]">
                  {optionsLoading ? (
                    <tr>
                      <td colSpan={isDependent ? 6 : 5} className="py-8 text-center text-[9px] text-[#6c7587]">
                        Loading options…
                      </td>
                    </tr>
                  ) : pageRows.length === 0 ? (
                    <tr>
                      <td colSpan={isDependent ? 6 : 5} className="py-8 text-center text-[9px] text-[#6c7587]">
                        {options.length ? "No option matches the search." : "No options yet. Add the first one above."}
                      </td>
                    </tr>
                  ) : (
                    pageRows.map((option) => {
                      const group = sortedOptions.filter((o) => o.parentValue === option.parentValue);
                      const position = group.findIndex((o) => o._id === option._id);
                      const busy = busyId === option._id;
                      return (
                        <tr key={option._id} className={`transition hover:bg-slate-50/80 ${editingId === option._id ? "bg-amber-50" : ""}`}>
                          <td className="py-[5px] pl-[10px] pr-[6px]">
                            <div className="flex items-center gap-[2px]">
                              <button type="button" title="Move up" aria-label={`Move ${option.label} up`} disabled={busy || position === 0} onClick={() => move(option, -1)} className="rounded p-[2px] text-[#334155] hover:bg-slate-100 disabled:opacity-25">
                                <ArrowUp className="h-[11px] w-[11px]" />
                              </button>
                              <button
                                type="button"
                                title="Move down"
                                aria-label={`Move ${option.label} down`}
                                disabled={busy || position === group.length - 1}
                                onClick={() => move(option, 1)}
                                className="rounded p-[2px] text-[#334155] hover:bg-slate-100 disabled:opacity-25"
                              >
                                <ArrowDown className="h-[11px] w-[11px]" />
                              </button>
                            </div>
                          </td>
                          {isDependent && <td className="truncate px-[6px] py-[5px] text-[7px] font-medium text-[#6c7587]">{parentLabel(option.parentValue)}</td>}
                          <td className={`truncate px-[6px] py-[5px] text-[8.5px] font-bold ${option.isActive ? "text-[#18233b]" : "text-[#9aa0aa] line-through"}`}>{option.label}</td>
                          <td className="truncate px-[6px] py-[5px] font-mono text-[7px] text-[#6c7587]">{option.value}</td>
                          <td className="px-[6px] py-[5px]">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => toggleActive(option)}
                              title={option.isActive ? "Shown on the website — click to hide" : "Hidden — click to show"}
                              className={`inline-flex h-[20px] items-center rounded-[4px] px-[6px] text-[7px] font-bold transition ${
                                option.isActive ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              }`}
                            >
                              {option.isActive ? "Shown" : "Hidden"}
                            </button>
                          </td>
                          <td className="py-[5px] pl-[6px] pr-[10px]">
                            <div className="flex justify-end gap-[4px]">
                              <button type="button" title="Edit" aria-label={`Edit ${option.label}`} onClick={() => startEdit(option)} className={iconButton("blue")}>
                                <Pencil className="h-[11px] w-[11px]" />
                              </button>
                              <button type="button" title="Delete" aria-label={`Delete ${option.label}`} onClick={() => setPendingDelete(option)} className={iconButton("red")}>
                                <Trash2 className="h-[11px] w-[11px]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
              {!optionsLoading && visibleOptions.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[10px] py-[6px] text-[8px]">
                  <span className="font-semibold text-[#5f6a7c]">
                    {firstRow + 1}–{Math.min(firstRow + OPTION_PAGE_SIZE, visibleOptions.length)} of {visibleOptions.length} options
                  </span>
                  {optionPages > 1 && <Pager page={currentPage} pages={optionPages} onPage={setPage} />}
                </div>
              )}
            </div>
            <p className="mt-[6px] flex items-center gap-[5px] text-[7px] font-medium text-[#9aa0aa]">
              <Settings2 className="h-[10px] w-[10px]" /> Click Shown / Hidden to change what visitors see. Changes save instantly.
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete option"
        description={`"${pendingDelete?.label ?? ""}" will be removed from ${selected?.name ?? "this list"} on the website. To hide it temporarily, set it Hidden instead.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
