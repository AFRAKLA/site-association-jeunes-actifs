"use client";

import { useState, useEffect, type FormEvent } from "react";

/* --- Types --- */

type Categorie =
  | "Événement étudiant"
  | "Environnement"
  | "Culture"
  | "Formation"
  | "Solidarité";

interface Evenement {
  id: string;
  titre: string;
  date_evenement: string;
  lieu: string;
  categorie: Categorie;
  description: string;
  a_venir: boolean;
  statut: string;
  created_at: string;
}

/* --- Constantes --- */

const CATEGORIES: { valeur: Categorie; label: string }[] = [
  { valeur: "Événement étudiant", label: "Événement étudiant" },
  { valeur: "Environnement", label: "Environnement" },
  { valeur: "Culture", label: "Culture" },
  { valeur: "Formation", label: "Formation" },
  { valeur: "Solidarité", label: "Solidarité" },
];

/* --- Composant principal --- */

export default function EvenementsAdmin({ password }: { password: string }) {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* Formulaire */
  const [formTitre, setFormTitre] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formLieu, setFormLieu] = useState("");
  const [formCategorie, setFormCategorie] = useState<Categorie>("Événement étudiant");
  const [formDescription, setFormDescription] = useState("");
  const [formAVenir, setFormAVenir] = useState(true);
  const [formStatut, setFormStatut] = useState<"brouillon" | "publie">("brouillon");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  /* Charger au mount */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/evenements/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (res.ok && !cancelled) {
          setEvenements(data.evenements);
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
      const res = await fetch("/api/admin/evenements/create", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          titre: formTitre,
          date_evenement: formDate,
          lieu: formLieu,
          categorie: formCategorie,
          description: formDescription,
          a_venir: formAVenir,
          statut: formStatut,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Erreur lors de la création.");
        return;
      }

      setFormSuccess("Événement créé avec succès.");
      setFormTitre("");
      setFormDate("");
      setFormLieu("");
      setFormDescription("");
      setFormAVenir(true);
      setFormStatut("brouillon");
      setFormCategorie("Événement étudiant");

      if (data.evenement) {
        setEvenements((prev) => [data.evenement, ...prev]);
      }
    } catch {
      setFormError("Erreur serveur.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet événement ?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/evenements/delete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id }),
      });
      if (res.ok) {
        setEvenements((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      /* silencieux */
    } finally {
      setDeleting(null);
    }
  }

  /* Compteurs dérivés */
  const publies = evenements.filter((e) => e.statut === "publie").length;
  const brouillons = evenements.filter((e) => e.statut === "brouillon").length;
  const aVenir = evenements.filter((e) => e.a_venir).length;

  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {evenements.length} événement{evenements.length !== 1 ? "s" : ""} · {publies} publié{publies !== 1 ? "s" : ""} · {brouillons} brouillon{brouillons !== 1 ? "s" : ""} · {aVenir} à venir
        </span>
        <details>
          <summary className="inline-flex cursor-pointer select-none items-center gap-1 rounded-md border border-dashed border-emerald-400 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nouvel événement
          </summary>
          <div className="mt-3 rounded-lg border border-gray-200 bg-white shadow-sm">
            <form onSubmit={handleCreate} className="space-y-3 p-4">
              <div>
                <label htmlFor="evt-titre" className="mb-1 block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  id="evt-titre"
                  type="text"
                  required
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  placeholder="Titre de l'événement"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="evt-date" className="mb-1 block text-sm font-medium text-gray-700">
                    Date / Période
                  </label>
                  <input
                    id="evt-date"
                    type="text"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    placeholder="Ex : Prochainement, 22 juin 2026..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label htmlFor="evt-lieu" className="mb-1 block text-sm font-medium text-gray-700">
                    Lieu
                  </label>
                  <input
                    id="evt-lieu"
                    type="text"
                    required
                    value={formLieu}
                    onChange={(e) => setFormLieu(e.target.value)}
                    placeholder="Ex : Université Mohammed Ier, Oujda"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label htmlFor="evt-categorie" className="mb-1 block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    id="evt-categorie"
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
                  <label htmlFor="evt-statut" className="mb-1 block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    id="evt-statut"
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value as "brouillon" | "publie")}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié</option>
                  </select>
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={formAVenir}
                      onChange={(e) => setFormAVenir(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>À venir</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="evt-description" className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="evt-description"
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Description de l'événement..."
                  className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {formLoading ? "Création…" : "Créer l'événement"}
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
      ) : evenements.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Aucun événement.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {evenements.map((e) => (
            <div
              key={e.id}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {e.statut === "publie" ? (
                      <span className="inline-flex items-center rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Brouillon
                      </span>
                    )}
                    {e.a_venir ? (
                      <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        À venir
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-500">
                        Passé
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-gray-800">{e.titre}</p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {e.date_evenement} · {e.lieu} · {e.categorie}
                  </p>
                  <p className="mt-1 text-sm text-gray-400">{e.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(e.id)}
                  disabled={deleting === e.id}
                  className="shrink-0 text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                >
                  {deleting === e.id ? "…" : "Supprimer"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
