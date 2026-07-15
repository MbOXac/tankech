import ServicesGrid from "@/components/ServicesGrid";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Nos Services | TANKECH Tanger",
  description: "Découvrez tous les services de TANKECH : gros œuvre, rénovation, plomberie, électricité et bricolage à domicile à Tanger.",
};

export default function ServicesPage() {
  return (
    <>
      <div className="pt-24 pb-12 bg-primary text-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-5xl font-serif font-bold mb-6">Nos Services</h1>
          <p className="text-xl text-background/80">
            Une expertise complète pour tous vos projets de construction et de bricolage à Tanger.
          </p>
        </div>
      </div>
      
      <ServicesGrid />

      <section className="py-20 bg-accent text-primary text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold mb-6">Un projet spécifique en tête ?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Nous proposons également des services sur-mesure. N'hésitez pas à nous contacter pour en discuter.
          </p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-primary text-background px-8 py-4 rounded font-bold text-lg hover:bg-primary/90 transition-colors">
            Demander un devis personnalisé
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
