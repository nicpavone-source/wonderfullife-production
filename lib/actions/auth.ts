"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/* =========================================================
   SIGN IN
   ========================================================= */

export async function signInAction(formData: FormData) {
  const supabase = await createClient();

  const email = String(
    formData.get("email") || ""
  ).trim();

  const password = String(
    formData.get("password") || ""
  );

  if (!email || !password) {
    redirect(
      `/sign-in?message=${encodeURIComponent(
        "Please enter your email and password."
      )}`
    );
  }

  const { error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    redirect(
      `/sign-in?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect("/dashboard");
}

/* =========================================================
   SIGN UP
   ========================================================= */

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();

  const displayName = String(
    formData.get("display_name") ||
      "WonderfulLife Member"
  ).trim();

  const email = String(
    formData.get("email") || ""
  ).trim();

  const password = String(
    formData.get("password") || ""
  );

  if (!displayName || !email || !password) {
    redirect(
      `/sign-up?message=${encodeURIComponent(
        "Please complete all required fields."
      )}`
    );
  }

  const { error } =
    await supabase.auth.signUp({
      email,
      password,

      options: {
        data: {
          display_name: displayName,
        },
      },
    });

  if (error) {
    redirect(
      `/sign-up?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/sign-in?message=${encodeURIComponent(
      "Account created. Please sign in."
    )}`
  );
}

/* =========================================================
   SIGN OUT
   ========================================================= */

export async function signOutAction() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/");
}