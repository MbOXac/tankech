// ============================================================
// TANKECH — Services data
// All 6 categories from services-tankech.md
// ============================================================

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
}

export interface ServiceCategory {
  slug: string;
  title: string;
  badge: string;
  badgeColor: "red" | "blue" | "green" | "yellow" | "purple" | "orange";
  icon: string; // lucide icon name
  coverImage: string;
  shortDescription: string;
  longDescription: string;
  services: ServiceItem[];
  emergency?: boolean;
}

export const servicesData: ServiceCategory[] = [
  {
    slug: "gros-oeuvre",
    title: "Gros Œuvre",
    badge: "Garantie Décennale",
    badgeColor: "blue",
    icon: "Building2",
    coverImage: "/services/gros-oeuvre.jpg",
    shortDescription:
      "Construction solide et durable — fondations, maçonnerie, dalles, toiture et bien plus.",
    longDescription:
      "Notre équipe réalise tous les travaux de gros œuvre avec rigueur et savoir-faire : du terrassement à la livraison, en passant par les fondations, la maçonnerie porteuse, les dalles, la toiture et l'étanchéité. Chaque projet bénéficie de notre garantie décennale pour une tranquillité totale.",
    services: [
      {
        id: "terrassement",
        name: "Terrassement",
        description: "Préparation du terrain, fouilles et remblais.",
      },
      {
        id: "fondations",
        name: "Fondations",
        description: "Semelles, radier et longrines adaptées au sol.",
      },
      {
        id: "maconnerie",
        name: "Maçonnerie",
        description: "Murs porteurs, cloisons et agglos.",
      },
      {
        id: "dalles",
        name: "Dalles & Planchers",
        description: "Dalles pleines, hourdis et planchers nervurés.",
      },
      {
        id: "toiture",
        name: "Toiture",
        description: "Charpente, couverture et zinguerie.",
      },
      {
        id: "etancheite",
        name: "Étanchéité",
        description: "Étanchéité terrasse et toiture plate.",
      },
      {
        id: "piscines",
        name: "Piscines",
        description: "Construction de piscines enterrées et hors-sol.",
      },
      {
        id: "demolition",
        name: "Démolition",
        description: "Démolition sécurisée et évacuation des gravats.",
      },
    ],
  },
  {
    slug: "renovation",
    title: "Rénovation",
    badge: "Projet Clés en Main",
    badgeColor: "green",
    icon: "Home",
    coverImage: "/services/renovation.jpg",
    shortDescription:
      "Transformation complète ou partielle — cuisine, salle de bain, extension, façade.",
    longDescription:
      "Que vous souhaitiez moderniser votre intérieur, agrandir votre espace ou rafraîchir votre façade, notre service de rénovation clés en main s'occupe de tout : étude, conception, réalisation et finition. Un interlocuteur unique pour un résultat impeccable.",
    services: [
      {
        id: "renovation-complete",
        name: "Rénovation Complète",
        description: "Refonte totale de votre bien, du sol au plafond.",
      },
      {
        id: "salle-de-bain",
        name: "Salle de Bain",
        description: "Création ou rénovation de salles de bain.",
      },
      {
        id: "cuisine",
        name: "Cuisine",
        description: "Cuisines aménagées sur mesure.",
      },
      {
        id: "extension",
        name: "Extension",
        description: "Agrandissement de maison ou appartement.",
      },
      {
        id: "combles",
        name: "Aménagement de Combles",
        description: "Transformation de combles en espace habitable.",
      },
      {
        id: "facade",
        name: "Ravalement de Façade",
        description: "Nettoyage, réparation et peinture de façade.",
      },
      {
        id: "open-space",
        name: "Open Space",
        description: "Création d'espaces ouverts et lumineux.",
      },
    ],
  },
  {
    slug: "plomberie",
    title: "Plomberie",
    badge: "Urgence 24/7",
    badgeColor: "red",
    icon: "Droplets",
    coverImage: "/services/plomberie.jpg",
    shortDescription:
      "Installation, réparation et dépannage — fuites, chauffe-eau, climatisation et normes.",
    longDescription:
      "Nos plombiers qualifiés interviennent rapidement pour toute urgence ou installation : détection et réparation de fuites, débouchage, pose de chauffe-eau, climatisation, chauffage et mise aux normes. Disponibles 24h/24 et 7j/7 pour les urgences.",
    emergency: true,
    services: [
      {
        id: "installation-sanitaire",
        name: "Installation Sanitaire",
        description: "Pose de sanitaires, robinetterie et évacuation.",
      },
      {
        id: "fuites",
        name: "Réparation de Fuites",
        description: "Détection et réparation de toutes fuites d'eau.",
      },
      {
        id: "debouchage",
        name: "Débouchage",
        description: "Débouchage canalisations, WC et éviers.",
      },
      {
        id: "chauffe-eau",
        name: "Chauffe-eau",
        description: "Installation et remplacement de chauffe-eau.",
      },
      {
        id: "clim-chauffage",
        name: "Climatisation & Chauffage",
        description: "Pose et entretien de systèmes clim et chauffage.",
      },
      {
        id: "recherche-fuite",
        name: "Recherche de Fuite",
        description: "Détection par caméra thermique et acoustique.",
      },
      {
        id: "normes",
        name: "Mise aux Normes",
        description: "Mise en conformité des installations plomberie.",
      },
    ],
  },
  {
    slug: "electricite",
    title: "Électricité",
    badge: "Urgence 24/7",
    badgeColor: "red",
    icon: "Zap",
    coverImage: "/services/electricite.jpg",
    shortDescription:
      "Installations électriques neuves ou rénovation — tableau, éclairage, domotique, dépannage.",
    longDescription:
      "Électriciens certifiés pour tous vos besoins : installation complète, mise aux normes du tableau électrique, éclairage intérieur et extérieur, domotique, prises et interrupteurs, dépannage urgent. Intervention rapide 24/7 pour les urgences électriques.",
    emergency: true,
    services: [
      {
        id: "installation-electrique",
        name: "Installation Électrique",
        description: "Installation complète pour constructions neuves.",
      },
      {
        id: "tableau-electrique",
        name: "Tableau Électrique",
        description: "Mise aux normes et remplacement de tableau.",
      },
      {
        id: "eclairage",
        name: "Éclairage",
        description: "Éclairage intérieur, extérieur et architectural.",
      },
      {
        id: "domotique",
        name: "Domotique",
        description: "Solutions domotiques et maison connectée.",
      },
      {
        id: "prises",
        name: "Prises & Interrupteurs",
        description: "Pose de prises, interrupteurs et prises USB.",
      },
      {
        id: "depannage-electrique",
        name: "Dépannage Électrique",
        description: "Intervention rapide pour pannes et urgences.",
      },
    ],
  },
  {
    slug: "peinture",
    title: "Peinture & Finitions",
    badge: "Finition Artisanale",
    badgeColor: "purple",
    icon: "Paintbrush",
    coverImage: "/services/peinture.jpg",
    shortDescription:
      "Peinture intérieure et extérieure, tadelakt marocain, portails, anti-humidité.",
    longDescription:
      "Nos artisans peintres maîtrisent toutes les techniques : peinture classique, tadelakt marocain traditionnel, finitions décoratives, peinture anti-humidité, vernis bois et pose de papier peint. Un travail soigné pour un résultat qui dure.",
    services: [
      {
        id: "peinture-interieure",
        name: "Peinture Intérieure",
        description: "Peinture murs, plafonds et boiseries intérieures.",
      },
      {
        id: "peinture-exterieure",
        name: "Peinture Extérieure",
        description: "Peinture façades et murs extérieurs.",
      },
      {
        id: "tadelakt",
        name: "Tadelakt Marocain",
        description: "Application traditionnelle de tadelakt.",
      },
      {
        id: "portails",
        name: "Portails & Ferronnerie",
        description: "Peinture et finition de portails métalliques.",
      },
      {
        id: "anti-humidite",
        name: "Peinture Anti-Humidité",
        description: "Traitement et peinture anti-humidité.",
      },
      {
        id: "papier-peint",
        name: "Papier Peint",
        description: "Pose de papier peint et revêtements muraux.",
      },
      {
        id: "vernis",
        name: "Vernis & Lasure",
        description: "Vernis bois intérieur et extérieur.",
      },
    ],
  },
  {
    slug: "bricolage",
    title: "Bricolage & Maintenance",
    badge: "Intervention Rapide",
    badgeColor: "orange",
    icon: "Wrench",
    coverImage: "/services/bricolage.jpg",
    shortDescription:
      "Petits travaux et maintenance rapide — montage, réparation, menuiserie, placo, nettoyage.",
    longDescription:
      "Pour tous les petits travaux du quotidien : montage de meubles, réparations diverses, pose de sols, menuiserie, plâtrerie, nettoyage de fin de chantier, fixations murales et vitrerie. Intervention rapide et tarif transparent.",
    services: [
      {
        id: "montage-meuble",
        name: "Montage de Meubles",
        description: "Assemblage et fixation de tous types de meubles.",
      },
      {
        id: "petit-bricolage",
        name: "Petit Bricolage",
        description: "Réparations et travaux divers à la demande.",
      },
      {
        id: "sols",
        name: "Pose de Sols",
        description: "Carrelage, parquet, vinyle et stratifié.",
      },
      {
        id: "menuiserie",
        name: "Menuiserie",
        description: "Travaux de menuiserie sur mesure.",
      },
      {
        id: "placo",
        name: "Plâtrerie & Placo",
        description: "Cloisons placo, doublages et faux plafonds.",
      },
      {
        id: "nettoyage",
        name: "Nettoyage Fin de Chantier",
        description: "Nettoyage professionnel après travaux.",
      },
      {
        id: "fixations",
        name: "Fixations Murales",
        description: "Pose d'étagères, miroirs, TV et objets lourds.",
      },
      {
        id: "vitrerie",
        name: "Vitrerie",
        description: "Remplacement et pose de vitres et miroirs.",
      },
    ],
  },
];

// Helper — get category by slug
export function getServiceBySlug(slug: string) {
  return servicesData.find((s) => s.slug === slug);
}

// Helper — get all slugs (for static params)
export function getAllServiceSlugs() {
  return servicesData.map((s) => s.slug);
}
