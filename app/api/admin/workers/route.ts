import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import type { WorkerRecord } from "@/lib/types";

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
      .collection("workers")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const workers: WorkerRecord[] = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        name: String(d.name ?? ""),
        phone: String(d.phone ?? ""),
        cin: String(d.cin ?? ""),
        specialty: String(d.specialty ?? "Maçon"),
        dailyRate: Math.max(0, Number(d.dailyRate) || 0),
        active: d.active !== false,
        notes: String(d.notes ?? ""),
        createdAt: toIso(d.createdAt),
        updatedAt: toIso(d.updatedAt),
      };
    });

    return NextResponse.json({ workers });
  } catch (err) {
    console.error("[GET /api/admin/workers]", err);
    return NextResponse.json(
      { error: "Impossible de charger les ouvriers." },
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
    const body = (await request.json()) as Partial<WorkerRecord>;
    const name = String(body.name ?? "").trim().slice(0, 120);
    if (!name) {
      return NextResponse.json(
        { error: "Le nom de l'ouvrier est requis." },
        { status: 400 }
      );
    }

    const ref = await db.collection("workers").add({
      name,
      phone: String(body.phone ?? "").trim().slice(0, 30),
      cin: String(body.cin ?? "").trim().slice(0, 30),
      specialty: String(body.specialty ?? "Maçon").trim().slice(0, 80),
      dailyRate: Math.max(0, Number(body.dailyRate) || 0),
      active: body.active !== false,
      notes: String(body.notes ?? "").trim().slice(0, 1000),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/workers]", err);
    return NextResponse.json(
      { error: "Impossible d'ajouter l'ouvrier." },
      { status: 500 }
    );
  }
}
