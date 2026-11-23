"use client";

import { useState } from "react";
import { servicesData, type ServiceCategory } from "@/data/servicesData";
import {
  Plus,
  Trash2,
  Download,
  Wrench,
  X,
  Pencil,
  Save,
  Search,
  AlertTriangle,
} from "lucide-react";

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
  { value: "Layers", label: "Couches (Résine Époxy)" },
];

const BADGE_COLORS: { value: ServiceCategory["badgeColor"]; label: string }[] =
  [
    { value: "blue", label: "Bleu" },
    { value: "green", label: "Vert" },
    { value: "red", label: "Rouge (Urgence)" },
    { value: "purple", label: "Violet" },
    { value: "orange", label: "Orange" },
    { value: "yellow", label: "Jaune / Or" },
  ];

export default function AdminServices({
  services,
  authFetch,
  onRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [newCat, setNewCat] = useState({
    title: "",
    badge: "Service Pro",
    badgeColor: "blue" as ServiceCategory["badgeColor"],
    icon: "Wrench",
    coverImage: "/og-image.jpg",
    shortDescription: "",
    initialServicesText: "",
    emergency: false,
  });
  const [creating, setCreating] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Per-category draft for adding a sub-service
  const [subDrafts, setSubDrafts] = useState<
    Record<string, { name: string; description: string }>
  >({});

  // Inline category editing
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    title: string;
    badge: string;
    badgeColor: ServiceCategory["badgeColor"];
    icon: string;
    coverImage: string;
    shortDescription: string;
    emergency: boolean;
  } | null>(null);

  const existingSlugs = new Set(services.map((s) => s.slug));
  const missingDefaults = servicesData.filter(
    (d) => !existingSlugs.has(d.slug)
  );

  const syncMissingDefaults = async () => {
    setSyncing(true);
    try {
      const res = await authFetch("/api/admin/services", {
        method: "POST",
        body: JSON.stringify({ seedDefaults: true }),
      });
      if (res.ok) await onRefresh();
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const initialServices = newCat.initialServicesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, idx) => {
          const [name, ...rest] = line.split("—");
          return {
            id: `srv-${Date.now()}-${idx}`,
            name: name.trim(),
            description: rest.join("—").trim(),
          };
        });

      const res = await authFetch("/api/admin/services", {
        method: "POST",
        body: JSON.stringify({
          title: newCat.title,
          badge: newCat.badge,
          badgeColor: newCat.badgeColor,
          icon: newCat.icon,
          coverImage: newCat.coverImage,
          shortDescription: newCat.shortDescription,
          longDescription: newCat.shortDescription,
          emergency: newCat.emergency,
          services: initialServices,
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
          initialServicesText: "",
          emergency: false,
        });
        await onRefresh();
      }
    } finally {
      setCreating(false);
    }
  };

  const startEditing = (cat: ServiceCategory) => {
    setEditingSlug(cat.slug);
    setEditDraft({
      title: cat.title,
      badge: cat.badge,
      badgeColor: cat.badgeColor,
      icon: cat.icon,
      coverImage: cat.coverImage,
      shortDescription: cat.shortDescription,
      emergency: Boolean(cat.emergency),
    });
  };

  const saveCategoryEdit = async (slug: string) => {
    if (!editDraft) return;
    const res = await authFetch(`/api/admin/services/${slug}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...editDraft,
        longDescription: editDraft.shortDescription,
      }),
    });
    if (res.ok) {
      setEditingSlug(null);
      setEditDraft(null);
      await onRefresh();
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

  const handleRemoveSubService = async (
    cat: ServiceCategory,
    subId: string
  ) => {
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

  const totalSubServices = services.reduce(
    (sum, cat) => sum + cat.services.length,
    0
  );

  const filteredServices = services.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cat.title.toLowerCase().includes(q) ||
      cat.shortDescription.toLowerCase().includes(q) ||
      cat.services.some(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      )
    );
  });

  return (
    <div className="space-y-6">
      {/* Top summary & sync bar */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-bold text-yellow-400">
              {services.length} catégories
            </span>
            <span className="rounded-xl bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-xs font-bold text-yellow-900">
              {totalSubServices} prestations
            </span>
          </div>
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un service ou une prestation (ex: époxy, plomberie, piscine…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-9 pr-3 py-2 text-sm focus:border-yellow-400 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {missingDefaults.length > 0 && (
          <button
            type="button"
            disabled={syncing}
            onClick={syncMissingDefaults}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-xs font-bold text-gray-900 shadow-sm hover:bg-yellow-400 transition shrink-0 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {syncing
              ? "Synchronisation…"
              : `Ajouter ${missingDefaults.map((m) => m.title).join(", ")}`}
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create new category */}
        <form
          onSubmit={handleCreateCategory}
          className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-3.5 h-fit"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Plus className="h-5 w-5 text-yellow-500" /> Ajouter un Service
          </h3>
          <p className="text-xs text-gray-400">
            Ajoutez une nouvelle catégorie qui apparaîtra automatiquement sur le
            site public et dans le formulaire de devis.
          </p>
          <input
            required
            type="text"
            placeholder="Nom du service (ex: Climatisation & Froid) *"
            value={newCat.title}
            onChange={(e) => setNewCat({ ...newCat, title: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Badge (ex: Garantie Décennale, Urgence 24/7)"
            value={newCat.badge}
            onChange={(e) => setNewCat({ ...newCat, badge: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
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
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
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
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
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
            onChange={(e) =>
              setNewCat({ ...newCat, coverImage: e.target.value })
            }
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
          />
          <textarea
            rows={2}
            placeholder="Description courte affichée sur le site…"
            value={newCat.shortDescription}
            onChange={(e) =>
              setNewCat({ ...newCat, shortDescription: e.target.value })
            }
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none focus:border-yellow-400 focus:outline-none"
          />
          <textarea
            rows={3}
            placeholder={
              "Prestations incluses (1 par ligne, optionnel)\nEx: Installation clim — Split et gainable\nEntretien annuel — Recharge gaz et nettoyage"
            }
            value={newCat.initialServicesText}
            onChange={(e) =>
              setNewCat({ ...newCat, initialServicesText: e.target.value })
            }
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-xs resize-none focus:border-yellow-400 focus:outline-none"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
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
            className="w-full rounded-xl bg-yellow-500 py-3 text-sm font-bold text-gray-900 shadow hover:bg-yellow-400 transition disabled:opacity-50"
          >
            {creating ? "Création…" : "Créer le service"}
          </button>
        </form>

        {/* Services list */}
        <div className="lg:col-span-2 space-y-4">
          {filteredServices.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
              <Wrench className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="text-sm text-gray-600 font-semibold">
                Aucun service trouvé
              </p>
              {services.length === 0 && (
                <button
                  type="button"
                  onClick={syncMissingDefaults}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition"
                >
                  <Download className="h-4 w-4" /> Importer tous les services
                  TANKECH
                </button>
              )}
            </div>
          ) : (
            filteredServices.map((cat) => {
              const draft = subDrafts[cat.slug] ?? {
                name: "",
                description: "",
              };
              const isEditing = editingSlug === cat.slug && editDraft;

              return (
                <div
                  key={cat.slug}
                  className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm space-y-4"
                >
                  {isEditing ? (
                    <div className="space-y-3 rounded-xl border border-yellow-200 bg-yellow-50/40 p-4">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          value={editDraft.title}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              title: e.target.value,
                            })
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-bold"
                        />
                        <input
                          type="text"
                          value={editDraft.badge}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              badge: e.target.value,
                            })
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        />
                        <select
                          value={editDraft.badgeColor}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              badgeColor: e.target
                                .value as ServiceCategory["badgeColor"],
                            })
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                        >
                          {BADGE_COLORS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editDraft.icon}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              icon: e.target.value,
                            })
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
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
                        value={editDraft.coverImage}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft,
                            coverImage: e.target.value,
                          })
                        }
                        placeholder="Image de couverture"
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs"
                      />
                      <textarea
                        rows={2}
                        value={editDraft.shortDescription}
                        onChange={(e) =>
                          setEditDraft({
                            ...editDraft,
                            shortDescription: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={editDraft.emergency}
                            onChange={(e) =>
                              setEditDraft({
                                ...editDraft,
                                emergency: e.target.checked,
                              })
                            }
                          />
                          Urgence 24/7
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSlug(null);
                              setEditDraft(null);
                            }}
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
                          >
                            Annuler
                          </button>
                          <button
                            type="button"
                            onClick={() => saveCategoryEdit(cat.slug)}
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-yellow-500 hover:text-gray-900"
                          >
                            <Save className="h-3.5 w-3.5" /> Enregistrer
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-lg font-extrabold text-gray-900">
                            {cat.title}
                          </h4>
                          <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                            {cat.badge}
                          </span>
                          {cat.emergency && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                              <AlertTriangle className="h-3 w-3" /> 24/7
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {cat.services.length} prestation
                            {cat.services.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {cat.shortDescription}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditing(cat)}
                          aria-label={`Modifier ${cat.title}`}
                          title="Modifier cette catégorie"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-yellow-50 hover:text-yellow-700 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          aria-label={`Supprimer ${cat.title}`}
                          title="Supprimer cette catégorie"
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

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
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-yellow-400 focus:outline-none"
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
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-yellow-400 focus:outline-none"
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
    </div>
  );
}
