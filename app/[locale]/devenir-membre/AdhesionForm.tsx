"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

export default function AdhesionForm() {
  const t = useTranslations("adhesionForm");
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    statut: "",
    interet: "",
    motivation: "",
    website: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/adhesion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({
        nom: "",
        email: "",
        telephone: "",
        statut: "",
        interet: "",
        motivation: "",
        website: "",
      });
    } catch {
      setStatus("error");
    }
  }

  function handleChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="nom" className="mb-2 block text-sm font-medium text-ink">
          {t("nomLabel")}
        </label>
        <input
          type="text"
          id="nom"
          required
          placeholder={t("nomPlaceholder")}
          value={formData.nom}
          onChange={(e) => handleChange("nom", e.target.value)}
          className="w-full rounded-xl border border-champagne-soft bg-background px-4 py-3.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-forest focus:ring-2 focus:ring-forest/15"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium text-ink">
          {t("emailLabel")}
        </label>
        <input
          type="email"
          id="email"
          required
          placeholder={t("emailPlaceholder")}
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full rounded-xl border border-champagne-soft bg-background px-4 py-3.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-forest focus:ring-2 focus:ring-forest/15"
        />
      </div>
      <div>
        <label htmlFor="telephone" className="mb-2 block text-sm font-medium text-ink">
          {t("telephoneLabel")}
        </label>
        <input
          type="tel"
          id="telephone"
          placeholder={t("telephonePlaceholder")}
          value={formData.telephone}
          onChange={(e) => handleChange("telephone", e.target.value)}
          className="w-full rounded-xl border border-champagne-soft bg-background px-4 py-3.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-forest focus:ring-2 focus:ring-forest/15"
        />
      </div>
      <div>
        <label htmlFor="statut" className="mb-2 block text-sm font-medium text-ink">
          {t("statutLabel")}
        </label>
        <input
          type="text"
          id="statut"
          required
          placeholder={t("statutPlaceholder")}
          value={formData.statut}
          onChange={(e) => handleChange("statut", e.target.value)}
          className="w-full rounded-xl border border-champagne-soft bg-background px-4 py-3.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-forest focus:ring-2 focus:ring-forest/15"
        />
      </div>
      <div>
        <label htmlFor="interet" className="mb-2 block text-sm font-medium text-ink">
          {t("interetLabel")}
        </label>
        <select
          id="interet"
          required
          value={formData.interet}
          onChange={(e) => handleChange("interet", e.target.value)}
          className="w-full rounded-xl border border-champagne-soft bg-background px-4 py-3.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-forest focus:ring-2 focus:ring-forest/15"
        >
          <option value="">{t("interetPlaceholder")}</option>
          <option value="actions-sociales">{t("options.actionsSociales")}</option>
          <option value="activites-culturelles">{t("options.activitesCulturelles")}</option>
          <option value="environnement">{t("options.environnement")}</option>
          <option value="evenements">{t("options.evenements")}</option>
          <option value="formations">{t("options.formations")}</option>
        </select>
      </div>
      <div>
        <label htmlFor="motivation" className="mb-2 block text-sm font-medium text-ink">
          {t("motivationLabel")}
        </label>
        <textarea
          id="motivation"
          required
          rows={5}
          placeholder={t("motivationPlaceholder")}
          value={formData.motivation}
          onChange={(e) => handleChange("motivation", e.target.value)}
          className="w-full resize-y rounded-xl border border-champagne-soft bg-background px-4 py-3.5 text-sm text-ink outline-none transition-colors duration-150 focus:border-forest focus:ring-2 focus:ring-forest/15"
        />
      </div>
      {/* Honeypot anti-spam — champ caché, ne doit jamais être rempli par un humain */}
      <div style={{ display: "none" }} aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={formData.website}
          onChange={(e) => handleChange("website", e.target.value)}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-forest px-6 py-3.5 text-sm font-medium text-ivory transition duration-150 ease-out-strong motion-safe:active:scale-[0.99] hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? t("submitting") : t("submit")}
      </button>
      {status === "success" && (
        <p className="admin-reveal rounded-xl border border-forest/20 bg-forest/5 px-4 py-3 text-center text-sm font-medium text-forest">
          {t("success")}
        </p>
      )}
      {status === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
          {t("error")}
        </p>
      )}
    </form>
  );
}
