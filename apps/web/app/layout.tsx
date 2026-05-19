import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Axovion CRM",
  description: "AI-powered multi-tenant CRM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
