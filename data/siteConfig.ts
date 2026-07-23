export const siteConfig = {
  name: "TANKECH",
  tagline: "Construction · Rénovation · Aménagement",
  description:
    "TANKECH est une entreprise de construction, rénovation et aménagement basée à Tanger, Maroc. Gros œuvre, plomberie, électricité, peinture, bricolage — intervention rapide et garantie décennale.",

  // ---- Contact ----
  phone: "+212 6 75 88 21 37", 
  phoneRaw: "212600000000", 
   whatsapp: "+212675882137", 
  whatsappMessage: "Bonjour TANKECH, je souhaite demander un devis.",
  email: "said.elbaghdadi16@gmail.com",
  address: "Tanger, Maroc",

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
  rc: "RC Tanger XXXXXX", // ← Registre de commerce
  ice: "00XXXXXXX000XXX", // ← ICE number
};

// Helper — WhatsApp deep-link
export function whatsappLink(message?: string) {
  const msg = encodeURIComponent(message ?? siteConfig.whatsappMessage);
  return `https://wa.me/${siteConfig.whatsapp}?text=${msg}`;
}
