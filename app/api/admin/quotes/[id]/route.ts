import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import type { QuoteStatus } from "@/lib/types";

const ALLOWED_STATUSES: QuoteStatus[] = [
  "nouveau",
  "contacte",
  "devis_envoye",
  "termine",
  "archive",
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
    const body = (await request.json()) as {
      status?: QuoteStatus;
      notes?: string;
    };

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (body.status !== undefined) {
      if (!ALLOWED_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { error: "Statut invalide." },
          { status: 400 }
        );
      }
      updates.status = body.status;
    }

    if (typeof body.notes === "string") {
      updates.notes = body.notes.slice(0, 2000);
    }

    await db.collection("quotes").doc(id).update(updates);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/quotes/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le devis." },
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
    await db.collection("quotes").doc(id).delete();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/quotes/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de supprimer le devis." },
      { status: 500 }
    );
  }
}
