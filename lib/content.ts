import { projectsData, type Project } from "@/data/projectsData";
import { testimonialsData, type Testimonial } from "@/data/testimonialsData";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function getPublicProjects(): Promise<Project[]> {
  const db = getAdminDb();
  if (!db) return projectsData;

  try {
    const snap = await db
      .collection("projects")
      .orderBy("createdAt", "desc")
      .get();

    if (snap.empty) return projectsData;

    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: String(data.title ?? ""),
        category: String(data.category ?? ""),
        categorySlug: String(data.categorySlug ?? ""),
        location: String(data.location ?? ""),
        description: String(data.description ?? ""),
        afterImage: String(data.afterImage ?? "/og-image.jpg"),
        beforeImage: data.beforeImage ? String(data.beforeImage) : undefined,
        featured: Boolean(data.featured),
      };
    });
  } catch {
    return projectsData;
  }
}

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  const db = getAdminDb();
  if (!db) return testimonialsData;

  try {
    const snap = await db
      .collection("testimonials")
      .orderBy("createdAt", "desc")
      .get();

    if (snap.empty) return testimonialsData;

    return snap.docs.map((doc) => {
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
  } catch {
    return testimonialsData;
  }
}
