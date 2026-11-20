import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import type { ServiceCategory, ServiceItem } from "@/data/servicesData";
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
    const body = (await request.json()) as Partial<ServiceCategory>;
    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (typeof body.title === "string" && body.title.trim()) {
      updates.title = body.title.trim().slice(0, 120);
    }
    if (typeof body.badge === "string") {
      updates.badge = body.badge.trim().slice(0, 80);
    }
    if (typeof body.badgeColor === "string") {
      updates.badgeColor = body.badgeColor;
    }
    if (typeof body.icon === "string") {
      updates.icon = body.icon.trim().slice(0, 40);
    }
    if (typeof body.coverImage === "string" && body.coverImage.trim()) {
      updates.coverImage = body.coverImage.trim().slice(0, 500);
    }
    if (typeof body.shortDescription === "string") {
      updates.shortDescription = body.shortDescription.trim().slice(0, 500);
    }
    if (typeof body.longDescription === "string") {
      updates.longDescription = body.longDescription.trim().slice(0, 2000);
    }
    if (typeof body.emergency === "boolean") {
      updates.emergency = body.emergency;
    }
    if (Array.isArray(body.services)) {
      const cleaned: ServiceItem[] = body.services
        .filter((s) => s && typeof s.name === "string" && s.name.trim())
        .map((s, idx) => ({
          id: String(s.id || `sub-${Date.now()}-${idx}`).slice(0, 80),
          name: s.name.trim().slice(0, 120),
          description: String(s.description ?? "").trim().slice(0, 300),
        }))
        .slice(0, 30);
      updates.services = cleaned;
    }

    await db.collection("services").doc(id).update(updates);
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/contact");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[PATCH /api/admin/services/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de mettre à jour le service." },
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
    await db.collection("services").doc(id).delete();
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/contact");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/admin/services/[id]]", err);
    return NextResponse.json(
      { error: "Impossible de supprimer le service." },
      { status: 500 }
    );
  }
}
