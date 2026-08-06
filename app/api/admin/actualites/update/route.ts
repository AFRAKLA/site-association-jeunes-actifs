import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const CATEGORIES = [
  "environnement",
  "culture",
  "solidarite",
  "formation",
  "vie-associative",
];

export async function PATCH(request: Request) {
  try {
    const { password, id, titre, categorie, extrait, contenu, statut } =
      await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

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

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("actualites")
      .update({ titre, categorie, extrait, contenu: contenu || "", statut })
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
