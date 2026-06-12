"use client";

import { useState, type FormEvent } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      await res.json();

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({ nom: "", email: "", sujet: "", message: "", website: "" });
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
          Nom
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
        <label htmlFor="sujet" className="mb-1 block text-sm font-medium">
          Sujet
        </label>
        <input
          type="text"
          id="sujet"
          required
          placeholder="Sujet de votre message"
          value={formData.sujet}
          onChange={(e) => handleChange("sujet", e.target.value)}
          className="w-full rounded-lg border border-muted bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          placeholder="Écrivez votre message ici..."
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
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
        {status === "loading" ? "Envoi en cours..." : "Envoyer"}
      </button>
      {status === "success" && (
        <p className="text-center text-sm font-medium text-green-600">
          Votre message a bien été envoyé. Merci !
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
