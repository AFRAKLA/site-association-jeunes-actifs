import type { Metadata } from "next";
import { geistSans, geistMono } from "@/lib/fonts";
import ThemeScript from "@/components/ThemeScript";
import { ThemeProvider } from "@/components/ThemeProvider";
import AdminLocaleScript from "@/components/admin/AdminLocaleScript";
import { AdminLocaleProvider } from "@/components/admin/AdminLocaleProvider";
import "../globals.css";

// Root layout séparé pour la branche /admin depuis que le site public vit
// sous app/[locale]/ (deux arborescences <html> distinctes — "multiple root
// layouts", pattern supporté nativement par l'App Router).
//
// Thème : ThemeProvider/ThemeScript sont RÉUTILISÉS tels quels depuis le
// public (même clé localStorage "theme") — la préférence persiste donc
// automatiquement entre public et admin, sans code de synchronisation
// supplémentaire.
//
// Langue de l'interface admin : indépendante de la langue du contenu
// éditorial (onglets FR/EN/AR des formulaires, jamais affectés) et
// indépendante de l'URL publique /fr /en /ar — l'admin n'est volontairement
// PAS routé par locale (voir AdminLocaleProvider). lang/dir par défaut FR/LTR
// côté serveur ; AdminLocaleScript les corrige avant peinture si une autre
// préférence est stockée, exactement comme ThemeScript pour data-theme.
export const metadata: Metadata = {
  title: "Association Jeunes Actifs",
  description: "Ensemble pour une jeunesse engagée, solidaire et responsable.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      dir="ltr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
        <AdminLocaleScript />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-admin-forest focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-admin-ivory focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        <ThemeProvider>
          <AdminLocaleProvider>{children}</AdminLocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
