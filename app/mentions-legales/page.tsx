import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales | Association Jeunes Actifs",
  description: "Mentions légales du site de l'Association Jeunes Actifs.",
};

export default function MentionsLegales() {
  return (
    <>
      <Header />

      <main id="main-content">
      <section className="px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold">Mentions légales</h1>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Éditeur du site
              </h2>
              <p className="mt-2">
                Association Jeunes Actifs<br />
                Association socio-culturelle et environnementale<br />
                Région de l&apos;Oriental, Maroc
              </p>
              <p className="mt-2">
                Email :{" "}
                <a
                  href="mailto:contact@jeunes-actifs.ma"
                  className="text-primary hover:underline"
                >
                  contact@jeunes-actifs.ma
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Directeur de la publication
              </h2>
              <p className="mt-2">
                Le directeur de la publication est le président de l&apos;Association
                Jeunes Actifs. Les informations de contact complètes peuvent être
                obtenues sur demande via l&apos;adresse email ci-dessus.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Hébergement
              </h2>
              <p className="mt-2">
                Ce site est hébergé par Vercel Inc.<br />
                440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br />
                <a
                  href="https://vercel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  vercel.com
                </a>
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Propriété intellectuelle
              </h2>
              <p className="mt-2">
                L&apos;ensemble du contenu de ce site (textes, images, logos, éléments
                graphiques) est la propriété de l&apos;Association Jeunes Actifs ou de ses
                contributeurs, sauf mention contraire. Toute reproduction, même
                partielle, est soumise à autorisation préalable.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Données personnelles
              </h2>
              <p className="mt-2">
                Les données personnelles collectées via les formulaires de contact
                et d&apos;adhésion sont utilisées uniquement dans le cadre du
                fonctionnement de l&apos;association. Elles ne sont ni transmises à des
                tiers ni utilisées à des fins commerciales.
              </p>
              <p className="mt-2">
                Conformément à la loi 09-08 relative à la protection des personnes
                physiques à l&apos;égard du traitement des données à caractère personnel,
                toute personne peut exercer son droit d&apos;accès, de rectification ou de
                suppression en contactant l&apos;association à l&apos;adresse email indiquée
                ci-dessus.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Responsabilité
              </h2>
              <p className="mt-2">
                L&apos;Association Jeunes Actifs s&apos;efforce de fournir des informations
                exactes et à jour sur ce site. Néanmoins, elle ne peut garantir
                l&apos;exhaustivité ni l&apos;exactitude de toutes les informations diffusées.
                L&apos;association décline toute responsabilité en cas d&apos;erreur ou
                d&apos;omission.
              </p>
            </div>

            <div className="rounded-lg border border-muted bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground">
                Certaines informations légales (numéro d&apos;autorisation, adresse
                complète du siège, etc.) pourront être complétées par
                l&apos;association. Pour toute question, contactez-nous à{" "}
                <a
                  href="mailto:contact@jeunes-actifs.ma"
                  className="text-primary hover:underline"
                >
                  contact@jeunes-actifs.ma
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}
