"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import { Menu, X, Phone, MessageCircle } from "lucide-react";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "À Propos" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100"
          : "bg-transparent"
      }`}
    >
      {/* Top bar — emergency & quick contact */}
      <div
        className={`hidden md:block transition-all duration-300 ${
          scrolled ? "h-0 overflow-hidden opacity-0" : "h-9 opacity-100"
        } bg-gray-900 text-white`}
      >
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs">
          <div className="flex items-center gap-4">
            {siteConfig.emergencyAvailable && (
              <span className="flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 font-semibold uppercase tracking-wide">
                🔴 {siteConfig.emergencyLabel}
              </span>
            )}
            <a
              href={`tel:${siteConfig.phoneRaw}`}
              className="flex items-center gap-1 hover:text-yellow-400 transition"
            >
              <Phone className="h-3 w-3" /> {siteConfig.phone}
            </a>
          </div>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-green-400 transition"
          >
            <MessageCircle className="h-3 w-3" /> WhatsApp
          </a>
        </div>
      </div>

      {/* Main nav */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className={`text-2xl font-black tracking-tight transition-colors duration-300 ${
              scrolled ? "text-gray-900" : "text-white"
            }`}
          >
            TANKECH
          </span>
          <span
            className={`hidden sm:inline text-xs font-medium transition-colors duration-300 ${
              scrolled ? "text-gray-500" : "text-white/70"
            }`}
          >
            {siteConfig.tagline}
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-yellow-500 ${
                scrolled ? "text-gray-700" : "text-white/90"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-lg bg-yellow-500 px-5 py-2.5 text-sm font-bold text-gray-900 shadow transition hover:bg-yellow-400 hover:shadow-lg active:scale-95"
          >
            Demander un Devis
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden p-2 transition-colors ${
            scrolled ? "text-gray-900" : "text-white"
          }`}
          aria-label="Menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl">
          <div className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 px-2 text-gray-800 font-medium hover:text-yellow-600 border-b border-gray-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-3 text-center rounded-lg bg-yellow-500 px-5 py-3 font-bold text-gray-900 shadow hover:bg-yellow-400"
            >
              Demander un Devis
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-2 text-center rounded-lg bg-[#25D366] px-5 py-3 font-bold text-white shadow hover:bg-green-600 flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" /> WhatsApp
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
