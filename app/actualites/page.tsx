import type { Metadata } from "next";
import ActualitesContent from "./ActualitesContent";
import { supabase } from "@/lib/supabase";

type Categorie =
  | "environnement"
  | "culture"
  | "solidarite"
  | "formation"
  | "vie-associative";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Actualités | Association Jeunes Actifs",
  description:
    "Suivez les dernières nouvelles de l'Association Jeunes Actifs : projets réalisés, partenariats et actions en cours dans la région de l'Oriental.",
};

export default async function ActualitesPage() {
  let actualites: {
    id: string;
    titre: string;
    categorie: Categorie;
    extrait: string;
    created_at: string;
  }[] = [];

  try {
    const { data } = await supabase
      .from("actualites")
      .select("id, titre, categorie, extrait, created_at")
      .eq("statut", "publie")
      .order("created_at", { ascending: false });
    if (data) {
      actualites = data.map((a) => ({
        ...a,
        categorie: a.categorie as Categorie,
      }));
    }
  } catch {
    /* fallback : tableau vide */
  }

  return <ActualitesContent actualites={actualites} />;
}
