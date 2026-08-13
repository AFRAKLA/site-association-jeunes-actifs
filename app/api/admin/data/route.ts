import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

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
