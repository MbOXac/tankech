// ============================================================
// TANKECH — Testimonials data
// ============================================================

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  text: string;
  rating: number; // 1-5
  service: string;
  avatar?: string;
}

export const testimonialsData: Testimonial[] = [
  {
    id: "t1",
    name: "Mohammed B.",
    role: "Propriétaire Villa",
    location: "Malabata, Tanger",
    text: "TANKECH a construit notre villa de A à Z. Travail impeccable, respect des délais et budget respecté. La garantie décennale nous rassure énormément. Je recommande les yeux fermés !",
    rating: 5,
    service: "Gros Œuvre",
  },
  {
    id: "t2",
    name: "Fatima Z.",
    role: "Propriétaire Appartement",
    location: "Centre-Ville, Tanger",
    text: "Rénovation complète de notre appartement en seulement 6 semaines. Le résultat dépasse nos attentes — la cuisine ouverte est magnifique et la salle de bain italienne est un rêve devenu réalité.",
    rating: 5,
    service: "Rénovation",
  },
  {
    id: "t3",
    name: "Karim E.",
    role: "Gérant SARL",
    location: "Guerrab, Tanger",
    text: "Intervention rapide pour une urgence plomberie un dimanche soir. Le technicien est arrivé en 45 minutes et a tout résolu. Service 24/7 vraiment efficace et professionnel.",
    rating: 5,
    service: "Plomberie",
  },
  {
    id: "t4",
    name: "Amina R.",
    role: "Propriétaire Riad",
    location: "Médina, Tanger",
    text: "Le tadelakt dans notre riad est un vrai chef-d'œuvre. Les artisans de TANKECH maîtrisent parfaitement les techniques traditionnelles marocaines. Un travail d'art !",
    rating: 5,
    service: "Peinture & Finitions",
  },
  {
    id: "t5",
    name: "Youssef M.",
    role: "Ingénieur",
    location: "Iondi, Tanger",
    text: "Installation électrique complète avec domotique. L'équipe est compétente, propre et explique tout clairement. Le tableau électrique est impeccable et aux normes.",
    rating: 4,
    service: "Électricité",
  },
  {
    id: "t6",
    name: "Rachid T.",
    role: "Restaurateur",
    location: "Charf, Tanger",
    text: "Montage de notre restaurant en un temps record. Du carrelage à la peinture en passant par la plomberie professionnelle, TANKECH a tout géré. Un vrai partenaire !",
    rating: 5,
    service: "Bricolage & Maintenance",
  },
];
