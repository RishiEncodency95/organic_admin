import { api } from "./api";
import { CaseStatus } from "./types";

export interface ReportsOverview {
  cases: { total: number; open: number; critical: number; byStatus: Record<CaseStatus, number> };
  requests: { total: number; pending: number };
  volunteers: { total: number; active: number };
  donations: {
    totalRaised: number;
    totalDonations: number;
    thisMonthRaised: number;
    thisMonthDonations: number;
    byCause: Record<string, number>;
  };
  expenses: { pendingAmount: number; pendingCount: number; approvedAmount: number; approvedCount: number };
}

export interface ReportSnapshot {
  _id: string;
  date: string;
  cases: { total: number; open: number; closed: number; critical: number };
  requests: { total: number; pending: number };
  volunteers: { total: number; active: number };
  donations: { totalRaised: number; totalDonations: number };
}

async function downloadCsv(path: string, filename: string): Promise<void> {
  const html = await api.getHtml(path); // CSV is also plain text, same authenticated-fetch need
  const blob = new Blob([html], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const reportsApi = {
  overview: () => api.get<ReportsOverview>("/reports/admin/overview"),
  snapshots: (days = 30) => api.get<ReportSnapshot[]>(`/reports/admin/snapshots?days=${days}`),
  exportCases: () => downloadCsv("/reports/admin/export/cases.csv", `cases-${Date.now()}.csv`),
  exportDonations: () => downloadCsv("/reports/admin/export/donations.csv", `donations-${Date.now()}.csv`),
};
