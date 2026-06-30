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
      id,
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
      regenerate_slug,
    } = await request.json();

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
    const updates: Record<string, unknown> = {};

    if (titre !== undefined) updates.titre = titre;
    if (categorie !== undefined) {
      if (!CATEGORIES.includes(categorie)) {
        return NextResponse.json({ error: "Catégorie invalide." }, { status: 400 });
      }
      updates.categorie = categorie;
    }
    if (description !== undefined) updates.description = description;
    if (description_complete !== undefined)
      updates.description_complete = description_complete || null;
    if (date_debut !== undefined) updates.date_debut = date_debut || null;
    if (heure !== undefined) updates.heure = heure || null;
    if (lieu !== undefined) updates.lieu = lieu || null;
    if (statut !== undefined) {
      if (!["brouillon", "publie"].includes(statut)) {
        return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
      }
      updates.statut = statut;
    }
    if (image_url !== undefined) {
      const cleanImageUrl = image_url ? String(image_url).trim() : "";
      if (cleanImageUrl && !cleanImageUrl.startsWith("/images/")) {
        return NextResponse.json(
          { error: "Pour le moment, utilisez un chemin local commençant par /images/." },
          { status: 400 }
        );
      }
      updates.image_url = cleanImageUrl || null;
    }
    if (video_url !== undefined) updates.video_url = video_url || null;
    if (photos_supplementaires !== undefined) {
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
      updates.photos_supplementaires = photos;
    }

    // Regenerate slug only if explicitly requested and titre is provided
    if (regenerate_slug && titre) {
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

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Aucun champ à mettre à jour." },
        { status: 400 }
      );
    }

    const { data, error } = await admin
      .from("evenements")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erreur mise à jour événement :", error.message);
      return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
    }

    return NextResponse.json({ success: true, evenement: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
