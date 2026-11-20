"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  QUOTE_STATUS_LABELS,
  type QuoteRecord,
  type QuoteStatus,
} from "@/lib/types";
import type { Project } from "@/data/projectsData";
import type { Testimonial } from "@/data/testimonialsData";
import { servicesData } from "@/data/servicesData";
import { whatsappLink } from "@/data/siteConfig";
import {
  LogOut,
  RefreshCw,
  FileText,
  FolderKanban,
  MessageSquareQuote,
  Trash2,
  Phone,
  Mail,
  MessageCircle,
  Plus,
  Star,
  Lock,
  AlertCircle,
  Loader2,
  Download,
  Save,
} from "lucide-react";

type Tab = "quotes" | "projects" | "testimonials";

const STATUS_BADGE_CLASSES: Record<QuoteStatus, string> = {
  nouveau: "bg-red-100 text-red-700 border-red-200",
  contacte: "bg-blue-100 text-blue-700 border-blue-200",
  devis_envoye: "bg-yellow-100 text-yellow-800 border-yellow-200",
  termine: "bg-green-100 text-green-700 border-green-200",
  archive: "bg-gray-100 text-gray-600 border-gray-200",
};

export default function AdminDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(isFirebaseClientConfigured);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [tab, setTab] = useState<Tab>("quotes");
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // New project form
  const [newProject, setNewProject] = useState({
    title: "",
    categorySlug: servicesData[0].slug,
    location: "Tanger",
    description: "",
    afterImage: "/og-image.jpg",
    beforeImage: "",
    featured: true,
  });

  // New testimonial form
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "Propriétaire",
    location: "Tanger",
    service: servicesData[0].title,
    rating: 5,
    text: "",
  });

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

    const [qRes, pRes, tRes] = await Promise.all([
      fetch("/api/admin/quotes", { headers }),
      fetch("/api/admin/projects", { headers }),
      fetch("/api/admin/testimonials", { headers }),
    ]);

    if (!qRes.ok) {
      const body = (await qRes.json().catch(() => ({}))) as {
        error?: string;
      };
      return {
        error: body.error || "Accès refusé ou erreur serveur.",
      };
    }

    const [qData, pData, tData] = (await Promise.all([
      qRes.json(),
      pRes.ok ? pRes.json() : { projects: [] },
      tRes.ok ? tRes.json() : { testimonials: [] },
    ])) as [
      { quotes?: QuoteRecord[] },
      { projects?: Project[] },
      { testimonials?: Testimonial[] }
    ];

    return {
      quotes: qData.quotes ?? [],
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
        const loadedQuotes = res.quotes ?? [];
        setQuotes(loadedQuotes);
        setNoteDrafts(
          Object.fromEntries(loadedQuotes.map((q) => [q.id, q.notes]))
        );
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
          const loadedQuotes = res.quotes ?? [];
          setApiError(null);
          setQuotes(loadedQuotes);
          setNoteDrafts(
            Object.fromEntries(loadedQuotes.map((q) => [q.id, q.notes]))
          );
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

  const updateQuote = async (
    id: string,
    payload: { status?: QuoteStatus; notes?: string }
  ) => {
    setSavingId(id);
    try {
      const res = await authFetch(`/api/admin/quotes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === id
              ? {
                  ...q,
                  status: payload.status ?? q.status,
                  notes: payload.notes ?? q.notes,
                }
              : q
          )
        );
      }
    } finally {
      setSavingId(null);
    }
  };

  const deleteQuote = async (id: string) => {
    if (!window.confirm("Supprimer définitivement cette demande de devis ?")) {
      return;
    }
    const res = await authFetch(`/api/admin/quotes/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const cat = servicesData.find((s) => s.slug === newProject.categorySlug);
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
        categorySlug: servicesData[0].slug,
        location: "Tanger",
        description: "",
        afterImage: "/og-image.jpg",
        beforeImage: "",
        featured: true,
      });
      await loadAllData();
    }
  };

  const seedDefaultProjects = async () => {
    const res = await authFetch("/api/admin/projects", {
      method: "POST",
      body: JSON.stringify({ seedDefaults: true }),
    });
    if (res.ok) await loadAllData();
  };

  const deleteProject = async (id: string) => {
    if (!window.confirm("Supprimer ce projet ?")) return;
    const res = await authFetch(`/api/admin/projects/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
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
        service: servicesData[0].title,
        rating: 5,
        text: "",
      });
      await loadAllData();
    }
  };

  const seedDefaultTestimonials = async () => {
    const res = await authFetch("/api/admin/testimonials", {
      method: "POST",
      body: JSON.stringify({ seedDefaults: true }),
    });
    if (res.ok) await loadAllData();
  };

  const deleteTestimonial = async (id: string) => {
    if (!window.confirm("Supprimer ce témoignage ?")) return;
    const res = await authFetch(`/api/admin/testimonials/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Setup screen when Firebase client env vars are missing
  if (!isFirebaseClientConfigured) {
    return (
      <div className="min-h-screen bg-gray-950 pt-36 pb-20 px-4">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-yellow-600">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">
            Configuration Firebase requise
          </h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Pour activer l&apos;espace administrateur, copiez{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
              .env.example
            </code>{" "}
            vers{" "}
            <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
              .env.local
            </code>{" "}
            et renseignez vos clés Firebase et Gmail SMTP, puis redémarrez le
            serveur.
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

  // Login screen
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4 pt-32 pb-16">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <span className="inline-block rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800">
              Espace Administrateur
            </span>
            <h1 className="mt-3 text-2xl font-black text-gray-900">
              Connexion TANKECH
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos devis, projets et témoignages clients
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
        </div>
      </div>
    );
  }

  const filteredQuotes = quotes.filter((q) => {
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
    <div className="min-h-screen bg-gray-50 pt-28 pb-20">
      {/* Admin top header */}
      <div className="bg-gray-900 text-white py-8">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
              Tableau de bord TANKECH
            </p>
            <h1 className="text-2xl md:text-3xl font-black">Administration</h1>
            <p className="text-xs text-white/50 mt-1">
              Connecté en tant que {user.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadAllData}
              disabled={loadingData}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition"
            >
              <RefreshCw
                className={`h-4 w-4 ${loadingData ? "animate-spin" : ""}`}
              />
              Actualiser
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-500 transition"
            >
              <LogOut className="h-4 w-4" /> Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 mt-8">
        {apiError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            type="button"
            onClick={() => setTab("quotes")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              tab === "quotes"
                ? "bg-gray-900 text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <FileText className="h-4 w-4" />
            Devis ({quotes.length})
            {newCount > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                {newCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("projects")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              tab === "projects"
                ? "bg-gray-900 text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            Projets ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("testimonials")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition ${
              tab === "testimonials"
                ? "bg-gray-900 text-white shadow"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
            }`}
          >
            <MessageSquareQuote className="h-4 w-4" />
            Témoignages ({testimonials.length})
          </button>
        </div>

        {/* QUOTES TAB */}
        {tab === "quotes" && (
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Total Devis
                </p>
                <p className="mt-2 text-3xl font-black text-gray-900">
                  {quotes.length}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-red-500 uppercase">
                  Nouveaux
                </p>
                <p className="mt-2 text-3xl font-black text-red-600">
                  {newCount}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-yellow-600 uppercase">
                  En cours
                </p>
                <p className="mt-2 text-3xl font-black text-yellow-600">
                  {inProgressCount}
                </p>
              </div>
              <div className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm">
                <p className="text-xs font-semibold text-green-600 uppercase">
                  Terminés
                </p>
                <p className="mt-2 text-3xl font-black text-green-600">
                  {doneCount}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Rechercher par nom, téléphone, ville, service…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
              />
              <select
                aria-label="Filtrer par statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700"
              >
                <option value="all">Tous les statuts</option>
                {(Object.keys(QUOTE_STATUS_LABELS) as QuoteStatus[]).map(
                  (st) => (
                    <option key={st} value={st}>
                      {QUOTE_STATUS_LABELS[st]}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Quotes list */}
            {filteredQuotes.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-100 p-12 text-center text-gray-400">
                Aucune demande de devis trouvée.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {q.name}
                          </h3>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE_CLASSES[q.status]}`}
                          >
                            {QUOTE_STATUS_LABELS[q.status]}
                          </span>
                          {q.category && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
                              {q.category}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-gray-400">
                          Reçu le{" "}
                          {new Date(q.createdAt).toLocaleString("fr-MA")}
                          {q.city ? ` • ${q.city}` : ""}
                        </p>
                        {q.services.length > 0 && (
                          <p className="mt-2 text-xs text-gray-600">
                            <strong>Services :</strong> {q.services.join(", ")}
                          </p>
                        )}
                        {q.message && (
                          <p className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 whitespace-pre-wrap">
                            {q.message}
                          </p>
                        )}
                      </div>

                      {/* Quick actions & status */}
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <a
                          href={`tel:${q.phone}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-yellow-100"
                        >
                          <Phone className="h-3.5 w-3.5" /> {q.phone}
                        </a>
                        <a
                          href={whatsappLink(
                            `Bonjour ${q.name}, merci pour votre demande de devis chez TANKECH.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:bg-green-600"
                        >
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                        {q.email && (
                          <a
                            href={`mailto:${q.email}`}
                            className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200"
                          >
                            <Mail className="h-3.5 w-3.5" /> Email
                          </a>
                        )}
                        <select
                          aria-label={`Statut du devis de ${q.name}`}
                          value={q.status}
                          disabled={savingId === q.id}
                          onChange={(e) =>
                            updateQuote(q.id, {
                              status: e.target.value as QuoteStatus,
                            })
                          }
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700"
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
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Internal notes */}
                    <div className="mt-4 flex gap-2 border-t border-gray-100 pt-4">
                      <input
                        type="text"
                        placeholder="Note interne (montant estimé, date de visite…)"
                        value={noteDrafts[q.id] ?? ""}
                        onChange={(e) =>
                          setNoteDrafts((prev) => ({
                            ...prev,
                            [q.id]: e.target.value,
                          }))
                        }
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-yellow-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={savingId === q.id}
                        onClick={() =>
                          updateQuote(q.id, { notes: noteDrafts[q.id] ?? "" })
                        }
                        className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-yellow-500 hover:text-gray-900 transition"
                      >
                        <Save className="h-3.5 w-3.5" /> Enregistrer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROJECTS TAB */}
        {tab === "projects" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <form
              onSubmit={handleCreateProject}
              className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-4 h-fit"
            >
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-yellow-500" /> Ajouter un Projet
              </h2>
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
                {servicesData.map((s) => (
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
              <input
                required
                type="text"
                placeholder="Image Après (ex: /services/renovation.jpg ou URL https://...)"
                value={newProject.afterImage}
                onChange={(e) =>
                  setNewProject({ ...newProject, afterImage: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
              />
              <input
                type="text"
                placeholder="Image Avant (optionnel)"
                value={newProject.beforeImage}
                onChange={(e) =>
                  setNewProject({ ...newProject, beforeImage: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
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
                Ajouter le projet
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              {projects.length === 0 ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Aucun projet dans Firestore (le site affiche actuellement
                    les 6 projets par défaut).
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
                        <h3 className="font-bold text-gray-900">{p.title}</h3>
                        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
                          {p.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{p.location}</p>
                      <p className="text-sm text-gray-600 mt-2">
                        {p.description}
                      </p>
                      <p className="text-xs text-gray-400 mt-2 break-all">
                        Image : {p.afterImage}
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

        {/* TESTIMONIALS TAB */}
        {tab === "testimonials" && (
          <div className="grid gap-8 lg:grid-cols-3">
            <form
              onSubmit={handleCreateTestimonial}
              className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm space-y-4 h-fit"
            >
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="h-5 w-5 text-yellow-500" /> Ajouter un
                Témoignage
              </h2>
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
                {servicesData.map((s) => (
                  <option key={s.slug} value={s.title}>
                    {s.title}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Note :</span>
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
                Ajouter le témoignage
              </button>
            </form>

            <div className="lg:col-span-2 space-y-4">
              {testimonials.length === 0 ? (
                <div className="rounded-2xl bg-white border border-gray-100 p-10 text-center">
                  <p className="text-sm text-gray-500 mb-4">
                    Aucun témoignage dans Firestore (le site affiche
                    actuellement les 6 témoignages par défaut).
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
                        <h3 className="font-bold text-gray-900">{t.name}</h3>
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
    </div>
  );
}
