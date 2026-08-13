const ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Échappe une valeur non fiable avant interpolation dans du HTML écrit à la main
 * (ex. corps d'email). Le HTML volontaire de l'application ne doit jamais passer
 * par cette fonction — seules les données utilisateur (formulaires publics, etc.).
 */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}
