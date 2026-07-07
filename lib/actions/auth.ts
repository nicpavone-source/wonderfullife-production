"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")),
    password: String(formData.get("password"))
  });

  if (error) redirect(`/sign-in?message=${encodeURIComponent(error.message)}`);
  redirect("/dashboard");
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: String(formData.get("email")),
    password: String(formData.get("password")),
    options: { data: { display_name: String(formData.get("display_name") || "WonderfulLife Member") } }
  });

  if (error) redirect(`/sign-up?message=${encodeURIComponent(error.message)}`);
  redirect("/sign-in?message=Check your email, then sign in.");
}
