"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: "page_view",
        page_path: pathname,
        source: document.referrer || "direct",
      }),
      keepalive: true,
    }).catch(() => {
      // Analytics should never interfere with the visitor's experience.
    });
  }, [pathname]);

  return null;
}