"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

const NAV_KEYS = [
  { href: "/", key: "accueil" },
  { href: "/a-propos", key: "aPropos" },
  { href: "/activites", key: "activites" },
  { href: "/actualites", key: "actualites" },
  { href: "/evenements", key: "evenements" },
  { href: "/galerie", key: "galerie" },
  { href: "/contact", key: "contact" },
] as const;

export default function Header() {
  const t = useTranslations("common.nav");
  const tHeader = useTranslations("header");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastPathname, setLastPathname] = useState(pathname);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Ferme le menu mobile au changement de route. Ajustement pendant le
  // rendu plutôt qu'un effet séparé, pour éviter un rendu en cascade
  // (voir react-hooks/set-state-in-effect).
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-300 ease-out-strong ${
        scrolled
          ? "border-champagne-soft/70 bg-background/95 shadow-[0_1px_16px_-4px_rgba(20,48,31,0.12)] backdrop-blur"
          : "border-transparent bg-background/70 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/images/logo-symbole-jeunes-actifs.png"
            alt="Jeunes Actifs"
            width={323}
            height={394}
            priority
            className="h-9 w-auto"
          />
          <span className="hidden text-[17px] font-semibold tracking-tight text-ink sm:inline">
            Jeunes Actifs
          </span>
        </Link>

        {/* Navigation desktop */}
        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_KEYS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group relative px-2.5 py-2 text-sm font-medium transition-colors duration-150 ${
                  isActive ? "text-ink" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {t(link.key)}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 -bottom-0.5 h-px bg-champagne transition-transform duration-200 ease-out-strong ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-1 lg:flex">
            <ThemeToggle variant="popover" />
            <LanguageSwitcher variant="popover" />
          </div>

          {/* Don — uniquement à partir de xl : à lg (1024px), nav + bascules
              thème/langue + "Devenir membre" saturent déjà la largeur
              disponible (vérifié : ajouter ce bouton dès lg provoque un
              débordement horizontal réel à 1024px). */}
          <Link
            href="/contact"
            className="ms-1 hidden items-center gap-1.5 whitespace-nowrap rounded-full bg-forest px-4 py-2 text-sm font-medium text-ivory transition duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-forest-light xl:inline-flex"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
            {tHeader("donate")}
          </Link>

          <Link
            href="/devenir-membre"
            className="ms-1 hidden whitespace-nowrap rounded-full border border-forest/25 px-4 py-2 text-sm font-medium text-ink transition duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-forest hover:text-ivory sm:inline-block"
          >
            {tHeader("cta")}
          </Link>

          {/* Bouton hamburger mobile */}
          <button
            className="rounded-lg p-1.5 text-ink lg:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? tHeader("closeMenu") : tHeader("openMenu")}
            aria-expanded={menuOpen}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menu mobile déroulant */}
      <div
        aria-hidden={!menuOpen}
        className={`overflow-hidden border-t transition-[grid-template-rows] duration-300 ease-out-strong lg:hidden ${
          menuOpen ? "border-champagne-soft/70" : "border-transparent"
        }`}
        style={{
          display: "grid",
          gridTemplateRows: menuOpen ? "1fr" : "0fr",
        }}
      >
        <div className={`min-h-0 ${menuOpen ? "" : "pointer-events-none"}`}>
          <nav className="flex flex-col gap-0.5 bg-surface px-6 py-4">
            {NAV_KEYS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={menuOpen ? undefined : -1}
                  className={`flex min-h-11 items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                    isActive ? "bg-forest/5 text-ink" : "text-muted-foreground hover:bg-forest/5 hover:text-ink"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
            <Link
              href="/contact"
              tabIndex={menuOpen ? undefined : -1}
              className="mt-2 flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-forest px-3 py-2.5 text-center text-sm font-medium text-ivory transition-colors duration-150 hover:bg-forest-light"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" aria-hidden="true">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {tHeader("donate")}
            </Link>

            <Link
              href="/devenir-membre"
              tabIndex={menuOpen ? undefined : -1}
              className="mt-2 flex min-h-11 items-center justify-center rounded-lg border border-forest/25 px-3 py-2.5 text-center text-sm font-medium text-ink transition-colors duration-150 hover:bg-forest/5"
            >
              {tHeader("cta")}
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-champagne-soft/60 pt-4">
              <ThemeToggle variant="inline" />
              <LanguageSwitcher variant="inline" />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
