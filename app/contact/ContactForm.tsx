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
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="nom" className="mb-2 block text-sm font-semibold text-foreground">
          Nom
        </label>
        <input
          type="text"
          id="nom"
          required
          placeholder="Votre nom complet"
          value={formData.nom}
          onChange={(e) => handleChange("nom", e.target.value)}
          className="w-full rounded-xl border border-muted bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
          Email
        </label>
        <input
          type="email"
          id="email"
          required
          placeholder="votre@email.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full rounded-xl border border-muted bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="sujet" className="mb-2 block text-sm font-semibold text-foreground">
          Sujet
        </label>
        <input
          type="text"
          id="sujet"
          required
          placeholder="Sujet de votre message"
          value={formData.sujet}
          onChange={(e) => handleChange("sujet", e.target.value)}
          className="w-full rounded-xl border border-muted bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label htmlFor="message" className="mb-2 block text-sm font-semibold text-foreground">
          Message
        </label>
        <textarea
          id="message"
          required
          rows={5}
          placeholder="Écrivez votre message ici..."
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          className="w-full resize-y rounded-xl border border-muted bg-background px-4 py-3.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
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
        className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary-dark hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer"}
      </button>
      {status === "success" && (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700">
          Votre message a bien été envoyé. Merci !
        </p>
      )}
      {status === "error" && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
          Une erreur est survenue. Veuillez réessayer.
        </p>
      )}
    </form>
  );
}
