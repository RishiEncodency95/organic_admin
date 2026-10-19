import { api, getAccessToken } from "./api";
import { API_BASE_URL } from "./api";

export interface BacklinkItem {
  _id: string;
  targetUrl: string;
  sourceUrl: string;
  anchorText?: string;
  type: "dofollow" | "nofollow";
  daScore: number;
  status: "active" | "lost" | "broken";
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BacklinkStats {
  total: number;
  active: number;
  lost: number;
  broken: number;
  dofollow: number;
  nofollow: number;
}

export interface BacklinkResponse {
  items: BacklinkItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: BacklinkStats;
}

export const backlinkApi = {
  // 1. Fetch backlinks list + live counts
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.type) searchParams.set("type", params.type);

    const query = searchParams.toString();
    return api.get<BacklinkResponse>(`/seo/backlinks${query ? `?${query}` : ""}`);
  },

  // 2. Create single backlink
  create: async (payload: {
    targetUrl: string;
    sourceUrl: string;
    anchorText?: string;
    type?: "dofollow" | "nofollow";
    daScore?: number;
    status?: "active" | "lost" | "broken";
    notes?: string;
  }) => {
    return api.post<BacklinkItem>("/seo/backlinks/create", payload);
  },

  // 3. Upload Excel / CSV file
  uploadExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/seo/backlinks/upload-excel`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.message || "Failed to upload excel file");
    }
    return json;
  },

  // 4. Download Excel URL helper
  getExportUrl: () => `${API_BASE_URL}/seo/backlinks/export`,

  // 5. Delete backlink
  delete: async (id: string) => {
    return api.delete<{ message: string }>(`/seo/backlinks/${id}`);
  },
};
