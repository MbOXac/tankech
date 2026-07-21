"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle2, Send, PhoneCall } from "lucide-react";
import { ServiceCategory } from "@/data/servicesData";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialServiceId?: string;
  services: ServiceCategory[];
}

export default function QuoteModal({ isOpen, onClose, initialServiceId, services }: QuoteModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || services[0]?.id || "gros-oeuvre");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialServiceId) {
      setSelectedServiceId(initialServiceId);
    }
  }, [initialServiceId]);

  const activeService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleItemToggle = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const resetAndClose = () => {
    setIsSubmitted(false);
    setSelectedItems([]);
    setFormData({ name: "", phone: "", address: "", notes: "" });
    onClose();
  };

  if (!isOpen) return null;

  const whatsappMessage = encodeURIComponent(
    `Bonjour TANKECH! Je souhaite un devis pour: ${activeService?.title}.\n` +
    (selectedItems.length > 0 ? `Besoins spécifiques: ${selectedItems.join(", ")}\n` : "") +
    (formData.name ? `Nom: ${formData.name}\n` : "") +
    (formData.phone ? `Téléphone: ${formData.phone}\n` : "") +
    (formData.address ? `Quartier/Adresse à Tanger: ${formData.address}\n` : "") +
    (formData.notes ? `Détails: ${formData.notes}` : "")
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-primary text-background p-6 flex justify-between items-center relative">
          <div>
            <span className="text-xs uppercase tracking-widest text-accent font-bold">Devis En Ligne Sur-Mesure</span>
            <h3 className="text-2xl font-serif font-bold text-white mt-1">Demander un Devis Rapide</h3>
          </div>
          <button
            onClick={resetAndClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h4 className="text-2xl font-bold text-primary mb-2">Demande envoyée avec succès !</h4>
              <p className="text-text-secondary max-w-md mx-auto">
                Merci {formData.name || "cher client"}. Notre équipe TANKECH à Tanger examinera vos besoins et vous recontactera très rapidement.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/212600000000?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-lg transition-colors"
              >
                <Send size={18} />
                Envoyer via WhatsApp Direct
              </a>
              <button
                onClick={resetAndClose}
                className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-primary font-bold px-6 py-3 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-bold text-primary mb-2">1. Choisissez le domaine de service</label>
              <select
                value={selectedServiceId}
                onChange={(e) => {
                  setSelectedServiceId(e.target.value);
                  setSelectedItems([]);
                }}
                className="w-full bg-background border border-primary/20 rounded-lg p-3 text-primary font-medium focus:ring-2 focus:ring-accent focus:outline-none"
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.title} {service.badge ? `(${service.badge.text})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-services checkboxes */}
            {activeService && activeService.items.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-primary mb-2">
                  2. Sélectionnez vos besoins spécifiques (optionnel)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-background/50 p-4 rounded-xl border border-primary/10">
                  {activeService.items.map((item) => {
                    const isChecked = selectedItems.includes(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg cursor-pointer text-sm transition-all border ${
                          isChecked
                            ? "bg-primary/10 border-primary text-primary font-medium"
                            : "bg-white border-gray-200 text-text-secondary hover:border-primary/30"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleItemToggle(item)}
                          className="mt-0.5 accent-accent"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact Details */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-primary">3. Vos coordonnées</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    required
                    placeholder="Votre nom complet *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-primary/20 rounded-lg p-3 text-primary focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    placeholder="Téléphone / WhatsApp *"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-background border border-primary/20 rounded-lg p-3 text-primary focus:ring-2 focus:ring-accent focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Quartier / Ville à Tanger (ex: Malabata, Centre Ville...)"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-background border border-primary/20 rounded-lg p-3 text-primary focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  placeholder="Précisions supplémentaires sur vos travaux (surface, urgence, délais...)"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-background border border-primary/20 rounded-lg p-3 text-primary focus:ring-2 focus:ring-accent focus:outline-none"
                />
              </div>
            </div>

            {/* Submit buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-3 rounded-lg border border-gray-300 text-text-secondary hover:bg-gray-100 font-medium transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-lg bg-primary hover:bg-primary/90 text-background font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <PhoneCall size={18} />
                Valider ma demande de devis
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
