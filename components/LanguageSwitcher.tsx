"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const SHORT_LABEL: Record<string, string> = { fr: "FR", en: "EN", ar: "AR" };

/**
 * Sélecteur de langue Canopée — FR / EN / العربية, pas de drapeaux. Change
 * de langue en restant sur la même page (next-intl réécrit le même
 * pathname sous la nouvelle locale) ; la préférence est ensuite conservée
 * par le cookie NEXT_LOCALE posé automatiquement par le middleware.
 * `variant="inline"` reproduit le même patron que ThemeToggle pour le menu
 * mobile déroulant.
 */
export default function LanguageSwitcher({ variant }: { variant: "popover" | "inline" }) {
  const t = useTranslations("language");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (variant === "inline") {
    return (
      <div className="rounded-xl bg-surface-muted p-1" role="radiogroup" aria-label={t("label")}>
        <div className="grid grid-cols-3 gap-1">
          {routing.locales.map((loc) => {
            const active = locale === loc;
            return (
              <Link
                key={loc}
                href={pathname}
                locale={loc}
                role="radio"
                aria-checked={active}
                className={`flex min-h-11 items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 ${
                  active ? "bg-forest text-ivory" : "text-muted-foreground hover:text-ink"
                }`}
              >
                {SHORT_LABEL[loc]}
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("label")}: ${t(locale as "fr" | "en" | "ar")}`}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1 rounded-full px-2.5 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-forest/8 hover:text-ink"
      >
        {SHORT_LABEL[locale]}
      </button>

      <div
        role="menu"
        aria-label={t("label")}
        className={`absolute end-0 top-full z-50 mt-2 w-36 origin-top-end rounded-xl border border-champagne-soft/70 bg-background p-1 shadow-[0_20px_45px_-20px_rgba(20,48,31,0.35)] transition duration-150 ease-out-strong ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {routing.locales.map((loc) => {
          const active = locale === loc;
          return (
            <Link
              key={loc}
              href={pathname}
              locale={loc}
              role="menuitemradio"
              aria-checked={active}
              onClick={() => setOpen(false)}
              className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                active ? "bg-forest/8 text-ink" : "text-muted-foreground hover:bg-forest/6 hover:text-ink"
              }`}
            >
              {t(loc as "fr" | "en" | "ar")}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
