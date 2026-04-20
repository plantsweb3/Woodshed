/*
 * Client-side avatar resize helper. Keeps images small enough to store inline
 * as a data URL without adding a blob storage dependency.
 */

const MAX_DIM = 256;
const JPEG_QUALITY = 0.85;

export async function resizeAvatarClient(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Pick an image file (PNG or JPEG).");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(MAX_DIM / bitmap.width, MAX_DIM / bitmap.height, 1);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available.");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, width, height);

  return await new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Couldn't encode image."));
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Couldn't read image."));
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

export function isLikelyDataUrl(s: string) {
  return typeof s === "string" && s.startsWith("data:image/");
}

export const MAX_AVATAR_DATA_URL_LENGTH = 200_000;
