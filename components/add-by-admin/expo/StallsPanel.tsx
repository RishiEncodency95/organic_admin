"use client";

import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Layers, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { expoApi, STALL_STATUSES, type ChoiceOption, type Stall, type StallInput, type StallStatus } from "@/lib/expoApi";
import { errorText, inputClass } from "./shared";

const STATUS_STYLE: Record<StallStatus, string> = {
  available: "bg-green-100 text-green-700",
  reserved: "bg-amber-100 text-amber-700",
  booked: "bg-blue-100 text-blue-700",
  blocked: "bg-gray-200 text-gray-600",
};

type StallForm = {
  stallNumber: string;
  hall: string;
  stallType: string;
  length: string;
  width: string;
  plScheme: string;
  incrementPercentage: string;
  discountPercentage: string;
  status: StallStatus;
  notes: string;
};

type BulkForm = { prefix: string; from: string; to: string; hall: string; stallType: string; length: string; width: string; plScheme: string };

const emptyStall = (stallType = "", plScheme = ""): StallForm => ({
  stallNumber: "",
  hall: "",
  stallType,
  length: "3",
  width: "3",
  plScheme,
  incrementPercentage: "0",
  discountPercentage: "0",
  status: "available",
  notes: "",
});

const area = (length: string, width: string) => {
  const a = Number(length) * Number(width);
  return Number.isFinite(a) && a > 0 ? Math.round(a * 100) / 100 : 0;
};

const MAX_BULK = 500;

/** The stalls of one event. Only "available" stalls are offered on the Book a Stand page. */
export default function StallsPanel({
  eventId,
  stallTypes,
  plSchemes,
  onStallsChanged,
}: {
  eventId: string;
  stallTypes: ChoiceOption[];
  plSchemes: ChoiceOption[];
  onStallsChanged: () => void;
}) {
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | StallStatus>("");

  const [mode, setMode] = useState<"closed" | "single" | "bulk">("closed");
  const [editing, setEditing] = useState<Stall | null>(null);
  const [form, setForm] = useState<StallForm>(emptyStall());
  const [bulk, setBulk] = useState<BulkForm>({ prefix: "A-", from: "1", to: "10", hall: "", stallType: "", length: "3", width: "3", plScheme: "" });
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Stall | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const defaultType = stallTypes[0]?.value ?? "";
  const defaultScheme = plSchemes[0]?.value ?? "";
  const typeLabel = (v: string) => stallTypes.find((t) => t.value === v)?.label ?? v;

  useEffect(() => {
    let cancelled = false;
    expoApi
      .stalls(eventId)
      .then((data) => !cancelled && setStalls(data))
      .catch((err) => !cancelled && setError(errorText(err, "Could not load stalls.")))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return stalls.filter(
      (s) =>
        (!statusFilter || s.status === statusFilter) &&
        (!term || [s.stallNumber, s.hall, s.stallType].some((v) => v.toLowerCase().includes(term)))
    );
  }, [stalls, search, statusFilter]);

  const bulkNumbers = useMemo(() => {
    const from = Number(bulk.from);
    const to = Number(bulk.to);
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from || to - from + 1 > MAX_BULK) return [];
    return Array.from({ length: to - from + 1 }, (_, i) => `${bulk.prefix}${from + i}`);
  }, [bulk.prefix, bulk.from, bulk.to]);

  const flash = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 3000);
  };

  const close = () => {
    setMode("closed");
    setEditing(null);
    setError("");
  };

  const openSingle = () => {
    setEditing(null);
    setForm(emptyStall(defaultType, defaultScheme));
    setError("");
    setMode("single");
  };

  const openBulk = () => {
    setBulk((b) => ({ ...b, stallType: b.stallType || defaultType, plScheme: b.plScheme || defaultScheme }));
    setEditing(null);
    setError("");
    setMode("bulk");
  };

  const openEdit = (stall: Stall) => {
    setEditing(stall);
    setForm({
      stallNumber: stall.stallNumber,
      hall: stall.hall,
      stallType: stall.stallType,
      length: String(stall.length),
      width: String(stall.width),
      plScheme: stall.plScheme,
      incrementPercentage: String(stall.incrementPercentage),
      discountPercentage: String(stall.discountPercentage),
      status: stall.status,
      notes: stall.notes,
    });
    setError("");
    setMode("single");
  };

  const saveSingle = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.stallNumber.trim()) return setError("Stall number is required.");
    if (!form.stallType) return setError("Please choose a stall type.");
    if (!area(form.length, form.width)) return setError("Length and width must be positive numbers.");

    const payload: StallInput = {
      stallNumber: form.stallNumber.trim(),
      hall: form.hall.trim(),
      stallType: form.stallType,
      length: Number(form.length),
      width: Number(form.width),
      plScheme: form.plScheme || defaultScheme,
      incrementPercentage: Number(form.incrementPercentage) || 0,
      discountPercentage: Number(form.discountPercentage) || 0,
      status: form.status,
      notes: form.notes.trim(),
    };

    setSaving(true);
    setError("");
    try {
      if (editing) {
        const updated = await expoApi.updateStall(editing._id, payload);
        setStalls((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
        flash(`Stall ${updated.stallNumber} updated.`);
        close();
      } else {
        const created = await expoApi.createStall(eventId, payload);
        setStalls((prev) => [...prev, created]);
        flash(`Stall ${created.stallNumber} added.`);
        setForm((f) => ({ ...emptyStall(f.stallType, f.plScheme), hall: f.hall, length: f.length, width: f.width }));
      }
      onStallsChanged();
    } catch (err) {
      setError(errorText(err, "Could not save the stall."));
    } finally {
      setSaving(false);
    }
  };

  const saveBulk = async (e: FormEvent) => {
    e.preventDefault();
    if (!bulkNumbers.length) return setError(`Enter a valid range (at most ${MAX_BULK} stalls).`);
    if (!bulk.stallType) return setError("Please choose a stall type.");
    if (!area(bulk.length, bulk.width)) return setError("Length and width must be positive numbers.");

    setSaving(true);
    setError("");
    try {
      const created = await expoApi.createStallsBulk(
        eventId,
        bulkNumbers.map((stallNumber) => ({
          stallNumber,
          hall: bulk.hall.trim(),
          stallType: bulk.stallType,
          length: Number(bulk.length),
          width: Number(bulk.width),
          plScheme: bulk.plScheme || defaultScheme,
        }))
      );
      setStalls((prev) => [...prev, ...created]);
      flash(`${created.length} stalls added (${bulkNumbers[0]} to ${bulkNumbers[bulkNumbers.length - 1]}).`);
      close();
      onStallsChanged();
    } catch (err) {
      setError(errorText(err, "Could not add the stalls."));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (stall: Stall, status: StallStatus) => {
    setBusyId(stall._id);
    setError("");
    try {
      const updated = await expoApi.updateStall(stall._id, { status });
      setStalls((prev) => prev.map((s) => (s._id === updated._id ? updated : s)));
      onStallsChanged();
    } catch (err) {
      setError(errorText(err, "Could not change the status."));
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await expoApi.deleteStall(pendingDelete._id);
      setStalls((prev) => prev.filter((s) => s._id !== pendingDelete._id));
      if (editing?._id === pendingDelete._id) close();
      flash(`Stall ${pendingDelete.stallNumber} deleted.`);
      onStallsChanged();
    } catch (err) {
      setError(errorText(err, "Could not delete the stall."));
    } finally {
      setPendingDelete(null);
      setDeleting(false);
    }
  };

  const typeSelect = (value: string, onChange: (v: string) => void) => (
    <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select…</option>
      {stallTypes.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );

  const schemeSelect = (value: string, onChange: (v: string) => void) => (
    <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
      {plSchemes.map((p) => (
        <option key={p.value} value={p.value}>
          {p.label}
        </option>
      ))}
    </select>
  );

  const field = (label: string, control: ReactNode) => (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-text-secondary">{label}</span>
      {control}
    </label>
  );

  return (
    <div className="rounded-lg border border-surface-border bg-surface-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-4 py-2.5">
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Stalls ({stalls.length})</h2>
          <p className="mt-0.5 text-xs text-text-secondary">Only “available” stalls can be picked on the Book a Stand page.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={openSingle}>
            <Plus className="h-3.5 w-3.5" /> Add stall
          </Button>
          <Button size="sm" variant="secondary" onClick={openBulk}>
            <Layers className="h-3.5 w-3.5" /> Add many
          </Button>
        </div>
      </div>

      {/* FORMS */}
      {mode === "single" && (
        <form onSubmit={saveSingle} className="border-b border-surface-border bg-surface-sunken/40 px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">{editing ? `Edit stall ${editing.stallNumber}` : "Add a stall"}</h3>
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              <X className="h-3.5 w-3.5" /> Close
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {field("Stall number *", <input className={inputClass} value={form.stallNumber} maxLength={30} placeholder="e.g. A-12" onChange={(e) => setForm({ ...form, stallNumber: e.target.value })} />)}
            {field("Hall", <input className={inputClass} value={form.hall} maxLength={60} placeholder="e.g. Hall 5" onChange={(e) => setForm({ ...form, hall: e.target.value })} />)}
            {field("Stall type *", typeSelect(form.stallType, (v) => setForm({ ...form, stallType: v })))}
            {field("Open sides", schemeSelect(form.plScheme, (v) => setForm({ ...form, plScheme: v })))}
            {field("Length (m) *", <input type="number" min={0.5} step={0.5} className={inputClass} value={form.length} onChange={(e) => setForm({ ...form, length: e.target.value })} />)}
            {field("Width (m) *", <input type="number" min={0.5} step={0.5} className={inputClass} value={form.width} onChange={(e) => setForm({ ...form, width: e.target.value })} />)}
            {field("Area", <div className="flex h-9 items-center rounded-md bg-surface-sunken px-3 text-sm font-medium text-text-primary">{area(form.length, form.width)} sq m</div>)}
            {field("Status", (
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StallStatus })}>
                {STALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            ))}
            {field("Location surcharge %", <input type="number" min={0} max={100} className={inputClass} value={form.incrementPercentage} onChange={(e) => setForm({ ...form, incrementPercentage: e.target.value })} />)}
            {field("Stall discount %", <input type="number" min={0} max={100} className={inputClass} value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} />)}
            <div className="sm:col-span-2">
              {field("Notes (admin only)", <input className={inputClass} value={form.notes} maxLength={500} onChange={(e) => setForm({ ...form, notes: e.target.value })} />)}
            </div>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex justify-end">
            <Button type="submit" loading={saving}>
              {editing ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editing ? "Save stall" : "Add stall"}
            </Button>
          </div>
        </form>
      )}

      {mode === "bulk" && (
        <form onSubmit={saveBulk} className="border-b border-surface-border bg-surface-sunken/40 px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Add many stalls of the same size</h3>
            <Button type="button" variant="ghost" size="sm" onClick={close}>
              <X className="h-3.5 w-3.5" /> Close
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {field("Number prefix", <input className={inputClass} value={bulk.prefix} maxLength={20} onChange={(e) => setBulk({ ...bulk, prefix: e.target.value })} />)}
            {field("From *", <input type="number" min={0} className={inputClass} value={bulk.from} onChange={(e) => setBulk({ ...bulk, from: e.target.value })} />)}
            {field("To *", <input type="number" min={0} className={inputClass} value={bulk.to} onChange={(e) => setBulk({ ...bulk, to: e.target.value })} />)}
            {field("Hall", <input className={inputClass} value={bulk.hall} maxLength={60} onChange={(e) => setBulk({ ...bulk, hall: e.target.value })} />)}
            {field("Stall type *", typeSelect(bulk.stallType, (v) => setBulk({ ...bulk, stallType: v })))}
            {field("Open sides", schemeSelect(bulk.plScheme, (v) => setBulk({ ...bulk, plScheme: v })))}
            {field("Length (m) *", <input type="number" min={0.5} step={0.5} className={inputClass} value={bulk.length} onChange={(e) => setBulk({ ...bulk, length: e.target.value })} />)}
            {field("Width (m) *", <input type="number" min={0.5} step={0.5} className={inputClass} value={bulk.width} onChange={(e) => setBulk({ ...bulk, width: e.target.value })} />)}
          </div>
          <p className="mt-2 text-xs text-text-secondary">
            {bulkNumbers.length
              ? `Creates ${bulkNumbers.length} stalls: ${bulkNumbers.slice(0, 3).join(", ")}${bulkNumbers.length > 3 ? ` … ${bulkNumbers[bulkNumbers.length - 1]}` : ""}, ${area(bulk.length, bulk.width)} sq m each, all available.`
              : `Enter a range of up to ${MAX_BULK} stalls.`}
          </p>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-3 flex justify-end">
            <Button type="submit" loading={saving} disabled={!bulkNumbers.length}>
              <Layers className="h-4 w-4" /> Create {bulkNumbers.length || ""} stalls
            </Button>
          </div>
        </form>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          <input className={`${inputClass} pl-8`} placeholder="Search stall number, hall or type…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className={`${inputClass} w-auto min-w-[160px]`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "" | StallStatus)}>
          <option value="">All statuses</option>
          {STALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {mode === "closed" && error && <p className="px-4 pb-2 text-sm text-red-600">{error}</p>}
      {notice && <p className="px-4 pb-2 text-sm text-green-700">{notice}</p>}

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-y border-surface-border text-left text-xs uppercase tracking-wide text-text-secondary">
              <th className="px-4 py-2 font-medium">Stall</th>
              <th className="px-4 py-2 font-medium">Hall</th>
              <th className="px-4 py-2 font-medium">Type</th>
              <th className="px-4 py-2 font-medium">Size</th>
              <th className="px-4 py-2 font-medium">Open sides</th>
              <th className="px-4 py-2 font-medium">+ / − %</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-text-secondary">
                  Loading…
                </td>
              </tr>
            ) : visible.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-text-secondary">
                  {stalls.length ? "No stall matches the filter." : "No stalls yet. Use “Add stall” or “Add many”."}
                </td>
              </tr>
            ) : (
              visible.map((stall) => (
                <tr key={stall._id} className={`border-b border-surface-border last:border-0 ${editing?._id === stall._id ? "bg-surface-sunken" : ""}`}>
                  <td className="px-4 py-1.5 font-medium text-text-primary">{stall.stallNumber}</td>
                  <td className="px-4 py-1.5 text-text-secondary">{stall.hall || "—"}</td>
                  <td className="px-4 py-1.5 text-text-secondary">{typeLabel(stall.stallType)}</td>
                  <td className="px-4 py-1.5 text-text-secondary">
                    {stall.length} × {stall.width} m = <span className="font-medium text-text-primary">{stall.area} sq m</span>
                  </td>
                  <td className="px-4 py-1.5 text-text-secondary">{stall.plScheme}</td>
                  <td className="px-4 py-1.5 text-xs text-text-secondary">
                    +{stall.incrementPercentage}% / −{stall.discountPercentage}%
                  </td>
                  <td className="px-4 py-1.5">
                    <select
                      value={stall.status}
                      disabled={busyId === stall._id}
                      onChange={(e) => changeStatus(stall, e.target.value as StallStatus)}
                      className={`rounded-full border-0 px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[stall.status]}`}
                    >
                      {STALL_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-1.5">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEdit(stall)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={stall.status === "booked"}
                        title={stall.status === "booked" ? "A booked stall cannot be deleted" : undefined}
                        onClick={() => setPendingDelete(stall)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete stall"
        description={`Stall ${pendingDelete?.stallNumber ?? ""} will be removed. To keep it but stop offering it, set its status to Blocked instead.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
