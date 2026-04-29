import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facturia — Postgres vs MongoDB",
  description: "Invoice management demo comparing Postgres and MongoDB query performance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
