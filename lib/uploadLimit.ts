import Swal from "sweetalert2";
import { settingsApi } from "./settingsApi";

export const DEFAULT_MAX_IMAGE_UPLOAD_KB = 500;

export async function getMaxImageUploadKB(): Promise<number> {
  try {
    const settings = await settingsApi.get();
    const parsed = Number(settings?.maxImageUploadSizeKB);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_MAX_IMAGE_UPLOAD_KB;
  } catch {
    return DEFAULT_MAX_IMAGE_UPLOAD_KB;
  }
}

export function imageTooLargeMessage(fileKB: number, maxKB: number): string {
  return `File size is too large (${Math.round(fileKB)} KB). Please reduce the file size — images larger than ${maxKB} KB cannot be uploaded.`;
}

/** Returns an error message if `file` is an image over the configured limit, otherwise null. */
export async function getImageSizeError(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  const maxKB = await getMaxImageUploadKB();
  const fileKB = file.size / 1024;
  return fileKB > maxKB ? imageTooLargeMessage(fileKB, maxKB) : null;
}

export function showUploadError(err: unknown, fallback = "Failed to upload image."): void {
  Swal.fire({
    title: "Upload Failed",
    text: err instanceof Error && err.message ? err.message : typeof err === "string" ? err : fallback,
    icon: "error",
    confirmButtonColor: "#218DAE",
  });
}
