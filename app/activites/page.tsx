import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Activités | Association Jeunes Actifs",
  description:
    "Actions sociales, culturelles, environnementales, formations et projets communautaires menés par l'association dans la région de l'Oriental au Maroc.",
};

const activites = [
  {
    titre: "Actions sociales et solidaires",
    description:
      "Nous menons des actions en faveur des populations vulnérables de l'Oriental à travers des collectes, des maraudes et des projets solidaires.",
    exemple: "Collecte de vêtements et de denrées pour les familles nécessiteuses pendant le mois de Ramadan.",
  },
  {
    titre: "Activités culturelles",
    description:
      "Nous organisons des événements qui célèbrent le patrimoine culturel de l'Oriental et rapprochent les communautés.",
    exemple: "Soirée musicale dédiée aux traditions artistiques de la région avec la participation d'artistes locaux.",
  },
  {
    titre: "Sensibilisation environnementale",
    description:
      "Nous menons des campagnes de sensibilisation et des actions concrètes pour protéger l'environnement dans notre région.",
    exemple: "Journée de nettoyage du Parc Lalla Aïcha à Oujda avec la participation de 80 bénévoles étudiants.",
  },
  {
    titre: "Formations et ateliers",
    description:
      "Nous proposons des ateliers pratiques pour développer les compétences des étudiants en leadership, communication et gestion de projets.",
    exemple: "Cycle de formation de 3 jours sur la planification et le budget de projets associatifs.",
  },
  {
    titre: "Événements étudiants",
    description:
      "Nous créons des espaces d'échange et de rencontre entre étudiants de l'enseignement supérieur de l'Oriental.",
    exemple: "Forum annuel de l'engagement associatif à l'Université Mohammed Ier d'Oujda.",
  },
  {
    titre: "Bénévolat",
    description:
      "Nous encourageons et encadrons l'engagement bénévole des étudiants dans des projets qui ont un impact réel sur le terrain.",
    exemple: "Programme de bénévolat régulier avec des missions hebdomadaires dans les quartiers prioritaires.",
  },
  {
    titre: "Projets communautaires",
    description:
      "Nous concevons et mettons en œuvre des projets de développement local en collaboration avec les acteurs de la région.",
    exemple: "Projet de création d'un jardin partagé dans un quartier de la ville d'Oujda.",
  },
];

export default function Activites() {
  return (
    <>
      <Header />

      {/* Titre + introduction */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold">Nos activités</h1>
          <p className="mt-4 text-muted-foreground">
            L&apos;Association Jeunes Actifs agit sur plusieurs fronts pour
            accompagner les jeunes de l&apos;Oriental et contribuer au
            développement de la région. Découvrez nos domaines d&apos;action.
          </p>
        </div>
      </section>

      {/* Grille d'activités */}
      <section className="bg-muted px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {activites.map((a) => (
            <div
              key={a.titre}
              className="rounded-xl bg-background p-6 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">{a.titre}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {a.description}
              </p>
              <p className="mt-3 rounded-lg bg-primary/5 px-3 py-2 text-xs leading-relaxed text-primary">
                Exemple : {a.exemple}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="bg-primary px-6 py-16 text-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Envie d&apos;agir avec nous ?</h2>
          <p className="mt-4 text-green-100">
            Rejoignez l&apos;Association Jeunes Actifs et participez à nos
            activités socio-culturelles et environnementales dans l&apos;Oriental.
          </p>
          <Link
            href="/devenir-membre"
            className="mt-8 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary shadow-md transition hover:bg-green-50"
          >
            Devenir membre
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
