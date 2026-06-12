import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: Request) {
  try {
    const { password, id, statut_adhesion } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    if (!id || !statut_adhesion) {
      return NextResponse.json(
        { error: "id et statut_adhesion sont requis." },
        { status: 400 }
      );
    }

    if (!["en_attente", "acceptee", "refusee", "info_demandee"].includes(statut_adhesion)) {
      return NextResponse.json(
        { error: "Statut invalide. Valeurs possibles : en_attente, acceptee, refusee, info_demandee." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("demandes_adhesion")
      .update({ statut_adhesion })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour adhésion :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
