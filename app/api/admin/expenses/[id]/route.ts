import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";

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
    const docRef = db.collection("expenses").doc(id);
    const snap = await docRef.get();
    if (snap.exists) {
      const data = snap.data();
      const chantierId = String(data?.chantierId ?? "");
      const amount = Math.max(0, Number(data?.amount) || 0);
      await docRef.delete();

      if (chantierId && amount > 0) {
        const chantierRef = db.collection("chantiers").doc(chantierId);
        const chantierSnap = await chantierRef.get();
        if (chantierSnap.exists) {
          const currentSpent = Number(chantierSnap.data()?.spent) || 0;
          await chantierRef.update({
            spent: Math.max(0, currentSpent - amount),
            updatedAt: FieldValue.serverTimestamp(),
          });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/expenses/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de supprimer la dépense." },
      { status: 500 }
    );
  }
}
