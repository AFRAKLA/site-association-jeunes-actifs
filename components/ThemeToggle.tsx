"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme, type ThemePreference } from "./ThemeProvider";

const OPTIONS: { value: ThemePreference; icon: "light" | "dark" | "system" }[] = [
  { value: "light", icon: "light" },
  { value: "dark", icon: "dark" },
  { value: "system", icon: "system" },
];

function ThemeIcon({ kind, className }: { kind: "light" | "dark" | "system"; className?: string }) {
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

/**
 * Sélecteur de thème Canopée — discret, jamais d'emoji. `variant="popover"`
 * pour le header desktop (bouton icône + menu compact ancré sur le
 * déclencheur) ; `variant="inline"` pour le menu mobile déroulant (trois
 * options côte à côte, chacune ≥44px de cible tactile, sans popover
 * imbriqué dans un menu déjà ouvert).
 */
export default function ThemeToggle({ variant }: { variant: "popover" | "inline" }) {
  const t = useTranslations("theme");
  const { preference, setPreference } = useTheme();
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
          {OPTIONS.map((opt) => {
            const active = preference === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPreference(opt.value)}
                className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-colors duration-150 ${
                  active ? "bg-forest text-ivory" : "text-muted-foreground hover:text-ink"
                }`}
              >
                <ThemeIcon kind={opt.icon} className="h-4 w-4" />
                {t(opt.value)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const activeOption = OPTIONS.find((o) => o.value === preference) ?? OPTIONS[2];

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("label")}: ${t(activeOption.value)}`}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-forest/8 hover:text-ink"
      >
        <ThemeIcon kind={activeOption.icon} className="h-[18px] w-[18px]" />
      </button>

      <div
        role="menu"
        aria-label={t("label")}
        className={`absolute end-0 top-full z-50 mt-2 w-40 origin-top-end rounded-xl border border-champagne-soft/70 bg-background p-1 shadow-[0_20px_45px_-20px_rgba(20,48,31,0.35)] transition duration-150 ease-out-strong ${
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        {OPTIONS.map((opt) => {
          const active = preference === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="menuitemradio"
              aria-checked={active}
              onClick={() => {
                setPreference(opt.value);
                setOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-start text-sm font-medium transition-colors duration-150 ${
                active ? "bg-forest/8 text-ink" : "text-muted-foreground hover:bg-forest/6 hover:text-ink"
              }`}
            >
              <ThemeIcon kind={opt.icon} className="h-4 w-4 shrink-0" />
              {t(opt.value)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
