"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, ShieldCheck, Lock } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { rolesApi, CreateRoleInput } from "@/lib/rolesApi";
import { Role, Permission } from "@/lib/types";
import { formatDate } from "@/lib/statusMeta";
import { ApiRequestError } from "@/lib/api";

const EMPTY_FORM = { name: "", slug: "", description: "", status: "ACTIVE" as "ACTIVE" | "INACTIVE" };

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isNew, setIsNew] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([rolesApi.list(), rolesApi.permissions()])
      .then(([r, p]) => {
        setRoles(r);
        setPermissions(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const selected = roles.find((r) => r._id === selectedId) ?? null;

  const openRole = (role: Role) => {
    setSelectedId(role._id);
    setIsNew(false);
    setForm({ name: role.name, slug: role.slug, description: role.description ?? "", status: role.status });
    setSelectedPermissionIds(new Set(role.permissionIds));
    setError("");
  };

  const openNew = () => {
    setSelectedId(null);
    setIsNew(true);
    setForm(EMPTY_FORM);
    setSelectedPermissionIds(new Set());
    setError("");
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const moduleGroups = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const p of permissions) {
      if (!groups[p.module]) groups[p.module] = [];
      groups[p.module].push(p);
    }
    return groups;
  }, [permissions]);

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
    setSaving(true);
    setError("");
    try {
      if (isNew) {
        const input: CreateRoleInput = {
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          permissionIds: Array.from(selectedPermissionIds),
        };
        const created = await rolesApi.create(input);
        setIsNew(false);
        setSelectedId(created._id);
      } else if (selected) {
        await rolesApi.update(selected._id, {
          name: form.name,
          description: form.description || undefined,
          permissionIds: Array.from(selectedPermissionIds),
          status: form.status,
        });
      }
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not save this role.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected || !window.confirm(`Delete the "${selected.name}" role?`)) return;
    setSaving(true);
    setError("");
    try {
      await rolesApi.remove(selected._id);
      setSelectedId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Could not delete this role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Roles & Permissions</h1>
          <p className="text-xs text-text-muted">Super Admin only — defines what every internal role can see and do.</p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> New Role
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">Roles</h2>
          {loading ? (
            <p className="text-xs text-text-muted">Loading…</p>
          ) : (
            <div className="space-y-1.5">
              {roles.map((r) => (
                <button
                  key={r._id}
                  onClick={() => openRole(r)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                    selectedId === r._id ? "border-accent bg-accent-soft" : "border-surface-border hover:bg-surface-sunken"
                  }`}
                >
                  <span className="flex items-center gap-1.5 font-medium text-text-primary">
                    {r.isSystem ? <Lock className="h-3 w-3 text-text-muted" /> : <ShieldCheck className="h-3 w-3 text-accent" />}
                    {r.name}
                  </span>
                  <Badge tone={r.status === "ACTIVE" ? "success" : "neutral"}>{r.permissions.length}</Badge>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          {!selected && !isNew ? (
            <p className="text-xs text-text-muted">Select a role to view or edit its permissions, or create a new one.</p>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                {isNew ? (
                  <Input
                    label="Slug"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
                    hint="Lowercase letters, numbers and underscores. Cannot be changed later."
                  />
                ) : (
                  <Input label="Slug" value={form.slug} disabled hint="Immutable once created." />
                )}
              </div>
              <Textarea
                label="Description"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              {!isNew && (
                <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "ACTIVE" | "INACTIVE" })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </Select>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Permissions</p>
                <div className="max-h-96 space-y-3 overflow-y-auto rounded-lg border border-surface-border p-3">
                  {Object.entries(moduleGroups).map(([moduleName, modulePermissions]) => {
                    const allSelected = modulePermissions.every((p) => selectedPermissionIds.has(p._id));
                    return (
                      <div key={moduleName}>
                        <label className="flex items-center gap-2 text-xs font-semibold capitalize text-text-primary">
                          <input type="checkbox" checked={allSelected} onChange={() => toggleModule(modulePermissions)} />
                          {moduleName}
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-1 pl-5 sm:grid-cols-3">
                          {modulePermissions.map((p) => (
                            <label key={p._id} className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                              <input
                                type="checkbox"
                                checked={selectedPermissionIds.has(p._id)}
                                onChange={() => togglePermission(p._id)}
                              />
                              {p.action}
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {error && <p className="text-xs font-medium text-red-600">{error}</p>}

              <div className="flex items-center gap-2 border-t border-surface-border pt-3">
                {!isNew && selected && !selected.isSystem && (
                  <Button variant="danger" size="sm" onClick={handleDelete} loading={saving}>
                    Delete Role
                  </Button>
                )}
                <div className="flex-1" />
                <Button size="sm" onClick={handleSave} loading={saving}>
                  Save
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
