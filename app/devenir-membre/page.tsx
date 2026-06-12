import AdhesionForm from "./AdhesionForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Devenir membre | Association Jeunes Actifs",
  description:
    "Rejoignez l'Association Jeunes Actifs et engagez-vous dans des projets socio-culturels et environnementaux dans la région de l'Oriental.",
};

export default function DevenirMembre() {
  return (
    <>
      <Header />

      {/* Titre + introduction */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold">Devenir membre</h1>
          <p className="mt-4 text-muted-foreground">
            Rejoignez l&apos;Association Jeunes Actifs et engagez-vous auprès des
            étudiants de l&apos;Oriental. Ensemble, nous portons des projets
            socio-culturels et environnementaux qui transforment notre région.
          </p>
        </div>
      </section>

      {/* Avantages + Missions */}
      <section className="bg-muted px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Avantages */}
          <div className="rounded-xl bg-background p-8 shadow-sm">
            <h2 className="text-xl font-bold">Pourquoi rejoindre ?</h2>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="mt-0.5 text-primary">✓</span>
                <span>Développer vos compétences en gestion de projets, communication et leadership</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-primary">✓</span>
                <span>Construire un réseau étudiant et professionnel dans l&apos;Oriental</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-primary">✓</span>
                <span>Avoir un impact réel sur votre communauté et votre territoire</span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 text-primary">✓</span>
                <span>Obtenir un certificat de bénévolat valorisable dans votre parcours</span>
              </li>
            </ul>
          </div>

          {/* Missions */}
          <div className="rounded-xl bg-background p-8 shadow-sm">
            <h2 className="text-xl font-bold">Missions possibles</h2>
            <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary">🤝</span>
                <span>Actions sociales — collectes, maraudes, projets solidaires</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">🎭</span>
                <span>Activités culturelles — événements, expositions, rencontres</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">🌿</span>
                <span>Sensibilisation environnementale — campagnes et nettoyages</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">📅</span>
                <span>Événements étudiants — forums, journées thématiques</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary">📖</span>
                <span>Formations et ateliers — leadership, communication, gestion</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Formulaire d'adhésion */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold">Formulaire d&apos;adhésion</h2>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            Remplissez ce formulaire pour soumettre votre demande d&apos;adhésion.
          </p>
          <AdhesionForm />
        </div>
      </section>

      <Footer />
    </>
  );
}
