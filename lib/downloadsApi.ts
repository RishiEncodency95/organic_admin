import { api, getAccessToken, getApiBaseUrl } from "./api";

export type DownloadStatus = "active" | "inactive";

export interface AuditUser {
  _id: string;
  name?: string;
  email?: string;
}

export interface DownloadItem {
  _id: string;
  name: string;
  /** Cloudinary URL of the PDF */
  fileUrl: string;
  fileName: string;
  /** Bytes */
  fileSize: number;
  fileFormat: "pdf";
  status: DownloadStatus;
  orderBy: number;
  addedBy: AuditUser | null;
  updatedBy: AuditUser | null;
  createdAt: string;
  updatedAt: string;
}

export interface DownloadInput {
  name: string;
  status: DownloadStatus;
  orderBy: number;
  /** Required when adding; optional when editing (keeps the current PDF) */
  file?: File | null;
}

/** Same limits as the backend (download.service.ts / download.controller.ts) */
export const DOWNLOAD_LIMITS = { name: 120, orderBy: 9999, maxPdfMb: 20 } as const;

const BASE = "/downloads";
// Large PDFs can take a while to reach Cloudinary
const UPLOAD_TIMEOUT_MS = 5 * 60 * 1000;

const toForm = (data: Partial<DownloadInput>) => {
  const form = new FormData();
  if (data.name !== undefined) form.append("name", data.name);
  if (data.status !== undefined) form.append("status", data.status);
  if (data.orderBy !== undefined) form.append("orderBy", String(data.orderBy));
  if (data.file) form.append("file", data.file);
  return form;
};

export const downloadsApi = {
  // Cache-busting query keeps the list fresh after a change
  list: () => api.get<DownloadItem[]>(`${BASE}/admin?_=${Date.now()}`).then((res) => res ?? []),
  create: (data: DownloadInput) => api.postForm<DownloadItem>(BASE, toForm(data), { timeoutMs: UPLOAD_TIMEOUT_MS }),
  update: (id: string, data: Partial<DownloadInput>) =>
    data.file
      ? api.putForm<DownloadItem>(`${BASE}/${id}`, toForm(data), { timeoutMs: UPLOAD_TIMEOUT_MS })
      : api.patch<DownloadItem>(`${BASE}/${id}`, { name: data.name, status: data.status, orderBy: data.orderBy }),
  remove: (id: string) => api.delete<{ deleted: boolean }>(`${BASE}/${id}`),
  /** Opens an item's PDF (active or not) in a new tab; needs the admin's token, so it is fetched first */
  openPdf: async (id: string) => {
    // Opened right away (inside the click) so popup blockers allow it
    const tab = window.open("", "_blank");
    try {
      const token = getAccessToken();
      const res = await fetch(`${getApiBaseUrl()}${BASE}/${id}/admin-file`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Could not open this PDF.");
      }
      const url = URL.createObjectURL(await res.blob());
      if (tab) tab.location.href = url;
      else window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      tab?.close();
      throw err;
    }
  },
};
