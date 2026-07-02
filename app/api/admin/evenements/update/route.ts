import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  validateImageFile,
  uploadImage,
  deleteStorageFile,
  deleteStorageFiles,
} from "@/lib/storage-upload";

const BUCKET = "evenements";

const CATEGORIES = [
  "Événement étudiant",
  "Environnement",
  "Culture",
  "Formation",
  "Solidarité",
];

function generateBaseSlug(titre: string): string {
  return titre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function PATCH(request: Request) {
  try {
    const formData = await request.formData();

    const password = formData.get("password") as string;
    const id = formData.get("id") as string;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { error: "L'identifiant de l'événement est requis." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Fetch current event for rollback/cleanup references
    const { data: current, error: fetchError } = await admin
      .from("evenements")
      .select("image_storage_path, photos_supplementaires, photos_storage_paths")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json(
        { error: "Événement introuvable." },
        { status: 404 }
      );
    }

    // --- Text fields ---
    const updates: Record<string, unknown> = {};

    const titre = (formData.get("titre") as string)?.trim();
    if (titre) updates.titre = titre;

    const categorie = formData.get("categorie") as string;
    if (categorie) {
      if (!CATEGORIES.includes(categorie)) {
        return NextResponse.json(
          { error: "Catégorie invalide." },
          { status: 400 }
        );
      }
      updates.categorie = categorie;
    }

    const description = (formData.get("description") as string)?.trim();
    if (description) updates.description = description;

    const dc = (formData.get("description_complete") as string)?.trim();
    if (formData.has("description_complete"))
      updates.description_complete = dc || null;

    const dd = formData.get("date_debut") as string;
    if (formData.has("date_debut")) updates.date_debut = dd || null;

    const heure = formData.get("heure") as string;
    if (formData.has("heure")) updates.heure = heure || null;

    const lieu = (formData.get("lieu") as string)?.trim();
    if (formData.has("lieu")) updates.lieu = lieu || null;

    const statut = formData.get("statut") as string;
    if (statut) {
      if (!["brouillon", "publie"].includes(statut)) {
        return NextResponse.json(
          { error: "Statut invalide." },
          { status: 400 }
        );
      }
      updates.statut = statut;
    }

    const videoUrl = (formData.get("video_url") as string)?.trim();
    if (formData.has("video_url")) updates.video_url = videoUrl || null;

    // --- Slug regeneration ---
    if (formData.get("regenerate_slug") === "true" && titre) {
      const baseSlug = generateBaseSlug(titre);
      let slug = baseSlug;
      let suffix = 2;
      while (true) {
        const { data: existing } = await admin
          .from("evenements")
          .select("id")
          .eq("slug", slug)
          .neq("id", id)
          .maybeSingle();
        if (!existing) break;
        slug = `${baseSlug}-${suffix++}`;
      }
      updates.slug = slug;
    }

    // --- Main image ---
    const newImageFile = formData.get("image") as File | null;
    const removeImage = formData.get("remove_image") === "true";
    const newlyUploadedPaths: string[] = [];
    let oldImagePathToDelete: string | null = null;

    if (newImageFile && newImageFile.size > 0) {
      const err = validateImageFile(newImageFile);
      if (err) return NextResponse.json({ error: err }, { status: 400 });

      try {
        const result = await uploadImage(
          admin,
          BUCKET,
          `${id}/principale`,
          newImageFile
        );
        newlyUploadedPaths.push(result.storagePath);
        updates.image_url = result.url;
        updates.image_storage_path = result.storagePath;
        // Will delete old after DB success
        if (current.image_storage_path)
          oldImagePathToDelete = current.image_storage_path;
      } catch (e) {
        return NextResponse.json(
          {
            error: `Erreur envoi image : ${(e as Error).message}`,
          },
          { status: 500 }
        );
      }
    } else if (removeImage) {
      updates.image_url = null;
      updates.image_storage_path = null;
      if (current.image_storage_path)
        oldImagePathToDelete = current.image_storage_path;
    }

    // --- Supplementary photos ---
    const removePhotoUrlsRaw = formData.get("remove_photo_urls") as string | null;
    const removePhotoUrls: string[] = removePhotoUrlsRaw
      ? JSON.parse(removePhotoUrlsRaw)
      : [];

    const newPhotoFiles: File[] = [];
    let j = 0;
    while (formData.has(`photo_${j}`)) {
      const f = formData.get(`photo_${j}`) as File;
      if (f && f.size > 0) newPhotoFiles.push(f);
      j++;
    }

    // Validate new photo files before uploading
    for (const f of newPhotoFiles) {
      const err = validateImageFile(f);
      if (err) {
        await deleteStorageFiles(admin, BUCKET, newlyUploadedPaths);
        return NextResponse.json({ error: err }, { status: 400 });
      }
    }

    const existingUrls: string[] = current.photos_supplementaires ?? [];
    const existingPaths: string[] = current.photos_storage_paths ?? [];

    // Build remaining arrays (exclude removed)
    const remainingUrls: string[] = [];
    const remainingPaths: string[] = [];
    const storagePathsToDeleteAfter: string[] = [];

    for (let k = 0; k < existingUrls.length; k++) {
      if (removePhotoUrls.includes(existingUrls[k])) {
        if (existingPaths[k]) storagePathsToDeleteAfter.push(existingPaths[k]);
      } else {
        remainingUrls.push(existingUrls[k]);
        remainingPaths.push(existingPaths[k] ?? "");
      }
    }

    // Upload new photos
    const addedUrls: string[] = [];
    const addedPaths: string[] = [];

    for (const f of newPhotoFiles) {
      try {
        const result = await uploadImage(admin, BUCKET, `${id}/galerie`, f);
        addedUrls.push(result.url);
        addedPaths.push(result.storagePath);
        newlyUploadedPaths.push(result.storagePath);
      } catch (e) {
        await deleteStorageFiles(admin, BUCKET, newlyUploadedPaths);
        return NextResponse.json(
          {
            error: `Erreur envoi photo : ${(e as Error).message}`,
          },
          { status: 500 }
        );
      }
    }

    if (removePhotoUrls.length > 0 || newPhotoFiles.length > 0) {
      updates.photos_supplementaires = [...remainingUrls, ...addedUrls];
      updates.photos_storage_paths = [...remainingPaths, ...addedPaths];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour." },
        { status: 400 }
      );
    }

    // Update DB
    const { data, error } = await admin
      .from("evenements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // DB failed — rollback newly uploaded files, keep old ones
      await deleteStorageFiles(admin, BUCKET, newlyUploadedPaths);
      console.error("Erreur mise à jour événement :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour." },
        { status: 500 }
      );
    }

    // DB succeeded — now safely delete old/removed Storage files
    if (oldImagePathToDelete) {
      await deleteStorageFile(admin, BUCKET, oldImagePathToDelete).catch((e) =>
        console.warn("Nettoyage Storage image principale :", e.message)
      );
    }

    if (storagePathsToDeleteAfter.length > 0) {
      await deleteStorageFiles(admin, BUCKET, storagePathsToDeleteAfter).catch(
        (e) => console.warn("Nettoyage Storage photos :", e.message)
      );
    }

    return NextResponse.json({ success: true, evenement: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
