#!/bin/bash
# ============================================================
# TANKECH PRO — Installation Script
# Run this from your TANKECH_PRO project root:
#   bash install-upgrade.sh
# ============================================================

echo "🏗️  TANKECH PRO — Installation des fichiers de mise à niveau"
echo "============================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Erreur : Exécutez ce script depuis la racine du projet TANKECH_PRO"
  exit 1
fi

echo ""
echo "📦 Étape 1 : Installation de lucide-react (si nécessaire)..."
npm install lucide-react

echo ""
echo "📁 Étape 2 : Vérification de la structure des dossiers..."
mkdir -p data
mkdir -p public/services
mkdir -p public/projects
mkdir -p app/about
mkdir -p app/contact
mkdir -p app/services
mkdir -p components

echo ""
echo "✅ Dossiers prêts !"
echo ""
echo "============================================================"
echo "📋 Étape 3 : Copiez les fichiers suivants dans votre projet :"
echo ""
echo "  DATA (4 fichiers) :"
echo "    data/siteConfig.ts"
echo "    data/servicesData.ts"
echo "    data/projectsData.ts"
echo "    data/testimonialsData.ts"
echo ""
echo "  COMPONENTS (12 fichiers) :"
echo "    components/Header.tsx"
echo "    components/Hero.tsx"
echo "    components/ServicesGrid.tsx"
echo "    components/QuoteModal.tsx"
echo "    components/ProjectsGallery.tsx"
echo "    components/Testimonials.tsx"
echo "    components/WhyUs.tsx"
echo "    components/Stats.tsx"
echo "    components/FAQ.tsx"
echo "    components/Footer.tsx"
echo "    components/WhatsAppButton.tsx"
echo "    components/ScrollReveal.tsx"
echo ""
echo "  PAGES (5 fichiers) :"
echo "    app/layout.tsx"
echo "    app/page.tsx"
echo "    app/globals.css"
echo "    app/about/page.tsx"
echo "    app/contact/page.tsx"
echo "    app/services/page.tsx"
echo ""
echo "  IMAGES (7 fichiers) :"
echo "    public/og-image.jpg"
echo "    public/services/gros-oeuvre.jpg"
echo "    public/services/renovation.jpg"
echo "    public/services/plomberie.jpg"
echo "    public/services/electricite.jpg"
echo "    public/services/peinture.jpg"
echo "    public/services/bricolage.jpg"
echo ""
echo "  NE PAS TOUCHER (garder vos fichiers existants) :"
echo "    package.json, next.config.ts, tsconfig.json,"
echo "    postcss.config.mjs, eslint.config.mjs, next-env.d.ts"
echo ""
echo "============================================================"
echo ""
echo "🔧 Étape 4 : Changez votre numéro WhatsApp dans data/siteConfig.ts"
echo ""
echo "🎥 Étape 5 : Ajoutez votre vidéo dans public/hero-video.mp4"
echo ""
echo "🚀 Étape 6 : Testez avec npm run dev"
echo ""
echo "✨ Terminé ! Votre site TANKECH est maintenant au niveau professionnel !"
