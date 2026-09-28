"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import {
  careerOptionsApi,
  type CareerOption,
  type CareerOptionInput,
  type CareerOptionType,
} from "@/lib/careerOptionsApi";

interface TypeChoice {
  value: CareerOptionType;
  label: string;
}

interface CareerOptionManagerProps {
  title: string;
  description: string;
  types: TypeChoice[];
  valueLabel: string;
  valuePlaceholder: string;
}

const emptyForm = (type: CareerOptionType): CareerOptionInput => ({
  type,
  label: "",
  order: 0,
  isActive: true,
});

const inputClass =
  "h-9 w-full rounded-md border border-surface-border bg-surface-card px-3 text-sm text-text-primary outline-none focus:border-accent";

export default function CareerOptionManager({
  title,
  description,
  types,
  valueLabel,
  valuePlaceholder,
}: CareerOptionManagerProps) {
  const typeValues = useMemo(() => types.map((t) => t.value), [types]);
  const typeLabel = (value: CareerOptionType) => types.find((t) => t.value === value)?.label ?? value;
  const showType = types.length > 1;

  const [options, setOptions] = useState<CareerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CareerOptionInput>(emptyForm(types[0].value));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<CareerOptionType | "all">("all");
  const [pendingDelete, setPendingDelete] = useState<CareerOption | null>(null);
  const [deleting, setDeleting] = useState(false);

  // State is only set once the request settles, so this is safe to start from an effect.
  const fetchOptions = useCallback(
    () =>
      careerOptionsApi
        .list(typeValues)
        .then(setOptions)
        .catch((err) => setError((err as Error).message || "Failed to load data"))
        .finally(() => setLoading(false)),
    [typeValues]
  );

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const load = () => {
    setLoading(true);
    setError("");
    fetchOptions();
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm(form.type));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      setError(`${valueLabel} is required`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, label: form.label.trim() };
      if (editingId) {
        const updated = await careerOptionsApi.update(editingId, payload);
        setOptions((prev) => prev.map((o) => (o._id === editingId ? updated : o)));
      } else {
        const created = await careerOptionsApi.create(payload);
        setOptions((prev) => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError((err as Error).message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (option: CareerOption) => {
    setEditingId(option._id);
    setForm({ type: option.type, label: option.label, order: option.order, isActive: option.isActive });
    setError("");
  };

  const toggleStatus = async (option: CareerOption) => {
    try {
      const updated = await careerOptionsApi.update(option._id, { isActive: !option.isActive });
      setOptions((prev) => prev.map((o) => (o._id === option._id ? updated : o)));
    } catch (err) {
      setError((err as Error).message || "Failed to update status");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await careerOptionsApi.remove(pendingDelete._id);
      setOptions((prev) => prev.filter((o) => o._id !== pendingDelete._id));
      if (editingId === pendingDelete._id) resetForm();
      setPendingDelete(null);
    } catch (err) {
      setError((err as Error).message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const rows = useMemo(
    () =>
      options
        .filter((o) => filter === "all" || o.type === filter)
        .sort(
          (a, b) =>
            typeValues.indexOf(a.type) - typeValues.indexOf(b.type) ||
            a.order - b.order ||
            a.createdAt.localeCompare(b.createdAt)
        ),
    [options, filter, typeValues]
  );

  return (
    <div className="space-y-5 p-6">
      <div>
        <h1 className="text-xl font-semibold text-text-primary">{title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-surface-border bg-surface-card p-5 shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-text-primary">
            {editingId ? `Edit ${valueLabel}` : `Add ${valueLabel}`}
          </h2>
          {editingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-3.5 w-3.5" /> Cancel edit
            </Button>
          )}
        </div>

        <div className={`grid gap-4 ${showType ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          {showType && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-text-secondary">Type *</span>
              <select
                className={inputClass}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as CareerOptionType })}
              >
                {types.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">{valueLabel} *</span>
            <input
              className={inputClass}
              value={form.label}
              placeholder={valuePlaceholder}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">Sort Order</span>
            <input
              type="number"
              className={inputClass}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-text-secondary">Status</span>
            <select
              className={inputClass}
              value={form.isActive ? "active" : "inactive"}
              onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex justify-end">
          <Button type="submit" loading={saving}>
            {editingId ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingId ? "Update" : "Add"}
          </Button>
        </div>
      </form>

      {/* TABLE */}
      <div className="rounded-lg border border-surface-border bg-surface-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-border px-5 py-3">
          <div className="flex flex-wrap gap-2">
            {showType &&
              [{ value: "all" as const, label: "All" }, ...types].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFilter(t.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filter === t.value
                      ? "bg-accent text-white"
                      : "bg-surface-sunken text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {t.label}
                </button>
              ))}
          </div>
          <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs uppercase tracking-wide text-text-secondary">
                <th className="px-5 py-3 font-medium">#</th>
                {showType && <th className="px-5 py-3 font-medium">Type</th>}
                <th className="px-5 py-3 font-medium">{valueLabel}</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={showType ? 5 : 4} className="px-5 py-8 text-center text-text-secondary">
                    Loading…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={showType ? 5 : 4} className="px-5 py-8 text-center text-text-secondary">
                    No entries yet. Add one using the form above.
                  </td>
                </tr>
              ) : (
                rows.map((option, index) => (
                  <tr
                    key={option._id}
                    className={`border-b border-surface-border last:border-0 ${
                      editingId === option._id ? "bg-surface-sunken" : ""
                    }`}
                  >
                    <td className="px-5 py-3 text-text-secondary">{index + 1}</td>
                    {showType && <td className="px-5 py-3 text-text-secondary">{typeLabel(option.type)}</td>}
                    <td className="px-5 py-3 font-medium text-text-primary">{option.label}</td>
                    <td className="px-5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleStatus(option)}
                        title="Click to toggle status"
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          option.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {option.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => startEdit(option)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => setPendingDelete(option)}>
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
      </div>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title={`Delete ${valueLabel}`}
        description={`"${pendingDelete?.label ?? ""}" will be removed from the application form. This cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
