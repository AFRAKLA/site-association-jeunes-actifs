import AdminDashboard from "./AdminDashboard";

// Jamais statiquement pré-rendable : toujours derrière l'authentification,
// et dépend de préférences client (thème, langue admin) résolues au
// montage. Sans ce flag, Next.js tentait un pré-rendu statique au build
// qui entrait en conflit avec next-intl côté AdminLocaleProvider
// (ENVIRONMENT_FALLBACK) — cette page n'a de toute façon aucun intérêt à
// être statique.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main id="main-content">
      <AdminDashboard />
    </main>
  );
}
