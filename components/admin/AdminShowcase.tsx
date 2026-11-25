"use client";

import { useState } from "react";
import type { Project } from "@/data/projectsData";
import type { Testimonial } from "@/data/testimonialsData";
import type { ServiceCategory } from "@/data/servicesData";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  Plus,
  Trash2,
  Download,
  Star,
  FolderKanban,
  MessageSquareQuote,
} from "lucide-react";

interface Props {
  projects: Project[];
  testimonials: Testimonial[];
  services: ServiceCategory[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => Promise<void>;
}

export default function AdminShowcase({
  projects,
  testimonials,
  services,
  authFetch,
  onRefresh,
}: Props) {
  const [subTab, setSubTab] = useState<"projects" | "testimonials">("projects");

  const [newProject, setNewProject] = useState({
    title: "",
    categorySlug: services[0]?.slug ?? "gros-oeuvre",
    location: "Tanger",
    description: "",
    afterImage: "/og-image.jpg",
    beforeImage: "",
    featured: true,
  });

  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "Propriétaire",
    location: "Tanger",
    service: services[0]?.title ?? "Gros Œuvre",
    rating: 5,
    text: "",
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = services.find((s) => s.slug === newProject.categorySlug);
    const res = await authFetch("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify({
        ...newProject,
        category: cat?.title ?? "Rénovation",
      }),
    });
    if (res.ok) {
      setNewProject({
        title: "",
        categorySlug: services[0]?.slug ?? "gros-oeuvre",
        location: "Tanger",
        description: "",
        afterImage: "/og-image.jpg",
        beforeImage: "",
        featured: true,
      });
      await onRefresh();
    }
  };

  const seedDefaultProjects = async () => {
    const res = await authFetch("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify({ seedDefaults: true }),
    });
    if (res.ok) await onRefresh();
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm("Supprimer ce projet du portfolio public ?")) return;
    await authFetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    await onRefresh();
  };

  const handleCreateTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await authFetch("/api/admin/testimonials", {
      method: "POST",
      body: JSON.stringify(newTestimonial),
    });
    if (res.ok) {
      setNewTestimonial({
        name: "",
        role: "Propriétaire",
        location: "Tanger",
        service: services[0]?.title ?? "Gros Œuvre",
        rating: 5,
        text: "",
      });
      await onRefresh();
    }
  };

  const seedDefaultTestimonials = async () => {
    const res = await authFetch("/api/admin/testimonials", {
      method: "POST",
      body: JSON.stringify({ seedDefaults: true }),
    });
    if (res.ok) await onRefresh();
  };

  const deleteTestimonial = async (id: string) => {
    if (!window.confirm("Supprimer ce témoignage ?")) return;
    await authFetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSubTab("projects")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            subTab === "projects"
              ? "bg-yellow-500 text-gray-900 shadow"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <FolderKanban className="h-4 w-4" /> Portfolio Projets (
          {projects.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab("testimonials")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            subTab === "testimonials"
              ? "bg-yellow-500 text-gray-900 shadow"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <MessageSquareQuote className="h-4 w-4" /> Témoignages (
          {testimonials.length})
        </button>
      </div>

      {subTab === "projects" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleCreateProject}
            className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-3.5 h-fit"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-yellow-500" /> Ajouter au Portfolio
            </h3>
            <input
              required
              type="text"
              placeholder="Titre du projet *"
              value={newProject.title}
              onChange={(e) =>
                setNewProject({ ...newProject, title: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <select
              value={newProject.categorySlug}
              onChange={(e) =>
                setNewProject({ ...newProject, categorySlug: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            >
              {services.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.title}
                </option>
              ))}
            </select>
            <input
              required
              type="text"
              placeholder="Localisation (ex: Tanger, Malabata) *"
              value={newProject.location}
              onChange={(e) =>
                setNewProject({ ...newProject, location: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <ImageUploader
              label="Photo Après (résultat final) *"
              value={newProject.afterImage}
              onChange={(url) =>
                setNewProject({ ...newProject, afterImage: url })
              }
              folder="tankech/projects"
              authFetch={authFetch}
              placeholder="/services/renovation.jpg"
              compact
            />
            <ImageUploader
              label="Photo Avant (active le slider Avant/Après)"
              value={newProject.beforeImage}
              onChange={(url) =>
                setNewProject({ ...newProject, beforeImage: url })
              }
              folder="tankech/projects"
              authFetch={authFetch}
              placeholder="Optionnel — ajoutez pour comparer Avant/Après"
              compact
            />
            <textarea
              rows={3}
              placeholder="Description du chantier…"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none"
            />
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={newProject.featured}
                onChange={(e) =>
                  setNewProject({ ...newProject, featured: e.target.checked })
                }
              />
              Mettre en avant sur l&apos;accueil
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-yellow-500 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-400 transition"
            >
              Publier le projet
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {projects.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Aucun projet dans Firestore (le site affiche les 6 projets par
                  défaut).
                </p>
                <button
                  type="button"
                  onClick={seedDefaultProjects}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition"
                >
                  <Download className="h-4 w-4" /> Importer les 6 projets par
                  défaut
                </button>
              </div>
            ) : (
              projects.map((p) => (
                <div
                  key={p.id}
                  className="flex items-start justify-between gap-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{p.title}</h4>
                      <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{p.location}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {p.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteProject(p.id)}
                    aria-label={`Supprimer ${p.title}`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {subTab === "testimonials" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleCreateTestimonial}
            className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-3.5 h-fit"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-yellow-500" /> Ajouter un Témoignage
            </h3>
            <input
              required
              type="text"
              placeholder="Nom du client (ex: Mohammed B.) *"
              value={newTestimonial.name}
              onChange={(e) =>
                setNewTestimonial({ ...newTestimonial, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <input
              type="text"
              placeholder="Rôle (ex: Propriétaire Villa)"
              value={newTestimonial.role}
              onChange={(e) =>
                setNewTestimonial({ ...newTestimonial, role: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <input
              type="text"
              placeholder="Localisation (ex: Malabata, Tanger)"
              value={newTestimonial.location}
              onChange={(e) =>
                setNewTestimonial({
                  ...newTestimonial,
                  location: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <select
              value={newTestimonial.service}
              onChange={(e) =>
                setNewTestimonial({
                  ...newTestimonial,
                  service: e.target.value,
                })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            >
              {services.map((s) => (
                <option key={s.slug} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-1.5">
              <span className="text-sm text-gray-600 mr-1">Note :</span>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} étoiles`}
                  onClick={() =>
                    setNewTestimonial({ ...newTestimonial, rating: n })
                  }
                  className="p-1"
                >
                  <Star
                    className={`h-5 w-5 ${
                      n <= newTestimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              required
              rows={4}
              placeholder="Avis du client *"
              value={newTestimonial.text}
              onChange={(e) =>
                setNewTestimonial({ ...newTestimonial, text: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-yellow-500 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-400 transition"
            >
              Publier le témoignage
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {testimonials.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Aucun témoignage dans Firestore (le site affiche les 6 avis
                  par défaut).
                </p>
                <button
                  type="button"
                  onClick={seedDefaultTestimonials}
                  className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition"
                >
                  <Download className="h-4 w-4" /> Importer les 6 témoignages
                  par défaut
                </button>
              </div>
            ) : (
              testimonials.map((t) => (
                <div
                  key={t.id}
                  className="flex items-start justify-between gap-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900">{t.name}</h4>
                      <span className="text-xs text-gray-400">
                        {t.role} — {t.location}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-yellow-600 mt-1">
                      {t.service} • {t.rating}/5 ★
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      &ldquo;{t.text}&rdquo;
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteTestimonial(t.id)}
                    aria-label={`Supprimer l'avis de ${t.name}`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
