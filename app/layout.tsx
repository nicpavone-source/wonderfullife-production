import "./globals.css";
import type { Metadata } from "next";
import SiteChrome from "@/components/SiteChrome";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import BackToTop from "@/components/BackToTop";
import PageViewTracker from "@/components/PageViewTracker";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "WonderfulLife.ca",
  description:
    "A Zoey-guided wellness platform for articles, recipes, videos and community.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteChrome />

        {children}

        <BackToTop />

        <PageViewTracker />

        <AnalyticsScripts />

        <Analytics />
      </body>
    </html>
  );
}