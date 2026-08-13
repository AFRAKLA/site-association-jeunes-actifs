import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/require-admin";
import { validateImageFile, safeExt } from "@/lib/storage-upload";

const BUCKET = "galerie";

export async function POST(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const formData = await request.formData();
    const titre = formData.get("titre") as string;
    const categorie = formData.get("categorie") as string;
    const description = formData.get("description") as string;
    const statut = formData.get("statut") as string;
    const file = formData.get("file") as File | null;

    if (!titre || !categorie || !description || !statut || !file) {
      return NextResponse.json(
        { error: "Tous les champs sont requis, y compris l'image." },
        { status: 400 }
      );
    }

    const fileError = validateImageFile(file);
    if (fileError) {
      return NextResponse.json({ error: fileError }, { status: 400 });
    }

    if (!["brouillon", "publie"].includes(statut)) {
      return NextResponse.json(
        { error: "Statut invalide." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Chemin plat (pas de sous-dossier par élément), comme avant la migration —
    // seule la validation (MIME/taille via validateImageFile, extension via
    // safeExt) est désormais partagée avec lib/storage-upload.ts.
    const storagePath = `${randomUUID()}.${safeExt(file)}`;
    let imageUrl: string;
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await admin.storage
        .from(BUCKET)
        .upload(storagePath, buffer, { contentType: file.type, upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: urlData } = admin.storage.from(BUCKET).getPublicUrl(storagePath);
      imageUrl = urlData.publicUrl;
    } catch (e) {
      // Détail technique uniquement dans les logs serveur — jamais renvoyé au client.
      console.error("Erreur upload Storage galerie :", (e as Error).message);
      return NextResponse.json(
        { error: "Erreur lors de l'upload de l'image." },
        { status: 500 }
      );
    }

    // Insérer en base
    const { data, error: insertError } = await admin
      .from("galerie")
      .insert([{ titre, categorie, description, image_url: imageUrl, storage_path: storagePath, statut }])
      .select()
      .single();

    if (insertError) {
      // Rollback : supprimer le fichier uploadé
      await admin.storage.from(BUCKET).remove([storagePath]);
      console.error("Erreur insertion galerie :", insertError.message);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement en base." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, photo: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
