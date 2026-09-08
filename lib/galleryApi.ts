import { api } from "./api";

export type GalleryType = "image" | "video";

export interface GalleryItem {
  _id: string;
  type: GalleryType;
  url: string;
  thumbnailUrl?: string;
  publicId?: string;
  thumbnailPublicId?: string;
  alt: string;
  caption?: string;
  description?: string;
  category?: string;
  credit?: string;
  sortOrder: number;
  downloadCount: number;
  isActive: boolean;
  createdAt: string;
}

export type GalleryInput = Omit<GalleryItem, "_id" | "createdAt" | "downloadCount">;

export const galleryApi = {
  list: () => api.get<GalleryItem[]>("/gallery/admin"),
  create: (input: GalleryInput) => api.post<GalleryItem>("/gallery/admin", input),
  update: (id: string, input: Partial<GalleryInput>) => api.put<GalleryItem>(`/gallery/admin/${id}`, input),
  remove: (id: string) => api.delete<GalleryItem>(`/gallery/admin/${id}`),
};
