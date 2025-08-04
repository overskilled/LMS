import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "NMD LMS",
  description: "Learning management",
  icons: {
    icon: "/nmd-logo.webp",
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/nmd-logo.webp"
          type="image/webp"
        />
      </head>
      <body className=" flex flex-col w-[100%]">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
