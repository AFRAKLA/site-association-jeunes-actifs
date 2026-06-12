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
      .from("evenements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erreur lecture événements :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de la lecture des événements." },
        { status: 500 }
      );
    }

    return NextResponse.json({ evenements: data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
