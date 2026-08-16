import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { formatLocalizedDate } from "@/lib/date-format";
import { localizeField, type SupportedLocale } from "@/lib/i18n-content";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

interface Evenement {
  id: string;
  titre: string;
  slug: string;
  date_evenement: string | null;
  date_debut: string | null;
  heure: string | null;
  lieu: string | null;
  categorie: string;
  description: string;
  description_complete: string | null;
  a_venir: boolean;
  image_url: string | null;
  video_url: string | null;
  photos_supplementaires: string[];
  titre_en?: string | null;
  titre_ar?: string | null;
  lieu_en?: string | null;
  lieu_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  description_complete_en?: string | null;
  description_complete_ar?: string | null;
}

async function getEvenement(slug: string): Promise<Evenement | null> {
  const { data } = await supabase
    .from("evenements")
    .select("*")
    .eq("statut", "publie")
    .eq("slug", slug)
    .maybeSingle();
  return data as Evenement | null;
}

function getTodayMorocco(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Casablanca",
  }).format(new Date());
}

function isAvenir(evt: Evenement): boolean {
  if (evt.date_debut) return evt.date_debut >= getTodayMorocco();
  return evt.a_venir;
}

function resolveEmbedUrl(url: string): string | null {
  const ytMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) return `https://www.youtube-nocookie.com/embed/${ytMatch[1]}`;

  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const evt = await getEvenement(slug);
  if (!evt) {
    const t = await getTranslations({ locale, namespace: "evenementDetail" });
    return { title: t("notFoundTitle") };
  }
  const loc = locale as SupportedLocale;
  const titre = localizeField(evt, "titre", loc);
  const description = localizeField(evt, "description", loc);
  return {
    title: `${titre} | Événements | Association Jeunes Actifs`,
    description,
  };
}

export default async function EvenementDetail({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "evenementDetail" });
  const evt = await getEvenement(slug);

  if (!evt) notFound();

  const loc = locale as SupportedLocale;
  const avnr = isAvenir(evt);
  const dateLabel = evt.date_debut ? formatLocalizedDate(evt.date_debut, locale) : evt.date_evenement;
  const titre = localizeField(evt, "titre", loc);
  const lieu = localizeField(evt, "lieu", loc);
  const descriptionComplete = localizeField(evt, "description_complete", loc);
  const description = localizeField(evt, "description", loc);
  const contenu = descriptionComplete || description;
  const embedUrl = evt.video_url ? resolveEmbedUrl(evt.video_url) : null;

  return (
    <>
      <Header />

      <main id="main-content">
        {/* Image principale — pleine largeur, immersive */}
        {evt.image_url && (
          <div className="relative aspect-[16/8] w-full overflow-hidden bg-surface-muted sm:aspect-[16/6]">
            <Image
              src={evt.image_url}
              alt={titre}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-forest/70 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-6 pb-8">
              <div className="mx-auto max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-ivory/90 px-3 py-1 text-xs font-semibold text-forest">
                    <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
                    {avnr ? t("aVenir") : t("passe")}
                  </span>
                  <span className="rounded-full bg-ivory/20 px-3 py-1 text-xs font-medium text-ivory backdrop-blur-sm">
                    {evt.categorie}
                  </span>
                </div>
                <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-ivory md:text-4xl">
                  {titre}
                </h1>
              </div>
            </div>
          </div>
        )}

        <article className="mx-auto max-w-3xl px-6 py-10 md:py-14">
          {/* Retour */}
          <Link
            href="/evenements"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:text-forest"
          >
            <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t("tousLesEvenements")}
          </Link>

          {/* Si pas d'image, le titre/méta s'affichent ici en tête d'article */}
          {!evt.image_url && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne/20 px-3 py-1 text-xs font-semibold text-forest">
                  <span className="h-1.5 w-1.5 rounded-full bg-champagne" aria-hidden="true" />
                  {avnr ? t("aVenir") : t("passe")}
                </span>
                <span className="rounded-full border border-champagne-soft px-3 py-1 text-xs text-muted-foreground">
                  {evt.categorie}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
                {titre}
              </h1>
            </div>
          )}

          {/* Infos pratiques */}
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 border-y border-champagne-soft/60 py-4 text-sm text-muted-foreground">
            {dateLabel && (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                {dateLabel}
                {evt.heure ? ` · ${evt.heure.substring(0, 5)}` : ""}
              </span>
            )}
            {lieu && (
              <span className="flex items-center gap-1.5">
                <svg className="h-4 w-4 shrink-0 text-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                </svg>
                {lieu}
              </span>
            )}
          </div>

          {/* Contenu principal */}
          <div className="mt-8 max-w-none">
            {contenu.split("\n\n").map((para, i) => (
              <p key={i} className="mb-5 leading-relaxed text-muted-foreground">
                {para}
              </p>
            ))}
          </div>

          {/* Vidéo */}
          {embedUrl && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">{t("video")}</h2>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                <iframe
                  src={embedUrl}
                  title={t("videoTitle")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            </div>
          )}

          {/* Galerie photos supplémentaires */}
          {evt.photos_supplementaires && evt.photos_supplementaires.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-semibold tracking-tight text-ink">{t("photos")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {evt.photos_supplementaires.map((src, i) => (
                  <div key={i} className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
                    <Image
                      src={src}
                      alt={`Photo ${i + 1} — ${titre}`}
                      fill
                      className="object-cover transition-transform duration-500 ease-out-strong motion-safe:group-hover:scale-[1.05]"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Retour bas de page */}
          <div className="mt-12">
            <Link
              href="/evenements"
              className="inline-flex items-center gap-2 rounded-full border border-champagne-soft px-6 py-2.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-forest/30 hover:text-forest"
            >
              <svg className="h-4 w-4 rtl:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              {t("retourEvenements")}
            </Link>
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
}
