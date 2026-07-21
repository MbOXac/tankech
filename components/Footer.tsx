import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary text-background pt-20 pb-10 border-t-4 border-accent">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div>
            <Link href="/" className="inline-block mb-6">
              <span className="font-serif font-bold text-3xl text-accent tracking-tight">TANKECH</span>
            </Link>
            <p className="text-background/70 mb-6 leading-relaxed">
              Votre partenaire de confiance pour la construction, la rénovation et le bricolage à domicile à Tanger. Qualité premium et service réactif.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-colors font-bold text-sm">
                FB
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-colors font-bold text-sm">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-accent hover:text-primary transition-colors font-bold text-sm">
                IN
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-xl mb-6 text-white">Services</h3>
            <ul className="space-y-3">
              <li><Link href="/services#gros-oeuvre" className="text-background/70 hover:text-accent transition-colors">Gros Œuvre</Link></li>
              <li><Link href="/services#renovation" className="text-background/70 hover:text-accent transition-colors">Rénovation Complète</Link></li>
              <li><Link href="/services#plomberie" className="text-background/70 hover:text-accent transition-colors">Plomberie</Link></li>
              <li><Link href="/services#electricite" className="text-background/70 hover:text-accent transition-colors">Électricité</Link></li>
              <li><Link href="/services#bricolage" className="text-background/70 hover:text-accent transition-colors">Bricolage à domicile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-xl mb-6 text-white">Entreprise</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-background/70 hover:text-accent transition-colors">À Propos</Link></li>
              <li><Link href="/realisations" className="text-background/70 hover:text-accent transition-colors">Nos Réalisations</Link></li>
              <li><Link href="/contact" className="text-background/70 hover:text-accent transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-background/70 hover:text-accent transition-colors">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-xl mb-6 text-white">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-accent shrink-0 mt-1" size={20} />
                <span className="text-background/70">Avenue Principale, Centre-ville<br />Tanger, Maroc</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-accent shrink-0" size={20} />
                <a href="tel:+212 675-882137" className="text-background/70 hover:text-accent transition-colors">+212 6 75 88 21 37</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-accent shrink-0" size={20} />
                <a href="mailto:contact@tankech.ma" className="text-background/70 hover:text-accent transition-colors">contact@tankech.ma</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            &copy; {new Date().getFullYear()} TANKECH. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/mentions-legales" className="text-background/50 hover:text-white transition-colors">Mentions Légales</Link>
            <Link href="/confidentialite" className="text-background/50 hover:text-white transition-colors">Politique de Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
