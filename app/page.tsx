import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Accueil | Association Jeunes Actifs",
  description:
    "Association socio-culturelle et environnementale dans la région de l'Oriental au Maroc. Actions solidaires, culturelles et environnementales portées par des étudiants engagés.",
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
    lieu: string;
    description: string;
  }[] = [];

  try {
    const { data: evtData } = await supabase
      .from("evenements")
      .select("id, titre, date_evenement, lieu, description")
      .eq("statut", "publie")
      .order("created_at", { ascending: false })
      .limit(3);
    derniersEvenements = evtData ?? [];
  } catch {
    /* fallback : tableau vide */
  }

  return (
    <>
      <Header />

      {/* Hero */}
      <section id="hero" className="flex flex-col items-center justify-center px-6 py-24 text-center md:py-36">
        <h1 className="max-w-3xl text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
          Une jeunesse engagée au cœur de{" "}
          <span className="text-primary">l&apos;Oriental</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          L&apos;Association Jeunes Actifs est une association socio-culturelle et
          environnementale basée dans la région de l&apos;Oriental au Maroc. Nous
          rassemblons des étudiants de l&apos;enseignement supérieur autour
          d&apos;actions concrètes pour un avenir solidaire et durable.
        </p>
        <a
          href="#rejoindre"
          className="mt-10 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark"
        >
          Rejoignez-nous
        </a>
      </section>

      {/* À propos */}
      <section id="about" className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold">À propos de nous</h2>
          <p className="mx-auto mt-6 max-w-2xl text-muted-foreground leading-relaxed">
            Née dans la région de l&apos;Oriental au Maroc, l&apos;Association Jeunes
            Actifs regroupe des étudiants de l&apos;enseignement supérieur engagés
            dans des actions socio-culturelles et environnementales. Nous
            croyons que la jeunesse est un moteur de changement pour notre
            communauté et notre territoire.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <ValueCard
              title="Socio-culturel"
              description="Nous organisons des activités culturelles et des événements qui rassemblent les jeunes et valorisent le patrimoine de l'Oriental."
            />
            <ValueCard
              title="Environnement"
              description="Nous menons des actions de sensibilisation environnementale pour protéger notre région et promouvoir les éco-gestes."
            />
            <ValueCard
              title="Solidarité"
              description="Nous développons des actions sociales en faveur des populations locales et encourageons le bénévolat chez les étudiants."
            />
          </div>
        </div>
      </section>

      {/* Nos actions */}
      <section id="actions" className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">Nos actions</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Découvrez les initiatives qui font vivre notre association au
            quotidien dans la région de l&apos;Oriental.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <ActionCard
              title="Actions sociales"
              description="Collectes, maraudes et projets solidaires en faveur des populations locales de l'Oriental."
              icon="heart"
            />
            <ActionCard
              title="Activités culturelles"
              description="Événements, expositions et rencontres qui célèbrent la culture locale et rapprochent les communautés."
              icon="star"
            />
            <ActionCard
              title="Environnement"
              description="Campagnes de sensibilisation, nettoyages et ateliers pour protéger l'environnement dans notre région."
              icon="leaf"
            />
            <ActionCard
              title="Formations et ateliers"
              description="Ateliers pratiques pour développer les compétences des étudiants : leadership, communication et gestion de projets."
              icon="book"
            />
          </div>
        </div>
      </section>

      {/* Événements récents */}
      <section id="evenements" className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">Événements récents</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Retrouvez nos derniers événements organisés dans la région de
            l&apos;Oriental.
          </p>
          {derniersEvenements.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {derniersEvenements.map((evt) => (
                <EventCard
                  key={evt.id}
                  date_evenement={evt.date_evenement}
                  titre={evt.titre}
                  lieu={evt.lieu}
                  description={evt.description}
                />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-sm text-muted-foreground">
              Aucun événement pour le moment.
            </p>
          )}
        </div>
      </section>

      {/* Témoignages — contenu temporaire, à remplacer par de vrais témoignages validés par l'association */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">Ils s&apos;engagent avec nous</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Découvrez les parcours de nos bénévoles et membres actifs.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <TemoignageCard
              initiales="S"
              prenom="Sara"
              role="Bénévole — étudiante en biologie"
              temoignage="Rejoindre les Jeunes Actifs m'a permis de participer à des actions concrètes pour l'environnement tout en rencontrant des étudiants passionnés. Le nettoyage du Parc Lalla Aïcha restera un de mes meilleurs souvenirs."
            />
            <TemoignageCard
              initiales="Y"
              prenom="Youssef"
              role="Membre actif — étudiant en droit"
              temoignage="L'association m'a appris à organiser des événements et à travailler en équipe. La formation en gestion de projets m'a été utile même dans mes études. Je recommande à tous les étudiants de s'engager."
            />
            <TemoignageCard
              initiales="N"
              prenom="Nadia"
              role="Bénévole — étudiante en lettres"
              temoignage="La soirée culturelle sur le patrimoine musical de l'Oriental était magnifique. C'est formidable de voir des jeunes s'investir pour valoriser la culture de notre région."
            />
          </div>
        </div>
      </section>

      {/* Partenaires — réseau en construction, types de partenaires uniquement */}
      <section className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">Un réseau local en construction</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            L&apos;association développe progressivement son réseau de partenaires
            dans la région de l&apos;Oriental. Nous collaborons avec différents
            acteurs locaux pour renforcer l&apos;impact de nos actions.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <PartenaireCard
              emoji="🎓"
              titre="Établissements d&apos;enseignement supérieur"
              description="Universités et écoles avec lesquelles nous organisons des événements et des formations."
            />
            <PartenaireCard
              emoji="🤝"
              titre="Associations locales"
              description="Acteurs associatifs de la région avec qui nous menons des actions communes."
            />
            <PartenaireCard
              emoji="🏛"
              titre="Acteurs institutionnels"
              description="Collectivités et institutions qui soutiennent nos projets citoyens et environnementaux."
            />
            <PartenaireCard
              emoji="🌿"
              titre="Partenaires culturels et environnementaux"
              description="Organisations engagées dans la culture et la protection de l&apos;environnement dans l&apos;Oriental."
            />
          </div>
          <Link
            href="/contact"
            className="mt-10 inline-block rounded-full border border-primary px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Proposer un partenariat
          </Link>
        </div>
      </section>

      {/* Dernières actualités */}
      <section id="actualites" className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">Dernières actualités</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Suivez les nouvelles de l&apos;association et de nos projets en cours.
          </p>
          {derniersArticles.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {derniersArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  categorie={article.categorie}
                  titre={article.titre}
                  extrait={article.extrait}
                  created_at={article.created_at}
                />
              ))}
            </div>
          ) : (
            <p className="mt-12 text-sm text-muted-foreground">
              Aucune actualité pour le moment.
            </p>
          )}
          <Link
            href="/actualites"
            className="mt-10 inline-block rounded-full border border-primary px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Voir toutes les actualités
          </Link>
        </div>
      </section>

      {/* Nous soutenir */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">Nous soutenir</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Vous souhaitez contribuer à nos actions ? Il existe plusieurs façons
            de soutenir l&apos;association, même sans devenir membre.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SoutienCard
              emoji="🙋"
              titre="Devenir bénévole"
              description="Engagez-vous sur le terrain lors de nos actions solidaires, culturelles et environnementales."
              href="/devenir-membre"
              label="Rejoindre l&apos;équipe"
            />
            <SoutienCard
              emoji="📦"
              titre="Faire un don matériel"
              description="Contribuez en fournitures, équipements ou matériel pour nos actions et événements."
              href="/contact"
              label="Nous contacter"
            />
            <SoutienCard
              emoji="💚"
              titre="Soutenir financièrement"
              description="Contribuez au financement de nos actions. Contactez-nous pour connaître les modalités validées par l&apos;association."
              href="/contact"
              label="En savoir plus"
            />
            <SoutienCard
              emoji="🤝"
              titre="Proposer un partenariat"
              description="Rejoignez notre réseau de partenaires locaux et contribuez au développement de la région."
              href="/contact"
              label="Proposer un partenariat"
            />
          </div>
        </div>
      </section>

      <section id="galerie" className="bg-muted px-6 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold">Galerie</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Retrouvez les moments forts de nos actions et événements dans la région de l&apos;Oriental.
          </p>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <GaleriePreviewCard emoji="🌿" titre="Environnement" description="Nettoyages, sensibilisation et sorties éducatives." />
            <GaleriePreviewCard emoji="🎭" titre="Culture" description="Soirées, ateliers et célébrations du patrimoine local." />
            <GaleriePreviewCard emoji="🤝" titre="Solidarité" description="Collectes, distributions et actions sociales." />
            <GaleriePreviewCard emoji="📖" titre="Formations" description="Ateliers pratiques et cycles de formation." />
          </div>
          <p className="mt-8 text-sm text-muted-foreground">
            📸 Les photos officielles de nos actions seront ajoutées prochainement.
          </p>
          <Link
            href="/galerie"
            className="mt-6 inline-block rounded-full border border-primary px-8 py-3 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Voir la galerie complète
          </Link>
        </div>
      </section>

      {/* Rejoindre */}
      <section id="rejoindre" className="bg-primary px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Engagez-vous avec nous</h2>
          <p className="mx-auto mt-4 max-w-xl text-green-100">
            Vous êtes étudiant dans l&apos;enseignement supérieur et vous souhaitez
            vous investir dans le bénévolat ? Rejoignez l&apos;Association Jeunes
            Actifs et participez à des projets socio-culturels et
            environnementaux qui ont un impact réel dans la région de
            l&apos;Oriental.
          </p>
          <Link
            href="/devenir-membre"
            className="mt-10 inline-block rounded-full bg-white px-8 py-3 text-sm font-semibold text-primary shadow-md transition hover:bg-green-50"
          >
            Devenir bénévole
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

/* --- Composants utilitaires --- */

function ValueCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-background p-6 shadow-sm">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: "heart" | "star" | "leaf" | "book";
}) {
  return (
    <div className="rounded-xl border border-muted bg-background p-6 text-left shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary text-lg">
        <ActionEmoji icon={icon} />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function ActionEmoji({ icon }: { icon: string }) {
  const map: Record<string, string> = {
    heart: "🤝",
    star: "🎭",
    leaf: "🌿",
    book: "📖",
  };
  return <span>{map[icon] ?? ""}</span>;
}

function EventCard({
  date_evenement,
  titre,
  lieu,
  description,
}: {
  date_evenement: string;
  titre: string;
  lieu: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-background p-6 text-left shadow-sm">
      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
        {date_evenement}
      </span>
      <h3 className="mt-3 font-semibold">{titre}</h3>
      <p className="mt-1 text-xs text-primary">{lieu}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function NewsCard({
  categorie,
  titre,
  extrait,
  created_at,
}: {
  categorie: string;
  titre: string;
  extrait: string;
  created_at: string;
}) {
  const categorieLabels: Record<string, string> = {
    environnement: "Environnement",
    culture: "Culture",
    solidarite: "Solidarité",
    formation: "Formation",
    "vie-associative": "Vie associative",
  };

  return (
    <div className="rounded-xl border border-muted bg-background p-6 text-left shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
          {categorieLabels[categorie] ?? categorie}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Date(created_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <h3 className="mt-3 font-semibold">{titre}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {extrait}
      </p>
    </div>
  );
}

function GaleriePreviewCard({
  emoji,
  titre,
  description,
}: {
  emoji: string;
  titre: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-muted bg-background p-6 text-center shadow-sm transition hover:shadow-md">
      <span className="text-3xl">{emoji}</span>
      <h3 className="mt-3 text-sm font-semibold">{titre}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function PartenaireCard({
  emoji,
  titre,
  description,
}: {
  emoji: string;
  titre: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-background p-6 text-center shadow-sm">
      <span className="text-3xl">{emoji}</span>
      <h3 className="mt-3 text-sm font-semibold">{titre}</h3>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function TemoignageCard({
  initiales,
  prenom,
  role,
  temoignage,
}: {
  initiales: string;
  prenom: string;
  role: string;
  temoignage: string;
}) {
  return (
    <div className="rounded-xl border border-muted bg-background p-6 text-left shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
          {initiales}
        </div>
        <div>
          <h3 className="font-semibold">{prenom}</h3>
          <p className="text-xs text-muted-foreground">{role}</p>
        </div>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        &ldquo;{temoignage}&rdquo;
      </p>
    </div>
  );
}

function SoutienCard({
  emoji,
  titre,
  description,
  href,
  label,
}: {
  emoji: string;
  titre: string;
  description: string;
  href: string;
  label: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-muted bg-background p-6 text-left shadow-sm">
      <span className="text-3xl">{emoji}</span>
      <h3 className="mt-3 font-semibold">{titre}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Link
        href={href}
        className="mt-4 inline-block rounded-lg bg-primary/10 px-4 py-2 text-center text-sm font-medium text-primary transition hover:bg-primary hover:text-white"
      >
        {label}
      </Link>
    </div>
  );
}
