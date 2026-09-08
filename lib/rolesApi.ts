import { api } from "./api";
import { Role, Permission } from "./types";

export interface CreateRoleInput {
  name: string;
  slug: string;
  description?: string;
  permissionIds: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissionIds?: string[];
  status?: "ACTIVE" | "INACTIVE";
}

export const rolesApi = {
  list: () => api.get<Role[]>("/roles/admin"),
  permissions: () => api.get<Permission[]>("/roles/admin/permissions"),
  create: (input: CreateRoleInput) => api.post<Role>("/roles/admin", input),
  update: (id: string, input: UpdateRoleInput) => api.put<Role>(`/roles/admin/${id}`, input),
  remove: (id: string) => api.delete<null>(`/roles/admin/${id}`),
};
