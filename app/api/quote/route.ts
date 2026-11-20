import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { sendQuoteEmail } from "@/lib/mailer";
import type { QuotePayload } from "@/lib/types";

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 6;
const rateBuckets = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (rateBuckets.size > 500) {
    for (const [key, list] of rateBuckets.entries()) {
      const fresh = list.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (fresh.length === 0) {
        rateBuckets.delete(key);
      } else {
        rateBuckets.set(key, fresh);
      }
    }
  }
  const timestamps = (rateBuckets.get(ip) ?? []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateBuckets.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  rateBuckets.set(ip, timestamps);
  return false;
}

function cleanString(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Trop de demandes envoyées. Veuillez patienter quelques minutes ou nous contacter par WhatsApp.",
        },
        { status: 429 }
      );
    }

    const body = (await request.json()) as QuotePayload;

    // Honeypot check — silently accept bots without storing/emailing
    if (typeof body.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json({
        ok: true,
        id: null,
        savedToDb: false,
        emailSent: false,
      });
    }

    const name = cleanString(body.name, 120);
    const phone = cleanString(body.phone, 30);
    const email = cleanString(body.email, 150);
    const category = cleanString(body.category, 100);
    const city = cleanString(body.city, 100);
    const message = cleanString(body.message, 2000);
    const source =
      body.source === "quote_modal" ? "quote_modal" : "contact_page";

    const services = Array.isArray(body.services)
      ? body.services
          .filter((s): s is string => typeof s === "string")
          .map((s) => s.trim().slice(0, 100))
          .filter(Boolean)
          .slice(0, 20)
      : [];

    if (name.length < 2) {
      return NextResponse.json(
        { ok: false, error: "Veuillez saisir votre nom complet." },
        { status: 400 }
      );
    }

    if (phone.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Veuillez saisir un numéro de téléphone valide." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { ok: false, error: "L'adresse email semble invalide." },
        { status: 400 }
      );
    }

    let docId: string | null = null;
    let savedToDb = false;
    let emailSent = false;

    const db = getAdminDb();
    if (db) {
      try {
        const ref = await db.collection("quotes").add({
          name,
          phone,
          email,
          category,
          services,
          city,
          message,
          status: "nouveau",
          notes: "",
          source,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
        docId = ref.id;
        savedToDb = true;
      } catch (err) {
        console.error("[POST /api/quote] Firestore write failed:", err);
      }
    }

    try {
      emailSent = await sendQuoteEmail({
        id: docId ?? undefined,
        name,
        phone,
        email,
        category,
        services,
        city,
        message,
        source,
      });
    } catch (err) {
      console.error("[POST /api/quote] Email send failed:", err);
    }

    return NextResponse.json(
      {
        ok: true,
        id: docId,
        savedToDb,
        emailSent,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requête invalide." },
      { status: 400 }
    );
  }
}
