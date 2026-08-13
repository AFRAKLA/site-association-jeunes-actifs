import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/require-admin";
import { validateImageFile, uploadImage, deleteStorageFile } from "@/lib/storage-upload";

const BUCKET = "galerie";

const CATEGORIES = ["environnement", "culture", "solidarite", "formations"];

export async function PATCH(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const formData = await request.formData();

    const id = formData.get("id") as string;
    const titre = (formData.get("titre") as string)?.trim();
    const categorie = formData.get("categorie") as string;
    const description = (formData.get("description") as string)?.trim();
    const statut = formData.get("statut") as string;
    const file = formData.get("file") as File | null;

    if (!id) {
      return NextResponse.json({ error: "id est requis." }, { status: 400 });
    }

    if (!titre || !categorie || !description || !statut) {
      return NextResponse.json(
        { error: "Tous les champs sont requis." },
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
      return NextResponse.json(
        { error: "Statut invalide." },
        { status: 400 }
      );
    }

    if (file && file.size > 0) {
      const err = validateImageFile(file);
      if (err) return NextResponse.json({ error: err }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Récupérer la photo actuelle (pour le nettoyage Storage après coup)
    const { data: current, error: fetchError } = await admin
      .from("galerie")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !current) {
      return NextResponse.json({ error: "Photo introuvable." }, { status: 404 });
    }

    const updates: Record<string, unknown> = { titre, categorie, description, statut };

    let newStoragePath: string | null = null;

    if (file && file.size > 0) {
      try {
        const result = await uploadImage(admin, BUCKET, id, file);
        updates.image_url = result.url;
        updates.storage_path = result.storagePath;
        newStoragePath = result.storagePath;
      } catch (e) {
        return NextResponse.json(
          { error: `Erreur lors de l'envoi de la nouvelle image : ${(e as Error).message}` },
          { status: 500 }
        );
      }
    }

    const { data, error } = await admin
      .from("galerie")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      // La mise à jour en base a échoué : on retire uniquement le fichier
      // qu'on vient d'uploader, l'ancienne image reste intacte et cohérente.
      if (newStoragePath) {
        await deleteStorageFile(admin, BUCKET, newStoragePath).catch(() => {});
      }
      console.error("Erreur mise à jour galerie :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour." },
        { status: 500 }
      );
    }

    // La mise à jour a réussi : on peut maintenant supprimer l'ancien
    // fichier Storage en toute sécurité, uniquement si l'image a changé.
    if (newStoragePath && current.storage_path) {
      await deleteStorageFile(admin, BUCKET, current.storage_path).catch((e) =>
        console.warn("Nettoyage Storage ancienne image :", e.message)
      );
    }

    return NextResponse.json({ success: true, photo: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
