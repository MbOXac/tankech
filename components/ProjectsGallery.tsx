"use client";

import { useState } from "react";
import { projectsData, Project } from "@/data/projectsData";
import ScrollReveal from "./ScrollReveal";
import { Eye, MapPin, ArrowRightLeft } from "lucide-react";

export default function ProjectsGallery() {
  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <section id="projets" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-yellow-100 px-4 py-1.5 text-sm font-semibold text-yellow-800 mb-4">
              Nos Réalisations
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">
              Avant & <span className="text-yellow-500">Après</span>
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Découvrez la transformation de nos projets — du chantier à la
              livraison, chaque détail compte.
            </p>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projectsData.map((project, i) => (
            <ScrollReveal key={project.id} delay={i * 100}>
              <div
                onClick={() => setSelected(project)}
                className="group cursor-pointer overflow-hidden rounded-2xl bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Image comparison */}
                <div className="relative h-64 overflow-hidden">
                  {/* After image (default) */}
                  <img
                    src={project.afterImage}
                    alt={`${project.title} — Après`}
                    className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Before image (on hover) */}
                  <img
                    src={project.beforeImage}
                    alt={`${project.title} — Avant`}
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Gradient fallback */}
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-800/40 to-gray-800/40 -z-10" />

                  {/* Hover label */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                      <ArrowRightLeft className="h-4 w-4" /> Avant / Après
                    </span>
                  </div>

                  {/* Category badge */}
                  <span className="absolute top-3 left-3 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 backdrop-blur-sm">
                    {project.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900">
                    {project.title}
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" /> {project.location}
                  </p>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {project.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Fullscreen project modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              <div className="h-64 md:h-auto bg-gray-200">
                <img
                  src={selected.afterImage}
                  alt={selected.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <span className="inline-block w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 mb-3">
                  {selected.category}
                </span>
                <h3 className="text-2xl font-bold text-gray-900">
                  {selected.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /> {selected.location}
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {selected.description}
                </p>
                <a
                  href="/contact"
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-yellow-500 px-6 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-400 transition"
                >
                  Demander un Devis Similaire
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
