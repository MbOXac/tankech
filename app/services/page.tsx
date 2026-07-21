import ServicesGrid from "@/components/ServicesGrid";
import Link from "next/link";
import { ArrowRight, PhoneCall, ShieldCheck, Clock, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Nos Services de Construction, Rénovation & Bricolage à Tanger | TANKECH",
  description: "Découvrez tous les services TANKECH à Tanger : Gros œuvre (garantie décennale), rénovation complète, plomberie et électricité (urgence 24/7), peinture & tadelakt, et bricolage à domicile.",
};

export default function ServicesPage() {
  return (
    <main>
      {/* Services Hero Section */}
      <div className="pt-24 pb-16 bg-primary text-background relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10 space-y-6">
          <span className="inline-block bg-accent text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
            Service Tout-en-un à Tanger
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight">
            Des Solutions Complètes Pour Tous Vos Travaux
          </h1>
          <p className="text-lg md:text-xl text-background/80 max-w-3xl mx-auto leading-relaxed">
            De la grosse maçonnerie aux petits dépannages du quotidien, TANKECH met à votre disposition des artisans qualifiés et réactifs partout à Tanger.
          </p>

          {/* Quick Value Pillars */}
          <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15 flex items-center gap-3">
              <Clock className="text-accent shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-white text-sm">Intervention Urgente</h4>
                <p className="text-xs text-background/70">Plomberie & Électricité 24/7</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15 flex items-center gap-3">
              <ShieldCheck className="text-accent shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-white text-sm">Garantie Décennale</h4>
                <p className="text-xs text-background/70">Sur tous nos gros œuvres</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15 flex items-center gap-3">
              <CheckCircle className="text-accent shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-white text-sm">Devis Transparent</h4>
                <p className="text-xs text-background/70">Sans engagement sous 24h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <ServicesGrid />

      {/* Emergency Hotline Banner */}
      <section className="py-12 bg-red-600 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0">
              <Clock size={32} className="text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold">Besoin d'un Dépannage Urgent 24h/7j ?</h3>
              <p className="text-white/80 text-sm">Fuite d'eau, panne électrique ou serrure bloquée à Tanger ? Nos équipes sont d'astreinte.</p>
            </div>
          </div>
          <a
            href="tel:+212600000000"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg shrink-0"
          >
            <PhoneCall size={20} />
            Appeler Urgence 24/7
          </a>
        </div>
      </section>

      {/* Custom Quote Footer Banner */}
      <section className="py-20 bg-accent text-primary text-center relative">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Vous avez un projet sur-mesure ?</h2>
          <p className="text-lg mb-8 text-primary/80">
            Faites-nous part de vos plans ou idées de rénovation. Nous élaborons une estimation détaillée gratuite adaptée à vos exigences.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary text-background px-8 py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md"
          >
            Demander un devis sur-mesure
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </main>
  );
}
