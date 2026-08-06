"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

/* --- Types --- */

type Categorie = "environnement" | "culture" | "solidarite" | "formations";

interface Photo {
  id: string;
  titre: string;
  categorie: Categorie;
  description: string;
  image_url: string;
  storage_path: string;
  statut: string;
  created_at: string;
}

/* --- Constantes --- */

const CATEGORIES: { valeur: Categorie; label: string }[] = [
  { valeur: "environnement", label: "Environnement" },
  { valeur: "culture", label: "Culture" },
  { valeur: "solidarite", label: "Solidarité" },
  { valeur: "formations", label: "Formations" },
];

/* --- Composant principal --- */

export default function GalerieAdmin({ password }: { password: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* Édition */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitre, setEditTitre] = useState("");
  const [editCategorie, setEditCategorie] = useState<Categorie>("environnement");
  const [editDescription, setEditDescription] = useState("");
  const [editStatut, setEditStatut] = useState<"brouillon" | "publie">("brouillon");
  const [editCurrentImageUrl, setEditCurrentImageUrl] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");

  /* Formulaire */
  const [formTitre, setFormTitre] = useState("");
  const [formCategorie, setFormCategorie] = useState<Categorie>("environnement");
  const [formDescription, setFormDescription] = useState("");
  const [formStatut, setFormStatut] = useState<"brouillon" | "publie">("brouillon");
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formPreview, setFormPreview] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  /* Charger au mount */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/galerie/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        });
        const data = await res.json();
        if (res.ok && !cancelled) {
          setPhotos(data.photos);
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

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setFormFile(file);
    if (formPreview) {
      URL.revokeObjectURL(formPreview);
    }
    setFormPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formFile) {
      setFormError("Veuillez sélectionner une image.");
      return;
    }

    setFormLoading(true);

    try {
      const fd = new FormData();
      fd.append("password", password);
      fd.append("titre", formTitre);
      fd.append("categorie", formCategorie);
      fd.append("description", formDescription);
      fd.append("statut", formStatut);
      fd.append("file", formFile);

      const res = await fetch("/api/admin/galerie/create", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Erreur lors de l'upload.");
        return;
      }

      setFormSuccess("Photo ajoutée avec succès.");
      setFormTitre("");
      setFormDescription("");
      setFormStatut("brouillon");
      setFormCategorie("environnement");
      setFormFile(null);
      if (formPreview) URL.revokeObjectURL(formPreview);
      setFormPreview(null);

      if (data.photo) {
        setPhotos((prev) => [data.photo, ...prev]);
      }
    } catch {
      setFormError("Erreur serveur.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette photo ?")) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/galerie/delete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, id }),
      });
      if (res.ok) {
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      /* silencieux */
    } finally {
      setDeleting(null);
    }
  }

  function openEdit(p: Photo) {
    setEditingId(p.id);
    setEditTitre(p.titre);
    setEditCategorie(p.categorie);
    setEditDescription(p.description);
    setEditStatut((p.statut as "brouillon" | "publie") || "brouillon");
    setEditCurrentImageUrl(p.image_url);
    setEditImageFile(null);
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
      const fd = new FormData();
      fd.append("password", password);
      fd.append("id", id);
      fd.append("titre", editTitre);
      fd.append("categorie", editCategorie);
      fd.append("description", editDescription);
      fd.append("statut", editStatut);
      if (editImageFile) fd.append("file", editImageFile);

      const res = await fetch("/api/admin/galerie/update", {
        method: "PATCH",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || "Erreur lors de la mise à jour.");
        return;
      }

      setEditSuccess("Photo mise à jour.");
      if (data.photo) {
        setPhotos((prev) => prev.map((p) => (p.id === id ? data.photo : p)));
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
    });
  }

  /* Compteurs dérivés */
  const publiees = photos.filter((p) => p.statut === "publie").length;
  const brouillons = photos.filter((p) => p.statut === "brouillon").length;

  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} · {publiees} publié{publiees !== 1 ? "es" : "e"} · {brouillons} brouillon{brouillons !== 1 ? "s" : ""}
        </span>
        <details>
          <summary className="inline-flex cursor-pointer select-none items-center gap-1 rounded-md border border-dashed border-emerald-400 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ajouter une photo
          </summary>
          <div className="mt-3 rounded-lg border border-gray-200 bg-white shadow-sm">
            <form onSubmit={handleCreate} className="space-y-3 p-4">
              <div>
                <label htmlFor="gal-titre" className="mb-1 block text-sm font-medium text-gray-700">
                  Titre
                </label>
                <input
                  id="gal-titre"
                  type="text"
                  required
                  value={formTitre}
                  onChange={(e) => setFormTitre(e.target.value)}
                  placeholder="Titre de la photo"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="gal-categorie" className="mb-1 block text-sm font-medium text-gray-700">
                    Catégorie
                  </label>
                  <select
                    id="gal-categorie"
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
                  <label htmlFor="gal-statut" className="mb-1 block text-sm font-medium text-gray-700">
                    Statut
                  </label>
                  <select
                    id="gal-statut"
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
                <label htmlFor="gal-description" className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="gal-description"
                  required
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Description courte de la photo..."
                  className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label htmlFor="gal-file" className="mb-1 block text-sm font-medium text-gray-700">
                  Image (JPG, PNG ou WebP — max 5 Mo)
                </label>
                <input
                  id="gal-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-sm text-gray-500 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {formPreview && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formPreview}
                      alt="Aperçu"
                      className="h-28 w-auto rounded-md border border-gray-200 object-contain"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {formLoading ? "Upload en cours…" : "Ajouter la photo"}
              </button>

              {formSuccess && <p className="text-sm text-green-600">{formSuccess}</p>}
              {formError && <p className="text-sm text-red-600">{formError}</p>}
            </form>
          </div>
        </details>
      </div>

      {/* Grille des photos */}
      {loading ? (
        <p className="mt-4 text-sm text-gray-400">Chargement…</p>
      ) : photos.length === 0 ? (
        <p className="mt-4 text-sm text-gray-400">Aucune photo.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              <div className="aspect-video overflow-hidden bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url}
                  alt={p.titre}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {p.statut === "publie" ? (
                      <span className="inline-flex items-center rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                        Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        Brouillon
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{formatDate(p.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        editingId === p.id ? closeEdit() : openEdit(p)
                      }
                      className="text-xs font-medium text-emerald-600 transition hover:text-emerald-700"
                    >
                      {editingId === p.id ? "Annuler" : "Modifier"}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="text-xs font-medium text-red-600 transition hover:text-red-700 disabled:opacity-50"
                    >
                      {deleting === p.id ? "…" : "Supprimer"}
                    </button>
                  </div>
                </div>
                <p className="mt-1.5 text-sm font-medium text-gray-800">{p.titre}</p>
                <p className="mt-0.5 text-sm text-gray-500">{p.description}</p>

                {editingId === p.id && (
                  <form
                    onSubmit={(e) => handleUpdate(e, p.id)}
                    className="mt-3 space-y-3 border-t border-gray-100 pt-3"
                  >
                    <div>
                      <label
                        htmlFor={`edit-titre-${p.id}`}
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Titre
                      </label>
                      <input
                        id={`edit-titre-${p.id}`}
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
                          htmlFor={`edit-categorie-${p.id}`}
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Catégorie
                        </label>
                        <select
                          id={`edit-categorie-${p.id}`}
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
                          htmlFor={`edit-statut-${p.id}`}
                          className="mb-1 block text-sm font-medium text-gray-700"
                        >
                          Statut
                        </label>
                        <select
                          id={`edit-statut-${p.id}`}
                          value={editStatut}
                          onChange={(e) =>
                            setEditStatut(e.target.value as "brouillon" | "publie")
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
                        htmlFor={`edit-description-${p.id}`}
                        className="mb-1 block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id={`edit-description-${p.id}`}
                        required
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <ImageUploader
                      key={p.id}
                      label="Image"
                      currentUrl={editCurrentImageUrl}
                      onChange={(file) => setEditImageFile(file)}
                    />

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
                    {editError && <p className="text-sm text-red-600">{editError}</p>}
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
