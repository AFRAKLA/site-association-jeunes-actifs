"use client";

import { useState } from "react";

type Lang = "fr" | "en" | "ar";

const LANG_TABS: { value: Lang; label: string }[] = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export interface TranslatedFieldDef<T extends Record<string, string>> {
  key: keyof T & string;
  label: string;
  type: "input" | "textarea";
  rows?: number;
  placeholder?: string;
  /** Requis uniquement sur l'onglet Français — EN/AR restent toujours facultatifs. */
  requiredOnFr?: boolean;
}

/**
 * Onglets FR / English / العربية pour les champs éditoriaux traduisibles
 * (titre, extrait, description...) — un seul composant réutilisé par les
 * formulaires Actualités / Événements / Galerie, création ET édition,
 * pour ne jamais dupliquer la logique d'onglets ni le comportement RTL de
 * l'onglet arabe (dir="rtl" posé uniquement sur ces champs précis, jamais
 * sur le reste de l'admin — voir §5 du lot i18n Supabase).
 */
export default function TranslatedFields<T extends Record<string, string>>({
  idPrefix,
  fields,
  value,
  onChange,
  fieldClassName,
  labelClassName,
}: {
  idPrefix: string;
  fields: TranslatedFieldDef<T>[];
  value: { fr: T; en: T; ar: T };
  onChange: (lang: Lang, key: keyof T & string, next: string) => void;
  fieldClassName: string;
  labelClassName: string;
}) {
  const [lang, setLang] = useState<Lang>("fr");
  const current = value[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";

  return (
    <div>
      <div role="tablist" aria-label="Langue du contenu" className="flex gap-1 rounded-lg bg-admin-ivory-warm p-1">
        {LANG_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={lang === tab.value}
            onClick={() => setLang(tab.value)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
              lang === tab.value
                ? "bg-white text-admin-forest shadow-sm"
                : "text-muted-foreground hover:text-admin-forest"
            }`}
          >
            {tab.label}
            {tab.value !== "fr" && (
              <span className="ms-1 text-[10px] text-muted-foreground/70">(optionnel)</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-3 space-y-3" dir={dir}>
        {fields.map((field) => {
          const id = `${idPrefix}-${lang}-${field.key}`;
          const required = lang === "fr" && !!field.requiredOnFr;
          return (
            <div key={field.key}>
              <label htmlFor={id} className={labelClassName}>
                {field.label}
                {lang !== "fr" && <span className="ms-1 font-normal text-muted-foreground">(facultatif)</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  id={id}
                  dir={dir}
                  required={required}
                  rows={field.rows ?? 4}
                  value={current[field.key]}
                  onChange={(e) => onChange(lang, field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={`resize-y ${fieldClassName}`}
                />
              ) : (
                <input
                  id={id}
                  type="text"
                  dir={dir}
                  required={required}
                  value={current[field.key]}
                  onChange={(e) => onChange(lang, field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className={fieldClassName}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
