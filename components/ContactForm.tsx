"use client";

import { useState } from "react";
import { whatsappLink } from "@/data/siteConfig";
import { servicesData } from "@/data/servicesData";
import { Send, Loader2, Check, MessageCircle } from "lucide-react";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  service: "",
  city: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submittedUrl, setSubmittedUrl] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const waMsg = `Bonjour TANKECH,

Je souhaite demander un devis :
👤 Nom : ${form.name}
📱 Téléphone : ${form.phone}
📧 Email : ${form.email || "Non renseigné"}
🔧 Service : ${form.service || "Non précisé"}
🏙️ Ville : ${form.city || "Non renseignée"}
💬 Message : ${form.message || "Aucun"}`;

    const url = whatsappLink(waMsg);
    window.open(url, "_blank", "noopener,noreferrer");

    setSubmitting(false);
    setSubmittedUrl(url);
  };

  if (submittedUrl) {
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          Demande prête sur WhatsApp !
        </h3>
        <p className="mt-2 text-gray-500">
          WhatsApp s&apos;est ouvert avec votre message pré-rempli. Envoyez-le
          pour recevoir votre devis sous 24h.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={submittedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-green-600"
          >
            <MessageCircle className="h-4 w-4" /> Ouvrir WhatsApp
          </a>
          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setSubmittedUrl(null);
            }}
            className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Nouvelle demande
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Demander un Devis Gratuit
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          required
          type="text"
          aria-label="Nom complet"
          placeholder="Nom complet *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
        />
        <input
          required
          type="tel"
          aria-label="Téléphone"
          placeholder="Téléphone *"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
        />
      </div>

      <input
        type="email"
        aria-label="Email"
        placeholder="Email (optionnel)"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <select
          aria-label="Service souhaité"
          value={form.service}
          onChange={(e) => setForm({ ...form, service: e.target.value })}
          className="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 text-gray-600"
        >
          <option value="">Sélectionnez un service</option>
          {servicesData.map((s) => (
            <option key={s.slug} value={s.title}>
              {s.title}
            </option>
          ))}
        </select>
        <input
          type="text"
          aria-label="Ville"
          placeholder="Ville"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          className="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
        />
      </div>

      <textarea
        aria-label="Description du projet"
        placeholder="Décrivez votre projet…"
        rows={5}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 resize-none"
      />

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-4 text-base font-bold text-gray-900 shadow-lg transition hover:bg-yellow-400 hover:shadow-xl active:scale-95 disabled:opacity-50"
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Préparation…
          </>
        ) : (
          <>
            <Send className="h-5 w-5" /> Envoyer via WhatsApp
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Devis gratuit et sans engagement — réponse sous 24h
      </p>
    </form>
  );
}
