import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error(
    "La variable d'environnement SUPABASE_URL est manquante. " +
      "Ajoutez-la dans le fichier .env.local à la racine du projet."
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    "La variable d'environnement SUPABASE_ANON_KEY est manquante. " +
      "Ajoutez-la dans le fichier .env.local à la racine du projet."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
