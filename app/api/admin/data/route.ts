import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    // Vérification du mot de passe admin
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Mot de passe incorrect." },
        { status: 401 }
      );
    }

    // Lecture des deux tables en parallèle
    const admin = getSupabaseAdmin();
    const [messagesResult, adhesionsResult] = await Promise.all([
      admin
        .from("messages_contact")
        .select("*")
        .order("created_at", { ascending: false }),
      admin
        .from("demandes_adhesion")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);

    if (messagesResult.error) {
      console.error("Erreur lecture messages :", messagesResult.error.message);
      return NextResponse.json(
        { error: "Erreur lors de la lecture des messages." },
        { status: 500 }
      );
    }

    if (adhesionsResult.error) {
      console.error("Erreur lecture adhésions :", adhesionsResult.error.message);
      return NextResponse.json(
        { error: "Erreur lors de la lecture des demandes." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: messagesResult.data,
      adhesions: adhesionsResult.data,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
