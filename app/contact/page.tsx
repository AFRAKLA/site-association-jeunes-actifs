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
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold">Contactez-nous</h1>
          <p className="mt-4 text-muted-foreground">
            Une question, une suggestion ou envie de rejoindre l&apos;Association
            Jeunes Actifs ? N&apos;hésitez pas à nous écrire.
          </p>
        </div>
      </section>

      {/* Coordonnées + Réseaux sociaux */}
      <section className="bg-muted px-6 py-16">
        <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
          {/* Coordonnées */}
          <div className="rounded-xl bg-background p-8 shadow-sm">
            <h2 className="text-xl font-bold">Nos coordonnées</h2>
            <div className="mt-6 space-y-4 text-sm text-muted-foreground">
              <div>
                <span className="font-semibold text-foreground">Adresse</span>
                <p>Région de l&apos;Oriental, Maroc</p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Email</span>
                <p><a href="mailto:contact@jeunes-actifs.ma" className="text-primary hover:underline">contact@jeunes-actifs.ma</a></p>
              </div>
              <div>
                <span className="font-semibold text-foreground">Téléphone</span>
                <p>Disponible prochainement</p>
              </div>
            </div>
          </div>

          {/* Réseaux sociaux */}
          <div className="rounded-xl bg-background p-8 shadow-sm">
            <h2 className="text-xl font-bold">Suivez-nous</h2>
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
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold">Envoyez-nous un message</h2>
          <ContactForm />
        </div>
      </section>
      </main>

      <Footer />
    </>
  );
}
