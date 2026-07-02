import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 Mo

const SAFE_EXTS: Record<string, string> = {
  jpg: "jpg",
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Fichier trop volumineux. Taille maximale : 5 Mo.";
  }
  return null;
}

function safeExt(file: File): string {
  const raw = file.name.split(".").pop()?.toLowerCase() ?? "";
  return SAFE_EXTS[raw] ?? "jpg";
}

export async function uploadImage(
  admin: SupabaseClient,
  bucket: string,
  folder: string,
  file: File
): Promise<{ url: string; storagePath: string }> {
  const ext = safeExt(file);
  const storagePath = `${folder}/${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(bucket)
    .upload(storagePath, buffer, { contentType: file.type, upsert: false });

  if (error) throw new Error(error.message);

  const {
    data: { publicUrl },
  } = admin.storage.from(bucket).getPublicUrl(storagePath);

  return { url: publicUrl, storagePath };
}

export async function deleteStorageFile(
  admin: SupabaseClient,
  bucket: string,
  storagePath: string
): Promise<void> {
  await admin.storage.from(bucket).remove([storagePath]);
}

export async function deleteStorageFiles(
  admin: SupabaseClient,
  bucket: string,
  storagePaths: string[]
): Promise<void> {
  // Skip local paths and empty strings
  const valid = storagePaths.filter((p) => p && !p.startsWith("/images/"));
  if (valid.length === 0) return;
  await admin.storage.from(bucket).remove(valid);
}
