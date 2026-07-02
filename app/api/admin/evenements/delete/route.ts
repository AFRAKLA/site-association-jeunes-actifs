import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { deleteStorageFiles } from "@/lib/storage-upload";

const BUCKET = "evenements";

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

    // Fetch storage paths before deletion
    const { data: current } = await admin
      .from("evenements")
      .select("image_storage_path, photos_storage_paths")
      .eq("id", id)
      .maybeSingle();

    // Delete the database row first
    const { error: deleteError } = await admin
      .from("evenements")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Erreur suppression événement :", deleteError.message);
      return NextResponse.json(
        { error: "Erreur lors de la suppression." },
        { status: 500 }
      );
    }

    // After successful DB deletion, clean up Storage (best effort)
    const pathsToDelete = [
      ...(current?.image_storage_path ? [current.image_storage_path] : []),
      ...(current?.photos_storage_paths ?? []),
    ];

    if (pathsToDelete.length > 0) {
      try {
        await deleteStorageFiles(admin, BUCKET, pathsToDelete);
      } catch (e) {
        // Log but do not fail — event is already deleted
        console.warn(
          "Avertissement : nettoyage Storage partiel après suppression :",
          (e as Error).message
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
