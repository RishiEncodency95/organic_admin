import { cropToCanvas, type PixelCrop } from "react-image-crop";

/**
 * Renders the user's crop selection (in the *displayed* <img> element's pixel
 * space) onto an offscreen canvas at full source resolution and returns it as
 * a File ready to hand to the existing Cloudinary upload helper.
 *
 * `image` must be the actual rendered <img> DOM node the crop box was drawn
 * over (react-image-crop's crop coordinates are relative to its displayed
 * size, not its natural size) — `cropToCanvas` handles that scaling for us.
 */
export async function pixelCropToFile(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName = "cropped-image.jpg",
  mimeType = "image/jpeg",
  quality = 0.92
): Promise<File> {
  const canvas = document.createElement("canvas");
  await cropToCanvas(image, canvas, crop);

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to export cropped image."))),
      mimeType,
      quality
    );
  });

  return new File([blob], fileName, { type: mimeType });
}
