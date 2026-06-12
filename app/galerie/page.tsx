import type { Metadata } from "next";
import GalerieContent from "./GalerieContent";
import { supabase } from "@/lib/supabase";

type Categorie = "environnement" | "culture" | "solidarite" | "formations";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galerie | Association Jeunes Actifs",
  description:
    "Découvrez en images les actions et événements de l'Association Jeunes Actifs dans la région de l'Oriental au Maroc.",
};

export default async function GaleriePage() {
  interface PhotoRow {
    id: string;
    titre: string;
    categorie: string;
    description: string;
    image_url: string;
    created_at: string;
  }

  let photos: {
    id: string;
    titre: string;
    categorie: Categorie;
    description: string;
    image_url: string;
    created_at: string;
  }[] = [];

  try {
    const { data } = await supabase
      .from("galerie")
      .select("id, titre, categorie, description, image_url, created_at")
      .eq("statut", "publie")
      .order("created_at", { ascending: false });
    if (data) {
      photos = (data as PhotoRow[]).map((p) => ({
        ...p,
        categorie: p.categorie as Categorie,
      }));
    }
  } catch {
    /* fallback : tableau vide */
  }

  return <GalerieContent photos={photos} />;
}
