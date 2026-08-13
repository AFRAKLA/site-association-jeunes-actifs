"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Categorie =
  | "environnement"
  | "culture"
  | "solidarite"
  | "formation"
  | "vie-associative";

interface Actualite {
  id: string;
  titre: string;
  categorie: Categorie;
  extrait: string;
  created_at: string;
}

const categories: { valeur: Categorie | "tous"; label: string }[] = [
  { valeur: "tous", label: "Tous" },
  { valeur: "environnement", label: "Environnement" },
  { valeur: "culture", label: "Culture" },
  { valeur: "solidarite", label: "Solidarité" },
  { valeur: "formation", label: "Formation" },
  { valeur: "vie-associative", label: "Vie associative" },
];

const categorieLabel: Record<Categorie, string> = {
  environnement: "Environnement",
  culture: "Culture",
  solidarite: "Solidarité",
  formation: "Formation",
  "vie-associative": "Vie associative",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ActualitesContent({
  actualites,
}: {
  actualites: Actualite[];
}) {
  const [filtre, setFiltre] = useState<Categorie | "tous">("tous");

  const actualitesFiltrees =
    filtre === "tous"
      ? actualites
      : actualites.filter(
          (a) =>
            a.categorie === filtre ||
            a.categorie.toLowerCase().replace(/[^a-z]/g, "") ===
              filtre.toLowerCase().replace(/[^a-z]/g, "")
        );

  return (
    <>
      <Header />

      <main id="main-content">
      {/* Titre + introduction */}
      <section className="relative overflow-hidden bg-muted px-6 py-20 text-center md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -bottom-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl">
            Actualités
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Suivez les dernières nouvelles de l&apos;Association Jeunes Actifs :
            projets réalisés, événements à venir, partenariats et actions sur le
            terrain dans la région de l&apos;Oriental.
          </p>
        </div>
      </section>

      {/* Filtres par catégorie */}
      <section className="bg-muted px-6 pb-8">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.valeur}
              onClick={() => setFiltre(cat.valeur)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                filtre === cat.valeur
                  ? "bg-primary text-white shadow-md"
                  : "border border-muted bg-background text-muted-foreground shadow-sm hover:border-primary hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grille d'actualités */}
      <section className="px-6 py-14 md:py-16">
        <h2 className="sr-only">Dernières actualités</h2>
        {actualites.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Aucune actualité pour le moment. Revenez bientôt !
          </p>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {actualitesFiltrees.map((article) => (
              <div
                key={article.id}
                className="rounded-2xl border border-muted bg-background p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    {categorieLabel[article.categorie as Categorie] ?? article.categorie}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(article.created_at)}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{article.titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {article.extrait}
                </p>
              </div>
            ))}
          </div>
        )}

        {actualites.length > 0 && actualitesFiltrees.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Aucune actualité dans cette catégorie pour le moment.
          </p>
        )}
      </section>

      {/* Appel à l&apos;action */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto max-w-2xl rounded-3xl bg-primary px-8 py-12 text-center text-white shadow-lg md:px-14 md:py-16">
          <h2 className="text-2xl font-bold md:text-3xl">
            Vous souhaitez suivre nos actions ?
          </h2>
          <p className="mt-4 text-green-100">
            Contactez-nous ou devenez membre de l&apos;association pour être
            informé de nos prochaines activités et événements.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/devenir-membre"
              className="rounded-lg bg-white px-8 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-green-50"
            >
              Devenir membre
            </Link>
            <Link
              href="/contact"
              className="rounded-lg border border-white/40 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
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
