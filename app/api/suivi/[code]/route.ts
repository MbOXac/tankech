import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import type { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebaseAdmin";

// Strict IP rate-limit to prevent brute-forcing 4-digit client PINs
const PIN_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const PIN_MAX_ATTEMPTS = 8;
const pinBuckets = new Map<string, number[]>();

function isPinRateLimited(key: string): boolean {
  const now = Date.now();
  if (pinBuckets.size > 500) {
    for (const [k, list] of pinBuckets.entries()) {
      const fresh = list.filter((ts) => now - ts < PIN_WINDOW_MS);
      if (fresh.length === 0) pinBuckets.delete(k);
      else pinBuckets.set(k, fresh);
    }
  }
  const list = (pinBuckets.get(key) ?? []).filter(
    (ts) => now - ts < PIN_WINDOW_MS
  );
  if (list.length >= PIN_MAX_ATTEMPTS) {
    pinBuckets.set(key, list);
    return true;
  }
  list.push(now);
  pinBuckets.set(key, list);
  return false;
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function toIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = (code ?? "").trim();

  if (!/^[a-f0-9]{16,64}$/i.test(cleanCode)) {
    return NextResponse.json(
      { error: "Lien de suivi invalide." },
      { status: 404 }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Service temporairement indisponible." },
      { status: 503 }
    );
  }

  try {
    const snap = await db
      .collection("chantiers")
      .where("trackingCode", "==", cleanCode)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { error: "Ce lien de suivi est introuvable ou a expiré." },
        { status: 404 }
      );
    }

    const data = snap.docs[0].data();
    if (!data.trackingEnabled) {
      return NextResponse.json(
        { error: "Le suivi en ligne de ce chantier n'est pas activé." },
        { status: 403 }
      );
    }

    // Never leak chantier details before PIN verification
    return NextResponse.json({
      exists: true,
      requiresPin: true,
    });
  } catch (err) {
    console.error("[GET /api/suivi/[code]]", err);
    return NextResponse.json(
      { error: "Impossible de vérifier le lien." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const cleanCode = (code ?? "").trim();

  if (!/^[a-f0-9]{16,64}$/i.test(cleanCode)) {
    return NextResponse.json(
      { error: "Lien de suivi invalide." },
      { status: 404 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isPinRateLimited(`${ip}:${cleanCode}`)) {
    return NextResponse.json(
      {
        error:
          "Trop de tentatives incorrectes. Veuillez patienter 15 minutes ou contacter TANKECH.",
      },
      { status: 429 }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Service temporairement indisponible." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { pin?: string };
    const providedPin = String(body.pin ?? "").trim();

    if (!/^\d{4,6}$/.test(providedPin)) {
      return NextResponse.json(
        { error: "Veuillez saisir votre code PIN à 4 chiffres." },
        { status: 400 }
      );
    }

    const snap = await db
      .collection("chantiers")
      .where("trackingCode", "==", cleanCode)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json(
        { error: "Lien de suivi introuvable." },
        { status: 404 }
      );
    }

    const d = snap.docs[0].data();
    if (!d.trackingEnabled || !d.trackingPin) {
      return NextResponse.json(
        { error: "Le suivi en ligne de ce chantier n'est pas activé." },
        { status: 403 }
      );
    }

    if (!safeEqual(providedPin, String(d.trackingPin))) {
      return NextResponse.json(
        { error: "Code PIN incorrect. Vérifiez le code reçu par WhatsApp." },
        { status: 401 }
      );
    }

    // Return ONLY strictly public-safe client progress fields
    // (NEVER budget, spent, phone, workers, internal notes, or PIN)
    const photos = Array.isArray(d.photos)
      ? d.photos
          .filter((p: unknown): p is Record<string, unknown> =>
            Boolean(p && typeof p === "object")
          )
          .map((p) => ({
            id: String(p.id ?? ""),
            url: String(p.url ?? ""),
            stage: String(p.stage ?? ""),
            caption: String(p.caption ?? ""),
            date: String(p.date ?? ""),
          }))
          .filter((p) => p.url.length > 0)
      : [];

    return NextResponse.json({
      chantier: {
        name: String(d.name ?? ""),
        clientName: String(d.clientName ?? ""),
        location: String(d.location ?? "Tanger"),
        category: String(d.category ?? ""),
        status: String(d.status ?? "en_cours"),
        progress: Math.min(100, Math.max(0, Number(d.progress) || 0)),
        startDate: String(d.startDate ?? ""),
        endDate: String(d.endDate ?? ""),
        photos,
        updatedAt: toIso(d.updatedAt),
      },
    });
  } catch (err) {
    console.error("[POST /api/suivi/[code]]", err);
    return NextResponse.json(
      { error: "Impossible d'ouvrir le suivi du chantier." },
      { status: 500 }
    );
  }
}
