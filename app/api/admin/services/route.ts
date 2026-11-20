import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import { servicesData, type ServiceCategory } from "@/data/servicesData";
import { revalidatePath } from "next/cache";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
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
    const snap = await db.collection("services").orderBy("order", "asc").get();
    const services: ServiceCategory[] = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        slug: String(d.slug || doc.id),
        title: String(d.title ?? ""),
        badge: String(d.badge ?? ""),
        badgeColor: (d.badgeColor as ServiceCategory["badgeColor"]) || "blue",
        icon: String(d.icon ?? "Building2"),
        coverImage: String(d.coverImage ?? "/og-image.jpg"),
        shortDescription: String(d.shortDescription ?? ""),
        longDescription: String(d.longDescription ?? ""),
        emergency: Boolean(d.emergency),
        services: Array.isArray(d.services) ? d.services : [],
      };
    });

    return NextResponse.json({ services });
  } catch (err) {
    console.error("[GET /api/admin/services]", err);
    return NextResponse.json(
      { error: "Impossible de charger les services." },
      { status: 500 }
    );
  }
}

function sanitizeImageUrl(raw: string | undefined, fallback: string): string {
  const url = (raw ?? "").trim().slice(0, 500);
  if (!url || url.includes("..")) return fallback;
  if (url.startsWith("https://")) return url;
  if (!url.startsWith("//") && /^\/[a-zA-Z0-9._/-]+$/.test(url)) return url;
  return fallback;
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
    const body = (await request.json()) as Partial<ServiceCategory> & {
      seedDefaults?: boolean;
    };

    if (body.seedDefaults) {
      const batch = db.batch();
      servicesData.forEach((cat, idx) => {
        const ref = db.collection("services").doc(cat.slug);
        batch.set(ref, {
          ...cat,
          emergency: Boolean(cat.emergency),
          order: idx,
          updatedAt: FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      revalidatePath("/");
      revalidatePath("/services");
      revalidatePath("/contact");
      return NextResponse.json({ ok: true, seeded: servicesData.length });
    }

    const title = String(body.title ?? "").trim().slice(0, 120);
    if (!title) {
      return NextResponse.json(
        { error: "Le titre de la catégorie est requis." },
        { status: 400 }
      );
    }

    const slug = slugify(body.slug || title) || `service-${Date.now()}`;
    const existingSnap = await db.collection("services").get();

    await db
      .collection("services")
      .doc(slug)
      .set({
        slug,
        title,
        badge: String(body.badge ?? "Service Pro").trim().slice(0, 80),
        badgeColor: body.badgeColor || "blue",
        icon: String(body.icon ?? "Wrench").trim().slice(0, 40),
        coverImage: sanitizeImageUrl(body.coverImage, "/og-image.jpg"),
        shortDescription: String(body.shortDescription ?? "")
          .trim()
          .slice(0, 500),
        longDescription: String(
          body.longDescription || body.shortDescription || ""
        )
          .trim()
          .slice(0, 2000),
        emergency: Boolean(body.emergency),
        services: Array.isArray(body.services) ? body.services : [],
        order: existingSnap.size,
        updatedAt: FieldValue.serverTimestamp(),
      });

    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/contact");
    return NextResponse.json({ ok: true, slug }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/services]", err);
    return NextResponse.json(
      { error: "Impossible de créer la catégorie de service." },
      { status: 500 }
    );
  }
}
