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

// ---- Chantiers (Construction Sites) ----
export type ChantierStatus =
  | "planifie"
  | "en_cours"
  | "en_pause"
  | "termine"
  | "annule";

export const CHANTIER_STATUS_LABELS: Record<ChantierStatus, string> = {
  planifie: "Planifié",
  en_cours: "En cours",
  en_pause: "En pause",
  termine: "Terminé",
  annule: "Annulé",
};

export interface ChantierPhoto {
  id: string;
  url: string;
  caption: string;
  stage: string;
  date: string;
}

export interface ChantierRecord {
  id: string;
  name: string;
  clientName: string;
  clientPhone: string;
  location: string;
  category: string;
  status: ChantierStatus;
  progress: number; // 0-100
  budget: number; // MAD
  spent: number; // MAD
  startDate: string;
  endDate: string;
  assignedWorkerIds: string[];
  photos: ChantierPhoto[];
  trackingCode?: string;
  trackingPin?: string;
  trackingEnabled?: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Workers & Daily Attendance (Ouvriers & Pointage) ----
export const WORKER_SPECIALTIES = [
  "Chef de chantier",
  "Maçon",
  "Plombier",
  "Électricien",
  "Peintre / Tadelakt",
  "Applicateur Époxy",
  "Carreleur",
  "Menuisier",
  "Ferrailleur",
  "Plâtrier / Placo",
  "Manœuvre",
  "Autre",
] as const;

export interface WorkerRecord {
  id: string;
  name: string;
  phone: string;
  cin: string;
  specialty: string;
  dailyRate: number; // MAD / jour
  active: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type AttendanceStatus = "present" | "demi_journee" | "absent" | "conge";

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Présent (1j)",
  demi_journee: "Demi-journée (0.5j)",
  absent: "Absent",
  conge: "Congé",
};

export const ATTENDANCE_MULTIPLIER: Record<AttendanceStatus, number> = {
  present: 1,
  demi_journee: 0.5,
  absent: 0,
  conge: 0,
};

export interface AttendanceRecord {
  id: string; // `${date}_${workerId}`
  date: string; // YYYY-MM-DD
  workerId: string;
  workerName: string;
  chantierId: string;
  chantierName: string;
  status: AttendanceStatus;
  dailyRate: number;
  amount: number;
  notes: string;
  updatedAt: string;
}

// ---- Expenses / Site Costs (Dépenses & Matériaux) ----
export const EXPENSE_CATEGORIES = [
  "Matériaux",
  "Main d'œuvre",
  "Transport",
  "Location matériel",
  "Sous-traitance",
  "Équipement / Outillage",
  "Autre",
] as const;

export interface ExpenseRecord {
  id: string;
  chantierId: string;
  chantierName: string;
  category: string;
  description: string;
  amount: number; // MAD
  date: string; // YYYY-MM-DD
  supplier: string;
  createdAt: string;
}
