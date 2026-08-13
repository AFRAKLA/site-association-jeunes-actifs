import { escapeHtml } from "./html-escape";

/**
 * Construit le corps HTML de l'email envoyé en réponse à un message de contact.
 * `nom` et `sujet` proviennent du formulaire public non authentifié : ils sont
 * systématiquement échappés avant interpolation, tout comme `corps` (texte libre
 * saisi par l'admin, à traiter comme du texte brut, pas comme du HTML).
 */
export function buildContactReplyHtml({
  nom,
  sujet,
  corps,
}: {
  nom: string;
  sujet: string;
  corps: string;
}): string {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Bonjour ${escapeHtml(nom)},</p>
        <p>Vous avez reçu une réponse à votre message <strong>"${escapeHtml(sujet)}"</strong>.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <div style="white-space: pre-wrap;">${escapeHtml(corps)}</div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p style="color: #6b7280; font-size: 0.875rem;">
          Ceci est une réponse de l'Association Jeunes Actifs suite à votre message de contact.
        </p>
      </div>
    `;
}

/**
 * Construit le corps HTML de l'email envoyé en réponse à une demande d'adhésion.
 * `nom` provient du formulaire public : échappé, comme `corps` (texte admin).
 */
export function buildAdhesionReplyHtml({
  nom,
  corps,
}: {
  nom: string;
  corps: string;
}): string {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Bonjour ${escapeHtml(nom)},</p>
        <div style="white-space: pre-wrap;">${escapeHtml(corps)}</div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p style="color: #6b7280; font-size: 0.875rem;">
          Ceci est un message de l'Association Jeunes Actifs concernant votre demande d'adhésion.
        </p>
      </div>
    `;
}
