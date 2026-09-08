"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { partnersApi, PartnerInput } from "@/lib/partnersApi";
import { Partner, PartnerType, PartnerStatus } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM: PartnerInput = { name: "", type: "NGO", status: "LEAD" };

const TYPE_LABELS: Record<PartnerType, string> = {
  NGO: "NGO",
  HOSPITAL: "Hospital",
  MUNICIPAL: "Municipal Body",
  CORPORATE_CSR: "Corporate CSR",
  CREMATION_GROUND: "Cremation Ground",
  OTHER: "Other",
};

const STATUS_TONE: Record<PartnerStatus, "pending" | "success" | "danger" | "neutral"> = {
  LEAD: "pending",
  ACTIVE: "success",
  EXPIRED: "danger",
  INACTIVE: "neutral",
};

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PartnerInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    partnersApi
      .list()
      .then(setPartners)
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

  const openEdit = (p: Partner) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      type: p.type,
      status: p.status,
      contactPerson: p.contactPerson ?? "",
      contactPhone: p.contactPhone ?? "",
      contactEmail: p.contactEmail ?? "",
      address: p.address ?? "",
      agreementDetails: p.agreementDetails ?? "",
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
        await partnersApi.update(editingId, form);
      } else {
        await partnersApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save partner.");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Partner>[] = [
    { key: "name", header: "Partner", render: (p) => <span className="font-medium">{p.name}</span> },
    { key: "type", header: "Type", render: (p) => TYPE_LABELS[p.type] },
    { key: "contactPerson", header: "Contact", render: (p) => p.contactPerson ?? "—" },
    { key: "contactPhone", header: "Phone", render: (p) => p.contactPhone ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (p) => <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>,
    },
    { key: "createdAt", header: "Added", render: (p) => formatDate(p.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Partners</h1>
          <p className="text-xs text-text-muted">NGOs, hospitals, municipal bodies, CSR sponsors and cremation grounds.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> New Partner
        </Button>
      </div>

      <Table columns={columns} rows={partners} rowKey={(p) => p._id} loading={loading} emptyMessage="No partners yet." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Partner" : "New Partner"}
        size="lg"
        footer={
          <>
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
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PartnerType })}>
              {(Object.keys(TYPE_LABELS) as PartnerType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Person" value={form.contactPerson ?? ""} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} />
            <Input label="Contact Phone" value={form.contactPhone ?? ""} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
          </div>
          <Input label="Contact Email" value={form.contactEmail ?? ""} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          <Input label="Address" value={form.address ?? ""} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Textarea
            label="Agreement Details"
            rows={2}
            value={form.agreementDetails ?? ""}
            onChange={(e) => setForm({ ...form, agreementDetails: e.target.value })}
          />
          <Textarea label="Notes" rows={2} value={form.notes ?? ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PartnerStatus })}>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="INACTIVE">Inactive</option>
          </Select>
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
