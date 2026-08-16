/* ------------------------------------------------------------------
   Signature graphique "Canopée" — une tige et trois feuilles en trait
   seul, dessinée une fois et réutilisée en filigrane (admin et site
   public) — jamais un clipart de feuille. Toujours purement décorative :
   aria-hidden, currentColor pour hériter la teinte de son conteneur.
   ------------------------------------------------------------------ */
export default function GrowthMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 160"
      fill="none"
      className={className}
    >
      <path d="M60 156C58 120 62 92 55 60C50 34 60 14 58 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M56 96C40 89 28 73 30 55C45 60 56 73 58 91" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M58 60C74 54 88 40 87 21C71 26 60 41 57 59" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M55 30C42 24 32 10 34 -4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}
