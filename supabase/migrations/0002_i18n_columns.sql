-- I18N Phase 2 — Colonnes de traduction EN/AR pour le contenu Supabase
-- dynamique (actualités, événements, galerie). Le français reste la colonne
-- canonique existante (ex. `titre`), inchangée ; EN/AR sont des colonnes
-- additionnelles `_en`/`_ar`, optionnelles, lues avec repli silencieux vers
-- le français quand elles sont vides (voir lib/i18n-content.ts).
--
-- Aucune colonne existante n'est renommée, supprimée ou modifiée. Aucune
-- donnée n'est touchée. Slug, dates, statut, image_url, etc. restent
-- uniques et non dupliqués par langue.
--
-- À EXÉCUTER MANUELLEMENT dans Supabase (SQL Editor du dashboard), une seule
-- fois. Ce fichier n'est PAS exécuté automatiquement par l'application.
--
-- État au moment de l'écriture de ce fichier : ce schéma a déjà été appliqué
-- manuellement en production. Ce fichier versionne cet état pour le rendre
-- reproductible ; il n'a pas besoin d'être réexécuté sur la base actuelle
-- (ADD COLUMN IF NOT EXISTS le rend de toute façon idempotent si réexécuté).

alter table actualites
  add column if not exists titre_en text,
  add column if not exists titre_ar text,
  add column if not exists extrait_en text,
  add column if not exists extrait_ar text,
  add column if not exists contenu_en text,
  add column if not exists contenu_ar text;

alter table evenements
  add column if not exists titre_en text,
  add column if not exists titre_ar text,
  add column if not exists lieu_en text,
  add column if not exists lieu_ar text,
  add column if not exists description_en text,
  add column if not exists description_ar text,
  add column if not exists description_complete_en text,
  add column if not exists description_complete_ar text;

alter table galerie
  add column if not exists titre_en text,
  add column if not exists titre_ar text,
  add column if not exists description_en text,
  add column if not exists description_ar text;
