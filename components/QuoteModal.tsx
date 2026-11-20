"use client";

import { useState, useEffect } from "react";
import { ServiceCategory } from "@/data/servicesData";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import {
  X,
  Check,
  Phone,
  Send,
  Loader2,
  MessageCircle,
  AlertCircle,
} from "lucide-react";

interface Props {
  category: ServiceCategory | null;
  onClose: () => void;
}

interface SubmitResult {
  waUrl: string;
  savedToDb: boolean;
  emailSent: boolean;
}

export default function QuoteModal({ category, onClose }: Props) {
  const [selectedServices, setSelectedServices] = useState<string[]>(
    category?.services.map((s) => s.id) ?? []
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    message: "",
    website: "", // honeypot
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const serviceNames =
      category?.services
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => s.name) ?? [];

    const waMsg = `Bonjour TANKECH,

Je souhaite demander un devis pour :
📋 Catégorie : ${category?.title ?? ""}
🔧 Services : ${serviceNames.join(", ") || "Non précisé"}
👤 Nom : ${form.name}
📱 Téléphone : ${form.phone}
📧 Email : ${form.email || "Non renseigné"}
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
          category: category?.title ?? "",
          services: serviceNames,
          city: form.city,
          message: form.message,
          source: "quote_modal",
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl modal-enter">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h3
              id="quote-modal-title"
              className="text-lg font-bold text-gray-900"
            >
              Devis — {category?.title}
            </h3>
            <p className="text-sm text-gray-400">
              Sélectionnez les services et remplissez vos coordonnées
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {result ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">
              {result.savedToDb || result.emailSent
                ? "Demande envoyée !"
                : "Demande prête sur WhatsApp !"}
            </h4>
            <p className="mt-2 text-gray-500">
              {result.savedToDb || result.emailSent
                ? "Votre demande de devis a bien été enregistrée. Nous vous recontactons sous 24h."
                : "WhatsApp s'est ouvert avec votre message pré-rempli. Envoyez-le pour recevoir votre devis sous 24h."}
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={result.waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white hover:bg-green-600 transition"
              >
                <MessageCircle className="h-4 w-4" />{" "}
                {result.savedToDb || result.emailSent
                  ? "Suivre sur WhatsApp"
                  : "Ouvrir WhatsApp"}
              </a>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Honeypot */}
            <div className="hidden" aria-hidden="true">
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            {/* Select services */}
            <div>
              <p className="block text-sm font-semibold text-gray-700 mb-3">
                Services souhaités
              </p>
              <div className="grid grid-cols-2 gap-2">
                {category?.services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={selectedServices.includes(s.id)}
                    onClick={() => toggleService(s.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                      selectedServices.includes(s.id)
                        ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        selectedServices.includes(s.id)
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }`}
                    />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-3">
              <p className="block text-sm font-semibold text-gray-700">
                Vos coordonnées
              </p>
              <input
                required
                type="text"
                aria-label="Nom complet"
                placeholder="Nom complet *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
              <input
                required
                type="tel"
                aria-label="Téléphone"
                placeholder="Téléphone *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
              <input
                type="email"
                aria-label="Email"
                placeholder="Email (optionnel)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
              <input
                type="text"
                aria-label="Ville"
                placeholder="Ville"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
              <textarea
                aria-label="Description du projet"
                placeholder="Décrivez votre projet…"
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 resize-none"
              />
            </div>

            {/* Submit */}
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
                  <Send className="h-5 w-5" /> Envoyer la Demande de Devis
                </>
              )}
            </button>

            <p className="text-center text-xs text-gray-400">
              Ou appelez directement{" "}
              <a
                href={`tel:${siteConfig.phoneRaw}`}
                className="font-semibold text-gray-600 hover:text-yellow-600"
              >
                <Phone className="inline h-3 w-3" /> {siteConfig.phone}
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
