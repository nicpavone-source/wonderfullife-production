import "./globals.css";
import type { Metadata } from "next";
import Header from "@/components/Header";
import FloatingZoey from "@/components/FloatingZoey";
import AnalyticsScripts from "@/components/AnalyticsScripts";

export const metadata: Metadata = {
  title: "WonderfulLife.ca",
  description: "A Zoey-guided wellness platform for articles, recipes, videos, habit journeys, and community."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <FloatingZoey />
        <AnalyticsScripts />
      </body>
    </html>
  );
}
