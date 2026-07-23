"use client";

import Link from "next/link";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import { servicesData } from "@/data/servicesData";
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  ArrowUp,
} from "lucide-react";

// Inline SVGs for social icons (lucide-react removed branded icons)
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Footer() {
  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-gray-950 text-white">
      {/* CTA banner */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <h3 className="text-2xl md:text-3xl font-black">
              Prêt à construire votre projet ?
            </h3>
            <p className="mt-2 text-white/60">
              Demandez un devis gratuit — réponse sous 24h.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/contact"
              className="rounded-xl bg-yellow-500 px-8 py-3 text-base font-bold text-gray-900 shadow transition hover:bg-yellow-400 hover:shadow-lg active:scale-95"
            >
              Demander un Devis
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-8 py-3 text-base font-bold text-white shadow transition hover:bg-green-600"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div>
            <h4 className="text-2xl font-black tracking-tight">TANKECH</h4>
            <p className="mt-3 text-sm text-white/50 leading-relaxed">
              {siteConfig.description}
            </p>
            {/* Social */}
            <div className="mt-6 flex gap-3">
              {siteConfig.instagram && (
                <a
                  href={siteConfig.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-yellow-500 hover:text-gray-900 transition"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              )}
              {siteConfig.facebook && (
                <a
                  href={siteConfig.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-yellow-500 hover:text-gray-900 transition"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
              )}
              {siteConfig.linkedin && (
                <a
                  href={siteConfig.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 text-white/50 hover:bg-yellow-500 hover:text-gray-900 transition"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">
              Services
            </h5>
            <ul className="space-y-2.5">
              {servicesData.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/services#${s.slug}`}
                    className="text-sm text-white/50 hover:text-yellow-400 transition"
                  >
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">
              Liens Rapides
            </h5>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="text-sm text-white/50 hover:text-yellow-400 transition">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-white/50 hover:text-yellow-400 transition">
                  Nos Services
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-white/50 hover:text-yellow-400 transition">
                  À Propos
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/50 hover:text-yellow-400 transition">
                  Contact & Devis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white/80 mb-4">
              Contact
            </h5>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-white/50">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
                {siteConfig.address}
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phoneRaw}`}
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-yellow-400 transition"
                >
                  <Phone className="h-4 w-4 shrink-0 text-yellow-500" />
                  {siteConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-3 text-sm text-white/50 hover:text-yellow-400 transition"
                >
                  <Mail className="h-4 w-4 shrink-0 text-yellow-500" />
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} TANKECH. Tous droits réservés.{" "}
            {siteConfig.rc} — ICE : {siteConfig.ice}
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1 text-xs text-white/30 hover:text-yellow-400 transition"
          >
            <ArrowUp className="h-3.5 w-3.5" /> Retour en haut
          </button>
        </div>
      </div>
    </footer>
  );
}
