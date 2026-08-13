#!/usr/bin/env node
/**
 * Garde-fou anti-production pour les futurs tests E2E destructifs.
 *
 * Principe (Lot 6.1) : si ce script ne peut pas PROUVER que l'environnement
 * actif est un environnement de test distinct de la production, il refuse de
 * démarrer. Il n'y a plus de branche "avertissement + autorisation" — une
 * preuve manquante est traitée comme un refus, pas comme une tolérance.
 *
 * Comparaison : l'hôte Supabase RÉELLEMENT actif dans l'environnement du
 * process (process.env.SUPABASE_URL, chargé depuis .env.test/.env.test.local
 * ou une variable exportée manuellement) contre l'hôte Supabase de
 * production, lu une seule fois dans .env.local (jamais commité, jamais
 * affiché en entier — seul le hostname, jamais la clé, est comparé).
 *
 * Usage prévu (une fois un vrai projet Supabase de test créé et une suite
 * E2E écrite) :
 *   "pretest:e2e": "node scripts/guard-against-production.mjs"
 *   "test:e2e": "next start -p 3700"   (lancé avec NODE_ENV=test, voir doc)
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export function readEnvVar(filePath, key) {
  if (!existsSync(filePath)) return null;
  const text = readFileSync(filePath, "utf8");
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key2 = line.slice(0, eq).trim();
    if (key2 === key) return line.slice(eq + 1).trim();
  }
  return null;
}

export function hostnameOf(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

/**
 * Logique pure, testable sans toucher au système de fichiers ni à
 * process.exit(). Retourne { allowed, reason } — ne décide jamais
 * "j'autorise par défaut" quand une preuve manque.
 */
export function evaluateGuard({ activeUrl, productionUrl }) {
  const activeHost = hostnameOf(activeUrl);
  const prodHost = hostnameOf(productionUrl);

  if (!activeHost) {
    return {
      allowed: false,
      reason:
        "Aucun SUPABASE_URL actif dans l'environnement de test. Configurez .env.test (voir .env.test.example) avant de lancer des tests destructifs.",
    };
  }

  if (!prodHost) {
    return {
      allowed: false,
      reason:
        "Impossible de déterminer l'hôte Supabase de production (.env.local absent ou sans SUPABASE_URL) — impossible de PROUVER que l'environnement actif est bien un environnement de test distinct. Refus par principe de prudence (voir docs/testing-strategy.md pour un mécanisme complémentaire en CI, ex. allowlist explicite).",
    };
  }

  if (activeHost === prodHost) {
    return {
      allowed: false,
      reason:
        "DANGER : l'environnement actif pointe vers le MÊME projet Supabase que .env.local (production). Aucun test destructif ne doit jamais s'exécuter contre la production.",
    };
  }

  return {
    allowed: true,
    reason: `Environnement de test distinct de la production confirmé (hôte actif : ${activeHost}).`,
  };
}

// --- CLI : ne s'exécute que si ce fichier est lancé directement, pas quand
// il est importé par les tests. ---
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isMain) {
  const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
  const productionUrl = readEnvVar(path.join(root, ".env.local"), "SUPABASE_URL");
  const activeUrl = process.env.SUPABASE_URL;

  const result = evaluateGuard({ activeUrl, productionUrl });

  if (!result.allowed) {
    console.error(`[guard] REFUS DE DÉMARRER. ${result.reason}`);
    process.exit(1);
  }

  console.log(`[guard] OK. ${result.reason}`);
  process.exit(0);
}
