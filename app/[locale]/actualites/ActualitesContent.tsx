"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrowthMark from "@/components/GrowthMark";
import ScrollReveal from "@/components/ScrollReveal";
import { formatLocalizedDate } from "@/lib/date-format";
import { localizeField, type SupportedLocale } from "@/lib/i18n-content";

type Categorie =
  | "environnement"
  | "culture"
  | "solidarite"
  | "formation"
  | "vie-associative";

interface Actualite {
  id: string;
  titre: string;
  categorie: Categorie;
  extrait: string;
  created_at: string;
  titre_en?: string | null;
  titre_ar?: string | null;
  extrait_en?: string | null;
  extrait_ar?: string | null;
}

const CATEGORIE_KEYS: (Categorie | "tous")[] = ["tous", "environnement", "culture", "solidarite", "formation", "vie-associative"];

// Photos réelles du terrain — présentées comme respiration éditoriale de la
// page, pas attribuées à un article précis (le modèle de données des
// actualités ne contient pas d'image par article).
const photosTerrain = [
  { src: "/images/actualites/action-medicale.jpg", alt: "Action médicale menée par l'association auprès des familles de la région" },
  { src: "/images/actualites/consultation-medicale.jpg", alt: "Consultation médicale organisée par les membres de l'association" },
  { src: "/images/actualites/reussite-membre.jpg", alt: "Moment de réussite partagé par un membre de Jeunes Actifs" },
];

export default function ActualitesContent({
  actualites,
  locale,
}: {
  actualites: Actualite[];
  locale: string;
}) {
  const t = useTranslations("actualitesPage");
  const [filtre, setFiltre] = useState<Categorie | "tous">("tous");

  const actualitesFiltrees =
    filtre === "tous"
      ? actualites
      : actualites.filter(
          (a) =>
            a.categorie === filtre ||
            a.categorie.toLowerCase().replace(/[^a-z]/g, "") ===
              filtre.toLowerCase().replace(/[^a-z]/g, "")
        );

  const [articleVedette, ...autresArticles] = actualitesFiltrees;

  return (
    <>
      <Header />

      <main id="main-content">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-surface-muted px-6 py-16 md:py-20">
          <GrowthMark
            aria-hidden="true"
            className="pointer-events-none absolute -end-10 -top-10 h-40 w-40 text-champagne/[0.14]"
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">{t("hero.kicker")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink md:text-5xl">{t("hero.title")}</h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{t("hero.text")}</p>
          </div>
        </section>

        {/* ── Photos du terrain ── bande plein-bord volontairement frameless
            (voir PhotoFrame.tsx) : un liseré ring-inset très discret évite
            que ça lise comme un oubli, sans ajouter de coins arrondis qui
            la confondraient avec les cartes/vignettes du reste du système. */}
        <div className="border-y border-champagne-soft/60">
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {photosTerrain.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.src}
                src={p.src}
                alt={p.alt}
                className="aspect-[4/3] w-full object-cover ring-1 ring-inset ring-champagne-soft/25"
              />
            ))}
          </div>
        </div>

        {/* ── Filtres ── */}
        <section className="border-b border-champagne-soft/60 bg-background px-6 py-6">
          <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2">
            {CATEGORIE_KEYS.map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltre(cat)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  filtre === cat
                    ? "bg-forest text-ivory"
                    : "border border-champagne-soft text-muted-foreground hover:border-forest/30 hover:text-ink"
                }`}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </section>

        {/* ── Liste éditoriale ── */}
        <section className="px-6 py-14 md:py-16">
          <div className="mx-auto max-w-5xl">
            {actualitesFiltrees.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">
                {actualites.length === 0 ? t("emptyAll") : t("emptyCategorie")}
              </p>
            ) : (
              <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
                <article>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink">
                      <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
                      {t(`categories.${articleVedette.categorie}` as "categories.tous")}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatLocalizedDate(articleVedette.created_at, locale)}</span>
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold leading-snug tracking-tight text-ink md:text-3xl">
                    {localizeField(articleVedette, "titre", locale as SupportedLocale)}
                  </h2>
                  <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                    {localizeField(articleVedette, "extrait", locale as SupportedLocale)}
                  </p>
                </article>

                {autresArticles.length > 0 && (
                  <div className="divide-y divide-champagne-soft/60 border-t border-champagne-soft/60 lg:border-t-0 lg:border-s lg:ps-8">
                    {autresArticles.map((article) => (
                      <div key={article.id} className="py-5 first:pt-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-ink">
                            {t(`categories.${article.categorie}` as "categories.tous")}
                          </span>
                          <span className="text-xs text-muted-foreground">· {formatLocalizedDate(article.created_at, locale)}</span>
                        </div>
                        <h3 className="mt-1.5 text-base font-semibold leading-snug text-ink">
                          {localizeField(article, "titre", locale as SupportedLocale)}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                          {localizeField(article, "extrait", locale as SupportedLocale)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Appel à l'action ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] bg-forest px-8 py-14 text-center shadow-[0_30px_60px_-24px_rgba(20,48,31,0.4)] md:px-14 md:py-16">
              <GrowthMark
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-8 -end-8 h-48 w-48 text-champagne/[0.1]"
              />
              <h2 className="relative text-2xl font-semibold tracking-tight text-ivory md:text-3xl">{t("cta.title")}</h2>
              <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ivory/65">{t("cta.text")}</p>
              <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/devenir-membre"
                  className="rounded-full bg-ivory px-8 py-3 text-sm font-medium text-forest transition duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-white"
                >
                  {t("cta.primary")}
                </Link>
                <Link
                  href="/contact"
                  className="rounded-full border border-ivory/30 px-8 py-3 text-sm font-medium text-ivory transition duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-ivory/10"
                >
                  {t("cta.secondary")}
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
    </>
  );
}
