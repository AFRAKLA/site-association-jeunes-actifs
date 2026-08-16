import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import GrowthMark from "./GrowthMark";

const NAV_KEYS = [
  { href: "/", key: "accueil" },
  { href: "/a-propos", key: "aPropos" },
  { href: "/activites", key: "activites" },
  { href: "/actualites", key: "actualites" },
  { href: "/evenements", key: "evenements" },
  { href: "/galerie", key: "galerie" },
  { href: "/contact", key: "contact" },
  { href: "/devenir-membre", key: "devenirMembre" },
] as const;

export default function Footer() {
  const t = useTranslations("common.nav");
  const tFooter = useTranslations("footer");

  return (
    <footer className="relative overflow-hidden bg-forest px-6 py-14">
      <GrowthMark
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -end-10 h-72 w-72 text-champagne/[0.07] sm:h-96 sm:w-96"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.3fr_1fr_1fr]">
        {/* Identité + phrase associative */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/images/logo-symbole-jeunes-actifs.png"
              alt="Jeunes Actifs"
              width={323}
              height={394}
              className="h-10 w-auto"
            />
            <span className="text-lg font-semibold tracking-tight text-ivory">
              Jeunes Actifs
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/60">
            {tFooter("tagline")}
          </p>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-champagne">
            {tFooter("navTitle")}
          </h3>
          <ul className="mt-4 space-y-2.5">
            {NAV_KEYS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ivory/70 transition-colors duration-150 hover:text-ivory"
                >
                  {t(link.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Nous suivre */}
        <div>
          <h3 className="text-[11px] font-medium uppercase tracking-[0.14em] text-champagne">
            {tFooter("followTitle")}
          </h3>
          <div className="mt-4 flex flex-col gap-2.5">
            <a
              href="https://www.instagram.com/asso_jeunesactifs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 text-sm text-ivory/70 transition-colors duration-150 hover:text-ivory"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
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
              className="inline-flex items-center gap-2.5 text-sm text-ivory/70 transition-colors duration-150 hover:text-ivory"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="relative mx-auto mt-10 max-w-6xl border-t border-ivory/10 pt-6">
        <p className="text-xs text-ivory/45">
          &copy; {new Date().getFullYear()} Association Jeunes Actifs — Oriental,
          Maroc. {tFooter("rights")}{" "}
          <Link href="/mentions-legales" className="transition-colors duration-150 hover:text-ivory/80">
            {tFooter("legal")}
          </Link>
        </p>
      </div>
    </footer>
  );
}
