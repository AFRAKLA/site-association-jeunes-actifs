import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";

interface Props {
  params: Promise<{ slug: string }>;
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

function formatDateFr(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  const { slug } = await params;
  const evt = await getEvenement(slug);
  if (!evt) return { title: "Événement introuvable" };
  return {
    title: `${evt.titre} | Événements | Association Jeunes Actifs`,
    description: evt.description,
  };
}

export default async function EvenementDetail({ params }: Props) {
  const { slug } = await params;
  const evt = await getEvenement(slug);

  if (!evt) notFound();

  const avnr = isAvenir(evt);
  const dateLabel = evt.date_debut ? formatDateFr(evt.date_debut) : evt.date_evenement;
  const contenu = evt.description_complete || evt.description;
  const embedUrl = evt.video_url ? resolveEmbedUrl(evt.video_url) : null;

  return (
    <>
      <Header />

      <main id="main-content">
      <article className="mx-auto max-w-3xl px-6 py-14 md:py-16">
        {/* Retour */}
        <Link
          href="/evenements"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
          Tous les événements
        </Link>

        {/* Image principale */}
        {evt.image_url && (
          <div className="relative mt-6 aspect-[16/7] w-full overflow-hidden rounded-2xl">
            <Image
              src={evt.image_url}
              alt={evt.titre}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        )}

        {/* Méta */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {evt.categorie}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              avnr
                ? "bg-green-100 text-green-700"
                : "border border-muted-foreground/20 bg-muted text-muted-foreground"
            }`}
          >
            {avnr ? "À venir" : "Événement passé"}
          </span>
        </div>

        {/* Titre */}
        <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-foreground md:text-4xl">{evt.titre}</h1>

        {/* Infos pratiques */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          {dateLabel && (
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
                />
              </svg>
              {dateLabel}
              {evt.heure ? ` à ${evt.heure.substring(0, 5)}` : ""}
            </span>
          )}
          {evt.lieu && (
            <span className="flex items-center gap-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                />
              </svg>
              {evt.lieu}
            </span>
          )}
        </div>

        {/* Séparateur */}
        <hr className="my-8 border-muted" />

        {/* Contenu principal */}
        <div className="prose prose-sm max-w-none text-foreground">
          {contenu.split("\n\n").map((para, i) => (
            <p key={i} className="mb-4 leading-relaxed text-muted-foreground">
              {para}
            </p>
          ))}
        </div>

        {/* Vidéo */}
        {embedUrl && (
          <div className="mt-10">
            <h2 className="mb-4 text-xl font-semibold">Vidéo</h2>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl">
              <iframe
                src={embedUrl}
                title="Vidéo de l'événement"
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
            <h2 className="mb-4 text-xl font-semibold">Photos</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {evt.photos_supplementaires.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-[4/3] overflow-hidden rounded-2xl"
                >
                  <Image
                    src={src}
                    alt={`Photo ${i + 1} — ${evt.titre}`}
                    fill
                    className="object-cover"
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
            className="inline-flex items-center gap-2 rounded-full border border-muted px-6 py-2.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
            Retour aux événements
          </Link>
        </div>
      </article>
      </main>

      <Footer />
    </>
  );
}
