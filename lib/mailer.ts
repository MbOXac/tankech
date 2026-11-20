import nodemailer from "nodemailer";
import { siteConfig } from "@/data/siteConfig";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isMailerConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export interface QuoteEmailInput {
  id?: string;
  name: string;
  phone: string;
  email: string;
  category: string;
  services: string[];
  city: string;
  message: string;
  source: string;
}

export async function sendQuoteEmail(quote: QuoteEmailInput): Promise<boolean> {
  if (!isMailerConfigured()) {
    return false;
  }

  const user = process.env.GMAIL_USER!;
  const pass = process.env.GMAIL_APP_PASSWORD!;
  const to = process.env.QUOTE_NOTIFICATION_EMAIL || siteConfig.email || user;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const servicesText =
    quote.services.length > 0 ? quote.services.join(", ") : "Non précisé";

  const subject = `[TANKECH Devis] ${quote.category || "Demande"} — ${quote.name}`;

  const text = [
    "Nouvelle demande de devis reçue sur TANKECH",
    "==========================================",
    quote.id ? `Référence : ${quote.id}` : null,
    `Nom : ${quote.name}`,
    `Téléphone : ${quote.phone}`,
    `Email : ${quote.email || "Non renseigné"}`,
    `Catégorie : ${quote.category || "Non précisée"}`,
    `Services : ${servicesText}`,
    `Ville : ${quote.city || "Non renseignée"}`,
    `Source : ${quote.source === "quote_modal" ? "Modal Services" : "Page Contact"}`,
    "",
    "Message :",
    quote.message || "Aucun message supplémentaire.",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827;">
      <div style="background: #111827; padding: 20px 24px; border-radius: 12px 12px 0 0;">
        <h1 style="margin: 0; color: #facc15; font-size: 20px;">TANKECH — Nouvelle Demande de Devis</h1>
        ${
          quote.id
            ? `<p style="margin: 6px 0 0; color: #9ca3af; font-size: 12px;">Référence : ${escapeHtml(quote.id)}</p>`
            : ""
        }
      </div>
      <div style="border: 1px solid #e5e7eb; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; background: #ffffff;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #6b7280; width: 140px;"><strong>Nom</strong></td>
            <td style="padding: 8px 0;">${escapeHtml(quote.name)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Téléphone</strong></td>
            <td style="padding: 8px 0;"><a href="tel:${escapeHtml(quote.phone)}" style="color: #111827; font-weight: bold;">${escapeHtml(quote.phone)}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Email</strong></td>
            <td style="padding: 8px 0;">${quote.email ? escapeHtml(quote.email) : "Non renseigné"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Catégorie</strong></td>
            <td style="padding: 8px 0;">${escapeHtml(quote.category || "Non précisée")}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Services</strong></td>
            <td style="padding: 8px 0;">${escapeHtml(servicesText)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #6b7280;"><strong>Ville</strong></td>
            <td style="padding: 8px 0;">${escapeHtml(quote.city || "Non renseignée")}</td>
          </tr>
        </table>
        <div style="margin-top: 16px; padding: 14px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 6px; font-size: 12px; color: #6b7280; text-transform: uppercase;"><strong>Message</strong></p>
          <p style="margin: 0; font-size: 14px; white-space: pre-wrap;">${escapeHtml(quote.message || "Aucun message supplémentaire.")}</p>
        </div>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"${siteConfig.name} Site Web" <${user}>`,
    to,
    replyTo: quote.email || undefined,
    subject,
    text,
    html,
  });

  return true;
}
