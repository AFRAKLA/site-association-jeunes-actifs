import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/a-propos", label: "À propos" },
  { href: "/activites", label: "Activités" },
  { href: "/evenements", label: "Événements" },
  { href: "/actualites", label: "Actualités" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
  { href: "/devenir-membre", label: "Devenir membre" },
];

export default function Footer() {
  return (
    <footer className="border-t border-muted bg-muted/50 px-6 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        {/* Logo + description */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            <Image
              src="/images/logo-jeunes-actifs-cropped.jpeg"
              alt="Logo Jeunes Actifs"
              width={40}
              height={40}
              className="h-9 w-9 rounded object-contain"
            />
            <span className="text-base font-bold text-foreground">
              Jeunes Actifs
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Association socio-culturelle et environnementale dans la région de
            l&apos;Oriental au Maroc. Portée par des étudiants engagés.
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">Navigation</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Nous suivre */}
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Nous suivre
          </h3>
          <p className="mt-3 text-sm text-muted-foreground">
            Retrouvez-nous sur les réseaux sociaux.
          </p>
          <div className="mt-4 flex gap-4">
            <a
              href="https://www.instagram.com/asso_jeunesactifs/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex items-center gap-2 rounded-lg border border-muted bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
            <a
              href="https://www.facebook.com/share/1ECFbe4Nd9/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex items-center gap-2 rounded-lg border border-muted bg-background px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mx-auto mt-10 max-w-6xl border-t border-muted pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Association Jeunes Actifs — Oriental,
          Maroc. Tous droits réservés.{" "}
          <Link
            href="/mentions-legales"
            className="transition hover:text-primary"
          >
            Mentions légales
          </Link>
        </p>
      </div>
    </footer>
  );
}
