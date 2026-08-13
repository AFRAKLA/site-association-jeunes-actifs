/**
 * Vérifie que la requête provient bien du même site, en secours de
 * `SameSite=Strict` (qui empêche déjà le cookie de partir depuis une requête
 * cross-site — ceci est une seconde barrière, pas la seule protection CSRF).
 * Utilisé par toutes les routes /api/admin/* (login inclus) pour les
 * méthodes qui modifient l'état ou la session.
 *
 * Priorité à `Origin` (toujours présent sur les requêtes fetch/XHR modernes).
 * Repli sur `Referer` seulement si `Origin` est absent. Si aucun des deux
 * n'est présent, on refuse par prudence plutôt que de supposer une origine
 * valide.
 */
export function isOriginAllowed(request: Request): boolean {
  const expected = new URL(request.url).origin;

  const origin = request.headers.get("origin");
  if (origin) return origin === expected;

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return new URL(referer).origin === expected;
    } catch {
      return false;
    }
  }

  return false;
}
