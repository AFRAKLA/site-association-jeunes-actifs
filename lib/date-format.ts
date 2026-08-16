const INTL_LOCALE: Record<string, string> = { fr: "fr-FR", en: "en-US", ar: "ar-MA" };

// Formatage de date sensible à la langue active — remplace les anciens
// formatDateFr() figés en français partout sur le site public. La VALEUR
// métier de la date (ISO stockée en base) n'est jamais modifiée, seule sa
// représentation textuelle change selon la locale.
export function formatLocalizedDate(dateStr: string, locale: string): string {
  return new Date(dateStr).toLocaleDateString(INTL_LOCALE[locale] ?? "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
