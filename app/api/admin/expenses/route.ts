import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import type { ExpenseRecord } from "@/lib/types";

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
      .collection("expenses")
      .orderBy("createdAt", "desc")
      .limit(300)
      .get();

    const expenses: ExpenseRecord[] = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        chantierId: String(d.chantierId ?? ""),
        chantierName: String(d.chantierName ?? ""),
        category: String(d.category ?? "Matériaux"),
        description: String(d.description ?? ""),
        amount: Math.max(0, Number(d.amount) || 0),
        date: String(d.date ?? ""),
        supplier: String(d.supplier ?? ""),
        createdAt: toIso(d.createdAt),
      };
    });

    return NextResponse.json({ expenses });
  } catch (err) {
    console.error("[GET /api/admin/expenses]", err);
    return NextResponse.json(
      { error: "Impossible de charger les dépenses." },
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
    const body = (await request.json()) as Partial<ExpenseRecord>;
    const description = String(body.description ?? "").trim().slice(0, 300);
    const amount = Math.max(0, Number(body.amount) || 0);

    if (!description || amount <= 0) {
      return NextResponse.json(
        { error: "Description et montant (> 0) sont requis." },
        { status: 400 }
      );
    }

    const chantierId = String(body.chantierId ?? "").trim().slice(0, 128);
    const chantierName = String(body.chantierName ?? "").trim().slice(0, 150);

    const ref = await db.collection("expenses").add({
      chantierId,
      chantierName,
      category: String(body.category ?? "Matériaux").trim().slice(0, 80),
      description,
      amount,
      date:
        String(body.date ?? "").trim().slice(0, 30) ||
        new Date().toISOString().slice(0, 10),
      supplier: String(body.supplier ?? "").trim().slice(0, 120),
      createdAt: FieldValue.serverTimestamp(),
    });

    // Keep linked chantier's spent amount synced
    if (chantierId) {
      await db
        .collection("chantiers")
        .doc(chantierId)
        .update({
          spent: FieldValue.increment(amount),
          updatedAt: FieldValue.serverTimestamp(),
        })
        .catch(() => {
          // Chantier might have been deleted; ignore
        });
    }

    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/expenses]", err);
    return NextResponse.json(
      { error: "Impossible d'ajouter la dépense." },
      { status: 500 }
    );
  }
}
