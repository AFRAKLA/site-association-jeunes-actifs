"use client";

import { useState, useEffect, Fragment, type FormEvent } from "react";

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

export default function ActualitesAdmin() {
  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* Édition */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState("");
  const [editCategorie, setEditCategorie] = useState<Categorie>("environnement");
  const [editExtrait, setEditExtrait] = useState("");
  const [editContenu, setEditContenu] = useState("");
  const [editStatut, setEditStatut] = useState<"brouillon" | "publie">("brouillon");
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");

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
        const res = await fetch("/api/admin/actualites/list", { method: "POST" });
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
        body: JSON.stringify({ id }),
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

  function openEdit(a: Actualite) {
    setEditingId(a.id);
    setEditTitre(a.titre);
    setEditCategorie(a.categorie);
    setEditExtrait(a.extrait);
    setEditContenu(a.contenu);
    setEditStatut((a.statut as "brouillon" | "publie") || "brouillon");
    setEditSuccess("");
    setEditError("");
  }

  function closeEdit() {
    setEditingId(null);
  }

  async function handleUpdate(e: FormEvent, id: string) {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await fetch("/api/admin/actualites/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          titre: editTitre,
          categorie: editCategorie,
          extrait: editExtrait,
          contenu: editContenu,
          statut: editStatut,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "Erreur lors de la mise à jour.");
        return;
      }

      setEditSuccess("Actualité mise à jour.");
      if (data.actualite) {
        setActualites((prev) =>
          prev.map((a) => (a.id === id ? data.actualite : a))
        );
      }
      setEditingId(null);
    } catch {
      setEditError("Erreur serveur.");
    } finally {
      setEditLoading(false);
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
        <p className="mt-4 text-sm text-gray-500">Chargement…</p>
      ) : actualites.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
          <p className="text-sm text-gray-500">Aucune actualité pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="px-2 py-3 sm:px-4">Statut</th>
                <th className="px-2 py-3 sm:px-4">Titre</th>
                <th className="hidden px-4 py-3 sm:table-cell">Catégorie</th>
                <th className="hidden px-4 py-3 md:table-cell">Date</th>
                <th className="px-2 py-3 text-right sm:px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {actualites.map((a) => (
                <Fragment key={a.id}>
                  <tr className="transition hover:bg-gray-50">
                    <td className="px-2 py-3 sm:px-4">
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
                    <td className="px-2 py-3 font-medium text-gray-800 sm:px-4">{a.titre}</td>
                    <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                      {categorieLabel[a.categorie as Categorie] ?? a.categorie}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-gray-500 md:table-cell">
                      {formatDate(a.created_at)}
                    </td>
                    <td className="px-2 py-3 text-right sm:px-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() =>
                            editingId === a.id ? closeEdit() : openEdit(a)
                          }
                          className="rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
                        >
                          {editingId === a.id ? "Annuler" : "Modifier"}
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={deleting === a.id}
                          className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50"
                        >
                          {deleting === a.id ? "…" : "Supprimer"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editingId === a.id && (
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={5} className="px-4 py-4">
                        <form
                          onSubmit={(e) => handleUpdate(e, a.id)}
                          className="space-y-3"
                        >
                          <div>
                            <label
                              htmlFor={`edit-titre-${a.id}`}
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Titre
                            </label>
                            <input
                              id={`edit-titre-${a.id}`}
                              type="text"
                              required
                              value={editTitre}
                              onChange={(e) => setEditTitre(e.target.value)}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            <div>
                              <label
                                htmlFor={`edit-categorie-${a.id}`}
                                className="mb-1 block text-sm font-medium text-gray-700"
                              >
                                Catégorie
                              </label>
                              <select
                                id={`edit-categorie-${a.id}`}
                                value={editCategorie}
                                onChange={(e) =>
                                  setEditCategorie(e.target.value as Categorie)
                                }
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              >
                                {CATEGORIES.map((c) => (
                                  <option key={c.valeur} value={c.valeur}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label
                                htmlFor={`edit-statut-${a.id}`}
                                className="mb-1 block text-sm font-medium text-gray-700"
                              >
                                Statut
                              </label>
                              <select
                                id={`edit-statut-${a.id}`}
                                value={editStatut}
                                onChange={(e) =>
                                  setEditStatut(
                                    e.target.value as "brouillon" | "publie"
                                  )
                                }
                                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                              >
                                <option value="brouillon">Brouillon</option>
                                <option value="publie">Publié</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-extrait-${a.id}`}
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Extrait
                            </label>
                            <textarea
                              id={`edit-extrait-${a.id}`}
                              required
                              rows={3}
                              value={editExtrait}
                              onChange={(e) => setEditExtrait(e.target.value)}
                              className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-contenu-${a.id}`}
                              className="mb-1 block text-sm font-medium text-gray-700"
                            >
                              Contenu complet
                            </label>
                            <textarea
                              id={`edit-contenu-${a.id}`}
                              rows={5}
                              value={editContenu}
                              onChange={(e) => setEditContenu(e.target.value)}
                              className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="submit"
                              disabled={editLoading}
                              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {editLoading ? "Enregistrement…" : "Enregistrer"}
                            </button>
                            <button
                              type="button"
                              onClick={closeEdit}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Annuler
                            </button>
                          </div>

                          {editSuccess && (
                            <p className="text-sm text-green-600">{editSuccess}</p>
                          )}
                          {editError && (
                            <p className="text-sm text-red-600">{editError}</p>
                          )}
                        </form>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
