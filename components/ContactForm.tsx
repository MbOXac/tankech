"use client";

import { useState } from "react";
import { whatsappLink } from "@/data/siteConfig";
import { servicesData, type ServiceCategory } from "@/data/servicesData";
import { Send, Loader2, Check, MessageCircle, AlertCircle } from "lucide-react";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  service: "",
  city: "",
  message: "",
  website: "", // honeypot
};

interface SubmitResult {
  waUrl: string;
  savedToDb: boolean;
  emailSent: boolean;
}

interface ContactFormProps {
  services?: ServiceCategory[];
}

export default function ContactForm({
  services = servicesData,
}: ContactFormProps) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const waMsg = `Bonjour TANKECH,

Je souhaite demander un devis :
👤 Nom : ${form.name}
📱 Téléphone : ${form.phone}
📧 Email : ${form.email || "Non renseigné"}
🔧 Service : ${form.service || "Non précisé"}
🏙️ Ville : ${form.city || "Non renseignée"}
💬 Message : ${form.message || "Aucun"}`;

    const waUrl = whatsappLink(waMsg);

    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          category: form.service,
          services: form.service ? [form.service] : [],
          city: form.city,
          message: form.message,
          source: "contact_page",
          website: form.website,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        savedToDb?: boolean;
        emailSent?: boolean;
      };

      if (!res.ok || !data.ok) {
        setError(
          data.error ||
            "Une erreur est survenue. Vous pouvez nous contacter via WhatsApp."
        );
        setSubmitting(false);
        return;
      }

      // If neither DB nor email is configured yet, automatically open WhatsApp as fallback
      if (!data.savedToDb && !data.emailSent) {
        window.open(waUrl, "_blank", "noopener,noreferrer");
      }

      setResult({
        waUrl,
        savedToDb: Boolean(data.savedToDb),
        emailSent: Boolean(data.emailSent),
      });
    } catch {
      setError(
        "Impossible de joindre le serveur. Veuillez réessayer ou utiliser WhatsApp."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const delivered = result.savedToDb || result.emailSent;
    return (
      <div className="py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          {delivered ? "Demande envoyée !" : "Demande prête sur WhatsApp !"}
        </h3>
        <p className="mt-2 text-gray-500">
          {delivered
            ? "Votre demande de devis a bien été enregistrée. Nous vous recontactons sous 24h."
            : "WhatsApp s'est ouvert avec votre message pré-rempli. Envoyez-le pour recevoir votre devis sous 24h."}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={result.waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow transition hover:bg-green-600"
          >
            <MessageCircle className="h-4 w-4" />{" "}
            {delivered ? "Suivre aussi sur WhatsApp" : "Ouvrir WhatsApp"}
          </a>
          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setResult(null);
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

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Honeypot anti-spam field */}
      <div className="hidden" aria-hidden="true">
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>

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
          {services.map((s) => (
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
            <Loader2 className="h-5 w-5 animate-spin" /> Envoi en cours…
          </>
        ) : (
          <>
            <Send className="h-5 w-5" /> Envoyer la Demande
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Devis gratuit et sans engagement — réponse sous 24h
      </p>
    </form>
  );
}
