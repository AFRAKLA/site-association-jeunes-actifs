"use client";

import { useState, useEffect, type FormEvent } from "react";
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

function statutMessageBadge(statut: string) {
  if (statut === "traite") {
    return (
      <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-green-600">
        Traité
      </span>
    );
  }
  if (statut === "repondu") {
    return (
      <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        Répondu
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
      Non traité
    </span>
  );
}

function statutAdhesionBadge(statut: string) {
  if (statut === "acceptee") {
    return (
      <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
        Acceptée
      </span>
    );
  }
  if (statut === "refusee") {
    return (
      <span className="inline-flex items-center rounded border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
        Refusée
      </span>
    );
  }
  if (statut === "info_demandee") {
    return (
      <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
        Info demandée
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
      En attente
    </span>
  );
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
  const [password, setPassword] = useState("");
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
          fetch("/api/admin/actualites/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          }),
          fetch("/api/admin/evenements/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          }),
          fetch("/api/admin/galerie/list", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
          }),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated]);

  /* --- Handlers --- */

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur d'authentification.");
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

  function handleLogout() {
    setAuthenticated(false);
    setMessages([]);
    setAdhesions([]);
    setPassword("");
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
        body: JSON.stringify({ password, id, statut: nouveauStatut }),
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
        body: JSON.stringify({ password, id, statut_adhesion: nouveauStatut }),
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
        body: JSON.stringify({ password, id, sujet, corps }),
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
        body: JSON.stringify({ password, id, action, sujet, corps }),
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-sm">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
            <h1 className="text-center text-lg font-semibold text-gray-800">
              Jeunes Actifs
            </h1>
            <p className="mt-1 text-center text-sm text-emerald-600 font-medium">
              Administration
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-password"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="admin-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Entrez le mot de passe"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-50"
              >
                {loading ? "Connexion…" : "Se connecter"}
              </button>
              {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
              )}
            </form>
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
    <div className="flex min-h-screen bg-gray-50">
      {/* ---- Overlay mobile ---- */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ---- Sidebar ---- */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Jeunes Actifs</h2>
          <p className="text-xs text-emerald-600 font-medium">Administration</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
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
                className={`flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? "border-l-[3px] border-emerald-600 bg-emerald-50 font-medium text-emerald-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <svg
                  className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-emerald-600" : "text-gray-400"}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                <span className="flex-1 text-left">{tab.label}</span>
                {badge > 0 && (
                  <span className="rounded border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[11px] font-semibold text-amber-700">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="border-t border-gray-100 p-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-emerald-600 transition hover:bg-emerald-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Voir le site
          </a>
        </div>

        {/* Admin profile */}
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
              AD
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">Admin</p>
              <p className="text-xs text-gray-400">Administrateur</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---- Zone principale ---- */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 md:hidden"
              aria-label="Ouvrir le menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-800">{activeLabel}</h1>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
          >
            Déconnexion
          </button>
        </header>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
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

            {activeTab === "actualites" && <ActualitesAdmin password={password} />}
            {activeTab === "evenements" && <EvenementsAdmin password={password} />}
            {activeTab === "galerie" && <GalerieAdmin password={password} />}
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
  return (
    <div className="space-y-8">
      {/* ---- À traiter ---- */}
      <section>
        <h3 className="text-base font-semibold text-gray-800">À traiter</h3>
        <div className="mt-3 space-y-3">
          {/* Messages non traités */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 border-l-[3px] border-l-emerald-500 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <span className="text-sm text-gray-700">
                {messagesNonTraites} message{messagesNonTraites !== 1 ? "s" : ""} non traité{messagesNonTraites !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => onNavigate("messages")}
              className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
            >
              Traiter →
            </button>
          </div>

          {/* Demandes en attente */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 border-l-[3px] border-l-emerald-500 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
              <span className="text-sm text-gray-700">
                {adhesionsEnAttente} demande{adhesionsEnAttente !== 1 ? "s" : ""} d&apos;adhésion en attente
              </span>
            </div>
            <button
              onClick={() => onNavigate("adhesions")}
              className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
            >
              Examiner →
            </button>
          </div>
        </div>

        {/* Détails si éléments à traiter */}
        {aTraiter > 0 && (
          <div className="mt-4 space-y-4">
            {messagesNonTraitesList.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Derniers messages non traités</p>
                <div className="mt-2 space-y-1.5">
                  {messagesNonTraitesList.map((m) => (
                    <div key={m.id} className="text-sm text-gray-700">
                      <span className="font-medium">{m.sujet}</span>
                      <span className="text-gray-400"> — {m.nom}, {formatDate(m.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {adhesionsEnAttenteList.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium text-gray-500">Dernières demandes en attente</p>
                <div className="mt-2 space-y-1.5">
                  {adhesionsEnAttenteList.map((a) => (
                    <div key={a.id} className="text-sm text-gray-700">
                      <span className="font-medium">{a.nom}</span>
                      <span className="text-gray-400"> — {a.email}, {formatDate(a.created_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ---- Contenu du site ---- */}
      <section>
        <h3 className="text-base font-semibold text-gray-800">Contenu du site</h3>
        <div className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Actualités</p>
                <p className="text-xs text-gray-400">
                  {statsActualites.publie} publié{statsActualites.publie !== 1 ? "es" : "e"} · {statsActualites.brouillon} brouillon{statsActualites.brouillon !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate("actualites")} className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700">
              Gérer →
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Événements</p>
                <p className="text-xs text-gray-400">
                  {statsEvenements.publie} publié{statsEvenements.publie !== 1 ? "s" : ""} · {statsEvenements.brouillon} brouillon{statsEvenements.brouillon !== 1 ? "s" : ""} · {statsEvenements.aVenir} à venir
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate("evenements")} className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700">
              Gérer →
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Galerie</p>
                <p className="text-xs text-gray-400">
                  {statsGalerie.publie} photo{statsGalerie.publie !== 1 ? "s" : ""} publié{statsGalerie.publie !== 1 ? "es" : "e"}
                </p>
              </div>
            </div>
            <button onClick={() => onNavigate("galerie")} className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700">
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
      {/* Barre récapitulative */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        <span className="text-sm text-gray-500">
          {messages.length} message{messages.length !== 1 ? "s" : ""} · {nonTraites} non traité{nonTraites !== 1 ? "s" : ""}
        </span>
      </div>

      {messages.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Aucun message pour l&apos;instant.</p>
      ) : (
        <div className="mt-4 space-y-3">
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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {message.statut === "non_traite" && (
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            )}
            {statutMessageBadge(message.statut)}
            <span className="text-xs text-gray-400">{formatDate(message.created_at)}</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-gray-800">{message.sujet}</p>
          <p className="text-sm text-gray-500">
            {message.nom} · {message.email}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => onReply(isReplying ? null : message.id)}
            className="rounded-md border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
          >
            {isReplying ? "Annuler" : "Répondre"}
          </button>
          <button
            onClick={() =>
              onToggleStatut(message.id, message.statut === "traite" ? "non_traite" : "traite")
            }
            disabled={updating === message.id}
            className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
              message.statut === "traite"
                ? "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
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
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
              {message.message}
            </p>
            <button
              onClick={() => onExpand(null)}
              className="mt-1 text-xs font-medium text-emerald-600 hover:underline"
            >
              Voir moins
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed text-gray-500">
              {truncate(message.message, 150)}
            </p>
            {message.message.length > 150 && (
              <button
                onClick={() => onExpand(message.id)}
                className="mt-1 text-xs font-medium text-emerald-600 hover:underline"
              >
                Voir tout le message
              </button>
            )}
          </div>
        )}
      </div>

      {/* Formulaire de réponse */}
      {isReplying && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
          <div>
            <label htmlFor={`reply-sujet-${message.id}`} className="mb-1 block text-xs font-medium text-gray-700">
              Sujet
            </label>
            <input
              type="text"
              id={`reply-sujet-${message.id}`}
              name="reply-sujet"
              defaultValue={defaultSujet}
              required
              maxLength={300}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label htmlFor={`reply-corps-${message.id}`} className="mb-1 block text-xs font-medium text-gray-700">
              Réponse
            </label>
            <textarea
              id={`reply-corps-${message.id}`}
              name="reply-corps"
              defaultValue={defaultCorps}
              required
              rows={6}
              maxLength={50000}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {replyError && isReplying && (
            <p className="text-xs text-red-600">{replyError}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onReply(null)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={replySending}
              className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
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
      {/* Barre récapitulative */}
      <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        <span className="text-sm text-gray-500">
          {adhesions.length} demande{adhesions.length !== 1 ? "s" : ""} · {enAttente} en attente
        </span>
      </div>

      {adhesions.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Aucune demande pour l&apos;instant.</p>
      ) : (
        <div className="mt-4 space-y-3">
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
  acceptee: "border border-emerald-600 text-emerald-600 hover:bg-emerald-50",
  refusee: "border border-red-500 text-red-600 hover:bg-red-50",
  info_demandee: "border border-amber-500 text-amber-600 hover:bg-amber-50",
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
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {statutAdhesionBadge(adhesion.statut_adhesion)}
            <span className="text-xs text-gray-400">{formatDate(adhesion.created_at)}</span>
          </div>
          <p className="mt-1.5 text-sm font-semibold text-gray-800">{adhesion.nom}</p>
          <div className="mt-0.5 flex flex-wrap gap-x-4 text-sm text-gray-500">
            <span>{adhesion.email}</span>
            {adhesion.telephone && <span>{adhesion.telephone}</span>}
            <span>{adhesion.statut}</span>
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            onClick={() => onToggleStatut(adhesion.id, "en_attente")}
            disabled={updating === adhesion.id || adhesion.statut_adhesion === "en_attente"}
            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition disabled:opacity-40 ${
              adhesion.statut_adhesion === "en_attente"
                ? "bg-emerald-600 text-white"
                : "border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            En attente
          </button>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-600">
        <span className="text-gray-400">Intérêt : </span>{adhesion.interet}
      </div>

      {/* Motivation */}
      <div className="mt-1">
        {expanded ? (
          <div>
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-500">
              {adhesion.motivation}
            </p>
            <button
              onClick={() => onExpand(null)}
              className="mt-1 text-xs font-medium text-emerald-600 hover:underline"
            >
              Voir moins
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-relaxed text-gray-500">
              {truncate(adhesion.motivation, 150)}
            </p>
            {adhesion.motivation.length > 150 && (
              <button
                onClick={() => onExpand(adhesion.id)}
                className="mt-1 text-xs font-medium text-emerald-600 hover:underline"
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
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${REPLY_ACTION_STYLES[action]}`}
            >
              {REPLY_ACTION_LABELS[action]}
            </button>
          ))}
        </div>
      )}

      {/* Formulaire de réponse */}
      {isReplying && defaults && (
        <form onSubmit={handleSubmit} className="mt-3 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            Action : <span className="text-gray-900">{REPLY_ACTION_LABELS[replyAction!]}</span>
          </div>
          <div>
            <label htmlFor={`adh-reply-sujet-${adhesion.id}`} className="mb-1 block text-xs font-medium text-gray-700">
              Sujet
            </label>
            <input
              type="text"
              id={`adh-reply-sujet-${adhesion.id}`}
              name="adh-reply-sujet"
              defaultValue={defaults.sujet}
              required
              maxLength={300}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div>
            <label htmlFor={`adh-reply-corps-${adhesion.id}`} className="mb-1 block text-xs font-medium text-gray-700">
              Message
            </label>
            <textarea
              id={`adh-reply-corps-${adhesion.id}`}
              name="adh-reply-corps"
              defaultValue={defaults.corps}
              required
              rows={6}
              maxLength={50000}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {replyError && isReplying && (
            <p className="text-xs text-red-600">{replyError}</p>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => { onReply(null); onReplyAction(null); }}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={replySending}
              className={`rounded-md px-4 py-1.5 text-xs font-semibold text-white transition disabled:opacity-50 ${
                replyAction === "acceptee"
                  ? "bg-emerald-600 hover:bg-emerald-700"
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
