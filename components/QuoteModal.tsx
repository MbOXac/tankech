"use client";

import { useState } from "react";
import { ServiceCategory } from "@/data/servicesData";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import { X, Check, Phone, Send, Loader2 } from "lucide-react";

interface Props {
  category: ServiceCategory | null;
  onClose: () => void;
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Build WhatsApp message as fallback
    const serviceNames =
      category?.services
        .filter((s) => selectedServices.includes(s.id))
        .map((s) => s.name)
        .join(", ") ?? "";

    const waMsg = `Bonjour TANKECH,

Je souhaite demander un devis pour :
📋 Catégorie : ${category?.title}
🔧 Services : ${serviceNames}
👤 Nom : ${form.name}
📱 Téléphone : ${form.phone}
📧 Email : ${form.email}
🏙️ Ville : ${form.city}
💬 Message : ${form.message}`;

    // TODO: Replace with Firestore/API call
    // For now, open WhatsApp with pre-filled message
    window.open(whatsappLink(waMsg), "_blank");

    // Simulate submission delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Devis — {category?.title}
            </h3>
            <p className="text-sm text-gray-400">
              Sélectionnez les services et remplissez vos coordonnées
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h4 className="text-xl font-bold text-gray-900">
              Demande envoyée !
            </h4>
            <p className="mt-2 text-gray-500">
              Nous vous contacterons dans les plus brefs délais. Vous pouvez
              aussi nous joindre directement sur WhatsApp.
            </p>
            <button
              onClick={onClose}
              className="mt-6 rounded-xl bg-gray-900 px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Select services */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Services souhaités
              </label>
              <div className="grid grid-cols-2 gap-2">
                {category?.services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s.id)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                      selectedServices.includes(s.id)
                        ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Check
                      className={`h-4 w-4 ${
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
              <label className="block text-sm font-semibold text-gray-700">
                Vos coordonnées
              </label>
              <input
                required
                type="text"
                placeholder="Nom complet"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
              <input
                required
                type="tel"
                placeholder="Téléphone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
              <input
                type="email"
                placeholder="Email (optionnel)"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
              <input
                type="text"
                placeholder="Ville"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
              />
              <textarea
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
