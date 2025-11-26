import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobMatch AI - Candidature Chirurgicale",
  description:
    "Optimisez votre CV et lettre de motivation pour chaque offre d'emploi avec l'IA. Éthique et honnête.",
  keywords: ["CV", "lettre de motivation", "emploi", "IA", "candidature"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        <main className="min-h-screen">{children}</main>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
