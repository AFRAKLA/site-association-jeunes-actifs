import { getTranslations, setRequestLocale } from "next-intl/server";
import ActualitesContent from "./ActualitesContent";
import { supabase } from "@/lib/supabase";

type Categorie =
  | "environnement"
  | "culture"
  | "solidarite"
  | "formation"
  | "vie-associative";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "actualitesPage.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function ActualitesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  let actualites: {
    id: string;
    titre: string;
    categorie: Categorie;
    extrait: string;
    created_at: string;
    titre_en?: string | null;
    titre_ar?: string | null;
    extrait_en?: string | null;
    extrait_ar?: string | null;
  }[] = [];

  try {
    // select("*") plutôt qu'une liste explicite : reste valide que les
    // colonnes _en/_ar existent déjà ou non (aucune erreur PostgREST tant
    // que la migration n'est pas appliquée), et récupère automatiquement
    // les traductions dès qu'elles existent, sans nouveau déploiement.
    const { data } = await supabase
      .from("actualites")
      .select("*")
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

  return <ActualitesContent actualites={actualites} locale={locale} />;
}
