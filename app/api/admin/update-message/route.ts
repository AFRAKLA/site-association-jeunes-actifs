import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: Request) {
  try {
    const { password, id, statut } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    if (!id || !statut) {
      return NextResponse.json(
        { error: "id et statut sont requis." },
        { status: 400 }
      );
    }

    if (!["non_traite", "traite", "repondu"].includes(statut)) {
      return NextResponse.json(
        { error: "Statut invalide. Valeurs possibles : non_traite, traite, repondu." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("messages_contact")
      .update({ statut })
      .eq("id", id);

    if (error) {
      console.error("Erreur mise à jour message :", error.message);
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
