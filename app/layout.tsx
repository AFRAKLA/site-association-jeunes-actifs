import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Association Jeunes Actifs",
  description:
    "Ensemble pour une jeunesse engagée, solidaire et responsable.",
  openGraph: {
    title: "Association Jeunes Actifs",
    description:
      "Association socio-culturelle et environnementale dans la région de l'Oriental au Maroc. Ensemble pour une jeunesse engagée, solidaire et responsable.",
    url: "https://jeunes-actifs.vercel.app",
    siteName: "Association Jeunes Actifs",
    locale: "fr_MA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
