import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-24 pb-32 overflow-hidden bg-primary text-background">
      {/* Abstract Skyline background element */}
      <div className="absolute bottom-0 inset-x-0 opacity-10 pointer-events-none">
        <svg viewBox="0 0 1200 200" className="w-full h-auto" preserveAspectRatio="none">
          <path d="M0,200 L0,150 L100,150 L100,100 L200,100 L200,120 L300,120 L300,80 L450,80 L450,140 L600,140 L600,60 L750,60 L750,110 L900,110 L900,160 L1000,160 L1000,90 L1100,90 L1100,180 L1200,180 L1200,200 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/20 text-accent font-semibold tracking-wide text-sm mb-6 border border-accent/30">
            Experts à Tanger
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight mb-8">
            Construisez vos projets avec <span className="text-accent">excellence.</span>
          </h1>
          <p className="text-xl text-background/80 mb-10 max-w-2xl leading-relaxed font-light">
            De la construction de gros œuvre aux services de bricolage à domicile. TANKECH est votre partenaire de confiance pour des réalisations durables à Tanger.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/contact" className="bg-accent text-primary px-8 py-4 rounded font-bold text-lg hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 group">
              Demander un devis gratuit
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/services" className="border border-background/20 px-8 py-4 rounded font-medium text-lg hover:bg-background/10 transition-colors flex items-center justify-center">
              Découvrir nos services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
