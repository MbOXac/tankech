"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  getClientAuth,
  isFirebaseClientConfigured,
} from "@/lib/firebaseClient";
import { siteConfig } from "@/data/siteConfig";
import { servicesData, type ServiceCategory } from "@/data/servicesData";
import type { Project } from "@/data/projectsData";
import type { Testimonial } from "@/data/testimonialsData";
import type {
  AttendanceRecord,
  ChantierRecord,
  ExpenseRecord,
  QuoteRecord,
  WorkerRecord,
} from "@/lib/types";
import AdminOverview, {
  type AdminSection,
} from "@/components/admin/AdminOverview";
import AdminChantiers from "@/components/admin/AdminChantiers";
import AdminWorkersAttendance from "@/components/admin/AdminWorkersAttendance";
import AdminExpenses from "@/components/admin/AdminExpenses";
import AdminServices from "@/components/admin/AdminServices";
import AdminQuotes from "@/components/admin/AdminQuotes";
import AdminShowcase from "@/components/admin/AdminShowcase";
import {
  LayoutDashboard,
  HardHat,
  Users,
  Wallet,
  FileText,
  Wrench,
  Image as ImageIcon,
  LogOut,
  RefreshCw,
  ExternalLink,
  Menu,
  X,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";

const NAV_ITEMS: {
  id: AdminSection;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
    {
      id: "overview",
      label: "Tableau de bord",
      description: "Vue globale & indicateurs",
      icon: LayoutDashboard,
    },
    {
      id: "chantiers",
      label: "Chantiers",
      description: "Statuts, avancement & budgets",
      icon: HardHat,
    },
    {
      id: "workers",
      label: "Ouvriers & Pointage",
      description: "Équipe, présence & paie",
      icon: Users,
    },
    {
      id: "expenses",
      label: "Dépenses & Matériaux",
      description: "Achats & coûts chantiers",
      icon: Wallet,
    },
    {
      id: "quotes",
      label: "Devis & Clients",
      description: "Demandes entrantes",
      icon: FileText,
    },
    {
      id: "services",
      label: "Services",
      description: "Catalogue & prestations",
      icon: Wrench,
    },
    {
      id: "showcase",
      label: "Portfolio & Avis",
      description: "Projets & témoignages site",
      icon: ImageIcon,
    },
  ];

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseClientConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [section, setSection] = useState<AdminSection>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [chantiers, setChantiers] = useState<ChantierRecord[]>([]);
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[]>(
    []
  );
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [dbServices, setDbServices] = useState<ServiceCategory[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const [loadingData, setLoadingData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const auth = getClientAuth();
    if (!auth) return;

    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      if (!user) throw new Error("Non connecté");
      const token = await user.getIdToken();
      return fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers ?? {}),
          Authorization: `Bearer ${token}`,
        },
      });
    },
    [user]
  );

  const fetchAllData = useCallback(async (currentUser: User) => {
    const token = await currentUser.getIdToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    const today = new Date().toISOString().slice(0, 10);

    const [qRes, cRes, wRes, aRes, eRes, sRes, pRes, tRes] = await Promise.all([
      fetch("/api/admin/quotes", { headers }),
      fetch("/api/admin/chantiers", { headers }),
      fetch("/api/admin/workers", { headers }),
      fetch(`/api/admin/attendance?date=${today}`, { headers }),
      fetch("/api/admin/expenses", { headers }),
      fetch("/api/admin/services", { headers }),
      fetch("/api/admin/projects", { headers }),
      fetch("/api/admin/testimonials", { headers }),
    ]);

    if (!qRes.ok) {
      const body = (await qRes.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        error:
          body.error ||
          `Erreur serveur (HTTP ${qRes.status}). Vérifiez les variables d'environnement Vercel.`,
      };
    }

    const [qData, cData, wData, aData, eData, sData, pData, tData] =
      (await Promise.all([
        qRes.json(),
        cRes.ok ? cRes.json() : { chantiers: [] },
        wRes.ok ? wRes.json() : { workers: [] },
        aRes.ok ? aRes.json() : { records: [] },
        eRes.ok ? eRes.json() : { expenses: [] },
        sRes.ok ? sRes.json() : { services: [] },
        pRes.ok ? pRes.json() : { projects: [] },
        tRes.ok ? tRes.json() : { testimonials: [] },
      ])) as [
        { quotes?: QuoteRecord[] },
        { chantiers?: ChantierRecord[] },
        { workers?: WorkerRecord[] },
        { records?: AttendanceRecord[] },
        { expenses?: ExpenseRecord[] },
        { services?: ServiceCategory[] },
        { projects?: Project[] },
        { testimonials?: Testimonial[] }
      ];

    return {
      quotes: qData.quotes ?? [],
      chantiers: cData.chantiers ?? [],
      workers: wData.workers ?? [],
      todayAttendance: aData.records ?? [],
      expenses: eData.expenses ?? [],
      services: sData.services ?? [],
      projects: pData.projects ?? [],
      testimonials: tData.testimonials ?? [],
    };
  }, []);

  const loadAllData = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    setApiError(null);
    try {
      const res = await fetchAllData(user);
      if ("error" in res && res.error) {
        setApiError(res.error);
      } else {
        setQuotes(res.quotes ?? []);
        setChantiers(res.chantiers ?? []);
        setWorkers(res.workers ?? []);
        setTodayAttendance(res.todayAttendance ?? []);
        setExpenses(res.expenses ?? []);
        setDbServices(res.services ?? []);
        setProjects(res.projects ?? []);
        setTestimonials(res.testimonials ?? []);
      }
    } catch {
      setApiError("Impossible de charger les données administrateur.");
    } finally {
      setLoadingData(false);
    }
  }, [user, fetchAllData]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    fetchAllData(user)
      .then((res) => {
        if (!active) return;
        if ("error" in res && res.error) {
          setApiError(res.error);
        } else {
          setApiError(null);
          setQuotes(res.quotes ?? []);
          setChantiers(res.chantiers ?? []);
          setWorkers(res.workers ?? []);
          setTodayAttendance(res.todayAttendance ?? []);
          setExpenses(res.expenses ?? []);
          setDbServices(res.services ?? []);
          setProjects(res.projects ?? []);
          setTestimonials(res.testimonials ?? []);
        }
      })
      .catch(() => {
        if (active) {
          setApiError("Impossible de charger les données administrateur.");
        }
      });

    return () => {
      active = false;
    };
  }, [user, fetchAllData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = getClientAuth();
    if (!auth) return;

    setLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch {
      setLoginError("Email ou mot de passe incorrect.");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    const auth = getClientAuth();
    if (auth) await signOut(auth);
  };

  // Setup screen when Firebase client env vars are missing
  if (!isFirebaseClientConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Configuration Firebase requise
          </h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Copiez{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
              .env.example
            </code>{" "}
            vers{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
              .env.local
            </code>{" "}
            et renseignez vos clés Firebase, puis redémarrez le serveur.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    );
  }

  // Standalone Login screen
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 inline-flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 px-4 py-3 shadow-sm">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={100}
                height={85}
                className="h-14 w-auto object-contain"
              />
            </div>
            <div>
              <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
                TANKECH PRO — ERP
              </span>
            </div>
            <h1 className="mt-3 text-2xl font-black text-gray-900">
              Espace Administrateur
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gestion des chantiers, ouvriers, pointage, dépenses &amp; devis
            </p>
          </div>

          {loginError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              required
              type="email"
              aria-label="Email administrateur"
              placeholder="Email administrateur"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
            />
            <input
              required
              type="password"
              aria-label="Mot de passe"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-100"
            />
            <button
              type="submit"
              disabled={loggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-yellow-500 py-3.5 text-sm font-bold text-gray-900 shadow transition hover:bg-yellow-400 disabled:opacity-50"
            >
              {loggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-gray-400 hover:text-gray-700"
            >
              ← Retour au site public TANKECH
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const effectiveServices = dbServices.length > 0 ? dbServices : servicesData;
  const newQuotesCount = quotes.filter((q) => q.status === "nouveau").length;
  const activeChantiersCount = chantiers.filter(
    (c) => c.status === "en_cours"
  ).length;
  const currentMeta =
    NAV_ITEMS.find((item) => item.id === section) ?? NAV_ITEMS[0];

  const renderSidebarContent = () => (
    <div className="flex h-full flex-col bg-gray-950 text-white">
      {/* Brand */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-12 items-center justify-center rounded-xl bg-white p-1.5 shadow">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={48}
              height={41}
              className="h-full w-auto object-contain"
            />
          </div>
          <div>
            <p className="text-base font-black tracking-tight leading-none">
              TANKECH
            </p>
            <p className="text-[11px] font-semibold text-yellow-400 mt-1">
              Gestion Chantiers
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fermer le menu"
          className="lg:hidden rounded-lg p-1.5 text-white/60 hover:bg-white/10"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = section === item.id;
          const badge =
            item.id === "quotes" && newQuotesCount > 0
              ? { value: newQuotesCount, color: "bg-red-500 text-white" }
              : item.id === "chantiers" && activeChantiersCount > 0
                ? {
                  value: activeChantiersCount,
                  color: "bg-yellow-500 text-gray-950",
                }
                : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSection(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${active
                ? "bg-yellow-500 text-gray-950 shadow-lg"
                : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </span>
              {badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-gray-950 text-yellow-400" : badge.color
                    }`}
                >
                  {badge.value}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom account & public site link */}
      <div className="border-t border-white/10 p-4 space-y-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
        >
          <span>Voir le site public</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <div className="flex items-center justify-between rounded-xl bg-white/5 px-3.5 py-2.5">
          <div className="min-w-0 pr-2">
            <p className="text-[11px] text-white/40">Administrateur</p>
            <p className="text-xs font-semibold text-white truncate">
              {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Déconnexion"
            title="Déconnexion"
            className="rounded-lg p-2 text-red-400 hover:bg-red-500/20 transition shrink-0"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:block lg:w-64 shadow-xl z-30">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Top App Bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-gray-200 bg-white/95 backdrop-blur px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Ouvrir le menu"
              className="lg:hidden rounded-xl border border-gray-200 p-2 text-gray-700 hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-black text-gray-900 truncate">
                {currentMeta.label}
              </h1>
              <p className="text-xs text-gray-400 truncate">
                {currentMeta.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadAllData}
              disabled={loadingData}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 transition"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${loadingData ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Actualiser</span>
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {apiError && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          {section === "overview" && (
            <AdminOverview
              quotes={quotes}
              chantiers={chantiers}
              workers={workers}
              todayAttendance={todayAttendance}
              expenses={expenses}
              onNavigate={setSection}
            />
          )}

          {section === "chantiers" && (
            <AdminChantiers
              chantiers={chantiers}
              workers={workers}
              services={effectiveServices}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {section === "workers" && (
            <AdminWorkersAttendance
              workers={workers}
              chantiers={chantiers}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {section === "expenses" && (
            <AdminExpenses
              expenses={expenses}
              chantiers={chantiers}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {section === "quotes" && (
            <AdminQuotes
              quotes={quotes}
              services={effectiveServices}
              authFetch={authFetch}
              onRefresh={loadAllData}
              onConvertedToChantier={() => setSection("chantiers")}
            />
          )}

          {section === "services" && (
            <AdminServices
              services={dbServices}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}

          {section === "showcase" && (
            <AdminShowcase
              projects={projects}
              testimonials={testimonials}
              services={effectiveServices}
              authFetch={authFetch}
              onRefresh={loadAllData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
