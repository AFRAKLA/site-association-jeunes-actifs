import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Événements | Association Jeunes Actifs",
  description:
    "Retrouvez les événements organisés par l'Association Jeunes Actifs : forums, ateliers, formations et actions de terrain dans l'Oriental.",
};

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
}

function getTodayMorocco(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Casablanca",
  }).format(new Date());
}

function formatDateFr(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function Evenements() {
  let raw: Evenement[] = [];

  try {
    const { data } = await supabase
      .from("evenements")
      .select(
        "id, titre, slug, date_evenement, date_debut, heure, lieu, categorie, description, a_venir, image_url, created_at"
      )
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
      {/* En-tête */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold">Événements</h1>
          <p className="mt-4 text-muted-foreground">
            Retrouvez les événements organisés par l&apos;Association Jeunes
            Actifs dans la région de l&apos;Oriental : forums, ateliers,
            formations et soirées culturelles.
          </p>
        </div>
      </section>

      {/* Événements à venir */}
      <section className="bg-muted px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-2xl font-bold text-foreground">Événements à venir</h2>
          {avenir.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Aucun événement à venir pour le moment. Revenez bientôt&nbsp;!
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {avenir.map((e) => (
                <EvenementCardItem key={e.id} e={e} avnr={true} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Archives — événements passés */}
      {passesEtArchives.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-xl font-semibold text-muted-foreground">
              Événements passés
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Les archives de nos actions précédentes restent consultables ici.
            </p>
            <div className="mt-6 grid gap-5 opacity-90 sm:grid-cols-2 lg:grid-cols-4">
              {passesEtArchives.map((e) => (
                <EvenementCardItem key={e.id} e={e} avnr={false} compact />
              ))}
            </div>
          </div>
        </section>
      )}

      {avenir.length === 0 && passesEtArchives.length === 0 && (
        <section className="bg-muted px-6 py-16">
          <p className="text-center text-sm text-muted-foreground">
            Aucun événement pour le moment. Revenez bientôt&nbsp;!
          </p>
        </section>
      )}

      {/* Pourquoi participer */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Pourquoi participer&nbsp;?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-muted p-6 text-left">
              <h3 className="font-semibold">Développer vos compétences</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Chaque événement est une occasion d&apos;apprendre :
                communication, gestion de projet, travail en équipe.
              </p>
            </div>
            <div className="rounded-xl border border-muted p-6 text-left">
              <h3 className="font-semibold">
                Rencontrer d&apos;autres jeunes
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Nos événements rassemblent des étudiants de l&apos;enseignement
                supérieur de tout l&apos;Oriental.
              </p>
            </div>
            <div className="rounded-xl border border-muted p-6 text-left">
              <h3 className="font-semibold">Avoir un impact réel</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Vos actions contribuent directement au développement de la
                région et au bien-être des communautés locales.
              </p>
            </div>
            <div className="rounded-xl border border-muted p-6 text-left">
              <h3 className="font-semibold">Valoriser votre parcours</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Les événements donnent lieu à des certificats de participation
                valorisables dans votre CV.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="bg-primary px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">
            Rejoignez nos prochains événements
          </h2>
          <p className="mt-4 text-green-100">
            Vous souhaitez participer ou proposer un événement ? Contactez-nous
            ou devenez membre de l&apos;association.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/devenir-membre"
              className="rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary shadow-md transition hover:bg-green-50"
            >
              Devenir membre
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/30 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}

/* ── Carte événement (à venir ou archive) ── */

function EvenementCardItem({
  e,
  avnr,
  compact = false,
}: {
  e: Evenement;
  avnr: boolean;
  compact?: boolean;
}) {
  const dateLabel = e.date_debut
    ? formatDateFr(e.date_debut)
    : (e.date_evenement ?? null);

  const card = (
    <div className="flex h-full flex-col rounded-xl bg-background shadow-sm transition hover:shadow-md">
      {/* Image */}
      {e.image_url ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl">
          <Image
            src={e.image_url}
            alt={e.titre}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-t-xl bg-primary/5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-primary/30"
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
        </div>
      )}

      {/* Contenu */}
      <div className={`flex flex-1 flex-col ${compact ? "p-4" : "p-5"}`}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              avnr
                ? "bg-green-100 text-green-700"
                : "border border-muted-foreground/20 bg-muted text-muted-foreground"
            }`}
          >
            {avnr ? "À venir" : "Événement passé"}
          </span>
          {!compact && (
            <span className="rounded-full bg-primary/5 px-3 py-1 text-xs text-primary">
              {e.categorie}
            </span>
          )}
        </div>

        {dateLabel && (
          <p className="mt-2 text-xs font-medium text-primary">
            {dateLabel}
            {e.heure ? ` · ${e.heure.substring(0, 5)}` : ""}
          </p>
        )}

        <h3
          className={`mt-1.5 font-semibold leading-snug ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {e.titre}
        </h3>

        {e.lieu && (
          <p className="mt-1 text-xs text-muted-foreground">{e.lieu}</p>
        )}

        {!compact && (
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {e.description}
          </p>
        )}

        {e.slug && (
          <p className="mt-3 text-xs font-medium text-primary">
            Voir le détail →
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
