"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import {
  CHANTIER_STATUS_LABELS,
  type ChantierPhoto,
  type ChantierStatus,
} from "@/lib/types";
import {
  Lock,
  ShieldCheck,
  MapPin,
  Calendar,
  Phone,
  MessageCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Camera,
  X,
} from "lucide-react";

interface PublicChantier {
  name: string;
  clientName: string;
  location: string;
  category: string;
  status: ChantierStatus;
  progress: number;
  startDate: string;
  endDate: string;
  photos: ChantierPhoto[];
  updatedAt: string;
}

const MILESTONES = [
  { label: "Préparation", min: 0 },
  { label: "Gros Œuvre", min: 25 },
  { label: "Second Œuvre", min: 55 },
  { label: "Finitions", min: 80 },
  { label: "Livraison", min: 100 },
];

export default function ClientTrackingView({ code }: { code: string }) {
  const [checking, setChecking] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [pin, setPin] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [chantier, setChantier] = useState<PublicChantier | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<ChantierPhoto | null>(
    null
  );

  useEffect(() => {
    let active = true;
    fetch(`/api/suivi/${encodeURIComponent(code)}`)
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          exists?: boolean;
          error?: string;
        };
        if (!active) return;
        if (!res.ok || !data.exists) {
          setLinkError(
            data.error || "Ce lien de suivi est invalide ou désactivé."
          );
        }
        setChecking(false);
      })
      .catch(() => {
        if (active) {
          setLinkError("Impossible de vérifier ce lien de suivi.");
          setChecking(false);
        }
      });

    return () => {
      active = false;
    };
  }, [code]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    setPinError(null);
    try {
      const res = await fetch(`/api/suivi/${encodeURIComponent(code)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: pin.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        chantier?: PublicChantier;
        error?: string;
      };
      if (!res.ok || !data.chantier) {
        setPinError(data.error || "Code PIN incorrect.");
        return;
      }
      setChantier(data.chantier);
    } catch {
      setPinError("Erreur de connexion. Réessayez.");
    } finally {
      setUnlocking(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4]">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (linkError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-4">
        <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 inline-flex rounded-2xl bg-stone-50 p-3">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={90}
              height={77}
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black text-[#0B1F44]">
            Lien indisponible
          </h1>
          <p className="mt-2 text-sm text-gray-500">{linkError}</p>
          <div className="mt-6 flex flex-col gap-2">
            <a
              href={whatsappLink(
                "Bonjour TANKECH, j'ai besoin d'un nouveau lien de suivi pour mon chantier."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white hover:bg-green-600 transition"
            >
              <MessageCircle className="h-4 w-4" /> Contacter TANKECH
            </a>
            <Link
              href="/"
              className="text-xs font-semibold text-gray-400 hover:text-gray-700 mt-2"
            >
              Retour au site TANKECH
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Step 1: Private PIN Gate
  if (!chantier) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAF8F4] to-stone-100 px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white border border-stone-200/80 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-stone-50 border border-stone-100 px-4 py-3">
              <Image
                src={siteConfig.logo}
                alt={siteConfig.name}
                width={100}
                height={85}
                className="h-14 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
              <Lock className="h-3.5 w-3.5" /> Espace Client Sécurisé
            </div>
            <h1 className="mt-3 text-2xl font-black text-[#0B1F44]">
              Suivi de votre chantier
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Saisissez le code PIN à 4 chiffres transmis par votre chef de
              projet TANKECH.
            </p>
          </div>

          {pinError && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {pinError}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              required
              type="password"
              inputMode="numeric"
              pattern="[0-9]{4,6}"
              maxLength={6}
              autoFocus
              aria-label="Code PIN client"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-2xl border-2 border-stone-200 bg-stone-50 px-4 py-4 text-center text-2xl font-black tracking-[0.5em] text-[#0B1F44] focus:border-amber-500 focus:bg-white focus:outline-none transition"
            />
            <button
              type="submit"
              disabled={unlocking || pin.length < 4}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0B1F44] py-4 text-sm font-bold text-white shadow-lg hover:bg-gray-900 transition disabled:opacity-50"
            >
              {unlocking ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Vérification…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-yellow-400" /> Accéder à
                  mon suivi
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-gray-400">
            Code oublié ?{" "}
            <a
              href={whatsappLink(
                "Bonjour TANKECH, pouvez-vous me renvoyer mon code PIN de suivi de chantier ?"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-amber-700 hover:underline"
            >
              Demander sur WhatsApp
            </a>
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Unlocked VIP Client Progress Portal
  const statusLabel =
    CHANTIER_STATUS_LABELS[chantier.status] ?? chantier.status;

  return (
    <div className="min-h-screen bg-[#FAF8F4] pb-16">
      {/* Clean VIP Top Bar */}
      <header className="border-b border-stone-200 bg-white/95 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <Image
              src={siteConfig.logo}
              alt={siteConfig.name}
              width={64}
              height={55}
              className="h-9 w-auto object-contain"
            />
            <div className="hidden sm:block border-l border-stone-200 pl-3">
              <p className="text-xs font-extrabold text-[#0B1F44]">
                Suivi de Chantier Privé
              </p>
              <p className="text-[11px] text-gray-400">
                Mis à jour le{" "}
                {new Date(chantier.updatedAt).toLocaleDateString("fr-MA")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${siteConfig.phoneRaw}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0B1F44] hover:bg-stone-50 transition"
            >
              <Phone className="h-3.5 w-3.5 text-amber-600" /> Appeler
            </a>
            <a
              href={whatsappLink(
                `Bonjour TANKECH, j'ai une question concernant mon chantier : ${chantier.name}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white hover:bg-green-600 transition"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pt-8 space-y-6">
        {/* Main Progress Hero Card */}
        <section className="rounded-3xl bg-white border border-stone-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              {chantier.clientName && (
                <p className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-1">
                  Bonjour {chantier.clientName}
                </p>
              )}
              <h1 className="text-2xl sm:text-3xl font-black text-[#0B1F44]">
                {chantier.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  {chantier.location}
                </span>
                {chantier.category && (
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-semibold text-gray-700">
                    {chantier.category}
                  </span>
                )}
                {chantier.startDate && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    Début : {chantier.startDate}
                  </span>
                )}
                {chantier.endDate && (
                  <span>Livraison estimée : {chantier.endDate}</span>
                )}
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-4 py-1.5 text-xs font-extrabold text-amber-900">
              <CheckCircle2 className="h-3.5 w-3.5" /> {statusLabel}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 rounded-2xl bg-[#0B1F44] p-6 text-white">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  Avancement global des travaux
                </p>
                <p className="text-sm text-white/80 mt-0.5">
                  Actualisé directement par votre chef de chantier
                </p>
              </div>
              <span className="text-4xl font-black text-yellow-400 tabular-nums">
                {chantier.progress}%
              </span>
            </div>

            <div className="h-3.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700"
                style={{ width: `${chantier.progress}%` }}
              />
            </div>

            {/* Milestones */}
            <div className="mt-5 grid grid-cols-5 gap-1 text-center">
              {MILESTONES.map((m) => {
                const reached = chantier.progress >= m.min;
                return (
                  <div key={m.label} className="space-y-1">
                    <div
                      className={`mx-auto h-2 w-2 rounded-full ${
                        reached ? "bg-yellow-400" : "bg-white/25"
                      }`}
                    />
                    <p
                      className={`text-[10px] sm:text-xs font-semibold ${
                        reached ? "text-white" : "text-white/40"
                      }`}
                    >
                      {m.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Progress Photos Gallery */}
        <section className="rounded-3xl bg-white border border-stone-200/80 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-black text-[#0B1F44] flex items-center gap-2">
              <Camera className="h-5 w-5 text-amber-600" />
              Photos d&apos;avancement ({chantier.photos.length})
            </h2>
          </div>

          {chantier.photos.length === 0 ? (
            <div className="rounded-2xl bg-stone-50 border border-stone-100 p-10 text-center text-sm text-gray-500">
              Les premières photos de votre chantier seront publiées ici dès le
              démarrage des étapes.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {chantier.photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxPhoto(photo)}
                  className="group text-left overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 shadow-xs hover:shadow-lg transition"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.caption || photo.stage || chantier.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {photo.stage && (
                      <span className="absolute top-3 left-3 rounded-lg bg-[#0B1F44]/85 px-2.5 py-1 text-[11px] font-bold text-yellow-400 backdrop-blur-sm">
                        {photo.stage}
                      </span>
                    )}
                  </div>
                  <div className="p-3.5">
                    <p className="text-sm font-bold text-gray-900">
                      {photo.caption || photo.stage || "Avancement chantier"}
                    </p>
                    {photo.date && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        {photo.date}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Photo Lightbox */}
      {lightboxPhoto && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setLightboxPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setLightboxPhoto(null)}
            aria-label="Fermer"
            className="absolute top-4 right-4 rounded-full bg-white/15 p-2.5 text-white hover:bg-white/25"
          >
            <X className="h-6 w-6" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full overflow-hidden rounded-2xl bg-gray-950 shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxPhoto.url}
              alt={lightboxPhoto.caption || lightboxPhoto.stage}
              className="max-h-[75vh] w-full object-contain bg-black"
            />
            <div className="p-4 text-white flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-sm">
                  {lightboxPhoto.stage}
                  {lightboxPhoto.caption ? ` — ${lightboxPhoto.caption}` : ""}
                </p>
                {lightboxPhoto.date && (
                  <p className="text-xs text-white/50">{lightboxPhoto.date}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
