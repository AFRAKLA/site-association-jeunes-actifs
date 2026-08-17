"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import ImageUploader from "@/components/admin/ImageUploader";
import MultiImageUploader, {
  type ExistingPhoto,
} from "@/components/admin/MultiImageUploader";
import TranslatedFields, { type TranslatedFieldDef } from "@/components/admin/TranslatedFields";
import { PhotoFrame } from "@/components/PhotoFrame";

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
  titre_en?: string | null;
  titre_ar?: string | null;
  lieu_en?: string | null;
  lieu_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  description_complete_en?: string | null;
  description_complete_ar?: string | null;
}

interface EvenementI18n {
  [key: string]: string;
  titre: string;
  lieu: string;
  description: string;
  description_complete: string;
}

const EMPTY_EVT_I18N: EvenementI18n = { titre: "", lieu: "", description: "", description_complete: "" };

type Statut = "brouillon" | "publie";

/* --- Constantes --- */

const CATEGORIE_VALUES: Categorie[] = [
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
  "w-full rounded-lg border border-admin-champagne-soft bg-surface px-3 py-2 text-sm text-admin-ink outline-none transition-colors duration-150 focus:border-admin-forest focus:ring-2 focus:ring-admin-champagne/20";
const labelCls = "mb-1 block text-sm font-medium text-admin-ink/80";

/* --- État initial du formulaire d'édition --- */

const defaultEditForm = {
  categorie: "Événement étudiant" as Categorie,
  date_debut: "",
  heure: "",
  statut: "brouillon" as Statut,
  video_url: "",
};

/* --- Composant principal --- */

export default function EvenementsAdmin() {
  const t = useTranslations("evenementsAdmin");
  const tc = useTranslations("common");

  const EVT_I18N_FIELDS: TranslatedFieldDef<EvenementI18n>[] = [
    { key: "titre", label: tc("title"), type: "input", requiredOnFr: true },
    { key: "lieu", label: t("location"), type: "input", placeholder: t("locationPlaceholder") },
    { key: "description", label: t("shortDescription"), type: "textarea", rows: 2, requiredOnFr: true, placeholder: t("shortDescriptionPlaceholder") },
    { key: "description_complete", label: t("fullDescription"), type: "textarea", rows: 4, placeholder: t("fullDescriptionPlaceholder") },
  ];

  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* Formulaire de création */
  const [formI18n, setFormI18n] = useState<{ fr: EvenementI18n; en: EvenementI18n; ar: EvenementI18n }>({
    fr: EMPTY_EVT_I18N,
    en: EMPTY_EVT_I18N,
    ar: EMPTY_EVT_I18N,
  });
  const [formCategorie, setFormCategorie] = useState<Categorie>("Événement étudiant");
  const [formDateDebut, setFormDateDebut] = useState("");
  const [formHeure, setFormHeure] = useState("");
  const [formStatut, setFormStatut] = useState<Statut>("brouillon");
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formPhotoFiles, setFormPhotoFiles] = useState<File[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  /* Formulaire d'édition */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState(defaultEditForm);
  const [editI18n, setEditI18n] = useState<{ fr: EvenementI18n; en: EvenementI18n; ar: EvenementI18n }>({
    fr: EMPTY_EVT_I18N,
    en: EMPTY_EVT_I18N,
    ar: EMPTY_EVT_I18N,
  });
  const [editCurrentImageUrl, setEditCurrentImageUrl] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editRemoveImage, setEditRemoveImage] = useState(false);
  const [editExistingPhotos, setEditExistingPhotos] = useState<ExistingPhoto[]>([]);
  const [editRemovedPhotoUrls, setEditRemovedPhotoUrls] = useState<string[]>([]);
  const [editNewPhotoFiles, setEditNewPhotoFiles] = useState<File[]>([]);

  /* Charger au mount */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/evenements/list", { method: "POST" });
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
  }, []);

  /* Réinitialiser le formulaire de création */
  function resetCreateForm() {
    setFormI18n({ fr: EMPTY_EVT_I18N, en: EMPTY_EVT_I18N, ar: EMPTY_EVT_I18N });
    setFormCategorie("Événement étudiant");
    setFormDateDebut("");
    setFormHeure("");
    setFormStatut("brouillon");
    setFormImageFile(null);
    setFormVideoUrl("");
    setFormPhotoFiles([]);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");
    setFormSuccess("");

    try {
      const fd = new FormData();
      fd.append("titre", formI18n.fr.titre);
      fd.append("categorie", formCategorie);
      fd.append("description", formI18n.fr.description);
      if (formI18n.fr.description_complete)
        fd.append("description_complete", formI18n.fr.description_complete);
      if (formDateDebut) fd.append("date_debut", formDateDebut);
      if (formHeure) fd.append("heure", formHeure);
      if (formI18n.fr.lieu) fd.append("lieu", formI18n.fr.lieu);
      fd.append("statut", formStatut);
      if (formVideoUrl) fd.append("video_url", formVideoUrl);
      if (formImageFile) fd.append("image", formImageFile);
      formPhotoFiles.forEach((f, i) => fd.append(`photo_${i}`, f));

      // Traductions optionnelles EN/AR
      for (const lang of ["en", "ar"] as const) {
        const v = formI18n[lang];
        if (v.titre) fd.append(`titre_${lang}`, v.titre);
        if (v.lieu) fd.append(`lieu_${lang}`, v.lieu);
        if (v.description) fd.append(`description_${lang}`, v.description);
        if (v.description_complete) fd.append(`description_complete_${lang}`, v.description_complete);
      }

      const res = await fetch("/api/admin/evenements/create", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || t("createError"));
        return;
      }

      setFormSuccess(t("createSuccess"));
      resetCreateForm();
      if (data.evenement) setEvenements((prev) => [data.evenement, ...prev]);
    } catch {
      setFormError(tc("serverError"));
    } finally {
      setFormLoading(false);
    }
  }

  function openEdit(evt: Evenement) {
    setEditingId(evt.id);
    setEditSuccess("");
    setEditError("");
    setEditForm({
      categorie: evt.categorie,
      date_debut: evt.date_debut || "",
      heure: evt.heure ? evt.heure.substring(0, 5) : "",
      statut: (evt.statut as Statut) || "brouillon",
      video_url: evt.video_url || "",
    });
    setEditI18n({
      fr: {
        titre: evt.titre || "",
        lieu: evt.lieu || "",
        description: evt.description || "",
        description_complete: evt.description_complete || "",
      },
      en: {
        titre: evt.titre_en ?? "",
        lieu: evt.lieu_en ?? "",
        description: evt.description_en ?? "",
        description_complete: evt.description_complete_en ?? "",
      },
      ar: {
        titre: evt.titre_ar ?? "",
        lieu: evt.lieu_ar ?? "",
        description: evt.description_ar ?? "",
        description_complete: evt.description_complete_ar ?? "",
      },
    });
    setEditCurrentImageUrl(evt.image_url);
    setEditImageFile(null);
    setEditRemoveImage(false);
    setEditExistingPhotos(
      (evt.photos_supplementaires || []).map((url) => ({ url, storagePath: url }))
    );
    setEditRemovedPhotoUrls([]);
    setEditNewPhotoFiles([]);
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
      fd.append("categorie", editForm.categorie);
      fd.append("description", editI18n.fr.description);
      fd.append("description_complete", editI18n.fr.description_complete);
      fd.append("date_debut", editForm.date_debut);
      fd.append("heure", editForm.heure);
      fd.append("lieu", editI18n.fr.lieu);
      fd.append("statut", editForm.statut);
      fd.append("video_url", editForm.video_url);

      // Traductions optionnelles EN/AR — toujours envoyées (y compris
      // vides) en édition pour permettre d'effacer une traduction existante ;
      // la route les convertit en NULL si vides plutôt que de les ignorer.
      for (const lang of ["en", "ar"] as const) {
        const v = editI18n[lang];
        fd.append(`titre_${lang}`, v.titre);
        fd.append(`lieu_${lang}`, v.lieu);
        fd.append(`description_${lang}`, v.description);
        fd.append(`description_complete_${lang}`, v.description_complete);
      }

      if (editImageFile) fd.append("image", editImageFile);
      if (editRemoveImage) fd.append("remove_image", "true");

      if (editRemovedPhotoUrls.length > 0) {
        fd.append("remove_photo_urls", JSON.stringify(editRemovedPhotoUrls));
      }
      editNewPhotoFiles.forEach((f, i) => fd.append(`photo_${i}`, f));

      const res = await fetch("/api/admin/evenements/update", {
        method: "PATCH",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || t("updateError"));
        return;
      }

      setEditSuccess(t("updateSuccess"));
      if (data.evenement) {
        setEvenements((prev) =>
          prev.map((e) => (e.id === id ? data.evenement : e))
        );
      }
      setEditingId(null);
    } catch {
      setEditError(tc("serverError"));
    } finally {
      setEditLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("confirmDelete"))) return;
    setDeleting(id);
    try {
      const res = await fetch("/api/admin/evenements/delete", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("countTotal", { count: evenements.length })} · {t("countPublished", { count: publies })} · {t("countDraft", { count: brouillons })} · {t("countUpcoming", { count: aVenirCount })}
        </p>

        <details className="group">
          <summary className="inline-flex cursor-pointer select-none items-center gap-1.5 rounded-lg bg-admin-forest px-3.5 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.98] hover:bg-admin-forest-light [&::-webkit-details-marker]:hidden">
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
            {t("new")}
          </summary>

          <div className="mt-3 rounded-2xl border border-admin-champagne-soft bg-surface-muted/70 p-5">
            <form onSubmit={handleCreate} className="space-y-3">
              {/* Catégorie + Statut */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="evt-categorie" className={labelCls}>
                    {tc("category")} <span className="text-admin-danger">*</span>
                  </label>
                  <select
                    id="evt-categorie"
                    value={formCategorie}
                    onChange={(e) => setFormCategorie(e.target.value as Categorie)}
                    className={inputCls}
                  >
                    {CATEGORIE_VALUES.map((c) => (
                      <option key={c} value={c}>
                        {t(`categories.${c}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="evt-statut" className={labelCls}>
                    {tc("status")} <span className="text-admin-danger">*</span>
                  </label>
                  <select
                    id="evt-statut"
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value as Statut)}
                    className={inputCls}
                  >
                    <option value="brouillon">{tc("draft")}</option>
                    <option value="publie">{tc("published")}</option>
                  </select>
                </div>
              </div>

              {/* Date + Heure */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="evt-date-debut" className={labelCls}>
                    {t("date")}
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
                    {t("time")}
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

              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{tc("contentSection")}</span>
                <span aria-hidden="true" className="h-px flex-1 bg-admin-champagne-soft/60" />
              </div>

              <TranslatedFields
                idPrefix="evt-create"
                fields={EVT_I18N_FIELDS}
                value={formI18n}
                onChange={(lang, key, next) =>
                  setFormI18n((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: next } }))
                }
                fieldClassName={inputCls}
                labelClassName={labelCls}
              />

              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{tc("mediaSection")}</span>
                <span aria-hidden="true" className="h-px flex-1 bg-admin-champagne-soft/60" />
              </div>

              {/* Image principale */}
              <ImageUploader
                label={tc("mainImage")}
                currentUrl={null}
                onChange={(file) => setFormImageFile(file)}
              />

              {/* Vidéo URL */}
              <div>
                <label htmlFor="evt-video-url" className={labelCls}>
                  {t("video")}
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
              <MultiImageUploader
                label={tc("additionalPhotos")}
                existingPhotos={[]}
                removedUrls={[]}
                onRemoveExisting={() => {}}
                onNewFilesChange={(files) => setFormPhotoFiles(files)}
              />

              <button
                type="submit"
                disabled={formLoading}
                className="rounded-lg bg-admin-forest px-4 py-2 text-sm font-medium text-white transition-colors duration-150 motion-safe:active:scale-[0.98] hover:bg-admin-forest-light disabled:opacity-50"
              >
                {formLoading ? t("creating") : t("create")}
              </button>

              {formSuccess && (
                <p className="admin-reveal text-sm text-admin-ink">{formSuccess}</p>
              )}
              {formError && (
                <p className="admin-reveal text-sm text-admin-danger">{formError}</p>
              )}
            </form>
          </div>
        </details>
      </div>

      {/* Liste */}
      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">{tc("loading")}</p>
      ) : evenements.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-admin-champagne-soft bg-surface-muted/60 px-4 py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-admin-champagne-soft">
            <svg className="h-5 w-5 text-admin-ink" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </span>
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {evenements.map((e) => {
            const avenir = isAvenir(e);
            const isEditing = editingId === e.id;

            return (
              <div
                key={e.id}
                className="rounded-xl border border-admin-champagne-soft/60 bg-surface transition-shadow duration-200 hover:shadow-[0_2px_16px_-4px_rgba(20,48,31,0.1)]"
              >
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between gap-4 p-4 sm:p-5">
                  <div className="flex min-w-0 flex-1 items-start gap-3.5">
                    {e.image_url ? (
                      <PhotoFrame variant="thumbnail" className="h-12 w-12 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={e.image_url} alt="" className="h-full w-full object-cover" />
                      </PhotoFrame>
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-muted ring-1 ring-admin-champagne-soft">
                        <svg className="h-5 w-5 text-admin-ink/70" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-ink/70">
                          <span
                            className={`h-1.5 w-1.5 shrink-0 rounded-full ${e.statut === "publie" ? "bg-admin-forest" : "bg-admin-champagne"}`}
                            aria-hidden="true"
                          />
                          {e.statut === "publie" ? tc("published") : tc("draft")}
                        </span>
                        {avenir ? (
                          <span className="inline-flex items-center rounded-full bg-admin-champagne/20 px-2 py-0.5 text-xs font-semibold text-admin-forest">
                            {t("upcoming")}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{t("past")}</span>
                        )}
                      </div>
                      <p className="mt-1.5 truncate text-sm font-semibold text-admin-ink">
                        {e.titre}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {e.date_debut
                          ? formatDateFr(e.date_debut)
                          : e.date_evenement || "—"}
                        {e.heure ? ` · ${e.heure.substring(0, 5)}` : ""}
                        {e.lieu ? ` · ${e.lieu}` : ""}
                        {" · "}
                        {t(`categories.${e.categorie}` as "categories.Environnement")}
                      </p>
                      {e.slug && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          /evenements/{e.slug}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() =>
                        isEditing ? setEditingId(null) : openEdit(e)
                      }
                      className="rounded-lg border border-admin-champagne-soft px-3 py-1.5 text-xs font-semibold text-admin-ink transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/50"
                    >
                      {isEditing ? tc("cancel") : tc("edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      disabled={deleting === e.id}
                      className="rounded-lg border border-admin-danger-border px-3 py-1.5 text-xs font-semibold text-admin-danger transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-danger-bg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger/50"
                    >
                      {deleting === e.id ? tc("deletingEllipsis") : tc("delete")}
                    </button>
                  </div>
                </div>

                {/* Formulaire d'édition inline */}
                {isEditing && (
                  <div className="admin-reveal border-t border-admin-champagne-soft/60 bg-surface-muted/70 p-4 sm:p-5">
                    <form
                      onSubmit={(ev) => handleUpdate(ev, e.id)}
                      className="space-y-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>
                            {tc("category")} <span className="text-admin-danger">*</span>
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
                            {CATEGORIE_VALUES.map((c) => (
                              <option key={c} value={c}>
                                {t(`categories.${c}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>
                            {tc("status")} <span className="text-admin-danger">*</span>
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
                            <option value="brouillon">{tc("draft")}</option>
                            <option value="publie">{tc("published")}</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className={labelCls}>{t("date")}</label>
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
                          <label className={labelCls}>{t("time")}</label>
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

                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{tc("contentSection")}</span>
                        <span aria-hidden="true" className="h-px flex-1 bg-admin-champagne-soft/60" />
                      </div>

                      <TranslatedFields
                        idPrefix={`evt-edit-${e.id}`}
                        fields={EVT_I18N_FIELDS}
                        value={editI18n}
                        onChange={(lang, key, next) =>
                          setEditI18n((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: next } }))
                        }
                        fieldClassName={inputCls}
                        labelClassName={labelCls}
                      />

                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{tc("mediaSection")}</span>
                        <span aria-hidden="true" className="h-px flex-1 bg-admin-champagne-soft/60" />
                      </div>

                      <ImageUploader
                        key={`img-${e.id}`}
                        label={tc("mainImage")}
                        currentUrl={editCurrentImageUrl}
                        onChange={(file, removeCurrent) => {
                          setEditImageFile(file);
                          setEditRemoveImage(removeCurrent);
                        }}
                      />

                      <div>
                        <label className={labelCls}>
                          {t("video")}
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

                      <MultiImageUploader
                        key={`photos-${e.id}`}
                        label={tc("additionalPhotos")}
                        existingPhotos={editExistingPhotos}
                        removedUrls={editRemovedPhotoUrls}
                        onRemoveExisting={(url) =>
                          setEditRemovedPhotoUrls((prev) => [...prev, url])
                        }
                        onNewFilesChange={(files) => setEditNewPhotoFiles(files)}
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
                          onClick={() => setEditingId(null)}
                          className="text-sm text-muted-foreground hover:text-admin-ink"
                        >
                          {tc("cancel")}
                        </button>
                      </div>

                      {editSuccess && (
                        <p className="admin-reveal text-sm text-admin-ink">{editSuccess}</p>
                      )}
                      {editError && (
                        <p className="admin-reveal text-sm text-admin-danger">{editError}</p>
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
