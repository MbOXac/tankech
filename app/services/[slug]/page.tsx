import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { servicesData } from "@/data/servicesData";
import { siteConfig, whatsappLink } from "@/data/siteConfig";
import {
  getPublicProjects,
  getPublicServices,
  getPublicTestimonials,
} from "@/lib/content";
import FallbackImage from "@/components/FallbackImage";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ContactForm from "@/components/ContactForm";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Building2,
  Home,
  Droplets,
  Zap,
  Paintbrush,
  Wrench,
  Layers,
  CheckCircle2,
  Phone,
  MessageCircle,
  ArrowRight,
  ChevronRight,
  Shield,
  Clock,
  Star,
  MapPin,
} from "lucide-react";

export const revalidate = 60;

const iconMap: Record<string, React.ElementType> = {
  Building2,
  Home,
  Droplets,
  Zap,
  Paintbrush,
  Wrench,
  Layers,
};

export function generateStaticParams() {
  return servicesData.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const allServices = await getPublicServices();
  const service = allServices.find((s) => s.slug === slug);

  if (!service) {
    return { title: "Service introuvable" };
  }

  return {
    title: `${service.title} à Tanger`,
    description: `${service.shortDescription} Intervention rapide à Tanger et dans le Nord du Maroc — devis gratuit avec ${siteConfig.name}.`,
    openGraph: {
      title: `${service.title} à Tanger | ${siteConfig.name}`,
      description: service.shortDescription,
      images: [{ url: service.coverImage, width: 1200, height: 630 }],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [allServices, allProjects, allTestimonials] = await Promise.all([
    getPublicServices(),
    getPublicProjects(),
    getPublicTestimonials(),
  ]);

  const service = allServices.find((s) => s.slug === slug);
  if (!service) {
    notFound();
  }

  const Icon = iconMap[service.icon] ?? Building2;
  const relatedProjects = allProjects.filter(
    (p) => p.categorySlug === service.slug
  );
  const relatedTestimonials = allTestimonials.filter(
    (t) => t.service.toLowerCase() === service.title.toLowerCase()
  );
  const otherServices = allServices.filter((s) => s.slug !== service.slug);

  const badgeBg =
    service.badgeColor === "red"
      ? "bg-red-600"
      : service.badgeColor === "blue"
      ? "bg-blue-700"
      : service.badgeColor === "green"
      ? "bg-emerald-600"
      : service.badgeColor === "purple"
      ? "bg-purple-700"
      : service.badgeColor === "yellow"
      ? "bg-amber-600"
      : "bg-orange-500";

  return (
    <>
      {/* Split Architectural Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F4] via-[#FCFBFA] to-white border-b border-stone-200/80 pt-32 pb-16 md:pt-40 md:pb-24">
        {/* Subtle warm gold architectural accent glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-0 h-96 w-96 rounded-full bg-amber-200/25 blur-3xl"
        />

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          {/* Breadcrumb */}
          <nav
            aria-label="Fil d'Ariane"
            className="mb-5 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-500"
          >
            <Link href="/" className="hover:text-gray-900 transition">
              Accueil
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <Link href="/services" className="hover:text-gray-900 transition">
              Services
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-amber-700 font-bold">{service.title}</span>
          </nav>

          {/* Smooth Service Switcher Bar */}
          <div className="mb-10 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Link
              href="/services"
              className="shrink-0 rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-600 transition hover:border-amber-400 hover:text-gray-900"
            >
              Tous
            </Link>
            {allServices.map((s) => {
              const isCurrent = s.slug === service.slug;
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-[#0B1F44] text-white shadow-sm"
                      : "border border-stone-200 bg-white text-gray-600 hover:border-amber-400 hover:bg-amber-50 hover:text-gray-900"
                  }`}
                >
                  {s.title}
                </Link>
              );
            })}
          </div>

          <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
            {/* Left Content */}
            <div className="lg:col-span-6">
              <div className="mb-5 flex flex-wrap items-center gap-2.5">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold text-white shadow-sm ${badgeBg}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {service.badge}
                </span>
                {service.emergency && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3.5 py-1.5 text-xs font-bold text-red-700">
                    <Clock className="h-3.5 w-3.5" /> Intervention 24h/24 &amp;
                    7j/7
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-[#0B1F44] tracking-tight leading-[1.1]">
                {service.title}{" "}
                <span className="text-amber-600">à Tanger</span>
              </h1>

              <div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400" />

              <p className="mt-5 text-base sm:text-lg text-gray-600 leading-relaxed">
                {service.longDescription || service.shortDescription}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#devis-service"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-500 px-6 py-3.5 text-sm sm:text-base font-bold text-gray-950 shadow-md transition hover:bg-yellow-400 hover:shadow-lg active:scale-95"
                >
                  Demander un Devis Gratuit
                  <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={whatsappLink(
                    `Bonjour TANKECH, je souhaite un devis pour : ${service.title}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition hover:bg-green-600"
                >
                  <MessageCircle className="h-5 w-5" /> WhatsApp
                </a>
                <a
                  href={`tel:${siteConfig.phoneRaw}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3.5 text-sm sm:text-base font-bold text-[#0B1F44] shadow-sm transition hover:border-[#0B1F44] hover:bg-gray-50"
                >
                  <Phone className="h-4 w-4 text-amber-600" />{" "}
                  {siteConfig.phone}
                </a>
              </div>

              {/* Compact Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-stone-200 pt-5 text-xs font-semibold text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" /> Devis
                  gratuit sous 24h
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-amber-600" /> Artisans
                  certifiés
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-amber-600" /> Tanger &amp;
                  Nord du Maroc
                </span>
              </div>
            </div>

            {/* Right Full-Brightness Framed Photo */}
            <div className="lg:col-span-6">
              <div className="relative">
                {/* Decorative architectural offset frame */}
                <div
                  aria-hidden="true"
                  className="hidden sm:block absolute -bottom-3 -right-3 inset-0 rounded-3xl border-2 border-amber-400/50 bg-amber-50/40"
                />
                <div className="relative isolate aspect-[4/3] w-full overflow-hidden rounded-3xl bg-stone-200 shadow-2xl ring-1 ring-black/10">
                  <FallbackImage
                    src={service.coverImage}
                    alt={`${service.title} — TANKECH Tanger`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-cover"
                  />
                  {/* Floating glass badge */}
                  <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-10 flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 shadow-lg ring-1 ring-black/5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0B1F44] text-yellow-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-[#0B1F44] leading-tight">
                        {service.title}
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        {service.services.length} prestations spécialisées •
                        Tanger
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prestations Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <ScrollReveal>
            <div className="max-w-2xl mb-12">
              <span className="inline-block rounded-full bg-yellow-100 px-4 py-1 text-xs font-bold uppercase tracking-wider text-yellow-800 mb-3">
                Prestations incluses
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">
                Nos travaux en{" "}
                <span className="text-yellow-500">{service.title}</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {service.services.map((sub, i) => (
              <ScrollReveal key={sub.id} delay={i * 60}>
                <div className="h-full rounded-2xl border border-gray-100 bg-gray-50/70 p-6 transition hover:border-yellow-300 hover:bg-white hover:shadow-lg">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {sub.name}
                  </h3>
                  {sub.description && (
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {sub.description}
                    </p>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Trust bar */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3 rounded-2xl bg-gray-900 p-6 md:p-8 text-white">
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Travail Garanti</p>
                <p className="text-xs text-white/60 mt-1">
                  Artisans qualifiés, matériaux durables et garantie sur nos
                  réalisations.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Devis Gratuit sous 24h</p>
                <p className="text-xs text-white/60 mt-1">
                  Visite technique sur place à Tanger et devis transparent sans
                  engagement.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-6 w-6 text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Tanger &amp; Nord du Maroc</p>
                <p className="text-xs text-white/60 mt-1">
                  Intervention à Tanger, Tétouan, Assilah, Martil, Fnideq et
                  environs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-8">
              Réalisations en{" "}
              <span className="text-yellow-500">{service.title}</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => {
                const hasBeforeAfter = Boolean(
                  project.beforeImage &&
                    project.beforeImage !== project.afterImage
                );
                return (
                  <div
                    key={project.id}
                    className="overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm"
                  >
                    {hasBeforeAfter && project.beforeImage ? (
                      <BeforeAfterSlider
                        beforeSrc={project.beforeImage}
                        afterSrc={project.afterImage}
                        alt={project.title}
                        className="h-56 w-full"
                      />
                    ) : (
                      <div className="relative h-56 bg-gray-800">
                        <FallbackImage
                          src={project.afterImage}
                          alt={project.title}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-gray-900">
                        {project.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3.5 w-3.5" /> {project.location}
                      </p>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Related Testimonials */}
      {relatedTestimonials.length > 0 && (
        <section className="py-14 bg-gray-900 text-white">
          <div className="mx-auto max-w-5xl px-4">
            <h2 className="text-2xl font-black text-center mb-8">
              Avis clients —{" "}
              <span className="text-yellow-400">{service.title}</span>
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {relatedTestimonials.map((t) => (
                <div
                  key={t.id}
                  className="rounded-2xl bg-white/5 border border-white/10 p-6"
                >
                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${
                          idx < t.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-white/85 leading-relaxed">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="mt-4 text-xs font-bold text-white">
                    {t.name}{" "}
                    <span className="font-normal text-white/50">
                      — {t.role}, {t.location}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Dedicated Quote Form for this service */}
      <section id="devis-service" className="py-16 md:py-24 bg-gray-50">
        <div className="mx-auto max-w-3xl px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900">
              Demander un devis pour{" "}
              <span className="text-yellow-500">{service.title}</span>
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Décrivez votre besoin et recevez une estimation gratuite sous 24h.
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-gray-100 shadow-lg p-6 md:p-10">
            <ContactForm
              services={allServices}
              defaultService={service.title}
            />
          </div>
        </div>
      </section>

      {/* Other Services SEO Cross-links */}
      <section className="py-14 bg-white border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-xl font-black text-gray-900 mb-6">
            Découvrir nos autres services
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {otherServices.map((s) => {
              const OtherIcon = iconMap[s.icon] ?? Building2;
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-yellow-400 hover:bg-yellow-50 hover:text-gray-900"
                >
                  <OtherIcon className="h-4 w-4 text-yellow-600" />
                  {s.title}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
