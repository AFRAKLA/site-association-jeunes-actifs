"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import ImageUploader from "@/components/admin/ImageUploader";
import TranslatedFields, { type TranslatedFieldDef } from "@/components/admin/TranslatedFields";

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
  titre_en?: string | null;
  titre_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
}

interface PhotoI18n {
  [key: string]: string;
  titre: string;
  description: string;
}

const EMPTY_PHOTO_I18N: PhotoI18n = { titre: "", description: "" };

const PHOTO_I18N_FIELDS: TranslatedFieldDef<PhotoI18n>[] = [
  { key: "titre", label: "Titre", type: "input", requiredOnFr: true, placeholder: "Titre de la photo" },
  { key: "description", label: "Description", type: "textarea", rows: 3, requiredOnFr: true, placeholder: "Description courte de la photo..." },
];

/* --- Constantes --- */

const CATEGORIES: { valeur: Categorie; label: string }[] = [
  { valeur: "environnement", label: "Environnement" },
  { valeur: "culture", label: "Culture" },
  { valeur: "solidarite", label: "Solidarité" },
  { valeur: "formations", label: "Formations" },
];

/* --- Composant principal --- */

export default function GalerieAdmin() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* Édition */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategorie, setEditCategorie] = useState<Categorie>("environnement");
  const [editStatut, setEditStatut] = useState<"brouillon" | "publie">("brouillon");
  const [editI18n, setEditI18n] = useState<{ fr: PhotoI18n; en: PhotoI18n; ar: PhotoI18n }>({
    fr: EMPTY_PHOTO_I18N,
    en: EMPTY_PHOTO_I18N,
    ar: EMPTY_PHOTO_I18N,
  });
  const [editCurrentImageUrl, setEditCurrentImageUrl] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");

  /* Formulaire */
  const [formCategorie, setFormCategorie] = useState<Categorie>("environnement");
  const [formI18n, setFormI18n] = useState<{ fr: PhotoI18n; en: PhotoI18n; ar: PhotoI18n }>({
    fr: EMPTY_PHOTO_I18N,
    en: EMPTY_PHOTO_I18N,
    ar: EMPTY_PHOTO_I18N,
  });
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
        const res = await fetch("/api/admin/galerie/list", { method: "POST" });
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
      fd.append("titre", formI18n.fr.titre);
      fd.append("categorie", formCategorie);
      fd.append("description", formI18n.fr.description);
      fd.append("statut", formStatut);
      fd.append("file", formFile);
      for (const lang of ["en", "ar"] as const) {
        const v = formI18n[lang];
        if (v.titre) fd.append(`titre_${lang}`, v.titre);
        if (v.description) fd.append(`description_${lang}`, v.description);
      }

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
      setFormI18n({ fr: EMPTY_PHOTO_I18N, en: EMPTY_PHOTO_I18N, ar: EMPTY_PHOTO_I18N });
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
        body: JSON.stringify({ id }),
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
    setEditCategorie(p.categorie);
    setEditStatut((p.statut as "brouillon" | "publie") || "brouillon");
    setEditI18n({
      fr: { titre: p.titre, description: p.description },
      en: { titre: p.titre_en ?? "", description: p.description_en ?? "" },
      ar: { titre: p.titre_ar ?? "", description: p.description_ar ?? "" },
    });
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
      fd.append("id", id);
      fd.append("titre", editI18n.fr.titre);
      fd.append("categorie", editCategorie);
      fd.append("description", editI18n.fr.description);
      fd.append("statut", editStatut);
      if (editImageFile) fd.append("file", editImageFile);
      for (const lang of ["en", "ar"] as const) {
        const v = editI18n[lang];
        fd.append(`titre_${lang}`, v.titre);
        fd.append(`description_${lang}`, v.description);
      }

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

  const fieldClass =
    "w-full rounded-lg border border-admin-champagne-soft bg-white px-3 py-2 text-sm text-foreground outline-none transition-colors duration-150 focus:border-primary focus:ring-2 focus:ring-primary/20";
  const labelClass = "mb-1 block text-sm font-medium text-foreground/80";

  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {photos.length} photo{photos.length !== 1 ? "s" : ""} · {publiees} publié{publiees !== 1 ? "es" : "e"} · {brouillons} brouillon{brouillons !== 1 ? "s" : ""}
        </p>
        <details className="group">
          <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-primary-dark [&::-webkit-details-marker]:hidden">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Ajouter une photo
          </summary>
          <div className="mt-3 rounded-2xl border border-admin-champagne-soft bg-admin-ivory-warm/70 p-5">
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="gal-categorie" className={labelClass}>
                    Catégorie
                  </label>
                  <select
                    id="gal-categorie"
                    value={formCategorie}
                    onChange={(e) => setFormCategorie(e.target.value as Categorie)}
                    className={fieldClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.valeur} value={c.valeur}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="gal-statut" className={labelClass}>
                    Statut
                  </label>
                  <select
                    id="gal-statut"
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value as "brouillon" | "publie")}
                    className={fieldClass}
                  >
                    <option value="brouillon">Brouillon</option>
                    <option value="publie">Publié</option>
                  </select>
                </div>
              </div>

              <TranslatedFields
                idPrefix="gal-create"
                fields={PHOTO_I18N_FIELDS}
                value={formI18n}
                onChange={(lang, key, next) =>
                  setFormI18n((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: next } }))
                }
                fieldClassName={fieldClass}
                labelClassName={labelClass}
              />

              <div>
                <label htmlFor="gal-file" className={labelClass}>
                  Image (JPG, PNG ou WebP — max 5 Mo)
                </label>
                <input
                  id="gal-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary hover:file:bg-primary/15"
                />
                {formPreview && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formPreview}
                      alt="Aperçu"
                      className="h-28 w-auto rounded-lg border border-admin-champagne-soft object-contain"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 motion-safe:active:scale-[0.98] hover:bg-primary-dark disabled:opacity-50"
              >
                {formLoading ? "Upload en cours…" : "Ajouter la photo"}
              </button>

              {formSuccess && <p className="admin-reveal text-sm text-primary">{formSuccess}</p>}
              {formError && <p className="admin-reveal text-sm text-red-600">{formError}</p>}
            </form>
          </div>
        </details>
      </div>

      {/* Grille — médiathèque */}
      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">Chargement…</p>
      ) : photos.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-admin-champagne-soft bg-admin-ivory-warm/60 px-4 py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-admin-champagne-soft">
            <svg className="h-5 w-5 text-admin-forest" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </span>
          <p className="text-sm text-muted-foreground">Aucune photo pour l&apos;instant.</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-admin-champagne-soft/60 bg-white transition-shadow duration-200 hover:shadow-[0_4px_24px_-6px_rgba(20,48,31,0.14)]"
            >
              <div className="aspect-video overflow-hidden bg-admin-ivory-warm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url}
                  alt={p.titre}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out-strong group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.statut === "publie" ? "bg-primary" : "bg-admin-champagne"}`}
                      aria-hidden="true"
                    />
                    {p.statut === "publie" ? "Publié" : "Brouillon"}
                    <span className="text-muted-foreground">· {formatDate(p.created_at)}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        editingId === p.id ? closeEdit() : openEdit(p)
                      }
                      className="rounded-lg border border-admin-forest/20 px-2.5 py-1 text-xs font-semibold text-admin-forest transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                      {editingId === p.id ? "Annuler" : "Modifier"}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-red-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/50"
                    >
                      {deleting === p.id ? "…" : "Supprimer"}
                    </button>
                  </div>
                </div>
                <p className="mt-1.5 truncate text-sm font-semibold text-admin-ink">{p.titre}</p>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{p.description}</p>

                {editingId === p.id && (
                  <form
                    onSubmit={(e) => handleUpdate(e, p.id)}
                    className="admin-reveal mt-3 space-y-3 border-t border-admin-champagne-soft/60 pt-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`edit-categorie-${p.id}`} className={labelClass}>
                          Catégorie
                        </label>
                        <select
                          id={`edit-categorie-${p.id}`}
                          value={editCategorie}
                          onChange={(e) =>
                            setEditCategorie(e.target.value as Categorie)
                          }
                          className={fieldClass}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c.valeur} value={c.valeur}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`edit-statut-${p.id}`} className={labelClass}>
                          Statut
                        </label>
                        <select
                          id={`edit-statut-${p.id}`}
                          value={editStatut}
                          onChange={(e) =>
                            setEditStatut(e.target.value as "brouillon" | "publie")
                          }
                          className={fieldClass}
                        >
                          <option value="brouillon">Brouillon</option>
                          <option value="publie">Publié</option>
                        </select>
                      </div>
                    </div>

                    <TranslatedFields
                      idPrefix={`gal-edit-${p.id}`}
                      fields={PHOTO_I18N_FIELDS}
                      value={editI18n}
                      onChange={(lang, key, next) =>
                        setEditI18n((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: next } }))
                      }
                      fieldClassName={fieldClass}
                      labelClassName={labelClass}
                    />

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
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 motion-safe:active:scale-[0.98] hover:bg-primary-dark disabled:opacity-50"
                      >
                        {editLoading ? "Enregistrement…" : "Enregistrer"}
                      </button>
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        Annuler
                      </button>
                    </div>

                    {editSuccess && (
                      <p className="admin-reveal text-sm text-primary">{editSuccess}</p>
                    )}
                    {editError && <p className="admin-reveal text-sm text-red-600">{editError}</p>}
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
