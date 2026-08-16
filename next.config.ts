import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

function getSupabaseHostname(): string | null {
  const url = process.env.SUPABASE_URL;
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const supabaseHostname = getSupabaseHostname();

// `NODE_ENV === "production"` est vrai dès qu'on lance `next start`, y
// compris en local sur http://localhost (aucune vraie connexion HTTPS) — un
// mauvais signal pour HSTS/upgrade-insecure-requests, qui casseraient un
// test local (le navigateur tenterait de forcer https:// sur un port qui ne
// le sert pas). `VERCEL_ENV` n'est défini que par la plateforme Vercel elle
// -même et vaut "production" uniquement pour le vrai déploiement de
// production (toujours HTTPS) — c'est le signal fiable demandé ici. Si ce
// projet est un jour déployé ailleurs que Vercel, cette variable devra être
// adaptée à l'équivalent de la nouvelle plateforme.
const isRealHttpsProduction = process.env.VERCEL_ENV === "production";

// --- Content-Security-Policy ---------------------------------------------
// Construite à partir d'un inventaire réel du projet (pas une policy
// générique copiée) :
//
// - img-src : 'self' (assets locaux, /_next/image — le proxy d'optimisation
//   d'images de Next.js, qui sert les <Image> next/image en same-origin même
//   pour des sources distantes) ; blob: (aperçus de fichier choisi côté
//   admin, via URL.createObjectURL dans ImageUploader/MultiImageUploader/
//   GalerieAdmin, jamais uploadé tant que le formulaire n'est pas soumis) ;
//   le hostname Supabase Storage (app/galerie/GalerieContent.tsx et les
//   aperçus d'image existante en admin utilisent un <img src=...> brut vers
//   l'URL publique Supabase, pas next/image — donc pas simplement proxifié).
// - frame-src : uniquement youtube-nocookie.com et player.vimeo.com — les
//   deux seules origines que app/evenements/[slug]/page.tsx peut produire
//   (resolveEmbedUrl() n'construit jamais une iframe à partir d'une URL
//   arbitraire, seulement après un match regex YouTube ou Vimeo explicite).
// - font-src : 'self' (next/font/google télécharge et auto-héberge Geist au
//   build ; aucune requête runtime vers fonts.googleapis.com/gstatic.com).
// - connect-src : 'self' — aucun appel réseau du navigateur ne sort du site
//   (Supabase et Resend ne sont appelés que côté serveur, jamais depuis le
//   JS client ; vérifié : aucun composant "use client" n'importe Supabase).
// - script-src 'unsafe-inline' : testé empiriquement en Phase 3 avec
//   script-src 'self' seul sur /, /actualites, /evenements, /contact et
//   /devenir-membre — violation systématique sur CHAQUE page ("Executing
//   inline script violates ... script-src 'self'"). Next.js App Router
//   (Turbopack) injecte un <script> inline sur chaque page pour amorcer
//   l'hydratation React (payload RSC) ; ce script est généré par le
//   framework lui-même, pas par du contenu utilisateur, et change de hash à
//   chaque build. Le retirer proprement demanderait un CSP à nonce généré
//   par middleware (le nonce doit varier à chaque requête, donc impossible
//   à exprimer dans les headers statiques de next.config.ts) — une
//   architecture plus lourde, réservée à une itération future si le besoin
//   se confirme. 'unsafe-inline' seul sur script-src reste risqué en théorie
//   (n'importe quel <script> inline injecté passerait), mais aucune page de
//   ce site n'accepte de HTML utilisateur brut (0 dangerouslySetInnerHTML
//   dans tout le projet, vérifié) : le vecteur d'exploitation réel est donc
//   très réduit ici.
// - style-src 'unsafe-inline' : même constat empirique — violation
//   systématique ("Applying inline style violates ... style-src 'self'")
//   sur chaque page testée. Next.js/next-themes-like injecte des styles
//   inline (variables CSS générées par next/font pour les métriques de
//   fallback de police, notamment) indépendamment de tout code de ce
//   projet. Risque limité : les attributs `style` ne peuvent pas exécuter de
//   JavaScript.
// - object-src 'none', base-uri 'self', form-action 'self' : durcissement
//   standard, aucun <object>/<embed>, aucun besoin de soumettre un
//   formulaire vers un autre domaine.
// - frame-ancestors 'none' : équivalent moderne de X-Frame-Options: DENY,
//   conservé en complément (voir plus bas) en protection "legacy" pour les
//   navigateurs qui ignoreraient frame-ancestors.
function buildCsp(): string {
  const imgSrc = ["'self'", "blob:", supabaseHostname ? `https://${supabaseHostname}` : null]
    .filter(Boolean)
    .join(" ");

  const directives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline'`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${imgSrc}`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `frame-src https://www.youtube-nocookie.com https://player.vimeo.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    // N'a de sens qu'en production HTTPS réelle ; en dev/local (http://
    // localhost) cela casserait le chargement en tentant de forcer https.
    ...(isRealHttpsProduction ? ["upgrade-insecure-requests"] : []),
  ];

  return directives.join("; ");
}

const nextConfig: NextConfig = {
  images: supabaseHostname
    ? { remotePatterns: [{ protocol: "https", hostname: supabaseHostname }] }
    : {},

  // Headers de sécurité (Phases 2 et 3 du Lot 5).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Empêche le navigateur de deviner un type MIME différent de celui
          // déclaré par le serveur (protection contre certaines attaques XSS
          // basées sur un mauvais typage de fichier).
          { key: "X-Content-Type-Options", value: "nosniff" },
          // N'envoie l'URL complète en Referer que vers la même origine ;
          // seulement l'origine (sans le chemin) vers un site tiers ; rien du
          // tout en cas de downgrade HTTPS -> HTTP.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Protection anti-clickjacking "legacy" : conservée en complément
          // de `frame-ancestors 'none'` (CSP ci-dessous) pour les anciens
          // navigateurs qui ne supportent pas frame-ancestors. Les deux
          // disent la même chose, ce n'est pas une contradiction — c'est la
          // redondance volontaire recommandée par la documentation Next.js.
          { key: "X-Frame-Options", value: "DENY" },
          // Ne désactive que les fonctionnalités sensibles réellement
          // inutilisées. Les événements peuvent intégrer des vidéos
          // YouTube/Vimeo (voir app/evenements/[slug]/page.tsx, attribut
          // `allow` de l'iframe) : accelerometer, autoplay, clipboard-write,
          // encrypted-media, gyroscope, picture-in-picture et fullscreen ne
          // doivent donc surtout pas être bloqués ici, sous peine de casser
          // ces lecteurs vidéo.
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), midi=(), interest-cohort=()",
          },
          { key: "Content-Security-Policy", value: buildCsp() },
          // HSTS uniquement en production HTTPS. max-age modéré pour
          // commencer (6 mois) ; ni includeSubDomains ni preload tant que
          // tous les sous-domaines éventuels n'ont pas été vérifiés
          // définitivement HTTPS (aucun sous-domaine connu à ce jour — ce
          // site vit sur un domaine unique, apex ou www).
          ...(isRealHttpsProduction
            ? [{ key: "Strict-Transport-Security", value: "max-age=15552000" }]
            : []),
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
