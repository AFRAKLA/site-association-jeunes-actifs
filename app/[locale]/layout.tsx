import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { geistSans, geistMono } from "@/lib/fonts";
import { routing } from "@/i18n/routing";
import ThemeScript from "@/components/ThemeScript";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home.meta" });
  const ogLocale = locale === "ar" ? "ar_MA" : locale === "en" ? "en_MA" : "fr_MA";

  return {
    metadataBase: new URL("https://jeunes-actifs.vercel.app"),
    title: { default: "Association Jeunes Actifs", template: "%s" },
    description: t("description"),
    openGraph: {
      title: "Association Jeunes Actifs",
      description: t("description"),
      url: "https://jeunes-actifs.vercel.app",
      siteName: "Association Jeunes Actifs",
      locale: ogLocale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Requis par next-intl pour que les Server Components statiques (pages
  // sans "use client") résolvent la bonne locale pendant le rendu/prerender.
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "common" });
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={locale}
      dir={dir}
      // data-theme est posé par ThemeScript avant l'hydratation (anti-flash,
      // voir components/ThemeScript.tsx) : React s'attend donc légitimement
      // à un attribut absent côté serveur puis présent côté client sur CET
      // élément précis. suppressHydrationWarning ne désactive la vérification
      // que pour <html> lui-même, jamais pour ses enfants.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-forest focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-ivory focus:shadow-lg"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
