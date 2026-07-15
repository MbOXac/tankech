import { Hammer, Wrench, Zap, Paintbrush, Home, Ruler } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "gros-oeuvre",
    title: "Gros Œuvre",
    description: "Fondations, maçonnerie et structures solides pour vos projets de construction à Tanger.",
    icon: Home,
  },
  {
    id: "renovation",
    title: "Rénovation Complète",
    description: "Transformation et modernisation de vos espaces de vie ou locaux professionnels.",
    icon: Ruler,
  },
  {
    id: "plomberie",
    title: "Plomberie",
    description: "Installation, réparation et entretien de vos réseaux d'eau et sanitaires.",
    icon: Wrench,
  },
  {
    id: "electricite",
    title: "Électricité",
    description: "Mise aux normes, installation de tableaux électriques et éclairage.",
    icon: Zap,
  },
  {
    id: "peinture",
    title: "Peinture & Revêtements",
    description: "Finitions soignées pour murs, plafonds et sols de haute qualité.",
    icon: Paintbrush,
  },
  {
    id: "bricolage",
    title: "Bricolage à domicile",
    description: "Interventions rapides pour vos petits travaux : montage de meubles, fixations, réparations.",
    icon: Hammer,
  },
];

export default function ServicesGrid() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-serif font-bold text-primary mb-6">Nos Services à Tanger</h2>
          <p className="text-text-secondary text-lg">
            De la construction sur-mesure aux petits travaux de bricolage, notre équipe d'experts répond à tous vos besoins avec professionnalisme.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="group bg-white p-8 rounded-xl shadow-sm border border-primary/5 hover:shadow-lg transition-all hover:border-accent/30 duration-300">
              <div className="w-14 h-14 bg-primary/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                <service.icon className="text-primary group-hover:text-accent transition-colors" size={28} />
              </div>
              <h3 className="text-xl font-bold text-primary mb-3">{service.title}</h3>
              <p className="text-text-secondary mb-6 line-clamp-3">{service.description}</p>
              <Link href={`/services#${service.id}`} className="inline-flex items-center text-primary font-medium hover:text-accent transition-colors">
                En savoir plus
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
