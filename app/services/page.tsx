import { Metadata } from "next";
import ServicesGrid from "@/components/ServicesGrid";
import ScrollReveal from "@/components/ScrollReveal";
import { servicesData } from "@/data/servicesData";
import FallbackImage from "@/components/FallbackImage";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import {
  Building2,
  Home,
  Droplets,
  Zap,
  Paintbrush,
  Wrench,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Découvrez tous les services TANKECH : gros œuvre, rénovation, plomberie, électricité, peinture, bricolage. Devis gratuit à Tanger.",
};

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Home,
  Droplets,
  Zap,
  Paintbrush,
  Wrench,
};

export default function ServicesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gray-900 pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900/20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <span className="inline-block rounded-full bg-yellow-500/10 px-4 py-1.5 text-sm font-semibold text-yellow-400 mb-6">
            Nos Services
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white">
            6 domaines d'expertise, <br className="hidden md:block" />
            <span className="text-yellow-400">un seul interlocuteur</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Du gros œuvre au bricolage, TANKECH vous accompagne avec des
            artisans qualifiés, des garanties solides et une intervention rapide
            24/7.
          </p>
        </div>
      </section>

      {/* Quick category nav */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex overflow-x-auto gap-2 py-4 scrollbar-hide">
            {servicesData.map((s) => {
              const Icon = iconMap[s.icon] ?? Building2;
              return (
                <a
                  key={s.slug}
                  href={`#${s.slug}`}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-yellow-400 hover:text-yellow-600"
                >
                  <Icon className="h-4 w-4" />
                  {s.title}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive services grid */}
      <ServicesGrid />

      {/* Detailed sections per category */}
      {servicesData.map((cat, i) => {
        const Icon = iconMap[cat.icon] ?? Building2;
        const isEven = i % 2 === 0;

        return (
          <section
            key={cat.slug}
            id={cat.slug}
            className={`py-16 md:py-24 ${isEven ? "bg-white" : "bg-gray-50"}`}
          >
            <div className="mx-auto max-w-7xl px-4">
              <ScrollReveal>
                <div
                  className={`grid gap-12 lg:grid-cols-2 items-center ${
                    isEven ? "" : "lg:grid-flow-dense"
                  }`}
                >
                  {/* Image side */}
                  <div
                    className={`relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 ${
                      isEven ? "" : "lg:col-start-2"
                    }`}
                  >
                    <FallbackImage
  src={cat.coverImage}
  alt={cat.title}
  className="h-full w-full object-cover"
/>
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800/40 to-gray-600/40 -z-10" />
                    {/* Badge floating */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl bg-white/90 backdrop-blur-sm px-4 py-2 text-sm font-bold text-gray-800 shadow">
                      <Icon className="h-5 w-5 text-yellow-500" />
                      {cat.title}
                    </div>
                  </div>

                  {/* Text side */}
                  <div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                      {cat.title}
                    </h2>
                    <div
                      className={`mt-3 inline-block rounded-lg px-3 py-1 text-xs font-bold text-white ${
                        cat.badgeColor === "red"
                          ? "bg-red-600"
                          : cat.badgeColor === "blue"
                          ? "bg-blue-700"
                          : cat.badgeColor === "green"
                          ? "bg-emerald-600"
                          : cat.badgeColor === "purple"
                          ? "bg-purple-700"
                          : "bg-orange-500"
                      }`}
                    >
                      {cat.badge}
                    </div>
                    <p className="mt-6 text-gray-600 leading-relaxed">
                      {cat.longDescription}
                    </p>

                    {/* Sub-services grid */}
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      {cat.services.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-start gap-2 rounded-lg border border-gray-100 p-3"
                        >
                          <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {s.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {s.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/contact"
                      className="mt-8 inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 text-sm font-bold text-gray-900 shadow transition hover:bg-yellow-400 hover:shadow-lg active:scale-95"
                    >
                      Demander un Devis — {cat.title}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="bg-yellow-500 py-16">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-black text-gray-900">
              Vous ne trouvez pas votre service ?
            </h2>
            <p className="mt-4 text-gray-800">
              Contactez-nous et décrivez votre projet. Nous trouvons toujours la
              solution adaptée.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-xl bg-gray-900 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gray-800"
              >
                Contactez-nous
              </Link>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-green-600"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
