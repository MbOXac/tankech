"use client";

import { siteConfig } from "@/data/siteConfig";
import { servicesData } from "@/data/servicesData";
import { FileDown } from "lucide-react";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface BrochureButtonProps {
  variant?: "dark" | "light" | "footer";
}

export default function BrochureButton({
  variant = "dark",
}: BrochureButtonProps) {
  const openBrochure = () => {
    const logoUrl = `${window.location.origin}${siteConfig.logo}`;

    const servicesHtml = servicesData
      .map(
        (cat) => `
      <div class="srv-card">
        <div class="srv-head">
          <strong>${escapeHtml(cat.title)}</strong>
          <span>${escapeHtml(cat.badge)}</span>
        </div>
        <p>${escapeHtml(cat.shortDescription)}</p>
        <div class="tags">${cat.services
          .slice(0, 5)
          .map((s) => `<em>${escapeHtml(s.name)}</em>`)
          .join("")}</div>
      </div>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Plaquette de Présentation — ${escapeHtml(siteConfig.name)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111827; background: #fff; font-size: 11.5px; line-height: 1.4; }
    .hero { display: flex; justify-content: space-between; align-items: center; background: #0B1F44; color: #fff; border-radius: 14px; padding: 20px 24px; }
    .hero-left { display: flex; align-items: center; gap: 16px; }
    .logo-wrap { background: #fff; border-radius: 10px; padding: 8px 12px; }
    .logo-wrap img { height: 54px; width: auto; display: block; }
    .hero h1 { margin: 0; font-size: 24px; font-weight: 900; color: #facc15; }
    .hero .tag { font-size: 11px; color: #d1d5db; margin-top: 2px; }
    .hero-right { text-align: right; font-size: 11px; color: #e5e7eb; }
    .hero-right strong { color: #facc15; display: block; font-size: 13px; margin-bottom: 3px; }
    .intro { margin: 14px 0; padding: 12px 16px; background: #FAF8F4; border-left: 4px solid #eab308; border-radius: 8px; font-size: 12px; color: #374151; }
    .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0; }
    .stat { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px; text-align: center; background: #fff; }
    .stat b { display: block; font-size: 18px; color: #0B1F44; }
    .stat span { font-size: 10px; color: #6b7280; }
    h2 { font-size: 14px; font-weight: 900; color: #0B1F44; text-transform: uppercase; letter-spacing: 0.6px; margin: 16px 0 10px; border-bottom: 2px solid #eab308; padding-bottom: 4px; display: inline-block; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .srv-card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 12px; background: #fafafa; page-break-inside: avoid; }
    .srv-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
    .srv-head strong { font-size: 12.5px; color: #0B1F44; }
    .srv-head span { font-size: 9px; font-weight: 700; background: #fef3c7; color: #92400e; padding: 2px 7px; border-radius: 99px; }
    .srv-card p { margin: 4px 0 6px; font-size: 10.5px; color: #4b5563; }
    .tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .tags em { font-style: normal; font-size: 9px; background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 2px 6px; color: #374151; }
    .footer-bar { margin-top: 16px; background: #0B1F44; color: #fff; border-radius: 12px; padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; }
    .footer-bar b { color: #facc15; }
  </style>
</head>
<body>
  <div class="hero">
    <div class="hero-left">
      <div class="logo-wrap"><img src="${escapeHtml(logoUrl)}" alt="TANKECH" /></div>
      <div>
        <h1>${escapeHtml(siteConfig.name)}</h1>
        <div class="tag">${escapeHtml(siteConfig.tagline)}</div>
      </div>
    </div>
    <div class="hero-right">
      <strong>Plaquette Entreprise</strong>
      ${escapeHtml(siteConfig.address)}<br/>
      Tél / WhatsApp : ${escapeHtml(siteConfig.phone)}<br/>
      ${escapeHtml(siteConfig.email)}
    </div>
  </div>

  <div class="intro">
    ${escapeHtml(siteConfig.description)} Zone d'intervention : <strong>Tanger, Tétouan, Assilah, Martil, Fnideq, Chefchaouen et Al Hoceima</strong>.
  </div>

  <div class="stats">
    <div class="stat"><b>150+</b><span>Projets Réalisés</span></div>
    <div class="stat"><b>10 ans</b><span>Garantie Décennale</span></div>
    <div class="stat"><b>98%</b><span>Clients Satisfaits</span></div>
    <div class="stat"><b>24/7</b><span>Urgence Plomberie / Élec</span></div>
  </div>

  <h2>Nos ${servicesData.length} Domaines d'Expertise</h2>
  <div class="grid">${servicesHtml}</div>

  <div class="footer-bar">
    <div><b>Devis Gratuit sous 24h</b> • Suivi de chantier privé en ligne pour nos clients</div>
    <div><b>${escapeHtml(siteConfig.phone)}</b> • ${escapeHtml(siteConfig.url)}</div>
  </div>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 200); };</script>
</body>
</html>`;

    const win = window.open("", "_blank", "width=900,height=1050");
    if (!win) {
      window.alert(
        "Autorisez l'ouverture des fenêtres pop-up pour télécharger la plaquette PDF."
      );
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  if (variant === "footer") {
    return (
      <button
        type="button"
        onClick={openBrochure}
        className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-yellow-400 transition"
      >
        <FileDown className="h-4 w-4" /> Plaquette TANKECH (PDF)
      </button>
    );
  }

  if (variant === "light") {
    return (
      <button
        type="button"
        onClick={openBrochure}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-4 text-base font-bold text-[#0B1F44] shadow-sm transition hover:bg-gray-50"
      >
        <FileDown className="h-5 w-5 text-amber-600" /> Plaquette PDF
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={openBrochure}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/20 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
    >
      <FileDown className="h-4 w-4 text-yellow-400" /> Télécharger notre
      Plaquette (PDF)
    </button>
  );
}
