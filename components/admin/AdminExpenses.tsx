"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  type ChantierRecord,
  type ExpenseRecord,
} from "@/lib/types";
import { Plus, Trash2, Wallet } from "lucide-react";

interface Props {
  expenses: ExpenseRecord[];
  chantiers: ChantierRecord[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => Promise<void>;
}

export default function AdminExpenses({
  expenses,
  chantiers,
  authFetch,
  onRefresh,
}: Props) {
  const [form, setForm] = useState({
    chantierId: "",
    category: EXPENSE_CATEGORIES[0] as string,
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    supplier: "",
  });
  const [saving, setSaving] = useState(false);
  const [filterChantier, setFilterChantier] = useState("all");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const chantier = chantiers.find((c) => c.id === form.chantierId);
    try {
      const res = await authFetch("/api/admin/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          chantierName: chantier?.name ?? "",
          amount: Number(form.amount) || 0,
        }),
      });
      if (res.ok) {
        setForm({
          chantierId: form.chantierId,
          category: EXPENSE_CATEGORIES[0],
          description: "",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
          supplier: "",
        });
        await onRefresh();
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async (id: string) => {
    if (!window.confirm("Supprimer cette dépense ?")) return;
    await authFetch(`/api/admin/expenses/${id}`, { method: "DELETE" });
    await onRefresh();
  };

  const filtered = expenses.filter((e) =>
    filterChantier === "all" ? true : e.chantierId === filterChantier
  );
  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Add expense form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-3.5 h-fit"
      >
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Plus className="h-5 w-5 text-yellow-500" /> Nouvelle Dépense
        </h3>
        <select
          value={form.chantierId}
          onChange={(e) => setForm({ ...form, chantierId: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        >
          <option value="">Frais généraux (aucun chantier)</option>
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        >
          {EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <input
          required
          type="text"
          placeholder="Description (ex: 50 sacs ciment, sable, câble…) *"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            required
            type="number"
            min={1}
            step="0.01"
            placeholder="Montant (DH) *"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
          />
        </div>
        <input
          type="text"
          placeholder="Fournisseur / Magasin (optionnel)"
          value={form.supplier}
          onChange={(e) => setForm({ ...form, supplier: e.target.value })}
          className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-yellow-500 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-400 transition disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer la dépense"}
        </button>
        <p className="text-[11px] text-gray-400">
          Les dépenses liées à un chantier mettent automatiquement à jour son
          montant dépensé.
        </p>
      </form>

      {/* Expenses table */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm">
          <select
            aria-label="Filtrer les dépenses par chantier"
            value={filterChantier}
            onChange={(e) => setFilterChantier(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
          >
            <option value="all">Tous les chantiers</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <div className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-yellow-400">
            <Wallet className="h-4 w-4" />
            Total : {totalFiltered.toLocaleString("fr-MA")} DH
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-400">
            Aucune dépense enregistrée.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between gap-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-gray-900">
                      {exp.description}
                    </span>
                    <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {exp.category}
                    </span>
                    {exp.chantierName && (
                      <span className="rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                        {exp.chantierName}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    {exp.date}
                    {exp.supplier ? ` • Fournisseur : ${exp.supplier}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-base font-black text-gray-900">
                    {exp.amount.toLocaleString("fr-MA")} DH
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteExpense(exp.id)}
                    aria-label="Supprimer cette dépense"
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
