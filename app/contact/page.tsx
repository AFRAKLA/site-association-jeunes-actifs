import ContactForm from "./ContactForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Association Jeunes Actifs",
  description:
    "Contactez l'Association Jeunes Actifs pour toute question, suggestion ou proposition de collaboration dans la région de l'Oriental.",
};

export default function Contact() {
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
            Contactez-nous
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Une question, une suggestion ou envie de rejoindre l&apos;Association
            Jeunes Actifs ? N&apos;hésitez pas à nous écrire.
          </p>
        </div>
      </section>

      {/* Coordonnées + Réseaux sociaux */}
      <section className="px-6 py-16 md:py-20">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Coordonnées */}
          <div className="rounded-2xl border border-muted bg-background p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Nos coordonnées</h2>
            <div className="mt-6 divide-y divide-muted text-sm">
              <div className="flex gap-3 pb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                  />
                </svg>
                <div>
                  <p className="font-semibold text-foreground">Adresse</p>
                  <p className="mt-0.5 text-muted-foreground">Région de l&apos;Oriental, Maroc</p>
                </div>
              </div>
              <div className="py-4">
                <p className="font-semibold text-foreground">Email</p>
                <p className="mt-0.5">
                  <a href="mailto:contact@jeunes-actifs.ma" className="text-primary hover:underline">
                    contact@jeunes-actifs.ma
                  </a>
                </p>
              </div>
              <div className="pt-4">
                <p className="font-semibold text-foreground">Téléphone</p>
                <p className="mt-0.5 italic text-muted-foreground">Disponible prochainement</p>
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="rounded-2xl border border-muted bg-background p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Suivez-nous</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Retrouvez-nous sur les réseaux sociaux pour suivre nos actualités
              et nos événements.
            </p>
            <div className="mt-6 flex gap-4">
              <a
                href="https://www.facebook.com/share/1ECFbe4Nd9/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-muted px-5 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
              <a
                href="https://www.instagram.com/asso_jeunesactifs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-muted px-5 py-3 text-sm font-medium transition hover:border-primary hover:text-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
                </svg>
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Formulaire de contact */}
      <section className="bg-muted px-6 py-16 md:py-20">
        <div className="mx-auto max-w-2xl rounded-2xl border border-muted bg-background p-8 shadow-sm md:p-10">
          <h2 className="text-center text-2xl font-bold text-foreground md:text-3xl">Envoyez-nous un message</h2>
          <ContactForm />
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}
