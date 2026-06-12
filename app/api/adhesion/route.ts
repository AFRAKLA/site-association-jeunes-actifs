import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INTERET_ALLOWED = [
  "actions-sociales",
  "activites-culturelles",
  "environnement",
  "evenements",
  "formations",
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nom, email, telephone, statut, interet, motivation, website } = body;

    // Honeypot anti-spam : si le champ caché est rempli, accepter silencieusement
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Vérification des champs obligatoires (telephone est optionnel)
    if (!nom || !email || !statut || !interet || !motivation) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis." },
        { status: 400 }
      );
    }

    // Vérification que les champs sont des chaînes
    if (
      typeof nom !== "string" ||
      typeof email !== "string" ||
      typeof statut !== "string" ||
      typeof interet !== "string" ||
      typeof motivation !== "string"
    ) {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 400 }
      );
    }

    // Nettoyage des espaces
    const nomClean = nom.trim();
    const emailClean = email.trim();
    const telephoneClean = telephone ? String(telephone).trim() : "";
    const statutClean = statut.trim();
    const interetClean = interet.trim();
    const motivationClean = motivation.trim();

    if (!nomClean || !emailClean || !statutClean || !interetClean || !motivationClean) {
      return NextResponse.json(
        { error: "Les champs obligatoires ne peuvent pas être vides ou contenir uniquement des espaces." },
        { status: 400 }
      );
    }

    // Validation email
    if (!EMAIL_REGEX.test(emailClean)) {
      return NextResponse.json(
        { error: "Veuillez entrer une adresse email valide." },
        { status: 400 }
      );
    }

    // Validation du domaine d'intérêt
    if (!INTERET_ALLOWED.includes(interetClean)) {
      return NextResponse.json(
        { error: "Domaine d'intérêt invalide." },
        { status: 400 }
      );
    }

    // Limites de longueur
    if (nomClean.length > 200) {
      return NextResponse.json(
        { error: "Le nom ne doit pas dépasser 200 caractères." },
        { status: 400 }
      );
    }
    if (emailClean.length > 200) {
      return NextResponse.json(
        { error: "L'email ne doit pas dépasser 200 caractères." },
        { status: 400 }
      );
    }
    if (telephoneClean.length > 30) {
      return NextResponse.json(
        { error: "Le téléphone ne doit pas dépasser 30 caractères." },
        { status: 400 }
      );
    }
    if (statutClean.length > 200) {
      return NextResponse.json(
        { error: "Le statut ne doit pas dépasser 200 caractères." },
        { status: 400 }
      );
    }
    if (motivationClean.length > 5000) {
      return NextResponse.json(
        { error: "La motivation ne doit pas dépasser 5 000 caractères." },
        { status: 400 }
      );
    }

    // Insertion dans la table demandes_adhesion
    const { error } = await supabase
      .from("demandes_adhesion")
      .insert([{
        nom: nomClean,
        email: emailClean,
        telephone: telephoneClean || null,
        statut: statutClean,
        interet: interetClean,
        motivation: motivationClean,
      }]);

    if (error) {
      console.error("Erreur Supabase :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de la demande." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}
