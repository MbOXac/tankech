export const siteConfig = {
  name: "TANKECH",
  tagline: "Construction · Rénovation · Aménagement",
  description:
    "TANKECH est une entreprise de construction, rénovation et aménagement basée à Tanger, Maroc. Gros œuvre, plomberie, électricité, peinture, bricolage — intervention rapide et garantie décennale.",

  // ---- Contact ----
  phone: "+212 6 75 88 21 37",
  phoneRaw: "+212675882137",
  whatsapp: "212675882137",
  whatsappMessage: "Bonjour TANKECH, je souhaite demander un devis.",
  email: "said.elbaghdadi16@gmail.com",
  address: "Tanger, Maroc",

  // ---- Media ----
  heroVideo: "", // Placez votre vidéo dans public/hero-video.mp4 puis indiquez "/hero-video.mp4"

  // ---- Social ----
  instagram: "https://instagram.com/tankech",
  facebook: "https://facebook.com/tankech",
  linkedin: "https://linkedin.com/company/tankech",

  // ---- SEO / Open Graph ----
  url: "https://tankech.ma",
  ogImage: "/og-image.jpg",

  // ---- Emergency ----
  emergencyAvailable: true,
  emergencyLabel: "Urgence 24/7",

  // ---- Legal ----
  rc: "", // ← Renseignez votre numéro de Registre de Commerce (ex: "RC Tanger 123456")
  ice: "", // ← Renseignez votre numéro ICE
};

// Helper — WhatsApp deep-link (digits only, no "+" or spaces)
export function whatsappLink(message?: string) {
  const digits = siteConfig.whatsapp.replace(/\D/g, "");
  const msg = encodeURIComponent(message ?? siteConfig.whatsappMessage);
  return `https://wa.me/${digits}?text=${msg}`;
}
