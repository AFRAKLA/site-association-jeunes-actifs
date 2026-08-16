import { Geist, Geist_Mono } from "next/font/google";

// Chargée une seule fois, réutilisée par les deux root layouts (public
// app/[locale]/layout.tsx et admin app/admin/layout.tsx) depuis que le site
// a deux arborescences <html> distinctes (voir "multiple root layouts").
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
