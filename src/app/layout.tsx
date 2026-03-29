import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Epicare Plans Search",
  description: "Technical test with Next.js + Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
