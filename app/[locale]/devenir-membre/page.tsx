import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import AdhesionForm from "./AdhesionForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrowthMark from "@/components/GrowthMark";
import ScrollReveal from "@/components/ScrollReveal";
import { PhotoFrame } from "@/components/PhotoFrame";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "devenirMembre.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function DevenirMembre({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "devenirMembre" });
  const pourquoiItems = t.raw("pourquoi.items") as string[];
  const missionsItems = t.raw("missions.items") as string[];

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
                src="/images/evenements/repas-solidaire.jpg"
                alt="Membres de l'Association Jeunes Actifs réunis autour d'un repas solidaire"
                fill
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
                priority
              />
            </PhotoFrame>
          </div>
        </section>

        {/* ── Pourquoi / Missions ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="mx-auto grid max-w-5xl gap-x-14 gap-y-12 lg:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">{t("pourquoi.kicker")}</p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink md:text-2xl">{t("pourquoi.title")}</h2>
                <ul className="mt-6 space-y-4">
                  {pourquoiItems.map((texte) => (
                    <AvantageItem key={texte} texte={texte} />
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">{t("missions.kicker")}</p>
                <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink md:text-2xl">{t("missions.title")}</h2>
                <ul className="mt-6 divide-y divide-champagne-soft/60">
                  {missionsItems.map((texte) => (
                    <MissionItem key={texte} texte={texte} />
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── Formulaire ── */}
        <ScrollReveal>
          <section className="border-t border-champagne-soft/60 bg-surface-muted px-6 py-16 md:py-20">
            <div className="mx-auto max-w-2xl rounded-[1.75rem] bg-background p-8 shadow-[0_20px_50px_-24px_rgba(20,48,31,0.2)] md:p-10">
              <p className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-ink">{t("form.kicker")}</p>
              <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("form.title")}</h2>
              <p className="mt-3 text-center text-sm text-muted-foreground">{t("form.text")}</p>
              <AdhesionForm />
            </div>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
    </>
  );
}

function AvantageItem({ texte }: { texte: string }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest/8">
        <svg className="h-3.5 w-3.5 text-ink" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
      <span className="text-sm leading-relaxed text-muted-foreground">{texte}</span>
    </li>
  );
}

function MissionItem({ texte }: { texte: string }) {
  return (
    <li className="flex items-center gap-3 py-3 first:pt-0">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" aria-hidden="true" />
      <span className="text-sm text-muted-foreground">{texte}</span>
    </li>
  );
}
