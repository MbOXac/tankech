import { NextRequest, NextResponse } from "next/server";
import type { Timestamp } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import type { QuoteRecord, QuoteStatus } from "@/lib/types";

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
      { error: "Impossible de charger les devis." },
      { status: 500 }
    );
  }
}
