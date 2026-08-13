# Stratégie de test — isolation de la production Supabase

## Pourquoi

Lors du Lot 3, un test fonctionnel du formulaire de contact a réellement écrit
une ligne dans la table `messages_contact` de production, car le serveur de
test (`npm start`) utilisait `.env.local` — les vraies clés Supabase. Ce
document décrit comment éviter que cela se reproduise pour de futurs tests
E2E, y compris des tests destructifs (création/modification/suppression).

## Principe : deux projets Supabase, jamais un seul

- **Production** — `.env.local` (jamais commité). Utilisé par `npm run dev`
  et `npm start` en usage normal.
- **Test** — `.env.test` (jamais commité, gabarit dans `.env.test.example`).
  Un **second projet Supabase**, créé manuellement dans le dashboard Supabase
  (gratuit sur le plan actuel), avec son propre schéma (tables, RLS, Storage,
  fonction `check_rate_limit`) répliqué depuis la production. **Ce projet
  n'a pas été créé automatiquement par Claude — c'est une action manuelle du
  mainteneur du projet**, pour garder un contrôle total sur ce qui existe
  réellement dans votre compte Supabase.

## Variables nécessaires (`.env.test`)

Voir `.env.test.example` pour le gabarit complet : `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` du projet de test,
`ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` (peuvent être différents de la
production), et `RESEND_API_KEY`/`EMAIL_FROM` — idéalement une clé Resend en
mode sandbox/test si votre compte le permet, pour qu'aucun email réel ne
parte jamais pendant un test automatisé.

## Comment Next.js charge ces fichiers

Next.js charge les fichiers d'environnement dans cet ordre de priorité :
`.env.$(NODE_ENV).local` → `.env.local` → `.env.$(NODE_ENV)` → `.env`.

**Point important** : `.env.local` n'est **jamais chargé quand
`NODE_ENV=test`** (comportement intégré à Next.js, pas quelque chose que ce
projet configure). Lancer les commandes de test avec `NODE_ENV=test` suffit
donc, en théorie, à écarter automatiquement les vraies clés de production.

Exemple d'invocation :

```bash
# bash / Git Bash
NODE_ENV=test npm run test:e2e:guard

# PowerShell
$env:NODE_ENV = "test"; npm run test:e2e:guard
```

## Pourquoi un garde-fou supplémentaire malgré ça

Le comportement `NODE_ENV=test` de Next.js protège contre l'oubli de
positionner `NODE_ENV`, mais **pas** contre une erreur humaine dans le
contenu même de `.env.test` (par exemple : quelqu'un copie `.env.local` vers
`.env.test` par erreur, ou recolle la mauvaise URL). C'est exactement le
genre d'erreur qui a causé l'incident du Lot 3.

`scripts/guard-against-production.mjs` compare, à l'exécution, l'hôte
Supabase **réellement actif** dans le process (`process.env.SUPABASE_URL`) à
l'hôte de production lu dans `.env.local`. S'ils correspondent, le script
s'arrête avec un code de sortie non nul et un message explicite — quelle que
soit la raison pour laquelle les deux URLs se sont retrouvées identiques.

```bash
npm run test:e2e:guard
```

Comportement vérifié (voir rapport Phase 3) :
- Aucun `SUPABASE_URL` actif → refus.
- `SUPABASE_URL` actif différent de la production → autorisé.
- `SUPABASE_URL` actif identique à la production → refus.

### Limite connue

Si `.env.local` est absent de la machine qui exécute le test (typiquement un
environnement CI sans copie locale des secrets de production), le script n'a
rien à comparer et **laisse passer par défaut**, avec un avertissement. Pour
un usage CI, il faudrait compléter ce garde-fou par une vérification
indépendante (par exemple, une allowlist explicite des hosts Supabase de test
autorisés, fournie via un secret CI dédié).

## Intégration future dans une vraie suite E2E

Aucune suite de tests E2E destructifs n'existe encore dans ce projet — ce Lot
prépare uniquement l'infrastructure de protection. Quand une suite sera
écrite, la brancher ainsi dans `package.json` :

```json
{
  "scripts": {
    "pretest:e2e": "node scripts/guard-against-production.mjs",
    "test:e2e": "next start -p 3700"
  }
}
```

npm exécute automatiquement `pretest:e2e` avant `test:e2e` — si le garde-fou
échoue, la suite ne démarre jamais.

## Ce que ce Lot ne fait PAS

- Ne crée aucun second projet Supabase (action manuelle requise).
- Ne modifie aucune donnée ni configuration de production.
- N'écrit aucune suite de tests E2E destructifs elle-même.
