"use client";

import Link from "next/link";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Categorie = "environnement" | "culture" | "solidarite" | "formations";

interface Photo {
  id: string;
  titre: string;
  categorie: Categorie;
  description: string;
  image_url: string;
  created_at: string;
}

const categories: { valeur: Categorie | "tous"; label: string }[] = [
  { valeur: "tous", label: "Tous" },
  { valeur: "environnement", label: "Environnement" },
  { valeur: "culture", label: "Culture" },
  { valeur: "solidarite", label: "Solidarité" },
  { valeur: "formations", label: "Formations" },
];

const categorieBadge: Record<Categorie, { label: string; emoji: string }> = {
  environnement: { label: "Environnement", emoji: "🌿" },
  culture: { label: "Culture", emoji: "🎭" },
  solidarite: { label: "Solidarité", emoji: "🤝" },
  formations: { label: "Formations", emoji: "📖" },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function GalerieContent({ photos }: { photos: Photo[] }) {
  const [filtre, setFiltre] = useState<Categorie | "tous">("tous");

  const photosFiltrees =
    filtre === "tous"
      ? photos
      : photos.filter((p) => p.categorie === filtre);

  return (
    <>
      <Header />

      <main id="main-content">
      {/* Titre + introduction */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold">Galerie</h1>
          <p className="mt-4 text-muted-foreground">
            Découvrez les moments forts de nos actions et événements dans la
            région de l&apos;Oriental.
          </p>
        </div>
      </section>

      {/* Filtres par catégorie */}
      <section className="px-6 pb-4">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.valeur}
              onClick={() => setFiltre(cat.valeur)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                filtre === cat.valeur
                  ? "bg-primary text-white shadow-md"
                  : "border border-muted bg-background text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grille de cartes */}
      <section className="px-6 py-10">
        {photos.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-xl border border-primary/20 bg-primary/5 px-6 py-4 text-center">
            <p className="text-sm text-primary">
              📸 Les photos officielles de nos actions seront ajoutées prochainement.
              En attendant, découvrez nos activités sur notre page Instagram.
            </p>
          </div>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photosFiltrees.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-xl border border-muted bg-background shadow-sm transition hover:shadow-md"
              >
                {/* Zone image */}
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.image_url}
                    alt={photo.titre}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Contenu de la carte */}
                <div className="p-5">
                  <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {categorieBadge[photo.categorie as Categorie]?.emoji ?? ""}{" "}
                    {categorieBadge[photo.categorie as Categorie]?.label ?? photo.categorie}
                  </span>
                  <h3 className="mt-3 font-semibold">{photo.titre}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {photo.description}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(photo.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {photos.length > 0 && photosFiltrees.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            Aucune photo dans cette catégorie pour le moment.
          </p>
        )}
      </section>

      {/* Suivez-nous sur Instagram */}
      <section className="bg-muted px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">Suivez-nous sur Instagram</h2>
          <p className="mt-4 text-muted-foreground">
            Retrouvez nos photos, vidéos et stories en temps réel sur notre page Instagram.
            Suivez l&apos;actualité de l&apos;association au quotidien.
          </p>
          <a
            href="https://www.instagram.com/asso_jeunesactifs/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-lg border border-muted bg-background px-6 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            Voir notre page Instagram
          </a>
        </div>
      </section>

      {/* Appel à l&apos;action */}
      <section className="bg-primary px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">
            Envie de faire partie de l&apos;aventure ?
          </h2>
          <p className="mt-4 text-green-100">
            Rejoignez l&apos;Association Jeunes Actifs et participez à nos
            prochaines actions sur le terrain.
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
