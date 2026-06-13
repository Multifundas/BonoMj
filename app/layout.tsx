import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compensación — True-Up & Production Bonus",
  description:
    "Plataforma de compensación: salary true-up y production bonus para staff attorney.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
