"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import frMessages from "@/messages/admin/fr.json";
import enMessages from "@/messages/admin/en.json";
import arMessages from "@/messages/admin/ar.json";

/**
 * Langue de l'INTERFACE admin — indépendante à dessein de :
 *  - la langue du contenu éditorial (onglets FR/EN/AR des formulaires,
 *    voir TranslatedFields.tsx, jamais affectés par ce provider) ;
 *  - la langue publique du site (/fr /en /ar), puisque /admin n'est
 *    volontairement pas routé par locale (voir proxy.ts et le layout admin).
 *
 * Même architecture que ThemeProvider (clé localStorage dédiée,
 * useSyncExternalStore, événement custom pour la synchro même-onglet) —
 * délibérément un fichier de messages next-intl SÉPARÉ des messages
 * publics (messages/admin/*.json, pas messages/*.json) pour ne jamais
 * charger dans le bundle admin le contenu public (home, actualités...)
 * dont il n'a pas l'usage.
 */

export type AdminLocale = "fr" | "en" | "ar";

const STORAGE_KEY = "admin-locale";
const ADMIN_LOCALE_CHANGE_EVENT = "canopee-admin-locale-change";

const MESSAGES: Record<AdminLocale, Record<string, unknown>> = {
  fr: frMessages,
  en: enMessages,
  ar: arMessages,
};

function isAdminLocale(value: string | null): value is AdminLocale {
  return value === "fr" || value === "en" || value === "ar";
}

function subscribe(callback: () => void) {
  window.addEventListener(ADMIN_LOCALE_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(ADMIN_LOCALE_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot(): AdminLocale {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isAdminLocale(stored) ? stored : "fr";
}

function getServerSnapshot(): AdminLocale {
  return "fr";
}

function applyChrome(locale: AdminLocale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
}

const AdminLocaleContext = createContext<{
  locale: AdminLocale;
  setLocale: (locale: AdminLocale) => void;
} | null>(null);

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    applyChrome(locale);
  }, [locale]);

  const setLocale = useCallback((next: AdminLocale) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(ADMIN_LOCALE_CHANGE_EVENT));
  }, []);

  return (
    <AdminLocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]}>
        {children}
      </NextIntlClientProvider>
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale() {
  const ctx = useContext(AdminLocaleContext);
  if (!ctx) throw new Error("useAdminLocale must be used within an AdminLocaleProvider");
  return ctx;
}
