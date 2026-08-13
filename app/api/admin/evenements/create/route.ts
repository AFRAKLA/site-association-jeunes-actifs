import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/require-admin";
import {
  validateImageFile,
  uploadImage,
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

export async function POST(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const formData = await request.formData();

    const titre = (formData.get("titre") as string)?.trim();
    const categorie = formData.get("categorie") as string;
    const description = (formData.get("description") as string)?.trim();
    const description_complete =
      (formData.get("description_complete") as string)?.trim() || null;
    const date_debut = (formData.get("date_debut") as string) || null;
    const heure = (formData.get("heure") as string) || null;
    const lieu = (formData.get("lieu") as string)?.trim() || null;
    const statut = formData.get("statut") as string;
    const video_url = (formData.get("video_url") as string)?.trim() || null;
    const imageFile = formData.get("image") as File | null;

    // Collect supplementary photo files
    const photoFiles: File[] = [];
    let i = 0;
    while (formData.has(`photo_${i}`)) {
      const f = formData.get(`photo_${i}`) as File;
      if (f && f.size > 0) photoFiles.push(f);
      i++;
    }

    if (!titre || !categorie || !description || !statut) {
      return NextResponse.json(
        {
          error:
            "Les champs titre, catégorie, description et statut sont obligatoires.",
        },
        { status: 400 }
      );
    }

    if (!CATEGORIES.includes(categorie)) {
      return NextResponse.json(
        { error: "Catégorie invalide." },
        { status: 400 }
      );
    }

    if (!["brouillon", "publie"].includes(statut)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    // Validate image files before any upload
    if (imageFile && imageFile.size > 0) {
      const err = validateImageFile(imageFile);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }
    for (const f of photoFiles) {
      const err = validateImageFile(f);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Generate unique slug
    const baseSlug = generateBaseSlug(titre);
    let slug = baseSlug;
    let suffix = 2;
    while (true) {
      const { data: existing } = await admin
        .from("evenements")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${suffix++}`;
    }

    // Generate event ID first — used to organise Storage paths
    const eventId = randomUUID();
    const uploadedPaths: string[] = [];

    // Upload main image
    let imageUrl: string | null = null;
    let imageStoragePath: string | null = null;

    if (imageFile && imageFile.size > 0) {
      try {
        const result = await uploadImage(
          admin,
          BUCKET,
          `${eventId}/principale`,
          imageFile
        );
        imageUrl = result.url;
        imageStoragePath = result.storagePath;
        uploadedPaths.push(result.storagePath);
      } catch (e) {
        return NextResponse.json(
          {
            error: `Erreur lors de l'envoi de l'image principale : ${(e as Error).message}`,
          },
          { status: 500 }
        );
      }
    }

    // Upload supplementary photos
    const photoUrls: string[] = [];
    const photoStoragePaths: string[] = [];

    for (const f of photoFiles) {
      try {
        const result = await uploadImage(
          admin,
          BUCKET,
          `${eventId}/galerie`,
          f
        );
        photoUrls.push(result.url);
        photoStoragePaths.push(result.storagePath);
        uploadedPaths.push(result.storagePath);
      } catch (e) {
        await deleteStorageFiles(admin, BUCKET, uploadedPaths);
        return NextResponse.json(
          {
            error: `Erreur lors de l'envoi d'une photo : ${(e as Error).message}`,
          },
          { status: 500 }
        );
      }
    }

    // Insert row with explicit id
    const { data, error } = await admin
      .from("evenements")
      .insert([
        {
          id: eventId,
          titre,
          slug,
          categorie,
          description,
          description_complete,
          date_debut,
          heure,
          lieu,
          statut,
          video_url,
          image_url: imageUrl,
          image_storage_path: imageStoragePath,
          photos_supplementaires: photoUrls,
          photos_storage_paths: photoStoragePaths,
        },
      ])
      .select()
      .single();

    if (error) {
      // Rollback all uploaded files
      await deleteStorageFiles(admin, BUCKET, uploadedPaths);
      console.error("Erreur création événement :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la création." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, evenement: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
