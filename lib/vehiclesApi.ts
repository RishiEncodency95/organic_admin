import { api } from "./api";
import { Vehicle, VehicleType } from "./types";

export interface VehicleInput {
  type: VehicleType;
  registrationNumber: string;
  capacity?: number;
  driverName?: string;
  driverPhone?: string;
  isActive: boolean;
  notes?: string;
}

export const vehiclesApi = {
  list: () => api.get<Vehicle[]>("/vehicles/admin"),
  create: (input: VehicleInput) => api.post<Vehicle>("/vehicles/admin", input),
  update: (id: string, input: Partial<VehicleInput>) => api.put<Vehicle>(`/vehicles/admin/${id}`, input),
  remove: (id: string) => api.delete<Vehicle>(`/vehicles/admin/${id}`),
};
