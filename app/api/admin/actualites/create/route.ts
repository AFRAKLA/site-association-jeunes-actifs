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

    // Chaîne vide -> NULL : une traduction "vidée" par l'admin ne doit pas
    // rester une chaîne vide en base (le résolveur de fallback traite les
    // deux de la même façon, mais NULL est la représentation la plus propre
    // de "non traduit").
    const orNull = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v : null);

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("actualites")
      .insert([
        {
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
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Erreur création actualité :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la création." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, actualite: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
