import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata = {
  title: "Contact | TANKECH Tanger",
  description: "Contactez TANKECH pour un devis de construction, rénovation ou bricolage à Tanger.",
};

export default function ContactPage() {
  return (
    <div className="py-24 bg-background">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-serif font-bold text-primary mb-6">Contactez-nous</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Une question ? Un projet de construction ou besoin d'un dépannage rapide en bricolage ? Notre équipe à Tanger est à votre écoute.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-primary/5">
              <h3 className="text-2xl font-bold text-primary mb-6">Coordonnées</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <MapPin className="text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-primary mb-1">Adresse</p>
                    <p className="text-text-secondary">Avenue Principale, Centre-ville<br/>Tanger, Maroc</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Phone className="text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-primary mb-1">Téléphone & WhatsApp</p>
                    <a href="tel:+21200000000" className="text-text-secondary hover:text-accent transition-colors">+212 000 00 00 00</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Mail className="text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-primary mb-1">Email</p>
                    <a href="mailto:contact@tankech.ma" className="text-text-secondary hover:text-accent transition-colors">contact@tankech.ma</a>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                    <Clock className="text-accent" />
                  </div>
                  <div>
                    <p className="font-bold text-primary mb-1">Horaires</p>
                    <p className="text-text-secondary">Lun - Sam : 8h00 - 18h00<br/>Urgences bricolage : 24/7</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-xl shadow-lg border border-primary/10">
            <h3 className="text-2xl font-bold text-primary mb-6">Demander un devis gratuit</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-2">Nom complet</label>
                  <input type="text" id="name" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" placeholder="Votre nom" />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">Téléphone</label>
                  <input type="tel" id="phone" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" placeholder="Votre numéro" />
                </div>
              </div>
              
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-text-primary mb-2">Type de service</label>
                <select id="service" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent">
                  <option value="">Sélectionnez un service</option>
                  <option value="construction">Gros Œuvre / Construction</option>
                  <option value="renovation">Rénovation</option>
                  <option value="bricolage">Bricolage à domicile</option>
                  <option value="plomberie">Plomberie</option>
                  <option value="electricite">Électricité</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-text-primary mb-2">Détails de votre projet</label>
                <textarea id="message" rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent" placeholder="Décrivez vos besoins..."></textarea>
              </div>

              <button type="button" className="w-full bg-primary text-background font-bold text-lg py-4 rounded-lg hover:bg-primary/90 transition-colors">
                Envoyer la demande
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
