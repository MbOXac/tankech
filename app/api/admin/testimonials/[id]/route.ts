import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import { revalidatePath } from "next/cache";

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
    await db.collection("testimonials").doc(id).delete();
    revalidatePath("/");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/testimonials/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de supprimer le témoignage." },
      { status: 500 }
    );
  }
}
