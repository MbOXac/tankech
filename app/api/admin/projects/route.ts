import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb, verifyAdminRequest } from "@/lib/firebaseAdmin";
import { projectsData } from "@/data/projectsData";
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
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();

    const projects = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: String(data.title ?? ""),
        category: String(data.category ?? ""),
        categorySlug: String(data.categorySlug ?? ""),
        location: String(data.location ?? ""),
        description: String(data.description ?? ""),
        afterImage: String(data.afterImage ?? "/og-image.jpg"),
        beforeImage: data.beforeImage ? String(data.beforeImage) : "",
        featured: Boolean(data.featured),
      };
    });

    return NextResponse.json({ projects });
  } catch (err) {
    console.error("[GET /api/admin/projects]", err);
    return NextResponse.json(
      { error: "Impossible de charger les projets." },
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
      title?: string;
      category?: string;
      categorySlug?: string;
      location?: string;
      description?: string;
      afterImage?: string;
      beforeImage?: string;
      featured?: boolean;
    };

    if (body.seedDefaults) {
      const batch = db.batch();
      for (const project of projectsData) {
        const ref = db.collection("projects").doc(project.id);
        batch.set(ref, {
          title: project.title,
          category: project.category,
          categorySlug: project.categorySlug,
          location: project.location,
          description: project.description,
          afterImage: project.afterImage,
          beforeImage: project.beforeImage ?? "",
          featured: project.featured,
          createdAt: FieldValue.serverTimestamp(),
        });
      }
      await batch.commit();
      revalidatePath("/");
      return NextResponse.json({ ok: true, seeded: projectsData.length });
    }

    const title = (body.title ?? "").trim().slice(0, 120);
    const category = (body.category ?? "").trim().slice(0, 80);
    const categorySlug = (body.categorySlug ?? "").trim().slice(0, 80);
    const location = (body.location ?? "").trim().slice(0, 120);
    const description = (body.description ?? "").trim().slice(0, 1000);
    const afterImage = (body.afterImage ?? "/og-image.jpg").trim().slice(0, 500);
    const beforeImage = (body.beforeImage ?? "").trim().slice(0, 500);

    if (!title || !category || !location) {
      return NextResponse.json(
        { error: "Titre, catégorie et localisation sont requis." },
        { status: 400 }
      );
    }

    const ref = await db.collection("projects").add({
      title,
      category,
      categorySlug: categorySlug || "renovation",
      location,
      description,
      afterImage: afterImage || "/og-image.jpg",
      beforeImage,
      featured: Boolean(body.featured),
      createdAt: FieldValue.serverTimestamp(),
    });

    revalidatePath("/");
    return NextResponse.json({ ok: true, id: ref.id }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/projects]", err);
    return NextResponse.json(
      { error: "Impossible d'ajouter le projet." },
      { status: 500 }
    );
  }
}
