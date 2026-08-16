import { defineRouting } from "next-intl/routing";

// Français = locale par défaut, sans préfixe (les URLs existantes /a-propos,
// /contact... continuent de fonctionner à l'identique). Anglais et arabe
// reçoivent un préfixe explicite (/en/..., /ar/...) — "as-needed" est le
// seul mode next-intl qui produit exactement cette asymétrie demandée.
export const routing = defineRouting({
  locales: ["fr", "en", "ar"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
