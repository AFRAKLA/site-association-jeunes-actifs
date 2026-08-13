import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: Request) {
  try {
    const auth = requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("galerie")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lecture galerie :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la lecture de la galerie." },
        { status: 500 }
      );
    }

    return NextResponse.json({ photos: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
