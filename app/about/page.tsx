import Link from "next/link";
import { ArrowRight, Target, Shield, Users } from "lucide-react";

export const metadata = {
  title: "À Propos | TANKECH Tanger",
  description: "En savoir plus sur TANKECH, entreprise de construction et de bricolage de référence à Tanger.",
};

export default function AboutPage() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="pt-24 pb-20 bg-primary text-background relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-serif font-bold mb-6">Notre Histoire</h1>
            <p className="text-xl text-background/80 leading-relaxed">
              Fondée à Tanger, TANKECH est née d'une volonté simple : offrir un service de construction et de bricolage qui allie l'exigence des grands chantiers à la flexibilité des petits travaux.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Values */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-primary/5 text-center">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">Notre Mission</h3>
              <p className="text-text-secondary leading-relaxed">
                Accompagner les Tangérois dans l'amélioration de leur habitat, avec des solutions fiables, de la pose d'une étagère à la construction d'une villa.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-primary/5 text-center">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">Notre Engagement</h3>
              <p className="text-text-secondary leading-relaxed">
                Transparence totale sur les prix, respect rigoureux des délais, et une qualité de finition irréprochable garantie.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-primary/5 text-center">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-accent" size={32} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">Notre Équipe</h3>
              <p className="text-text-secondary leading-relaxed">
                Des artisans et ingénieurs passionnés, rigoureusement sélectionnés pour leur savoir-faire et leur sens du service.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-primary mb-6">Prêt à démarrer votre projet ?</h2>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-primary text-background px-8 py-4 rounded font-bold text-lg hover:bg-primary/90 transition-colors">
            Contactez notre équipe
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
