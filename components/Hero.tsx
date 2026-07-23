"use client";

import { siteConfig, whatsappLink } from "@/data/siteConfig";
import { Phone, ChevronDown, Play } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function Hero() {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // autoplay blocked — user must interact first
      });
    }
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900">
      {/* Background video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
          videoLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Place your construction site video in /public/hero-video.mp4 */}
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Fallback gradient when no video */}
      {!videoLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900/30" />
      )}

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white/90">
          <span className="inline-block h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          Basé à {siteConfig.address} — {siteConfig.emergencyLabel}
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight text-white tracking-tight">
          Construisons
          <br />
          <span className="text-yellow-400">votre vision</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-lg md:text-xl text-white/80 leading-relaxed">
          Construction, rénovation, aménagement — TANKECH réalise vos projets
          avec expertise et engagement. Du gros œuvre aux finitions, un
          interlocuteur unique pour un résultat clé en main.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="/contact"
            className="w-full sm:w-auto rounded-xl bg-yellow-500 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg transition hover:bg-yellow-400 hover:shadow-xl active:scale-95"
          >
            Demander un Devis Gratuit
          </a>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-600 hover:shadow-xl active:scale-95"
          >
            <Phone className="h-5 w-5" /> WhatsApp
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 animate-bounce">
          <ChevronDown className="mx-auto h-8 w-8 text-white/40" />
        </div>
      </div>
    </section>
  );
}
