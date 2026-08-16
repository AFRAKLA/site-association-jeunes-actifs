import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
  const t = await getTranslations({ locale, namespace: "evenementsPage.meta" });
  return { title: t("title"), description: t("description") };
}

interface Evenement {
  id: string;
  titre: string;
  slug: string | null;
  date_evenement: string | null;
  date_debut: string | null;
  heure: string | null;
  lieu: string | null;
  categorie: string;
  description: string;
  a_venir: boolean;
  image_url: string | null;
  created_at: string;
  titre_en?: string | null;
  titre_ar?: string | null;
  lieu_en?: string | null;
  lieu_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
}

function getTodayMorocco(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Casablanca",
  }).format(new Date());
}

export default async function Evenements({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "evenementsPage" });

  let raw: Evenement[] = [];

  try {
    // select("*") : voir le commentaire équivalent dans actualites/page.tsx —
    // reste valide avant et après la migration i18n Supabase.
    const { data } = await supabase
      .from("evenements")
      .select("*")
      .eq("statut", "publie");
    raw = (data as Evenement[]) ?? [];
  } catch {
    /* fallback : tableau vide */
  }

  const today = getTodayMorocco();

  // Classement : un événement sans date_debut (legacy) se range selon son
  // indicateur a_venir, pour ne jamais afficher un événement à venir comme
  // "passé" faute de date renseignée.
  const avenir = raw
    .filter((e) => (e.date_debut ? e.date_debut >= today : e.a_venir))
    .sort((a, b) => {
      if (a.date_debut && b.date_debut) return a.date_debut.localeCompare(b.date_debut);
      if (a.date_debut) return -1;
      if (b.date_debut) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const passesEtArchives = raw
    .filter((e) => (e.date_debut ? e.date_debut < today : !e.a_venir))
    .sort((a, b) => {
      if (a.date_debut && b.date_debut) return b.date_debut.localeCompare(a.date_debut);
      if (a.date_debut) return -1;
      if (b.date_debut) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

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
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("hero.kicker")}</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-ink md:text-5xl">{t("hero.title")}</h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">{t("hero.text")}</p>
          </div>
        </section>

        {/* ── À venir ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("avenir.title")}</h2>
              {avenir.length === 0 ? (
                <p className="mt-5 text-sm text-muted-foreground">{t("avenir.empty")}</p>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {avenir.map((e) => (
                    <EvenementCard key={e.id} e={e} avnr locale={locale} aVenirLabel={t("card.aVenir")} passeLabel={t("card.passe")} voirDetailLabel={t("card.voirDetail")} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* ── Passés ── */}
        {passesEtArchives.length > 0 && (
          <ScrollReveal>
            <section className="border-t border-champagne-soft/60 bg-surface-muted px-6 py-16 md:py-20">
              <div className="mx-auto max-w-5xl">
                <h2 className="text-xl font-semibold text-ink md:text-2xl">{t("passes.title")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("passes.text")}</p>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {passesEtArchives.map((e) => (
                    <EvenementCard key={e.id} e={e} avnr={false} compact locale={locale} aVenirLabel={t("card.aVenir")} passeLabel={t("card.passe")} voirDetailLabel={t("card.voirDetail")} />
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        {avenir.length === 0 && passesEtArchives.length === 0 && (
          <section className="bg-surface-muted px-6 py-16">
            <p className="text-center text-sm text-muted-foreground">{t("emptyAll")}</p>
          </section>
        )}

        {/* ── Pourquoi participer ── */}
        <ScrollReveal>
          <section className="px-6 py-16 md:py-20">
            <div className="mx-auto max-w-5xl">
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-champagne">{t("pourquoi.kicker")}</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{t("pourquoi.title")}</h2>
              </div>
              <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
                <PourquoiItem titre={t("pourquoi.items.competences.title")} description={t("pourquoi.items.competences.text")} />
                <PourquoiItem titre={t("pourquoi.items.rencontre.title")} description={t("pourquoi.items.rencontre.text")} />
                <PourquoiItem titre={t("pourquoi.items.impact.title")} description={t("pourquoi.items.impact.text")} />
                <PourquoiItem titre={t("pourquoi.items.parcours.title")} description={t("pourquoi.items.parcours.text")} />
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* ── CTA ── */}
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

function PourquoiItem({ titre, description }: { titre: string; description: string }) {
  return (
    <div className="flex gap-3.5">
      <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-champagne" aria-hidden="true" />
      <div>
        <h3 className="text-sm font-semibold text-ink">{titre}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

/* ── Carte événement (à venir ou archive) ── */

function EvenementCard({
  e,
  avnr,
  compact = false,
  locale,
  aVenirLabel,
  passeLabel,
  voirDetailLabel,
}: {
  e: Evenement;
  avnr: boolean;
  compact?: boolean;
  locale: string;
  aVenirLabel: string;
  passeLabel: string;
  voirDetailLabel: string;
}) {
  const dateLabel = e.date_debut ? formatLocalizedDate(e.date_debut, locale) : (e.date_evenement ?? null);
  const loc = locale as SupportedLocale;
  const titre = localizeField(e, "titre", loc);
  const lieu = localizeField(e, "lieu", loc);
  const description = localizeField(e, "description", loc);

  const card = (
    <div className="group flex h-full flex-col overflow-hidden rounded-[1.5rem] bg-background shadow-[0_2px_20px_-8px_rgba(20,48,31,0.12)] transition-shadow duration-200 hover:shadow-[0_12px_32px_-12px_rgba(20,48,31,0.24)]">
      {/* Image */}
      {e.image_url ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={e.image_url}
            alt={titre}
            className="h-full w-full object-cover transition-transform duration-500 ease-out-strong motion-safe:group-hover:scale-[1.05]"
          />
          <span
            className={`absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-sm ${
              avnr ? "bg-forest/85 text-ivory" : "bg-background/85 text-muted-foreground"
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
            {avnr ? aVenirLabel : passeLabel}
          </span>
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center bg-surface-muted">
          <svg className="h-10 w-10 text-forest/25" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
        </div>
      )}

      {/* Contenu */}
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        {dateLabel && (
          <p className="text-xs font-medium text-forest">
            {dateLabel}
            {e.heure ? ` · ${e.heure.substring(0, 5)}` : ""}
          </p>
        )}
        <h3 className={`mt-1.5 font-semibold leading-snug text-ink ${compact ? "text-sm" : "text-base"}`}>
          {titre}
        </h3>
        {lieu && <p className="mt-1 text-xs text-muted-foreground">{lieu}</p>}
        {!compact && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {description}
          </p>
        )}
        {e.slug && (
          <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-forest">
            {voirDetailLabel}
            <span aria-hidden="true" className="rtl:rotate-180 transition-transform duration-150 ease-out-strong group-hover:translate-x-0.5">→</span>
          </p>
        )}
      </div>
    </div>
  );

  return e.slug ? (
    <Link href={`/evenements/${e.slug}`} className="flex">
      {card}
    </Link>
  ) : (
    <div className="flex">{card}</div>
  );
}
