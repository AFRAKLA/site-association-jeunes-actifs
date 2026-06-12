import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { randomUUID } from "crypto";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const password = formData.get("password") as string;
    const titre = formData.get("titre") as string;
    const categorie = formData.get("categorie") as string;
    const description = formData.get("description") as string;
    const statut = formData.get("statut") as string;
    const file = formData.get("file") as File | null;

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    if (!titre || !categorie || !description || !statut || !file) {
      return NextResponse.json(
        { error: "Tous les champs sont requis, y compris l'image." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier non autorisé. Formats acceptés : JPG, PNG, WebP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Taille maximale : 5 Mo." },
        { status: 400 }
      );
    }

    if (!["brouillon", "publie"].includes(statut)) {
      return NextResponse.json(
        { error: "Statut invalide." },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const storagePath = `${randomUUID()}.${ext}`;

    // Vérifier que le bucket existe
    const admin = getSupabaseAdmin();
    const { data: buckets, error: bucketListError } = await admin.storage.listBuckets();
    if (bucketListError) {
      console.error("Erreur listBuckets :", bucketListError.message);
      return NextResponse.json(
        { error: `Impossible de vérifier les buckets Storage : ${bucketListError.message}` },
        { status: 500 }
      );
    }
    const bucketExists = buckets?.some((b) => b.name === "galerie");
    if (!bucketExists) {
      const names = buckets?.map((b) => b.name).join(", ") ?? "aucun";
      console.error("Bucket 'galerie' introuvable. Buckets présents :", names);
      return NextResponse.json(
        { error: `Le bucket 'galerie' n'existe pas. Buckets trouvés : ${names}` },
        { status: 500 }
      );
    }

    // Upload dans Supabase Storage
    const buffer = Buffer.from(await file.arrayBuffer());
    const { error: uploadError } = await admin.storage
      .from("galerie")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Erreur upload Storage :", uploadError.message);
      return NextResponse.json(
        { error: `Erreur lors de l'upload de l'image : ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Récupérer l'URL publique
    const { data: urlData } = admin.storage
      .from("galerie")
      .getPublicUrl(storagePath);
    const imageUrl = urlData.publicUrl;

    // Insérer en base
    const { data, error: insertError } = await admin
      .from("galerie")
      .insert([{ titre, categorie, description, image_url: imageUrl, storage_path: storagePath, statut }])
      .select()
      .single();

    if (insertError) {
      // Rollback : supprimer le fichier uploadé
      await admin.storage.from("galerie").remove([storagePath]);
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
