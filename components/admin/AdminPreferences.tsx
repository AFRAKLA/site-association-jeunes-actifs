"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useTheme, type ThemePreference } from "@/components/ThemeProvider";
import { useAdminLocale, type AdminLocale } from "./AdminLocaleProvider";

const THEME_OPTIONS: ThemePreference[] = ["system", "light", "dark"];
const LOCALE_OPTIONS: AdminLocale[] = ["fr", "en", "ar"];
const LOCALE_SHORT: Record<AdminLocale, string> = { fr: "FR", en: "EN", ar: "AR" };

function ThemeIcon({ kind, className }: { kind: ThemePreference; className?: string }) {
  if (kind === "light") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="4.25" />
        <path strokeLinecap="round" d="M12 2.75v2M12 19.25v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2.75 12h2M19.25 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    );
  }
  if (kind === "dark") {
    return (
      <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.5 14.44A8.5 8.5 0 119.56 3.5a7 7 0 1010.94 10.94z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="12" rx="1.75" />
      <path strokeLinecap="round" d="M8.5 20h7M12 16.5V20" />
    </svg>
  );
}

function SlidersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h9m4 0h3M4 12h3m4 0h9M4 18h13m4 0h-2" />
      <circle cx="15" cy="6" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="19" cy="18" r="2" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.75" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

// Même patron que ThemeProvider/AdminLocaleProvider (useSyncExternalStore)
// plutôt qu'un useEffect + setState : évite un rendu en cascade au montage
// pour lire un état externe (ici le media query desktop/mobile).
function subscribeDesktop(callback: () => void) {
  const mql = window.matchMedia("(min-width: 768px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getDesktopSnapshot() {
  return window.matchMedia("(min-width: 768px)").matches;
}
function getServerDesktopSnapshot() {
  return false;
}

function OptionRow({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 text-sm transition-colors duration-150 ease-out-strong ${
        active
          ? "bg-admin-champagne/10 font-medium text-admin-ivory"
          : "text-admin-ivory/60 hover:bg-admin-forest-light/40 hover:text-admin-ivory/90"
      }`}
    >
      {icon}
      <span className="flex-1 text-start">{label}</span>
      {active && <CheckIcon className="h-4 w-4 shrink-0 text-admin-champagne" />}
    </button>
  );
}

/**
 * Panneau unique "Préférences" (apparence + langue de l'interface admin) —
 * remplace les deux anciens contrôles côte à côte dans le pied de sidebar.
 * Ne touche ni ThemeProvider ni AdminLocaleProvider : ce composant ne fait
 * que consommer leurs hooks existants (`useTheme`, `useAdminLocale`).
 *
 * Le popover desktop est porté (`createPortal`) dans `document.body` plutôt
 * que rendu en enfant direct de l'<aside> : celui-ci a `overflow-hidden` et
 * `translate-x-0` (donc un containing block pour `position: fixed`), ce qui
 * couperait tout panneau plus large que les 256px de la sidebar. En dessous
 * de 768px, la même préférence s'ouvre en bottom-sheet pleine largeur — un
 * petit popover ancré serait illisible/mal ciblable au doigt sur mobile.
 */
export default function AdminPreferences() {
  const t = useTranslations("preferences");
  const tt = useTranslations("theme");
  const tl = useTranslations("language");
  const { preference, setPreference } = useTheme();
  const { locale, setLocale } = useAdminLocale();

  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ left: number; bottom: number } | null>(null);
  const isDesktop = useSyncExternalStore(subscribeDesktop, getDesktopSnapshot, getServerDesktopSnapshot);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !isDesktop) return;
    function place() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = 288;
      const margin = 12;
      let left = rect.left;
      if (left + width > window.innerWidth - margin) left = window.innerWidth - width - margin;
      if (left < margin) left = margin;
      setCoords({ left, bottom: window.innerHeight - rect.top + 8 });
    }
    place();
    // Un changement de langue peut inverser `dir` (LTR ↔ RTL) et donc faire
    // sauter la sidebar (et le déclencheur) de l'autre côté de l'écran — mais
    // ce flip est appliqué par un `useEffect` PASSIF dans AdminLocaleProvider
    // (mutation directe de `document.documentElement.dir`, hors du rendu
    // React), qui s'exécute après ce useLayoutEffect. Mesurer uniquement ici
    // capture donc encore l'ancienne mise en page. Un second passage au
    // prochain repaint (une fois ce reflow retombé) corrige la position.
    const raf = requestAnimationFrame(place);
    window.addEventListener("resize", place);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
    };
  }, [open, isDesktop, locale]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Sur desktop, le panneau ne monte (via le portail) qu'une fois `coords`
    // calculé par l'effet précédent — attendre ce second rendu avant de
    // chercher `panelRef.current`, sinon la première tentative cible un
    // panneau pas encore dans le DOM.
    if (isDesktop && !coords) return;
    const firstActive = panelRef.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    (firstActive ?? panelRef.current)?.focus();
  }, [open, isDesktop, coords]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  const content = (
    <>
      <div className="mb-3 flex items-center justify-between gap-2 px-1">
        <p className="text-sm font-semibold text-admin-ivory">{t("title")}</p>
        {!isDesktop && (
          <button
            type="button"
            onClick={close}
            aria-label={t("close")}
            className="rounded-lg p-1.5 text-admin-ivory/50 transition-colors duration-150 hover:bg-admin-forest-light/40 hover:text-admin-ivory/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/50"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-admin-ivory/40">
        {t("appearance")}
      </p>
      <div role="radiogroup" aria-label={t("appearance")} className="mb-4 space-y-0.5">
        {THEME_OPTIONS.map((opt) => (
          <OptionRow
            key={opt}
            active={preference === opt}
            onClick={() => setPreference(opt)}
            icon={<ThemeIcon kind={opt} className="h-4 w-4 shrink-0 text-admin-ivory/50" />}
            label={tt(opt)}
          />
        ))}
      </div>

      <p className="mb-1.5 px-1 text-[11px] font-medium uppercase tracking-wide text-admin-ivory/40">
        {t("language")}
      </p>
      <div role="radiogroup" aria-label={t("language")} className="space-y-0.5">
        {LOCALE_OPTIONS.map((loc) => (
          <OptionRow key={loc} active={locale === loc} onClick={() => setLocale(loc)} label={tl(loc)} />
        ))}
      </div>
    </>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${t("trigger")}: ${tl(locale)} · ${tt(preference)}`}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-admin-ivory/60 transition-colors duration-150 hover:bg-admin-forest-light/40 hover:text-admin-ivory/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/50"
      >
        <SlidersIcon className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-start">{t("trigger")}</span>
        <span className="shrink-0 text-xs text-admin-ivory/40">
          {LOCALE_SHORT[locale]} · {tt(preference)}
        </span>
      </button>

      {open &&
        isDesktop &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            role="dialog"
            aria-label={t("title")}
            tabIndex={-1}
            style={{ position: "fixed", left: coords.left, bottom: coords.bottom, width: 288 }}
            className="admin-popover-enter z-50 origin-bottom rounded-2xl border border-admin-champagne-soft/25 bg-admin-forest p-3 shadow-[0_20px_45px_-20px_rgba(20,48,31,0.5)] focus:outline-none"
          >
            {content}
          </div>,
          document.body,
        )}

      {open &&
        !isDesktop &&
        createPortal(
          <>
            <button
              type="button"
              aria-label={t("close")}
              onClick={close}
              className="fixed inset-0 z-40 bg-admin-forest/40 backdrop-blur-[2px]"
            />
            <div
              ref={panelRef}
              role="dialog"
              aria-label={t("title")}
              tabIndex={-1}
              className="admin-sheet-enter fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-admin-champagne-soft/25 bg-admin-forest px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-3 shadow-[0_-20px_45px_-20px_rgba(20,48,31,0.5)] focus:outline-none"
            >
              <div aria-hidden="true" className="mx-auto mb-3 h-1 w-9 rounded-full bg-admin-ivory/20" />
              {content}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
