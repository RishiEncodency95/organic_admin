"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { vehiclesApi, VehicleInput } from "@/lib/vehiclesApi";
import { Vehicle, VehicleType } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM: VehicleInput = {
  type: "AMBULANCE",
  registrationNumber: "",
  isActive: true,
};

const TYPE_LABELS: Record<VehicleType, string> = {
  HEARSE: "Hearse",
  AMBULANCE: "Ambulance",
  VAN: "Van",
  OTHER: "Other",
};

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VehicleInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    vehiclesApi
      .list()
      .then(setVehicles)
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

  const openEdit = (v: Vehicle) => {
    setEditingId(v._id);
    setForm({
      type: v.type,
      registrationNumber: v.registrationNumber,
      capacity: v.capacity,
      driverName: v.driverName ?? "",
      driverPhone: v.driverPhone ?? "",
      isActive: v.isActive,
      notes: v.notes ?? "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await vehiclesApi.update(editingId, form);
      } else {
        await vehiclesApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId || !window.confirm("Remove this vehicle from the logistics list?")) return;
    setSaving(true);
    try {
      await vehiclesApi.remove(editingId);
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not remove vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Vehicle>[] = [
    { key: "registrationNumber", header: "Registration", render: (v) => <span className="font-medium">{v.registrationNumber}</span> },
    { key: "type", header: "Type", render: (v) => TYPE_LABELS[v.type] },
    { key: "driver", header: "Driver", render: (v) => v.driverName ?? "—" },
    { key: "driverPhone", header: "Phone", render: (v) => v.driverPhone ?? "—" },
    {
      key: "isActive",
      header: "Status",
      render: (v) => <Badge tone={v.isActive ? "success" : "neutral"}>{v.isActive ? "Active" : "Inactive"}</Badge>,
    },
    { key: "createdAt", header: "Added", render: (v) => formatDate(v.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Vehicles</h1>
          <p className="text-xs text-text-muted">Hearses, ambulances and vans available for case logistics.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> New Vehicle
        </Button>
      </div>

      <Table columns={columns} rows={vehicles} rowKey={(v) => v._id} loading={loading} emptyMessage="No vehicles yet." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Vehicle" : "New Vehicle"}
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
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as VehicleType })}>
              <option value="AMBULANCE">Ambulance</option>
              <option value="HEARSE">Hearse</option>
              <option value="VAN">Van</option>
              <option value="OTHER">Other</option>
            </Select>
            <Input
              label="Registration Number"
              required
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Driver Name" value={form.driverName ?? ""} onChange={(e) => setForm({ ...form, driverName: e.target.value })} />
            <Input label="Driver Phone" value={form.driverPhone ?? ""} onChange={(e) => setForm({ ...form, driverPhone: e.target.value })} />
          </div>
          <Input
            label="Capacity (optional)"
            type="number"
            value={form.capacity ?? ""}
            onChange={(e) => setForm({ ...form, capacity: e.target.value ? Number(e.target.value) : undefined })}
          />
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
