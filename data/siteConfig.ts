export const siteConfig = {
  name: "TANKECH",
  tagline: "Construction · Rénovation · Aménagement",
  description:
    "TANKECH est une entreprise de construction, rénovation et aménagement basée à Tanger, Maroc. Gros œuvre, plomberie, électricité, peinture, bricolage — intervention rapide et garantie décennale.",

  // ---- Contact ----
  phone: "+212 6 64 82 53 83",
  phoneRaw: "+212664825383",
  whatsapp: "212664825383",
  whatsappMessage: "Bonjour TANKECH, je souhaite demander un devis.",
  email: "said.elbaghdadi16@gmail.com",
  address: "Tanger, Maroc",

  // ---- Media ----
  logo: "/logo.png",
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

// Normalize phone numbers (especially Moroccan 06/07/05 numbers) to international digits
export function normalizePhoneDigits(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  if (digits.length === 10 && /^0[567]/.test(digits)) {
    digits = `212${digits.slice(1)}`;
  } else if (digits.length === 9 && /^[567]/.test(digits)) {
    digits = `212${digits}`;
  }
  return digits;
}

// Helper — WhatsApp deep-link to TANKECH company number (for public visitors)
export function whatsappLink(message?: string) {
  const digits = normalizePhoneDigits(siteConfig.whatsapp);
  const msg = encodeURIComponent(message ?? siteConfig.whatsappMessage);
  return `https://wa.me/${digits}?text=${msg}`;
}

// Helper — WhatsApp deep-link to a specific client or worker phone number (for admin)
export function whatsappLinkForPhone(phone: string, message?: string) {
  const digits = normalizePhoneDigits(phone);
  if (!digits) return "#";
  return message
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${digits}`;
}

// Helper — E.164 tel: link for a specific client or worker phone number
export function telLinkForPhone(phone: string) {
  const digits = normalizePhoneDigits(phone);
  return digits ? `tel:+${digits}` : `tel:${phone}`;
}
