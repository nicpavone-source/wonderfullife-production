import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import "../../components/studio/styles/studio.css";
import StudioLayout from "../../components/studio/layout/StudioLayout";

import { createClient } from "@/lib/supabase/server";

type StudioRootLayoutProps = {
  children: ReactNode;
};

export default async function StudioRootLayout({
  children,
}: StudioRootLayoutProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /* =========================================================
     NOT SIGNED IN
     ========================================================= */

  if (!user) {
    redirect(
      `/sign-in?message=${encodeURIComponent(
        "Please sign in to access WonderfulLife Studio."
      )}`
    );
  }

  /* =========================================================
     ADMIN AUTHORIZATION
     ========================================================= */

  const allowedEmails = (
    process.env.STUDIO_ADMIN_EMAILS || ""
  )
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = user.email?.toLowerCase() || "";

  if (!allowedEmails.includes(userEmail)) {
    redirect("/");
  }

  /* =========================================================
     AUTHORIZED STUDIO USER
     ========================================================= */

  return <StudioLayout>{children}</StudioLayout>;
}