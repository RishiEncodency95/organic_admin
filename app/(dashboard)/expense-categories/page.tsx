"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { expenseCategoriesApi, ExpenseCategoryInput } from "@/lib/expenseCategoriesApi";
import { ExpenseCategory } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM: ExpenseCategoryInput = { name: "", isActive: true };

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseCategoryInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    expenseCategoriesApi
      .list()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  };

  const openEdit = (c: ExpenseCategory) => {
    setEditingId(c._id);
    setForm({ name: c.name, isActive: c.isActive, notes: c.notes ?? "" });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await expenseCategoriesApi.update(editingId, form);
      } else {
        await expenseCategoriesApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save expense category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId || !window.confirm("Remove this expense category?")) return;
    setSaving(true);
    try {
      await expenseCategoriesApi.remove(editingId);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not remove expense category.");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<ExpenseCategory>[] = [
    { key: "name", header: "Category", render: (c) => <span className="font-medium">{c.name}</span> },
    { key: "notes", header: "Notes", render: (c) => c.notes ?? "—" },
    {
      key: "isActive",
      header: "Status",
      render: (c) => <Badge tone={c.isActive ? "success" : "neutral"}>{c.isActive ? "Active" : "Inactive"}</Badge>,
    },
    { key: "createdAt", header: "Added", render: (c) => formatDate(c.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Expense Categories</h1>
          <p className="text-xs text-text-muted">The controlled list Case Managers pick from when submitting a case expense.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> New Category
        </Button>
      </div>

      <Table columns={columns} rows={categories} rowKey={(c) => c._id} loading={loading} emptyMessage="No expense categories yet." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Expense Category" : "New Expense Category"}
        footer={
          <>
            {editingId && (
              <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>
                Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Textarea label="Notes" rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Select
            label="Status"
            value={form.isActive ? "active" : "inactive"}
            onChange={(e) => setForm({ ...form, isActive: e.target.value === "active" })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </Select>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
