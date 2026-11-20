"use client";

import { useState } from "react";
import type { ServiceCategory } from "@/data/servicesData";
import { Plus, Trash2, Download, Wrench, X } from "lucide-react";

interface Props {
  services: ServiceCategory[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => Promise<void>;
}

const ICON_OPTIONS = [
  { value: "Building2", label: "Bâtiment (Gros Œuvre)" },
  { value: "Home", label: "Maison (Rénovation)" },
  { value: "Droplets", label: "Eau (Plomberie)" },
  { value: "Zap", label: "Éclair (Électricité)" },
  { value: "Paintbrush", label: "Pinceau (Peinture)" },
  { value: "Wrench", label: "Clé (Bricolage / Maintenance)" },
];

const BADGE_COLORS: { value: ServiceCategory["badgeColor"]; label: string }[] = [
  { value: "blue", label: "Bleu" },
  { value: "green", label: "Vert" },
  { value: "red", label: "Rouge (Urgence)" },
  { value: "purple", label: "Violet" },
  { value: "orange", label: "Orange" },
  { value: "yellow", label: "Jaune" },
];

export default function AdminServices({
  services,
  authFetch,
  onRefresh,
}: Props) {
  const [newCat, setNewCat] = useState({
    title: "",
    badge: "Service Pro",
    badgeColor: "blue" as ServiceCategory["badgeColor"],
    icon: "Wrench",
    coverImage: "/og-image.jpg",
    shortDescription: "",
    emergency: false,
  });
  const [creating, setCreating] = useState(false);

  // Per-category draft for adding a sub-service
  const [subDrafts, setSubDrafts] = useState<
    Record<string, { name: string; description: string }>
  >({});

  const seedDefaults = async () => {
    const res = await authFetch("/api/admin/services", {
      method: "POST",
      body: JSON.stringify({ seedDefaults: true }),
    });
    if (res.ok) await onRefresh();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await authFetch("/api/admin/services", {
        method: "POST",
        body: JSON.stringify({
          ...newCat,
          longDescription: newCat.shortDescription,
          services: [],
        }),
      });
      if (res.ok) {
        setNewCat({
          title: "",
          badge: "Service Pro",
          badgeColor: "blue",
          icon: "Wrench",
          coverImage: "/og-image.jpg",
          shortDescription: "",
          emergency: false,
        });
        await onRefresh();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleAddSubService = async (cat: ServiceCategory) => {
    const draft = subDrafts[cat.slug];
    if (!draft?.name?.trim()) return;

    const updated = [
      ...cat.services,
      {
        id: `srv-${Date.now()}`,
        name: draft.name.trim(),
        description: draft.description.trim(),
      },
    ];

    const res = await authFetch(`/api/admin/services/${cat.slug}`, {
      method: "PATCH",
      body: JSON.stringify({ services: updated }),
    });
    if (res.ok) {
      setSubDrafts((prev) => ({
        ...prev,
        [cat.slug]: { name: "", description: "" },
      }));
      await onRefresh();
    }
  };

  const handleRemoveSubService = async (cat: ServiceCategory, subId: string) => {
    const updated = cat.services.filter((s) => s.id !== subId);
    const res = await authFetch(`/api/admin/services/${cat.slug}`, {
      method: "PATCH",
      body: JSON.stringify({ services: updated }),
    });
    if (res.ok) await onRefresh();
  };

  const handleDeleteCategory = async (cat: ServiceCategory) => {
    if (!window.confirm(`Supprimer la catégorie « ${cat.title} » ?`)) return;
    await authFetch(`/api/admin/services/${cat.slug}`, { method: "DELETE" });
    await onRefresh();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Create new category */}
      <form
        onSubmit={handleCreateCategory}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-3.5 h-fit"
      >
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Plus className="h-5 w-5 text-yellow-500" /> Nouvelle Catégorie
        </h3>
        <input
          required
          type="text"
          placeholder="Nom du service (ex: Climatisation & Froid) *"
          value={newCat.title}
          onChange={(e) => setNewCat({ ...newCat, title: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        />
        <input
          type="text"
          placeholder="Badge (ex: Garantie Décennale, Urgence 24/7)"
          value={newCat.badge}
          onChange={(e) => setNewCat({ ...newCat, badge: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={newCat.badgeColor}
            onChange={(e) =>
              setNewCat({
                ...newCat,
                badgeColor: e.target.value as ServiceCategory["badgeColor"],
              })
            }
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          >
            {BADGE_COLORS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={newCat.icon}
            onChange={(e) => setNewCat({ ...newCat, icon: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          >
            {ICON_OPTIONS.map((ic) => (
              <option key={ic.value} value={ic.value}>
                {ic.label}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Image de couverture (ex: /services/renovation.jpg)"
          value={newCat.coverImage}
          onChange={(e) => setNewCat({ ...newCat, coverImage: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        />
        <textarea
          rows={3}
          placeholder="Description courte affichée sur le site…"
          value={newCat.shortDescription}
          onChange={(e) =>
            setNewCat({ ...newCat, shortDescription: e.target.value })
          }
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none"
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={newCat.emergency}
            onChange={(e) =>
              setNewCat({ ...newCat, emergency: e.target.checked })
            }
          />
          Service d&apos;urgence 24/7
        </label>
        <button
          type="submit"
          disabled={creating}
          className="w-full rounded-xl bg-yellow-500 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {creating ? "Création…" : "Ajouter la catégorie"}
        </button>
      </form>

      {/* Services list */}
      <div className="lg:col-span-2 space-y-4">
        {services.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
            <Wrench className="mx-auto h-10 w-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-600 font-semibold">
              Aucun service dans Firestore pour le moment
            </p>
            <p className="text-xs text-gray-400 mt-1 mb-5">
              Le site public affiche actuellement vos 6 catégories par défaut.
              Importez-les en 1 clic pour pouvoir les modifier ou ajouter de
              nouvelles prestations ici.
            </p>
            <button
              type="button"
              onClick={seedDefaults}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition"
            >
              <Download className="h-4 w-4" /> Importer les 6 catégories par
              défaut
            </button>
          </div>
        ) : (
          services.map((cat) => {
            const draft = subDrafts[cat.slug] ?? { name: "", description: "" };
            return (
              <div
                key={cat.slug}
                className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-bold text-gray-900">
                        {cat.title}
                      </h4>
                      <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                        {cat.badge}
                      </span>
                      <span className="text-xs text-gray-400">
                        {cat.services.length} prestation
                        {cat.services.length > 1 ? "s" : ""}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {cat.shortDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat)}
                    aria-label={`Supprimer ${cat.title}`}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Existing sub-services */}
                <div className="grid gap-2 sm:grid-cols-2">
                  {cat.services.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-start justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/70 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800">
                          {sub.name}
                        </p>
                        {sub.description && (
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {sub.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubService(cat, sub.id)}
                        aria-label={`Retirer ${sub.name}`}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 shrink-0"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add sub-service inline */}
                <div className="flex flex-col sm:flex-row gap-2 border-t border-gray-100 pt-3">
                  <input
                    type="text"
                    placeholder="Nouvelle prestation (ex: Isolation acoustique)"
                    value={draft.name}
                    onChange={(e) =>
                      setSubDrafts((prev) => ({
                        ...prev,
                        [cat.slug]: { ...draft, name: e.target.value },
                      }))
                    }
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Courte description"
                    value={draft.description}
                    onChange={(e) =>
                      setSubDrafts((prev) => ({
                        ...prev,
                        [cat.slug]: { ...draft, description: e.target.value },
                      }))
                    }
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSubService(cat)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-gray-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-yellow-500 hover:text-gray-900 transition shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" /> Ajouter
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
