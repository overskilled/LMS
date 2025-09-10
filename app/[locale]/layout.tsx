import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { I18nProviderClient } from "@/locales/client";
import { AuthProvider } from "@/context/authContext";

export const metadata: Metadata = {
  title: "NMD LMS - Nanosatellite Missions",
  description: "NMD LMS - Votre plateforme d'apprentissage révolutionnaire pour les missions de nanosatellites et la technologie spatiale.",
  keywords: [
    "NMD LMS",
    "nanosatellites",
    "missions spatiales",
    "technologie spatiale",
    "formation spatiale",
    "plateforme d'apprentissage",
    "éducation spatiale",
    "formation",
    "cours en ligne",
    "tutoriels spatiaux",
    "exercices interactifs",
    "évaluations",
    "apprentissage en ligne",
    "éducation numérique",
    "spécialisation",
    "formation continue",
    "apprentissage personnalisé",
    "plateforme éducative",
    "ressources pédagogiques",
    "évaluation des compétences",
    "apprentissage autonome",
    "formation professionnelle",
    "éducation à distance",
    "apprentissage interactif",
    "cours interactifs",
    "exercices en ligne",
    "évaluations en ligne",
    "apprentissage adaptatif",
    "plateforme de formation",
    "ressources éducatives",
    "éducation en ligne",
    "apprentissage collaboratif",
    "formation en ligne",
    "éducation interactive",
    "apprentissage basé sur les compétences",
    "évaluation formative",
    "satellite technology",
    "space education",
    "aerospace training",
    "CubeSat development",
  ],
  icons: {
    icon: "/nmd-logo.webp"
  }
};

interface AdminLayoutProps {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}

export default async function RootLayout({ params, children }: AdminLayoutProps) {
  const { locale } = await params;

  return (
    <html lang={locale} className="overscroll-contain scroll-smooth" suppressHydrationWarning>
      <body className="smooth-scroll antialiased">
        <AuthProvider>
          <I18nProviderClient locale={locale}>
            {children}
            <Toaster />
          </I18nProviderClient>
        </AuthProvider>
      </body>
    </html>
  );
}