"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { serviceProvidersApi, ServiceProviderInput } from "@/lib/serviceProvidersApi";
import { ServiceProvider, ServiceProviderCategory } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM: ServiceProviderInput = {
  name: "",
  category: "AMBULANCE_SERVICE",
  contactPhone: "",
  isActive: true,
};

const CATEGORY_LABELS: Record<ServiceProviderCategory, string> = {
  PRIEST: "Priest",
  CATERING: "Catering",
  AMBULANCE_SERVICE: "Ambulance Service",
  FLORIST: "Florist",
  OTHER: "Other",
};

export default function ServiceProvidersPage() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceProviderInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    serviceProvidersApi
      .list()
      .then(setProviders)
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

  const openEdit = (p: ServiceProvider) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      category: p.category,
      contactPerson: p.contactPerson ?? "",
      contactPhone: p.contactPhone,
      address: p.address ?? "",
      isActive: p.isActive,
      notes: p.notes ?? "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await serviceProvidersApi.update(editingId, form);
      } else {
        await serviceProvidersApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save service provider.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId || !window.confirm("Remove this service provider from the list?")) return;
    setSaving(true);
    try {
      await serviceProvidersApi.remove(editingId);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not remove service provider.");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<ServiceProvider>[] = [
    { key: "name", header: "Name", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "category", header: "Category", render: (p) => CATEGORY_LABELS[p.category] },
    { key: "contactPerson", header: "Contact", render: (p) => p.contactPerson ?? "—" },
    { key: "contactPhone", header: "Phone", render: (p) => p.contactPhone },
    {
      key: "isActive",
      header: "Status",
      render: (p) => <Badge tone={p.isActive ? "success" : "neutral"}>{p.isActive ? "Active" : "Inactive"}</Badge>,
    },
    { key: "createdAt", header: "Added", render: (p) => formatDate(p.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Service Providers</h1>
          <p className="text-xs text-text-muted">Priests, caterers, ambulance services and other vendors for case logistics.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> New Provider
        </Button>
      </div>

      <Table columns={columns} rows={providers} rowKey={(p) => p._id} loading={loading} emptyMessage="No service providers yet." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Service Provider" : "New Service Provider"}
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
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ServiceProviderCategory })}
            >
              <option value="AMBULANCE_SERVICE">Ambulance Service</option>
              <option value="PRIEST">Priest</option>
              <option value="CATERING">Catering</option>
              <option value="FLORIST">Florist</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Person" value={form.contactPerson ?? ""} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            <Input
              label="Contact Phone"
              required
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
            />
          </div>
          <Input label="Address" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
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
