"use client";

import { useEffect, useState } from "react";
import { Plus, Receipt as ReceiptIcon, HeartHandshake } from "lucide-react";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import StatCard from "@/components/ui/StatCard";
import { Input, Select } from "@/components/ui/Input";
import { donationsApi } from "@/lib/donationsApi";
import { Donation, NewDonationStatus, DonationCause, PaymentMode, DonationSummary } from "@/lib/types";
import { DONATION_STATUS_META, formatCurrency, formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const TABS: { key: NewDonationStatus | ""; label: string }[] = [
  { key: "", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "SUCCESS", label: "Successful" },
  { key: "FAILED", label: "Failed" },
  { key: "REFUNDED", label: "Refunded" },
];

const PAYMENT_MODES: PaymentMode[] = ["CASH", "CHEQUE", "BANK_TRANSFER", "UPI", "CARD", "NETBANKING", "WALLET"];

const OFFLINE_EMPTY = {
  donorName: "",
  donorEmail: "",
  donorPhone: "",
  pan: "",
  dedication: "",
  cause: "general" as DonationCause,
  amount: "",
  paymentMode: "CASH" as PaymentMode,
  referenceNo: "",
};

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [summary, setSummary] = useState<DonationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<NewDonationStatus | "">("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(OFFLINE_EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([donationsApi.list(tab || undefined), donationsApi.summary()])
      .then(([d, s]) => {
        setDonations(d);
        setSummary(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const handleRecordOffline = async () => {
    if (!form.donorName || !form.donorEmail || !form.donorPhone || !form.amount) return;
    setSaving(true);
    setError("");
    try {
      await donationsApi.recordOffline({
        donorName: form.donorName,
        donorEmail: form.donorEmail,
        donorPhone: form.donorPhone,
        pan: form.pan || undefined,
        dedication: form.dedication || undefined,
        cause: form.cause,
        amount: Number(form.amount),
        paymentMode: form.paymentMode,
        referenceNo: form.referenceNo || undefined,
      });
      setModalOpen(false);
      setForm(OFFLINE_EMPTY);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not record this donation.");
    } finally {
      setSaving(false);
    }
  };

  const viewReceipt = async (receiptId: string) => {
    try {
      const html = await donationsApi.receiptHtml(receiptId);
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(html);
        win.document.close();
      }
    } catch {
      /* no receipt available */
    }
  };

  const columns: Column<Donation>[] = [
    { key: "donor", header: "Donor", render: (d) => (d.isAnonymous ? "Anonymous" : d.donor?.name ?? "—") },
    { key: "cause", header: "Cause", render: (d) => d.cause },
    {
      key: "type",
      header: "Type",
      render: (d) => <span className="text-xs text-text-secondary">{d.type.replace("_", " ")}</span>,
    },
    { key: "amount", header: "Amount", align: "right", render: (d) => formatCurrency(d.amount) },
    {
      key: "status",
      header: "Status",
      render: (d) => <Badge tone={DONATION_STATUS_META[d.status].tone}>{DONATION_STATUS_META[d.status].label}</Badge>,
    },
    { key: "createdAt", header: "Date", render: (d) => formatDateTime(d.createdAt) },
    {
      key: "receipt",
      header: "Receipt",
      render: (d) =>
        d.receiptId ? (
          <button
            onClick={() => viewReceipt(d.receiptId!)}
            className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline"
          >
            <ReceiptIcon className="h-3 w-3" /> View
          </button>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Donations</h1>
          <p className="text-xs text-text-muted">Online and offline contributions.</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setForm(OFFLINE_EMPTY);
            setError("");
            setModalOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5" /> Record Offline Donation
        </Button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:w-96">
          <StatCard icon={HeartHandshake} label="Total Raised" value={formatCurrency(summary.totalRaised)} />
          <StatCard icon={HeartHandshake} label="Donations" value={summary.totalDonations} />
        </div>
      )}

      <div className="flex gap-1.5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              tab === t.key ? "bg-accent text-white" : "bg-surface-card text-text-secondary hover:bg-surface-sunken"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Table columns={columns} rows={donations} rowKey={(d) => d._id} loading={loading} emptyMessage="No donations yet." />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Record Offline Donation"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleRecordOffline} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input label="Donor Name" required value={form.donorName} onChange={(e) => setForm({ ...form, donorName: e.target.value })} />
            <Input
              label="Phone"
              required
              value={form.donorPhone}
              onChange={(e) => setForm({ ...form, donorPhone: e.target.value })}
            />
          </div>
          <Input label="Email" type="email" required value={form.donorEmail} onChange={(e) => setForm({ ...form, donorEmail: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="PAN (optional)" value={form.pan} onChange={(e) => setForm({ ...form, pan: e.target.value })} />
            <Input
              label="Amount"
              type="number"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Cause" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value as DonationCause })}>
              <option value="general">General</option>
              <option value="cremation">Cremation</option>
              <option value="ambulance">Ambulance</option>
              <option value="annadan">Annadan</option>
            </Select>
            <Select
              label="Payment Mode"
              value={form.paymentMode}
              onChange={(e) => setForm({ ...form, paymentMode: e.target.value as PaymentMode })}
            >
              {PAYMENT_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Reference No. (optional)"
            value={form.referenceNo}
            onChange={(e) => setForm({ ...form, referenceNo: e.target.value })}
            hint="Cheque number, UTR, etc."
          />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
