# Jeunes Actifs — Site associatif

Site web pour **Jeunes Actifs**, une association socio-culturelle et environnementale portée par des étudiants dans la région de l'Oriental, au Maroc. Le site présente l'association au public et intègre un espace d'administration permettant à un membre non technique de gérer le contenu (actualités, événements, galerie photo) et de traiter les demandes reçues (messages de contact, demandes d'adhésion), sans jamais toucher au code.

## Stack technique

- **Next.js 16** (App Router) — React 19, TypeScript 5
- **Tailwind CSS v4** (via plugin PostCSS, thème et variables CSS dans `app/globals.css`)
- **Supabase** — base de données Postgres (contenu, messages, adhésions) + Storage (images)
- **Resend** — envoi d'emails transactionnels (réponses aux messages et aux demandes d'adhésion)
- Aucune base de données locale, aucun système d'auth tiers : l'admin est protégé par un mot de passe applicatif

## Fonctionnalités publiques

- Pages de présentation : Accueil, À propos, Activités, Mentions légales
- **Actualités** filtrables par catégorie
- **Événements** avec page de détail dédiée (`/evenements/[slug]`)
- **Galerie photo** filtrable par catégorie
- **Formulaire de contact** (validation serveur + honeypot anti-spam)
- **Formulaire d'adhésion** (validation serveur + honeypot anti-spam)
- SEO de base : `sitemap.xml`, `robots.txt`, métadonnées Open Graph

## Espace admin (`/admin`)

Accessible via un mot de passe unique (variable `ADMIN_PASSWORD`), l'espace admin permet de :

- Consulter et traiter les **messages de contact** (marquer comme traité, répondre par email)
- Consulter et traiter les **demandes d'adhésion** (accepter / refuser / demander des infos, avec email automatique)
- Créer et supprimer des **actualités**, des **événements** (avec image principale + photos supplémentaires) et des **photos de galerie**
- Suivre un tableau de bord avec compteurs (messages non traités, demandes en attente, statistiques de contenu)

Les formulaires de l'admin n'exposent aucun champ technique (pas d'ID, de slug ou de JSON) — uniquement des champs en français avec des listes déroulantes pour les catégories et statuts.

## Supabase

Le projet attend les tables suivantes dans le schéma `public` :

| Table | Usage |
|---|---|
| `messages_contact` | Messages reçus via le formulaire de contact |
| `demandes_adhesion` | Demandes reçues via le formulaire d'adhésion |
| `actualites` | Actualités publiées côté admin |
| `evenements` | Événements (avec `slug` unique, image principale, photos supplémentaires) |
| `galerie` | Photos de la galerie |

Deux clients Supabase distincts sont utilisés (`lib/supabase.ts` et `lib/supabaseAdmin.ts`) : un client public (clé `anon`, utilisé par les formulaires) et un client admin (clé `service_role`, utilisé uniquement côté serveur dans les routes `/api/admin/*`).

## Storage

Deux buckets Supabase Storage sont utilisés pour l'upload d'images depuis l'admin :

- `evenements` — image principale + photos supplémentaires par événement
- `galerie` — photos de la galerie

Formats acceptés : JPG, PNG, WebP — 5 Mo maximum par fichier (`lib/storage-upload.ts`).

## Resend

L'envoi d'emails (réponses aux messages de contact et aux demandes d'adhésion depuis l'admin) passe par [Resend](https://resend.com). Un domaine d'expédition vérifié est nécessaire en production (`EMAIL_FROM`).

## Scripts npm

```bash
npm run dev     # Serveur de développement (localhost:3000)
npm run build   # Build de production
npm start       # Démarrer le build de production
npm run lint    # ESLint (core-web-vitals + typescript)
```

## Installation locale

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs réelles
npm run dev
```

## Variables d'environnement

Voir `.env.example` pour la liste complète et commentée. Résumé :

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_ANON_KEY` | Clé publique Supabase (formulaires publics) |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète Supabase (routes admin uniquement — ne jamais exposer côté client) |
| `ADMIN_PASSWORD` | Mot de passe protégeant `/admin` et les routes `/api/admin/*` |
| `RESEND_API_KEY` | Clé API Resend |
| `EMAIL_FROM` | Adresse d'expédition des emails (domaine vérifié) |
| `EMAIL_FROM_NAME` | Nom affiché comme expéditeur (optionnel) |

`.env.local` n'est jamais commité (ignoré via `.gitignore`).

## Déploiement (Vercel)

Le projet est prévu pour un déploiement sur [Vercel](https://vercel.com) :

1. Importer le dépôt GitHub dans Vercel.
2. Renseigner les variables d'environnement listées ci-dessus dans les paramètres du projet Vercel (Production + Preview).
3. Le build utilise `next build` — aucune configuration supplémentaire requise.

## Projet réalisé dans un contexte associatif

Ce site a été développé pour un usage réel par l'association Jeunes Actifs, avec un objectif double : offrir une vitrine publique crédible et fournir à un membre non technique de l'association les moyens de maintenir le contenu du site de façon autonome, sans dépendre d'un développeur pour publier une actualité, un événement ou une photo.
