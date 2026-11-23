import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PublicChrome from "@/components/PublicChrome";
import { siteConfig } from "@/data/siteConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "construction Tanger",
    "rénovation Maroc",
    "plomberie Tanger",
    "électricité Tanger",
    "peinture tadelakt",
    "résine époxy Tanger",
    "sol époxy Maroc",
    "aménagement Tanger",
    "gros œuvre Maroc",
    "devis construction",
    "entreprise construction Tanger",
    "TANKECH",
  ],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    type: "website",
    locale: "fr_MA",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className={`${inter.className} bg-white text-gray-900 antialiased`}>
        <PublicChrome>{children}</PublicChrome>
      </body>
    </html>
  );
}
