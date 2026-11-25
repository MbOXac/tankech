import { Metadata } from "next";
import Link from "next/link";
import ServicesGrid from "@/components/ServicesGrid";
import ScrollReveal from "@/components/ScrollReveal";
import { getPublicServices } from "@/lib/content";
import { whatsappLink } from "@/data/siteConfig";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Découvrez tous les services TANKECH : gros œuvre, rénovation, plomberie, électricité, peinture, bricolage et résine époxy. Devis gratuit à Tanger.",
};

export const revalidate = 60;

export default async function ServicesPage() {
  const services = await getPublicServices();

  return (
    <>
      {/* Clean Light Architectural Header (matches /services/[slug] seamlessly) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F4] via-white to-gray-50 border-b border-stone-200/70 pt-32 pb-12 md:pt-40 md:pb-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 right-1/4 h-72 w-72 rounded-full bg-amber-200/25 blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <span className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 mb-4">
            Nos Services
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-[#0B1F44] tracking-tight">
            {services.length} domaines d&apos;expertise,{" "}
            <span className="text-amber-600">un seul interlocuteur</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg text-gray-600">
            Sélectionnez un service ci-dessous pour découvrir toutes nos
            prestations détaillées et demander votre devis gratuit à Tanger.
          </p>
        </div>
      </section>

      {/* Single unified services list — clicking any category opens /services/[slug] smoothly */}
      <ServicesGrid services={services} hideHeader />

      {/* Bottom CTA */}
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
                className="rounded-xl bg-[#0B1F44] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gray-900"
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
