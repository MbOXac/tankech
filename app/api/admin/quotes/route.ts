import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import {
  formatFirestoreError,
  getAdminDb,
  verifyAdminRequest,
} from "@/lib/firebaseAdmin";
import type { QuoteRecord, QuoteStatus } from "@/lib/types";

const ALLOWED_STATUSES: QuoteStatus[] = [
  "nouveau",
  "contacte",
  "devis_envoye",
  "termine",
  "archive",
];

function toIso(value: unknown): string {
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export async function GET(request: NextRequest) {
  const authResult = await verifyAdminRequest(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore n'est pas configuré." },
      { status: 503 }
    );
  }

  try {
    const snap = await db
      .collection("quotes")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const quotes: QuoteRecord[] = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: String(data.name ?? ""),
        phone: String(data.phone ?? ""),
        email: String(data.email ?? ""),
        category: String(data.category ?? ""),
        services: Array.isArray(data.services)
          ? data.services.map(String)
          : [],
        city: String(data.city ?? ""),
        message: String(data.message ?? ""),
        status: (data.status as QuoteStatus) || "nouveau",
        notes: String(data.notes ?? ""),
        source:
          data.source === "quote_modal" ? "quote_modal" : "contact_page",
        createdAt: toIso(data.createdAt),
        updatedAt: toIso(data.updatedAt),
      };
    });

    return NextResponse.json({ quotes });
  } catch (err) {
    console.error("[GET /api/admin/quotes]", err);
    return NextResponse.json(
      { error: formatFirestoreError(err, "Impossible de charger les devis.") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResult = await verifyAdminRequest(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const db = getAdminDb();
  if (!db) {
    return NextResponse.json(
      { error: "Firestore n'est pas configuré." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as Partial<QuoteRecord>;
    const name = String(body.name ?? "").trim().slice(0, 120);
    const phone = String(body.phone ?? "").trim().slice(0, 30);

    if (name.length < 2 || phone.length < 6) {
      return NextResponse.json(
        { error: "Le nom du client et un numéro de téléphone valide sont requis." },
        { status: 400 }
      );
    }

    const status: QuoteStatus =
      body.status && ALLOWED_STATUSES.includes(body.status)
        ? body.status
        : "nouveau";

    const services = Array.isArray(body.services)
      ? body.services.map(String).filter(Boolean).slice(0, 20)
      : body.category
      ? [String(body.category).trim()]
      : [];

    const ref = await db.collection("quotes").add({
      name,
      phone,
      email: String(body.email ?? "").trim().slice(0, 150),
      category: String(body.category ?? "").trim().slice(0, 100),
      services,
      city: String(body.city ?? "Tanger").trim().slice(0, 100),
      message: String(body.message ?? "").trim().slice(0, 2000),
      status,
      notes: String(body.notes ?? "").trim().slice(0, 2000),
      source: "contact_page",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/quotes]", err);
    return NextResponse.json(
      { error: formatFirestoreError(err, "Impossible de créer le devis.") },
      { status: 500 }
    );
  }
}
