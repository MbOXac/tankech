import { QUOTE_STATUS_LABELS, type QuoteRecord } from "@/lib/types";
import { siteConfig } from "@/data/siteConfig";

export interface DevisLineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface DevisExportOptions {
  items?: DevisLineItem[];
  tvaRate?: number; // e.g. 20 or 0
  validityDays?: number;
  paymentTerms?: string;
  signerName?: string;
  signatureDataUrl?: string | null;
}

/**
 * Neutralize Excel/CSV formula injection (CWE-1236) for user-supplied strings.
 */
function safeCell(value: string): string {
  const trimmed = value ?? "";
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

function triggerDownload(buffer: ArrayBuffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function slugifyFilename(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "client"
  );
}

async function createWorkbook() {
  const mod = await import("exceljs");
  const ExcelJS =
    "Workbook" in mod
      ? mod
      : (mod as unknown as { default: typeof mod }).default;
  return new ExcelJS.Workbook();
}

/**
 * Export a list of quotes into a styled, print-ready A4 landscape Excel workbook (.xlsx)
 */
export async function exportQuotesToExcel(quotes: QuoteRecord[]) {
  const workbook = await createWorkbook();
  workbook.creator = siteConfig.name;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Devis & Clients", {
    views: [{ state: "frozen", ySplit: 3 }],
    pageSetup: {
      paperSize: 9, // A4
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.35,
        right: 0.35,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  // Title banner
  sheet.mergeCells("A1:K1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = `TANKECH — Liste des Devis & Clients (${new Date().toLocaleDateString("fr-MA")})`;
  titleCell.font = {
    name: "Calibri",
    size: 14,
    bold: true,
    color: { argb: "FFFACC15" },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111827" },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(1).height = 30;
  sheet.getRow(2).height = 8;

  const headers = [
    "Date",
    "Client",
    "Téléphone",
    "Email",
    "Ville",
    "Catégorie",
    "Services",
    "Statut",
    "Description / Message",
    "Notes / Estimation",
    "Source",
  ];

  const headerRow = sheet.getRow(3);
  headerRow.values = headers;
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FF111827" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEAB308" },
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = {
      top: { style: "thin", color: { argb: "FF111827" } },
      bottom: { style: "thin", color: { argb: "FF111827" } },
      left: { style: "thin", color: { argb: "FFE5E7EB" } },
      right: { style: "thin", color: { argb: "FFE5E7EB" } },
    };
  });

  sheet.columns = [
    { width: 16 },
    { width: 20 },
    { width: 16 },
    { width: 22 },
    { width: 16 },
    { width: 18 },
    { width: 24 },
    { width: 14 },
    { width: 38 },
    { width: 24 },
    { width: 14 },
  ];

  quotes.forEach((q, idx) => {
    const row = sheet.addRow([
      new Date(q.createdAt).toLocaleString("fr-MA"),
      safeCell(q.name),
      safeCell(q.phone),
      safeCell(q.email || "—"),
      safeCell(q.city || "—"),
      safeCell(q.category || "—"),
      safeCell(q.services.join(", ") || "—"),
      QUOTE_STATUS_LABELS[q.status] ?? q.status,
      safeCell(q.message || "—"),
      safeCell(q.notes || "—"),
      q.source === "quote_modal" ? "Modal Services" : "Page Contact / Admin",
    ]);

    row.alignment = { vertical: "top", wrapText: true };
    row.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 10, color: { argb: "FF1F2937" } };
      if (idx % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF9FAFB" },
        };
      }
      cell.border = {
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "hair", color: { argb: "FFE5E7EB" } },
        right: { style: "hair", color: { argb: "FFE5E7EB" } },
      };
    });
  });

  sheet.autoFilter = {
    from: { row: 3, column: 1 },
    to: { row: Math.max(3, 3 + quotes.length), column: headers.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerDownload(buffer as ArrayBuffer, `devis-tankech-${dateStr}.xlsx`);
}

/**
 * Export a single quote as a professional, single-page A4 TANKECH Devis (.xlsx)
 * with full grid borders, live Excel formulas, terms, and signature/stamp boxes.
 */
export async function exportSingleQuoteToExcel(
  quote: QuoteRecord,
  options: DevisExportOptions = {}
) {
  const workbook = await createWorkbook();
  workbook.creator = siteConfig.name;
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Devis", {
    views: [{ showGridLines: false }],
    pageSetup: {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 1,
      horizontalCentered: true,
      margins: {
        left: 0.4,
        right: 0.4,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    },
  });

  // Balanced widths that fit cleanly inside 1 A4 Portrait page
  sheet.columns = [
    { width: 38 }, // A: Désignation
    { width: 10 }, // B: Qté
    { width: 11 }, // C: Unité
    { width: 16 }, // D: P.U. (DH)
    { width: 17 }, // E: Total HT (DH)
  ];

  const tvaRate = options.tvaRate ?? 20;
  const validityDays = options.validityDays ?? 30;
  const paymentTerms =
    options.paymentTerms ||
    "40% à la commande, 40% en cours d'avancement, 20% à la réception des travaux.";
  const signerName = options.signerName || "Direction TANKECH";

  // Row 1-2: Brand Header Banner
  sheet.mergeCells("A1:D1");
  const brandCell = sheet.getCell("A1");
  brandCell.value = siteConfig.name;
  brandCell.font = {
    name: "Calibri",
    size: 20,
    bold: true,
    color: { argb: "FFFACC15" },
  };
  brandCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111827" },
  };
  brandCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

  const devisBadge = sheet.getCell("E1");
  devisBadge.value = "DEVIS";
  devisBadge.font = {
    name: "Calibri",
    size: 16,
    bold: true,
    color: { argb: "FF111827" },
  };
  devisBadge.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEAB308" },
  };
  devisBadge.alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(1).height = 36;

  sheet.mergeCells("A2:E2");
  const subCell = sheet.getCell("A2");
  subCell.value = `${siteConfig.tagline}  •  ${siteConfig.phone}  •  ${siteConfig.email}  •  ${siteConfig.address}`;
  subCell.font = {
    name: "Calibri",
    size: 9,
    color: { argb: "FFD1D5DB" },
  };
  subCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F2937" },
  };
  subCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  sheet.getRow(2).height = 22;

  sheet.getRow(3).height = 10;

  // Row 4-8: Side-by-side Client & Devis Info Boxes
  sheet.mergeCells("A4:C4");
  sheet.getCell("A4").value = "INFORMATIONS CLIENT";
  sheet.getCell("A4").font = {
    name: "Calibri",
    size: 9,
    bold: true,
    color: { argb: "FF6B7280" },
  };
  sheet.getCell("A4").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  sheet.getCell("A4").alignment = { vertical: "middle", indent: 1 };

  sheet.mergeCells("D4:E4");
  sheet.getCell("D4").value = "RÉFÉRENCE DU DEVIS";
  sheet.getCell("D4").font = {
    name: "Calibri",
    size: 9,
    bold: true,
    color: { argb: "FF6B7280" },
  };
  sheet.getCell("D4").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  sheet.getCell("D4").alignment = { vertical: "middle", indent: 1 };
  sheet.getRow(4).height = 20;

  const infoRows: [string, string, string][] = [
    [`Client : ${safeCell(quote.name)}`, "Date :", new Date(quote.createdAt).toLocaleDateString("fr-MA")],
    [`Téléphone : ${safeCell(quote.phone)}`, "N° Devis :", `DEV-${quote.id.slice(0, 6).toUpperCase()}`],
    [`Email : ${safeCell(quote.email || "—")}`, "Validité :", `${validityDays} jours`],
    [`Ville : ${safeCell(quote.city || "Tanger")}`, "Catégorie :", safeCell(quote.category || "Général")],
  ];

  infoRows.forEach(([leftText, rightLabel, rightVal], idx) => {
    const rNum = 5 + idx;
    const row = sheet.getRow(rNum);
    row.height = 19;
    sheet.mergeCells(`A${rNum}:C${rNum}`);
    const leftCell = row.getCell(1);
    leftCell.value = leftText;
    leftCell.font = {
      name: "Calibri",
      size: 10,
      bold: idx === 0,
      color: { argb: "FF111827" },
    };
    leftCell.alignment = { vertical: "middle", indent: 1 };

    const rLabelCell = row.getCell(4);
    rLabelCell.value = rightLabel;
    rLabelCell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FF4B5563" },
    };
    rLabelCell.alignment = { vertical: "middle", horizontal: "left", indent: 1 };

    const rValCell = row.getCell(5);
    rValCell.value = rightVal;
    rValCell.font = {
      name: "Calibri",
      size: 10,
      bold: idx === 1,
      color: { argb: "FF111827" },
    };
    rValCell.alignment = { vertical: "middle", horizontal: "right" };

    for (let col = 1; col <= 5; col++) {
      row.getCell(col).border = {
        bottom: {
          style: idx === infoRows.length - 1 ? "thin" : "hair",
          color: { argb: idx === infoRows.length - 1 ? "FFD1D5DB" : "FFE5E7EB" },
        },
        left:
          col === 1 || col === 4
            ? { style: "thin", color: { argb: "FFE5E7EB" } }
            : undefined,
        right:
          col === 3 || col === 5
            ? { style: "thin", color: { argb: "FFE5E7EB" } }
            : undefined,
      };
    }
  });

  // Row 9-11: Project description
  sheet.getRow(9).height = 8;
  sheet.mergeCells("A10:E10");
  const descHeader = sheet.getCell("A10");
  descHeader.value = "OBJET / DESCRIPTION DES TRAVAUX";
  descHeader.font = {
    name: "Calibri",
    size: 9,
    bold: true,
    color: { argb: "FF6B7280" },
  };
  sheet.getRow(10).height = 17;

  sheet.mergeCells("A11:E11");
  const descCell = sheet.getCell("A11");
  descCell.value = safeCell(quote.message || "Travaux selon demande du client.");
  descCell.font = { name: "Calibri", size: 10, color: { argb: "FF1F2937" } };
  descCell.alignment = { vertical: "middle", wrapText: true, indent: 1 };
  descCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF9FAFB" },
  };
  for (let col = 1; col <= 5; col++) {
    sheet.getRow(11).getCell(col).border = {
      top: { style: "thin", color: { argb: "FFE5E7EB" } },
      bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
      left: col === 1 ? { style: "thin", color: { argb: "FFE5E7EB" } } : undefined,
      right: col === 5 ? { style: "thin", color: { argb: "FFE5E7EB" } } : undefined,
    };
  }
  sheet.getRow(11).height = 34;

  sheet.getRow(12).height = 10;

  // Row 13: Table Header
  const tableHeaderRowIdx = 13;
  const headerRow = sheet.getRow(tableHeaderRowIdx);
  headerRow.values = [
    "Désignation des travaux",
    "Qté",
    "Unité",
    "Prix Unit. (DH)",
    "Total HT (DH)",
  ];
  headerRow.height = 26;
  headerRow.eachCell((cell, colNumber) => {
    cell.font = {
      name: "Calibri",
      size: 10,
      bold: true,
      color: { argb: "FF111827" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEAB308" },
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: colNumber === 1 ? "left" : colNumber <= 3 ? "center" : "right",
      indent: colNumber === 1 ? 1 : 0,
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FF111827" } },
      bottom: { style: "medium", color: { argb: "FF111827" } },
      left: { style: "thin", color: { argb: "FFD97706" } },
      right: { style: "thin", color: { argb: "FFD97706" } },
    };
  });

  // Line items
  const suppliedItems: DevisLineItem[] =
    options.items && options.items.length > 0
      ? options.items
      : (quote.services.length > 0
          ? quote.services
          : [quote.category || "Prestation principale"]
        ).map((label) => ({
          description: label,
          quantity: 1,
          unit: "Forfait",
          unitPrice: 0,
        }));

  const rowCount = Math.max(6, suppliedItems.length);
  const firstItemRow = tableHeaderRowIdx + 1;
  const lastItemRow = firstItemRow + rowCount - 1;

  for (let i = 0; i < rowCount; i++) {
    const rowIdx = firstItemRow + i;
    const row = sheet.getRow(rowIdx);
    const item = suppliedItems[i];
    const hasItem = Boolean(item && item.description.trim());

    row.getCell(1).value = hasItem ? safeCell(item.description) : "";
    row.getCell(2).value = hasItem ? item.quantity : null;
    row.getCell(3).value = hasItem ? safeCell(item.unit || "Forfait") : "";
    row.getCell(4).value = hasItem ? item.unitPrice : null;
    row.getCell(5).value = {
      formula: `IF(COUNT(B${rowIdx},D${rowIdx})=2,B${rowIdx}*D${rowIdx},0)`,
    };

    row.getCell(4).numFmt = "#,##0.00";
    row.getCell(5).numFmt = "#,##0.00";
    row.height = 23;

    for (let col = 1; col <= 5; col++) {
      const cell = row.getCell(col);
      cell.font = {
        name: "Calibri",
        size: 10,
        bold: col === 5 && hasItem,
        color: { argb: "FF111827" },
      };
      if (i % 2 === 1) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFAFAFA" },
        };
      }
      cell.alignment = {
        vertical: "middle",
        wrapText: col === 1,
        horizontal: col === 1 ? "left" : col <= 3 ? "center" : "right",
        indent: col === 1 ? 1 : 0,
      };
      cell.border = {
        top: { style: "hair", color: { argb: "FFE5E7EB" } },
        bottom: {
          style: i === rowCount - 1 ? "thin" : "hair",
          color: { argb: i === rowCount - 1 ? "FF9CA3AF" : "FFE5E7EB" },
        },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    }
  }

  // Totals block
  const totalHtRow = lastItemRow + 2;
  const tvaRow = totalHtRow + 1;
  const totalTtcRow = totalHtRow + 2;

  // Put Terms on left side (A..C) beside Totals (D..E)
  sheet.mergeCells(`A${totalHtRow}:C${totalHtRow}`);
  sheet.getCell(`A${totalHtRow}`).value = "CONDITIONS DE RÈGLEMENT & GARANTIE";
  sheet.getCell(`A${totalHtRow}`).font = {
    name: "Calibri",
    size: 9,
    bold: true,
    color: { argb: "FF6B7280" },
  };

  sheet.mergeCells(`A${tvaRow}:C${totalTtcRow}`);
  const termsCell = sheet.getCell(`A${tvaRow}`);
  termsCell.value = `${paymentTerms}\nGarantie décennale sur le gros œuvre • Devis valable ${validityDays} jours.`;
  termsCell.font = { name: "Calibri", size: 9, color: { argb: "FF4B5563" } };
  termsCell.alignment = { vertical: "top", wrapText: true };

  // Total HT
  sheet.getRow(totalHtRow).height = 22;
  sheet.getCell(`D${totalHtRow}`).value = "Total HT (DH)";
  sheet.getCell(`D${totalHtRow}`).font = {
    name: "Calibri",
    size: 10,
    bold: true,
    color: { argb: "FF374151" },
  };
  sheet.getCell(`D${totalHtRow}`).alignment = { horizontal: "right", vertical: "middle" };
  sheet.getCell(`E${totalHtRow}`).value = {
    formula: `SUM(E${firstItemRow}:E${lastItemRow})`,
  };
  sheet.getCell(`E${totalHtRow}`).numFmt = "#,##0.00";
  sheet.getCell(`E${totalHtRow}`).font = { name: "Calibri", size: 10, bold: true };
  sheet.getCell(`E${totalHtRow}`).alignment = { horizontal: "right", vertical: "middle" };
  sheet.getCell(`D${totalHtRow}`).border = { bottom: { style: "hair", color: { argb: "FFD1D5DB" } } };
  sheet.getCell(`E${totalHtRow}`).border = { bottom: { style: "hair", color: { argb: "FFD1D5DB" } } };

  // TVA
  sheet.getRow(tvaRow).height = 21;
  sheet.getCell(`D${tvaRow}`).value = `TVA (${tvaRate}%)`;
  sheet.getCell(`D${tvaRow}`).font = {
    name: "Calibri",
    size: 10,
    color: { argb: "FF4B5563" },
  };
  sheet.getCell(`D${tvaRow}`).alignment = { horizontal: "right", vertical: "middle" };
  sheet.getCell(`E${tvaRow}`).value = {
    formula: `E${totalHtRow}*${tvaRate / 100}`,
  };
  sheet.getCell(`E${tvaRow}`).numFmt = "#,##0.00";
  sheet.getCell(`E${tvaRow}`).font = { name: "Calibri", size: 10, color: { argb: "FF4B5563" } };
  sheet.getCell(`E${tvaRow}`).alignment = { horizontal: "right", vertical: "middle" };

  // Total TTC
  sheet.getRow(totalTtcRow).height = 28;
  sheet.getCell(`D${totalTtcRow}`).value = "TOTAL TTC (DH)";
  sheet.getCell(`D${totalTtcRow}`).font = {
    name: "Calibri",
    size: 11,
    bold: true,
    color: { argb: "FFFACC15" },
  };
  sheet.getCell(`D${totalTtcRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111827" },
  };
  sheet.getCell(`D${totalTtcRow}`).alignment = { horizontal: "right", vertical: "middle" };

  sheet.getCell(`E${totalTtcRow}`).value = {
    formula: `E${totalHtRow}+E${tvaRow}`,
  };
  sheet.getCell(`E${totalTtcRow}`).numFmt = "#,##0.00";
  sheet.getCell(`E${totalTtcRow}`).font = {
    name: "Calibri",
    size: 12,
    bold: true,
    color: { argb: "FFFACC15" },
  };
  sheet.getCell(`E${totalTtcRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF111827" },
  };
  sheet.getCell(`E${totalTtcRow}`).alignment = { horizontal: "right", vertical: "middle" };

  // Signature & Cachet Section
  const sigHeaderRow = totalTtcRow + 2;
  const sigBoxStart = sigHeaderRow + 1;
  const sigBoxEnd = sigHeaderRow + 4;

  sheet.mergeCells(`A${sigHeaderRow}:B${sigHeaderRow}`);
  sheet.getCell(`A${sigHeaderRow}`).value = "BON POUR ACCORD — SIGNATURE CLIENT";
  sheet.getCell(`A${sigHeaderRow}`).font = {
    name: "Calibri",
    size: 9,
    bold: true,
    color: { argb: "FF111827" },
  };
  sheet.getCell(`A${sigHeaderRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF3F4F6" },
  };
  sheet.getCell(`A${sigHeaderRow}`).alignment = { vertical: "middle", horizontal: "center" };

  sheet.mergeCells(`D${sigHeaderRow}:E${sigHeaderRow}`);
  sheet.getCell(`D${sigHeaderRow}`).value = "CACHET & SIGNATURE — TANKECH";
  sheet.getCell(`D${sigHeaderRow}`).font = {
    name: "Calibri",
    size: 9,
    bold: true,
    color: { argb: "FF111827" },
  };
  sheet.getCell(`D${sigHeaderRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFEF9C3" },
  };
  sheet.getCell(`D${sigHeaderRow}`).alignment = { vertical: "middle", horizontal: "center" };
  sheet.getRow(sigHeaderRow).height = 20;

  sheet.mergeCells(`A${sigBoxStart}:B${sigBoxEnd}`);
  const clientSigBox = sheet.getCell(`A${sigBoxStart}`);
  clientSigBox.value = "Date : ____ / ____ / 20____\nSignature précédée de la mention « Bon pour accord » :";
  clientSigBox.font = { name: "Calibri", size: 9, italic: true, color: { argb: "FF6B7280" } };
  clientSigBox.alignment = { vertical: "top", horizontal: "left", wrapText: true };

  sheet.mergeCells(`D${sigBoxStart}:E${sigBoxEnd}`);
  const companySigBox = sheet.getCell(`D${sigBoxStart}`);
  companySigBox.value = `${signerName}\n${siteConfig.name} — ${siteConfig.address}`;
  companySigBox.font = { name: "Calibri", size: 9, bold: true, color: { argb: "FF374151" } };
  companySigBox.alignment = { vertical: "bottom", horizontal: "center", wrapText: true };

  for (let r = sigHeaderRow; r <= sigBoxEnd; r++) {
    if (r >= sigBoxStart) sheet.getRow(r).height = 20;
    for (const col of [1, 2, 4, 5]) {
      sheet.getRow(r).getCell(col).border = {
        top: r === sigHeaderRow ? { style: "thin", color: { argb: "FFD1D5DB" } } : undefined,
        bottom:
          r === sigHeaderRow || r === sigBoxEnd
            ? { style: "thin", color: { argb: "FFD1D5DB" } }
            : undefined,
        left: col === 1 || col === 4 ? { style: "thin", color: { argb: "FFD1D5DB" } } : undefined,
        right: col === 2 || col === 5 ? { style: "thin", color: { argb: "FFD1D5DB" } } : undefined,
      };
    }
  }

  // Embed drawn handwritten signature PNG inside TANKECH signature box if provided
  if (
    options.signatureDataUrl &&
    options.signatureDataUrl.startsWith("data:image/png;base64,")
  ) {
    const base64 = options.signatureDataUrl.replace(
      /^data:image\/png;base64,/,
      ""
    );
    const imageId = workbook.addImage({
      base64,
      extension: "png",
    });
    sheet.addImage(imageId, {
      tl: { col: 3.15, row: sigBoxStart - 0.85 },
      ext: { width: 160, height: 55 },
    });
  }

  // Footer note
  const footerRowIdx = sigBoxEnd + 2;
  sheet.mergeCells(`A${footerRowIdx}:E${footerRowIdx}`);
  const footerCell = sheet.getCell(`A${footerRowIdx}`);
  const legal = [
    siteConfig.rc ? siteConfig.rc : null,
    siteConfig.ice ? `ICE : ${siteConfig.ice}` : null,
  ]
    .filter(Boolean)
    .join("  •  ");
  footerCell.value = `${siteConfig.name} — ${siteConfig.address}  •  ${siteConfig.phone}  •  ${siteConfig.email}${legal ? `  •  ${legal}` : ""}`;
  footerCell.font = { name: "Calibri", size: 8, color: { argb: "FF9CA3AF" } };
  footerCell.alignment = { vertical: "middle", horizontal: "center" };

  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().slice(0, 10);
  const clientSlug = slugifyFilename(quote.name);
  triggerDownload(
    buffer as ArrayBuffer,
    `devis-${clientSlug}-${dateStr}.xlsx`
  );
}
