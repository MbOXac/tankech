import Hero from "@/components/Hero";
import ServicesGrid from "@/components/ServicesGrid";
import ProjectsGallery from "@/components/ProjectsGallery";
import WhyUs from "@/components/WhyUs";
import Stats from "@/components/Stats";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import ScrollReveal from "@/components/ScrollReveal";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import { Phone } from "lucide-react";

export default function HomePage() {
  return (
    <>
      {/* Hero — Full-screen video */}
      <Hero />

      {/* Services — Interactive grid */}
      <ServicesGrid />

      {/* Stats — Animated counters */}
      <Stats />

      {/* Why Us — 6 reasons */}
      <WhyUs />

      {/* Projects — Before/After gallery */}
      <ProjectsGallery />

      {/* Testimonials — Client reviews */}
      <Testimonials />

      {/* FAQ */}
      <FAQ />

      {/* Emergency CTA */}
      <section className="bg-gray-900 py-16">
        <ScrollReveal>
          <div className="mx-auto max-w-4xl px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Urgence plomberie ou électricité ?
            </h2>
            <p className="mt-4 text-lg text-white/60">
              Notre équipe intervient en moins de 2 heures, 24h/24 et 7j/7 à
              Tanger et environs.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`tel:${siteConfig.phoneRaw}`}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-red-500 hover:shadow-xl active:scale-95 pulse-glow"
              >
                <Phone className="h-5 w-5" /> Appeler Maintenant
              </a>
              <a
                href={whatsappLink(
                  "Bonjour TANKECH, j'ai une urgence plomberie/électricité."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-[#25D366] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-green-600"
              >
                WhatsApp Urgence
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}
