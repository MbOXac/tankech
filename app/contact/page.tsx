"use client";

import { useState } from "react";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import { servicesData } from "@/data/servicesData";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  Send,
  Loader2,
  Check,
  AlertTriangle,
} from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    city: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const waMsg = `Bonjour TANKECH,

Je souhaite demander un devis :
👤 Nom : ${form.name}
📱 Téléphone : ${form.phone}
📧 Email : ${form.email}
🔧 Service : ${form.service}
🏙️ Ville : ${form.city}
💬 Message : ${form.message}`;

    window.open(whatsappLink(waMsg), "_blank");

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gray-900 pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900/20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <span className="inline-block rounded-full bg-yellow-500/10 px-4 py-1.5 text-sm font-semibold text-yellow-400 mb-6">
            Contact
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white">
            Parlons de votre <span className="text-yellow-400">projet</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Demandez votre devis gratuit en remplissant le formulaire ci-dessous
            ou contactez-nous directement par téléphone ou WhatsApp.
          </p>
        </div>
      </section>

      {/* Emergency banner */}
      <section className="bg-red-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
            <div>
              <p className="font-bold">Urgence Plomberie / Électricité ?</p>
              <p className="text-sm text-white/80">
                Intervention rapide 24h/24 — appelez ou WhatsApp
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={`tel:${siteConfig.phoneRaw}`}
              className="flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-gray-100"
            >
              <Phone className="h-4 w-4" /> Appeler
            </a>
            <a
              href={whatsappLink(
                "Bonjour TANKECH, j'ai une urgence plomberie/électricité."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[#25D366] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-600"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-5">
            {/* Contact info */}
            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 mb-6">
                    Informations de Contact
                  </h2>

                  <div className="space-y-5">
                    <a
                      href={`tel:${siteConfig.phoneRaw}`}
                      className="flex items-start gap-4 group"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition">
                        <Phone className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Téléphone</p>
                        <p className="font-bold text-gray-900">
                          {siteConfig.phone}
                        </p>
                      </div>
                    </a>

                    <a
                      href={`mailto:${siteConfig.email}`}
                      className="flex items-start gap-4 group"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-white transition">
                        <Mail className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="font-bold text-gray-900">
                          {siteConfig.email}
                        </p>
                      </div>
                    </a>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Adresse</p>
                        <p className="font-bold text-gray-900">
                          {siteConfig.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Horaires</p>
                        <p className="font-bold text-gray-900">
                          Lun–Sam : 8h–20h
                        </p>
                        <p className="text-sm text-red-600 font-semibold">
                          Urgence 24/7
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Map */}
              <ScrollReveal delay={200}>
                <div className="overflow-hidden rounded-2xl border border-gray-200 h-64 bg-gray-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d105575.35360022856!2d-5.85!3d35.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd0b8747e8e0e6e7%3A0x6e5e5e5e5e5e5e5e!2sTangier%2C%20Morocco!5e0!3m2!1sfr!2sma!4v1700000000000!5m2!1sfr!2sma"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localisation TANKECH à Tanger"
                  />
                </div>
              </ScrollReveal>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <ScrollReveal delay={100}>
                <div className="rounded-2xl bg-white border border-gray-100 shadow-lg p-8 md:p-10">
                  {submitted ? (
                    <div className="py-12 text-center">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Demande envoyée !
                      </h3>
                      <p className="mt-2 text-gray-500">
                        Nous vous recontactons sous 24h. En urgence, appelez
                        directement.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Demander un Devis Gratuit
                      </h3>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <input
                          required
                          type="text"
                          placeholder="Nom complet *"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          className="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                        />
                        <input
                          required
                          type="tel"
                          placeholder="Téléphone *"
                          value={form.phone}
                          onChange={(e) =>
                            setForm({ ...form, phone: e.target.value })
                          }
                          className="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                        />
                      </div>

                      <input
                        type="email"
                        placeholder="Email (optionnel)"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <select
                          value={form.service}
                          onChange={(e) =>
                            setForm({ ...form, service: e.target.value })
                          }
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
                          placeholder="Ville"
                          value={form.city}
                          onChange={(e) =>
                            setForm({ ...form, city: e.target.value })
                          }
                          className="rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
                        />
                      </div>

                      <textarea
                        placeholder="Décrivez votre projet…"
                        rows={5}
                        value={form.message}
                        onChange={(e) =>
                          setForm({ ...form, message: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100 resize-none"
                      />

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-4 text-base font-bold text-gray-900 shadow-lg transition hover:bg-yellow-400 hover:shadow-xl active:scale-95 disabled:opacity-50"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />{" "}
                            Envoi…
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
                  )}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
