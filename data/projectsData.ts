// ============================================================
// TANKECH — Projects / Portfolio data
// ============================================================

export interface Project {
  id: string;
  title: string;
  category: string;
  categorySlug: string;
  location: string;
  description: string;
  beforeImage?: string;
  afterImage: string;
  featured: boolean;
}

// Note: Remplacez les images par vos propres photos avant/après dans /public/projects/
// dès qu'elles seront disponibles.
export const projectsData: Project[] = [
  {
    id: "villa-malabata",
    title: "Villa Malabata",
    category: "Gros Œuvre",
    categorySlug: "gros-oeuvre",
    location: "Tanger, Malabata",
    description:
      "Construction complète d'une villa de 350 m² avec piscine, fondations profondes et finitions haut de gamme.",
    afterImage: "/og-image.jpg",
    featured: true,
  },
  {
    id: "appartement-centre",
    title: "Rénovation Appartement Centre-Ville",
    category: "Rénovation",
    categorySlug: "renovation",
    location: "Tanger, Centre-Ville",
    description:
      "Rénovation totale d'un appartement de 120 m² : cuisine ouverte, salle de bain italienne, open space lumineux.",
    afterImage: "/services/renovation.jpg",
    featured: true,
  },
  {
    id: "riad-medina",
    title: "Restauration Riad Médina",
    category: "Peinture & Finitions",
    categorySlug: "peinture",
    location: "Tanger, Médina",
    description:
      "Restauration authentique d'un riad historique avec tadelakt, zellige et bois de cèdre.",
    afterImage: "/services/peinture.jpg",
    featured: true,
  },
  {
    id: "bureau-guerrab",
    title: "Aménagement Bureaux Guerrab",
    category: "Électricité",
    categorySlug: "electricite",
    location: "Tanger, Guerrab",
    description:
      "Transformation d'un local commercial en espace bureaux moderne avec climatisation et domotique.",
    afterImage: "/services/electricite.jpg",
    featured: false,
  },
  {
    id: "maison-iondi",
    title: "Construction Maison Iondi",
    category: "Gros Œuvre",
    categorySlug: "gros-oeuvre",
    location: "Tanger, Iondi",
    description:
      "Maison R+2 de 250 m² avec terrasse panoramique, étanchéité et finitions soignées.",
    afterImage: "/services/gros-oeuvre.jpg",
    featured: false,
  },
  {
    id: "plomb-charf",
    title: "Dépannage Plomberie Charf",
    category: "Plomberie",
    categorySlug: "plomberie",
    location: "Tanger, Charf",
    description:
      "Intervention urgente pour fuite importante — recherche de fuite, réparation et remise aux normes.",
    afterImage: "/services/plomberie.jpg",
    featured: false,
  },
];

export const getFeaturedProjects = () =>
  projectsData.filter((p) => p.featured);

export const getProjectByCategory = (slug: string) =>
  projectsData.filter((p) => p.categorySlug === slug);
