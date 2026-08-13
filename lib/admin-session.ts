import { createHmac } from "crypto";
import { constantTimeEqual } from "./constant-time-equal";

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8h maximum, pas de session permanente

interface SessionPayload {
  admin: true;
  iat: number;
  exp: number;
}

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "La variable d'environnement ADMIN_SESSION_SECRET est manquante. " +
        "Ajoutez-la dans le fichier .env.local à la racine du projet."
    );
  }
  return secret;
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

/**
 * Crée un token de session signé : `<payload base64url>.<signature base64url>`.
 * Le payload ne contient jamais de secret, uniquement { admin, iat, exp }.
 */
export function createSessionToken(): string {
  const secret = getSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    admin: true,
    iat: now,
    exp: now + SESSION_DURATION_SECONDS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

/**
 * Vérifie strictement un token de session : structure, signature (temps
 * constant), expiration, et `admin === true`. Ne lève jamais d'exception —
 * tout token absent, malformé, altéré ou expiré retourne simplement `false`.
 * Ne jamais laisser une entrée invalide provoquer une 500 : l'appelant doit
 * pouvoir traiter ceci comme un simple "non authentifié".
 */
export function verifySessionToken(token: string | null | undefined): boolean {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) return false;

  let secret: string;
  try {
    secret = getSecret();
  } catch {
    return false;
  }

  let expectedSignature: string;
  try {
    expectedSignature = sign(payloadB64, secret);
  } catch {
    return false;
  }

  if (!constantTimeEqual(signature, expectedSignature)) return false;

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return false;
  }

  if (typeof payload !== "object" || payload === null) return false;

  const candidate = payload as Record<string, unknown>;
  if (
    candidate.admin !== true ||
    typeof candidate.exp !== "number" ||
    typeof candidate.iat !== "number" ||
    !Number.isFinite(candidate.exp) ||
    !Number.isFinite(candidate.iat)
  ) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (candidate.exp <= now) return false;

  return true;
}
