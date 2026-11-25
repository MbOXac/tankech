"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { projectsData, Project } from "@/data/projectsData";
import ScrollReveal from "./ScrollReveal";
import FallbackImage from "./FallbackImage";
import BeforeAfterSlider from "./BeforeAfterSlider";
import { MapPin, ArrowRightLeft, Eye, X } from "lucide-react";

interface ProjectsGalleryProps {
  projects?: Project[];
}

export default function ProjectsGallery({
  projects = projectsData,
}: ProjectsGalleryProps) {
  const [selected, setSelected] = useState<Project | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

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
              Nos <span className="text-yellow-500">Projets</span> Récents
            </h2>
            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
              Découvrez la transformation de nos projets — du chantier à la
              livraison, chaque détail compte.
            </p>
          </div>
        </ScrollReveal>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => {
            const hasBeforeAfter = Boolean(
              project.beforeImage && project.beforeImage !== project.afterImage
            );

            return (
              <ScrollReveal key={project.id} delay={i * 100}>
                <div className="group overflow-hidden rounded-2xl bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                  {/* Image or Interactive Before/After Slider */}
                  {hasBeforeAfter && project.beforeImage ? (
                    <div className="relative">
                      <BeforeAfterSlider
                        beforeSrc={project.beforeImage}
                        afterSrc={project.afterImage}
                        alt={project.title}
                        className="h-64 w-full"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <span className="pointer-events-none absolute bottom-3 left-3 z-20 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 backdrop-blur-sm shadow-sm">
                        {project.category}
                      </span>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelected(project)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelected(project);
                        }
                      }}
                      className="relative isolate h-64 overflow-hidden bg-gradient-to-br from-gray-800 to-yellow-900/60 cursor-pointer focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    >
                      <FallbackImage
                        src={project.afterImage}
                        alt={project.title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/0 group-hover:bg-black/25 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <span className="flex items-center gap-2 rounded-lg bg-black/70 px-4 py-2 text-sm font-bold text-white backdrop-blur-sm">
                          <Eye className="h-4 w-4" /> Voir le projet
                        </span>
                      </div>
                      <span className="absolute top-3 left-3 z-10 rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 backdrop-blur-sm">
                        {project.category}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(project)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(project);
                      }
                    }}
                    className="p-5 flex-1 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-yellow-700 transition-colors">
                        {project.title}
                      </h3>
                      {hasBeforeAfter && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-bold text-yellow-800 shrink-0">
                          <ArrowRightLeft className="h-3 w-3" /> Avant/Après
                        </span>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3.5 w-3.5" /> {project.location}
                    </p>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>

      {/* Fullscreen project modal */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-4xl rounded-2xl bg-white overflow-hidden shadow-2xl modal-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Fermer"
              className="absolute top-3 right-3 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white hover:text-gray-900 transition"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="grid md:grid-cols-2">
              {selected.beforeImage &&
              selected.beforeImage !== selected.afterImage ? (
                <BeforeAfterSlider
                  beforeSrc={selected.beforeImage}
                  afterSrc={selected.afterImage}
                  alt={selected.title}
                  className="h-72 md:h-full md:min-h-[360px]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="relative h-64 md:h-auto md:min-h-[340px] bg-gradient-to-br from-gray-800 to-yellow-900/60">
                  <FallbackImage
                    src={selected.afterImage}
                    alt={selected.title}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-6 md:p-8 flex flex-col justify-center">
                <span className="inline-block w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 mb-3">
                  {selected.category}
                </span>
                <h3
                  id="project-modal-title"
                  className="text-2xl font-bold text-gray-900"
                >
                  {selected.title}
                </h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /> {selected.location}
                </p>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {selected.description}
                </p>
                <Link
                  href="/contact"
                  onClick={() => setSelected(null)}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-yellow-500 px-6 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-400 transition"
                >
                  Demander un Devis Similaire
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
