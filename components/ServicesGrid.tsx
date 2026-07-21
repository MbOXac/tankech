"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Home,
  Ruler,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
  Search,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { serviceCategories, ServiceCategory } from "@/data/servicesData";
import QuoteModal from "./QuoteModal";

const iconMap = {
  Home,
  Ruler,
  Wrench,
  Zap,
  Paintbrush,
  Hammer,
};

export default function ServicesGrid() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [modalServiceId, setModalServiceId] = useState<string | null>(null);

  const filteredServices = serviceCategories.filter((service) => {
    const matchesCategory = activeCategory === "all" || service.id === activeCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.items.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleOpenQuote = (serviceId: string) => {
    setModalServiceId(serviceId);
  };

  return (
    <section className="py-20 bg-background" id="services-section">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block bg-accent/15 text-primary text-sm font-bold px-4 py-1.5 rounded-full mb-4">
            Construction, Rénovation & Bricolage à Tanger
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-6">
            Nos Services TANKECH
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed">
            De la construction sur-mesure aux interventions rapides du quotidien, découvrez notre palette complète de prestations professionnelles.
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div className="max-w-5xl mx-auto mb-12 space-y-6">
          
          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input
              type="text"
              placeholder="Rechercher un service (ex: Tadelakt, Fuite, Placo, Piscine...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-primary/15 rounded-full py-3.5 pl-12 pr-6 text-primary shadow-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-text-secondary hover:text-primary font-bold"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all ${
                activeCategory === "all"
                  ? "bg-primary text-background shadow-md"
                  : "bg-white text-text-primary hover:bg-primary/5 border border-primary/10"
              }`}
            >
              Tous les services ({serviceCategories.length})
            </button>
            {serviceCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full font-medium text-sm transition-all flex items-center gap-2 ${
                  activeCategory === cat.id
                    ? "bg-primary text-background shadow-md"
                    : "bg-white text-text-primary hover:bg-primary/5 border border-primary/10"
                }`}
              >
                <span>{cat.title}</span>
                {cat.badge?.type === "urgent" && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Services Cards Grid */}
        {filteredServices.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-primary/10 max-w-xl mx-auto">
            <p className="text-lg text-text-secondary mb-4">Aucun service ne correspond à votre recherche "{searchQuery}".</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="bg-primary text-background px-6 py-2.5 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => {
              const IconComponent = iconMap[service.iconName] || Home;

              return (
                <div
                  key={service.id}
                  id={service.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-primary/10 hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Image Container */}
                    <div className="relative h-56 w-full overflow-hidden bg-primary/5">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                      {/* Badge Overlay */}
                      {service.badge && (
                        <div className="absolute top-4 left-4">
                          {service.badge.type === "urgent" && (
                            <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              <Clock size={14} />
                              {service.badge.text}
                            </span>
                          )}
                          {service.badge.type === "warranty" && (
                            <span className="inline-flex items-center gap-1.5 bg-amber-500 text-primary font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
                              <ShieldCheck size={14} />
                              {service.badge.text}
                            </span>
                          )}
                          {service.badge.type === "quality" && (
                            <span className="inline-flex items-center gap-1.5 bg-accent text-primary font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
                              <Sparkles size={14} />
                              {service.badge.text}
                            </span>
                          )}
                          {service.badge.type === "popular" && (
                            <span className="inline-flex items-center gap-1.5 bg-primary text-background font-bold text-xs px-3 py-1.5 rounded-full shadow-lg">
                              <CheckCircle2 size={14} />
                              {service.badge.text}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Icon overlay on bottom right */}
                      <div className="absolute bottom-4 right-4 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-md">
                        <IconComponent className="text-primary group-hover:text-accent transition-colors" size={24} />
                      </div>

                      {/* Title on image */}
                      <div className="absolute bottom-4 left-4 pr-16">
                        <h3 className="text-2xl font-serif font-bold text-white tracking-tight drop-shadow-md">
                          {service.title}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 space-y-4">
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {service.shortDescription}
                      </p>

                      {/* Sub-services list */}
                      <div className="border-t border-primary/10 pt-4 space-y-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Prestations incluses :</span>
                        <ul className="space-y-1.5">
                          {service.items.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-text-secondary">
                              <CheckCircle2 size={15} className="text-accent shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="p-6 pt-0 mt-auto">
                    <button
                      onClick={() => handleOpenQuote(service.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-background py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm group-hover:shadow-md"
                    >
                      <PhoneCall size={16} />
                      Demander un devis express
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal render */}
        <QuoteModal
          isOpen={!!modalServiceId}
          onClose={() => setModalServiceId(null)}
          initialServiceId={modalServiceId || undefined}
          services={serviceCategories}
        />
      </div>
    </section>
  );
}
