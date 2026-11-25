import type { Metadata } from "next";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import { getPublicServices } from "@/lib/content";
import ScrollReveal from "@/components/ScrollReveal";
import ContactForm from "@/components/ContactForm";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact & Devis",
  description:
    "Contactez TANKECH à Tanger pour un devis gratuit en construction, rénovation, plomberie, électricité ou peinture. Urgence 24/7.",
};

export const revalidate = 60;

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; message?: string }>;
}) {
  const [services, query] = await Promise.all([
    getPublicServices(),
    searchParams,
  ]);
  const defaultService =
    typeof query.service === "string" ? query.service.slice(0, 100) : "";
  const defaultMessage =
    typeof query.message === "string" ? query.message.slice(0, 1500) : "";

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
                    src="https://maps.google.com/maps?q=Tanger,Maroc&t=&z=13&ie=UTF8&iwloc=&output=embed"
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
                  <ContactForm
                    services={services}
                    defaultService={defaultService}
                    defaultMessage={defaultMessage}
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
