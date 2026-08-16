import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Exclut /api (routes métier, jamais localisées), /admin (back-office,
  // reste en français pour ce lot), /_next (assets internes Next.js), et
  // tout chemin contenant un point (favicon.ico, apple-icon.png,
  // sitemap.xml, robots.txt) — ces fichiers vivent à la racine de app/ et
  // ne doivent jamais passer par la négociation de locale.
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
