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

    const { titre, categorie, extrait, contenu, statut } = await request.json();

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

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("actualites")
      .insert([{ titre, categorie, extrait, contenu: contenu || "", statut }])
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
