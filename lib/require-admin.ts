import { SESSION_COOKIE_NAME, verifySessionToken } from "./admin-session";
import { isOriginAllowed } from "./check-origin";

function parseCookie(cookieHeader: string, name: string): string | null {
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return null;
}

export type AdminAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 403; error: string };

/**
 * Porte d'entrée unique pour toutes les routes /api/admin/* (hors login) :
 * vérifie l'origine (CSRF) puis la session. Remplace les 17 comparaisons
 * individuelles de `password` de l'ancienne architecture.
 *
 * Ne dépend volontairement pas de "next/server" (NextResponse) pour rester
 * testable avec `node --test` sans passer par le runtime Next.js — c'est à
 * la route appelante de construire la réponse HTTP à partir de ce résultat :
 *
 *   const auth = requireAdmin(request);
 *   if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
 */
export function requireAdmin(request: Request): AdminAuthResult {
  if (!isOriginAllowed(request)) {
    return { ok: false, status: 403, error: "Origine non autorisée." };
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = parseCookie(cookieHeader, SESSION_COOKIE_NAME);

  if (!verifySessionToken(token)) {
    return { ok: false, status: 401, error: "Non autorisé." };
  }

  return { ok: true };
}
