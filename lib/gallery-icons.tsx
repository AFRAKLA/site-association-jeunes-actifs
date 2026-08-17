import GrowthMark from "@/components/GrowthMark";

/**
 * Icônes de catégorie pour les légendes de la galerie (page complète et
 * "Nos derniers moments") — mêmes tracés que la section "Nos actions" de
 * l'accueil, réutilisés pour la cohérence visuelle plutôt que d'introduire
 * un nouveau jeu d'icônes. "environnement" (et toute catégorie inconnue)
 * retombe sur GrowthMark, déjà la signature "croissance/nature" du site.
 */
const CATEGORY_ICON_PATHS: Record<string, string> = {
  culture:
    "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z",
  solidarite:
    "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
  formations:
    "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
};

export function CategoryIcon({ categorie, className }: { categorie: string; className?: string }) {
  const d = CATEGORY_ICON_PATHS[categorie];
  if (!d) {
    return <GrowthMark className={className} />;
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}
