import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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
    const {
      password,
      titre,
      categorie,
      description,
      description_complete,
      date_debut,
      heure,
      lieu,
      statut,
      image_url,
      video_url,
      photos_supplementaires,
    } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    if (!titre || !categorie || !description || !statut) {
      return NextResponse.json(
        { error: "Les champs titre, catégorie, description et statut sont obligatoires." },
        { status: 400 }
      );
    }

    if (!CATEGORIES.includes(categorie)) {
      return NextResponse.json({ error: "Catégorie invalide." }, { status: 400 });
    }

    if (!["brouillon", "publie"].includes(statut)) {
      return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
    }

    const cleanImageUrl = image_url ? String(image_url).trim() : "";
    if (cleanImageUrl && !cleanImageUrl.startsWith("/images/")) {
      return NextResponse.json(
        { error: "Pour le moment, utilisez un chemin local commençant par /images/." },
        { status: 400 }
      );
    }

    const photos: string[] = Array.isArray(photos_supplementaires)
      ? photos_supplementaires
      : [];
    const invalidPhoto = photos.find((p: string) => p && !p.startsWith("/images/"));
    if (invalidPhoto) {
      return NextResponse.json(
        { error: "Pour le moment, utilisez un chemin local commençant par /images/." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Generate unique slug from titre
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

    const { data, error } = await admin
      .from("evenements")
      .insert([
        {
          titre,
          slug,
          categorie,
          description,
          description_complete: description_complete || null,
          date_debut: date_debut || null,
          heure: heure || null,
          lieu: lieu || null,
          statut,
          image_url: cleanImageUrl || null,
          video_url: video_url || null,
          photos_supplementaires: photos,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erreur création événement :", error.message);
      return NextResponse.json({ error: "Erreur lors de la création." }, { status: 500 });
    }

    return NextResponse.json({ success: true, evenement: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
