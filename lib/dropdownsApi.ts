import { api } from "./api";

export interface DropdownListInfo {
  key: string;
  name: string;
  group: string;
  usedIn: string[];
  parent?: string;
  parentName?: string;
  total: number;
  active: number;
  /** Admin who last changed this list's options, and when (null until someone does) */
  updatedBy?: string | null;
  updatedAt?: string | null;
}

export interface DropdownOption {
  _id: string;
  list: string;
  label: string;
  value: string;
  parentValue: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type DropdownOptionInput = {
  label: string;
  value?: string;
  parentValue?: string;
  isActive?: boolean;
};

export interface CustomCity {
  _id: string;
  countryCode: string;
  stateCode: string;
  name: string;
  isActive: boolean;
}

export interface LocationItem {
  _id: string;
  name: string;
  countryCode: string;
  stateCode?: string;
}

// api.get memoises GETs for a moment; the timestamp keeps lists fresh after a change.
const fresh = () => `_=${Date.now()}`;

export const dropdownsApi = {
  lists: () => api.get<DropdownListInfo[]>(`/dropdowns/admin/lists?${fresh()}`),
  options: (list: string) =>
    api.get<DropdownOption[]>(`/dropdowns/admin/options?list=${encodeURIComponent(list)}&${fresh()}`),
  create: (list: string, data: DropdownOptionInput) =>
    api.post<DropdownOption>("/dropdowns/admin/options", { list, ...data }),
  update: (id: string, data: Partial<DropdownOptionInput>) => api.patch<DropdownOption>(`/dropdowns/admin/options/${id}`, data),
  remove: (id: string) => api.delete<null>(`/dropdowns/admin/options/${id}`),
  reorder: (list: string, ids: string[]) =>
    api.put<DropdownOption[]>(`/dropdowns/admin/lists/${encodeURIComponent(list)}/order`, { ids }),
};

export const locationsApi = {
  countries: () => api.get<LocationItem[]>("/crm-countries"),
  states: (countryCode: string) => api.get<LocationItem[]>(`/crm-states?countryCode=${encodeURIComponent(countryCode)}`),
  customCities: () => api.get<CustomCity[]>(`/locations/admin/cities?${fresh()}`),
  addCity: (stateCode: string, name: string) => api.post<CustomCity>("/locations/admin/cities", { stateCode, name }),
  updateCity: (id: string, data: Partial<Pick<CustomCity, "name" | "isActive">>) =>
    api.patch<CustomCity>(`/locations/admin/cities/${id}`, data),
  removeCity: (id: string) => api.delete<null>(`/locations/admin/cities/${id}`),
};
