"use client";

import { useState, type FormEvent } from "react";

export default function AdhesionForm() {
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div>
        <label htmlFor="nom" className="mb-1 block text-sm font-medium">
          Nom complet
        </label>
        <input
          type="text"
          id="nom"
          required
          placeholder="Votre nom complet"
          value={formData.nom}
          onChange={(e) => handleChange("nom", e.target.value)}
          className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          placeholder="votre@email.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="telephone" className="mb-1 block text-sm font-medium">
          Téléphone
        </label>
        <input
          type="tel"
          id="telephone"
          placeholder="+212 6XX XXX XXX"
          value={formData.telephone}
          onChange={(e) => handleChange("telephone", e.target.value)}
          className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="statut" className="mb-1 block text-sm font-medium">
          Statut ou établissement
        </label>
        <input
          type="text"
          id="statut"
          required
          placeholder="Ex : Étudiant à l&apos;Université Mohammed Ier"
          value={formData.statut}
          onChange={(e) => handleChange("statut", e.target.value)}
          className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="interet" className="mb-1 block text-sm font-medium">
          Domaine d&apos;intérêt
        </label>
        <select
          id="interet"
          required
          value={formData.interet}
          onChange={(e) => handleChange("interet", e.target.value)}
          className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        >
          <option value="">-- Choisir un domaine --</option>
          <option value="actions-sociales">Actions sociales</option>
          <option value="activites-culturelles">Activités culturelles</option>
          <option value="environnement">Sensibilisation environnementale</option>
          <option value="evenements">Événements étudiants</option>
          <option value="formations">Formations et ateliers</option>
        </select>
      </div>
      <div>
        <label htmlFor="motivation" className="mb-1 block text-sm font-medium">
          Motivation
        </label>
        <textarea
          id="motivation"
          required
          rows={5}
          placeholder="Expliquez pourquoi vous souhaitez rejoindre l'association..."
          value={formData.motivation}
          onChange={(e) => handleChange("motivation", e.target.value)}
          className="w-full resize-y rounded-lg border border-muted bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
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
        className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark disabled:opacity-50"
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer ma demande"}
      </button>
      {status === "success" && (
        <p className="text-center text-sm font-medium text-green-600">
          Votre demande a bien été envoyée. Merci pour votre engagement !
        </p>
      )}
      {status === "error" && (
        <p className="text-center text-sm font-medium text-red-600">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}
    </form>
  );
}
