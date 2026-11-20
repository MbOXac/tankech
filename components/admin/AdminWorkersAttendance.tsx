"use client";

import { useState, useEffect } from "react";
import {
  ATTENDANCE_MULTIPLIER,
  WORKER_SPECIALTIES,
  type AttendanceRecord,
  type AttendanceStatus,
  type ChantierRecord,
  type WorkerRecord,
} from "@/lib/types";
import { whatsappLink } from "@/data/siteConfig";
import {
  Plus,
  Users,
  ClipboardCheck,
  Wallet,
  Phone,
  MessageCircle,
  Trash2,
  Download,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarOff,
  Loader2,
} from "lucide-react";

interface Props {
  workers: WorkerRecord[];
  chantiers: ChantierRecord[];
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  onRefresh: () => Promise<void>;
}

type SubTab = "pointage" | "workers" | "payroll";

const STATUS_BUTTONS: {
  status: AttendanceStatus;
  label: string;
  short: string;
  activeClass: string;
  icon: React.ElementType;
}[] = [
  {
    status: "present",
    label: "Présent",
    short: "1j",
    activeClass: "bg-emerald-600 text-white border-emerald-600",
    icon: CheckCircle2,
  },
  {
    status: "demi_journee",
    label: "½ Journée",
    short: "0.5j",
    activeClass: "bg-yellow-500 text-gray-900 border-yellow-500",
    icon: Clock,
  },
  {
    status: "absent",
    label: "Absent",
    short: "0",
    activeClass: "bg-red-600 text-white border-red-600",
    icon: XCircle,
  },
  {
    status: "conge",
    label: "Congé",
    short: "C",
    activeClass: "bg-blue-600 text-white border-blue-600",
    icon: CalendarOff,
  },
];

export default function AdminWorkersAttendance({
  workers,
  chantiers,
  authFetch,
  onRefresh,
}: Props) {
  const [subTab, setSubTab] = useState<SubTab>("pointage");
  const [selectedDate, setSelectedDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  );

  const [dayRecords, setDayRecords] = useState<Record<string, AttendanceRecord>>(
    {}
  );
  const [monthRecords, setMonthRecords] = useState<AttendanceRecord[]>([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [savingWorkerId, setSavingWorkerId] = useState<string | null>(null);
  const [chantierChoices, setChantierChoices] = useState<
    Record<string, string>
  >({});

  // New worker form
  const [newWorker, setNewWorker] = useState({
    name: "",
    phone: "",
    cin: "",
    specialty: WORKER_SPECIALTIES[1] as string,
    dailyRate: "150",
    notes: "",
  });
  const [creatingWorker, setCreatingWorker] = useState(false);

  useEffect(() => {
    let active = true;

    if (subTab === "pointage") {
      authFetch(`/api/admin/attendance?date=${selectedDate}`)
        .then((res) => (res.ok ? res.json() : { records: [] }))
        .then((data: { records?: AttendanceRecord[] }) => {
          if (!active) return;
          const map: Record<string, AttendanceRecord> = {};
          const choices: Record<string, string> = {};
          for (const rec of data.records ?? []) {
            map[rec.workerId] = rec;
            if (rec.chantierId) choices[rec.workerId] = rec.chantierId;
          }
          setDayRecords(map);
          setChantierChoices((prev) => ({ ...prev, ...choices }));
          setLoadingAttendance(false);
        })
        .catch(() => {
          if (active) setLoadingAttendance(false);
        });
    } else if (subTab === "payroll") {
      authFetch(`/api/admin/attendance?month=${selectedMonth}`)
        .then((res) => (res.ok ? res.json() : { records: [] }))
        .then((data: { records?: AttendanceRecord[] }) => {
          if (!active) return;
          setMonthRecords(data.records ?? []);
          setLoadingAttendance(false);
        })
        .catch(() => {
          if (active) setLoadingAttendance(false);
        });
    }

    return () => {
      active = false;
    };
  }, [subTab, selectedDate, selectedMonth, authFetch]);

  const markAttendance = async (
    worker: WorkerRecord,
    status: AttendanceStatus,
    explicitChantierId?: string
  ) => {
    setSavingWorkerId(worker.id);
    const chosenChantierId =
      explicitChantierId !== undefined
        ? explicitChantierId
        : chantierChoices[worker.id] ??
          dayRecords[worker.id]?.chantierId ??
          "";
    const chantier = chantiers.find((c) => c.id === chosenChantierId);

    try {
      const res = await authFetch("/api/admin/attendance", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDate,
          workerId: worker.id,
          workerName: worker.name,
          chantierId: chantier?.id ?? "",
          chantierName: chantier?.name ?? "",
          status,
          dailyRate: worker.dailyRate,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: string; amount: number };
        setDayRecords((prev) => ({
          ...prev,
          [worker.id]: {
            id: data.id,
            date: selectedDate,
            workerId: worker.id,
            workerName: worker.name,
            chantierId: chantier?.id ?? "",
            chantierName: chantier?.name ?? "",
            status,
            dailyRate: worker.dailyRate,
            amount: data.amount,
            notes: "",
            updatedAt: new Date().toISOString(),
          },
        }));
      }
    } finally {
      setSavingWorkerId(null);
    }
  };

  const handleCreateWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingWorker(true);
    try {
      const res = await authFetch("/api/admin/workers", {
        method: "POST",
        body: JSON.stringify({
          ...newWorker,
          dailyRate: Number(newWorker.dailyRate) || 0,
        }),
      });
      if (res.ok) {
        setNewWorker({
          name: "",
          phone: "",
          cin: "",
          specialty: WORKER_SPECIALTIES[1],
          dailyRate: "150",
          notes: "",
        });
        await onRefresh();
      }
    } finally {
      setCreatingWorker(false);
    }
  };

  const toggleWorkerActive = async (worker: WorkerRecord) => {
    await authFetch(`/api/admin/workers/${worker.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !worker.active }),
    });
    await onRefresh();
  };

  const deleteWorker = async (worker: WorkerRecord) => {
    if (!window.confirm(`Supprimer l'ouvrier ${worker.name} ?`)) return;
    await authFetch(`/api/admin/workers/${worker.id}`, { method: "DELETE" });
    await onRefresh();
  };

  const activeWorkers = workers.filter((w) => w.active);
  const dayTotalAmount = Object.values(dayRecords).reduce(
    (sum, r) => sum + r.amount,
    0
  );
  const dayPresentCount = Object.values(dayRecords).filter(
    (r) => r.status === "present" || r.status === "demi_journee"
  ).length;

  // Monthly payroll aggregation
  const payrollRows = workers.map((w) => {
    const recs = monthRecords.filter((r) => r.workerId === w.id);
    const fullDays = recs.filter((r) => r.status === "present").length;
    const halfDays = recs.filter((r) => r.status === "demi_journee").length;
    const absentDays = recs.filter((r) => r.status === "absent").length;
    const totalDays = recs.reduce(
      (sum, r) => sum + ATTENDANCE_MULTIPLIER[r.status],
      0
    );
    const totalPay = recs.reduce((sum, r) => sum + r.amount, 0);
    return {
      worker: w,
      fullDays,
      halfDays,
      absentDays,
      totalDays,
      totalPay,
    };
  });

  const totalMonthPay = payrollRows.reduce((sum, r) => sum + r.totalPay, 0);

  const exportPayrollCsv = () => {
    const headers = [
      "Ouvrier",
      "Spécialité",
      "CIN",
      "Tarif/Jour (DH)",
      "Jours Pleins",
      "Demi-journées",
      "Absences",
      "Total Jours",
      "Total à Payer (DH)",
    ];
    const safeCsv = (v: string) => {
      const s = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
      return `"${s.replace(/"/g, '""')}"`;
    };
    const rows = payrollRows.map((r) => [
      safeCsv(r.worker.name),
      safeCsv(r.worker.specialty),
      safeCsv(r.worker.cin),
      r.worker.dailyRate,
      r.fullDays,
      r.halfDays,
      r.absentDays,
      r.totalDays,
      r.totalPay,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paie-tankech-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSubTab("pointage")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            subTab === "pointage"
              ? "bg-yellow-500 text-gray-900 shadow"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <ClipboardCheck className="h-4 w-4" /> Pointage Journalier
        </button>
        <button
          type="button"
          onClick={() => setSubTab("workers")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            subTab === "workers"
              ? "bg-yellow-500 text-gray-900 shadow"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Users className="h-4 w-4" /> Ouvriers ({workers.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab("payroll")}
          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
            subTab === "payroll"
              ? "bg-yellow-500 text-gray-900 shadow"
              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          <Wallet className="h-4 w-4" /> Paie &amp; Récap Mensuel
        </button>
      </div>

      {/* SUBTAB 1: DAILY POINTAGE */}
      {subTab === "pointage" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-gray-700">Date :</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900"
              />
              {loadingAttendance && (
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 font-bold text-emerald-700">
                Présents : {dayPresentCount} / {activeWorkers.length}
              </span>
              <span className="rounded-lg bg-gray-900 px-3 py-1.5 font-bold text-yellow-400">
                Coût du jour : {dayTotalAmount.toLocaleString("fr-MA")} DH
              </span>
            </div>
          </div>

          {activeWorkers.length === 0 ? (
            <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center">
              <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" />
              <p className="font-bold text-gray-700">
                Aucun ouvrier actif à pointer
              </p>
              <p className="text-sm text-gray-400 mt-1 mb-4">
                Ajoutez vos ouvriers (maçons, plombiers, électriciens, manœuvres…)
                pour commencer le pointage quotidien.
              </p>
              <button
                type="button"
                onClick={() => setSubTab("workers")}
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-bold text-gray-900 hover:bg-yellow-400"
              >
                <Plus className="h-4 w-4" /> Ajouter un ouvrier
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeWorkers.map((w) => {
                const record = dayRecords[w.id];
                const currentChantierId =
                  chantierChoices[w.id] ?? record?.chantierId ?? "";

                return (
                  <div
                    key={w.id}
                    className="rounded-2xl bg-white border border-gray-100 p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-gray-900">{w.name}</h4>
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                          {w.specialty}
                        </span>
                        <span className="text-xs font-bold text-yellow-700">
                          {w.dailyRate} DH/j
                        </span>
                      </div>
                      {record && (
                        <p className="mt-1 text-xs text-gray-400">
                          Enregistré :{" "}
                          <strong className="text-gray-700">
                            {record.amount} DH
                          </strong>
                          {record.chantierName
                            ? ` • ${record.chantierName}`
                            : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <select
                        aria-label={`Chantier pour ${w.name}`}
                        value={currentChantierId}
                        onChange={(e) => {
                          const nextId = e.target.value;
                          setChantierChoices((prev) => ({
                            ...prev,
                            [w.id]: nextId,
                          }));
                          if (record) {
                            markAttendance(w, record.status, nextId);
                          }
                        }}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700"
                      >
                        <option value="">Chantier (optionnel)</option>
                        {chantiers
                          .filter((c) => c.status !== "annule")
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>

                      <div className="grid grid-cols-4 gap-1.5">
                        {STATUS_BUTTONS.map((btn) => {
                          const isSelected = record?.status === btn.status;
                          const Icon = btn.icon;
                          return (
                            <button
                              key={btn.status}
                              type="button"
                              disabled={savingWorkerId === w.id}
                              onClick={() => markAttendance(w, btn.status)}
                              className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2.5 py-2 text-xs font-bold transition ${
                                isSelected
                                  ? btn.activeClass
                                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              <Icon className="h-3.5 w-3.5" />
                              <span className="hidden sm:inline">
                                {btn.label}
                              </span>
                              <span className="sm:hidden">{btn.short}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: WORKERS ROSTER */}
      {subTab === "workers" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <form
            onSubmit={handleCreateWorker}
            className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-3.5 h-fit"
          >
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Plus className="h-5 w-5 text-yellow-500" /> Ajouter un Ouvrier
            </h3>
            <input
              required
              type="text"
              placeholder="Nom complet *"
              value={newWorker.name}
              onChange={(e) =>
                setNewWorker({ ...newWorker, name: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <select
              value={newWorker.specialty}
              onChange={(e) =>
                setNewWorker({ ...newWorker, specialty: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            >
              {WORKER_SPECIALTIES.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Téléphone (ex: +212 6...)"
              value={newWorker.phone}
              onChange={(e) =>
                setNewWorker({ ...newWorker, phone: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="CIN (optionnel)"
                value={newWorker.cin}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, cin: e.target.value })
                }
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
              />
              <input
                required
                type="number"
                min={0}
                placeholder="Salaire / jour (DH)"
                value={newWorker.dailyRate}
                onChange={(e) =>
                  setNewWorker({ ...newWorker, dailyRate: e.target.value })
                }
                className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
              />
            </div>
            <textarea
              rows={2}
              placeholder="Notes (compétences, disponibilités…)"
              value={newWorker.notes}
              onChange={(e) =>
                setNewWorker({ ...newWorker, notes: e.target.value })
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm resize-none"
            />
            <button
              type="submit"
              disabled={creatingWorker}
              className="w-full rounded-xl bg-yellow-500 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-400 transition disabled:opacity-50"
            >
              {creatingWorker ? "Ajout…" : "Ajouter l'ouvrier"}
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            {workers.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-400">
                Aucun ouvrier enregistré pour le moment.
              </div>
            ) : (
              workers.map((w) => (
                <div
                  key={w.id}
                  className={`rounded-2xl bg-white border p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    w.active ? "border-gray-100" : "border-gray-200 opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-gray-900">{w.name}</h4>
                      <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                        {w.specialty}
                      </span>
                      <span className="rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-bold text-white">
                        {w.dailyRate} DH/jour
                      </span>
                      {!w.active && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-semibold text-gray-600">
                          Inactif
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {w.cin ? `CIN : ${w.cin}` : "CIN non renseignée"}
                      {w.notes ? ` • ${w.notes}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {w.phone && (
                      <>
                        <a
                          href={`tel:${w.phone}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-yellow-100"
                        >
                          <Phone className="h-3.5 w-3.5" /> {w.phone}
                        </a>
                        <a
                          href={whatsappLink(`Bonjour ${w.name},`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                        </a>
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleWorkerActive(w)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {w.active ? "Désactiver" : "Réactiver"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteWorker(w)}
                      aria-label={`Supprimer ${w.name}`}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 3: MONTHLY PAYROLL */}
      {subTab === "payroll" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-gray-700">Mois :</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900"
              />
              {loadingAttendance && (
                <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-bold text-yellow-400">
                Masse salariale : {totalMonthPay.toLocaleString("fr-MA")} DH
              </span>
              <button
                type="button"
                onClick={exportPayrollCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white border border-gray-100 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Ouvrier</th>
                  <th className="px-4 py-3">Spécialité</th>
                  <th className="px-4 py-3 text-right">Tarif/Jour</th>
                  <th className="px-4 py-3 text-center">Jours (1j)</th>
                  <th className="px-4 py-3 text-center">½ Journées</th>
                  <th className="px-4 py-3 text-center">Total Jours</th>
                  <th className="px-4 py-3 text-right">À Payer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payrollRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-gray-400"
                    >
                      Aucun ouvrier enregistré.
                    </td>
                  </tr>
                ) : (
                  payrollRows.map((row) => (
                    <tr key={row.worker.id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {row.worker.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {row.worker.specialty}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {row.worker.dailyRate} DH
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-emerald-700">
                        {row.fullDays}
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-yellow-700">
                        {row.halfDays}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900">
                        {row.totalDays}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-gray-900">
                        {row.totalPay.toLocaleString("fr-MA")} DH
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
