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

  const { data, error } =
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

  if (!data.session || !data.user) {
    redirect(
      `/sign-in?message=${encodeURIComponent(
        "Sign in succeeded but no session was created."
      )}`
    );
  }

  redirect("/");
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
   REQUEST PASSWORD RESET
   ========================================================= */

export async function requestPasswordResetAction(
  formData: FormData
) {
  const supabase = await createClient();

  const email = String(
    formData.get("email") || ""
  ).trim();

  if (!email) {
    redirect(
      `/forgot-password?message=${encodeURIComponent(
        "Please enter your email address."
      )}`
    );
  }

  const redirectUrl =
    process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`
      : "http://localhost:3000/reset-password";

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: redirectUrl,
      }
    );

  if (error) {
    redirect(
      `/forgot-password?message=${encodeURIComponent(
        error.message
      )}`
    );
  }

  redirect(
    `/forgot-password?message=${encodeURIComponent(
      "If an account exists for that email, a password reset link has been sent."
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