"use client";

import { useState } from "react";
import {
  QUOTE_STATUS_LABELS,
  type QuoteRecord,
  type QuoteStatus,
} from "@/lib/types";
import type { ServiceCategory } from "@/data/servicesData";
import { telLinkForPhone, whatsappLinkForPhone } from "@/data/siteConfig";
import { exportQuotesToExcel } from "@/lib/exportExcel";
import DevisGeneratorModal from "@/components/admin/DevisGeneratorModal";
import {
  Phone,
  MessageCircle,
  Mail,
  Trash2,
  Save,
  HardHat,
  Plus,
  X,
  FileText,
  FileSpreadsheet,
  MapPin,
  Calendar,
  Wrench,
  Search,
  StickyNote,
} from "lucide-react";

interface Props {
  quotes: QuoteRecord[];
  services: ServiceCategory[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => Promise<void>;
  onConvertedToChantier: () => void;
}

const STATUS_BADGE_CLASSES: Record<QuoteStatus, string> = {
  nouveau: "bg-red-50 text-red-700 border-red-200",
  contacte: "bg-blue-50 text-blue-700 border-blue-200",
  devis_envoye: "bg-amber-50 text-amber-800 border-amber-200",
  termine: "bg-emerald-50 text-emerald-700 border-emerald-200",
  archive: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_ACCENT_BAR: Record<QuoteStatus, string> = {
  nouveau: "bg-red-500",
  contacte: "bg-blue-500",
  devis_envoye: "bg-amber-500",
  termine: "bg-emerald-500",
  archive: "bg-gray-300",
};

const emptyQuoteForm = {
  name: "",
  phone: "",
  email: "",
  city: "Tanger",
  category: "Gros Œuvre",
  status: "nouveau" as QuoteStatus,
  message: "",
  notes: "",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export default function AdminQuotes({
  quotes,
  services,
  authFetch,
  onRefresh,
  onConvertedToChantier,
}: Props) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    ...emptyQuoteForm,
    category: services[0]?.title ?? "Gros Œuvre",
  });
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [devisModalQuote, setDevisModalQuote] = useState<QuoteRecord | null>(
    null
  );

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setFormError(null);
    try {
      const res = await authFetch("/api/admin/quotes", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          services: form.category ? [form.category] : [],
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setFormError(body.error || "Impossible d'ajouter le devis.");
        return;
      }
      setForm({
        ...emptyQuoteForm,
        category: services[0]?.title ?? "Gros Œuvre",
      });
      setShowForm(false);
      await onRefresh();
    } finally {
      setCreating(false);
    }
  };

  const updateQuote = async (
    id: string,
    payload: { status?: QuoteStatus; notes?: string }
  ) => {
    setSavingId(id);
    try {
      await authFetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      await onRefresh();
    } finally {
      setSavingId(null);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cette demande de devis ?")) {
      return;
    }
    await authFetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    await onRefresh();
  };

  const convertToChantier = async (q: QuoteRecord) => {
    if (
      !window.confirm(
        `Créer un nouveau chantier à partir du devis de ${q.name} ?`
      )
    ) {
      return;
    }
    setSavingId(q.id);
    try {
      const res = await authFetch("/api/admin/chantiers", {
        method: "POST",
        body: JSON.stringify({
          name: `${q.category || "Projet"} — ${q.name}`,
          clientName: q.name,
          clientPhone: q.phone,
          location: q.city || "Tanger",
          category: q.category || "Rénovation",
          status: "planifie",
          progress: 0,
          budget: 0,
          startDate: new Date().toISOString().slice(0, 10),
          notes: [
            q.services.length > 0 ? `Services: ${q.services.join(", ")}` : "",
            q.message,
          ]
            .filter(Boolean)
            .join("\n"),
        }),
      });
      if (res.ok) {
        await authFetch(`/api/admin/quotes/${q.id}`, {
          method: "PATCH",
          body: JSON.stringify({ status: "devis_envoye" }),
        });
        await onRefresh();
        onConvertedToChantier();
      }
    } finally {
      setSavingId(null);
    }
  };

  const filtered = quotes.filter((q) => {
    if (statusFilter !== "all" && q.status !== statusFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        q.name.toLowerCase().includes(term) ||
        q.phone.toLowerCase().includes(term) ||
        q.category.toLowerCase().includes(term) ||
        q.city.toLowerCase().includes(term) ||
        q.message.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const newCount = quotes.filter((q) => q.status === "nouveau").length;
  const inProgressCount = quotes.filter(
    (q) => q.status === "contacte" || q.status === "devis_envoye"
  ).length;
  const doneCount = quotes.filter((q) => q.status === "termine").length;

  return (
    <div className="space-y-6">
      {/* Compact CRM Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Total Devis
          </p>
          <p className="mt-1 text-2xl font-black text-gray-900">
            {quotes.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-red-500">
            Nouveaux
          </p>
          <p className="mt-1 text-2xl font-black text-red-600">{newCount}</p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
            En cours
          </p>
          <p className="mt-1 text-2xl font-black text-amber-600">
            {inProgressCount}
          </p>
        </div>
        <div className="rounded-2xl bg-white border border-gray-100 px-4 py-3.5 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
            Terminés
          </p>
          <p className="mt-1 text-2xl font-black text-emerald-600">
            {doneCount}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone, ville, service…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:bg-white focus:outline-none transition"
            />
          </div>
          <select
            aria-label="Filtrer par statut"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-yellow-400 focus:bg-white focus:outline-none transition"
          >
            <option value="all">Tous les statuts ({quotes.length})</option>
            {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((st) => (
              <option key={st} value={st}>
                {QUOTE_STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={exporting || filtered.length === 0}
            onClick={async () => {
              setExporting(true);
              try {
                await exportQuotesToExcel(filtered);
              } finally {
                setExporting(false);
              }
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-40"
          >
            <FileSpreadsheet className="h-4 w-4" /> Exporter Excel
          </button>

          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-bold text-gray-900 shadow-sm hover:bg-yellow-400 transition"
          >
            {showForm ? (
              <>
                <X className="h-4 w-4" /> Fermer
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Nouveau Devis
              </>
            )}
          </button>
        </div>
      </div>

      {/* Add Manual Quote / Client Form */}
      {showForm && (
        <form
          onSubmit={handleCreateQuote}
          className="rounded-2xl bg-white border border-yellow-200 p-6 shadow-sm space-y-4"
        >
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-yellow-500" /> Ajouter un Devis /
            Client (appel, WhatsApp ou visite)
          </h3>

          {formError && (
            <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
              {formError}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              required
              type="text"
              placeholder="Nom complet du client *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
            />
            <input
              required
              type="tel"
              placeholder="Téléphone *"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email (optionnel)"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Ville / Quartier"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
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
                setForm({ ...form, status: e.target.value as QuoteStatus })
              }
              className="rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
            >
              {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map((st) => (
                <option key={st} value={st}>
                  {QUOTE_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <textarea
            rows={2}
            placeholder="Détails de la demande du client…"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm resize-none focus:border-yellow-400 focus:outline-none"
          />

          <input
            type="text"
            placeholder="Note interne (budget estimé, rendez-vous…)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={creating}
              className="rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-yellow-500 hover:text-gray-900 transition disabled:opacity-50"
            >
              {creating ? "Enregistrement…" : "Enregistrer le devis"}
            </button>
          </div>
        </form>
      )}

      {/* Quote Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-400">
          <FileText className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p className="font-semibold text-gray-600">
            Aucune demande de devis trouvée
          </p>
          <p className="text-xs mt-1 max-w-md mx-auto">
            Les demandes envoyées depuis le formulaire public (/contact ou les
            cartes services) apparaissent ici automatiquement, ou cliquez sur «
            Nouveau Devis » pour en ajouter un manuellement.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q) => {
            const noteVal =
              noteDrafts[q.id] !== undefined ? noteDrafts[q.id] : q.notes;
            const formattedDate = new Date(q.createdAt).toLocaleString(
              "fr-MA",
              {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            return (
              <article
                key={q.id}
                className="relative overflow-hidden rounded-2xl bg-white border border-gray-200/80 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Left status accent bar */}
                <div
                  className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_ACCENT_BAR[q.status]}`}
                />

                <div className="p-5 sm:p-6 pl-6 sm:pl-7 space-y-5">
                  {/* Top Header: Client identity + Status & Delete */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-sm font-black text-yellow-400 shadow-sm">
                        {getInitials(q.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 truncate">
                            {q.name}
                          </h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[q.status]}`}
                          >
                            {QUOTE_STATUS_LABELS[q.status]}
                          </span>
                          {q.category && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                              {q.category}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formattedDate}
                          </span>
                          <span className="font-mono text-[11px] text-gray-400">
                            #{q.id.slice(0, 6).toUpperCase()}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <select
                        aria-label={`Statut du devis de ${q.name}`}
                        value={q.status}
                        disabled={savingId === q.id}
                        onChange={(e) =>
                          updateQuote(q.id, {
                            status: e.target.value as QuoteStatus,
                          })
                        }
                        className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700 focus:border-yellow-400 focus:bg-white focus:outline-none transition"
                      >
                        {(
                          Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]
                        ).map((st) => (
                          <option key={st} value={st}>
                            {QUOTE_STATUS_LABELS[st]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => deleteQuote(q.id)}
                        aria-label="Supprimer ce devis"
                        title="Supprimer ce devis"
                        className="rounded-xl border border-gray-200 p-2 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Structured Client Info Grid */}
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <a
                      href={telLinkForPhone(q.phone)}
                      className="flex items-center gap-2.5 rounded-xl bg-gray-50/80 border border-gray-100 px-3.5 py-2.5 hover:border-yellow-300 hover:bg-yellow-50/40 transition"
                    >
                      <Phone className="h-4 w-4 text-yellow-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Téléphone
                        </p>
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {q.phone}
                        </p>
                      </div>
                    </a>

                    <div className="flex items-center gap-2.5 rounded-xl bg-gray-50/80 border border-gray-100 px-3.5 py-2.5">
                      <MapPin className="h-4 w-4 text-yellow-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Ville / Localisation
                        </p>
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {q.city || "Non renseignée"}
                        </p>
                      </div>
                    </div>

                    {q.email ? (
                      <a
                        href={`mailto:${q.email}`}
                        className="flex items-center gap-2.5 rounded-xl bg-gray-50/80 border border-gray-100 px-3.5 py-2.5 hover:border-yellow-300 hover:bg-yellow-50/40 transition"
                      >
                        <Mail className="h-4 w-4 text-yellow-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Email
                          </p>
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {q.email}
                          </p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-center gap-2.5 rounded-xl bg-gray-50/80 border border-gray-100 px-3.5 py-2.5">
                        <Mail className="h-4 w-4 text-gray-300 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Email
                          </p>
                          <p className="text-xs font-medium text-gray-400">
                            Non renseigné
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 rounded-xl bg-gray-50/80 border border-gray-100 px-3.5 py-2.5">
                      <Wrench className="h-4 w-4 text-yellow-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Services demandés
                        </p>
                        <p className="text-xs font-bold text-gray-900 truncate">
                          {q.services.length > 0
                            ? q.services.join(", ")
                            : q.category || "Non précisé"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Full-width Project Description */}
                  {q.message && (
                    <div className="rounded-xl bg-gray-50/90 border border-gray-100 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        Message du client
                      </p>
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {q.message}
                      </p>
                    </div>
                  )}

                  {/* Quick Actions Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={telLinkForPhone(q.phone)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition"
                    >
                      <Phone className="h-3.5 w-3.5" /> Appeler
                    </a>
                    <a
                      href={whatsappLinkForPhone(
                        q.phone,
                        `Bonjour ${q.name}, merci pour votre demande de devis chez TANKECH.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white hover:bg-green-600 transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    {q.email && (
                      <a
                        href={`mailto:${q.email}?subject=${encodeURIComponent(`Votre devis TANKECH — ${q.category || "Projet"}`)}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Mail className="h-3.5 w-3.5" /> Email
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setDevisModalQuote(q)}
                      title="Générer un devis professionnel signé (PDF A4 ou Excel)"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      <FileSpreadsheet className="h-3.5 w-3.5" /> Générer Devis
                      (PDF / Excel)
                    </button>
                    <button
                      type="button"
                      disabled={savingId === q.id}
                      onClick={() => convertToChantier(q)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-yellow-300 bg-yellow-50 px-3.5 py-2 text-xs font-bold text-yellow-900 hover:bg-yellow-100 transition disabled:opacity-50"
                    >
                      <HardHat className="h-3.5 w-3.5" /> Créer Chantier
                    </button>
                  </div>

                  {/* Internal Note / Estimate Footer */}
                  <div className="flex flex-col sm:flex-row gap-2 border-t border-gray-100 pt-4">
                    <div className="relative flex-1">
                      <StickyNote className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Note interne / Estimation (ex: 10 000 DH — visite prévue mardi…)"
                        value={noteVal}
                        onChange={(e) =>
                          setNoteDrafts((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/60 pl-9 pr-3.5 py-2.5 text-xs font-medium text-gray-800 placeholder:text-gray-400 focus:border-yellow-400 focus:bg-white focus:outline-none transition"
                      />
                    </div>
                    <button
                      type="button"
                      disabled={savingId === q.id}
                      onClick={() => updateQuote(q.id, { notes: noteVal })}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-yellow-500 hover:text-gray-900 transition shrink-0 disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" /> Enregistrer
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {devisModalQuote && (
        <DevisGeneratorModal
          quote={devisModalQuote}
          onClose={() => setDevisModalQuote(null)}
        />
      )}
    </div>
  );
}
