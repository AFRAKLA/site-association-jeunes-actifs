import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mentionsLegales.meta" });
  return { title: t("title"), description: t("description") };
}

export default async function MentionsLegales({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "mentionsLegales" });

  return (
    <>
      <Header />

      <main id="main-content">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ink">{t("kicker")}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink">{t("title")}</h1>

          <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-base font-semibold text-ink">{t("editeur.title")}</h2>
              <p className="mt-2">
                {t("editeur.line1")}<br />
                {t("editeur.line2")}<br />
                {t("editeur.line3")}
              </p>
              <p className="mt-2">
                {t("editeur.email")}{" "}
                <a
                  href="mailto:contact@jeunes-actifs.ma"
                  className="text-ink hover:underline"
                >
                  contact@jeunes-actifs.ma
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-ink">{t("directeur.title")}</h2>
              <p className="mt-2">{t("directeur.text")}</p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-ink">{t("hebergement.title")}</h2>
              <p className="mt-2">
                {t("hebergement.line1")}<br />
                {t("hebergement.line2")}<br />
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink hover:underline"
                >
                  vercel.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-ink">{t("propriete.title")}</h2>
              <p className="mt-2">{t("propriete.text")}</p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-ink">{t("donnees.title")}</h2>
              <p className="mt-2">{t("donnees.text1")}</p>
              <p className="mt-2">{t("donnees.text2")}</p>
            </div>

            <div>
              <h2 className="text-base font-semibold text-ink">{t("responsabilite.title")}</h2>
              <p className="mt-2">{t("responsabilite.text")}</p>
            </div>

            <div className="rounded-xl border border-champagne-soft bg-surface-muted p-4">
              <p className="text-xs text-muted-foreground">
                {t("note.text1")}{" "}
                <a
                  href="mailto:contact@jeunes-actifs.ma"
                  className="text-ink hover:underline"
                >
                  contact@jeunes-actifs.ma
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}
