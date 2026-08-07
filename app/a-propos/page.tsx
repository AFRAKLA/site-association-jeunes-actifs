import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos | Association Jeunes Actifs",
  description:
    "Découvrez la mission, les valeurs et la vision de l'Association Jeunes Actifs. Une association étudiante engagée dans le développement social et environnemental de l'Oriental.",
};

export default function APropos() {
  return (
    <>
      <Header />

      <main id="main-content">
      {/* Titre + présentation */}
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
            À propos de nous
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            L&apos;Association Jeunes Actifs est une association socio-culturelle et
            environnementale basée dans la région de l&apos;Oriental au Maroc. Fondée
            par des étudiants de l&apos;enseignement supérieur, elle rassemble des
            jeunes engagés désireux de contribuer au développement de leur
            communauté à travers des actions concrètes et durables.
          </p>
        </div>
      </section>

      {/* Notre mission */}
      <section className="bg-muted px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Notre mission</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Notre mission est d&apos;accompagner les jeunes de l&apos;Oriental dans leur
            engagement citoyen en leur offrant un cadre pour agir, apprendre et
            s&apos;épanouir. Nous concevons et mettons en œuvre des projets
            socio-culturels, environnementaux et éducatifs qui répondent aux
            besoins réels de notre territoire, tout en formant la prochaine
            génération de leaders associatifs.
          </p>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Nos valeurs</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Ces principes guident chacune de nos actions et décisions.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            <ValeurCard
              titre="Engagement citoyen"
              description="Nous encourageons chaque jeune à prendre part activement à la vie de sa communauté."
            />
            <ValeurCard
              titre="Solidarité"
              description="Nous agissons ensemble, dans l'entraide et le respect mutuel, pour un impact collectif."
            />
            <ValeurCard
              titre="Culture"
              description="Nous valorisons le patrimoine culturel de l'Oriental et favorisons la créativité chez les jeunes."
            />
            <ValeurCard
              titre="Environnement"
              description="Nous intégrons la protection de l'environnement dans toutes nos initiatives."
            />
            <ValeurCard
              titre="Développement des jeunes"
              description="Nous formons et accompagnons les étudiants pour qu'ils deviennent des acteurs de changement."
            />
          </div>
        </div>
      </section>

      {/* Notre vision */}
      <section className="bg-muted px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Notre vision</h2>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            Nous aspirons à faire de la région de l&apos;Oriental un modèle de
            jeunesse engagée, où chaque étudiant trouve les moyens de
            s&apos;investir dans des projets qui comptent. À long terme, nous
            voulons créer un réseau solide d&apos;anciens membres qui continuent
            à porter les valeurs de solidarité, de culture et d&apos;environnement
            dans leur parcours professionnel et personnel.
          </p>
        </div>
      </section>

      {/* Notre impact */}
      <section className="bg-primary px-6 py-16 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Notre impact</h2>
          <p className="mt-3 text-green-100">
            Quelques chiffres qui illustrent notre action sur le terrain.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <ImpactItem chiffre="50+" label="Actions organisées" />
            <ImpactItem chiffre="200+" label="Jeunes mobilisés" />
            <ImpactItem chiffre="30+" label="Événements réalisés" />
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}

function ValeurCard({
  titre,
  description,
}: {
  titre: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-muted bg-background p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <h3 className="font-semibold text-foreground">{titre}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ImpactItem({ chiffre, label }: { chiffre: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-extrabold md:text-5xl">{chiffre}</div>
      <div className="mt-2 text-sm text-green-100">{label}</div>
    </div>
  );
}
