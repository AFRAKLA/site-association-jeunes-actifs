import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GrowthMark from "@/components/GrowthMark";
import ScrollReveal from "@/components/ScrollReveal";
import { PhotoFrame } from "@/components/PhotoFrame";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "activitesPage.meta" });
  return { title: t("title"), description: t("description") };
}

// Association EXPLICITE et vérifiée visuellement au titre exact de la photo
// galerie — jamais une correspondance automatique par catégorie. Une simple
// catégorie ("solidarite", "culture"...) ne garantit pas qu'une photo soit
// éditoriale : une affiche promotionnelle ou un appel aux dons peut porter la
// même catégorie qu'une vraie photo de terrain. Si l'admin republie une photo
// sous ce titre exact, elle est réutilisée automatiquement ; si le titre
// change ou si la photo est dépubliée, l'activité repasse sans photo plutôt
// que d'en récupérer une autre au hasard dans la même catégorie. Le titre
// recherché reste volontairement en français (titre réel tel que saisi dans
// l'admin, qui n'est pas encore multilingue — voir §17 du rapport).
const ACTIVITES: { id: string; photoTitre?: string }[] = [
  { id: "solidarite", photoTitre: "Action médicale organisée par l'association" },
  { id: "culture", photoTitre: "Animation musicale lors d'un événement de l'association" },
  { id: "environnement" },
  { id: "formations" },
  { id: "evenements" },
  { id: "benevolat", photoTitre: "Repas solidaire organisé par l'association" },
  { id: "projets" },
];

export default async function Activites({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "activitesPage" });

  let photosParTitre: Record<string, { url: string; titre: string }> = {};

  try {
    const { data } = await supabase
      .from("galerie")
      .select("titre, image_url")
      .eq("statut", "publie");
    if (data) {
      photosParTitre = data.reduce<Record<string, { url: string; titre: string }>>((acc, p) => {
        acc[p.titre] = { url: p.image_url, titre: p.titre };
        return acc;
      }, {});
    }
  } catch {
    /* fallback : aucune photo */
  }

  const activitesAvecPhoto = ACTIVITES.map((a) => ({
    ...a,
    titre: t(`items.${a.id}.titre` as "items.solidarite.titre"),
    description: t(`items.${a.id}.description` as "items.solidarite.description"),
    exemple: t(`items.${a.id}.exemple` as "items.solidarite.exemple"),
    photo: a.photoTitre ? (photosParTitre[a.photoTitre] ?? null) : null,
  }));

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

        {/* ── Domaines d'action — alternance image / texte ── */}
        <div className="divide-y divide-champagne-soft/60">
          {activitesAvecPhoto.map((a, i) => (
            <ScrollReveal key={a.id}>
              <section className="px-6 py-14 md:py-16">
                <div
                  className={`mx-auto grid max-w-5xl items-center gap-8 md:gap-14 ${
                    a.photo ? "lg:grid-cols-2" : ""
                  }`}
                >
                  {a.photo && (
                    <PhotoFrame
                      variant="editorial"
                      backplateOffset={i % 2 === 1 ? "end" : "start"}
                      className={`aspect-[4/3] ${i % 2 === 1 ? "lg:order-2" : ""}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.photo.url} alt={a.photo.titre} className="h-full w-full object-cover" />
                    </PhotoFrame>
                  )}
                  <div className={a.photo && i % 2 === 1 ? "lg:order-1" : ""}>
                    <span className="text-xs font-medium uppercase tracking-[0.14em] text-ink">
                      0{i + 1}
                    </span>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink md:text-2xl">
                      {a.titre}
                    </h2>
                    <p className="mt-3 leading-relaxed text-muted-foreground">{a.description}</p>
                    <p className="mt-4 border-s-2 border-champagne ps-4 text-sm leading-relaxed text-muted-foreground">
                      {a.exemple}
                    </p>
                  </div>
                </div>
              </section>
            </ScrollReveal>
          ))}
        </div>

        {/* ── Appel à l'action ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="relative mx-auto max-w-2xl overflow-hidden rounded-[2rem] bg-forest px-8 py-14 text-center shadow-[0_30px_60px_-24px_rgba(20,48,31,0.4)] md:px-14 md:py-16">
              <GrowthMark
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-8 -start-8 h-48 w-48 text-champagne/[0.1]"
              />
              <h2 className="relative text-2xl font-semibold tracking-tight text-ivory md:text-3xl">{t("cta.title")}</h2>
              <p className="relative mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ivory/65">{t("cta.text")}</p>
              <Link
                href="/devenir-membre"
                className="relative mt-8 inline-block rounded-full bg-ivory px-8 py-3 text-sm font-medium text-forest transition duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-white"
              >
                {t("cta.primary")}
              </Link>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
    </>
  );
}
