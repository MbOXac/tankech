"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Intervenez-vous en dehors de Tanger ?",
    answer: "Notre zone d'intervention principale est Tanger et ses environs immédiats (jusqu'à 30km) afin de garantir notre réactivité, particulièrement pour les services de bricolage."
  },
  {
    question: "Proposez-vous des devis gratuits pour le bricolage ?",
    answer: "Oui, tous nos devis sont 100% gratuits et sans engagement, que ce soit pour la construction d'une villa ou pour de petits travaux de plomberie."
  },
  {
    question: "Quels sont vos délais d'intervention ?",
    answer: "Pour les urgences (fuite, panne électrique), nous intervenons sous 24h. Pour les projets de rénovation ou construction, nous établissons un planning détaillé lors du devis."
  },
  {
    question: "Vos travaux sont-ils garantis ?",
    answer: "Absolument. Nous offrons une garantie décennale sur le gros œuvre et une garantie de parfait achèvement sur tous nos travaux de second œuvre et bricolage."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-serif font-bold text-primary mb-4">Questions Fréquentes</h2>
          <p className="text-text-secondary">Tout ce que vous devez savoir sur nos services.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-lg transition-colors duration-200 ${openIndex === index ? 'border-accent bg-accent/5' : 'border-primary/10 hover:border-primary/30'}`}
            >
              <button
                className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-bold text-primary text-lg">{faq.question}</span>
                <ChevronDown className={`text-accent transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-5 text-text-secondary leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
