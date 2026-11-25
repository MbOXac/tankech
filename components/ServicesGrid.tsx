"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { servicesData, ServiceCategory } from "@/data/servicesData";
import QuoteModal from "./QuoteModal";
import ScrollReveal from "./ScrollReveal";
import FallbackImage from "./FallbackImage";
import {
  Building2,
  Home,
  Droplets,
  Zap,
  Paintbrush,
  Wrench,
  Layers,
  Search,
  Check,
  ArrowRight,
  AlertTriangle,
  Shield,
  Clock,
  Award,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Home,
  Droplets,
  Zap,
  Paintbrush,
  Wrench,
  Layers,
};

const badgeIconMap: Record<string, React.ElementType> = {
  red: AlertTriangle,
  blue: Shield,
  green: Award,
  purple: Award,
  orange: Clock,
  yellow: Shield,
};

interface ServicesGridProps {
  services?: ServiceCategory[];
  hideHeader?: boolean;
}

export default function ServicesGrid({
  services = servicesData,
  hideHeader = false,
}: ServicesGridProps) {
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ServiceCategory | null>(null);

  const filtered = useMemo(() => {
    let data = services;
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data
        .map((cat) => ({
          ...cat,
          services: cat.services.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.description.toLowerCase().includes(q) ||
              cat.title.toLowerCase().includes(q)
          ),
        }))
        .filter((cat) => cat.services.length > 0);
    }
    return data;
  }, [search, services]);

  const openModal = (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    setModalOpen(true);
  };

  return (
    <section id="services" className="py-14 md:py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4">
        {/* Section header */}
        {!hideHeader && (
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-block rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-semibold text-yellow-800 mb-4">
                Nos Services
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-gray-900">
                Des solutions complètes <br className="hidden md:block" />
                <span className="text-yellow-500">pour chaque projet</span>
              </h2>
              <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                De la construction neuve au petit bricolage, TANKECH couvre tous
                vos besoins avec des artisans qualifiés et des garanties solides.
              </p>
            </div>
          </ScrollReveal>
        )}

        {/* Search bar */}
        <ScrollReveal delay={100}>
          <div className="relative max-w-lg mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un service… (ex: époxy, tadelakt, piscine, fuite)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm shadow-sm transition focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
            />
          </div>
        </ScrollReveal>

        {/* Category pills — every service navigates straight to /services/[slug] */}
        <ScrollReveal delay={150}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Link
              href="/services"
              className="rounded-full px-5 py-2 text-sm font-semibold transition-all bg-[#0B1F44] text-white shadow-md hover:bg-gray-900"
            >
              Tous
            </Link>
            {services.map((cat) => (
              <Link
                key={cat.slug}
                href={`/services/${cat.slug}`}
                className="rounded-full px-5 py-2 text-sm font-semibold transition-all bg-white text-gray-700 border border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 hover:text-gray-900 hover:-translate-y-0.5 shadow-xs"
              >
                {cat.title}
              </Link>
            ))}
          </div>
        </ScrollReveal>

        {/* Service cards grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((cat, i) => {
            const Icon = iconMap[cat.icon] ?? Building2;
            const BadgeIcon = badgeIconMap[cat.badgeColor] ?? Shield;

            return (
              <ScrollReveal key={cat.slug} delay={i * 100} direction="up">
                <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  {/* Cover image (clickable to dedicated service page) */}
                  <Link
                    href={`/services/${cat.slug}`}
                    className="relative isolate block h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-600"
                  >
                    <FallbackImage
                      src={cat.coverImage}
                      alt={cat.title}
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Badge */}
                    <div
                      className={`relative z-10 inline-flex m-3 items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold text-white shadow-md ${
                        cat.badgeColor === "red"
                          ? "bg-red-600"
                          : cat.badgeColor === "blue"
                          ? "bg-blue-700"
                          : cat.badgeColor === "green"
                          ? "bg-emerald-600"
                          : cat.badgeColor === "purple"
                          ? "bg-purple-700"
                          : cat.badgeColor === "yellow"
                          ? "bg-amber-600"
                          : "bg-orange-500"
                      }`}
                    >
                      <BadgeIcon className="h-3.5 w-3.5" />
                      {cat.badge}
                    </div>

                    {/* Icon overlay */}
                    <div className="absolute bottom-3 right-3 z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                  </Link>

                  {/* Card body */}
                  <div className="flex flex-1 flex-col p-6">
                    <Link
                      href={`/services/${cat.slug}`}
                      className="text-xl font-bold text-gray-900 hover:text-yellow-600 transition-colors"
                    >
                      {cat.title}
                    </Link>
                    <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                      {cat.shortDescription}
                    </p>

                    {/* Service list */}
                    <ul className="mt-4 flex-1 space-y-2">
                      {cat.services.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                          <span>
                            <strong>{s.name}</strong>{" "}
                            <span className="text-gray-400">—</span>{" "}
                            <span className="text-gray-500">
                              {s.description}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTAs */}
                    <div className="mt-6 flex gap-2">
                      <button
                        type="button"
                        onClick={() => openModal(cat)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-yellow-500 hover:text-gray-900 active:scale-95"
                      >
                        Devis Gratuit
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/services/${cat.slug}`}
                        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-gray-700 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-gray-900"
                      >
                        Détails
                      </Link>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* No results */}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-gray-400">
            <Search className="mx-auto h-12 w-12 mb-4" />
            <p className="text-lg font-medium">Aucun service trouvé</p>
            <p className="text-sm">Essayez un autre mot-clé ou catégorie.</p>
          </div>
        )}
      </div>

      {/* Quote modal */}
      {modalOpen && (
        <QuoteModal
          category={selectedCategory}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}
