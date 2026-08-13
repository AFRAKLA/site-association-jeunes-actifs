import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimitFailOpen } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SUBMISSIONS = 5;
const WINDOW_SECONDS = 10 * 60; // 10 minutes

export async function POST(request: Request) {
  try {
    // Fail-open journalisé : une panne du rate limiter ne doit pas rendre le
    // formulaire de contact indisponible pour un visiteur légitime.
    const ip = getClientIp(request);
    const rateLimit = await checkRateLimitFailOpen("contact", ip, MAX_SUBMISSIONS, WINDOW_SECONDS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de messages envoyés récemment. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const { nom, email, sujet, message, website } = body;

    // Honeypot anti-spam : si le champ caché est rempli, accepter silencieusement
    if (website) {
      return NextResponse.json({ success: true });
    }

    // Vérification des champs obligatoires
    if (!nom || !email || !sujet || !message) {
      return NextResponse.json(
        { error: "Tous les champs sont obligatoires." },
        { status: 400 }
      );
    }

    // Vérification que les champs sont des chaînes
    if (
      typeof nom !== "string" ||
      typeof email !== "string" ||
      typeof sujet !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 400 }
      );
    }

    // Nettoyage des espaces
    const nomClean = nom.trim();
    const emailClean = email.trim();
    const sujetClean = sujet.trim();
    const messageClean = message.trim();

    if (!nomClean || !emailClean || !sujetClean || !messageClean) {
      return NextResponse.json(
        { error: "Les champs ne peuvent pas être vides ou contenir uniquement des espaces." },
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
    if (sujetClean.length > 300) {
      return NextResponse.json(
        { error: "Le sujet ne doit pas dépasser 300 caractères." },
        { status: 400 }
      );
    }
    if (messageClean.length > 5000) {
      return NextResponse.json(
        { error: "Le message ne doit pas dépasser 5 000 caractères." },
        { status: 400 }
      );
    }

    // Insertion dans la table messages_contact
    const { error } = await supabase
      .from("messages_contact")
      .insert([{ nom: nomClean, email: emailClean, sujet: sujetClean, message: messageClean }]);

    if (error) {
      console.error("Erreur Supabase :", error.message);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi du message." },
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
