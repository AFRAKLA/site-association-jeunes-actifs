import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const CATEGORIES = [
  "Événement étudiant",
  "Environnement",
  "Culture",
  "Formation",
  "Solidarité",
];

export async function PATCH(request: Request) {
  try {
    const { password, titre, date_evenement, lieu, categorie, description, a_venir, statut } =
      await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    if (!titre || !date_evenement || !lieu || !categorie || !description || !statut) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
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
      .from("evenements")
      .insert([{
        titre,
        date_evenement,
        lieu,
        categorie,
        description,
        a_venir: !!a_venir,
        statut,
      }])
      .select()
      .single();

    if (error) {
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
