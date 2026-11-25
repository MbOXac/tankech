"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { whatsappLink } from "@/data/siteConfig";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Calculator,
  ArrowRight,
  MessageCircle,
  Clock,
  Sparkles,
} from "lucide-react";

interface ProjectTypeOption {
  id: string;
  label: string;
  serviceTitle: string;
  unitLabel: string;
  minArea: number;
  maxArea: number;
  defaultArea: number;
  basePerUnit: [number, number]; // [min DH, max DH] for standard
  weeksRange: string;
}

const PROJECT_TYPES: ProjectTypeOption[] = [
  {
    id: "renovation",
    label: "Rénovation Complète",
    serviceTitle: "Rénovation",
    unitLabel: "m²",
    minArea: 25,
    maxArea: 400,
    defaultArea: 90,
    basePerUnit: [1600, 2400],
    weeksRange: "4 à 8 semaines",
  },
  {
    id: "gros-oeuvre",
    label: "Construction Neuve (Gros Œuvre)",
    serviceTitle: "Gros Œuvre",
    unitLabel: "m²",
    minArea: 60,
    maxArea: 600,
    defaultArea: 150,
    basePerUnit: [2200, 3200],
    weeksRange: "4 à 9 mois",
  },
  {
    id: "epoxy",
    label: "Sol Résine Époxy",
    serviceTitle: "Résine Époxy",
    unitLabel: "m²",
    minArea: 15,
    maxArea: 500,
    defaultArea: 60,
    basePerUnit: [280, 480],
    weeksRange: "3 à 7 jours",
  },
  {
    id: "peinture",
    label: "Peinture & Tadelakt",
    serviceTitle: "Peinture & Finitions",
    unitLabel: "m²",
    minArea: 20,
    maxArea: 500,
    defaultArea: 100,
    basePerUnit: [70, 140],
    weeksRange: "4 à 10 jours",
  },
  {
    id: "salle-de-bain",
    label: "Salle de Bain / Cuisine",
    serviceTitle: "Rénovation",
    unitLabel: "m²",
    minArea: 6,
    maxArea: 60,
    defaultArea: 12,
    basePerUnit: [2200, 3600],
    weeksRange: "2 à 3 semaines",
  },
  {
    id: "plomb-elec",
    label: "Plomberie / Électricité Complète",
    serviceTitle: "Électricité",
    unitLabel: "m²",
    minArea: 30,
    maxArea: 400,
    defaultArea: 100,
    basePerUnit: [250, 450],
    weeksRange: "1 à 3 semaines",
  },
];

const FINISH_TIERS = [
  { id: "standard", label: "Standard", desc: "Qualité durable & maîtrisée", factor: 1 },
  { id: "standing", label: "Haut Standing", desc: "Matériaux premium & finitions soignées", factor: 1.32 },
  { id: "luxe", label: "Luxe / Sur-mesure", desc: "Tadelakt, domotique, prestations d'exception", factor: 1.68 },
] as const;

export default function BudgetEstimator() {
  const [selectedTypeId, setSelectedTypeId] = useState(PROJECT_TYPES[0].id);
  const [area, setArea] = useState(PROJECT_TYPES[0].defaultArea);
  const [tierId, setTierId] = useState<(typeof FINISH_TIERS)[number]["id"]>("standing");

  const projectType =
    PROJECT_TYPES.find((p) => p.id === selectedTypeId) ?? PROJECT_TYPES[0];
  const tier = FINISH_TIERS.find((t) => t.id === tierId) ?? FINISH_TIERS[1];

  const handleSelectType = (opt: ProjectTypeOption) => {
    setSelectedTypeId(opt.id);
    setArea(opt.defaultArea);
  };

  const { minEstimate, maxEstimate } = useMemo(() => {
    const rawMin = area * projectType.basePerUnit[0] * tier.factor;
    const rawMax = area * projectType.basePerUnit[1] * tier.factor;
    return {
      minEstimate: Math.round(rawMin / 500) * 500,
      maxEstimate: Math.round(rawMax / 500) * 500,
    };
  }, [area, projectType, tier]);

  const summaryText = `Estimation en ligne TANKECH : ${projectType.label} — Surface : ${area} ${projectType.unitLabel} — Finition : ${tier.label} — Fourchette estimée : ${minEstimate.toLocaleString("fr-MA")} à ${maxEstimate.toLocaleString("fr-MA")} DH.`;

  const contactHref = `/contact?service=${encodeURIComponent(
    projectType.serviceTitle
  )}&message=${encodeURIComponent(summaryText)}`;

  return (
    <section id="simulateur" className="py-20 md:py-24 bg-[#FAF8F4] border-y border-stone-200/70">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 mb-4">
              <Calculator className="h-3.5 w-3.5" /> Simulateur de Budget
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-[#0B1F44]">
              Estimez votre projet{" "}
              <span className="text-amber-600">en 30 secondes</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Obtenez une première fourchette budgétaire indicative en Dirhams
              (DH) adaptée au marché de Tanger, avant votre visite technique
              gratuite.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="grid gap-8 lg:grid-cols-12 rounded-3xl bg-white border border-stone-200/80 p-6 md:p-10 shadow-xl">
            {/* Controls */}
            <div className="lg:col-span-7 space-y-7">
              {/* Step 1: Project type */}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                  1. Type de travaux
                </p>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {PROJECT_TYPES.map((opt) => {
                    const active = opt.id === selectedTypeId;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectType(opt)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                          active
                            ? "border-[#0B1F44] bg-[#0B1F44] text-white shadow-md"
                            : "border-gray-200 bg-gray-50/70 text-gray-700 hover:border-amber-400 hover:bg-amber-50/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Surface */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400">
                    2. Surface estimée
                  </p>
                  <span className="rounded-xl bg-amber-100 px-3 py-1 text-base font-black text-[#0B1F44] tabular-nums">
                    {area} {projectType.unitLabel}
                  </span>
                </div>
                <input
                  type="range"
                  min={projectType.minArea}
                  max={projectType.maxArea}
                  step={projectType.maxArea > 100 ? 5 : 1}
                  aria-label="Surface en mètres carrés"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="mt-1 flex justify-between text-[11px] font-medium text-gray-400">
                  <span>
                    {projectType.minArea} {projectType.unitLabel}
                  </span>
                  <span>
                    {projectType.maxArea} {projectType.unitLabel}
                  </span>
                </div>
              </div>

              {/* Step 3: Finish Level */}
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                  3. Niveau de finition
                </p>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {FINISH_TIERS.map((t) => {
                    const active = t.id === tierId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTierId(t.id)}
                        className={`rounded-xl border p-3.5 text-left transition ${
                          active
                            ? "border-amber-500 bg-amber-50 ring-2 ring-amber-200"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <p className="text-sm font-extrabold text-[#0B1F44]">
                          {t.label}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500 leading-snug">
                          {t.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Result Card */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-[#0B1F44] p-6 md:p-8 text-white">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-yellow-400">
                  <Sparkles className="h-3.5 w-3.5" /> Estimation Indicative
                </span>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-white/60">
                  Budget estimé ({projectType.label})
                </p>
                <p className="mt-2 text-3xl sm:text-4xl font-black text-yellow-400 tabular-nums leading-tight">
                  {minEstimate.toLocaleString("fr-MA")} –{" "}
                  {maxEstimate.toLocaleString("fr-MA")} DH
                </p>

                <div className="mt-5 space-y-2.5 border-t border-white/10 pt-5 text-xs text-white/75">
                  <div className="flex justify-between">
                    <span>Surface</span>
                    <strong className="text-white">
                      {area} {projectType.unitLabel}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Gamme de finition</span>
                    <strong className="text-white">{tier.label}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-yellow-400" /> Délai
                      moyen
                    </span>
                    <strong className="text-white">
                      {projectType.weeksRange}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-2.5">
                <Link
                  href={contactHref}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-3.5 text-sm font-black text-gray-950 shadow-lg hover:bg-yellow-400 transition active:scale-95"
                >
                  Recevoir un Devis Précis
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={whatsappLink(
                    `Bonjour TANKECH,\n${summaryText}\nJe souhaite planifier une visite technique gratuite.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-bold text-white hover:bg-green-600 transition"
                >
                  <MessageCircle className="h-4 w-4" /> Envoyer sur WhatsApp
                </a>
                <p className="text-center text-[11px] text-white/45 pt-1">
                  Estimation non contractuelle — visite &amp; devis définitif
                  100% gratuits à Tanger.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
