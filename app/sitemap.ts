import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const baseUrl = "https://jeunes-actifs.vercel.app";

// Chemin absolu par locale, respectant le préfixe "as-needed" du routeur
// (français sans préfixe, anglais/arabe préfixés) — une seule source de
// vérité pour ne jamais désynchroniser sitemap et routing réel.
function localizedUrl(path: string, locale: string): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${baseUrl}${prefix}${path}`;
}

function alternates(path: string): Record<string, string> {
  const entries = routing.locales.map((locale) => [locale, localizedUrl(path, locale)] as const);
  return Object.fromEntries([...entries, ["x-default", localizedUrl(path, routing.defaultLocale)]]);
}

const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/a-propos", changeFrequency: "monthly", priority: 0.8 },
  { path: "/activites", changeFrequency: "monthly", priority: 0.8 },
  { path: "/actualites", changeFrequency: "weekly", priority: 0.9 },
  { path: "/evenements", changeFrequency: "weekly", priority: 0.9 },
  { path: "/galerie", changeFrequency: "weekly", priority: 0.7 },
  { path: "/contact", changeFrequency: "yearly", priority: 0.6 },
  { path: "/devenir-membre", changeFrequency: "yearly", priority: 0.7 },
  { path: "/mentions-legales", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return routes.flatMap((route) =>
    routing.locales.map((locale) => ({
      url: localizedUrl(route.path, locale),
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: { languages: alternates(route.path) },
    }))
  );
}
