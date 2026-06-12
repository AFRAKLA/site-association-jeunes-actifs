"use client";

import { useState, useEffect, type FormEvent } from "react";

/* --- Types --- */

type Categorie =
  | "environnement"
  | "culture"
  | "solidarite"
  | "formation"
  | "vie-associative";

interface Actualite {
  id: string;
  titre: string;
  categorie: Categorie;
  extrait: string;
  contenu: string;
  statut: string;
  created_at: string;
}

/* --- Constantes --- */

const CATEGORIES: { valeur: Categorie; label: string }[] = [
  { valeur: "environnement", label: "Environnement" },
  { valeur: "culture", label: "Culture" },
  { valeur: "solidarite", label: "Solidarité" },
  { valeur: "formation", label: "Formation" },
  { valeur: "vie-associative", label: "Vie associative" },
];

const categorieLabel: Record<Categorie, string> = {
  environnement: "Environnement",
  culture: "Culture",
  solidarite: "Solidarité",
  formation: "Formation",
  "vie-associative": "Vie associative",
};

/* --- Composant principal --- */

export default function ActualitesAdmin({ password }: { password: string }) {
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* Formulaire */
  const [formTitre, setFormTitre] = useState("");
  const [formCategorie, setFormCategorie] = useState<Categorie>("environnement");
  const [formExtrait, setFormExtrait] = useState("");
  const [formContenu, setFormContenu] = useState("");
  const [formStatut, setFormStatut] = useState<"brouillon" | "publie">("brouillon");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  /* Charger les actualités au mount */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/actualites/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (res.ok && !cancelled) {
          setActualites(data.actualites);
        }
      } catch {
        /* silencieux */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const res = await fetch("/api/admin/actualites/create", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          titre: formTitre,
          categorie: formCategorie,
          extrait: formExtrait,
          contenu: formContenu,
          statut: formStatut,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Erreur lors de la création.");
        return;
      }

      setFormSuccess("Actualité créée avec succès.");
      setFormTitre("");
      setFormExtrait("");
      setFormContenu("");
      setFormStatut("brouillon");
      setFormCategorie("environnement");

      if (data.actualite) {
        setActualites((prev) => [data.actualite, ...prev]);
      }
    } catch {
      setFormError("Erreur serveur.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette actualité ?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/actualites/delete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id }),
      });
      if (res.ok) {
        setActualites((prev) => prev.filter((a) => a.id !== id));
      }
    } catch {
      /* silencieux */
    } finally {
      setDeleting(null);
    }
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

  /* Compteurs dérivés */
  const publiees = actualites.filter((a) => a.statut === "publie").length;
  const brouillons = actualites.filter((a) => a.statut === "brouillon").length;

  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {actualites.length} actualité{actualites.length !== 1 ? "s" : ""} · {publiees} publié{publiees !== 1 ? "es" : "e"} · {brouillons} brouillon{brouillons !== 1 ? "s" : ""}
        </span>
        <details>
          <summary className="inline-flex cursor-pointer select-none items-center gap-1 rounded-md border border-dashed border-emerald-400 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvelle actualité
          </summary>
          <div className="mt-3 rounded-lg border border-gray-200 bg-white shadow-sm">
            <form onSubmit={handleCreate} className="space-y-3 p-4">
              <div>
                <label htmlFor="act-titre" className="mb-1 block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  id="act-titre"
                  type="text"
                  required
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  placeholder="Titre de l'actualité"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="act-categorie" className="mb-1 block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    id="act-categorie"
                    value={formCategorie}
                    onChange={(e) => setFormCategorie(e.target.value as Categorie)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.valeur} value={c.valeur}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="act-statut" className="mb-1 block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    id="act-statut"
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value as "brouillon" | "publie")}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="act-extrait" className="mb-1 block text-sm font-medium text-gray-700">
                  Extrait
                </label>
                <textarea
                  id="act-extrait"
                  required
                  rows={3}
                  value={formExtrait}
                  onChange={(e) => setFormExtrait(e.target.value)}
                  placeholder="Résumé court de l'actualité..."
                  className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label htmlFor="act-contenu" className="mb-1 block text-sm font-medium text-gray-700">
                  Contenu complet
                </label>
                <textarea
                  id="act-contenu"
                  rows={5}
                  value={formContenu}
                  onChange={(e) => setFormContenu(e.target.value)}
                  placeholder="Contenu détaillé (optionnel)..."
                  className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {formLoading ? "Création…" : "Créer l'actualité"}
              </button>

              {formSuccess && <p className="text-sm text-green-600">{formSuccess}</p>}
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </form>
          </div>
        </details>
      </div>

      {/* Tableau */}
      {loading ? (
        <p className="mt-4 text-sm text-gray-400">Chargement…</p>
      ) : actualites.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Aucune actualité.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Titre</th>
                <th className="hidden px-4 py-3 sm:table-cell">Catégorie</th>
                <th className="hidden px-4 py-3 md:table-cell">Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {actualites.map((a) => (
                <tr key={a.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {a.statut === "publie" ? (
                      <span className="inline-flex items-center rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Brouillon
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{a.titre}</td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {categorieLabel[a.categorie as Categorie] ?? a.categorie}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-gray-400 md:table-cell">
                    {formatDate(a.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(a.id)}
                      disabled={deleting === a.id}
                      className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === a.id ? "…" : "Supprimer"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
