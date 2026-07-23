"use client";

import ScrollReveal from "./ScrollReveal";
import {
  Shield,
  Clock,
  Award,
  Users,
  ThumbsUp,
  Headphones,
} from "lucide-react";

const reasons = [
  {
    icon: Shield,
    title: "Garantie Décennale",
    description:
      "Tous nos travaux de gros œuvre sont couverts par notre garantie décennale pour votre tranquillité.",
  },
  {
    icon: Clock,
    title: "Urgence 24/7",
    description:
      "Plomberie, électricité — nos équipes interviennent en urgence à toute heure, 7 jours sur 7.",
  },
  {
    icon: Award,
    title: "Finition Artisanale",
    description:
      "Nos artisans maîtrisent les techniques traditionnelles marocaines : tadelakt, zellige, bois de cèdre.",
  },
  {
    icon: Users,
    title: "Équipe Qualifiée",
    description:
      "Maçons, électriciens, plombiers, peintres — chaque corps de métier est représenté par des experts.",
  },
  {
    icon: ThumbsUp,
    title: "Devis Gratuit & Transparent",
    description:
      "Pas de surprise : nos devis sont détaillés, gratuits et sans engagement.",
  },
  {
    icon: Headphones,
    title: "Suivi Personnalisé",
    description:
      "Un chef de projet dédié vous accompagne du début à la fin de votre chantier.",
  },
];

export default function WhyUs() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-semibold text-yellow-800 mb-4">
              Pourquoi TANKECH
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Des garanties qui <span className="text-yellow-500">font la différence</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r, i) => (
            <ScrollReveal key={r.title} delay={i * 80}>
              <div className="group rounded-2xl border border-gray-100 bg-gray-50 p-7 transition-all duration-300 hover:border-yellow-200 hover:bg-yellow-50/50 hover:shadow-lg">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600 transition-colors group-hover:bg-yellow-500 group-hover:text-white">
                  <r.icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{r.title}</h3>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {r.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
