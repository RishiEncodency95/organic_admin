import { api } from "./api";

export type CareerOptionType = "notice_period" | "joining_period" | "expected_ctc";

export interface CareerOption {
  _id: string;
  type: CareerOptionType;
  label: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CareerOptionInput = Pick<CareerOption, "type" | "label" | "order" | "isActive">;

// Cache-busting query keeps the list fresh after a write (api.get memoises GETs briefly).
export const careerOptionsApi = {
  list: (types: CareerOptionType[]) =>
    Promise.all(
      types.map((type) =>
        api.get<CareerOption[]>(`/careers/admin/options?type=${type}&_=${Date.now()}`)
      )
    ).then((lists) => lists.flat()),
  create: (data: CareerOptionInput) => api.post<CareerOption>("/careers/admin/options", data),
  update: (id: string, data: Partial<CareerOptionInput>) =>
    api.patch<CareerOption>(`/careers/admin/options/${id}`, data),
  remove: (id: string) => api.delete<void>(`/careers/admin/options/${id}`),
};
