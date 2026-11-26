import { api } from "./api";
import { getImageSizeError } from "./uploadLimit";

export interface UploadResult {
  url: string;
  publicId: string;
}

export const uploadApi = {
  file: async (
    file: File,
    folder = "moksha-sewa/avatars",
    /** Optional exact pixel size; the server rejects (and removes) an image that doesn't match. */
    requiredSize?: { width: number; height: number },
  ) => {
    const sizeError = await getImageSizeError(file);
    if (sizeError) throw new Error(sizeError);
    const formData = new FormData();
    formData.append("file", file);
    const sizeQuery = requiredSize
      ? `&requiredWidth=${requiredSize.width}&requiredHeight=${requiredSize.height}`
      : "";
    return api.postForm<UploadResult>(`/uploads?folder=${encodeURIComponent(folder)}${sizeQuery}`, formData);
  },
};
