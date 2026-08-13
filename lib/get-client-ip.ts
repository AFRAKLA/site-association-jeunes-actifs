/**
 * Extrait l'IP du client à partir d'une requête entrante, dans un déploiement Vercel.
 *
 * Sur Vercel, `x-forwarded-for` est posé par l'infrastructure Vercel elle-même
 * (le edge network en frontal) — le premier élément de la liste correspond à
 * l'IP réelle du client. C'est fiable *dans ce contexte précis* car aucun
 * intermédiaire non maîtrisé ne se trouve entre le client et Vercel.
 *
 * ATTENTION si un reverse proxy est ajouté un jour devant Vercel (ex. Cloudflare) :
 * `x-forwarded-for` pourrait alors contenir une chaîne d'IP dont le premier élément
 * n'est plus fiable sans validation supplémentaire (un client pourrait forger son
 * propre en-tête `x-forwarded-for` avant que ce proxy ne l'complète). Il faudrait
 * dans ce cas ne faire confiance qu'à l'en-tête posé par CE proxy immédiat
 * (ex. `cf-connecting-ip` pour Cloudflare), jamais à un en-tête arbitraire envoyé
 * directement par le client.
 *
 * On ne fait jamais confiance à un en-tête générique sans savoir qui l'a posé en
 * dernier — cette fonction est le seul endroit du projet qui décide de la source
 * de vérité pour l'IP, afin de ne pas avoir à revalider cette hypothèse à plusieurs
 * endroits si l'infrastructure change.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  // Aucune IP fiable disponible (ex. exécution locale) — on retombe sur une
  // valeur constante plutôt que de désactiver la limite : tout le trafic sans
  // IP identifiable partage alors la même limite, ce qui reste plus sûr que de
  // ne pas limiter du tout.
  return "unknown";
}
