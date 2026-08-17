import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrowthMark from "@/components/GrowthMark";
import ScrollReveal from "@/components/ScrollReveal";
import { PhotoFrame } from "@/components/PhotoFrame";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "aPropos.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function APropos({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "aPropos" });
  const tImpact = await getTranslations({ locale, namespace: "home.impact.stats" });

  return (
    <>
      <Header />

      <main id="main-content">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-surface-muted px-6 pb-14 pt-14 md:pb-20 md:pt-20">
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            <div className="relative">
              <GrowthMark
                aria-hidden="true"
                className="pointer-events-none absolute -start-10 -top-14 h-36 w-36 text-champagne/[0.18]"
              />
              <p className="relative text-xs font-medium uppercase tracking-[0.16em] text-ink">{t("hero.kicker")}</p>
              <h1 className="relative mt-3 text-4xl font-semibold leading-[1.08] tracking-tight text-ink md:text-5xl">
                {t("hero.title")}
              </h1>
              <p className="relative mt-5 max-w-md text-base leading-relaxed text-muted-foreground">{t("hero.text")}</p>
            </div>
            <PhotoFrame variant="editorial" className="aspect-[4/3]">
              <Image
                src="/images/accueil/valeurs-esprit-equipe.jpg"
                alt="Membres de l'Association Jeunes Actifs réunis, incarnant l'esprit d'équipe et la solidarité"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </PhotoFrame>
          </div>
        </section>

        {/* ── Mission (alternance texte/image) ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <PhotoFrame variant="editorial" className="aspect-[4/3] lg:order-2">
                <Image
                  src="/images/accueil/animation-enfants.jpg"
                  alt="Membres de l'association animant une activité avec des enfants"
                  fill
                  sizes="(min-width: 1024px) 45vw, 100vw"
                  className="object-cover"
                />
              </PhotoFrame>
              <div className="lg:order-1">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">{t("mission.kicker")}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("mission.title")}</h2>
                <p className="mt-5 leading-relaxed text-muted-foreground">{t("mission.text")}</p>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Nos valeurs ── */}
        <ScrollReveal>
          <section className="border-y border-champagne-soft/60 bg-surface-muted px-6 py-16 md:py-20">
            <div className="mx-auto max-w-5xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">{t("valeurs.kicker")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("valeurs.title")}</h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">{t("valeurs.text")}</p>

              <div className="mt-10 grid divide-y divide-champagne-soft/60 sm:grid-cols-2 sm:divide-y-0 sm:divide-x lg:grid-cols-3">
                <ValeurItem titre={t("valeurs.items.engagement.title")} description={t("valeurs.items.engagement.text")} />
                <ValeurItem titre={t("valeurs.items.solidarite.title")} description={t("valeurs.items.solidarite.text")} />
                <ValeurItem titre={t("valeurs.items.culture.title")} description={t("valeurs.items.culture.text")} />
                <ValeurItem titre={t("valeurs.items.environnement.title")} description={t("valeurs.items.environnement.text")} />
                <ValeurItem titre={t("valeurs.items.developpement.title")} description={t("valeurs.items.developpement.text")} />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Notre vision ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="mx-auto max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">{t("vision.kicker")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("vision.title")}</h2>
              <p className="mt-5 leading-relaxed text-muted-foreground">{t("vision.text")}</p>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Impact ── */}
        <ScrollReveal>
          <section className="relative overflow-hidden bg-forest px-6 py-16 md:py-20">
            <GrowthMark
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -end-16 h-80 w-80 text-champagne/[0.06]"
            />
            <div className="relative mx-auto max-w-4xl text-center">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("impact.kicker")}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ivory md:text-3xl">{t("impact.title")}</h2>
              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                <ImpactItem chiffre={tImpact("actions.value")} label={tImpact("actions.label")} />
                <ImpactItem chiffre={tImpact("jeunes.value")} label={tImpact("jeunes.label")} />
                <ImpactItem chiffre={tImpact("evenements.value")} label={tImpact("evenements.label")} />
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
    </>
  );
}

function ValeurItem({ titre, description }: { titre: string; description: string }) {
  return (
    <div className="px-0 py-6 first:pt-0 sm:px-8 sm:py-8 sm:first:ps-0">
      <h3 className="text-sm font-semibold text-ink">{titre}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function ImpactItem({ chiffre, label }: { chiffre: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-semibold tabular-nums tracking-tight text-ivory md:text-5xl">{chiffre}</div>
      <div className="mt-2 text-sm text-ivory/60">{label}</div>
    </div>
  );
}
