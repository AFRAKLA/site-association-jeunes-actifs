import { Resend } from "resend";

/**
 * Retourne un client Resend configuré avec la clé API de l'environnement.
 * Appel uniquement côté serveur (route API / server action).
 */
export function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error(
      "La variable d'environnement RESEND_API_KEY est manquante. " +
        "Ajoutez-la dans le fichier .env.local à la racine du projet."
    );
  }

  return new Resend(apiKey);
}

/**
 * Adresse d'expédition formatée à partir des variables d'environnement.
 * Exemple : "Association Jeunes Actifs <contact@jeunes-actifs.fr>"
 */
function getFromAddress(): string {
  const email = process.env.EMAIL_FROM;
  const name = process.env.EMAIL_FROM_NAME;

  if (!email) {
    throw new Error(
      "La variable d'environnement EMAIL_FROM est manquante. " +
        "Ajoutez-la dans le fichier .env.local à la racine du projet."
    );
  }

  return name ? `${name} <${email}>` : email;
}

interface EnvoyerEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Envoie un email via Resend.
 * En cas de succès, retourne l'ID de l'email envoyé.
 * En cas d'échec, lance une erreur avec le message Resend.
 */
export async function envoyerEmail({
  to,
  subject,
  html,
  replyTo,
}: EnvoyerEmailOptions): Promise<string> {
  const resend = getResendClient();
  const from = getFromAddress();

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data!.id;
}
