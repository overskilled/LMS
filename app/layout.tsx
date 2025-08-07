import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/authContext";

export const metadata: Metadata = {
  title: {
    default: "NMD LMS – Learn Anytime, Anywhere",
    template: "%s | NMD LMS",
  },
  description:
    "NMD LMS is a powerful learning management platform offering high-quality courses with interactive lessons, videos, and certifications to boost your knowledge and skills.",
  keywords: [
    "LMS",
    "Online Learning",
    "E-learning",
    "Courses",
    "Education",
    "Learning Platform",
    "NMD LMS",
  ],
  authors: [{ name: "NMD LMS Team", url: "https://nmd-lms.com" }],
  creator: "NMD LMS",
  publisher: "NMD LMS",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nmd-lms.com",
    siteName: "NMD LMS",
    title: "NMD LMS – Learn Anytime, Anywhere",
    description:
      "Access top-quality courses, expert instructors, and interactive learning experiences on NMD LMS.",
    images: [
      {
        url: "/nmd-logo.webp",
        width: 1200,
        height: 630,
        alt: "NMD LMS Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NMD LMS – Learn Anytime, Anywhere",
    description:
      "Discover online courses, interactive learning, and certifications with NMD LMS.",
    creator: "@nmd_lms",
    images: ["/nmd-logo.webp"],
  },
  icons: {
    icon: "/nmd-logo.webp",
    shortcut: "/nmd-logo.webp",
    apple: "/nmd-logo.webp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  metadataBase: new URL("https://nmd-lms.com"),
  alternates: {
    canonical: "https://nmd-lms.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/nmd-logo.webp" type="image/webp" />
        <meta name="theme-color" content="#ffffff" />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "NMD LMS",
              url: "https://nmd-lms.com",
              logo: "https://nmd-lms.com/nmd-logo.webp",
              sameAs: [
                "https://twitter.com/nmd_lms",
                "https://www.linkedin.com/company/nmd-lms",
              ],
            }),
          }}
        />
      </head>
      <body className="flex flex-col w-[100%] antialiased bg-white text-gray-900">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>

      </body>
    </html>
  );
}
