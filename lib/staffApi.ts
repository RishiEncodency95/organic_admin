import { api } from "./api";
import { StaffMember, StaffStatus } from "./types";

export interface InviteStaffInput {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  roleId: string;
  avatarUrl?: string;
}

export interface InviteStaffResult {
  user: StaffMember;
  temporaryPassword: string;
}

export const staffApi = {
  list: () => api.get<StaffMember[]>("/users/admin/staff"),
  invite: (input: InviteStaffInput) => api.post<InviteStaffResult>("/users/admin/staff", input),
  update: (id: string, input: InviteStaffInput) => api.patch<StaffMember>(`/users/admin/staff/${id}`, input),
  updateStatus: (id: string, status: StaffStatus) => api.patch<StaffMember>(`/users/admin/staff/${id}/status`, { status }),
  updateRole: (id: string, roleId: string) => api.patch<StaffMember>(`/users/admin/staff/${id}/role`, { roleId }),
};
