"use client";

import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
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

const CATEGORIE_VALUES: Categorie[] = ["environnement", "culture", "solidarite", "formations"];

/* --- Composant principal --- */

export default function GalerieAdmin() {
  const t = useTranslations("galerieAdmin");
  const tc = useTranslations("common");

  const PHOTO_I18N_FIELDS: TranslatedFieldDef<PhotoI18n>[] = [
    { key: "titre", label: tc("title"), type: "input", requiredOnFr: true, placeholder: t("titlePlaceholder") },
    { key: "description", label: tc("description"), type: "textarea", rows: 3, requiredOnFr: true, placeholder: t("descriptionPlaceholder") },
  ];

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
      setFormError(t("selectImageError"));
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
        setFormError(data.error || t("createError"));
        return;
      }

      setFormSuccess(t("createSuccess"));
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
      setFormError(tc("serverError"));
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
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
        setEditError(data.error || t("updateError"));
        return;
      }

      setEditSuccess(t("updateSuccess"));
      if (data.photo) {
        setPhotos((prev) => prev.map((p) => (p.id === id ? data.photo : p)));
      }
      setEditingId(null);
    } catch {
      setEditError(tc("serverError"));
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
    "w-full rounded-lg border border-admin-champagne-soft bg-surface px-3 py-2 text-sm text-admin-ink outline-none transition-colors duration-150 focus:border-admin-forest focus:ring-2 focus:ring-admin-champagne/20";
  const labelClass = "mb-1 block text-sm font-medium text-admin-ink/80";

  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("countTotal", { count: photos.length })} · {t("countPublished", { count: publiees })} · {t("countDraft", { count: brouillons })}
        </p>
        <details className="group">
          <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg bg-admin-forest px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-admin-forest-light [&::-webkit-details-marker]:hidden">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t("new")}
          </summary>
          <div className="mt-3 rounded-2xl border border-admin-champagne-soft bg-surface-muted/70 p-5">
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="gal-categorie" className={labelClass}>
                    {tc("category")}
                  </label>
                  <select
                    id="gal-categorie"
                    value={formCategorie}
                    onChange={(e) => setFormCategorie(e.target.value as Categorie)}
                    className={fieldClass}
                  >
                    {CATEGORIE_VALUES.map((c) => (
                      <option key={c} value={c}>{t(`categories.${c}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="gal-statut" className={labelClass}>
                    {tc("status")}
                  </label>
                  <select
                    id="gal-statut"
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value as "brouillon" | "publie")}
                    className={fieldClass}
                  >
                    <option value="brouillon">{tc("draft")}</option>
                    <option value="publie">{tc("published")}</option>
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
                  {t("imageField")}
                </label>
                <input
                  id="gal-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="w-full text-sm text-muted-foreground file:me-3 file:rounded-lg file:border-0 file:bg-admin-forest/10 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-admin-ink hover:file:bg-admin-forest/15"
                />
                {formPreview && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formPreview}
                      alt={tc("preview")}
                      className="h-28 w-auto rounded-lg border border-admin-champagne-soft object-contain"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-admin-forest px-4 py-2 text-sm font-medium text-white transition-colors duration-150 motion-safe:active:scale-[0.98] hover:bg-admin-forest-light disabled:opacity-50"
              >
                {formLoading ? t("creating") : t("create")}
              </button>

              {formSuccess && <p className="admin-reveal text-sm text-admin-ink">{formSuccess}</p>}
              {formError && <p className="admin-reveal text-sm text-admin-danger">{formError}</p>}
            </form>
          </div>
        </details>
      </div>

      {/* Grille — médiathèque */}
      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">{tc("loading")}</p>
      ) : photos.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-admin-champagne-soft bg-surface-muted/60 px-4 py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-admin-champagne-soft">
            <svg className="h-5 w-5 text-admin-ink" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 0 0 2.25-2.25V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
            </svg>
          </span>
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <div
              key={p.id}
              className="group overflow-hidden rounded-2xl border border-admin-champagne-soft/60 bg-surface transition-shadow duration-200 hover:shadow-[0_4px_24px_-6px_rgba(20,48,31,0.14)]"
            >
              <div className="aspect-video overflow-hidden bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image_url}
                  alt={p.titre}
                  className="h-full w-full object-cover transition-transform duration-300 ease-out-strong group-hover:scale-[1.04]"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-ink/70">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${p.statut === "publie" ? "bg-admin-forest" : "bg-admin-champagne"}`}
                      aria-hidden="true"
                    />
                    {p.statut === "publie" ? tc("published") : tc("draft")}
                    <span className="text-muted-foreground">· {formatDate(p.created_at)}</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        editingId === p.id ? closeEdit() : openEdit(p)
                      }
                      className="rounded-lg border border-admin-champagne-soft px-2.5 py-1 text-xs font-semibold text-admin-ink transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/50"
                    >
                      {editingId === p.id ? tc("cancel") : tc("edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deleting === p.id}
                      className="rounded-lg border border-admin-danger-border px-2.5 py-1 text-xs font-semibold text-admin-danger transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-danger-bg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger/50"
                    >
                      {deleting === p.id ? tc("deletingEllipsis") : tc("delete")}
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
                          {tc("category")}
                        </label>
                        <select
                          id={`edit-categorie-${p.id}`}
                          value={editCategorie}
                          onChange={(e) =>
                            setEditCategorie(e.target.value as Categorie)
                          }
                          className={fieldClass}
                        >
                          {CATEGORIE_VALUES.map((c) => (
                            <option key={c} value={c}>
                              {t(`categories.${c}`)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor={`edit-statut-${p.id}`} className={labelClass}>
                          {tc("status")}
                        </label>
                        <select
                          id={`edit-statut-${p.id}`}
                          value={editStatut}
                          onChange={(e) =>
                            setEditStatut(e.target.value as "brouillon" | "publie")
                          }
                          className={fieldClass}
                        >
                          <option value="brouillon">{tc("draft")}</option>
                          <option value="publie">{tc("published")}</option>
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
                      label={tc("mainImage")}
                      currentUrl={editCurrentImageUrl}
                      onChange={(file) => setEditImageFile(file)}
                    />

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={editLoading}
                        className="rounded-lg bg-admin-forest px-4 py-2 text-sm font-medium text-white transition-colors duration-150 motion-safe:active:scale-[0.98] hover:bg-admin-forest-light disabled:opacity-50"
                      >
                        {editLoading ? tc("saving") : tc("save")}
                      </button>
                      <button
                        type="button"
                        onClick={closeEdit}
                        className="text-sm text-muted-foreground hover:text-admin-ink"
                      >
                        {tc("cancel")}
                      </button>
                    </div>

                    {editSuccess && (
                      <p className="admin-reveal text-sm text-admin-ink">{editSuccess}</p>
                    )}
                    {editError && <p className="admin-reveal text-sm text-admin-danger">{editError}</p>}
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
