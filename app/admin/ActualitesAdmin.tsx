"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import TranslatedFields, { type TranslatedFieldDef } from "@/components/admin/TranslatedFields";

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
  titre_en?: string | null;
  titre_ar?: string | null;
  extrait_en?: string | null;
  extrait_ar?: string | null;
  contenu_en?: string | null;
  contenu_ar?: string | null;
}

interface ActualiteI18n {
  [key: string]: string;
  titre: string;
  extrait: string;
  contenu: string;
}

const EMPTY_I18N: ActualiteI18n = { titre: "", extrait: "", contenu: "" };

const CATEGORIE_VALUES: Categorie[] = ["environnement", "culture", "solidarite", "formation", "vie-associative"];

/* --- Composant principal --- */

export default function ActualitesAdmin() {
  const t = useTranslations("actualitesAdmin");
  const tc = useTranslations("common");

  const I18N_FIELDS: TranslatedFieldDef<ActualiteI18n>[] = [
    { key: "titre", label: tc("title"), type: "input", requiredOnFr: true },
    { key: "extrait", label: t("excerpt"), type: "textarea", rows: 3, requiredOnFr: true, placeholder: t("excerptPlaceholder") },
    { key: "contenu", label: t("fullContent"), type: "textarea", rows: 5, placeholder: t("fullContentPlaceholder") },
  ];

  const [actualites, setActualites] = useState<Actualite[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  /* Édition */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategorie, setEditCategorie] = useState<Categorie>("environnement");
  const [editStatut, setEditStatut] = useState<"brouillon" | "publie">("brouillon");
  const [editI18n, setEditI18n] = useState<{ fr: ActualiteI18n; en: ActualiteI18n; ar: ActualiteI18n }>({
    fr: EMPTY_I18N,
    en: EMPTY_I18N,
    ar: EMPTY_I18N,
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");

  /* Formulaire */
  const [formCategorie, setFormCategorie] = useState<Categorie>("environnement");
  const [formStatut, setFormStatut] = useState<"brouillon" | "publie">("brouillon");
  const [formI18n, setFormI18n] = useState<{ fr: ActualiteI18n; en: ActualiteI18n; ar: ActualiteI18n }>({
    fr: EMPTY_I18N,
    en: EMPTY_I18N,
    ar: EMPTY_I18N,
  });
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
          titre: formI18n.fr.titre,
          categorie: formCategorie,
          extrait: formI18n.fr.extrait,
          contenu: formI18n.fr.contenu,
          statut: formStatut,
          titre_en: formI18n.en.titre,
          titre_ar: formI18n.ar.titre,
          extrait_en: formI18n.en.extrait,
          extrait_ar: formI18n.ar.extrait,
          contenu_en: formI18n.en.contenu,
          contenu_ar: formI18n.ar.contenu,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || t("createError"));
        return;
      }

      setFormSuccess(t("createSuccess"));
      setFormI18n({ fr: EMPTY_I18N, en: EMPTY_I18N, ar: EMPTY_I18N });
      setFormStatut("brouillon");
      setFormCategorie("environnement");

      if (data.actualite) {
        setActualites((prev) => [data.actualite, ...prev]);
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
    setEditCategorie(a.categorie);
    setEditStatut((a.statut as "brouillon" | "publie") || "brouillon");
    setEditI18n({
      fr: { titre: a.titre, extrait: a.extrait, contenu: a.contenu },
      en: { titre: a.titre_en ?? "", extrait: a.extrait_en ?? "", contenu: a.contenu_en ?? "" },
      ar: { titre: a.titre_ar ?? "", extrait: a.extrait_ar ?? "", contenu: a.contenu_ar ?? "" },
    });
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
          titre: editI18n.fr.titre,
          categorie: editCategorie,
          extrait: editI18n.fr.extrait,
          contenu: editI18n.fr.contenu,
          statut: editStatut,
          titre_en: editI18n.en.titre,
          titre_ar: editI18n.ar.titre,
          extrait_en: editI18n.en.extrait,
          extrait_ar: editI18n.ar.extrait,
          contenu_en: editI18n.en.contenu,
          contenu_ar: editI18n.ar.contenu,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || t("updateError"));
        return;
      }

      setEditSuccess(t("updateSuccess"));
      if (data.actualite) {
        setActualites((prev) =>
          prev.map((a) => (a.id === id ? data.actualite : a))
        );
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
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /* Compteurs dérivés */
  const publiees = actualites.filter((a) => a.statut === "publie").length;
  const brouillons = actualites.filter((a) => a.statut === "brouillon").length;

  const fieldClass =
    "w-full rounded-lg border border-admin-champagne-soft bg-surface px-3 py-2 text-sm text-admin-ink outline-none transition-colors duration-150 focus:border-admin-forest focus:ring-2 focus:ring-admin-champagne/20";
  const labelClass = "mb-1 block text-sm font-medium text-admin-ink/80";

  return (
    <div>
      {/* Barre d'actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("countTotal", { count: actualites.length })} · {t("countPublished", { count: publiees })} · {t("countDraft", { count: brouillons })}
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
                  <label htmlFor="act-categorie" className={labelClass}>
                    {tc("category")}
                  </label>
                  <select
                    id="act-categorie"
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
                  <label htmlFor="act-statut" className={labelClass}>
                    {tc("status")}
                  </label>
                  <select
                    id="act-statut"
                    value={formStatut}
                    onChange={(e) => setFormStatut(e.target.value as "brouillon" | "publie")}
                    className={fieldClass}
                  >
                    <option value="brouillon">{tc("draft")}</option>
                    <option value="publie">{tc("published")}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{tc("contentSection")}</span>
                <span aria-hidden="true" className="h-px flex-1 bg-admin-champagne-soft/60" />
              </div>

              <TranslatedFields
                idPrefix="act-create"
                fields={I18N_FIELDS}
                value={formI18n}
                onChange={(lang, key, next) =>
                  setFormI18n((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: next } }))
                }
                fieldClassName={fieldClass}
                labelClassName={labelClass}
              />

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

      {/* Liste éditoriale */}
      {loading ? (
        <p className="mt-4 text-sm text-muted-foreground">{tc("loading")}</p>
      ) : actualites.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl border border-dashed border-admin-champagne-soft bg-surface-muted/60 px-4 py-14 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface ring-1 ring-admin-champagne-soft">
            <svg className="h-5 w-5 text-admin-ink" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </span>
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-2.5">
          {actualites.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-admin-champagne-soft/60 bg-surface p-4 transition-shadow duration-200 hover:shadow-[0_2px_16px_-4px_rgba(20,48,31,0.1)] sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 items-start gap-3.5">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted ring-1 ring-admin-champagne-soft">
                    <svg className="h-[18px] w-[18px] text-admin-ink" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-admin-ink/70">
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${a.statut === "publie" ? "bg-admin-forest" : "bg-admin-champagne"}`}
                          aria-hidden="true"
                        />
                        {a.statut === "publie" ? tc("published") : tc("draft")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t(`categories.${a.categorie}` as "categories.environnement")}
                      </span>
                      <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
                    </div>
                    <p className="mt-1.5 truncate text-sm font-semibold text-admin-ink">{a.titre}</p>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{a.extrait}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => (editingId === a.id ? closeEdit() : openEdit(a))}
                    className="rounded-lg border border-admin-champagne-soft px-3 py-1.5 text-xs font-semibold text-admin-ink transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-forest/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-champagne/50"
                  >
                    {editingId === a.id ? tc("cancel") : tc("edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deleting === a.id}
                    className="rounded-lg border border-admin-danger-border px-3 py-1.5 text-xs font-semibold text-admin-danger transition-colors duration-150 ease-out-strong motion-safe:active:scale-[0.97] hover:bg-admin-danger-bg disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-danger/50"
                  >
                    {deleting === a.id ? tc("deletingEllipsis") : tc("delete")}
                  </button>
                </div>
              </div>

              {editingId === a.id && (
                <form
                  onSubmit={(e) => handleUpdate(e, a.id)}
                  className="admin-reveal mt-4 space-y-3 rounded-xl border border-admin-champagne-soft bg-surface-muted/70 p-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`edit-categorie-${a.id}`} className={labelClass}>
                        {tc("category")}
                      </label>
                      <select
                        id={`edit-categorie-${a.id}`}
                        value={editCategorie}
                        onChange={(e) => setEditCategorie(e.target.value as Categorie)}
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
                      <label htmlFor={`edit-statut-${a.id}`} className={labelClass}>
                        {tc("status")}
                      </label>
                      <select
                        id={`edit-statut-${a.id}`}
                        value={editStatut}
                        onChange={(e) => setEditStatut(e.target.value as "brouillon" | "publie")}
                        className={fieldClass}
                      >
                        <option value="brouillon">{tc("draft")}</option>
                        <option value="publie">{tc("published")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{tc("contentSection")}</span>
                    <span aria-hidden="true" className="h-px flex-1 bg-admin-champagne-soft/60" />
                  </div>

                  <TranslatedFields
                    idPrefix={`act-edit-${a.id}`}
                    fields={I18N_FIELDS}
                    value={editI18n}
                    onChange={(lang, key, next) =>
                      setEditI18n((prev) => ({ ...prev, [lang]: { ...prev[lang], [key]: next } }))
                    }
                    fieldClassName={fieldClass}
                    labelClassName={labelClass}
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

                  {editSuccess && <p className="admin-reveal text-sm text-admin-ink">{editSuccess}</p>}
                  {editError && <p className="admin-reveal text-sm text-admin-danger">{editError}</p>}
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
