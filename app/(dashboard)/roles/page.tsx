"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Lock,
  ShieldCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  Users,
  LayoutGrid,
  FileText,
  Mail,
  Settings,
  Shield,
} from "lucide-react";
import Swal from "sweetalert2";
import typography from "../pages/PagesTypography.module.css";
import Modal from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { rolesApi, CreateRoleInput } from "@/lib/rolesApi";
import { Role, Permission } from "@/lib/types";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  status: "ACTIVE" as "ACTIVE" | "INACTIVE",
};

const MODULE_ICONS: Record<string, typeof Building2> = {
  "Exhibitors": Building2,
  "Buyers & Visitors": Users,
  "Stalls & Pavilions": LayoutGrid,
  "Staff & Roles": ShieldCheck,
  "Content & CMS": FileText,
  "Enquiries & Leads": Mail,
  "System & Settings": Settings,
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

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination (10 per page)
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Modal & Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([rolesApi.list(), rolesApi.permissions()])
      .then(([r, p]) => {
        setRoles(Array.isArray(r) ? r : []);
        setPermissions(Array.isArray(p) ? p : []);
      })
      .catch((err) => {
        const msg = err instanceof ApiRequestError ? err.message : "Failed to load roles.";
        showError(msg);
        setRoles([]);
        setPermissions([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const totalPages = Math.max(1, Math.ceil(roles.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, roles.length);
  const paginatedRoles = roles.slice(startIndex, endIndex);

  const moduleGroups = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of permissions) {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    }
    return groups;
  }, [permissions]);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedPermissionIds(new Set());
    setError("");
    setModalOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditingId(role._id);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description ?? "",
      status: role.status,
    });
    setSelectedPermissionIds(new Set(role.permissionIds || []));
    setError("");
    setModalOpen(true);
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleModule = (modulePermissions: Permission[]) => {
    const allSelected = modulePermissions.every((p) => selectedPermissionIds.has(p._id));
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      for (const p of modulePermissions) {
        if (allSelected) next.delete(p._id);
        else next.add(p._id);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Role name is required.");
      return;
    }
    if (!editingId && !form.slug.trim()) {
      setError("Role slug is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      if (!editingId) {
        const input: CreateRoleInput = {
          name: form.name.trim(),
          slug: form.slug.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
          description: form.description.trim() || undefined,
          permissionIds: Array.from(selectedPermissionIds),
        };
        await rolesApi.create(input);
        showSuccess(`Role "${form.name}" created successfully!`);
      } else {
        await rolesApi.update(editingId, {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          permissionIds: Array.from(selectedPermissionIds),
          status: form.status,
        });
        showSuccess(`Role "${form.name}" updated successfully!`);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not save this role.";
      setError(msg);
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (role: Role, newStatus: "ACTIVE" | "INACTIVE") => {
    if (role.isSystem && newStatus === "INACTIVE") {
      showError("System roles cannot be deactivated.");
      return;
    }

    // Optimistic UI update
    setRoles((prev) =>
      prev.map((r) => (r._id === role._id ? { ...r, status: newStatus } : r))
    );

    try {
      await rolesApi.update(role._id, { status: newStatus });
      showSuccess(`Role "${role.name}" status changed to ${newStatus}.`);
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Failed to update role status.";
      showError(msg);
      load();
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem) {
      showError("System roles cannot be deleted.");
      return;
    }

    const confirmResult = await Swal.fire({
      title: `Delete "${role.name}"?`,
      text: "This role will be permanently removed. Staff members assigned to this role should be reassigned.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete Role",
      cancelButtonText: "Cancel",
      background: "#1e2433",
      color: "#e2e8f0",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await rolesApi.remove(role._id);
      showSuccess(`Role "${role.name}" deleted.`);
      load();
    } catch (err) {
      const msg = err instanceof ApiRequestError ? err.message : "Could not delete this role.";
      showError(msg);
    }
  };

  return (
    <div className={`${typography.pages} min-h-[calc(100vh-100px)] w-full bg-white text-[#18233b]`}>
      <div className="flex min-h-full flex-col px-[18px] pb-[16px] pt-[14px]">
        {/* =================================================
            TOP HEADING — Matching Staff Page
        ================================================= */}
        <div className="mb-[20px] flex shrink-0 items-center justify-between border-b-[2px] border-[#293681] pb-[8px]">
          <div>
            <h1
              className="text-[19px] font-bold leading-[1.15] tracking-[-0.018em] text-[#23471d]"
              style={{ color: "#23471d" }}
            >
              Roles & Permissions
            </h1>
            <p className="mt-0.5 text-[9px] font-medium text-[#6c7587]">
              Super Admin only — defines what every internal role can see and do.
            </p>
          </div>

          <div className="flex items-center gap-[10px]">
            <button
              type="button"
              onClick={openNew}
              className="flex h-[30px] items-center justify-center gap-[5px] rounded-[6px] bg-[#4B1426] px-[14px] text-[8.5px] font-semibold text-white shadow-[0_5px_12px_rgba(75,20,38,0.25)] transition hover:bg-[#3a0f1d]"
            >
              <Plus className="h-[12px] w-[12px]" strokeWidth={1.7} />
              New Role
            </button>
          </div>
        </div>

        {/* =============================================
            ROLES TABLE — Clean border, no box shadow, rounded thead
        ============================================= */}
        <div className="mt-[4px] flex min-h-0 flex-1 flex-col overflow-hidden bg-white border border-[#e8e5df]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="h-[32px] border-b border-[#e8e5df] bg-[#233D4D]">
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Role Name
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Role Slug
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-[12px] py-[6px] text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-[12px] py-[6px] text-right text-[8.5px] font-bold text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f0ec]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-[11px] text-[#6c7587]">
                        <Loader2 className="h-4 w-4 animate-spin text-[#293681]" />
                        <span>Loading roles...</span>
                      </div>
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[10px] text-[#6c7587]">
                      No roles found.
                    </td>
                  </tr>
                ) : (
                  paginatedRoles.map((r) => {
                    const isSystemRole = r.isSystem;
                    const permCount = r.permissionIds?.length ?? 0;

                    return (
                      <tr key={r._id} className="transition hover:bg-slate-50/80">
                        {/* ROLE NAME — Burgundy/Wine color */}
                        <td className="px-[12px] py-[8px]">
                          <div className="flex items-center gap-1.5">
                            {isSystemRole ? (
                              <span title="System Role" className="inline-flex">
                                <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                              </span>
                            ) : (
                              <ShieldCheck className="h-3 w-3 text-[#293681] shrink-0" />
                            )}
                            <span className="text-[8.5px] font-semibold text-[#4B1426]">
                              {r.name}
                            </span>
                            {isSystemRole && (
                              <span className="rounded-[3px] bg-amber-50 px-1 py-0.5 text-[6.5px] font-bold text-amber-700 border border-amber-200">
                                SYSTEM
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ROLE SLUG — Monospace badge */}
                        <td className="px-[12px] py-[8px]">
                          <span className="rounded-[4px] bg-[#f0f4f8] px-[6px] py-[2px] font-mono text-[7.5px] font-semibold text-[#233D4D]">
                            {r.slug}
                          </span>
                        </td>

                        {/* DESCRIPTION */}
                        <td className="px-[12px] py-[8px]">
                          <span className="text-[8px] font-medium text-[#334155] line-clamp-1 max-w-[280px]">
                            {r.description || "—"}
                          </span>
                        </td>

                        {/* PERMISSIONS BADGE — Ultra-light red shade & Red text */}
                        <td className="px-[12px] py-[8px]">
                          <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#fef2f2] px-[6px] py-[2px] text-[7.5px] font-bold text-[#dc2626] border border-[#fecdd3]">
                            {isSystemRole || r.permissionIds?.includes("*")
                              ? "Full Access (All Modules)"
                              : `${permCount} Permissions`}
                          </span>
                        </td>

                        {/* STATUS DROPDOWN — Active Green, Inactive Red */}
                        <td className="px-[12px] py-[8px]">
                          <select
                            key={`${r._id}-${r.status}`}
                            value={r.status}
                            disabled={isSystemRole}
                            onChange={(e) => handleStatusChange(r, e.target.value as "ACTIVE" | "INACTIVE")}
                            className={`h-[24px] cursor-pointer appearance-none rounded-[4px] px-[8px] pr-[22px] text-[8px] font-bold outline-none bg-no-repeat bg-[right_6px_center] shadow-xs transition disabled:cursor-not-allowed ${
                              r.status === "ACTIVE"
                                ? "bg-[#e8f5e9] text-[#23714a] border border-[#a5d6a7]"
                                : "bg-[#fee2e2] text-[#dc2626] border border-[#fca5a5]"
                            }`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                            }}
                          >
                            <option value="ACTIVE" className="bg-white text-[#23714a] font-bold">
                              ACTIVE
                            </option>
                            <option value="INACTIVE" className="bg-white text-[#dc2626] font-bold">
                              INACTIVE
                            </option>
                          </select>
                        </td>

                        {/* ACTIONS — Glassmorphism Buttons */}
                        <td className="px-[12px] py-[8px] text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Edit Button */}
                            <button
                              type="button"
                              title="Edit Role"
                              onClick={() => openEdit(r)}
                              className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-blue-500/10 text-blue-600 backdrop-blur-md border border-blue-400/30 shadow-[0_2px_6px_rgba(37,99,235,0.12)] transition-all hover:bg-blue-500/20 hover:border-blue-400/50 hover:shadow-[0_3px_10px_rgba(37,99,235,0.25)] hover:scale-105 active:scale-95"
                            >
                              <Pencil className="h-[12px] w-[12px] text-blue-600" />
                            </button>

                            {/* Delete Button */}
                            {!isSystemRole ? (
                              <button
                                type="button"
                                title="Delete Role"
                                onClick={() => handleDelete(r)}
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-red-500/10 text-red-600 backdrop-blur-md border border-red-400/30 shadow-[0_2px_6px_rgba(220,38,38,0.12)] transition-all hover:bg-red-500/20 hover:border-red-400/50 hover:shadow-[0_3px_10px_rgba(220,38,38,0.25)] hover:scale-105 active:scale-95"
                              >
                                <Trash2 className="h-[12px] w-[12px] text-red-600" />
                              </button>
                            ) : (
                              <div
                                title="System Role Protected"
                                className="flex h-[25px] w-[25px] items-center justify-center rounded-[6px] bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              >
                                <Lock className="h-[11px] w-[11px] text-slate-400" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Stats & Pagination (10 per page) */}
          {!loading && roles.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e8e5df] bg-[#fafafa] px-[12px] py-[6px] text-[8px]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#2563eb]">
                  Total Roles: <strong className="font-bold text-[#1d4ed8]">{roles.length}</strong>
                </span>
                <span className="text-[7.5px] text-[#8a92a0]">
                  (Showing {startIndex + 1}–{endIndex} of {roles.length})
                </span>
              </div>

              <div className="flex items-center gap-[4px]">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3 w-3" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`flex h-[22px] min-w-[22px] px-1.5 items-center justify-center rounded-[4px] border text-[8px] font-bold transition ${
                      safePage === pageNum
                        ? "border-[#233D4D] bg-[#233D4D] text-white shadow-xs"
                        : "border-[#d8dce2] bg-white text-[#334155] hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] border border-[#d8dce2] bg-white text-[#334155] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30"
                  title="Next Page"
                >
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =============================================
          CREATE / EDIT ROLE MODAL — Matching Staff Modal
      ============================================= */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Edit Role" : "New Role"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-red-600 transition-all hover:bg-red-100 active:scale-95"
              style={{
                background: "#fff1f2",
                borderRadius: "4px",
                boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(220,38,38,0.15) 0px 0px 0px 1px",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-[32px] items-center gap-1.5 px-[14px] text-[12px] font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
              style={{
                background: "#16a34a",
                borderRadius: "4px",
                boxShadow: "rgba(0,0,0,0.02) 0px 1px 3px 0px, rgba(22,163,74,0.2) 0px 0px 0px 1px",
              }}
            >
              {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {editingId ? "Save Changes" : "Create Role"}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Role Name"
            required
            placeholder="e.g. Exhibition Coordinator"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {!editingId ? (
            <Input
              label="Role Slug"
              required
              placeholder="e.g. EXHIBITION_COORDINATOR"
              value={form.slug}
              onChange={(e) =>
                setForm({
                  ...form,
                  slug: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
                })
              }
              hint="Uppercase letters, numbers and underscores. Cannot be changed later."
            />
          ) : (
            <Input
              label="Role Slug"
              value={form.slug}
              disabled
              hint="Slug is permanent once created."
            />
          )}

          <Input
            label="Description"
            placeholder="Brief responsibilities of this role"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {editingId && (
            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as "ACTIVE" | "INACTIVE" })
              }
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
          )}

          {/* Module-wise Permissions Selection — Ultra-Intuitive Chip Matrix */}
          <div className="pt-1">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#334155]">
                Module Permissions (
                <strong className="text-[#2563eb]">
                  {selectedPermissionIds.size} of {permissions.length} selected
                </strong>
                )
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPermissionIds(new Set(permissions.map((p) => p._id)))}
                  className="text-[9px] font-semibold text-[#2563eb] hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedPermissionIds(new Set())}
                  className="text-[9px] font-semibold text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="max-h-64 space-y-2 overflow-y-auto rounded-[6px] border border-[#e2e8f0] bg-slate-50/40 p-2">
              {Object.entries(moduleGroups).map(([moduleName, modulePermissions]) => {
                const IconComponent = MODULE_ICONS[moduleName] || Shield;
                const selectedInModule = modulePermissions.filter((p) =>
                  selectedPermissionIds.has(p._id)
                ).length;
                const allSelected = selectedInModule === modulePermissions.length;

                return (
                  <div
                    key={moduleName}
                    className="rounded-[6px] border border-[#e8e5df] bg-white p-2.5 transition hover:border-slate-300 shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#f0f4f8] text-[#233D4D]">
                          <IconComponent className="h-3 w-3" />
                        </span>
                        <span className="text-[10px] font-bold text-[#233D4D]">
                          {moduleName}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[7px] font-bold ${
                            selectedInModule > 0
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {selectedInModule}/{modulePermissions.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleModule(modulePermissions)}
                        className="text-[8px] font-semibold text-[#2563eb] hover:underline"
                      >
                        {allSelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>

                    {/* Action Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {modulePermissions.map((p) => {
                        const isChecked = selectedPermissionIds.has(p._id);
                        return (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => togglePermission(p._id)}
                            title={p.label}
                            className={`group inline-flex items-center gap-1.5 rounded-[5px] border px-2.5 py-1 text-[8.5px] transition active:scale-95 ${
                              isChecked
                                ? "border-[#2563eb] bg-[#eff6ff] text-[#1d4ed8] font-bold shadow-xs"
                                : "border-[#e2e8f0] bg-white text-[#475569] font-medium hover:border-[#cbd5e1] hover:bg-slate-50"
                            }`}
                          >
                            <span
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded-[3px] border ${
                                isChecked
                                  ? "border-[#2563eb] bg-[#2563eb] text-white"
                                  : "border-slate-300 bg-white group-hover:border-slate-400"
                              }`}
                            >
                              {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </span>
                            <span>{p.action}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {error && <p className="text-[10px] font-semibold text-red-500">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
