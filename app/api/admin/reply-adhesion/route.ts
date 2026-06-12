import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { envoyerEmail } from "@/lib/email";

const ACTIONS_VALIDES = ["acceptee", "refusee", "info_demandee"] as const;
type ActionAdhesion = (typeof ACTIONS_VALIDES)[number];

export async function POST(request: Request) {
  try {
    const { password, id, action, sujet, corps } = await request.json();

    // --- Authentification admin ---
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    // --- Validation des champs ---
    if (!id || !action || !sujet || !corps) {
      return NextResponse.json(
        { error: "id, action, sujet et corps sont requis." },
        { status: 400 }
      );
    }

    if (
      typeof id !== "string" ||
      typeof action !== "string" ||
      typeof sujet !== "string" ||
      typeof corps !== "string"
    ) {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 400 }
      );
    }

    if (!ACTIONS_VALIDES.includes(action as ActionAdhesion)) {
      return NextResponse.json(
        { error: "Action invalide. Valeurs possibles : acceptee, refusee, info_demandee." },
        { status: 400 }
      );
    }

    const sujetClean = sujet.trim();
    const corpsClean = corps.trim();

    if (!sujetClean || !corpsClean) {
      return NextResponse.json(
        { error: "Le sujet et le corps ne peuvent pas être vides." },
        { status: 400 }
      );
    }

    if (sujetClean.length > 300) {
      return NextResponse.json(
        { error: "Le sujet ne doit pas dépasser 300 caractères." },
        { status: 400 }
      );
    }

    if (corpsClean.length > 50000) {
      return NextResponse.json(
        { error: "Le corps du message ne doit pas dépasser 50 000 caractères." },
        { status: 400 }
      );
    }

    // --- Récupérer la demande d'adhésion pour obtenir le destinataire ---
    const admin = getSupabaseAdmin();
    const { data: demande, error: fetchError } = await admin
      .from("demandes_adhesion")
      .select("id, email, nom, interet")
      .eq("id", id)
      .single();

    if (fetchError || !demande) {
      console.error("Erreur récupération demande :", fetchError?.message);
      return NextResponse.json(
        { error: "Demande d'adhésion introuvable." },
        { status: 404 }
      );
    }

    // --- Construction du Reply-To dynamique ---
    const replyDomain = process.env.EMAIL_REPLY_DOMAIN;
    const replyTo = replyDomain
      ? `demande_adhesion_${id}@${replyDomain}`
      : undefined;

    // --- Envoi de l'email via Resend ---
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Bonjour ${demande.nom},</p>
        <div style="white-space: pre-wrap;">${corpsClean}</div>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
        <p style="color: #6b7280; font-size: 0.875rem;">
          Ceci est un message de l'Association Jeunes Actifs concernant votre demande d'adhésion.
        </p>
      </div>
    `;

    let emailEnvoye = false;
    let emailId: string | null = null;
    let erreurEnvoi: string | null = null;

    try {
      emailId = await envoyerEmail({
        to: demande.email,
        subject: sujetClean,
        html: htmlBody,
        replyTo,
      });
      emailEnvoye = true;
    } catch (err) {
      erreurEnvoi = err instanceof Error ? err.message : "Erreur inconnue lors de l'envoi.";
      console.error("Erreur envoi email :", erreurEnvoi);
    }

    // --- Enregistrement dans reponses_admin ---
    const { error: insertError } = await admin
      .from("reponses_admin")
      .insert([{
        cible_type: "demande_adhesion",
        cible_id: id,
        destinataire_email: demande.email,
        destinataire_nom: demande.nom,
        action,
        sujet_email: sujetClean,
        corps_email: corpsClean,
        statut_envoi: emailEnvoye ? "envoye" : "echec",
        erreur: erreurEnvoi,
      }]);

    if (insertError) {
      console.error("Erreur insertion reponses_admin :", insertError.message);
      return NextResponse.json(
        { error: "Email envoyé mais erreur lors de l'enregistrement en base." },
        { status: 500 }
      );
    }

    // --- Mise à jour du statut uniquement si l'email a réussi ---
    if (emailEnvoye) {
      const { error: updateError } = await admin
        .from("demandes_adhesion")
        .update({ statut_adhesion: action })
        .eq("id", id);

      if (updateError) {
        console.error("Erreur mise à jour statut :", updateError.message);
        return NextResponse.json(
          { error: "Email envoyé mais erreur lors de la mise à jour du statut." },
          { status: 500 }
        );
      }
    }

    // --- Réponse ---
    if (!emailEnvoye) {
      return NextResponse.json(
        { error: "L'email n'a pas pu être envoyé. Le statut n'a pas été modifié.", details: erreurEnvoi },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId,
    });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
