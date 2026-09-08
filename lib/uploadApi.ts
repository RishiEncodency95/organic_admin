import { api } from "./api";

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadApi = {
  file: (file: File, folder = "moksha-sewa/avatars") => {
    const formData = new FormData();
    formData.append("file", file);
    return api.postForm<UploadResult>(`/uploads?folder=${encodeURIComponent(folder)}`, formData);
  },
};
