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
  beforeImage: string;
  afterImage: string;
  featured: boolean;
}

export const projectsData: Project[] = [
  {
    id: "villa-malabata",
    title: "Villa Malabata",
    category: "Gros Œuvre",
    categorySlug: "gros-oeuvre",
    location: "Tanger, Malabata",
    description:
      "Construction complète d'une villa de 350 m² avec piscine, fondations profondes et finitions haut de gamme.",
    beforeImage: "/projects/villa-malabata-avant.jpg",
    afterImage: "/projects/villa-malabata-apres.jpg",
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
    beforeImage: "/projects/appart-centre-avant.jpg",
    afterImage: "/projects/appart-centre-apres.jpg",
    featured: true,
  },
  {
    id: "riad-medina",
    title: "Restauration Riad Médina",
    category: "Rénovation",
    categorySlug: "renovation",
    location: "Tanger, Médina",
    description:
      "Restauration authentique d'un riad historique avec tadelakt, zellige et bois de cèdre.",
    beforeImage: "/projects/riad-medina-avant.jpg",
    afterImage: "/projects/riad-medina-apres.jpg",
    featured: true,
  },
  {
    id: "bureau-guerrab",
    title: "Aménagement Bureaux Guerrab",
    category: "Rénovation",
    categorySlug: "renovation",
    location: "Tanger, Guerrab",
    description:
      "Transformation d'un local commercial en espace bureaux moderne avec climatisation et domotique.",
    beforeImage: "/projects/bureau-guerrab-avant.jpg",
    afterImage: "/projects/bureau-guerrab-apres.jpg",
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
    beforeImage: "/projects/maison-iondi-avant.jpg",
    afterImage: "/projects/maison-iondi-apres.jpg",
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
    beforeImage: "/projects/plomb-charf-avant.jpg",
    afterImage: "/projects/plomb-charf-apres.jpg",
    featured: false,
  },
];

export const getFeaturedProjects = () =>
  projectsData.filter((p) => p.featured);

export const getProjectByCategory = (slug: string) =>
  projectsData.filter((p) => p.categorySlug === slug);
