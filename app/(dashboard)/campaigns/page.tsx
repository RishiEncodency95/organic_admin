"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { campaignsApi, CampaignInput } from "@/lib/campaignsApi";
import { Campaign, CampaignStatus, DonationCause } from "@/lib/types";
import { CAMPAIGN_STATUS_META, formatCurrency, formatDate } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM: CampaignInput = {
  title: "",
  slug: "",
  description: "",
  cause: "general",
  status: "DRAFT",
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CampaignInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    campaignsApi
      .list()
      .then(setCampaigns)
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

  const openEdit = (c: Campaign) => {
    setEditingId(c._id);
    setForm({
      title: c.title,
      slug: c.slug,
      description: c.description ?? "",
      cause: c.cause,
      goalAmount: c.goalAmount,
      status: c.status,
    });
    setError("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await campaignsApi.update(editingId, form);
      } else {
        await campaignsApi.create(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save campaign.");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Campaign>[] = [
    { key: "title", header: "Campaign", render: (c) => <span className="font-medium">{c.title}</span> },
    { key: "cause", header: "Cause", render: (c) => c.cause },
    {
      key: "progress",
      header: "Raised / Goal",
      render: (c) => `${formatCurrency(c.raisedAmount)}${c.goalAmount ? ` / ${formatCurrency(c.goalAmount)}` : ""}`,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <Badge tone={CAMPAIGN_STATUS_META[c.status].tone}>{CAMPAIGN_STATUS_META[c.status].label}</Badge>,
    },
    { key: "createdAt", header: "Created", render: (c) => formatDate(c.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Campaigns</h1>
          <p className="text-xs text-text-muted">Fundraising pushes donations can be attributed to.</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5" /> New Campaign
        </Button>
      </div>

      <Table columns={columns} rows={campaigns} rowKey={(c) => c._id} loading={loading} emptyMessage="No campaigns yet." onRowClick={openEdit} />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Campaign" : "New Campaign"}
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
          <Input label="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input
            label="Slug"
            required
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") })}
            hint="Lowercase letters, numbers and hyphens only."
          />
          <Textarea
            label="Description"
            rows={3}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Cause" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value as DonationCause })}>
              <option value="general">General</option>
              <option value="cremation">Cremation</option>
              <option value="ambulance">Ambulance</option>
              <option value="annadan">Annadan</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CampaignStatus })}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </div>
          <Input
            label="Goal Amount (optional)"
            type="number"
            value={form.goalAmount ?? ""}
            onChange={(e) => setForm({ ...form, goalAmount: e.target.value ? Number(e.target.value) : undefined })}
          />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
