"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrowthMark from "@/components/GrowthMark";
import { formatLocalizedDate } from "@/lib/date-format";
import { localizeField, type SupportedLocale } from "@/lib/i18n-content";

type Categorie = "environnement" | "culture" | "solidarite" | "formations";

interface Photo {
  id: string;
  titre: string;
  categorie: Categorie;
  description: string;
  image_url: string;
  created_at: string;
  titre_en?: string | null;
  titre_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
}

const CATEGORIE_KEYS: (Categorie | "tous")[] = ["tous", "environnement", "culture", "solidarite", "formations"];

export default function GalerieContent({ photos, locale }: { photos: Photo[]; locale: string }) {
  const t = useTranslations("galeriePage");
  const [filtre, setFiltre] = useState<Categorie | "tous">("tous");

  const photosFiltrees =
    filtre === "tous"
      ? photos
      : photos.filter((p) => p.categorie === filtre);

  return (
    <>
      <Header />

      <main id="main-content">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-surface-muted px-6 py-16 text-center md:py-20">
          <GrowthMark
            aria-hidden="true"
            className="pointer-events-none absolute -start-10 -top-10 h-40 w-40 text-champagne/[0.14]"
          />
          <div className="relative mx-auto max-w-2xl">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("hero.kicker")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink md:text-5xl">{t("hero.title")}</h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{t("hero.text")}</p>
          </div>
        </section>

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
                    : "border border-champagne-soft text-muted-foreground hover:border-forest/30 hover:text-forest"
                }`}
              >
                {t(`categories.${cat}`)}
              </button>
            ))}
          </div>
        </section>

        {/* ── Grille photographique ── */}
        <section className="px-6 py-14 md:py-16">
          <h2 className="sr-only">{t("srOnlyTitle")}</h2>
          {photos.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-champagne-soft bg-surface-muted px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">{t("emptyAll")}</p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
              {photosFiltrees.map((photo, i) => {
                const titre = localizeField(photo, "titre", locale as SupportedLocale);
                return (
                  <figure
                    key={photo.id}
                    className={`group relative overflow-hidden rounded-2xl bg-surface-muted ${
                      i % 5 === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-square"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.image_url}
                      alt={titre}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out-strong motion-safe:group-hover:scale-[1.05]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest/75 via-forest/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-[opacity,transform] duration-300 ease-out-strong group-hover:translate-y-0 group-hover:opacity-100">
                      <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-champagne">
                        {t(`categories.${photo.categorie}` as "categories.tous")}
                      </span>
                      <p className="mt-1 text-sm font-medium leading-snug text-ivory">{titre}</p>
                      <p className="mt-0.5 text-xs text-ivory/60">{formatLocalizedDate(photo.created_at, locale)}</p>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}

          {photos.length > 0 && photosFiltrees.length === 0 && (
            <p className="mt-8 text-center text-sm text-muted-foreground">{t("emptyCategorie")}</p>
          )}
        </section>

        {/* ── Suivez-nous sur Instagram ── */}
        <section className="border-t border-champagne-soft/60 bg-surface-muted px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("instagram.title")}</h2>
            <p className="mt-4 text-muted-foreground">{t("instagram.text")}</p>
            <a
              href="https://www.instagram.com/asso_jeunesactifs/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-forest/25 bg-background px-6 py-3 text-sm font-medium text-forest transition-colors duration-150 hover:bg-forest/5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              {t("instagram.cta")}
            </a>
          </div>
        </section>

        {/* ── Appel à l'action ── */}
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
      </main>

      <Footer />
    </>
  );
}
