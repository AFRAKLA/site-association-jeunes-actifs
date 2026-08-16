import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/require-admin";

const CATEGORIES = [
  "environnement",
  "culture",
  "solidarite",
  "formation",
  "vie-associative",
];

export async function PATCH(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const {
      id,
      titre,
      categorie,
      extrait,
      contenu,
      statut,
      titre_en,
      titre_ar,
      extrait_en,
      extrait_ar,
      contenu_en,
      contenu_ar,
    } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "id est requis." }, { status: 400 });
    }

    if (!titre || !categorie || !extrait || !statut) {
      return NextResponse.json(
        { error: "titre, categorie, extrait et statut sont requis." },
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
        { error: "Statut invalide. Valeurs possibles : brouillon, publie." },
        { status: 400 }
      );
    }

    // Chaîne vide -> NULL, cohérent avec la route de création (voir son
    // commentaire) — une traduction vidée par l'admin efface le champ
    // plutôt que de laisser une chaîne vide en base.
    const orNull = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("actualites")
      .update({
        titre,
        categorie,
        extrait,
        contenu: contenu || "",
        statut,
        titre_en: orNull(titre_en),
        titre_ar: orNull(titre_ar),
        extrait_en: orNull(extrait_en),
        extrait_ar: orNull(extrait_ar),
        contenu_en: orNull(contenu_en),
        contenu_ar: orNull(contenu_ar),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erreur mise à jour actualité :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, actualite: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
