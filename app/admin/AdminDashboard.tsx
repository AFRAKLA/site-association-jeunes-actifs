"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import GrowthMark from "@/components/GrowthMark";
import ActualitesAdmin from "./ActualitesAdmin";
import EvenementsAdmin from "./EvenementsAdmin";
import GalerieAdmin from "./GalerieAdmin";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Tab = "dashboard" | "messages" | "adhesions" | "actualites" | "evenements" | "galerie";

interface Message {
  id: string;
  nom: string;
  email: string;
  sujet: string;
  message: string;
  statut: string;
  created_at: string;
}

interface Adhesion {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  statut: string;
  interet: string;
  motivation: string;
  statut_adhesion: string;
  created_at: string;
}

type StatutMessage = "non_traite" | "traite" | "repondu";
type StatutAdhesion = "en_attente" | "acceptee" | "refusee" | "info_demandee";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */


const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "dashboard", label: "Vue d'ensemble", icon: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" },
  { key: "messages", label: "Messages", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" },
  { key: "adhesions", label: "Adhésions", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
  { key: "actualites", label: "Actualités", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
  { key: "evenements", label: "Événements", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
  { key: "galerie", label: "Galerie", icon: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21Z" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function StatusDot({ label, colorClass }: { label: string; colorClass: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colorClass}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function statutMessageBadge(statut: string) {
  if (statut === "traite") {
    return <StatusDot label="Traité" colorClass="bg-gray-400" />;
  }
  if (statut === "repondu") {
    return <StatusDot label="Répondu" colorClass="bg-primary" />;
  }
  return <StatusDot label="Non traité" colorClass="bg-admin-champagne" />;
}

function statutAdhesionBadge(statut: string) {
  if (statut === "acceptee") {
    return <StatusDot label="Acceptée" colorClass="bg-primary" />;
  }
  if (statut === "refusee") {
    return <StatusDot label="Refusée" colorClass="bg-red-500" />;
  }
  if (statut === "info_demandee") {
    return <StatusDot label="Info demandée" colorClass="bg-amber-500" />;
  }
  return <StatusDot label="En attente" colorClass="bg-admin-champagne" />;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(str: string, max: number) {
  if (str.length <= max) return str;
  return str.slice(0, max) + "…";
}

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  /* Auth + données */
  // `loginPassword` n'existe que le temps de la saisie sur l'écran de
  // connexion : envoyé une seule fois à /api/admin/login, jamais conservé
  // ni renvoyé ensuite (voir Lot 5.1 — architecture par cookie de session).
  const [loginPassword, setLoginPassword] = useState("");
  // Purement visuel : bascule l'attribut `type` du champ entre "password" et
  // "text". Ne touche à aucune logique d'authentification, n'est jamais
  // envoyé ni enregistré nulle part.
  const [showPassword, setShowPassword] = useState(false);
  // Purement visuel : pilote l'apparition douce de la carte de connexion au
  // montage (voir écran de connexion plus bas).
  const [loginScreenMounted, setLoginScreenMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [adhesions, setAdhesions] = useState<Adhesion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [expandedMotivation, setExpandedMotivation] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replyingAdhesion, setReplyingAdhesion] = useState<string | null>(null);
  const [replyingAdhesionAction, setReplyingAdhesionAction] = useState<"acceptee" | "refusee" | "info_demandee" | null>(null);
  const [replyAdhesionSending, setReplyAdhesionSending] = useState(false);
  const [replyAdhesionError, setReplyAdhesionError] = useState("");

  /* Onglets */
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  /* Sidebar mobile */
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Apparition douce de l'écran de connexion au montage (purement visuel) */
  useEffect(() => {
    const id = requestAnimationFrame(() => setLoginScreenMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  /* Fermer le menu mobile avec la touche Échap */
  useEffect(() => {
    if (!sidebarOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSidebarOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  /* Stats CMS */
  const [statsActualites, setStatsActualites] = useState({ publie: 0, brouillon: 0, total: 0 });
  const [statsEvenements, setStatsEvenements] = useState({ publie: 0, brouillon: 0, aVenir: 0, total: 0 });
  const [statsGalerie, setStatsGalerie] = useState({ publie: 0, brouillon: 0, total: 0 });

  /* --- Compteurs dérivés --- */
  const messagesNonTraites = messages.filter((m) => m.statut === "non_traite").length;
  const adhesionsEnAttente = adhesions.filter((a) => a.statut_adhesion === "en_attente").length;

  /* --- Charger stats CMS après connexion --- */
  useEffect(() => {
    if (!authenticated) return;

    async function loadStats() {
      try {
        const [resAct, resEvt, resGal] = await Promise.all([
          fetch("/api/admin/actualites/list", { method: "POST" }),
          fetch("/api/admin/evenements/list", { method: "POST" }),
          fetch("/api/admin/galerie/list", { method: "POST" }),
        ]);

        const [dataAct, dataEvt, dataGal] = await Promise.all([
          resAct.json(),
          resEvt.json(),
          resGal.json(),
        ]);

        if (dataAct.actualites) {
          const list = dataAct.actualites as { statut: string }[];
          setStatsActualites({
            publie: list.filter((a) => a.statut === "publie").length,
            brouillon: list.filter((a) => a.statut === "brouillon").length,
            total: list.length,
          });
        }
        if (dataEvt.evenements) {
          const list = dataEvt.evenements as { statut: string; a_venir: boolean }[];
          setStatsEvenements({
            publie: list.filter((e) => e.statut === "publie").length,
            brouillon: list.filter((e) => e.statut === "brouillon").length,
            aVenir: list.filter((e) => e.a_venir).length,
            total: list.length,
          });
        }
        if (dataGal.photos) {
          const list = dataGal.photos as { statut: string }[];
          setStatsGalerie({
            publie: list.filter((p) => p.statut === "publie").length,
            brouillon: list.filter((p) => p.statut === "brouillon").length,
            total: list.length,
          });
        }
      } catch {
        /* silencieux */
      }
    }

    loadStats();
  }, [authenticated]);

  /* --- Handlers --- */

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const loginRes = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: loginPassword }),
      });

      const loginData = await loginRes.json();
      // Le mot de passe n'est plus jamais conservé après cet appel, qu'il
      // réussisse ou échoue.
      setLoginPassword("");

      if (!loginRes.ok) {
        setError(loginData.error || "Erreur d'authentification.");
        return;
      }

      const dataRes = await fetch("/api/admin/data", { method: "POST" });
      const data = await dataRes.json();

      if (!dataRes.ok) {
        setError(data.error || "Erreur lors du chargement des données.");
        return;
      }

      setMessages(data.messages);
      setAdhesions(data.adhesions);
      setAuthenticated(true);
    } catch {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      /* silencieux — on réinitialise l'état local dans tous les cas */
    }
    setAuthenticated(false);
    setMessages([]);
    setAdhesions([]);
    setLoginPassword("");
    setError("");
    setActiveTab("dashboard");
    setSidebarOpen(false);
  }

  async function updateMessageStatut(id: string, nouveauStatut: StatutMessage) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/update-message", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statut: nouveauStatut }),
      });
      if (!res.ok) return;
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, statut: nouveauStatut } : m))
      );
    } catch {
      /* silencieux */
    } finally {
      setUpdating(null);
    }
  }

  async function updateAdhesionStatut(id: string, nouveauStatut: StatutAdhesion) {
    setUpdating(id);
    try {
      const res = await fetch("/api/admin/update-adhesion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, statut_adhesion: nouveauStatut }),
      });
      if (!res.ok) return;
      setAdhesions((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, statut_adhesion: nouveauStatut } : a
        )
      );
    } catch {
      /* silencieux */
    } finally {
      setUpdating(null);
    }
  }

  async function handleReplyMessage(id: string, sujet: string, corps: string) {
    setReplySending(true);
    setReplyError("");
    try {
      const res = await fetch("/api/admin/reply-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, sujet, corps }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReplyError(data.error || "Erreur lors de l'envoi.");
        return;
      }
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, statut: "repondu" as StatutMessage } : m))
      );
      setReplyingTo(null);
    } catch {
      setReplyError("Erreur de connexion au serveur.");
    } finally {
      setReplySending(false);
    }
  }

  async function handleReplyAdhesion(id: string, action: "acceptee" | "refusee" | "info_demandee", sujet: string, corps: string) {
    setReplyAdhesionSending(true);
    setReplyAdhesionError("");
    try {
      const res = await fetch("/api/admin/reply-adhesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, sujet, corps }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReplyAdhesionError(data.error || "Erreur lors de l'envoi.");
        return;
      }
      setAdhesions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, statut_adhesion: action } : a))
      );
      setReplyingAdhesion(null);
      setReplyingAdhesionAction(null);
    } catch {
      setReplyAdhesionError("Erreur de connexion au serveur.");
    } finally {
      setReplyAdhesionSending(false);
    }
  }

  /* ================================================================
     ÉCRAN DE CONNEXION
     ================================================================ */

  if (!authenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-white via-[#faf9f4] to-emerald-50 px-4 py-10 sm:px-6 lg:py-16">
        {/* Décor organique de fond — purement visuel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-primary/15 blur-3xl motion-safe:animate-pulse motion-safe:[animation-duration:7s]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-emerald-200/40 blur-3xl motion-safe:animate-pulse motion-safe:[animation-duration:9s]"
        />

        <div
          className={`relative z-10 flex w-full max-w-6xl flex-col items-center gap-12 transition-[opacity,transform] duration-700 motion-reduce:transition-none motion-reduce:transform-none lg:grid lg:grid-cols-[minmax(0,1fr)_448px] lg:items-center lg:gap-0 ${
            loginScreenMounted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          {/* ---- Colonne identité + éditorial, avec la photo intégrée en fond (desktop) ---- */}
          <div className="relative hidden lg:flex lg:h-[600px] lg:w-full lg:flex-col lg:justify-between">
            {/* Photo associative — bord droit aligné sur la colonne, déborde vers le bord de page à gauche/haut/bas */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute -top-16 -bottom-16 -left-[7vw] right-0 overflow-hidden transition-opacity duration-1000 motion-reduce:transition-none ${
                loginScreenMounted ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src="/images/accueil/valeurs-esprit-equipe.jpg"
                alt=""
                fill
                sizes="45vw"
                priority
                className="object-cover"
              />
              {/* Fondus très localisés — la photo reste visible, détaillée et saturée au centre */}
              <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white via-white/60 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white/90 via-white/30 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-r from-transparent to-[#faf9f4]" />
            </div>

            <div className="relative z-10 flex items-center gap-4 pr-16">
              <Image
                src="/images/logo-jeunes-actifs-cropped.jpeg"
                alt="Logo Jeunes Actifs"
                width={64}
                height={64}
                priority
                className="h-16 w-16 rounded-full object-contain shadow-md ring-4 ring-white"
              />
              <div>
                <p className="text-4xl font-extrabold tracking-tight text-foreground [text-shadow:0_2px_20px_rgba(255,255,255,0.95)]">
                  Jeunes Actifs
                </p>
                <p className="mt-1 text-base font-medium text-primary [text-shadow:0_2px_20px_rgba(255,255,255,0.95)]">
                  Espace d&apos;administration sécurisé
                </p>
              </div>
            </div>

            {/* Message associatif — élément éditorial léger, plus une carte */}
            <div className="relative z-10 flex items-center gap-3 pr-16">
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-primary backdrop-blur-sm"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground [text-shadow:0_1px_14px_rgba(255,255,255,0.95)]">
                  Agir ensemble pour un avenir solidaire
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-foreground/70 [text-shadow:0_1px_14px_rgba(255,255,255,0.95)]">
                  Ensemble pour une jeunesse engagée, solidaire et responsable.
                </p>
              </div>
            </div>
          </div>

          {/* ---- Identité compacte (mobile uniquement) ---- */}
          <div className="text-center lg:hidden">
            <Image
              src="/images/logo-jeunes-actifs-cropped.jpeg"
              alt="Logo Jeunes Actifs"
              width={56}
              height={56}
              priority
              className="mx-auto h-14 w-14 rounded-full object-contain shadow-sm"
            />
            <p className="mt-3 text-lg font-bold text-foreground">Jeunes Actifs</p>
            <p className="text-sm font-medium text-primary">Espace d&apos;administration sécurisé</p>
          </div>

          {/* ---- Carte de connexion — élément principal, en léger surplomb sur la photo ---- */}
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-9 shadow-[0_30px_70px_-20px_rgba(16,54,32,0.28)] ring-1 ring-black/5 sm:p-11 lg:-ml-28">
            <div className="flex flex-col items-center text-center">
              {/* Badge cadenas + décor organique très discret */}
              <div className="relative flex h-20 w-20 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-[42%_58%_65%_35%/55%_35%_65%_45%] bg-gradient-to-br from-primary/15 via-emerald-100 to-primary/10 motion-safe:animate-pulse motion-safe:[animation-duration:5s]"
                />
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1.5 h-4 w-4 rotate-45 rounded-tl-full rounded-br-full bg-primary/25"
                />
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 -left-2 h-3 w-3 -rotate-12 rounded-tl-full rounded-br-full bg-emerald-300/40"
                />
                <span
                  aria-hidden="true"
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-primary/10"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </span>
              </div>
              <h1 className="mt-5 text-xl font-bold text-foreground">
                Connexion à l&apos;espace admin
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Accédez à votre tableau de bord et gérez l&apos;association en toute sécurité.
              </p>
            </div>

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-2 block text-sm font-semibold text-foreground"
                >
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="admin-password"
                    required
                    autoFocus
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Entrez le mot de passe"
                    className="w-full rounded-xl border border-muted bg-background px-4 py-3.5 pr-12 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg motion-safe:active:scale-[0.99] motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                {loading ? "Connexion…" : "Se connecter"}
              </button>

              {error && (
                <p role="alert" className="admin-reveal rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
                  {error}
                </p>
              )}
            </form>

            <div className="mt-6 flex items-center gap-3 text-muted-foreground">
              <span aria-hidden="true" className="h-px flex-1 bg-muted" />
              <svg aria-hidden="true" className="h-4 w-4 shrink-0 text-primary/60" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286z" />
              </svg>
              <span aria-hidden="true" className="h-px flex-1 bg-muted" />
            </div>

            <Link
              href="/"
              className="mt-4 block text-center text-sm font-medium text-muted-foreground transition hover:text-primary"
            >
              ← Retour au site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================
     LAYOUT ADMIN — SIDEBAR + CONTENU
     ================================================================ */

  const messagesNonTraitesList = messages.filter((m) => m.statut === "non_traite").slice(0, 3);
  const adhesionsEnAttenteList = adhesions.filter((a) => a.statut_adhesion === "en_attente").slice(0, 3);
  const aTraiter = messagesNonTraitesList.length + adhesionsEnAttenteList.length;
  const activeLabel = TABS.find((t) => t.key === activeTab)?.label ?? "";

  return (
    <div className="flex min-h-screen bg-admin-ivory-warm">
      {/* ---- Overlay mobile ---- */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Fermer le menu"
          className="fixed inset-0 z-20 bg-admin-forest/40 backdrop-blur-[2px] transition-opacity duration-200 ease-out-strong md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---- Sidebar ---- */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 flex-col overflow-hidden bg-admin-forest transition-transform duration-200 ease-drawer motion-reduce:transition-none md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Décor — profondeur douce + signature Canopée en filigrane,
            étendue pour respirer derrière la zone de branding aussi */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-admin-forest-light/40 blur-3xl"
        />
        <GrowthMark className="pointer-events-none absolute -bottom-16 -left-16 h-[26rem] w-[26rem] rotate-12 text-admin-champagne/[0.06]" />

        {/* Identité — le symbole porte sa propre présence, plus de pastille
            qui l'enferme ; composition verticale, éditoriale */}
        <div className="relative flex flex-col items-start gap-4 px-6 pb-7 pt-9">
          <Image
            src="/images/logo-symbole-jeunes-actifs.png"
            alt="Jeunes Actifs"
            width={323}
            height={394}
            priority
            className="h-16 w-auto drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
          />
          <div>
            <h2 className="text-xl font-semibold leading-tight tracking-tight text-admin-ivory">Jeunes Actifs</h2>
            <div className="mt-2 flex items-center gap-2">
              <span aria-hidden="true" className="h-px w-3 bg-admin-champagne/60" />
              <p className="text-[11px] font-medium text-admin-ivory/45">Administration</p>
            </div>
          </div>
        </div>

        <div className="mx-6 h-px bg-gradient-to-r from-admin-champagne/40 via-admin-champagne/10 to-transparent" />

        {/* Navigation */}
        <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-4 py-5">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const badge =
              tab.key === "messages" && messagesNonTraites > 0
                ? messagesNonTraites
                : tab.key === "adhesions" && adhesionsEnAttente > 0
                  ? adhesionsEnAttente
                  : 0;

            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setSidebarOpen(false);
                }}
                className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/50 ${
                  isActive
                    ? "bg-admin-forest-light/70 font-medium text-admin-ivory shadow-[inset_0_1px_0_rgba(201,168,106,0.16)]"
                    : "text-admin-ivory/60 hover:bg-admin-forest-light/40 hover:text-admin-ivory/90"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1/2 h-5 w-[2.5px] -translate-y-1/2 rounded-full bg-admin-champagne transition-transform duration-150 ease-out-strong ${
                    isActive ? "scale-y-100" : "scale-y-0"
                  }`}
                />
                <svg
                  className={`h-[18px] w-[18px] shrink-0 transition-colors duration-150 ${isActive ? "text-admin-champagne" : "text-admin-ivory/40 group-hover:text-admin-ivory/70"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span className="flex-1 text-left">{tab.label}</span>
                {badge > 0 && (
                  <span className="rounded-full bg-admin-champagne px-1.5 py-0.5 text-[11px] font-semibold text-admin-forest">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mx-6 h-px bg-gradient-to-r from-admin-champagne/40 via-admin-champagne/10 to-transparent" />

        {/* Footer sidebar */}
        <div className="relative px-4 py-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-admin-ivory/60 transition-colors duration-150 hover:bg-admin-forest-light/40 hover:text-admin-ivory/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Voir le site
          </a>
        </div>

        {/* Admin profile + déconnexion */}
        <div className="relative border-t border-admin-champagne/15 px-6 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-champagne/15 text-xs font-semibold text-admin-champagne ring-1 ring-admin-champagne/30">
                AD
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-admin-ivory">Admin</p>
                <p className="text-xs text-admin-ivory/50">Administrateur</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Déconnexion"
              title="Déconnexion"
              className="shrink-0 rounded-lg p-2 text-admin-ivory/50 transition-colors duration-150 hover:bg-admin-forest-light/40 hover:text-admin-ivory/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/50"
            >
              <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ---- Zone principale ---- */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header — barre utilitaire : menu mobile + titre de section (masqué
            sur la Vue d'ensemble, qui porte son propre en-tête éditorial ;
            inchangé pour les autres onglets, hors périmètre de cette passe).
            La déconnexion vit désormais dans le pied de sidebar. */}
        <header
          className={`flex items-center gap-3 border-b border-admin-champagne-soft/60 bg-admin-ivory px-6 py-4 ${
            activeTab === "dashboard" ? "md:hidden" : ""
          }`}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-admin-forest/60 transition-colors duration-150 hover:bg-admin-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:hidden"
            aria-label="Ouvrir le menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          {activeTab !== "dashboard" && (
            <h1 className="text-xl font-semibold tracking-tight text-admin-forest">{activeLabel}</h1>
          )}
        </header>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div key={activeTab} className="admin-section-enter mx-auto max-w-6xl">
            {activeTab === "dashboard" && (
              <DashboardView
                messagesNonTraites={messagesNonTraites}
                adhesionsEnAttente={adhesionsEnAttente}
                statsActualites={statsActualites}
                statsEvenements={statsEvenements}
                statsGalerie={statsGalerie}
                messagesNonTraitesList={messagesNonTraitesList}
                adhesionsEnAttenteList={adhesionsEnAttenteList}
                aTraiter={aTraiter}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === "messages" && (
              <MessagesSection
                messages={messages}
                updating={updating}
                expandedMessage={expandedMessage}
                replyingTo={replyingTo}
                replySending={replySending}
                replyError={replyError}
                onToggleStatut={updateMessageStatut}
                onExpand={setExpandedMessage}
                onReply={setReplyingTo}
                onSendReply={handleReplyMessage}
              />
            )}

            {activeTab === "adhesions" && (
              <AdhesionsSection
                adhesions={adhesions}
                updating={updating}
                expandedMotivation={expandedMotivation}
                replyingAdhesion={replyingAdhesion}
                replyingAdhesionAction={replyingAdhesionAction}
                replyAdhesionSending={replyAdhesionSending}
                replyAdhesionError={replyAdhesionError}
                onToggleStatut={updateAdhesionStatut}
                onExpand={setExpandedMotivation}
                onReply={setReplyingAdhesion}
                onReplyAction={setReplyingAdhesionAction}
                onSendReply={handleReplyAdhesion}
              />
            )}

            {activeTab === "actualites" && <ActualitesAdmin />}
            {activeTab === "evenements" && <EvenementsAdmin />}
            {activeTab === "galerie" && <GalerieAdmin />}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================================================================
   VUE D'ENSEMBLE
   ================================================================== */

function DashboardView({
  messagesNonTraites,
  adhesionsEnAttente,
  statsActualites,
  statsEvenements,
  statsGalerie,
  messagesNonTraitesList,
  adhesionsEnAttenteList,
  aTraiter,
  onNavigate,
}: {
  messagesNonTraites: number;
  adhesionsEnAttente: number;
  statsActualites: { publie: number; brouillon: number; total: number };
  statsEvenements: { publie: number; brouillon: number; aVenir: number; total: number };
  statsGalerie: { publie: number; brouillon: number; total: number };
  messagesNonTraitesList: Message[];
  adhesionsEnAttenteList: Adhesion[];
  aTraiter: number;
  onNavigate: (tab: Tab) => void;
}) {
  const kpis: { label: string; value: number; tab: Tab; icon: string }[] = [
    { label: "Messages non traités", value: messagesNonTraites, tab: "messages", icon: TABS.find((t) => t.key === "messages")!.icon },
    { label: "Adhésions en attente", value: adhesionsEnAttente, tab: "adhesions", icon: TABS.find((t) => t.key === "adhesions")!.icon },
    { label: "Actualités publiées", value: statsActualites.publie, tab: "actualites", icon: TABS.find((t) => t.key === "actualites")!.icon },
    { label: "Événements à venir", value: statsEvenements.aVenir, tab: "evenements", icon: TABS.find((t) => t.key === "evenements")!.icon },
    { label: "Photos en galerie", value: statsGalerie.publie, tab: "galerie", icon: TABS.find((t) => t.key === "galerie")!.icon },
  ];

  const todayLabel = (() => {
    const raw = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  return (
    <div className="space-y-10">
      {/* ---- En-tête éditorial ---- */}
      <section className="relative overflow-hidden">
        <GrowthMark
          className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rotate-[8deg] text-admin-champagne/[0.16] sm:h-52 sm:w-52"
        />
        <p className="relative text-xs font-medium uppercase tracking-[0.16em] text-admin-champagne">
          {todayLabel}
        </p>
        <h2 className="relative mt-2 max-w-xl text-[2rem] font-semibold leading-[1.1] tracking-tight text-admin-ink sm:text-[2.5rem]">
          Bonjour, Administrateur
        </h2>
        <p className="relative mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
          Un aperçu de l&apos;activité de l&apos;association, en un coup d&apos;œil.
        </p>
      </section>

      {/* ---- À traiter — bloc prioritaire, seule surface foncée de la vue ---- */}
      <section>
        <div
          className={`relative overflow-hidden rounded-2xl p-6 transition-colors duration-200 sm:p-7 ${
            aTraiter > 0
              ? "bg-admin-forest"
              : "border border-admin-champagne-soft/60 bg-white"
          }`}
        >
          {aTraiter > 0 && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full bg-admin-forest-light/50 blur-3xl"
            />
          )}
          <div className="relative flex items-center justify-between gap-4">
            <h3 className={`text-base font-semibold tracking-tight ${aTraiter > 0 ? "text-admin-ivory" : "text-admin-forest"}`}>
              À traiter
            </h3>
            {aTraiter > 0 && (
              <span className="rounded-full bg-admin-champagne px-2.5 py-0.5 text-xs font-semibold text-admin-forest">
                {aTraiter}
              </span>
            )}
          </div>

          {aTraiter === 0 ? (
            <div className="relative mt-4 flex items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-admin-ivory-warm ring-1 ring-admin-champagne-soft">
                <svg className="h-5 w-5 text-admin-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-medium text-admin-forest">Tout est à jour</p>
                <p className="text-sm text-muted-foreground">Aucun message ni demande d&apos;adhésion en attente.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="relative mt-5 grid gap-3 sm:grid-cols-2">
                {messagesNonTraites > 0 && (
                  <button
                    onClick={() => onNavigate("messages")}
                    className="group flex items-center justify-between gap-3 rounded-xl bg-white/[0.07] px-4 py-3.5 text-left transition-colors duration-150 ease-out-strong hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/60"
                  >
                    <span className="flex items-center gap-3">
                      <svg className="h-5 w-5 shrink-0 text-admin-champagne" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                      <span className="text-sm text-admin-ivory/90">
                        {messagesNonTraites} message{messagesNonTraites !== 1 ? "s" : ""} non traité{messagesNonTraites !== 1 ? "s" : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium text-admin-champagne transition-transform duration-150 ease-out-strong group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                )}

                {adhesionsEnAttente > 0 && (
                  <button
                    onClick={() => onNavigate("adhesions")}
                    className="group flex items-center justify-between gap-3 rounded-xl bg-white/[0.07] px-4 py-3.5 text-left transition-colors duration-150 ease-out-strong hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/60"
                  >
                    <span className="flex items-center gap-3">
                      <svg className="h-5 w-5 shrink-0 text-admin-champagne" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      <span className="text-sm text-admin-ivory/90">
                        {adhesionsEnAttente} demande{adhesionsEnAttente !== 1 ? "s" : ""} d&apos;adhésion en attente
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium text-admin-champagne transition-transform duration-150 ease-out-strong group-hover:translate-x-0.5">
                      →
                    </span>
                  </button>
                )}
              </div>

              {(messagesNonTraitesList.length > 0 || adhesionsEnAttenteList.length > 0) && (
                <div className="relative mt-5 grid gap-4 border-t border-white/10 pt-5 sm:grid-cols-2">
                  {messagesNonTraitesList.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-admin-ivory/45">
                        Derniers messages
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {messagesNonTraitesList.map((m) => (
                          <div key={m.id} className="text-sm text-admin-ivory/80">
                            <span className="font-medium text-admin-ivory">{m.sujet}</span>
                            <span className="text-admin-ivory/50"> — {m.nom}, {formatDate(m.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {adhesionsEnAttenteList.length > 0 && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-admin-ivory/45">
                        Dernières demandes
                      </p>
                      <div className="mt-2 space-y-1.5">
                        {adhesionsEnAttenteList.map((a) => (
                          <div key={a.id} className="text-sm text-admin-ivory/80">
                            <span className="font-medium text-admin-ivory">{a.nom}</span>
                            <span className="text-admin-ivory/50"> — {a.email}, {formatDate(a.created_at)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ---- Bande de statistiques — composition ouverte, pas cinq cartes identiques ---- */}
      <section>
        <div className="flex items-center gap-3">
          <h3 className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Vue d&apos;ensemble
          </h3>
          <div aria-hidden="true" className="h-px flex-1 bg-admin-champagne-soft/60" />
        </div>
        <div className="mt-4 flex flex-wrap border-y border-admin-champagne-soft/60">
          {kpis.map((kpi, i) => (
            <button
              key={kpi.label}
              onClick={() => onNavigate(kpi.tab)}
              className={`group min-w-[9rem] flex-1 px-5 py-5 text-left transition-colors duration-150 ease-out-strong hover:bg-admin-ivory-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                i > 0 ? "border-t border-admin-champagne-soft/60 sm:border-t-0 sm:border-l" : ""
              }`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-admin-ivory-warm ring-1 ring-admin-champagne-soft transition-colors duration-150 ease-out-strong group-hover:ring-admin-champagne">
                <svg className="h-[18px] w-[18px] text-admin-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={kpi.icon} />
                </svg>
              </span>
              <p className="mt-3.5 text-[1.75rem] font-semibold leading-none tracking-tight tabular-nums text-admin-ink">
                {kpi.value}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{kpi.label}</p>
            </button>
          ))}
        </div>
      </section>

      {/* ---- Contenu du site — liste éditoriale ---- */}
      <section>
        <div className="flex items-center gap-3">
          <h3 className="shrink-0 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Contenu du site
          </h3>
          <div aria-hidden="true" className="h-px flex-1 bg-admin-champagne-soft/60" />
        </div>
        <div className="mt-4 divide-y divide-admin-champagne-soft/50">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-ivory-warm ring-1 ring-admin-champagne-soft">
                <svg className="h-[18px] w-[18px] text-admin-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Actualités</p>
                <p className="text-xs text-muted-foreground">
                  {statsActualites.publie} publié{statsActualites.publie !== 1 ? "es" : "e"} · {statsActualites.brouillon} brouillon{statsActualites.brouillon !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate("actualites")} className="text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
              Gérer →
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-ivory-warm ring-1 ring-admin-champagne-soft">
                <svg className="h-[18px] w-[18px] text-admin-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Événements</p>
                <p className="text-xs text-muted-foreground">
                  {statsEvenements.publie} publié{statsEvenements.publie !== 1 ? "s" : ""} · {statsEvenements.brouillon} brouillon{statsEvenements.brouillon !== 1 ? "s" : ""} · {statsEvenements.aVenir} à venir
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate("evenements")} className="text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
              Gérer →
            </button>
          </div>

          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-admin-ivory-warm ring-1 ring-admin-champagne-soft">
                <svg className="h-[18px] w-[18px] text-admin-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">Galerie</p>
                <p className="text-xs text-muted-foreground">
                  {statsGalerie.publie} photo{statsGalerie.publie !== 1 ? "s" : ""} publié{statsGalerie.publie !== 1 ? "es" : "e"}
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate("galerie")} className="text-sm font-medium text-primary transition-colors duration-150 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded">
              Gérer →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ==================================================================
   SECTION MESSAGES
   ================================================================== */

function MessagesSection({
  messages,
  updating,
  expandedMessage,
  replyingTo,
  replySending,
  replyError,
  onToggleStatut,
  onExpand,
  onReply,
  onSendReply,
}: {
  messages: Message[];
  updating: string | null;
  expandedMessage: string | null;
  replyingTo: string | null;
  replySending: boolean;
  replyError: string;
  onToggleStatut: (id: string, statut: StatutMessage) => void;
  onExpand: (id: string | null) => void;
  onReply: (id: string | null) => void;
  onSendReply: (id: string, sujet: string, corps: string) => Promise<void>;
}) {
  const nonTraites = messages.filter((m) => m.statut === "non_traite").length;

  return (
    <div>
      {/* En-tête éditorial */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
          {nonTraites > 0 && (
            <>
              {" · "}
              <span className="font-medium text-admin-forest">{nonTraites} non traité{nonTraites !== 1 ? "s" : ""}</span>
            </>
          )}
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-admin-champagne-soft bg-admin-ivory-warm/60 px-4 py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-admin-champagne-soft">
            <svg className="h-5 w-5 text-admin-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </span>
          <p className="text-sm text-muted-foreground">Aucun message pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {messages.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              updating={updating}
              expanded={expandedMessage === m.id}
              isReplying={replyingTo === m.id}
              replySending={replySending}
              replyError={replyError}
              onToggleStatut={onToggleStatut}
              onExpand={onExpand}
              onReply={onReply}
              onSendReply={onSendReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Carte message individuel + formulaire de réponse
   ------------------------------------------------------------------ */

function MessageCard({
  message,
  updating,
  expanded,
  isReplying,
  replySending,
  replyError,
  onToggleStatut,
  onExpand,
  onReply,
  onSendReply,
}: {
  message: Message;
  updating: string | null;
  expanded: boolean;
  isReplying: boolean;
  replySending: boolean;
  replyError: string;
  onToggleStatut: (id: string, statut: StatutMessage) => void;
  onExpand: (id: string | null) => void;
  onReply: (id: string | null) => void;
  onSendReply: (id: string, sujet: string, corps: string) => Promise<void>;
}) {
  const defaultSujet = `Re: ${message.sujet}`;
  const defaultCorps = `Bonjour ${message.nom},\n\nMerci pour votre message. Nous avons bien pris connaissance de votre demande.\n\nCordialement,\nL'équipe Jeunes Actifs`;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const sujet = (form.elements.namedItem("reply-sujet") as HTMLInputElement).value;
    const corps = (form.elements.namedItem("reply-corps") as HTMLTextAreaElement).value;
    onSendReply(message.id, sujet, corps);
  }

  return (
    <div className="rounded-xl border border-admin-champagne-soft/60 bg-white p-4 transition-shadow duration-200 hover:shadow-[0_2px_16px_-4px_rgba(20,48,31,0.1)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {statutMessageBadge(message.statut)}
            <span className="text-xs text-muted-foreground">{formatDate(message.created_at)}</span>
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold text-admin-ink">{message.sujet}</p>
          <p className="truncate text-sm text-muted-foreground">
            {message.nom} · {message.email}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            onClick={() => onReply(isReplying ? null : message.id)}
            className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {isReplying ? "Annuler" : "Répondre"}
          </button>
          <button
            onClick={() =>
              onToggleStatut(message.id, message.statut === "traite" ? "non_traite" : "traite")
            }
            disabled={updating === message.id}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              message.statut === "traite"
                ? "border border-admin-forest/20 text-admin-forest hover:bg-admin-forest/5"
                : "bg-primary text-white hover:bg-primary-dark"
            }`}
          >
            {updating === message.id
              ? "…"
              : message.statut === "traite"
                ? "Marquer non traité"
                : "Marquer traité"}
          </button>
        </div>
      </div>

      {/* Corps du message */}
      <div className="mt-2">
        {expanded ? (
          <div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {message.message}
            </p>
            <button
              onClick={() => onExpand(null)}
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              Voir moins
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground/90">
              {truncate(message.message, 150)}
            </p>
            {message.message.length > 150 && (
              <button
                onClick={() => onExpand(message.id)}
                className="mt-1 text-xs font-medium text-primary hover:underline"
              >
                Voir tout le message
              </button>
            )}
          </div>
        )}
      </div>

      {/* Formulaire de réponse */}
      {isReplying && (
        <form
          onSubmit={handleSubmit}
          className="admin-reveal mt-4 space-y-3 rounded-xl border border-admin-champagne-soft bg-admin-ivory-warm/70 p-4"
        >
          <div>
            <label htmlFor={`reply-sujet-${message.id}`} className="mb-1 block text-xs font-medium text-foreground/80">
              Sujet
            </label>
            <input
              type="text"
              id={`reply-sujet-${message.id}`}
              name="reply-sujet"
              defaultValue={defaultSujet}
              required
              maxLength={300}
              className="w-full rounded-lg border border-admin-champagne-soft bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor={`reply-corps-${message.id}`} className="mb-1 block text-xs font-medium text-foreground/80">
              Réponse
            </label>
            <textarea
              id={`reply-corps-${message.id}`}
              name="reply-corps"
              defaultValue={defaultCorps}
              required
              rows={6}
              maxLength={50000}
              className="w-full rounded-lg border border-admin-champagne-soft bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {replyError && isReplying && (
            <p className="admin-reveal text-xs text-red-600">{replyError}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onReply(null)}
              className="rounded-lg border border-admin-champagne-soft px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={replySending}
              className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-150 motion-safe:active:scale-[0.97] hover:bg-primary-dark disabled:opacity-50"
            >
              {replySending ? "Envoi en cours…" : "Envoyer la réponse"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ==================================================================
   SECTION ADHÉSIONS
   ================================================================== */

function AdhesionsSection({
  adhesions,
  updating,
  expandedMotivation,
  replyingAdhesion,
  replyingAdhesionAction,
  replyAdhesionSending,
  replyAdhesionError,
  onToggleStatut,
  onExpand,
  onReply,
  onReplyAction,
  onSendReply,
}: {
  adhesions: Adhesion[];
  updating: string | null;
  expandedMotivation: string | null;
  replyingAdhesion: string | null;
  replyingAdhesionAction: "acceptee" | "refusee" | "info_demandee" | null;
  replyAdhesionSending: boolean;
  replyAdhesionError: string;
  onToggleStatut: (id: string, statut: StatutAdhesion) => void;
  onExpand: (id: string | null) => void;
  onReply: (id: string | null) => void;
  onReplyAction: (action: "acceptee" | "refusee" | "info_demandee" | null) => void;
  onSendReply: (id: string, action: "acceptee" | "refusee" | "info_demandee", sujet: string, corps: string) => Promise<void>;
}) {
  const enAttente = adhesions.filter((a) => a.statut_adhesion === "en_attente").length;

  return (
    <div>
      {/* En-tête éditorial */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {adhesions.length} demande{adhesions.length !== 1 ? "s" : ""}
          {enAttente > 0 && (
            <>
              {" · "}
              <span className="font-medium text-admin-forest">{enAttente} en attente</span>
            </>
          )}
        </p>
      </div>

      {adhesions.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-admin-champagne-soft bg-admin-ivory-warm/60 px-4 py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-admin-champagne-soft">
            <svg className="h-5 w-5 text-admin-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </span>
          <p className="text-sm text-muted-foreground">Aucune demande pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {adhesions.map((a) => (
            <AdhesionCard
              key={a.id}
              adhesion={a}
              updating={updating}
              expanded={expandedMotivation === a.id}
              isReplying={replyingAdhesion === a.id}
              replyAction={replyingAdhesionAction}
              replySending={replyAdhesionSending}
              replyError={replyAdhesionError}
              onToggleStatut={onToggleStatut}
              onExpand={onExpand}
              onReply={onReply}
              onReplyAction={onReplyAction}
              onSendReply={onSendReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   Carte adhésion individuelle + formulaire de réponse
   ------------------------------------------------------------------ */

type ReplyAction = "acceptee" | "refusee" | "info_demandee";

const REPLY_ACTION_LABELS: Record<ReplyAction, string> = {
  acceptee: "Accepter",
  refusee: "Refuser",
  info_demandee: "Demander infos",
};

const REPLY_ACTION_STYLES: Record<ReplyAction, string> = {
  acceptee: "border border-primary/30 text-primary hover:bg-primary/5",
  refusee: "border border-red-300 text-red-600 hover:bg-red-50",
  info_demandee: "border border-amber-400 text-amber-700 hover:bg-amber-50",
};

const REPLY_DEFAULTS: Record<ReplyAction, { sujet: string; corps: string }> = {
  acceptee: {
    sujet: "Votre demande d'adhésion a été acceptée",
    corps: "Félicitations ! Votre demande d'adhésion à l'Association Jeunes Actifs a été acceptée.\n\nNous sommes ravis de vous compter parmi nos membres.\n\nNous vous contacterons prochainement pour les prochaines étapes.\n\nCordialement,\nL'équipe Jeunes Actifs",
  },
  refusee: {
    sujet: "Réponse à votre demande d'adhésion",
    corps: "Bonjour,\n\nNous avons bien reçu votre demande d'adhésion.\n\nAprès examen, nous sommes au regret de vous informer que votre demande n'a pas pu être retenue pour le moment.\n\nNous vous remercions de votre intérêt et restons à votre disposition pour toute question.\n\nCordialement,\nL'équipe Jeunes Actifs",
  },
  info_demandee: {
    sujet: "Informations complémentaires — votre demande d'adhésion",
    corps: "Bonjour,\n\nNous avons bien reçu votre demande d'adhésion.\n\nPour poursuivre l'examen de votre dossier, nous aurions besoin d'informations complémentaires.\n\nPourriez-vous nous préciser :\n\nCordialement,\nL'équipe Jeunes Actifs",
  },
};

function AdhesionCard({
  adhesion,
  updating,
  expanded,
  isReplying,
  replyAction,
  replySending,
  replyError,
  onToggleStatut,
  onExpand,
  onReply,
  onReplyAction,
  onSendReply,
}: {
  adhesion: Adhesion;
  updating: string | null;
  expanded: boolean;
  isReplying: boolean;
  replyAction: ReplyAction | null;
  replySending: boolean;
  replyError: string;
  onToggleStatut: (id: string, statut: StatutAdhesion) => void;
  onExpand: (id: string | null) => void;
  onReply: (id: string | null) => void;
  onReplyAction: (action: ReplyAction | null) => void;
  onSendReply: (id: string, action: ReplyAction, sujet: string, corps: string) => Promise<void>;
}) {
  function handleActionClick(action: ReplyAction) {
    if (isReplying && replyAction === action) {
      // Même action → on annule
      onReply(null);
      onReplyAction(null);
    } else {
      onReply(adhesion.id);
      onReplyAction(action);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!replyAction) return;
    const form = e.currentTarget as HTMLFormElement;
    const sujet = (form.elements.namedItem("adh-reply-sujet") as HTMLInputElement).value;
    const corps = (form.elements.namedItem("adh-reply-corps") as HTMLTextAreaElement).value;
    onSendReply(adhesion.id, replyAction, sujet, corps);
  }

  const defaults = replyAction ? REPLY_DEFAULTS[replyAction] : null;

  return (
    <div className="rounded-xl border border-admin-champagne-soft/60 bg-white p-4 transition-shadow duration-200 hover:shadow-[0_2px_16px_-4px_rgba(20,48,31,0.1)] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            {statutAdhesionBadge(adhesion.statut_adhesion)}
            <span className="text-xs text-muted-foreground">{formatDate(adhesion.created_at)}</span>
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold text-admin-ink">{adhesion.nom}</p>
          <div className="mt-0.5 flex flex-wrap gap-x-4 text-sm text-muted-foreground">
            <span>{adhesion.email}</span>
            {adhesion.telephone && <span>{adhesion.telephone}</span>}
            <span>{adhesion.statut}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => onToggleStatut(adhesion.id, "en_attente")}
            disabled={updating === adhesion.id || adhesion.statut_adhesion === "en_attente"}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors duration-150 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
              adhesion.statut_adhesion === "en_attente"
                ? "bg-admin-champagne/25 text-admin-forest"
                : "border border-admin-champagne-soft text-muted-foreground hover:bg-admin-ivory-warm"
            }`}
          >
            En attente
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        <span className="text-muted-foreground/70">Intérêt : </span>{adhesion.interet}
      </div>

      {/* Motivation */}
      <div className="mt-1">
        {expanded ? (
          <div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {adhesion.motivation}
            </p>
            <button
              onClick={() => onExpand(null)}
              className="mt-1 text-xs font-medium text-primary hover:underline"
            >
              Voir moins
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed text-muted-foreground/90">
              {truncate(adhesion.motivation, 150)}
            </p>
            {adhesion.motivation.length > 150 && (
              <button
                onClick={() => onExpand(adhesion.id)}
                className="mt-1 text-xs font-medium text-primary hover:underline"
              >
                Voir toute la motivation
              </button>
            )}
          </div>
        )}
      </div>

      {/* Boutons d'action avec email */}
      {!isReplying && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(["acceptee", "refusee", "info_demandee"] as ReplyAction[]).map((action) => (
            <button
              key={action}
              onClick={() => handleActionClick(action)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${REPLY_ACTION_STYLES[action]}`}
            >
              {REPLY_ACTION_LABELS[action]}
            </button>
          ))}
        </div>
      )}

      {/* Formulaire de réponse */}
      {isReplying && defaults && (
        <form onSubmit={handleSubmit} className="admin-reveal mt-4 space-y-3 rounded-xl border border-admin-champagne-soft bg-admin-ivory-warm/70 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            Action : <span className="text-admin-forest">{REPLY_ACTION_LABELS[replyAction!]}</span>
          </div>
          <div>
            <label htmlFor={`adh-reply-sujet-${adhesion.id}`} className="mb-1 block text-xs font-medium text-foreground/80">
              Sujet
            </label>
            <input
              type="text"
              id={`adh-reply-sujet-${adhesion.id}`}
              name="adh-reply-sujet"
              defaultValue={defaults.sujet}
              required
              maxLength={300}
              className="w-full rounded-lg border border-admin-champagne-soft bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label htmlFor={`adh-reply-corps-${adhesion.id}`} className="mb-1 block text-xs font-medium text-foreground/80">
              Message
            </label>
            <textarea
              id={`adh-reply-corps-${adhesion.id}`}
              name="adh-reply-corps"
              defaultValue={defaults.corps}
              required
              rows={6}
              maxLength={50000}
              className="w-full rounded-lg border border-admin-champagne-soft bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {replyError && isReplying && (
            <p className="admin-reveal text-xs text-red-600">{replyError}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { onReply(null); onReplyAction(null); }}
              className="rounded-lg border border-admin-champagne-soft px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={replySending}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-150 motion-safe:active:scale-[0.97] disabled:opacity-50 ${
                replyAction === "acceptee"
                  ? "bg-primary hover:bg-primary-dark"
                  : replyAction === "refusee"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-amber-500 hover:bg-amber-600"
              }`}
            >
              {replySending ? "Envoi en cours…" : "Envoyer"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
