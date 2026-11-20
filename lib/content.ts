import { projectsData, type Project } from "@/data/projectsData";
import { testimonialsData, type Testimonial } from "@/data/testimonialsData";
import { servicesData, type ServiceCategory } from "@/data/servicesData";
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

const VALID_BADGE_COLORS = new Set([
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "orange",
]);

export async function getPublicServices(): Promise<ServiceCategory[]> {
  const db = getAdminDb();
  if (!db) return servicesData;

  try {
    const snap = await db.collection("services").orderBy("order", "asc").get();
    if (snap.empty) return servicesData;

    return snap.docs.map((doc) => {
      const data = doc.data();
      const rawColor = String(data.badgeColor ?? "blue");
      const badgeColor = (
        VALID_BADGE_COLORS.has(rawColor) ? rawColor : "blue"
      ) as ServiceCategory["badgeColor"];

      const subServices = Array.isArray(data.services)
        ? data.services
            .filter(
              (item): item is { id?: string; name?: string; description?: string } =>
                Boolean(item && typeof item === "object")
            )
            .map((item, idx) => ({
              id: String(item.id || `srv-${idx}`),
              name: String(item.name || ""),
              description: String(item.description || ""),
            }))
            .filter((item) => item.name.length > 0)
        : [];

      return {
        slug: String(data.slug || doc.id),
        title: String(data.title ?? ""),
        badge: String(data.badge ?? ""),
        badgeColor,
        icon: String(data.icon ?? "Building2"),
        coverImage: String(data.coverImage ?? "/og-image.jpg"),
        shortDescription: String(data.shortDescription ?? ""),
        longDescription: String(data.longDescription ?? ""),
        emergency: Boolean(data.emergency),
        services: subServices,
      };
    });
  } catch {
    return servicesData;
  }
}
