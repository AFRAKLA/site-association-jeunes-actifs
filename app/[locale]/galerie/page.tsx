import { getTranslations, setRequestLocale } from "next-intl/server";
import GalerieContent from "./GalerieContent";
import { supabase } from "@/lib/supabase";

type Categorie = "environnement" | "culture" | "solidarite" | "formations";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "galeriePage.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function GaleriePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  interface PhotoRow {
    id: string;
    titre: string;
    categorie: string;
    description: string;
    image_url: string;
    created_at: string;
    titre_en?: string | null;
    titre_ar?: string | null;
    description_en?: string | null;
    description_ar?: string | null;
  }

  let photos: (Omit<PhotoRow, "categorie"> & { categorie: Categorie })[] = [];

  try {
    // select("*") : voir le commentaire équivalent dans actualites/page.tsx.
    const { data } = await supabase
      .from("galerie")
      .select("*")
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

  return <GalerieContent photos={photos} locale={locale} />;
}
