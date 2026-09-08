import { api } from "./api";
import { Customer } from "./types";

export const customersApi = {
  list: () => api.get<Customer[]>("/users/admin"),
};
