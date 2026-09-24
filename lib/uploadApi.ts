import { api } from "./api";
import { getImageSizeError } from "./uploadLimit";

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadApi = {
  file: async (file: File, folder = "moksha-sewa/avatars") => {
    const sizeError = await getImageSizeError(file);
    if (sizeError) throw new Error(sizeError);
    const formData = new FormData();
    formData.append("file", file);
    return api.postForm<UploadResult>(`/uploads?folder=${encodeURIComponent(folder)}`, formData);
  },
};
