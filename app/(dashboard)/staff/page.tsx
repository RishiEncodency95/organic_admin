"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Copy, Check, Pencil, Camera, Loader2, PowerOff, Power, Trash2, ChevronDown, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";
import typography from "../pages/PagesTypography.module.css";
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | StaffStatus>("ALL");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleDelete = async (member: StaffMember) => {
    const result = await Swal.fire({
      title: "Delete Account?",
      html: `<p style="color:#e2e8f0;font-size:0.9rem;">This will permanently delete <strong>${member.name}</strong>'s account.<br/>This action cannot be undone.</p>`,
      icon: "error",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#374151",
    });

    if (!result.isConfirmed) return;

    try {
      await staffApi.delete(member._id);
      showSuccess(`${member.name}'s account has been deleted.`);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Failed to delete staff account.";
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

  return (
    <div
      className={`${typography.pages} min-h-[calc(100vh-100px)] w-full overflow-hidden bg-white text-[#18233b]`}
      style={{
        boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
      }}
    >
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            TOP HEADING — Matching Pages & CMS
        ================================================= */}
        <div className="mb-[20px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1 className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#18233b]">
              Staff
            </h1>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={openInvite}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#293681] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(41,54,129,0.15)] transition hover:bg-[#1f2963]"
            >
              <Plus
                className="h-[12px] w-[12px]"
                strokeWidth={1.7}
              />
              New Staff Account
            </button>
          </div>
        </div>

        {/* =============================================
            STAFF TABLE — Matching Pages & CMS
        ============================================= */}
        <div
          className="mt-[4px] flex min-h-0 flex-1 flex-col overflow-visible rounded-[7px] bg-white border border-[#e8e5df]"
          style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px" }}
        >
          <div className="overflow-x-auto overflow-y-visible">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="relative px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    {/* Status Dropdown in Thead */}
                    <div className="relative inline-block text-left" ref={statusDropdownRef}>
                      <button
                        type="button"
                        onClick={() => setStatusDropdownOpen((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 rounded-[4px] bg-white/10 px-2 py-0.5 text-[8px] font-bold tracking-wider text-white transition hover:bg-white/20 focus:outline-none"
                      >
                        <span>
                          {statusFilter === "ALL" ? "STATUS" : statusFilter === "LOCKED" ? "DEACTIVATED" : statusFilter}
                        </span>
                        <ChevronDown className={`h-[10px] w-[10px] transition-transform ${statusDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      {statusDropdownOpen && (
                        <div className="absolute left-0 top-full z-40 mt-1 min-w-[135px] overflow-hidden rounded-[6px] border border-slate-200 bg-white p-1 text-[8px] font-medium shadow-xl">
                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter("ALL");
                              setStatusDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition ${
                              statusFilter === "ALL" ? "bg-[#293681] text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span>All Status</span>
                            <span className="text-[7px] opacity-75">{staff.length}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter("ACTIVE");
                              setStatusDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition ${
                              statusFilter === "ACTIVE" ? "bg-[#293681] text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                            <span className="text-[7px] opacity-75">{staff.filter((s) => s.status === "ACTIVE").length}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter("INACTIVE");
                              setStatusDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition ${
                              statusFilter === "INACTIVE" ? "bg-[#293681] text-white font-semibold" : "text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                              Inactive
                            </span>
                            <span className="text-[7px] opacity-75">{staff.filter((s) => s.status === "INACTIVE").length}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setStatusFilter("LOCKED");
                              setStatusDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left transition ${
                              statusFilter === "LOCKED" ? "bg-[#293681] text-white font-semibold" : "text-amber-700 hover:bg-amber-50"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                              Deactivated
                            </span>
                            <span className="text-[7px] opacity-75">{staff.filter((s) => s.status === "LOCKED").length}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-[12px] py-[6px] text-right text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-[11px] text-[#6c7587]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#293681]" />
                        <span>Loading staff members...</span>
                      </div>
                    </td>
                  </tr>
                ) : (statusFilter === "ALL" ? staff : staff.filter((s) => s.status === statusFilter)).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[10px] text-[#6c7587]">
                      {statusFilter !== "ALL" ? `No ${statusFilter.toLowerCase()} staff accounts found.` : "No staff accounts found."}
                    </td>
                  </tr>
                ) : (
                  (statusFilter === "ALL" ? staff : staff.filter((s) => s.status === statusFilter)).map((s) => {
                    const lastLoginStr = s.lastLoginAt ? formatDateTime(s.lastLoginAt) : null;
                    const datePart = lastLoginStr ? lastLoginStr.split(",")[0] : null;
                    const timePart =
                      lastLoginStr && lastLoginStr.includes(",")
                        ? lastLoginStr.split(",").slice(1).join(",").trim()
                        : null;

                    return (
                      <tr
                        key={s._id}
                        className="transition hover:bg-slate-50/80"
                      >
                        {/* NAME — Burgundy/Wine color from previous email */}
                        <td className="px-[12px] py-[8px]">
                          <span className="text-[8.5px] font-semibold text-[#4B1426]">
                            {s.name}
                          </span>
                        </td>

                        {/* EMAIL — Blue color + Click opens Outlook/Gmail */}
                        <td className="px-[12px] py-[8px]">
                          {s.email ? (
                            <a
                              href={`mailto:${s.email}`}
                              title={`Send email to ${s.email} via Outlook / Gmail`}
                              className="group inline-flex items-center gap-1 text-[8px] font-semibold text-blue-600 transition hover:text-blue-800 hover:underline"
                            >
                              <span>{s.email}</span>
                              <ExternalLink className="h-[8px] w-[8px] opacity-60 transition group-hover:opacity-100" />
                            </a>
                          ) : (
                            <span className="text-[8px] text-[#6c7587]">—</span>
                          )}
                        </td>

                        {/* PHONE */}
                        <td className="px-[12px] py-[8px]">
                          <span className="text-[8px] font-medium text-[#334155]">
                            {s.phone || "—"}
                          </span>
                        </td>

                        {/* EMPLOYEE ID */}
                        <td className="px-[12px] py-[8px]">
                          <span className="rounded-[4px] bg-[#f0f4f8] px-[6px] py-[2px] font-mono text-[7.5px] font-semibold text-[#233D4D]">
                            {s.employeeId || "—"}
                          </span>
                        </td>

                        {/* ROLE */}
                        <td className="px-[12px] py-[8px]">
                          <span className="text-[8px] font-semibold text-[#293681]">
                            {s.roleName ?? "—"}
                          </span>
                        </td>

                        {/* STATUS — Deactivated in Orange when locked */}
                        <td className="px-[12px] py-[8px]">
                          <span
                            className={`inline-flex items-center gap-[4px] rounded-[4px] px-[6px] py-[2.5px] text-[7px] font-semibold ${
                              s.status === "ACTIVE"
                                ? "bg-[#edf6ee] text-[#327d50] border border-emerald-200/50"
                                : s.status === "LOCKED"
                                ? "bg-amber-50 text-amber-700 border border-amber-300/70"
                                : "bg-slate-100 text-slate-600 border border-slate-200/60"
                            }`}
                          >
                            <span
                              className={`h-[4px] w-[4px] rounded-full ${
                                s.status === "ACTIVE"
                                  ? "bg-[#308052]"
                                  : s.status === "LOCKED"
                                  ? "bg-amber-500"
                                  : "bg-slate-500"
                              }`}
                            />
                            {s.status === "LOCKED" ? "DEACTIVATED" : s.status}
                          </span>
                        </td>

                        {/* LAST LOGIN */}
                        <td className="px-[12px] py-[8px]">
                          {lastLoginStr ? (
                            <div className="flex flex-col">
                              <span className="text-[7.5px] font-semibold text-[#293681]">
                                {datePart}
                              </span>
                              {timePart && (
                                <span className="text-[7px] font-medium text-[#6c7587]">
                                  {timePart}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[7.5px] font-medium text-[#6c7587]">
                              Never
                            </span>
                          )}
                        </td>

                        {/* ACTIONS — Glassmorphism Effect & Direct Colors (Edit: Blue, Deactivate: Orange, Delete: Red) */}
                        <td className="px-[12px] py-[8px] text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit (Blue Glassmorphism) */}
                            <button
                              type="button"
                              title="Edit Staff Member"
                              onClick={() => openEdit(s)}
                              className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-600 backdrop-blur-md border border-blue-400/30 shadow-[0_2px_6px_rgba(37,99,235,0.12)] transition-all hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95"
                            >
                              <Pencil className="h-[12px] w-[12px] text-blue-600" />
                            </button>

                            {/* Deactivate / Activate (Orange Glassmorphism) */}
                            {s.status !== "LOCKED" && (
                              <button
                                type="button"
                                title={s.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
                                onClick={() => handleToggleStatus(s)}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-orange-500/10 text-orange-600 backdrop-blur-md border border-orange-400/30 shadow-[0_2px_6px_rgba(249,115,22,0.12)] transition-all hover:bg-orange-500/20 hover:border-orange-400/50 hover:shadow-[0_3px_10px_rgba(249,115,22,0.25)] hover:scale-105 active:scale-95"
                              >
                                {s.status === "ACTIVE" ? (
                                  <PowerOff className="h-[12px] w-[12px] text-orange-600" />
                                ) : (
                                  <Power className="h-[12px] w-[12px] text-orange-600" />
                                )}
                              </button>
                            )}

                            {/* Delete (Red Glassmorphism) */}
                            <button
                              type="button"
                              title="Delete Staff Account"
                              onClick={() => handleDelete(s)}
                              className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-red-500/10 text-red-600 backdrop-blur-md border border-red-400/30 shadow-[0_2px_6px_rgba(220,38,38,0.12)] transition-all hover:bg-red-500/20 hover:border-red-400/50 hover:shadow-[0_3px_10px_rgba(220,38,38,0.25)] hover:scale-105 active:scale-95"
                            >
                              <Trash2 className="h-[12px] w-[12px] text-red-600" />
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

          {/* Table Footer Stats */}
          {!loading && staff.length > 0 && (
            <div className="flex items-center justify-between border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px] text-[#6c7587]">
              <span>
                Total Staff Accounts:{" "}
                <strong className="font-semibold text-[#18233b]">
                  {statusFilter === "ALL" ? staff.length : staff.filter((s) => s.status === statusFilter).length}
                </strong>
                {statusFilter !== "ALL" && ` (filtered from ${staff.length})`}
              </span>
              <span className="text-[7.5px] text-[#8a92a0]">All members registered on platform</span>
            </div>
          )}
        </div>
      </div>

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
