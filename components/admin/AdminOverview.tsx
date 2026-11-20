"use client";

import {
  CHANTIER_STATUS_LABELS,
  QUOTE_STATUS_LABELS,
  type AttendanceRecord,
  type ChantierRecord,
  type ExpenseRecord,
  type QuoteRecord,
  type WorkerRecord,
} from "@/lib/types";
import {
  FileText,
  HardHat,
  Users,
  Wallet,
  ArrowRight,
  ClipboardCheck,
  Plus,
  MapPin,
  TrendingUp,
} from "lucide-react";

export type AdminSection =
  | "overview"
  | "chantiers"
  | "workers"
  | "expenses"
  | "quotes"
  | "services"
  | "showcase";

interface Props {
  quotes: QuoteRecord[];
  chantiers: ChantierRecord[];
  workers: WorkerRecord[];
  todayAttendance: AttendanceRecord[];
  expenses: ExpenseRecord[];
  onNavigate: (section: AdminSection) => void;
}

function formatMAD(amount: number): string {
  return `${Math.round(amount).toLocaleString("fr-MA")} DH`;
}

export default function AdminOverview({
  quotes,
  chantiers,
  workers,
  todayAttendance,
  expenses,
  onNavigate,
}: Props) {
  const newQuotes = quotes.filter((q) => q.status === "nouveau");
  const activeChantiers = chantiers.filter((c) => c.status === "en_cours");
  const activeWorkers = workers.filter((w) => w.active);
  const presentToday = todayAttendance.filter(
    (a) => a.status === "present" || a.status === "demi_journee"
  );
  const todayLaborCost = todayAttendance.reduce((sum, a) => sum + a.amount, 0);
  const totalBudget = chantiers.reduce((sum, c) => sum + c.budget, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Quick actions banner */}
      <div className="rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-yellow-400">
              Centre de Pilotage TANKECH
            </p>
            <h2 className="mt-1 text-2xl font-black">
              Vue d&apos;ensemble des opérations
            </h2>
            <p className="mt-1 text-sm text-white/60">
              Suivez vos chantiers, le pointage quotidien des ouvriers, vos
              dépenses et vos devis clients.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigate("workers")}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-bold text-gray-900 hover:bg-yellow-400 transition"
            >
              <ClipboardCheck className="h-4 w-4" /> Pointage du jour
            </button>
            <button
              type="button"
              onClick={() => onNavigate("chantiers")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition"
            >
              <Plus className="h-4 w-4" /> Nouveau chantier
            </button>
            <button
              type="button"
              onClick={() => onNavigate("expenses")}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/20 transition"
            >
              <Wallet className="h-4 w-4" /> Ajouter dépense
            </button>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <button
          type="button"
          onClick={() => onNavigate("chantiers")}
          className="text-left rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-yellow-200 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">
              Chantiers Actifs
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
              <HardHat className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-gray-900">
            {activeChantiers.length}
            <span className="text-sm font-medium text-gray-400 ml-1">
              / {chantiers.length} total
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Budget cumulé : {formatMAD(totalBudget)}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("workers")}
          className="text-left rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-yellow-200 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">
              Pointage Aujourd&apos;hui
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-gray-900">
            {presentToday.length}
            <span className="text-sm font-medium text-gray-400 ml-1">
              / {activeWorkers.length} actifs
            </span>
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">
            Main d&apos;œuvre du jour : {formatMAD(todayLaborCost)}
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("quotes")}
          className="text-left rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-yellow-200 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">
              Nouveaux Devis
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-black text-gray-900">
            {newQuotes.length}
            <span className="text-sm font-medium text-gray-400 ml-1">
              / {quotes.length} total
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            En attente de traitement
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate("expenses")}
          className="text-left rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-yellow-200 transition"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-gray-400">
              Dépenses Enregistrées
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black text-gray-900">
            {formatMAD(totalExpenses)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {expenses.length} opération{expenses.length > 1 ? "s" : ""}
          </p>
        </button>
      </div>

      {/* Two-column activity grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Chantiers */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">
              Chantiers en cours
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("chantiers")}
              className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-700"
            >
              Tout voir <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {chantiers.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Aucun chantier créé pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {chantiers.slice(0, 5).map((c) => {
                const overBudget = c.budget > 0 && c.spent > c.budget;
                return (
                  <div
                    key={c.id}
                    className="rounded-xl border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-sm text-gray-900">
                          {c.name}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" /> {c.location}
                          {c.clientName ? ` • ${c.clientName}` : ""}
                        </p>
                      </div>
                      <span className="rounded-full bg-white border border-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">
                        {CHANTIER_STATUS_LABELS[c.status]}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Avancement : {c.progress}%</span>
                        <span className={overBudget ? "text-red-600 font-bold" : ""}>
                          {formatMAD(c.spent)} / {formatMAD(c.budget)}
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-yellow-500 transition-all"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Quotes */}
        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900">
              Dernières demandes de devis
            </h3>
            <button
              type="button"
              onClick={() => onNavigate("quotes")}
              className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 hover:text-yellow-700"
            >
              Tout voir <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          {quotes.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Aucune demande de devis reçue pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {quotes.slice(0, 5).map((q) => (
                <div
                  key={q.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3.5"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 truncate">
                      {q.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {q.category || "Demande générale"} • {q.phone}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      q.status === "nouveau"
                        ? "bg-red-100 text-red-700"
                        : q.status === "termine"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {QUOTE_STATUS_LABELS[q.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
