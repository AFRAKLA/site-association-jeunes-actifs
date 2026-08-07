import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accueil | Association Jeunes Actifs",
  description:
    "Association socio-culturelle et solidaire dans la région de l'Oriental au Maroc. Actions sociales, culturelles et citoyennes portées par des étudiants engagés.",
};

export default async function Home() {
  let derniersArticles: {
    id: string;
    titre: string;
    categorie: string;
    extrait: string;
    created_at: string;
  }[] = [];

  try {
    const { data } = await supabase
      .from("actualites")
      .select("id, titre, categorie, extrait, created_at")
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
    date_evenement: string;
    date_debut: string | null;
    lieu: string;
    description: string;
    a_venir: boolean;
  }[] = [];

  try {
    const { data: evtData } = await supabase
      .from("evenements")
      .select("id, titre, date_evenement, date_debut, lieu, description, a_venir")
      .eq("statut", "publie");
    derniersEvenements = (evtData ?? []) as typeof derniersEvenements;
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

  return (
    <>
      <Header />

      <main id="main-content">
      {/* ── 1. HERO ── */}
      <section className="bg-muted px-6 py-16 md:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">

          {/* Texte */}
          <div>
            <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              Association jeunesse &amp; solidarité
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl">
              Jeunes Actifs,<br />
              <span className="text-primary">engagés dans l&apos;Oriental</span>
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Nous réunissons des étudiants de la région de l&apos;Oriental autour
              d&apos;actions sociales, culturelles et citoyennes concrètes. Ensemble,
              nous agissons pour un avenir plus solidaire et plus humain.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/activites"
                className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark"
              >
                Découvrir nos actions
              </Link>
              <Link
                href="/devenir-membre"
                className="rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary transition hover:bg-primary/10"
              >
                Devenir membre
              </Link>
            </div>
          </div>

          {/* Photo réelle de l'association */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md">
              <Image
                src="/images/accueil/animation-enfants.jpg"
                alt="Membres de l'association Jeunes Actifs lors d'une animation avec des enfants dans la région de l'Oriental"
                fill
                className="object-cover"
                priority
              />
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Des actions concrètes au service des jeunes et des familles
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. PRÉSENTATION ── */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-foreground">Qui sommes-nous ?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            L&apos;Association Jeunes Actifs est une association socio-culturelle
            basée dans la région de l&apos;Oriental au Maroc. Elle réunit des étudiants
            de l&apos;enseignement supérieur engagés dans des actions sociales,
            culturelles, solidaires et citoyennes au service de leur communauté.
          </p>
          <Link
            href="/a-propos"
            className="mt-6 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            En savoir plus sur l&apos;association →
          </Link>
        </div>
      </section>

      {/* ── 3. NOS ACTIONS ── */}
      <section className="bg-muted px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Nos domaines d&apos;action</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              L&apos;association intervient sur quatre axes principaux dans la région de l&apos;Oriental.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              iconPath="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              titre="Solidarité et accompagnement"
              description="Collectes, maraudes et projets solidaires en faveur des populations locales."
            />
            <ActionCard
              iconPath="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
              titre="Culture et événements"
              description="Soirées culturelles, expositions et rencontres autour du patrimoine de l'Oriental."
            />
            <ActionCard
              iconPath="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
              titre="Santé et sensibilisation"
              description="Actions médicales et campagnes de sensibilisation pour les jeunes et les familles."
            />
            <ActionCard
              iconPath="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              titre="Jeunesse et citoyenneté"
              description="Formations, ateliers et forums pour développer l'engagement étudiant."
            />
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/activites"
              className="inline-block rounded-lg border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              Toutes nos activités →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. NOS VALEURS — illustration générale (photo externe) ── */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-16">

          {/* Photo externe — ne représente pas une action de l'association */}
          <div className="order-2 md:order-1">
            <div className="relative aspect-[3/2] overflow-hidden rounded-2xl shadow-sm">
              <Image
                src="/images/accueil/valeurs-esprit-equipe.jpg"
                alt="Illustration symbolisant la solidarité et l'esprit d'équipe"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Valeurs */}
          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-bold text-foreground">Nos valeurs</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Ces valeurs guident chacune de nos actions et rassemblent nos membres
              au quotidien dans la région de l&apos;Oriental.
            </p>
            <ul className="mt-6 space-y-5">
              <ValeurItem
                titre="Solidarité"
                description="Nous agissons ensemble pour ceux qui en ont besoin, sans distinction."
              />
              <ValeurItem
                titre="Engagement"
                description="Chaque membre s'investit concrètement sur le terrain, au service de la communauté."
              />
              <ValeurItem
                titre="Esprit d'équipe"
                description="Nos projets sont collectifs : chaque contribution compte et nous avançons ensemble."
              />
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. DERNIÈRES ACTUALITÉS (dynamique Supabase) ── */}
      <section className="bg-muted px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Dernières actualités</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Suivez les nouvelles de l&apos;association et de nos actions en cours.
            </p>
          </div>
          {derniersArticles.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {derniersArticles.map((article) => (
                <ActualiteCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-muted bg-background px-5 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Aucune actualité pour le moment — revenez bientôt.
              </p>
            </div>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/actualites"
              className="inline-block rounded-lg border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              Voir toutes les actualités →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 6. ÉVÉNEMENTS (dynamique Supabase) ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Événements</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Retrouvez nos prochains événements et actions dans la région de l&apos;Oriental.
            </p>
          </div>
          {derniersEvenements.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {derniersEvenements.map((evt) => (
                <EvenementCard
                  key={evt.id}
                  evenement={evt}
                  avnr={
                    evt.date_debut
                      ? evt.date_debut >= todayAccueil
                      : evt.a_venir
                  }
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-lg border border-muted bg-background px-5 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                Aucun événement pour le moment — revenez bientôt.
              </p>
            </div>
          )}
          <div className="mt-6 text-center">
            <Link
              href="/evenements"
              className="inline-block rounded-lg border border-primary px-6 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
            >
              Voir tous les événements →
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. CTA DEVENIR MEMBRE ── */}
      <section className="bg-primary px-6 py-10 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Rejoignez l&apos;association</h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-green-100">
            Vous êtes étudiant dans l&apos;enseignement supérieur et vous souhaitez
            vous engager ? Rejoignez Jeunes Actifs et participez à des actions qui
            ont un impact réel dans la région de l&apos;Oriental.
          </p>
          <Link
            href="/devenir-membre"
            className="mt-8 inline-block rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-green-50"
          >
            Devenir membre
          </Link>
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}

/* ── Composants ── */

function ActionCard({
  iconPath,
  titre,
  description,
}: {
  iconPath: string;
  titre: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-muted bg-background p-5 shadow-sm transition hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={iconPath} />
        </svg>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{titre}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function ValeurItem({
  titre,
  description,
}: {
  titre: string;
  description: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
        ✓
      </span>
      <div>
        <p className="font-semibold text-foreground">{titre}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
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

function ActualiteCard({
  article,
}: {
  article: {
    id: string;
    titre: string;
    categorie: string;
    extrait: string;
    created_at: string;
  };
}) {
  return (
    <div className="flex flex-col rounded-xl border border-muted bg-background p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
          {categorieLabels[article.categorie] ?? article.categorie}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(article.created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{article.titre}</h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {article.extrait}
      </p>
      <Link
        href="/actualites"
        className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        Voir les actualités →
      </Link>
    </div>
  );
}

function EvenementCard({
  evenement,
  avnr,
}: {
  evenement: {
    id: string;
    titre: string;
    date_evenement: string;
    lieu: string;
    description: string;
    a_venir: boolean;
  };
  avnr: boolean;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-muted bg-background p-5 shadow-sm transition hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {evenement.date_evenement}
        </span>
        {avnr ? (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            À venir
          </span>
        ) : (
          <span className="rounded-full border border-muted-foreground/20 bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            Événement passé
          </span>
        )}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{evenement.titre}</h3>
      {evenement.lieu && (
        <p className="mt-1 text-xs text-primary">{evenement.lieu}</p>
      )}
      <p className="mt-2 flex-1 text-xs leading-relaxed text-muted-foreground">
        {evenement.description}
      </p>
      <Link
        href="/evenements"
        className="mt-4 text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        Voir les événements →
      </Link>
    </div>
  );
}
