"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ApiRequestError } from "@/lib/api";
import { dropdownsApi, type DropdownListInfo, type DropdownOption } from "@/lib/dropdownsApi";

const PAGE_SIZE = 10;

const compactInput =
  "h-8 w-full rounded-md border border-surface-border bg-surface-card px-2.5 text-sm text-text-primary outline-none focus:border-accent";

type FormState = { label: string; value: string; parentValue: string; isActive: boolean };
const EMPTY_FORM: FormState = { label: "", value: "", parentValue: "", isActive: true };

const errorText = (err: unknown, fallback: string) => (err instanceof ApiRequestError ? err.message : fallback);

export default function DropdownListsManager() {
  const [lists, setLists] = useState<DropdownListInfo[]>([]);
  const [listsLoading, setListsLoading] = useState(true);
  const [listSearch, setListSearch] = useState("");
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
          setSelectedKey((current) => current ?? data[0]?.key ?? null);
        })
        .catch((err) => setError(errorText(err, "Could not load dropdown lists.")))
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

  const selectList = (key: string) => {
    if (key === selectedKey) return;
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

  /* ---------- derived ---------- */

  const groupedLists = useMemo(() => {
    const term = listSearch.trim().toLowerCase();
    const groups = new Map<string, DropdownListInfo[]>();
    for (const list of lists) {
      const haystack = [list.name, list.key, list.group, ...list.usedIn].join(" ").toLowerCase();
      if (term && !haystack.includes(term) && list.key !== selectedKey) continue;
      groups.set(list.group, [...(groups.get(list.group) ?? []), list]);
    }
    return [...groups.entries()];
  }, [lists, listSearch, selectedKey]);

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
    if (!form.label.trim()) return setError("Label is required.");
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

  const colSpan = isDependent ? 6 : 5;

  // 10 rows per page; the page is clamped here so a delete on the last page never leaves it empty.
  const pageCount = Math.max(1, Math.ceil(visibleOptions.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const firstRow = (currentPage - 1) * PAGE_SIZE;
  const pageRows = visibleOptions.slice(firstRow, firstRow + PAGE_SIZE);

  // Left panel: every list, grouped. It scrolls on its own so the page itself never has to.
  const listPanel = (
    <aside className="flex flex-col overflow-hidden rounded-lg border border-surface-border bg-surface-card shadow-sm lg:h-[calc(100vh-190px)]">
      <div className="border-b border-surface-border px-2.5 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            className={`${compactInput} pl-8`}
            placeholder="Search lists or forms…"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
          />
        </div>
        <p className="mt-1 text-[11px] text-text-muted">
          {listSearch.trim() ? `${groupedLists.reduce((n, [, items]) => n + items.length, 0)} of ` : ""}
          {lists.length} dropdown lists
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-1">
        {listsLoading ? (
          <p className="px-3 py-2 text-sm text-text-secondary">Loading…</p>
        ) : (
          groupedLists.map(([group, items]) => (
            <div key={group}>
              <p className="px-3 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wide text-text-muted">{group}</p>
              {items.map((list) => (
                <button
                  key={list.key}
                  type="button"
                  onClick={() => selectList(list.key)}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-1 text-left text-[13px] transition-colors ${
                    list.key === selectedKey
                      ? "bg-accent/10 font-semibold text-accent"
                      : "text-text-primary hover:bg-surface-sunken"
                  }`}
                >
                  <span className="truncate">{list.name}</span>
                  <span className="shrink-0 text-[11px] text-text-muted">
                    {list.active}/{list.total}
                  </span>
                </button>
              ))}
            </div>
          ))
        )}
      </div>
    </aside>
  );

  return (
    <div className="space-y-2">
      <div className="grid items-start gap-2 lg:grid-cols-[230px_1fr]">
      {listPanel}

      {/* SELECTED LIST */}
      <section className="min-w-0 space-y-2">
        {!selected ? (
          <div className="rounded-lg border border-surface-border bg-surface-card p-6 text-center text-sm text-text-secondary">
            {listsLoading ? "Loading…" : "Choose a dropdown list on the left."}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 shadow-sm">
              {/* ROW 1: name, key, counts and where the list is used */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-sm font-semibold text-text-primary">{selected.name}</h2>
                <span className="font-mono text-[11px] text-text-muted">{selected.key}</span>
                <span className="rounded-full bg-surface-sunken px-2 py-0.5 text-[11px] text-text-secondary">
                  {selected.active} active · {selected.total} total
                </span>
                <span className="min-w-0 truncate text-[11px] text-text-muted" title={selected.usedIn.join(" · ")}>
                  Used in: {selected.usedIn.join(" · ")}
                </span>
              </div>
              {isDependent && (
                <p className="mt-1 text-[11px] text-text-secondary">
                  Each option belongs to a <strong>{selected.parentName}</strong>; the website shows only the options of the one picked.
                </p>
              )}

              {/* FORM: all fields and the button on one row */}
              <form onSubmit={handleSubmit} className="mt-2 border-t border-surface-border pt-2">
                <div
                  className={`grid items-end gap-2 ${
                    isDependent ? "md:grid-cols-[1fr_1fr_1fr_150px_auto]" : "md:grid-cols-[1fr_1fr_150px_auto]"
                  }`}
                >
                  {isDependent && (
                    <label className="block">
                      <span className="mb-0.5 block text-[11px] font-medium text-text-secondary">{selected.parentName} *</span>
                      <select
                        className={compactInput}
                        value={form.parentValue}
                        onChange={(e) => setForm({ ...form, parentValue: e.target.value })}
                      >
                        <option value="">Select…</option>
                        {parentOptions.map((p) => (
                          <option key={p._id} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-text-secondary">
                      {editingId ? "Edit label *" : "Label (shown on website) *"}
                    </span>
                    <input
                      className={compactInput}
                      value={form.label}
                      maxLength={200}
                      placeholder="e.g. Organic Foods & Beverages"
                      onChange={(e) => setForm({ ...form, label: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-text-secondary">Saved value</span>
                    <input
                      className={compactInput}
                      value={form.value}
                      maxLength={200}
                      placeholder="Same as label"
                      onChange={(e) => setForm({ ...form, value: e.target.value })}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-0.5 block text-[11px] font-medium text-text-secondary">Status</span>
                    <select
                      className={compactInput}
                      value={form.isActive ? "active" : "inactive"}
                      onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
                    >
                      <option value="active">Active (shown)</option>
                      <option value="inactive">Inactive (hidden)</option>
                    </select>
                  </label>
                  <div className="flex gap-1.5">
                    <Button type="submit" size="sm" loading={saving}>
                      {editingId ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {editingId ? "Update" : "Add"}
                    </Button>
                    {editingId && (
                      <Button type="button" variant="ghost" size="sm" onClick={resetForm} title="Cancel edit">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
                {editingId && form.value !== options.find((o) => o._id === editingId)?.value && (
                  <p className="mt-1 text-[11px] text-amber-700">
                    Changing the saved value does not change answers already submitted with the old value.
                  </p>
                )}
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                {notice && <p className="mt-1 text-xs text-green-700">{notice}</p>}
              </form>
            </div>

            {/* OPTIONS TABLE */}
            <div className="rounded-lg border border-surface-border bg-surface-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-surface-border bg-surface-sunken/50 text-left text-[11px] uppercase tracking-wide text-text-secondary">
                      <th className="w-16 px-3 py-1.5 font-medium">Order</th>
                      {isDependent && <th className="px-3 py-1.5 font-medium">{selected.parentName}</th>}
                      <th className="px-3 py-1.5 font-medium">Label</th>
                      <th className="px-3 py-1.5 font-medium">Saved value</th>
                      <th className="px-3 py-1.5 font-medium">Status</th>
                      <th className="w-20 px-3 py-1.5 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {optionsLoading ? (
                      <tr>
                        <td colSpan={colSpan} className="px-3 py-5 text-center text-text-secondary">
                          Loading…
                        </td>
                      </tr>
                    ) : pageRows.length === 0 ? (
                      <tr>
                        <td colSpan={colSpan} className="px-3 py-5 text-center text-text-secondary">
                          {options.length ? "No option matches the filter." : "No options yet. Add the first one above."}
                        </td>
                      </tr>
                    ) : (
                      pageRows.map((option) => {
                        const group = sortedOptions.filter((o) => o.parentValue === option.parentValue);
                        const position = group.findIndex((o) => o._id === option._id);
                        const busy = busyId === option._id;
                        return (
                          <tr
                            key={option._id}
                            className={`border-b border-surface-border last:border-0 hover:bg-surface-sunken/40 ${
                              editingId === option._id ? "bg-surface-sunken" : ""
                            } ${option.isActive ? "" : "opacity-60"}`}
                          >
                            <td className="px-3 py-1">
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  title="Move up"
                                  disabled={busy || position === 0}
                                  onClick={() => move(option, -1)}
                                  className="rounded p-0.5 text-text-secondary hover:bg-surface-sunken disabled:opacity-25"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Move down"
                                  disabled={busy || position === group.length - 1}
                                  onClick={() => move(option, 1)}
                                  className="rounded p-0.5 text-text-secondary hover:bg-surface-sunken disabled:opacity-25"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                            {isDependent && (
                              <td className="px-3 py-1 text-text-secondary">{parentLabel(option.parentValue)}</td>
                            )}
                            <td className="px-3 py-1 font-medium text-text-primary">{option.label}</td>
                            <td className="px-3 py-1 font-mono text-xs text-text-secondary">{option.value}</td>
                            <td className="px-3 py-1">
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => toggleActive(option)}
                                title="Click to show / hide on the website"
                                className={`rounded-full px-2 py-px text-[11px] font-medium ${
                                  option.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {option.isActive ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-3 py-1">
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() => startEdit(option)}
                                  className="grid h-6 w-6 place-items-center rounded-md text-text-secondary hover:bg-surface-sunken hover:text-accent"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  title="Delete"
                                  onClick={() => setPendingDelete(option)}
                                  className="grid h-6 w-6 place-items-center rounded-md text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
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

              {/* FOOTER: search / filter / refresh, row count and pages, on one line */}
              <div className="flex flex-wrap items-center gap-2 border-t border-surface-border px-3 py-1.5 text-xs text-text-secondary">
                <div className="relative w-full sm:w-52">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                  <input
                    className={`${compactInput} pl-8`}
                    placeholder="Search options…"
                    value={optionSearch}
                    onChange={(e) => {
                      setOptionSearch(e.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                {isDependent && (
                  <select
                    className={`${compactInput} w-auto min-w-[180px]`}
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
                )}
                <button
                  type="button"
                  title="Refresh"
                  onClick={() => {
                    setOptionsLoading(true);
                    dropdownsApi
                      .options(selected.key)
                      .then(setOptions)
                      .catch((err) => setError(errorText(err, "Could not load options.")))
                      .finally(() => setOptionsLoading(false));
                  }}
                  className="grid h-8 w-8 place-items-center rounded-md border border-surface-border text-text-secondary hover:bg-surface-sunken"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${optionsLoading ? "animate-spin" : ""}`} />
                </button>
                {!optionsLoading && visibleOptions.length > 0 && (
                  <span className="ml-auto">
                    {firstRow + 1}–{Math.min(firstRow + PAGE_SIZE, visibleOptions.length)} of {visibleOptions.length}
                  </span>
                )}
                {!optionsLoading && pageCount > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setPage(currentPage - 1)}
                      className="rounded-md px-2 py-1 hover:bg-surface-sunken disabled:opacity-40"
                    >
                      ‹ Prev
                    </button>
                    {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`h-6 min-w-6 rounded-md px-1.5 font-medium ${
                          n === currentPage ? "bg-accent text-white" : "hover:bg-surface-sunken"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage === pageCount}
                      onClick={() => setPage(currentPage + 1)}
                      className="rounded-md px-2 py-1 hover:bg-surface-sunken disabled:opacity-40"
                    >
                      Next ›
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </section>
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete option"
        description={`"${pendingDelete?.label ?? ""}" will be removed from ${selected?.name ?? "this list"} on the website. To hide it temporarily, set it Inactive instead.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
