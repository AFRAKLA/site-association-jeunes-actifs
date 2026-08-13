import { createHash, timingSafeEqual } from "crypto";

/**
 * Compare deux chaînes en temps constant, sans jamais lever d'exception liée
 * à une différence de longueur : chaque valeur est d'abord réduite à un
 * condensé SHA-256 de taille fixe (32 octets), puis comparée avec
 * `timingSafeEqual`. Utilisé pour le mot de passe admin et la signature du
 * cookie de session — deux endroits où une comparaison naïve (`===`) fuiterait
 * un peu de timing par caractère correct.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  const digestA = createHash("sha256").update(a).digest();
  const digestB = createHash("sha256").update(b).digest();
  return timingSafeEqual(digestA, digestB);
}
