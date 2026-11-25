import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import type { ChantierPhoto, ChantierRecord, ChantierStatus } from "@/lib/types";

function generateTrackingCode(): string {
  return crypto.randomBytes(12).toString("hex");
}

function generateTrackingPin(): string {
  return String(crypto.randomInt(1000, 10000));
}

function sanitizePhotoUrl(raw: unknown): string {
  const url = String(raw ?? "").trim().slice(0, 1000);
  if (!url || url.includes("..")) return "";
  if (url.startsWith("https://")) return url;
  if (!url.startsWith("//") && /^\/[a-zA-Z0-9._/-]+$/.test(url)) return url;
  return "";
}

function normalizePhotos(raw: unknown): ChantierPhoto[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((item): item is Record<string, unknown> =>
      Boolean(item && typeof item === "object")
    )
    .map((item, idx) => ({
      id: String(item.id || `photo-${Date.now()}-${idx}`).slice(0, 80),
      url: sanitizePhotoUrl(item.url),
      caption: String(item.caption ?? "").trim().slice(0, 150),
      stage: String(item.stage ?? "").trim().slice(0, 60),
      date: String(item.date ?? "").trim().slice(0, 30),
    }))
    .filter((p) => p.url.length > 0)
    .slice(0, 30);
}

const ALLOWED_STATUSES: ChantierStatus[] = [
  "planifie",
  "en_cours",
  "en_pause",
  "termine",
  "annule",
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
      .collection("chantiers")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const chantiers: ChantierRecord[] = snap.docs.map((doc) => {
      const d = doc.data();
      const rawStatus = String(d.status ?? "planifie") as ChantierStatus;
      return {
        id: doc.id,
        name: String(d.name ?? ""),
        clientName: String(d.clientName ?? ""),
        clientPhone: String(d.clientPhone ?? ""),
        location: String(d.location ?? ""),
        category: String(d.category ?? ""),
        status: ALLOWED_STATUSES.includes(rawStatus) ? rawStatus : "planifie",
        progress: Math.min(100, Math.max(0, Number(d.progress) || 0)),
        budget: Math.max(0, Number(d.budget) || 0),
        spent: Math.max(0, Number(d.spent) || 0),
        startDate: String(d.startDate ?? ""),
        endDate: String(d.endDate ?? ""),
        assignedWorkerIds: Array.isArray(d.assignedWorkerIds)
          ? d.assignedWorkerIds.map(String)
          : [],
        photos: normalizePhotos(d.photos),
        trackingCode: d.trackingCode ? String(d.trackingCode) : "",
        trackingPin: d.trackingPin ? String(d.trackingPin) : "",
        trackingEnabled: Boolean(d.trackingEnabled),
        notes: String(d.notes ?? ""),
        createdAt: toIso(d.createdAt),
        updatedAt: toIso(d.updatedAt),
      };
    });

    return NextResponse.json({ chantiers });
  } catch (err) {
    console.error("[GET /api/admin/chantiers]", err);
    return NextResponse.json(
      { error: "Impossible de charger les chantiers." },
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
    const body = (await request.json()) as Partial<ChantierRecord>;
    const name = String(body.name ?? "").trim().slice(0, 150);
    if (!name) {
      return NextResponse.json(
        { error: "Le nom du chantier est requis." },
        { status: 400 }
      );
    }

    const status: ChantierStatus =
      body.status && ALLOWED_STATUSES.includes(body.status)
        ? body.status
        : "planifie";

    const ref = await db.collection("chantiers").add({
      name,
      clientName: String(body.clientName ?? "").trim().slice(0, 120),
      clientPhone: String(body.clientPhone ?? "").trim().slice(0, 30),
      location: String(body.location ?? "Tanger").trim().slice(0, 150),
      category: String(body.category ?? "Gros Œuvre").trim().slice(0, 100),
      status,
      progress: Math.min(100, Math.max(0, Math.round(Number(body.progress) || 0))),
      budget: Math.max(0, Number(body.budget) || 0),
      spent: Math.max(0, Number(body.spent) || 0),
      startDate: String(body.startDate ?? "").trim().slice(0, 30),
      endDate: String(body.endDate ?? "").trim().slice(0, 30),
      assignedWorkerIds: Array.isArray(body.assignedWorkerIds)
        ? body.assignedWorkerIds.map(String).slice(0, 50)
        : [],
      photos: normalizePhotos(body.photos),
      trackingCode: generateTrackingCode(),
      trackingPin: generateTrackingPin(),
      trackingEnabled: false,
      notes: String(body.notes ?? "").trim().slice(0, 2000),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/chantiers]", err);
    return NextResponse.json(
      { error: "Impossible de créer le chantier." },
      { status: 500 }
    );
  }
}
