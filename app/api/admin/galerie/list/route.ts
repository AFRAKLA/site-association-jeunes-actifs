import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

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
