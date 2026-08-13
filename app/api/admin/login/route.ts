import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/admin-session";
import { constantTimeEqual } from "@/lib/constant-time-equal";
import { checkRateLimitFailClosed } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";
import { isOriginAllowed } from "@/lib/check-origin";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 15 * 60; // 15 minutes

export async function POST(request: Request) {
  try {
    if (!isOriginAllowed(request)) {
      return NextResponse.json({ error: "Origine non autorisée." }, { status: 403 });
    }

    const ip = getClientIp(request);

    // --- Rate limiting FAIL-CLOSED : toute panne du limiteur refuse la connexion ---
    let rateLimit;
    try {
      rateLimit = await checkRateLimitFailClosed("admin-login", ip, MAX_ATTEMPTS, WINDOW_SECONDS);
    } catch (e) {
      console.error(
        "[admin-login] Rate limiter indisponible — connexion refusée par défaut (fail-closed) :",
        (e as Error).message
      );
      return NextResponse.json(
        { error: "Service temporairement indisponible. Réessayez plus tard." },
        { status: 503 }
      );
    }

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives. Réessayez plus tard." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      );
    }

    // --- Comparaison du mot de passe (temps constant) ---
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("[admin-login] ADMIN_PASSWORD n'est pas configuré côté serveur.");
      return NextResponse.json({ error: "Configuration serveur invalide." }, { status: 500 });
    }

    const body = await request.json().catch(() => null);
    const password = body && typeof body.password === "string" ? body.password : "";

    if (!password || !constantTimeEqual(password, adminPassword)) {
      return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
    }

    // --- Session ---
    const token = createSessionToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
