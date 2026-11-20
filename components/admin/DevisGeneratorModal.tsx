"use client";

import { useState, useRef, useEffect } from "react";
import type { QuoteRecord } from "@/lib/types";
import { siteConfig } from "@/data/siteConfig";
import {
  exportSingleQuoteToExcel,
  type DevisLineItem,
} from "@/lib/exportExcel";
import {
  X,
  Plus,
  Trash2,
  FileSpreadsheet,
  Printer,
  Eraser,
  PenTool,
  Stamp,
} from "lucide-react";

interface Props {
  quote: QuoteRecord;
  onClose: () => void;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseEstimatedPrice(notes: string): number {
  const match = notes.replace(/\s+/g, "").match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 0;
  const num = Number(match[1].replace(",", "."));
  return Number.isFinite(num) && num > 0 ? num : 0;
}

function formatMoney(n: number): string {
  return `${n.toLocaleString("fr-MA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} DH`;
}

export default function DevisGeneratorModal({ quote, onClose }: Props) {
  const guessedPrice = parseEstimatedPrice(quote.notes);
  const initialDescriptions =
    quote.services.length > 0
      ? quote.services
      : [quote.category || "Prestation de travaux"];

  const [items, setItems] = useState<DevisLineItem[]>(() =>
    initialDescriptions.map((desc, idx) => ({
      description: desc,
      quantity: 1,
      unit: "Forfait",
      unitPrice: idx === 0 ? guessedPrice : 0,
    }))
  );
  const [tvaRate, setTvaRate] = useState<number>(20);
  const [validityDays, setValidityDays] = useState<number>(30);
  const [paymentTerms, setPaymentTerms] = useState(
    "40% à la commande, 40% en cours d'avancement, 20% à la réception des travaux."
  );
  const [signerName, setSignerName] = useState(
    "Said El Baghdadi — Direction TANKECH"
  );
  const [includeStamp, setIncludeStamp] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);

  // Canvas signature pad state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const getCanvasPoint = (
    e: React.PointerEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement
  ) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const pt = getCanvasPoint(e, canvas);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pt.x, pt.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pt = getCanvasPoint(e, canvas);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    setHasSignature(true);
  };

  const handlePointerUp = () => {
    drawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureDataUrl = (): string | null => {
    if (!hasSignature || !canvasRef.current) return null;
    return canvasRef.current.toDataURL("image/png");
  };

  const totalHT = items.reduce(
    (sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
    0
  );
  const tvaAmount = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + tvaAmount;

  const updateItem = (index: number, patch: Partial<DevisLineItem>) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit: "Forfait", unitPrice: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await exportSingleQuoteToExcel(quote, {
        items,
        tvaRate,
        validityDays,
        paymentTerms,
        signerName,
        signatureDataUrl: getSignatureDataUrl(),
      });
    } finally {
      setExportingExcel(false);
    }
  };

  const handlePrintPdf = () => {
    const signatureImg = getSignatureDataUrl();
    const refNumber = `DEV-${quote.id.slice(0, 6).toUpperCase()}`;
    const quoteDate = new Date(quote.createdAt).toLocaleDateString("fr-MA");

    const rowsHtml = items
      .filter((it) => it.description.trim().length > 0)
      .map((it, idx) => {
        const lineTotal = (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0);
        return `
          <tr style="background:${idx % 2 === 1 ? "#f9fafb" : "#ffffff"};">
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:500;color:#111827;">${escapeHtml(it.description)}</td>
            <td style="padding:10px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${Number(it.quantity) || 0}</td>
            <td style="padding:10px 10px;border-bottom:1px solid #e5e7eb;text-align:center;color:#4b5563;">${escapeHtml(it.unit || "Forfait")}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151;">${formatMoney(Number(it.unitPrice) || 0)}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;color:#111827;">${formatMoney(lineTotal)}</td>
          </tr>`;
      })
      .join("");

    const stampSvg = includeStamp
      ? `<svg width="112" height="112" viewBox="0 0 120 120" style="position:absolute;right:14px;top:6px;opacity:0.82;transform:rotate(-11deg);">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#1e3a8a" stroke-width="3"/>
          <circle cx="60" cy="60" r="46" fill="none" stroke="#1e3a8a" stroke-width="1.2" stroke-dasharray="3 2"/>
          <text x="60" y="39" text-anchor="middle" fill="#1e3a8a" font-size="11" font-weight="800" font-family="Arial,sans-serif" letter-spacing="1.5">TANKECH</text>
          <line x1="22" y1="47" x2="98" y2="47" stroke="#1e3a8a" stroke-width="1.2"/>
          <text x="60" y="62" text-anchor="middle" fill="#1e3a8a" font-size="7.5" font-weight="700" font-family="Arial,sans-serif">CONSTRUCTION</text>
          <text x="60" y="73" text-anchor="middle" fill="#1e3a8a" font-size="7.5" font-weight="700" font-family="Arial,sans-serif">&amp; RÉNOVATION</text>
          <line x1="22" y1="80" x2="98" y2="80" stroke="#1e3a8a" stroke-width="1.2"/>
          <text x="60" y="93" text-anchor="middle" fill="#1e3a8a" font-size="7.5" font-weight="700" font-family="Arial,sans-serif">TANGER • MAROC</text>
        </svg>`
      : "";

    const legalLine = [
      siteConfig.rc ? siteConfig.rc : null,
      siteConfig.ice ? `ICE : ${siteConfig.ice}` : null,
    ]
      .filter(Boolean)
      .join(" • ");

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>Devis ${escapeHtml(refNumber)} — ${escapeHtml(quote.name)}</title>
  <style>
    @page { size: A4 portrait; margin: 12mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #111827; background: #ffffff; font-size: 12.5px; line-height: 1.45; }
    .page { width: 100%; max-width: 790px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: stretch; background: #111827; color: #ffffff; border-radius: 12px; overflow: hidden; }
    .brand { padding: 20px 24px; }
    .brand h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #facc15; }
    .brand .tagline { margin: 4px 0 10px; font-size: 11px; color: #d1d5db; letter-spacing: 0.4px; }
    .brand .contact { font-size: 10.5px; color: #9ca3af; }
    .badge-box { background: #eab308; color: #111827; padding: 20px 26px; display: flex; flex-direction: column; justify-content: center; align-items: flex-end; min-width: 190px; }
    .badge-box .doc-type { font-size: 22px; font-weight: 900; letter-spacing: 1px; }
    .badge-box .ref { font-size: 11.5px; font-weight: 700; margin-top: 4px; }
    .badge-box .date { font-size: 10.5px; margin-top: 2px; opacity: 0.85; }
    .grid-2 { display: grid; grid-template-columns: 1.25fr 1fr; gap: 14px; margin-top: 16px; }
    .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 14px 16px; background: #fafafa; }
    .card-title { font-size: 9.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin: 0 0 8px; }
    .client-name { font-size: 15px; font-weight: 800; color: #111827; margin: 0 0 6px; }
    .info-line { margin: 2px 0; font-size: 11.5px; color: #374151; }
    .desc-box { margin-top: 14px; border: 1px solid #e5e7eb; border-left: 4px solid #eab308; border-radius: 8px; padding: 11px 14px; background: #fffbeb; }
    .desc-box p { margin: 3px 0 0; font-size: 12px; color: #1f2937; white-space: pre-wrap; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
    thead th { background: #111827; color: #facc15; padding: 10px 12px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.4px; text-align: left; }
    .bottom-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 16px; margin-top: 16px; align-items: start; }
    .terms { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 14px; background: #f9fafb; font-size: 11px; color: #4b5563; }
    .totals { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
    .tot-row { display: flex; justify-content: space-between; padding: 8px 14px; font-size: 12px; border-bottom: 1px solid #f3f4f6; }
    .tot-final { display: flex; justify-content: space-between; padding: 12px 14px; background: #111827; color: #facc15; font-size: 15px; font-weight: 900; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 22px; page-break-inside: avoid; }
    .sig-box { border: 1px solid #d1d5db; border-radius: 10px; padding: 12px 14px; min-height: 132px; position: relative; display: flex; flex-direction: column; justify-content: space-between; }
    .sig-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; margin-bottom: 6px; }
    .sig-sub { font-size: 10px; color: #6b7280; font-style: italic; }
    .sig-img { max-height: 62px; max-width: 190px; object-fit: contain; margin: 4px 0; }
    .sig-name { font-size: 11px; font-weight: 700; color: #111827; }
    .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <h1>${escapeHtml(siteConfig.name)}</h1>
        <div class="tagline">${escapeHtml(siteConfig.tagline)}</div>
        <div class="contact">Tél : ${escapeHtml(siteConfig.phone)} • ${escapeHtml(siteConfig.email)} • ${escapeHtml(siteConfig.address)}</div>
      </div>
      <div class="badge-box">
        <div class="doc-type">DEVIS</div>
        <div class="ref">N° ${escapeHtml(refNumber)}</div>
        <div class="date">Date : ${escapeHtml(quoteDate)}</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-title">Client</div>
        <div class="client-name">${escapeHtml(quote.name)}</div>
        <div class="info-line"><strong>Tél :</strong> ${escapeHtml(quote.phone)}</div>
        ${quote.email ? `<div class="info-line"><strong>Email :</strong> ${escapeHtml(quote.email)}</div>` : ""}
        <div class="info-line"><strong>Ville :</strong> ${escapeHtml(quote.city || "Tanger")}</div>
      </div>
      <div class="card">
        <div class="card-title">Détails du Devis</div>
        <div class="info-line"><strong>Catégorie :</strong> ${escapeHtml(quote.category || "Construction & Rénovation")}</div>
        <div class="info-line"><strong>Validité :</strong> ${validityDays} jours</div>
        <div class="info-line"><strong>Devise :</strong> Dirham Marocain (DH)</div>
        <div class="info-line"><strong>Garantie :</strong> Garantie décennale (gros œuvre)</div>
      </div>
    </div>

    ${
      quote.message
        ? `<div class="desc-box">
            <div class="card-title" style="margin-bottom:2px;color:#92400e;">Objet des travaux</div>
            <p>${escapeHtml(quote.message)}</p>
          </div>`
        : ""
    }

    <table>
      <thead>
        <tr>
          <th style="width:46%;">Désignation des travaux</th>
          <th style="width:10%;text-align:center;">Qté</th>
          <th style="width:12%;text-align:center;">Unité</th>
          <th style="width:16%;text-align:right;">Prix Unit.</th>
          <th style="width:16%;text-align:right;">Total HT</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <div class="bottom-grid">
      <div class="terms">
        <div class="card-title">Conditions &amp; Modalités</div>
        <p style="margin:0 0 6px;">${escapeHtml(paymentTerms)}</p>
        <p style="margin:0;">Ce devis est valable <strong>${validityDays} jours</strong> à compter de sa date d'émission. Tous nos travaux de gros œuvre bénéficient de notre garantie décennale.</p>
      </div>
      <div class="totals">
        <div class="tot-row"><span>Total HT</span><strong>${formatMoney(totalHT)}</strong></div>
        <div class="tot-row"><span>TVA (${tvaRate}%)</span><span>${formatMoney(tvaAmount)}</span></div>
        <div class="tot-final"><span>TOTAL TTC</span><span>${formatMoney(totalTTC)}</span></div>
      </div>
    </div>

    <div class="signatures">
      <div class="sig-box">
        <div>
          <div class="sig-label">Bon pour accord — Client</div>
          <div class="sig-sub">Date : ____ / ____ / 20____</div>
          <div class="sig-sub" style="margin-top:4px;">Signature précédée de la mention « Bon pour accord » :</div>
        </div>
        <div class="sig-name" style="color:#9ca3af;">${escapeHtml(quote.name)}</div>
      </div>

      <div class="sig-box" style="background:#fffdf5;border-color:#fde68a;">
        ${stampSvg}
        <div>
          <div class="sig-label">Cachet &amp; Signature — TANKECH</div>
          ${
            signatureImg
              ? `<img src="${signatureImg}" alt="Signature TANKECH" class="sig-img" />`
              : `<div style="height:56px;"></div>`
          }
        </div>
        <div class="sig-name">${escapeHtml(signerName)}</div>
      </div>
    </div>

    <div class="footer">
      ${escapeHtml(siteConfig.name)} — ${escapeHtml(siteConfig.address)} • ${escapeHtml(siteConfig.phone)} • ${escapeHtml(siteConfig.email)}${legalLine ? ` • ${escapeHtml(legalLine)}` : ""}
    </div>
  </div>
  <script>
    window.onload = function () {
      setTimeout(function () { window.print(); }, 200);
    };
  </script>
</body>
</html>`;

    const printWin = window.open("", "_blank", "width=900,height=1050");
    if (!printWin) {
      window.alert(
        "Autorisez l'ouverture des fenêtres pop-up pour générer le PDF."
      );
      return;
    }
    printWin.document.open();
    printWin.document.write(html);
    printWin.document.close();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="devis-builder-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-gray-900 px-6 py-4 text-white">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-yellow-400">
              Générateur de Devis Professionnel
            </p>
            <h3 id="devis-builder-title" className="text-lg font-black">
              Devis — {quote.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Line items editor */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">
                1. Lignes de prestations &amp; prix
              </h4>
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-yellow-500 hover:text-gray-900 transition"
              >
                <Plus className="h-3.5 w-3.5" /> Ajouter une ligne
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="grid gap-2 sm:grid-cols-12 items-center rounded-xl border border-gray-200 bg-gray-50/60 p-3"
                >
                  <input
                    type="text"
                    placeholder="Désignation des travaux *"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(idx, { description: e.target.value })
                    }
                    className="sm:col-span-5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    aria-label="Quantité"
                    placeholder="Qté"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(idx, { quantity: Number(e.target.value) })
                    }
                    className="sm:col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-center"
                  />
                  <input
                    type="text"
                    aria-label="Unité"
                    placeholder="Unité (m², Forfait…)"
                    value={item.unit}
                    onChange={(e) => updateItem(idx, { unit: e.target.value })}
                    className="sm:col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-center"
                  />
                  <input
                    type="number"
                    min={0}
                    step="10"
                    aria-label="Prix unitaire DH"
                    placeholder="Prix Unit. (DH)"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(idx, { unitPrice: Number(e.target.value) })
                    }
                    className="sm:col-span-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-right font-semibold"
                  />
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      disabled={items.length <= 1}
                      onClick={() => removeItem(idx)}
                      aria-label="Supprimer cette ligne"
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Totals Preview */}
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-xl bg-gray-900 p-4 text-white">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <label className="font-semibold text-white/70">TVA :</label>
                <select
                  value={tvaRate}
                  onChange={(e) => setTvaRate(Number(e.target.value))}
                  className="rounded-lg bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-bold text-white"
                >
                  <option value={20} className="text-gray-900">
                    20% (TVA Maroc)
                  </option>
                  <option value={0} className="text-gray-900">
                    0% (Sans TVA / HT)
                  </option>
                </select>
                <label className="font-semibold text-white/70 ml-2">
                  Validité (jours) :
                </label>
                <input
                  type="number"
                  min={1}
                  max={180}
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value) || 30)}
                  className="w-16 rounded-lg bg-white/10 border border-white/20 px-2.5 py-1.5 text-xs font-bold text-white text-center"
                />
              </div>

              <div className="text-right text-xs space-y-0.5">
                <p className="text-white/70">
                  Total HT : <strong>{formatMoney(totalHT)}</strong> • TVA (
                  {tvaRate}%) : <strong>{formatMoney(tvaAmount)}</strong>
                </p>
                <p className="text-lg font-black text-yellow-400">
                  TOTAL TTC : {formatMoney(totalTTC)}
                </p>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wide mb-1.5">
              2. Conditions de paiement
            </label>
            <input
              type="text"
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-yellow-400 focus:outline-none"
            />
          </div>

          {/* Signature & Stamp */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50/70 p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-extrabold text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
                <PenTool className="h-4 w-4 text-yellow-600" /> 3. Signature
                &amp; Cachet TANKECH
              </h4>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeStamp}
                    onChange={(e) => setIncludeStamp(e.target.checked)}
                  />
                  <Stamp className="h-3.5 w-3.5 text-blue-700" /> Cachet officiel
                  TANKECH (PDF)
                </label>
                <button
                  type="button"
                  onClick={clearSignature}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  <Eraser className="h-3.5 w-3.5" /> Effacer
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 items-center">
              <div>
                <p className="text-[11px] text-gray-500 mb-1.5">
                  Dessinez votre signature ci-dessous (souris ou doigt) :
                </p>
                <canvas
                  ref={canvasRef}
                  width={420}
                  height={130}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-white cursor-crosshair touch-none"
                />
              </div>
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-gray-600">
                  Nom &amp; titre du signataire
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm"
                />
                <p className="text-[11px] text-gray-400">
                  Votre signature sera automatiquement intégrée dans le{" "}
                  <strong>PDF A4</strong> et dans le fichier{" "}
                  <strong>Excel (.xlsx)</strong> (1 seule page A4).
                </p>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={exportingExcel}
              onClick={handleExportExcel}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {exportingExcel
                ? "Génération…"
                : "Télécharger Excel A4 (.xlsx)"}
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3 text-sm font-black text-gray-900 shadow-lg hover:bg-yellow-400 transition"
            >
              <Printer className="h-4 w-4" /> Télécharger / Imprimer PDF (A4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
