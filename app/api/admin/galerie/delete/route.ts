import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: Request) {
  try {
    const { password, id } = await request.json();

    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: "id est requis." }, { status: 400 });
    }

    const admin = getSupabaseAdmin();

    // Récupérer la photo pour obtenir le storage_path
    const { data: photo, error: fetchError } = await admin
      .from("galerie")
      .select("storage_path")
      .eq("id", id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: "Photo introuvable." },
        { status: 404 }
      );
    }

    // Supprimer le fichier du Storage
    await admin.storage.from("galerie").remove([photo.storage_path]);

    // Supprimer la ligne en base
    const { error: deleteError } = await admin
      .from("galerie")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erreur suppression galerie :", deleteError.message);
      return NextResponse.json(
        { error: "Erreur lors de la suppression." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
