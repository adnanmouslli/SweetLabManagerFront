import type { Metadata } from "next";
import "./globals.css";
import LayoutProviders from "@/components/providers/LayoutProviders";

export const metadata: Metadata = {
  title: "مخبز الإحسان الدمشقي",
  description: "موقع حلويات الشام",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar">
      <body>
        <LayoutProviders>{children}</LayoutProviders>
      </body>
    </html>
  );
}
