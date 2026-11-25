"use client";

import { useState } from "react";
import {
  CHANTIER_STATUS_LABELS,
  type ChantierPhoto,
  type ChantierRecord,
  type ChantierStatus,
  type WorkerRecord,
} from "@/lib/types";
import type { ServiceCategory } from "@/data/servicesData";
import { telLinkForPhone, whatsappLinkForPhone } from "@/data/siteConfig";
import ImageUploader from "@/components/admin/ImageUploader";
import {
  Plus,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Trash2,
  Users,
  AlertTriangle,
  HardHat,
  Save,
  X,
  Camera,
  Link2,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const PHOTO_STAGES = [
  "Début / État initial",
  "Fondations / Gros œuvre",
  "Second œuvre",
  "Finitions",
  "Livraison finale",
] as const;

interface Props {
  chantiers: ChantierRecord[];
  workers: WorkerRecord[];
  services: ServiceCategory[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => Promise<void>;
}

const STATUS_BADGE: Record<ChantierStatus, string> = {
  planifie: "bg-blue-100 text-blue-700 border-blue-200",
  en_cours: "bg-yellow-100 text-yellow-800 border-yellow-200",
  en_pause: "bg-orange-100 text-orange-700 border-orange-200",
  termine: "bg-green-100 text-green-700 border-green-200",
  annule: "bg-gray-100 text-gray-500 border-gray-200",
};

const emptyForm = {
  name: "",
  clientName: "",
  clientPhone: "",
  location: "Tanger",
  category: "Gros Œuvre",
  status: "en_cours" as ChantierStatus,
  progress: 0,
  budget: "",
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
  notes: "",
};

export default function AdminChantiers({
  chantiers,
  workers,
  services,
  authFetch,
  onRefresh,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedWorkersId, setExpandedWorkersId] = useState<string | null>(
    null
  );
  const [expandedPhotosId, setExpandedPhotosId] = useState<string | null>(null);
  const [photoDrafts, setPhotoDrafts] = useState<
    Record<string, { url: string; stage: string; caption: string }>
  >({});
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authFetch("/api/admin/chantiers", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget) || 0,
          progress: Number(form.progress) || 0,
        }),
      });
      if (res.ok) {
        setForm(emptyForm);
        setShowForm(false);
        await onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const updateChantier = async (
    id: string,
    updates: Partial<ChantierRecord>
  ) => {
    await authFetch(`/api/admin/chantiers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
    await onRefresh();
  };

  const deleteChantier = async (id: string) => {
    if (!window.confirm("Supprimer définitivement ce chantier ?")) return;
    await authFetch(`/api/admin/chantiers/${id}`, { method: "DELETE" });
    await onRefresh();
  };

  const toggleWorkerAssignment = async (
    chantier: ChantierRecord,
    workerId: string
  ) => {
    const exists = chantier.assignedWorkerIds.includes(workerId);
    const nextIds = exists
      ? chantier.assignedWorkerIds.filter((w) => w !== workerId)
      : [...chantier.assignedWorkerIds, workerId];
    await updateChantier(chantier.id, { assignedWorkerIds: nextIds });
  };

  const addChantierPhoto = async (chantier: ChantierRecord) => {
    const draft = photoDrafts[chantier.id];
    if (!draft?.url?.trim()) return;
    const nextPhoto: ChantierPhoto = {
      id: `photo-${Date.now()}`,
      url: draft.url.trim(),
      stage: draft.stage || PHOTO_STAGES[0],
      caption: draft.caption.trim(),
      date: new Date().toISOString().slice(0, 10),
    };
    const nextPhotos = [...(chantier.photos ?? []), nextPhoto];
    await updateChantier(chantier.id, { photos: nextPhotos });
    setPhotoDrafts((prev) => ({
      ...prev,
      [chantier.id]: { url: "", stage: PHOTO_STAGES[0], caption: "" },
    }));
  };

  const removeChantierPhoto = async (
    chantier: ChantierRecord,
    photoId: string
  ) => {
    const nextPhotos = (chantier.photos ?? []).filter((p) => p.id !== photoId);
    await updateChantier(chantier.id, { photos: nextPhotos });
  };

  const toggleTracking = async (chantier: ChantierRecord) => {
    await authFetch(`/api/admin/chantiers/${chantier.id}`, {
      method: "PATCH",
      body: JSON.stringify({ trackingEnabled: !chantier.trackingEnabled }),
    });
    await onRefresh();
  };

  const regenerateTracking = async (chantier: ChantierRecord) => {
    if (
      !window.confirm(
        "Générer un nouveau lien et un nouveau code PIN ? L'ancien lien cessera immédiatement de fonctionner."
      )
    ) {
      return;
    }
    await authFetch(`/api/admin/chantiers/${chantier.id}`, {
      method: "PATCH",
      body: JSON.stringify({ regenerateTracking: true }),
    });
    await onRefresh();
  };

  const getTrackingUrl = (code: string) => {
    if (typeof window === "undefined") return `/suivi/${code}`;
    return `${window.location.origin}/suivi/${code}`;
  };

  const copyTrackingAccess = async (chantier: ChantierRecord) => {
    if (!chantier.trackingCode) return;
    const url = getTrackingUrl(chantier.trackingCode);
    const text = `Suivi privé de votre chantier « ${chantier.name} » (TANKECH) :\nLien : ${url}\nCode PIN : ${chantier.trackingPin ?? ""}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(chantier.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = chantiers.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.clientName.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeWorkers = workers.filter((w) => w.active);

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Rechercher un chantier, client, quartier…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
          />
          <select
            aria-label="Filtrer par statut de chantier"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700"
          >
            <option value="all">Tous les statuts ({chantiers.length})</option>
            {(Object.keys(CHANTIER_STATUS_LABELS) as ChantierStatus[]).map(
              (st) => (
                <option key={st} value={st}>
                  {CHANTIER_STATUS_LABELS[st]}
                </option>
              )
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-gray-900 shadow hover:bg-yellow-400 transition"
        >
          {showForm ? (
            <>
              <X className="h-4 w-4" /> Fermer
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" /> Nouveau Chantier
            </>
          )}
        </button>
      </div>

      {/* Create Chantier Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-white border border-yellow-200 p-6 shadow-sm space-y-4"
        >
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <HardHat className="h-5 w-5 text-yellow-500" /> Créer un nouveau
            chantier
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <input
              required
              type="text"
              placeholder="Nom du chantier (ex: Villa Malabata) *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <input
              type="text"
              placeholder="Nom du client"
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <input
              type="tel"
              placeholder="Téléphone client"
              value={form.clientPhone}
              onChange={(e) =>
                setForm({ ...form, clientPhone: e.target.value })
              }
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <input
              type="text"
              placeholder="Localisation (ex: Tanger, Malabata)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            >
              {services.map((s) => (
                <option key={s.slug} value={s.title}>
                  {s.title}
                </option>
              ))}
            </select>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as ChantierStatus })
              }
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            >
              {(Object.keys(CHANTIER_STATUS_LABELS) as ChantierStatus[]).map(
                (st) => (
                  <option key={st} value={st}>
                    {CHANTIER_STATUS_LABELS[st]}
                  </option>
                )
              )}
            </select>
            <input
              type="number"
              min={0}
              placeholder="Budget prévu (DH)"
              value={form.budget}
              onChange={(e) => setForm({ ...form, budget: e.target.value })}
              className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 mb-1">
                Date de fin estimée
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <textarea
            rows={2}
            placeholder="Notes chantier (plans, accès, matériaux particuliers…)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-yellow-500 hover:text-gray-900 transition disabled:opacity-50"
            >
              {saving ? "Enregistrement…" : "Créer le chantier"}
            </button>
          </div>
        </form>
      )}

      {/* Chantiers List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-400">
          <HardHat className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p className="font-semibold text-gray-600">Aucun chantier trouvé</p>
          <p className="text-sm mt-1">
            Cliquez sur « Nouveau Chantier » pour démarrer le suivi d&apos;un
            projet.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filtered.map((c) => {
            const budgetPct =
              c.budget > 0 ? Math.min(100, Math.round((c.spent / c.budget) * 100)) : 0;
            const overBudget = c.budget > 0 && c.spent > c.budget;
            const assignedWorkers = workers.filter((w) =>
              c.assignedWorkerIds.includes(w.id)
            );
            const noteVal =
              noteDrafts[c.id] !== undefined ? noteDrafts[c.id] : c.notes;

            return (
              <div
                key={c.id}
                className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm flex flex-col gap-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {c.name}
                      </h3>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[c.status]}`}
                      >
                        {CHANTIER_STATUS_LABELS[c.status]}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {c.location}
                      </span>
                      <span>{c.category}</span>
                      {c.clientName && <span>Client : {c.clientName}</span>}
                      {c.clientPhone && (
                        <>
                          <a
                            href={telLinkForPhone(c.clientPhone)}
                            className="inline-flex items-center gap-1 text-yellow-700 font-semibold hover:underline"
                          >
                            <Phone className="h-3 w-3" /> {c.clientPhone}
                          </a>
                          <a
                            href={whatsappLinkForPhone(
                              c.clientPhone,
                              `Bonjour ${c.clientName || ""}, concernant votre chantier ${c.name} :`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`Contacter ${c.clientName || "le client"} sur WhatsApp`}
                            className="inline-flex items-center gap-1 text-emerald-600 font-semibold hover:underline"
                          >
                            <MessageCircle className="h-3 w-3" /> WhatsApp
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <select
                      aria-label={`Statut de ${c.name}`}
                      value={c.status}
                      onChange={(e) =>
                        updateChantier(c.id, {
                          status: e.target.value as ChantierStatus,
                        })
                      }
                      className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700"
                    >
                      {(
                        Object.keys(CHANTIER_STATUS_LABELS) as ChantierStatus[]
                      ).map((st) => (
                        <option key={st} value={st}>
                          {CHANTIER_STATUS_LABELS[st]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => deleteChantier(c.id)}
                      aria-label={`Supprimer ${c.name}`}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress slider */}
                <div className="rounded-xl bg-gray-50 p-3.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-gray-700 mb-2">
                    <span>Avancement des travaux</span>
                    <span className="text-yellow-700 font-bold">
                      {c.progress}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    aria-label={`Avancement de ${c.name}`}
                    value={c.progress}
                    onChange={(e) =>
                      updateChantier(c.id, { progress: Number(e.target.value) })
                    }
                    className="w-full accent-yellow-500 cursor-pointer"
                  />
                </div>

                {/* Budget vs Spent */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-gray-100 p-3">
                    <p className="text-gray-400 font-medium">Budget prévu</p>
                    <p className="mt-1 text-base font-black text-gray-900">
                      {c.budget.toLocaleString("fr-MA")} DH
                    </p>
                  </div>
                  <div
                    className={`rounded-xl border p-3 ${
                      overBudget
                        ? "border-red-200 bg-red-50/50"
                        : "border-gray-100"
                    }`}
                  >
                    <p className="text-gray-400 font-medium flex items-center gap-1">
                      Dépensé ({budgetPct}%)
                      {overBudget && (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      )}
                    </p>
                    <p
                      className={`mt-1 text-base font-black ${
                        overBudget ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {c.spent.toLocaleString("fr-MA")} DH
                    </p>
                  </div>
                </div>

                {/* Dates */}
                {(c.startDate || c.endDate) && (
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      Début : {c.startDate || "—"}
                    </span>
                    <span>Fin prévue : {c.endDate || "—"}</span>
                  </div>
                )}

                {/* Assigned workers */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-yellow-600" />
                      Équipe affectée ({assignedWorkers.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWorkersId(
                          expandedWorkersId === c.id ? null : c.id
                        )
                      }
                      className="text-xs font-semibold text-yellow-700 hover:underline"
                    >
                      {expandedWorkersId === c.id ? "Fermer" : "Affecter"}
                    </button>
                  </div>

                  {assignedWorkers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {assignedWorkers.map((w) => (
                        <span
                          key={w.id}
                          className="rounded-lg bg-yellow-50 border border-yellow-200 px-2 py-0.5 text-xs font-medium text-yellow-900"
                        >
                          {w.name} ({w.specialty})
                        </span>
                      ))}
                    </div>
                  )}

                  {expandedWorkersId === c.id && (
                    <div className="mt-3 rounded-xl bg-gray-50 p-3 space-y-1.5 max-h-40 overflow-y-auto">
                      {activeWorkers.length === 0 ? (
                        <p className="text-xs text-gray-400">
                          Ajoutez d&apos;abord des ouvriers dans l&apos;onglet
                          Ouvriers &amp; Pointage.
                        </p>
                      ) : (
                        activeWorkers.map((w) => (
                          <label
                            key={w.id}
                            className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={c.assignedWorkerIds.includes(w.id)}
                              onChange={() => toggleWorkerAssignment(c, w.id)}
                            />
                            <span className="font-semibold">{w.name}</span>
                            <span className="text-gray-400">
                              — {w.specialty}
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Photos du chantier */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                      <Camera className="h-3.5 w-3.5 text-yellow-600" />
                      Photos d&apos;avancement ({(c.photos ?? []).length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedPhotosId(
                          expandedPhotosId === c.id ? null : c.id
                        )
                      }
                      className="text-xs font-semibold text-yellow-700 hover:underline"
                    >
                      {expandedPhotosId === c.id ? "Fermer" : "Gérer les photos"}
                    </button>
                  </div>

                  {(c.photos ?? []).length > 0 && (
                    <div className="mt-2.5 grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {(c.photos ?? []).map((photo) => (
                        <div
                          key={photo.id}
                          className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-gray-200 bg-gray-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photo.url}
                            alt={photo.caption || photo.stage || c.name}
                            className="h-full w-full object-cover"
                          />
                          {photo.stage && (
                            <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              {photo.stage}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeChantierPhoto(c, photo.id)}
                            aria-label="Supprimer cette photo"
                            className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {expandedPhotosId === c.id && (
                    <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/80 p-3.5 space-y-3">
                      <ImageUploader
                        label="Ajouter une photo du chantier"
                        value={photoDrafts[c.id]?.url ?? ""}
                        onChange={(url) =>
                          setPhotoDrafts((prev) => ({
                            ...prev,
                            [c.id]: {
                              url,
                              stage: prev[c.id]?.stage || PHOTO_STAGES[0],
                              caption: prev[c.id]?.caption ?? "",
                            },
                          }))
                        }
                        folder="tankech/chantiers"
                        authFetch={authFetch}
                        compact
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <select
                          aria-label="Étape du chantier"
                          value={photoDrafts[c.id]?.stage ?? PHOTO_STAGES[0]}
                          onChange={(e) =>
                            setPhotoDrafts((prev) => ({
                              ...prev,
                              [c.id]: {
                                url: prev[c.id]?.url ?? "",
                                stage: e.target.value,
                                caption: prev[c.id]?.caption ?? "",
                              },
                            }))
                          }
                          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs"
                        >
                          {PHOTO_STAGES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Légende (optionnel)"
                          value={photoDrafts[c.id]?.caption ?? ""}
                          onChange={(e) =>
                            setPhotoDrafts((prev) => ({
                              ...prev,
                              [c.id]: {
                                url: prev[c.id]?.url ?? "",
                                stage: prev[c.id]?.stage || PHOTO_STAGES[0],
                                caption: e.target.value,
                              },
                            }))
                          }
                          className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        disabled={!photoDrafts[c.id]?.url?.trim()}
                        onClick={() => addChantierPhoto(c)}
                        className="w-full rounded-lg bg-gray-900 py-2 text-xs font-bold text-white hover:bg-yellow-500 hover:text-gray-900 transition disabled:opacity-40"
                      >
                        Enregistrer la photo dans le chantier
                      </button>
                    </div>
                  )}
                </div>

                {/* Suivi Client Privé (Lien + PIN 4 chiffres) */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                      Suivi Client Privé (Lien + PIN)
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTracking(c)}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition ${
                        c.trackingEnabled
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-600 hover:bg-yellow-100 hover:text-yellow-900"
                      }`}
                    >
                      {c.trackingEnabled ? "Activé (Désactiver)" : "Activer le lien"}
                    </button>
                  </div>

                  {c.trackingEnabled && c.trackingCode && (
                    <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-gray-700 truncate max-w-[230px]">
                          <Link2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          /suivi/{c.trackingCode}
                        </span>
                        <span className="rounded-lg bg-[#0B1F44] px-2.5 py-1 text-xs font-black tracking-widest text-yellow-400">
                          PIN : {c.trackingPin}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => copyTrackingAccess(c)}
                          className="inline-flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition"
                        >
                          {copiedId === c.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-600" />{" "}
                              Copié !
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copier lien + PIN
                            </>
                          )}
                        </button>
                        {c.clientPhone && (
                          <a
                            href={whatsappLinkForPhone(
                              c.clientPhone,
                              `Bonjour ${c.clientName || ""},\n\nVous pouvez suivre l'avancement et les photos de votre chantier « ${c.name} » en direct sur votre espace privé TANKECH :\n🔗 Lien : ${getTrackingUrl(c.trackingCode)}\n🔐 Code PIN : ${c.trackingPin}`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-green-600 transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" /> Envoyer
                            sur WhatsApp
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => regenerateTracking(c)}
                          title="Révoquer l'ancien lien et générer un nouveau code PIN"
                          className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition"
                        >
                          <RefreshCw className="h-3 w-3" /> Régénérer
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div className="flex gap-2 border-t border-gray-100 pt-3">
                  <input
                    type="text"
                    placeholder="Notes de suivi du chantier…"
                    value={noteVal}
                    onChange={(e) =>
                      setNoteDrafts((prev) => ({
                        ...prev,
                        [c.id]: e.target.value,
                      }))
                    }
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-yellow-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => updateChantier(c.id, { notes: noteVal })}
                    className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-500 hover:text-gray-900 transition"
                  >
                    <Save className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
