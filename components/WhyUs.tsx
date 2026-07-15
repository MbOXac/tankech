import { CheckCircle2 } from "lucide-react";

export default function WhyUs() {
  const reasons = [
    "Équipe locale d'experts certifiés à Tanger",
    "Devis transparent et détaillé sous 48h",
    "Respect strict des délais annoncés",
    "Matériaux de première qualité",
    "Suivi de chantier personnalisé",
    "Garantie décennale sur le gros œuvre",
    "Interventions bricolage rapides",
    "Service client à l'écoute et réactif",
  ];

  return (
    <section className="py-24 bg-[#F0EEE6]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-serif font-bold text-primary mb-6">Pourquoi choisir TANKECH ?</h2>
            <p className="text-text-secondary text-lg mb-10 leading-relaxed">
              Nous allions l'expertise d'une grande entreprise de construction à l'agilité d'un service de bricolage de proximité. Notre engagement : la qualité sans compromis et votre tranquillité d'esprit totale.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle2 className="text-accent shrink-0 mt-0.5" size={20} />
                  <span className="text-primary font-medium">{reason}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="aspect-square bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-center p-8 overflow-hidden relative">
               <div className="absolute inset-0 bg-primary/10"></div>
               {/* Abstract placeholder for high quality image */}
               <div className="relative z-10 w-full h-full border-2 border-dashed border-primary/30 rounded-xl flex items-center justify-center bg-white/50 backdrop-blur-sm">
                  <span className="text-primary/40 font-medium">Image de chantier / équipe premium</span>
               </div>
               
               <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-xl shadow-xl border border-primary/10">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-primary font-bold text-xl">T</div>
                   <div>
                     <p className="font-bold text-primary">Qualité Premium</p>
                     <p className="text-sm text-text-secondary">Approuvé par nos clients</p>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
