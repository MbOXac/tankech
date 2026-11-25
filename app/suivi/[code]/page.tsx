import type { Metadata } from "next";
import ClientTrackingView from "@/components/ClientTrackingView";

export const metadata: Metadata = {
  title: "Suivi de Chantier Privé",
  description: "Espace privé de suivi d'avancement de votre chantier TANKECH.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function ClientTrackingPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ClientTrackingView code={code} />;
}
