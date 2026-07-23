"use client";

import { useState } from "react";
import ScrollReveal from "./ScrollReveal";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Comment demander un devis ?",
    a: "C'est simple ! Cliquez sur le bouton « Demander un Devis » présent sur chaque page, remplissez le formulaire avec les détails de votre projet, et nous vous recontactons sous 24h. Vous pouvez aussi nous appeler directement ou envoyer un message WhatsApp.",
  },
  {
    q: "Quels sont vos délais d'intervention ?",
    a: "Pour les urgences (plomberie, électricité), nous intervenons sous 45 minutes à 2h. Pour les projets de construction ou rénovation, un planning détaillé est établi lors du devis et nous nous engageons à le respecter.",
  },
  {
    q: "Proposez-vous une garantie sur vos travaux ?",
    a: "Oui ! Tous nos travaux de gros œuvre bénéficient d'une garantie décennale. Les autres travaux sont couverts par une garantie biennale. Nous fournissons tous les certificats d'assurance nécessaires.",
  },
  {
    q: "Intervenez-vous uniquement à Tanger ?",
    a: "Nous sommes basés à Tanger mais intervenons dans toute la région du Nord (Tétouan, Al Hoceima, Chefchaouen, Ksar El Kébir). Pour les projets importants, nous pouvons nous déplacer dans d'autres villes.",
  },
  {
    q: "Quel est le montant minimum pour faire appel à vos services ?",
    a: "Il n'y a pas de montant minimum ! Que ce soit pour un petit dépannage ou un grand projet de construction, nous traitons chaque demande avec la même attention. Le devis est toujours gratuit et sans engagement.",
  },
  {
    q: "Comment se passe le paiement ?",
    a: "Le paiement se fait par étapes selon l'avancement du chantier (acompte, étapes intermédiaires, solde à la réception). Nous acceptons les virements, chèques et espèces. Des facilités de paiement peuvent être étudiées pour les projets importants.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 md:py-28 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4">
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-semibold text-yellow-800 mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Questions <span className="text-yellow-500">Fréquentes</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} delay={i * 60}>
              <div
                className={`rounded-xl border transition-all duration-300 ${
                  open === i
                    ? "border-yellow-300 bg-yellow-50/50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span
                    className={`text-base font-semibold pr-4 ${
                      open === i ? "text-yellow-700" : "text-gray-800"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
                      open === i ? "rotate-180 text-yellow-500" : "text-gray-400"
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    open === i ? "max-h-96 pb-5" : "max-h-0"
                  }`}
                >
                  <p className="px-6 text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
