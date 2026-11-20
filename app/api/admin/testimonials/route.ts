import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import { testimonialsData } from "@/data/testimonialsData";
import { revalidatePath } from "next/cache";

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
      .collection("testimonials")
      .orderBy("createdAt", "desc")
      .get();

    const testimonials = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: String(data.name ?? ""),
        role: String(data.role ?? ""),
        location: String(data.location ?? ""),
        text: String(data.text ?? ""),
        rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
        service: String(data.service ?? ""),
      };
    });

    return NextResponse.json({ testimonials });
  } catch (err) {
    console.error("[GET /api/admin/testimonials]", err);
    return NextResponse.json(
      { error: "Impossible de charger les témoignages." },
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
    const body = (await request.json()) as {
      seedDefaults?: boolean;
      name?: string;
      role?: string;
      location?: string;
      text?: string;
      rating?: number;
      service?: string;
    };

    if (body.seedDefaults) {
      const batch = db.batch();
      for (const item of testimonialsData) {
        const ref = db.collection("testimonials").doc(item.id);
        batch.set(ref, {
          name: item.name,
          role: item.role,
          location: item.location,
          text: item.text,
          rating: item.rating,
          service: item.service,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      revalidatePath("/");
      return NextResponse.json({ ok: true, seeded: testimonialsData.length });
    }

    const name = (body.name ?? "").trim().slice(0, 100);
    const role = (body.role ?? "").trim().slice(0, 100);
    const location = (body.location ?? "").trim().slice(0, 100);
    const text = (body.text ?? "").trim().slice(0, 1000);
    const service = (body.service ?? "").trim().slice(0, 100);
    const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating) || 5)));

    if (!name || !text) {
      return NextResponse.json(
        { error: "Nom et avis du client sont requis." },
        { status: 400 }
      );
    }

    const ref = await db.collection("testimonials").add({
      name,
      role: role || "Client",
      location: location || "Tanger",
      text,
      rating,
      service: service || "Construction & Rénovation",
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/");
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/testimonials]", err);
    return NextResponse.json(
      { error: "Impossible d'ajouter le témoignage." },
      { status: 500 }
    );
  }
}
