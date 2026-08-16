export type SupportedLocale = "fr" | "en" | "ar";

/**
 * Résolveur UNIQUE du fallback FR pour le contenu dynamique Supabase.
 * Toute page publique doit passer par cette fonction plutôt que de
 * réimplémenter la logique — c'est le point central demandé pour ne jamais
 * dupliquer la règle de repli dans chaque page.
 *
 * Règle : FR = valeur canonique (colonne existante, jamais renommée).
 * EN/AR = colonne `${champ}_en` / `${champ}_ar`, utilisée seulement si
 * non vide ; sinon repli silencieux sur la valeur française.
 */
// `row: object` (pas `Record<string, unknown>`) délibérément : TypeScript
// exige qu'une `interface` nommée déclare une signature d'index explicite
// pour être assignable à `Record<string, unknown>`, ce qu'aucune des
// interfaces Actualite/Evenement/Photo n'a — les forcer à en ajouter une
// juste pour cet appel serait un couplage artificiel. `object` accepte
// structurellement n'importe quelle interface ; le cast se fait ensuite, en
// interne, une seule fois.
export function localizeField(
  row: object,
  field: string,
  locale: SupportedLocale
): string {
  const r = row as Record<string, unknown>;
  const fr = (r[field] as string | null | undefined) ?? "";
  if (locale === "fr") return fr;

  const localized = r[`${field}_${locale}`] as string | null | undefined;
  return typeof localized === "string" && localized.trim() !== "" ? localized : fr;
}
