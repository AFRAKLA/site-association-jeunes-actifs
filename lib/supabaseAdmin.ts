import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let instance: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (instance) return instance;

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "La variable d'environnement SUPABASE_URL est manquante. " +
        "Ajoutez-la dans le fichier .env.local à la racine du projet."
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      "La variable d'environnement SUPABASE_SERVICE_ROLE_KEY est manquante. " +
        "Ajoutez-la dans le fichier .env.local à la racine du projet."
    );
  }

  instance = createClient(supabaseUrl, supabaseServiceRoleKey);
  return instance;
}
