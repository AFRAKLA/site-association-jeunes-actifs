import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { envoyerEmail } from "@/lib/email";
import { buildContactReplyHtml } from "@/lib/email-templates";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(request: Request) {
  try {
    // --- Authentification admin ---
    const auth = requireAdmin(request);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id, sujet, corps } = await request.json();

    // --- Validation des champs ---
    if (!id || !sujet || !corps) {
      return NextResponse.json(
        { error: "id, sujet et corps sont requis." },
        { status: 400 }
      );
    }

    if (typeof id !== "string" || typeof sujet !== "string" || typeof corps !== "string") {
      return NextResponse.json(
        { error: "Données invalides." },
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

    // --- Récupérer le message contact pour obtenir le destinataire ---
    const admin = getSupabaseAdmin();
    const { data: message, error: fetchError } = await admin
      .from("messages_contact")
      .select("id, email, nom, sujet")
      .eq("id", id)
      .single();

    if (fetchError || !message) {
      console.error("Erreur récupération message :", fetchError?.message);
      return NextResponse.json(
        { error: "Message introuvable." },
        { status: 404 }
      );
    }

    // --- Construction du Reply-To dynamique ---
    const replyDomain = process.env.EMAIL_REPLY_DOMAIN;
    const replyTo = replyDomain
      ? `message_contact_${id}@${replyDomain}`
      : undefined;

    // --- Envoi de l'email via Resend ---
    // nom/sujet proviennent du formulaire public : échappés dans buildContactReplyHtml.
    const htmlBody = buildContactReplyHtml({
      nom: message.nom,
      sujet: message.sujet,
      corps: corpsClean,
    });

    let emailEnvoye = false;
    let emailId: string | null = null;
    let erreurEnvoi: string | null = null;

    try {
      emailId = await envoyerEmail({
        to: message.email,
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
        cible_type: "message_contact",
        cible_id: id,
        destinataire_email: message.email,
        destinataire_nom: message.nom,
        action: "repondu",
        sujet_email: sujetClean,
        corps_email: corpsClean,
        statut_envoi: emailEnvoye ? "envoye" : "echec",
        erreur: erreurEnvoi,
      }]);

    if (insertError) {
      console.error("Erreur insertion reponses_admin :", insertError.message);
      // L'email a peut-être été envoyé mais l'enregistrement a échoué
      // On retourne quand même l'info pour que l'admin sache
      return NextResponse.json(
        { error: "Email envoyé mais erreur lors de l'enregistrement en base." },
        { status: 500 }
      );
    }

    // --- Mise à jour du statut uniquement si l'email a réussi ---
    if (emailEnvoye) {
      const { error: updateError } = await admin
        .from("messages_contact")
        .update({ statut: "repondu" })
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
        { error: "L'email n'a pas pu être envoyé. Le statut du message n'a pas été modifié.", details: erreurEnvoi },
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
