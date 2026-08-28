"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import FloatingZoey from "@/components/FloatingZoey";

export default function SiteChrome() {
  const pathname = usePathname();
  const isStudioPage = pathname.startsWith("/studio");

  if (isStudioPage) {
    return null;
  }

  return (
    <>
      <Header />
      <FloatingZoey />
    </>
  );
}