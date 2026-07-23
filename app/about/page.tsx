import { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import Link from "next/link";
import {
  Shield,
  Users,
  Target,
  Heart,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "À Propos",
  description:
    "Découvrez TANKECH — entreprise de construction et rénovation à Tanger. Notre histoire, nos valeurs, notre équipe.",
};

const values = [
  {
    icon: Shield,
    title: "Engagement & Confiance",
    text: "Chaque projet est traité avec le plus grand sérieux. Notre garantie décennale et nos certifications parlent pour nous.",
  },
  {
    icon: Target,
    title: "Excellence & Précision",
    text: "Nous visons la perfection dans chaque détail — du gros œuvre aux finitions artisanales.",
  },
  {
    icon: Heart,
    title: "Respect du Client",
    text: "Écoute, transparence et suivi personnalisé : votre satisfaction est notre priorité.",
  },
  {
    icon: Clock,
    title: "Respect des Délais",
    text: "Un planning rigoureux et une équipe organisée pour livrer dans les temps, sans compromis sur la qualité.",
  },
];

const timeline = [
  { year: "2015", title: "Création de TANKECH", text: "Fondation à Tanger avec une équipe de 5 artisans passionnés." },
  { year: "2018", title: "Expansion des Services", text: "Ajout de plomberie, électricité et peinture à notre offre." },
  { year: "2020", title: "Service d'Urgence 24/7", text: "Lancement de notre service d'intervention rapide disponible 24h/24." },
  { year: "2023", title: "100+ Projets Réalisés", text: "Cap des 100 projets franchi avec un taux de satisfaction de 98%." },
  { year: "2025", title: "Couverture Régionale", text: "Intervention dans tout le Nord du Maroc : Tanger, Tétouan, Al Hoceima." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gray-900 pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900/20" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 text-center">
          <span className="inline-block rounded-full bg-yellow-500/10 px-4 py-1.5 text-sm font-semibold text-yellow-400 mb-6">
            À Propos
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white">
            Construire avec <span className="text-yellow-400">passion</span>,
            <br className="hidden md:block" />
            livrer avec <span className="text-yellow-400">excellence</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
            Depuis notre création, TANKECH s'engage à offrir des services de
            construction et rénovation d'exception à Tanger et dans tout le Nord
            du Maroc.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <ScrollReveal>
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-yellow-800/30 to-gray-800/30">
                {/* Replace with actual team photo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="mx-auto h-16 w-16 text-yellow-500/60" />
                    <p className="mt-4 text-white/40 text-sm">Photo d'équipe</p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                  Notre Histoire
                </h2>
                <div className="mt-6 space-y-4 text-gray-600 leading-relaxed">
                  <p>
                    TANKECH est née de la conviction qu'il manquait à Tanger une
                    entreprise capable d'offrir tous les corps de métier du
                    bâtiment sous un même toit, avec un niveau de qualité et de
                    service digne des meilleures entreprises internationales.
                  </p>
                  <p>
                    Fondée par des professionnels passionnés du bâtiment, notre
                    entreprise a grandi organiquement, recrutant les meilleurs
                    artisans de chaque spécialité : maçons, plombiers,
                    électriciens, peintres, menuisiers.
                  </p>
                  <p>
                    Aujourd'hui, TANKECH est synonyme de fiabilité, de garantie
                    décennale et de finition artisanale. Chaque projet — du plus
                    petit dépannage à la construction complète d'une villa —
                    bénéficie de la même attention et du même engagement.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Nos <span className="text-yellow-500">Valeurs</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <ScrollReveal key={v.title} delay={i * 100}>
                <div className="text-center rounded-2xl bg-white border border-gray-100 p-7 shadow-sm hover:shadow-lg transition">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
                    <v.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {v.text}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4">
          <ScrollReveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Notre <span className="text-yellow-500">Parcours</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-yellow-200 md:left-1/2 md:-translate-x-px" />

            <div className="space-y-8">
              {timeline.map((item, i) => (
                <ScrollReveal key={item.year} delay={i * 100}>
                  <div
                    className={`relative flex items-start gap-6 md:gap-0 ${
                      i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Dot */}
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 ring-4 ring-yellow-100 z-10" />

                    {/* Content */}
                    <div className={`ml-14 md:ml-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                      <span className="text-sm font-bold text-yellow-600">
                        {item.year}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{item.text}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 md:py-24 bg-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black">
                Certifications & <span className="text-yellow-400">Garanties</span>
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                <Shield className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                <h3 className="text-lg font-bold">Garantie Décennale</h3>
                <p className="mt-2 text-sm text-white/50">
                  Couverture complète pour tous les travaux de gros œuvre pendant
                  10 ans.
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                <Award className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                <h3 className="text-lg font-bold">Artisans Certifiés</h3>
                <p className="mt-2 text-sm text-white/50">
                  Tous nos artisans sont qualifiés et formés aux normes en
                  vigueur.
                </p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
                <h3 className="text-lg font-bold">Mise aux Normes</h3>
                <p className="mt-2 text-sm text-white/50">
                  Installations électriques et plomberie conformes aux normes
                  marocaines.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-yellow-500 py-16">
        <ScrollReveal>
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="text-3xl font-black text-gray-900">
              Envie de travailler avec nous ?
            </h2>
            <p className="mt-4 text-gray-800">
              Contactez-nous pour discuter de votre projet — devis gratuit et
              sans engagement.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-xl bg-gray-900 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:bg-gray-800"
              >
                Demander un Devis
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
