import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ContactForm from "./ContactForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrowthMark from "@/components/GrowthMark";
import { PhotoFrame } from "@/components/PhotoFrame";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <>
      <Header />

      <main id="main-content">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden bg-surface-muted px-6 pb-14 pt-14 md:pb-20 md:pt-20">
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
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
                src="/images/accueil/animation-enfants.jpg"
                alt="Membres de l'association Jeunes Actifs lors d'une animation de terrain"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
            </PhotoFrame>
          </div>
        </section>

        {/* ── Coordonnées + Réseaux ── */}
        <section className="px-6 py-14 md:py-16">
          <div className="mx-auto grid max-w-4xl gap-x-12 gap-y-10 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink">{t("coordonnees.kicker")}</p>
              <div className="mt-5 space-y-5 text-sm">
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted ring-1 ring-champagne-soft">
                    <svg className="h-[18px] w-[18px] text-ink" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-ink">{t("coordonnees.adresseLabel")}</p>
                    <p className="mt-0.5 text-muted-foreground">{t("coordonnees.adresseValue")}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted ring-1 ring-champagne-soft">
                    <svg className="h-[18px] w-[18px] text-ink" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-ink">{t("coordonnees.emailLabel")}</p>
                    <a href="mailto:contact@jeunes-actifs.ma" className="mt-0.5 block text-ink hover:underline">
                      contact@jeunes-actifs.ma
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted ring-1 ring-champagne-soft">
                    <svg className="h-[18px] w-[18px] text-ink" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </span>
                  <div>
                    <p className="font-medium text-ink">{t("coordonnees.telephoneLabel")}</p>
                    <p className="mt-0.5 italic text-muted-foreground">{t("coordonnees.telephoneValue")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink">{t("reseaux.kicker")}</p>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{t("reseaux.text")}</p>
              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href="https://www.facebook.com/share/1ECFbe4Nd9/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-ink transition-opacity duration-150 hover:opacity-70"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/asso_jeunesactifs/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm text-ink transition-opacity duration-150 hover:opacity-70"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                  </svg>
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Formulaire ── */}
        <section className="border-t border-champagne-soft/60 bg-surface-muted px-6 py-16 md:py-20">
          <div className="mx-auto max-w-2xl rounded-[1.75rem] bg-background p-8 shadow-[0_20px_50px_-24px_rgba(20,48,31,0.2)] md:p-10">
            <p className="text-center text-[11px] font-medium uppercase tracking-[0.14em] text-ink">{t("form.kicker")}</p>
            <h2 className="mt-2 text-center text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("form.title")}</h2>
            <ContactForm />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
