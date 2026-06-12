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
  date_evenement: string;
  lieu: string;
  categorie: string;
  description: string;
  a_venir: boolean;
  created_at: string;
}

export default async function Evenements() {
  let evenements: Evenement[] = [];

  try {
    const { data } = await supabase
      .from("evenements")
      .select("*")
      .eq("statut", "publie")
      .order("created_at", { ascending: false });
    evenements = (data as Evenement[]) ?? [];
  } catch {
    /* fallback : tableau vide */
  }

  return (
    <>
      <Header />

      {/* Titre + introduction */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold">Événements</h1>
          <p className="mt-4 text-muted-foreground">
            Retrouvez les événements organisés par l&apos;Association Jeunes Actifs
            dans la région de l&apos;Oriental : forums, ateliers, formations et
            soirées culturelles.
          </p>
        </div>
      </section>

      {/* Grille d'événements */}
      <section className="bg-muted px-6 py-16">
        {evenements.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            Aucun événement pour le moment. Revenez bientôt !
          </p>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {evenements.map((e) => (
              <div
                key={e.id}
                className="rounded-xl bg-background p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {e.date_evenement}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      e.a_venir
                        ? "bg-green-100 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {e.a_venir ? "À venir" : "Passé"}
                  </span>
                </div>
                <span className="mt-3 inline-block rounded-full bg-primary/5 px-3 py-1 text-xs text-primary">
                  {e.categorie}
                </span>
                <h3 className="mt-3 text-lg font-semibold">{e.titre}</h3>
                <p className="mt-1 text-xs text-primary">{e.lieu}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {e.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pourquoi participer */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold">Pourquoi participer ?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-muted p-6 text-left">
              <h3 className="font-semibold">Développer vos compétences</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Chaque événement est une occasion d&apos;apprendre : communication,
                gestion de projet, travail en équipe.
              </p>
            </div>
            <div className="rounded-xl border border-muted p-6 text-left">
              <h3 className="font-semibold">Rencontrer d&apos;autres jeunes</h3>
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
          <h2 className="text-3xl font-bold">Rejoignez nos prochains événements</h2>
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

      <Footer />
    </>
  );
}
