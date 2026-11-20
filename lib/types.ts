export type QuoteStatus =
  | "nouveau"
  | "contacte"
  | "devis_envoye"
  | "termine"
  | "archive";

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  nouveau: "Nouveau",
  contacte: "Contacté",
  devis_envoye: "Devis envoyé",
  termine: "Terminé",
  archive: "Archivé",
};

export interface QuoteRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  services: string[];
  city: string;
  message: string;
  status: QuoteStatus;
  notes: string;
  source: "contact_page" | "quote_modal";
  createdAt: string;
  updatedAt: string;
}

export interface QuotePayload {
  name: string;
  phone: string;
  email?: string;
  category?: string;
  services?: string[];
  city?: string;
  message?: string;
  source?: "contact_page" | "quote_modal";
  website?: string; // honeypot field
}
