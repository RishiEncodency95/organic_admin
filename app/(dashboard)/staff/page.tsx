"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Copy, Check, Pencil, Camera, Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import Table, { Column } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { staffApi, InviteStaffInput } from "@/lib/staffApi";
import { rolesApi } from "@/lib/rolesApi";
import { uploadApi } from "@/lib/uploadApi";
import { StaffMember, Role, StaffStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateAdmin } from "@/store/slices/authSlice";

const EMPTY_FORM: InviteStaffInput = { name: "", email: "", phone: "", employeeId: "", roleId: "" };

const STATUS_TONE: Record<StaffStatus, "success" | "neutral" | "danger"> = {
  ACTIVE: "success",
  INACTIVE: "neutral",
  LOCKED: "danger",
};

// SweetAlert2 theme matching admin portal dark style
const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  background: "#1e2433",
  color: "#e2e8f0",
  iconColor: "#4ade80",
  customClass: {
    popup: "swal-toast-popup",
    title: "swal-toast-title",
  },
});

function showSuccess(message: string) {
  Toast.fire({ icon: "success", title: message });
}

function showError(message: string) {
  Toast.fire({ icon: "error", title: message, iconColor: "#f87171" });
}

function showInfo(message: string) {
  Toast.fire({ icon: "info", title: message, iconColor: "#60a5fa" });
}

export default function StaffPage() {
  const dispatch = useAppDispatch();
  const currentAdmin = useAppSelector((state) => state.auth.admin);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InviteStaffInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdCredential, setCreatedCredential] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    Promise.all([staffApi.list(), rolesApi.list()])
      .then(([s, r]) => {
        setStaff(Array.isArray(s) ? s : []);
        setRoles(Array.isArray(r) ? r : []);
      })
      .catch((err) => {
        const msg = err instanceof ApiRequestError ? err.message : "Failed to load staff data.";
        showError(msg);
        setStaff([]);
        setRoles([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openInvite = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
    setCreatedCredential(null);
    setModalOpen(true);
  };

  const openEdit = (member: StaffMember) => {
    setEditingId(member._id);
    setForm({ name: member.name, email: member.email ?? "", phone: member.phone, employeeId: member.employeeId ?? "", roleId: member.roleId ?? "" });
    setError("");
    setCreatedCredential(null);
    setModalOpen(true);
  };

  const handleInvite = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Name, Email, and Phone are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const result = await staffApi.invite(form);
      // result contains { user, temporaryPassword }
      const password = result.temporaryPassword ?? (result as any)?.data?.temporaryPassword ?? "";
      setCreatedCredential({ email: form.email, password });
      showSuccess(`Account created for ${form.name}!`);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not create this staff account.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      await staffApi.update(editingId, form);
      if (currentAdmin && editingId === currentAdmin.id) {
        dispatch(updateAdmin({ name: form.name, email: form.email, phone: form.phone, avatarUrl: form.avatarUrl }));
      }
      showSuccess(`Updated staff details for ${form.name}`);
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not update this staff account.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingAvatar(true);
    setError("");
    try {
      const result = await uploadApi.file(file);
      setForm((f) => ({ ...f, avatarUrl: result.url }));
      showSuccess("Avatar image uploaded!");
    } catch {
      const msg = "Could not upload that image. Try a different file.";
      setError(msg);
      showError(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleToggleStatus = async (member: StaffMember) => {
    const next = member.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const action = next === "ACTIVE" ? "Activate" : "Deactivate";

    const confirm = await Swal.fire({
      title: `${action} Account?`,
      text: `Are you sure you want to ${action.toLowerCase()} ${member.name}'s account?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: action,
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
      confirmButtonColor: next === "ACTIVE" ? "#22c55e" : "#ef4444",
      cancelButtonColor: "#374151",
    });

    if (!confirm.isConfirmed) return;

    try {
      await staffApi.updateStatus(member._id, next);
      showInfo(`${member.name}'s account is now ${next}`);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Failed to update status.";
      showError(msg);
    }
  };

  const copyPassword = () => {
    if (!createdCredential?.password) return;
    navigator.clipboard.writeText(createdCredential.password).then(() => {
      setCopied(true);
      showSuccess("Password copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const columns: Column<StaffMember>[] = [
    { key: "name", header: "Name", render: (s) => <span className="font-medium">{s.name}</span> },
    { key: "email", header: "Email", render: (s) => s.email ?? "—" },
    { key: "phone", header: "Phone", render: (s) => s.phone },
    { key: "employeeId", header: "Employee ID", render: (s) => s.employeeId ?? "—" },
    { key: "role", header: "Role", render: (s) => s.roleName ?? "—" },
    {
      key: "status",
      header: "Status",
      render: (s) => <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>,
    },
    { key: "lastLoginAt", header: "Last Login", render: (s) => (s.lastLoginAt ? formatDateTime(s.lastLoginAt) : "Never") },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
            <Pencil className="h-3 w-3" /> Edit
          </Button>
          {s.status !== "LOCKED" && (
            <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(s)}>
              {s.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Staff</h1>
          <p className="text-xs text-text-muted">Internal team accounts — Super Admin only.</p>
        </div>
        <Button size="sm" onClick={openInvite}>
          <Plus className="h-3.5 w-3.5" /> New Staff Account
        </Button>
      </div>

      <Table columns={columns} rows={staff} rowKey={(s) => s._id} loading={loading} emptyMessage="No staff accounts yet." />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={createdCredential ? "Staff Account Created" : editingId ? "Edit Staff Account" : "New Staff Account"}
        footer={
          createdCredential ? (
            <Button size="sm" onClick={() => setModalOpen(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={editingId ? handleSaveEdit : handleInvite} loading={saving}>
                {editingId ? "Save Changes" : "Create Account"}
              </Button>
            </>
          )
        }
      >
        {createdCredential ? (
          <div className="space-y-3 text-sm">
            <p className="text-text-secondary">
              Share this temporary password with <strong>{createdCredential.email}</strong> — it is shown only once and was
              also emailed to them. They should change it after logging in.
            </p>
            <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-sunken px-3 py-2 font-mono text-sm">
              <span className="flex-1 select-all text-text-primary">
                {createdCredential.password || <span className="text-text-muted italic">Generating…</span>}
              </span>
              <button onClick={copyPassword} className="text-text-muted hover:text-text-primary" disabled={!createdCredential.password}>
                {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-center pb-1">
              <div className="relative">
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-accent-soft text-lg font-semibold text-accent">
                  {form.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- user-supplied Cloudinary URL
                    <img src={form.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (form.name.trim()[0] ?? "?").toUpperCase()
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-surface-border bg-surface-card text-text-secondary hover:text-accent"
                  aria-label="Change photo"
                >
                  {uploadingAvatar ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
                </button>
                <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </div>
            </div>
            <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input label="Email" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Employee ID" required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value.toUpperCase() })} placeholder="e.g. MS-1001" />
            <Select label="Role" required value={form.roleId} onChange={(e) => setForm({ ...form, roleId: e.target.value })}>
              <option value="">Select a role…</option>
              {roles.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.name}
                </option>
              ))}
            </Select>
            {error && <p className="text-xs font-medium text-red-500">{error}</p>}
          </div>
        )}
      </Modal>
    </div>
  );
}
