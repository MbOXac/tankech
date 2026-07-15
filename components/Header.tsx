"use client";

import Link from "next/link";
import { Menu, X, Phone } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-primary/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-serif font-bold text-2xl text-primary tracking-tight">TANKECH</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link href="/" className="text-text-primary hover:text-accent transition-colors">Accueil</Link>
            <Link href="/services" className="text-text-primary hover:text-accent transition-colors">Services</Link>
            <Link href="/about" className="text-text-primary hover:text-accent transition-colors">À Propos</Link>
            <Link href="/contact" className="text-text-primary hover:text-accent transition-colors">Contact</Link>
          </nav>

          <div className="hidden md:flex items-center">
            <a href="tel:+21200000000" className="flex items-center gap-2 bg-primary text-background px-6 py-2.5 rounded hover:bg-primary/90 transition-colors font-medium">
              <Phone size={18} />
              <span>Demander un devis</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-primary" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-primary/10 flex flex-col gap-4">
            <Link href="/" className="text-text-primary block font-medium" onClick={() => setIsOpen(false)}>Accueil</Link>
            <Link href="/services" className="text-text-primary block font-medium" onClick={() => setIsOpen(false)}>Services</Link>
            <Link href="/about" className="text-text-primary block font-medium" onClick={() => setIsOpen(false)}>À Propos</Link>
            <Link href="/contact" className="text-text-primary block font-medium" onClick={() => setIsOpen(false)}>Contact</Link>
            <a href="tel:+21200000000" className="flex items-center justify-center gap-2 bg-primary text-background px-6 py-2.5 rounded mt-4 font-medium">
              <Phone size={18} />
              <span>Demander un devis</span>
            </a>
          </div>
        )}
      </div>
    </header>
  );
}
