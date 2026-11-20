import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import type { WorkerRecord } from "@/lib/types";

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
    const body = (await request.json()) as Partial<WorkerRecord>;
    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim().slice(0, 120);
    }
    if (typeof body.phone === "string") {
      updates.phone = body.phone.trim().slice(0, 30);
    }
    if (typeof body.cin === "string") {
      updates.cin = body.cin.trim().slice(0, 30);
    }
    if (typeof body.specialty === "string") {
      updates.specialty = body.specialty.trim().slice(0, 80);
    }
    if (typeof body.dailyRate === "number") {
      updates.dailyRate = Math.max(0, body.dailyRate);
    }
    if (typeof body.active === "boolean") {
      updates.active = body.active;
    }
    if (typeof body.notes === "string") {
      updates.notes = body.notes.slice(0, 1000);
    }

    await db.collection("workers").doc(id).update(updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/workers/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour l'ouvrier." },
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
    await db.collection("workers").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/workers/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de supprimer l'ouvrier." },
      { status: 500 }
    );
  }
}
