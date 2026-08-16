import type { Metadata } from "next";
import { geistSans, geistMono } from "@/lib/fonts";
import "../globals.css";

// Root layout séparé pour la branche /admin depuis que le site public vit
// sous app/[locale]/ (deux arborescences <html> distinctes — "multiple root
// layouts", pattern supporté nativement par l'App Router). Comportement de
// l'admin strictement inchangé : toujours en français, thème Canopée fixe,
// aucun sélecteur de langue ni de thème (voir §19 du lot i18n/thèmes).
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
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
        >
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
