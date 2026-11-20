import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

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
    const body = (await request.json()) as { featured?: boolean };
    if (typeof body.featured === "boolean") {
      await db.collection("projects").doc(id).update({ featured: body.featured });
      revalidatePath("/");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/projects/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le projet." },
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
    await db.collection("projects").doc(id).delete();
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/projects/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de supprimer le projet." },
      { status: 500 }
    );
  }
}
