export interface ServiceCategory {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: "Home" | "Ruler" | "Wrench" | "Zap" | "Paintbrush" | "Hammer";
  image: string;
  badge?: {
    text: string;
    type: "urgent" | "warranty" | "popular" | "quality";
  };
  items: string[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: "gros-oeuvre",
    title: "Gros Œuvre",
    shortDescription: "Fondations, maçonnerie, dalles et structures solides pour vos projets de construction à Tanger.",
    fullDescription: "Nous prenons en charge tous vos travaux de gros œuvre, de la préparation des fondations au coulage des dalles en béton armé, pour garantir la stabilité et la pérennité de votre bâtiment.",
    iconName: "Home",
    image: "/services/gros-oeuvre.jpg",
    badge: {
      text: "Garantie Décennale",
      type: "warranty"
    },
    items: [
      "Terrassement et fondations",
      "Maçonnerie générale (murs porteurs, cloisons)",
      "Coulage de dalles en béton armé",
      "Charpente et toiture",
      "Étanchéité et isolation thermique",
      "Construction de piscines et bassins",
      "Travaux de démolition contrôlée"
    ]
  },
  {
    id: "renovation",
    title: "Rénovation",
    shortDescription: "Transformation et modernisation de vos appartements, villas, cuisines et salles de bain.",
    fullDescription: "Spécialistes de la rénovation intégrale ou partielle à Tanger, nous modernisons vos espaces intérieurs et extérieurs selon vos envies et vos contraintes de budget.",
    iconName: "Ruler",
    image: "/services/renovation.jpg",
    badge: {
      text: "Projet Clés en Main",
      type: "popular"
    },
    items: [
      "Rénovation complète d'appartement ou de villa",
      "Rénovation de salle de bain (douche à l'italienne, receveur, faïence)",
      "Rénovation de cuisine (agencement, plan de travail, crédence)",
      "Extension de maison (surélévation, annexe)",
      "Aménagement de combles et de terrasses",
      "Rénovation de façade",
      "Transformation d'espaces (open space, cloisons amovibles)"
    ]
  },
  {
    id: "plomberie",
    title: "Plomberie",
    shortDescription: "Installation sanitaire, recherche de fuite, chauffe-eau et dépannage rapide 24h/7j.",
    fullDescription: "Nos plombiers qualifiés interviennent rapidement pour l'installation, la maintenance et le dépannage urgent de tous vos réseaux d'eau et climatisation.",
    iconName: "Wrench",
    image: "/services/plomberie.jpg",
    badge: {
      text: "Urgence 24/7",
      type: "urgent"
    },
    items: [
      "Installation sanitaire complète (WC, lavabo, douche, baignoire)",
      "Réparation de fuites et canalisations",
      "Débouchage de canalisations",
      "Installation et entretien de chauffe-eau",
      "Installation de systèmes de climatisation et chauffage",
      "Recherche de fuite non destructive",
      "Mise aux normes de la plomberie"
    ]
  },
  {
    id: "electricite",
    title: "Électricité",
    shortDescription: "Mise aux normes, installation de tableaux électriques, domotique et dépannage 24/7.",
    fullDescription: "Assurez la sécurité de votre installation électrique grâce à nos experts : mise aux normes, éclairage LED, domotique et service de dépannage d'urgence.",
    iconName: "Zap",
    image: "/services/electricite.jpg",
    badge: {
      text: "Urgence 24/7",
      type: "urgent"
    },
    items: [
      "Installation électrique complète et mise aux normes",
      "Remplacement et modernisation du tableau électrique",
      "Éclairage intérieur et extérieur (LED, spots, jardin)",
      "Domotique et maison connectée",
      "Installation de prises, interrupteurs et va-et-vient",
      "Dépannage électrique en urgence (24/7)",
      "Installation de groupes électrogènes et onduleurs"
    ]
  },
  {
    id: "peinture",
    title: "Peinture & Finitions",
    shortDescription: "Peinture intérieure, ravalement de façade, enduits tadelakt artisanal et traitements anti-humidité.",
    fullDescription: "Apportez une touche esthétique à vos murs avec nos peintures haute qualité, nos enduits tadelakt traditionnels marocains et nos traitements anti-humidité durables.",
    iconName: "Paintbrush",
    image: "/services/peinture.jpg",
    badge: {
      text: "Tadelakt Tradionnel",
      type: "quality"
    },
    items: [
      "Peinture intérieure (murs, plafonds)",
      "Peinture extérieure et ravalement de façade",
      "Enduits décoratifs et tadelakt traditionnel marocain",
      "Peinture de portails, grilles et menuiseries métalliques",
      "Traitement anti-humidité et anti-moisissure",
      "Pose de papier peint",
      "Vernissage et lasure du bois"
    ]
  },
  {
    id: "bricolage",
    title: "Bricolage & Maintenance Rapide",
    shortDescription: "Montage de meubles, petites réparations, pose de sols, placo et fixations murales.",
    fullDescription: "Besoin d'un coup de main pour vos petits travaux ? Nos bricoleurs professionnels interviennent chez vous rapidement à Tanger pour tous vos dépannages et installations.",
    iconName: "Hammer",
    image: "/services/bricolage.jpg",
    badge: {
      text: "Intervention Rapide",
      type: "popular"
    },
    items: [
      "Montage de meubles (IKEA, cuisines, dressings)",
      "Petits travaux de réparation du quotidien",
      "Pose de revêtement de sol (carrelage, parquet, PVC)",
      "Menuiserie (portes, fenêtres, volets)",
      "Pose de faux plafonds et cloisons en placo",
      "Nettoyage et débarras après travaux",
      "Fixation de rideaux, étagères, TV murale",
      "Vitrerie et remplacement de vitres"
    ]
  }
];
