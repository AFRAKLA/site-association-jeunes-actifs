import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrowthMark from "@/components/GrowthMark";
import ScrollReveal from "@/components/ScrollReveal";
import { supabase } from "@/lib/supabase";
import { formatLocalizedDate } from "@/lib/date-format";
import { localizeField, type SupportedLocale } from "@/lib/i18n-content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  let derniersArticles: {
    id: string;
    titre: string;
    categorie: string;
    extrait: string;
    created_at: string;
    titre_en?: string | null;
    titre_ar?: string | null;
    extrait_en?: string | null;
    extrait_ar?: string | null;
  }[] = [];

  try {
    // select("*") : voir le commentaire équivalent dans actualites/page.tsx —
    // reste valide avant et après la migration i18n Supabase.
    const { data } = await supabase
      .from("actualites")
      .select("*")
      .eq("statut", "publie")
      .order("created_at", { ascending: false })
      .limit(3);
    derniersArticles = data ?? [];
  } catch {
    /* fallback : tableau vide */
  }

  let derniersEvenements: {
    id: string;
    titre: string;
    slug: string | null;
    date_evenement: string;
    date_debut: string | null;
    lieu: string;
    description: string;
    a_venir: boolean;
    image_url: string | null;
    titre_en?: string | null;
    titre_ar?: string | null;
    lieu_en?: string | null;
    lieu_ar?: string | null;
  }[] = [];

  try {
    const { data: evtData } = await supabase
      .from("evenements")
      .select("*")
      .eq("statut", "publie");
    derniersEvenements = (evtData ?? []) as typeof derniersEvenements;
  } catch {
    /* fallback : tableau vide */
  }

  let derniersMoments: {
    id: string;
    titre: string;
    image_url: string;
    titre_en?: string | null;
    titre_ar?: string | null;
  }[] = [];

  try {
    const { data: photosData } = await supabase
      .from("galerie")
      .select("*")
      .eq("statut", "publie")
      .order("created_at", { ascending: false })
      .limit(5);
    derniersMoments = photosData ?? [];
  } catch {
    /* fallback : tableau vide */
  }

  // Priorise les événements à venir ; complète avec les plus récents passés
  // uniquement s'il n'y en a pas assez pour remplir la section (3 max).
  const todayAccueil = new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Casablanca",
  }).format(new Date());

  const evenementsAvenir = derniersEvenements
    .filter((e) => (e.date_debut ? e.date_debut >= todayAccueil : e.a_venir))
    .sort((a, b) => (a.date_debut ?? "").localeCompare(b.date_debut ?? ""));

  const evenementsPasses = derniersEvenements
    .filter((e) => (e.date_debut ? e.date_debut < todayAccueil : !e.a_venir))
    .sort((a, b) => (b.date_debut ?? "").localeCompare(a.date_debut ?? ""));

  derniersEvenements = [...evenementsAvenir, ...evenementsPasses].slice(0, 3);

  const [articleVedette, ...autresArticles] = derniersArticles;

  return (
    <>
      <Header />

      <main id="main-content">
        {/* ── 1. HERO ── */}
        <section className="relative overflow-hidden bg-surface-muted px-6 pb-16 pt-14 md:pb-24 md:pt-20">
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-10">
            {/* Texte */}
            <div className="relative">
              <GrowthMark
                aria-hidden="true"
                className="pointer-events-none absolute -start-10 -top-16 h-40 w-40 text-champagne/[0.18] lg:-start-16"
              />
              <p className="relative text-xs font-medium uppercase tracking-[0.16em] text-champagne">
                {t("hero.kicker")}
              </p>
              <h1 className="relative mt-3 text-4xl font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="relative mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
                {t("hero.text")}
              </p>
              <div className="relative mt-8 flex flex-wrap gap-3">
                <Link
                  href="/devenir-membre"
                  className="rounded-full bg-forest px-7 py-3.5 text-sm font-medium text-ivory transition duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-forest-light"
                >
                  {t("hero.ctaPrimary")}
                </Link>
                <Link
                  href="/activites"
                  className="rounded-full border border-forest/25 px-7 py-3.5 text-sm font-medium text-forest transition duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-forest/5"
                >
                  {t("hero.ctaSecondary")}
                </Link>
              </div>
            </div>

            {/* Photo réelle — bord qui déborde vers la marge, dégradé de fondu */}
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_30px_60px_-24px_rgba(20,48,31,0.35)] lg:-me-6">
                <Image
                  src="/images/accueil/animation-enfants.jpg"
                  alt="Membres de l'association Jeunes Actifs lors d'une animation avec des enfants dans la région de l'Oriental"
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                  priority
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/35 to-transparent" />
              </div>
              <div className="relative z-10 mx-4 -mt-8 rounded-2xl bg-background px-5 py-4 shadow-[0_16px_40px_-16px_rgba(20,48,31,0.25)] sm:mx-8">
                <p className="text-sm font-medium text-ink">{t("hero.caption")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. QUI SOMMES-NOUS ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("mission.kicker")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("mission.title")}</h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground">{t("mission.text")}</p>
              <Link
                href="/a-propos"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-forest underline decoration-champagne/50 decoration-2 underline-offset-4 transition-colors duration-150 hover:decoration-champagne"
              >
                {t("mission.link")}
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* ── 3. NOS ACTIONS ── */}
        <ScrollReveal>
          <section className="border-y border-champagne-soft/60 bg-surface-muted px-6 py-16 md:py-20">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("actions.kicker")}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("actions.title")}</h2>
                </div>
                <Link
                  href="/activites"
                  className="hidden shrink-0 text-sm font-medium text-forest transition-colors duration-150 hover:text-forest-light sm:inline-block"
                >
                  {t("actions.link")}
                </Link>
              </div>

              <div className="mt-10 grid divide-y divide-champagne-soft/60 sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                <ActionItem
                  iconPath="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  titre={t("actions.items.solidarite.title")}
                  description={t("actions.items.solidarite.text")}
                />
                <ActionItem
                  iconPath="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                  titre={t("actions.items.culture.title")}
                  description={t("actions.items.culture.text")}
                />
                <ActionItem
                  iconPath="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  titre={t("actions.items.sante.title")}
                  description={t("actions.items.sante.text")}
                />
                <ActionItem
                  iconPath="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  titre={t("actions.items.citoyennete.title")}
                  description={t("actions.items.citoyennete.text")}
                />
              </div>

              <div className="mt-8 text-center sm:hidden">
                <Link href="/activites" className="text-sm font-medium text-forest hover:text-forest-light">
                  {t("actions.link")}
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── 4. IMPACT + VALEURS ── */}
        <ScrollReveal>
          <section className="relative overflow-hidden bg-forest px-6 py-16 md:py-20">
            <GrowthMark
              aria-hidden="true"
              className="pointer-events-none absolute -start-16 -top-16 h-80 w-80 text-champagne/[0.06]"
            />
            <div className="relative mx-auto max-w-4xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("impact.kicker")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ivory md:text-3xl">{t("impact.title")}</h2>

              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                <ImpactStat chiffre={t("impact.stats.actions.value")} label={t("impact.stats.actions.label")} />
                <ImpactStat chiffre={t("impact.stats.jeunes.value")} label={t("impact.stats.jeunes.label")} />
                <ImpactStat chiffre={t("impact.stats.evenements.value")} label={t("impact.stats.evenements.label")} />
              </div>

              <div className="mx-auto mt-14 h-px w-16 bg-champagne/40" aria-hidden="true" />

              <ul className="mt-12 grid gap-8 text-start sm:grid-cols-3">
                <ValeurItem titre={t("impact.values.solidarite.title")} description={t("impact.values.solidarite.text")} />
                <ValeurItem titre={t("impact.values.engagement.title")} description={t("impact.values.engagement.text")} />
                <ValeurItem titre={t("impact.values.equipe.title")} description={t("impact.values.equipe.text")} />
              </ul>
            </div>
          </section>
        </ScrollReveal>

        {/* ── 5. DERNIÈRES ACTUALITÉS ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("actualites.kicker")}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("actualites.title")}</h2>
                </div>
                <Link href="/actualites" className="hidden shrink-0 text-sm font-medium text-forest hover:text-forest-light sm:inline-block">
                  {t("actualites.link")}
                </Link>
              </div>

              {articleVedette ? (
                <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                  <ArticleVedette article={articleVedette} locale={locale} readMore={tCommon("readMore")} />
                  {autresArticles.length > 0 && (
                    <div className="divide-y divide-champagne-soft/60 border-t border-champagne-soft/60 lg:border-t-0 lg:border-s lg:ps-8">
                      {autresArticles.map((article) => (
                        <ArticleLigne key={article.id} article={article} locale={locale} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-8 text-sm text-muted-foreground">{t("actualites.empty")}</p>
              )}

              <div className="mt-8 text-center sm:hidden">
                <Link href="/actualites" className="text-sm font-medium text-forest hover:text-forest-light">
                  {t("actualites.link")}
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── 6. ÉVÉNEMENTS ── */}
        <ScrollReveal>
          <section className="border-y border-champagne-soft/60 bg-surface-muted px-6 py-16 md:py-20">
            <div className="mx-auto max-w-5xl">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("evenements.kicker")}</p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("evenements.title")}</h2>
                </div>
                <Link href="/evenements" className="hidden shrink-0 text-sm font-medium text-forest hover:text-forest-light sm:inline-block">
                  {t("evenements.link")}
                </Link>
              </div>

              {derniersEvenements.length > 0 ? (
                <div className="mt-10 space-y-4">
                  {derniersEvenements.map((evt) => (
                    <EvenementLigne
                      key={evt.id}
                      evenement={evt}
                      avnr={evt.date_debut ? evt.date_debut >= todayAccueil : evt.a_venir}
                      aVenirLabel={t("evenements.aVenir")}
                      passeLabel={t("evenements.passe")}
                      locale={locale}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-8 text-sm text-muted-foreground">{t("evenements.empty")}</p>
              )}

              <div className="mt-8 text-center sm:hidden">
                <Link href="/evenements" className="text-sm font-medium text-forest hover:text-forest-light">
                  {t("evenements.link")}
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── 7. MOMENTS (photos réelles) ── */}
        {derniersMoments.length > 0 && (
          <ScrollReveal>
            <section className="px-6 py-16 md:py-20">
              <div className="mx-auto max-w-5xl">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("moments.kicker")}</p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("moments.title")}</h2>
                  </div>
                  <Link href="/galerie" className="hidden shrink-0 text-sm font-medium text-forest hover:text-forest-light sm:inline-block">
                    {t("moments.link")}
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:grid-rows-2">
                  {derniersMoments.map((photo, i) => (
                    <Link
                      key={photo.id}
                      href="/galerie"
                      className={`group relative overflow-hidden rounded-2xl ${
                        i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto" : "aspect-square"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.image_url}
                        alt={localizeField(photo, "titre", locale as SupportedLocale)}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 ease-out-strong motion-safe:group-hover:scale-[1.05]"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-forest/0 transition-colors duration-300 group-hover:bg-forest/10" />
                    </Link>
                  ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                  <Link href="/galerie" className="text-sm font-medium text-forest hover:text-forest-light">
                    {t("moments.link")}
                  </Link>
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* ── 8. CTA FINAL ── */}
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

/* ── Composants ── */

function ImpactStat({ chiffre, label }: { chiffre: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-semibold tabular-nums tracking-tight text-ivory md:text-5xl">{chiffre}</div>
      <div className="mt-2 text-sm text-ivory/60">{label}</div>
    </div>
  );
}

function ActionItem({
  iconPath,
  titre,
  description,
}: {
  iconPath: string;
  titre: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 px-0 py-6 first:pt-0 sm:px-8 sm:py-8 sm:first:ps-0">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-champagne-soft">
        <svg className="h-5 w-5 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </span>
      <div>
        <h3 className="text-sm font-semibold text-ink">{titre}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function ValeurItem({ titre, description }: { titre: string; description: string }) {
  return (
    <li>
      <p className="text-sm font-semibold text-ivory">{titre}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-ivory/60">{description}</p>
    </li>
  );
}

const categorieLabels: Record<string, string> = {
  environnement: "Environnement",
  culture: "Culture",
  solidarite: "Solidarité",
  formation: "Formation",
  "vie-associative": "Vie associative",
};

function ArticleVedette({
  article,
  locale,
  readMore,
}: {
  article: {
    id: string;
    titre: string;
    categorie: string;
    extrait: string;
    created_at: string;
    titre_en?: string | null;
    titre_ar?: string | null;
    extrait_en?: string | null;
    extrait_ar?: string | null;
  };
  locale: string;
  readMore: string;
}) {
  const loc = locale as SupportedLocale;
  return (
    <article>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-forest">
          <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
          {categorieLabels[article.categorie] ?? article.categorie}
        </span>
        <span className="text-xs text-muted-foreground">{formatLocalizedDate(article.created_at, locale)}</span>
      </div>
      <h3 className="mt-3 text-xl font-semibold leading-snug tracking-tight text-ink md:text-2xl">
        {localizeField(article, "titre", loc)}
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        {localizeField(article, "extrait", loc)}
      </p>
      <Link
        href="/actualites"
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-forest underline decoration-champagne/50 decoration-2 underline-offset-4 hover:decoration-champagne"
      >
        {readMore} <span aria-hidden="true" className="rtl:rotate-180">→</span>
      </Link>
    </article>
  );
}

function ArticleLigne({
  article,
  locale,
}: {
  article: {
    id: string;
    titre: string;
    categorie: string;
    extrait: string;
    created_at: string;
    titre_en?: string | null;
    titre_ar?: string | null;
  };
  locale: string;
}) {
  return (
    <div className="py-4 first:pt-0 lg:first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-forest">{categorieLabels[article.categorie] ?? article.categorie}</span>
        <span className="text-xs text-muted-foreground">· {formatLocalizedDate(article.created_at, locale)}</span>
      </div>
      <h4 className="mt-1.5 text-sm font-semibold leading-snug text-ink">
        {localizeField(article, "titre", locale as SupportedLocale)}
      </h4>
    </div>
  );
}

function EvenementLigne({
  evenement,
  avnr,
  aVenirLabel,
  passeLabel,
  locale,
}: {
  evenement: {
    id: string;
    titre: string;
    slug: string | null;
    date_evenement: string;
    lieu: string;
    description: string;
    image_url: string | null;
    titre_en?: string | null;
    titre_ar?: string | null;
    lieu_en?: string | null;
    lieu_ar?: string | null;
  };
  avnr: boolean;
  aVenirLabel: string;
  passeLabel: string;
  locale: string;
}) {
  const href = evenement.slug ? `/evenements/${evenement.slug}` : "/evenements";
  const loc = locale as SupportedLocale;
  const titre = localizeField(evenement, "titre", loc);
  const lieu = localizeField(evenement, "lieu", loc);

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-2xl bg-background p-3 transition-colors duration-150 hover:bg-champagne-soft/20 sm:gap-5 sm:p-4"
    >
      {evenement.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={evenement.image_url}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover ring-1 ring-champagne-soft sm:h-20 sm:w-20"
        />
      ) : (
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-muted ring-1 ring-champagne-soft sm:h-20 sm:w-20">
          <svg className="h-6 w-6 text-forest/60" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
            {avnr ? aVenirLabel : passeLabel}
          </span>
          <span className="text-xs text-muted-foreground">{evenement.date_evenement}</span>
        </div>
        <h4 className="mt-1 truncate text-sm font-semibold text-ink">{titre}</h4>
        {lieu && <p className="truncate text-xs text-muted-foreground">{lieu}</p>}
      </div>
      <span
        aria-hidden="true"
        className="hidden shrink-0 text-forest transition-transform duration-150 ease-out-strong group-hover:translate-x-0.5 sm:inline-block rtl:rotate-180"
      >
        →
      </span>
    </Link>
  );
}
