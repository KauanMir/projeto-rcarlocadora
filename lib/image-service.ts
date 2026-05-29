/**
 * Image upload service — provider abstraction layer.
 *
 * Current implementation: Cloudinary unsigned upload via XHR
 * (XHR is used instead of fetch to support real upload progress events).
 *
 * To migrate to UploadThing / S3 / R2: replace uploadImage() only.
 * The rest of the codebase imports from this file and needs no changes.
 */

export interface UploadResult {
  url: string;
  publicId: string;
}

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Returns a human-readable error string, or null if the file is valid. */
export function validateImage(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Use JPEG, PNG ou WebP.";
  if (file.size > MAX_SIZE) return "Máximo 10 MB por imagem.";
  return null;
}

/** True when the required env vars are present. */
export function isCloudinaryConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  );
}

/**
 * Uploads a file to Cloudinary via unsigned upload preset.
 * Calls onProgress(0–100) as the upload progresses.
 */
export function uploadImage(
  file: File,
  onProgress?: (pct: number) => void,
  folder = "rcar/vehicles"
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const preset    = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

    const body = new FormData();
    body.append("file", file);
    body.append("upload_preset", preset);
    body.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve({ url: data.secure_url as string, publicId: data.public_id as string });
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new ImageUploadError((err as { error?: { message?: string } }).error?.message ?? "Falha no upload."));
        } catch {
          reject(new ImageUploadError(`Falha no upload (status ${xhr.status}).`));
        }
      }
    };

    xhr.onerror  = () => reject(new ImageUploadError("Erro de rede."));
    xhr.onabort  = () => reject(new ImageUploadError("Upload cancelado."));
    xhr.send(body);
  });
}
