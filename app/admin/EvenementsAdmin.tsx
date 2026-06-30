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
  slug: string | null;
  date_evenement: string | null;
  date_debut: string | null;
  heure: string | null;
  lieu: string | null;
  categorie: Categorie;
  description: string;
  description_complete: string | null;
  a_venir: boolean;
  statut: string;
  created_at: string;
  image_url: string | null;
  video_url: string | null;
  photos_supplementaires: string[];
}

type Statut = "brouillon" | "publie";

/* --- Constantes --- */

const CATEGORIES: Categorie[] = [
  "Événement étudiant",
  "Environnement",
  "Culture",
  "Formation",
  "Solidarité",
];

/* --- Helpers --- */

function getTodayMorocco(): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: "Africa/Casablanca",
  }).format(new Date());
}

function isAvenir(evt: Evenement): boolean {
  if (evt.date_debut) return evt.date_debut >= getTodayMorocco();
  return !!evt.a_venir;
}

function formatDateFr(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/* --- Composants de champs communs --- */

const inputCls =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
const labelCls = "mb-1 block text-sm font-medium text-gray-700";

/* --- État initial du formulaire d'édition --- */

const defaultEditForm = {
  titre: "",
  categorie: "Événement étudiant" as Categorie,
  description: "",
  description_complete: "",
  date_debut: "",
  heure: "",
  lieu: "",
  statut: "brouillon" as Statut,
  image_url: "",
  video_url: "",
  photos_supplementaires: "",
};

/* --- Composant principal --- */

export default function EvenementsAdmin({ password }: { password: string }) {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* Formulaire de création */
  const [formTitre, setFormTitre] = useState("");
  const [formCategorie, setFormCategorie] = useState<Categorie>("Événement étudiant");
  const [formDescription, setFormDescription] = useState("");
  const [formDescriptionComplete, setFormDescriptionComplete] = useState("");
  const [formDateDebut, setFormDateDebut] = useState("");
  const [formHeure, setFormHeure] = useState("");
  const [formLieu, setFormLieu] = useState("");
  const [formStatut, setFormStatut] = useState<Statut>("brouillon");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formPhotosSupp, setFormPhotosSupp] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  /* Formulaire d'édition */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState(defaultEditForm);

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
        if (res.ok && !cancelled) setEvenements(data.evenements);
      } catch {
        /* silencieux */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Réinitialiser le formulaire de création */
  function resetCreateForm() {
    setFormTitre("");
    setFormCategorie("Événement étudiant");
    setFormDescription("");
    setFormDescriptionComplete("");
    setFormDateDebut("");
    setFormHeure("");
    setFormLieu("");
    setFormStatut("brouillon");
    setFormImageUrl("");
    setFormVideoUrl("");
    setFormPhotosSupp("");
  }

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
          categorie: formCategorie,
          description: formDescription,
          description_complete: formDescriptionComplete || undefined,
          date_debut: formDateDebut || undefined,
          heure: formHeure || undefined,
          lieu: formLieu || undefined,
          statut: formStatut,
          image_url: formImageUrl || undefined,
          video_url: formVideoUrl || undefined,
          photos_supplementaires: formPhotosSupp
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Erreur lors de la création.");
        return;
      }

      setFormSuccess("Événement créé avec succès.");
      resetCreateForm();
      if (data.evenement) setEvenements((prev) => [data.evenement, ...prev]);
    } catch {
      setFormError("Erreur serveur.");
    } finally {
      setFormLoading(false);
    }
  }

  function openEdit(evt: Evenement) {
    setEditingId(evt.id);
    setEditSuccess("");
    setEditError("");
    setEditForm({
      titre: evt.titre || "",
      categorie: evt.categorie,
      description: evt.description || "",
      description_complete: evt.description_complete || "",
      date_debut: evt.date_debut || "",
      heure: evt.heure ? evt.heure.substring(0, 5) : "",
      lieu: evt.lieu || "",
      statut: (evt.statut as Statut) || "brouillon",
      image_url: evt.image_url || "",
      video_url: evt.video_url || "",
      photos_supplementaires: (evt.photos_supplementaires || []).join("\n"),
    });
  }

  async function handleUpdate(e: FormEvent, id: string) {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");

    try {
      const res = await fetch("/api/admin/evenements/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          id,
          titre: editForm.titre,
          categorie: editForm.categorie,
          description: editForm.description,
          description_complete: editForm.description_complete || undefined,
          date_debut: editForm.date_debut || undefined,
          heure: editForm.heure || undefined,
          lieu: editForm.lieu || undefined,
          statut: editForm.statut,
          image_url: editForm.image_url || undefined,
          video_url: editForm.video_url || undefined,
          photos_supplementaires: editForm.photos_supplementaires
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "Erreur lors de la mise à jour.");
        return;
      }

      setEditSuccess("Événement mis à jour.");
      if (data.evenement) {
        setEvenements((prev) =>
          prev.map((e) => (e.id === id ? data.evenement : e))
        );
      }
      setEditingId(null);
    } catch {
      setEditError("Erreur serveur.");
    } finally {
      setEditLoading(false);
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
      if (res.ok) setEvenements((prev) => prev.filter((e) => e.id !== id));
    } catch {
      /* silencieux */
    } finally {
      setDeleting(null);
    }
  }

  /* Compteurs dérivés */
  const publies = evenements.filter((e) => e.statut === "publie").length;
  const brouillons = evenements.filter((e) => e.statut === "brouillon").length;
  const aVenirCount = evenements.filter((e) => isAvenir(e)).length;

  /* --- Rendu --- */
  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {evenements.length} événement{evenements.length !== 1 ? "s" : ""} ·{" "}
          {publies} publié{publies !== 1 ? "s" : ""} · {brouillons} brouillon
          {brouillons !== 1 ? "s" : ""} · {aVenirCount} à venir
        </span>

        <details>
          <summary className="inline-flex cursor-pointer select-none items-center gap-1 rounded-md border border-dashed border-emerald-400 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Nouvel événement
          </summary>

          <div className="mt-3 rounded-lg border border-gray-200 bg-white shadow-sm">
            <form onSubmit={handleCreate} className="space-y-3 p-4">
              {/* Titre */}
              <div>
                <label htmlFor="evt-titre" className={labelCls}>
                  Titre <span className="text-red-500">*</span>
                </label>
                <input
                  id="evt-titre"
                  type="text"
                  required
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  placeholder="Titre de l'événement"
                  className={inputCls}
                />
              </div>

              {/* Catégorie + Statut */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="evt-categorie" className={labelCls}>
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="evt-categorie"
                    value={formCategorie}
                    onChange={(e) => setFormCategorie(e.target.value as Categorie)}
                    className={inputCls}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="evt-statut" className={labelCls}>
                    Statut <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="evt-statut"
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value as Statut)}
                    className={inputCls}
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié</option>
                  </select>
                </div>
              </div>

              {/* Date + Heure */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="evt-date-debut" className={labelCls}>
                    Date
                  </label>
                  <input
                    id="evt-date-debut"
                    type="date"
                    value={formDateDebut}
                    onChange={(e) => setFormDateDebut(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor="evt-heure" className={labelCls}>
                    Heure
                  </label>
                  <input
                    id="evt-heure"
                    type="time"
                    value={formHeure}
                    onChange={(e) => setFormHeure(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Lieu */}
              <div>
                <label htmlFor="evt-lieu" className={labelCls}>
                  Lieu
                </label>
                <input
                  id="evt-lieu"
                  type="text"
                  value={formLieu}
                  onChange={(e) => setFormLieu(e.target.value)}
                  placeholder="Ex : Université Mohammed Ier, Oujda"
                  className={inputCls}
                />
              </div>

              {/* Description courte */}
              <div>
                <label htmlFor="evt-description" className={labelCls}>
                  Description courte <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="evt-description"
                  required
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Résumé affiché dans les listes..."
                  className={`${inputCls} resize-y`}
                />
              </div>

              {/* Description complète */}
              <div>
                <label htmlFor="evt-description-complete" className={labelCls}>
                  Description complète
                </label>
                <textarea
                  id="evt-description-complete"
                  rows={4}
                  value={formDescriptionComplete}
                  onChange={(e) => setFormDescriptionComplete(e.target.value)}
                  placeholder="Détails affichés sur la page de l'événement..."
                  className={`${inputCls} resize-y`}
                />
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="evt-image-url" className={labelCls}>
                  Image principale
                </label>
                <input
                  id="evt-image-url"
                  type="text"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="/images/evenements/mon-evenement.jpg"
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-gray-400">
                  Exemple : /images/evenements/concert-rebelle-fusion.jpg
                </p>
              </div>

              {/* Vidéo URL */}
              <div>
                <label htmlFor="evt-video-url" className={labelCls}>
                  Vidéo (URL YouTube ou Vimeo)
                </label>
                <input
                  id="evt-video-url"
                  type="text"
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className={inputCls}
                />
              </div>

              {/* Photos supplémentaires */}
              <div>
                <label htmlFor="evt-photos-supp" className={labelCls}>
                  Photos supplémentaires (une URL par ligne)
                </label>
                <textarea
                  id="evt-photos-supp"
                  rows={3}
                  value={formPhotosSupp}
                  onChange={(e) => setFormPhotosSupp(e.target.value)}
                  placeholder="/images/evenements/photo1.jpg&#10;/images/evenements/photo2.jpg"
                  className={`${inputCls} resize-y`}
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {formLoading ? "Création…" : "Créer l'événement"}
              </button>

              {formSuccess && (
                <p className="text-sm text-green-600">{formSuccess}</p>
              )}
              {formError && (
                <p className="text-sm text-red-600">{formError}</p>
              )}
            </form>
          </div>
        </details>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="mt-4 text-sm text-gray-400">Chargement…</p>
      ) : evenements.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Aucun événement.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {evenements.map((e) => {
            const avenir = isAvenir(e);
            const isEditing = editingId === e.id;

            return (
              <div
                key={e.id}
                className="rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between gap-4 p-4">
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
                      {avenir ? (
                        <span className="inline-flex items-center rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          À venir
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-semibold text-gray-500">
                          Passé
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-gray-800">
                      {e.titre}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {e.date_debut
                        ? formatDateFr(e.date_debut)
                        : e.date_evenement || "—"}
                      {e.heure ? ` · ${e.heure.substring(0, 5)}` : ""}
                      {e.lieu ? ` · ${e.lieu}` : ""}
                      {" · "}
                      {e.categorie}
                    </p>
                    {e.slug && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        /evenements/{e.slug}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      onClick={() =>
                        isEditing ? setEditingId(null) : openEdit(e)
                      }
                      className="text-sm font-medium text-emerald-600 transition hover:text-emerald-700"
                    >
                      {isEditing ? "Annuler" : "Modifier"}
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={deleting === e.id}
                      className="text-sm font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === e.id ? "…" : "Supprimer"}
                    </button>
                  </div>
                </div>

                {/* Formulaire d'édition inline */}
                {isEditing && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4">
                    <form
                      onSubmit={(ev) => handleUpdate(ev, e.id)}
                      className="space-y-3"
                    >
                      <div>
                        <label className={labelCls}>
                          Titre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={editForm.titre}
                          onChange={(ev) =>
                            setEditForm((f) => ({ ...f, titre: ev.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>
                            Catégorie <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editForm.categorie}
                            onChange={(ev) =>
                              setEditForm((f) => ({
                                ...f,
                                categorie: ev.target.value as Categorie,
                              }))
                            }
                            className={inputCls}
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>
                            Statut <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={editForm.statut}
                            onChange={(ev) =>
                              setEditForm((f) => ({
                                ...f,
                                statut: ev.target.value as Statut,
                              }))
                            }
                            className={inputCls}
                          >
                            <option value="brouillon">Brouillon</option>
                            <option value="publie">Publié</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>Date</label>
                          <input
                            type="date"
                            value={editForm.date_debut}
                            onChange={(ev) =>
                              setEditForm((f) => ({
                                ...f,
                                date_debut: ev.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Heure</label>
                          <input
                            type="time"
                            value={editForm.heure}
                            onChange={(ev) =>
                              setEditForm((f) => ({
                                ...f,
                                heure: ev.target.value,
                              }))
                            }
                            className={inputCls}
                          />
                        </div>
                      </div>

                      <div>
                        <label className={labelCls}>Lieu</label>
                        <input
                          type="text"
                          value={editForm.lieu}
                          onChange={(ev) =>
                            setEditForm((f) => ({ ...f, lieu: ev.target.value }))
                          }
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>
                          Description courte <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={editForm.description}
                          onChange={(ev) =>
                            setEditForm((f) => ({
                              ...f,
                              description: ev.target.value,
                            }))
                          }
                          className={`${inputCls} resize-y`}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Description complète</label>
                        <textarea
                          rows={4}
                          value={editForm.description_complete}
                          onChange={(ev) =>
                            setEditForm((f) => ({
                              ...f,
                              description_complete: ev.target.value,
                            }))
                          }
                          className={`${inputCls} resize-y`}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>Image principale</label>
                        <input
                          type="text"
                          value={editForm.image_url}
                          onChange={(ev) =>
                            setEditForm((f) => ({
                              ...f,
                              image_url: ev.target.value,
                            }))
                          }
                          placeholder="/images/evenements/..."
                          className={inputCls}
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          Exemple : /images/evenements/concert-rebelle-fusion.jpg
                        </p>
                      </div>

                      <div>
                        <label className={labelCls}>
                          Vidéo (URL YouTube ou Vimeo)
                        </label>
                        <input
                          type="text"
                          value={editForm.video_url}
                          onChange={(ev) =>
                            setEditForm((f) => ({
                              ...f,
                              video_url: ev.target.value,
                            }))
                          }
                          className={inputCls}
                        />
                      </div>

                      <div>
                        <label className={labelCls}>
                          Photos supplémentaires (une URL par ligne)
                        </label>
                        <textarea
                          rows={3}
                          value={editForm.photos_supplementaires}
                          onChange={(ev) =>
                            setEditForm((f) => ({
                              ...f,
                              photos_supplementaires: ev.target.value,
                            }))
                          }
                          className={`${inputCls} resize-y`}
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
                          onClick={() => setEditingId(null)}
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
