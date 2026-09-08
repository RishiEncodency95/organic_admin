import { api } from "./api";
import { ExpenseCategory } from "./types";

export interface ExpenseCategoryInput {
  name: string;
  isActive: boolean;
  notes?: string;
}

export const expenseCategoriesApi = {
  list: () => api.get<ExpenseCategory[]>("/expense-categories/admin"),
  create: (input: ExpenseCategoryInput) => api.post<ExpenseCategory>("/expense-categories/admin", input),
  update: (id: string, input: Partial<ExpenseCategoryInput>) => api.put<ExpenseCategory>(`/expense-categories/admin/${id}`, input),
  remove: (id: string) => api.delete<ExpenseCategory>(`/expense-categories/admin/${id}`),
};
