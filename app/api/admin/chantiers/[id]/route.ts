import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  try {
    const body = (await request.json()) as Partial<ChantierRecord> & {
      regenerateTracking?: boolean;
    };
    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim().slice(0, 150);
    }
    if (typeof body.clientName === "string") {
      updates.clientName = body.clientName.trim().slice(0, 120);
    }
    if (typeof body.clientPhone === "string") {
      updates.clientPhone = body.clientPhone.trim().slice(0, 30);
    }
    if (typeof body.location === "string") {
      updates.location = body.location.trim().slice(0, 150);
    }
    if (typeof body.category === "string") {
      updates.category = body.category.trim().slice(0, 100);
    }
    if (body.status !== undefined && ALLOWED_STATUSES.includes(body.status)) {
      updates.status = body.status;
    }
    if (typeof body.progress === "number") {
      updates.progress = Math.min(100, Math.max(0, Math.round(body.progress)));
    }
    if (typeof body.budget === "number") {
      updates.budget = Math.max(0, body.budget);
    }
    if (typeof body.spent === "number") {
      updates.spent = Math.max(0, body.spent);
    }
    if (typeof body.startDate === "string") {
      updates.startDate = body.startDate.trim().slice(0, 30);
    }
    if (typeof body.endDate === "string") {
      updates.endDate = body.endDate.trim().slice(0, 30);
    }
    if (Array.isArray(body.assignedWorkerIds)) {
      updates.assignedWorkerIds = body.assignedWorkerIds
        .map(String)
        .slice(0, 50);
    }
    if (Array.isArray(body.photos)) {
      updates.photos = normalizePhotos(body.photos);
    }
    if (body.regenerateTracking) {
      updates.trackingCode = generateTrackingCode();
      updates.trackingPin = generateTrackingPin();
      updates.trackingEnabled = true;
    } else if (typeof body.trackingEnabled === "boolean") {
      updates.trackingEnabled = body.trackingEnabled;
      if (body.trackingEnabled) {
        const snap = await db.collection("chantiers").doc(id).get();
        const existing = snap.data();
        if (!existing?.trackingCode) {
          updates.trackingCode = generateTrackingCode();
        }
        if (!existing?.trackingPin) {
          updates.trackingPin = generateTrackingPin();
        }
      }
    }
    if (typeof body.notes === "string") {
      updates.notes = body.notes.slice(0, 2000);
    }

    await db.collection("chantiers").doc(id).update(updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/chantiers/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le chantier." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  try {
    await db.collection("chantiers").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/chantiers/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de supprimer le chantier." },
      { status: 500 }
    );
  }
}
