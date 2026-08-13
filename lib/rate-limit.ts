import { createHmac } from "crypto";
import { getSupabaseAdmin } from "./supabaseAdmin";

/**
 * Réutilise ADMIN_SESSION_SECRET (avec un préfixe de contexte distinct dans le
 * message signé) plutôt que d'introduire une nouvelle variable d'environnement
 * dédiée — évite de multiplier les secrets à gérer pour un seul petit projet.
 */
function getRateLimitSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "La variable d'environnement ADMIN_SESSION_SECRET est manquante (requise aussi pour le rate limiting)."
    );
  }
  return secret;
}

/**
 * Transforme (type de limite + IP) en une clé opaque, non réversible sans le
 * secret serveur. Aucune IP brute n'est jamais stockée dans la table
 * `rate_limits`.
 */
export function hashRateLimitKey(type: string, ip: string): string {
  const secret = getRateLimitSecret();
  return createHmac("sha256", secret).update(`ratelimit:${type}:${ip}`).digest("hex");
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Vérifie/incrémente le compteur via la fonction Postgres `check_rate_limit`
 * (voir supabase/migrations/0001_rate_limits.sql), qui effectue l'incrément
 * de façon atomique côté base — aucun risque de "lire puis écrire" en deux
 * temps depuis l'application. Lève une exception si la table/fonction n'est
 * pas disponible : c'est à l'appelant de décider de la politique
 * fail-open/fail-closed adaptée à sa route (voir les deux wrappers ci-dessous).
 */
export async function checkRateLimit(
  type: string,
  ip: string,
  maxCount: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const key = hashRateLimitKey(type, ip);
  const admin = getSupabaseAdmin();

  const { data, error } = await admin.rpc("check_rate_limit", {
    p_key: key,
    p_max_count: maxCount,
    p_window_seconds: windowSeconds,
  });

  if (error) {
    throw new Error(`Rate limiting indisponible (${type}) : ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.allowed !== "boolean") {
    throw new Error(`Rate limiting : réponse RPC inattendue (${type}).`);
  }

  return {
    allowed: row.allowed,
    retryAfterSeconds: Number(row.retry_after_seconds) || 0,
  };
}

type CheckFn = typeof checkRateLimit;

/**
 * Politique FAIL-CLOSED : à utiliser pour /api/admin/login. Si le rate
 * limiter est indisponible, l'exception remonte telle quelle — l'appelant
 * (la route de login) doit alors refuser la connexion avec une erreur
 * générique, sans jamais comparer le mot de passe. Ne jamais transformer
 * cette erreur en "autorisé par défaut" pour cette route.
 *
 * Le 5ᵉ paramètre `check` n'est là que pour l'injection en test (simuler une
 * panne sans toucher Supabase) — en production, l'appelant ne le fournit
 * jamais et la vraie fonction `checkRateLimit` est utilisée.
 */
export async function checkRateLimitFailClosed(
  type: string,
  ip: string,
  maxCount: number,
  windowSeconds: number,
  check: CheckFn = checkRateLimit
): Promise<RateLimitResult> {
  return check(type, ip, maxCount, windowSeconds);
}

/**
 * Politique FAIL-OPEN JOURNALISÉE : à utiliser pour les formulaires publics
 * (contact, adhésion). Si le rate limiter est indisponible, la requête est
 * autorisée (un petit site associatif ne doit pas devenir injoignable à
 * cause d'un souci sur une table annexe), mais l'incident est TOUJOURS
 * journalisé côté serveur — jamais désactivé silencieusement.
 */
export async function checkRateLimitFailOpen(
  type: string,
  ip: string,
  maxCount: number,
  windowSeconds: number,
  check: CheckFn = checkRateLimit
): Promise<RateLimitResult> {
  try {
    return await check(type, ip, maxCount, windowSeconds);
  } catch (e) {
    console.error(
      `[rate-limit] Indisponible pour "${type}" — requête autorisée par défaut (fail-open). Raison :`,
      (e as Error).message
    );
    return { allowed: true, retryAfterSeconds: 0 };
  }
}
